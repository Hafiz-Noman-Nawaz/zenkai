import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { userAnimeApi } from '../api/userAnime';
import { animeApi } from '../api/anime';
import { useToast } from '../context/ToastContext';

export const ImportModal = ({ isOpen, onClose, onImportCompleted }) => {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, successes: 0, errors: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [logMessages, setLogMessages] = useState([]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setIsCompleted(false);
      setProgress({ current: 0, total: 0, successes: 0, errors: 0 });
      setLogMessages([]);
    }
  };

  const mapMalStatus = (statusStr) => {
    switch (statusStr) {
      case '1':
      case 'Watching':
        return 'WATCHING';
      case '2':
      case 'Completed':
        return 'COMPLETED';
      case '3':
      case 'On-Hold':
      case 'On Hold':
        return 'ON_HOLD';
      case '4':
      case 'Dropped':
        return 'DROPPED';
      case '6':
      case 'Plan to Watch':
      default:
        return 'PLAN_TO_WATCH';
    }
  };

  const parseMALXml = (xmlText) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const animeNodes = xmlDoc.getElementsByTagName('anime');
    const entries = [];

    for (let i = 0; i < animeNodes.length; i++) {
      const node = animeNodes[i];
      const malId = node.getElementsByTagName('series_animedb_id')[0]?.textContent;
      const title = node.getElementsByTagName('series_title')[0]?.textContent || '';
      const statusNum = node.getElementsByTagName('my_status')[0]?.textContent || '6';
      const score = parseFloat(node.getElementsByTagName('my_score')[0]?.textContent || '0');
      const progress = parseInt(node.getElementsByTagName('my_watched_episodes')[0]?.textContent || '0', 10);
      const comments = node.getElementsByTagName('my_comments')[0]?.textContent || '';

      if (title) {
        entries.push({
          externalId: malId ? parseInt(malId, 10) : null,
          title,
          status: mapMalStatus(statusNum),
          score: score > 0 ? score : null,
          progress,
          notes: comments,
        });
      }
    }

    return entries;
  };

  const parseAniListJson = (jsonText) => {
    const data = JSON.parse(jsonText);
    const entries = [];

    // Check if it's AniList export schema
    const lists = data?.data?.MediaListCollection?.lists || data?.lists || [];
    lists.forEach((group) => {
      (group.entries || []).forEach((item) => {
        const title = item.media?.title?.romaji || item.media?.title?.english || item.media?.title?.userPreferred;
        if (title) {
          entries.push({
            externalId: item.media?.id || null,
            title,
            status: item.status || 'PLAN_TO_WATCH',
            score: item.score ? parseFloat(item.score) : null,
            progress: item.progress || 0,
            notes: item.notes || '',
          });
        }
      });
    });

    return entries;
  };

  const startImport = async () => {
    if (!file) return;

    setImporting(true);
    setIsCompleted(false);
    setLogMessages(['Reading export file...']);

    try {
      const text = await file.text();
      let entries = [];

      if (file.name.endsWith('.xml') || text.includes('<?xml') || text.includes('<myanimelist>')) {
        entries = parseMALXml(text);
      } else if (file.name.endsWith('.json') || text.trim().startsWith('{')) {
        entries = parseAniListJson(text);
      } else {
        throw new Error('Unrecognized file format. Please upload a MAL .xml or AniList .json file.');
      }

      if (entries.length === 0) {
        throw new Error('No valid anime entries were found in the uploaded file.');
      }

      setProgress({ current: 0, total: entries.length, successes: 0, errors: 0 });
      setLogMessages((prev) => [...prev, `Found ${entries.length} anime entries to import.`]);

      let successes = 0;
      let errors = 0;

      for (let i = 0; i < entries.length; i++) {
        const item = entries[i];
        try {
          // 1. Search anime by title or externalId
          const searchRes = await animeApi.searchAnime(item.title, 3);
          const foundList = searchRes.data?.anime || searchRes.data?.animes || [];

          let matchedAnime = null;
          if (foundList.length > 0) {
            matchedAnime = foundList[0];
          }

          if (matchedAnime) {
            // 2. Upsert userAnime
            await userAnimeApi.addOrUpdateAnime({
              animeId: matchedAnime.id,
              status: item.status,
              progress: item.progress,
              score: item.score,
              notes: item.notes,
            });
            successes++;
          } else {
            errors++;
          }
        } catch (err) {
          errors++;
        }

        setProgress({
          current: i + 1,
          total: entries.length,
          successes,
          errors,
        });

        // Small delay to prevent network flood
        if (i % 5 === 0) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }

      setIsCompleted(true);
      toast.success(`Successfully imported ${successes} anime into your Zenkai library!`);
      if (onImportCompleted) {
        onImportCompleted();
      }
    } catch (err) {
      toast.error(err.message || 'Import failed');
      setLogMessages((prev) => [...prev, `Error: ${err.message}`]);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-zenkai-card border border-zenkai-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zenkai-border">
          <div className="flex items-center gap-2 text-white font-display font-black text-lg">
            <Upload className="w-5 h-5 text-indigo-400" />
            <span>Import Anime Library</span>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className="p-1.5 rounded-xl hover:bg-white/10 text-zenkai-muted hover:text-white transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-zenkai-muted space-y-2 bg-zenkai-surface/60 p-4 rounded-2xl border border-zenkai-border">
          <p className="font-semibold text-white">Import from MyAnimeList or AniList in 1 click:</p>
          <ul className="list-disc list-inside space-y-1 text-zenkai-dim">
            <li><strong className="text-zenkai-muted">MyAnimeList</strong>: Go to MAL Settings → Export Anime List (download the <code className="text-indigo-300">.xml.gz</code>, extract <code className="text-indigo-300">.xml</code>).</li>
            <li><strong className="text-zenkai-muted">AniList</strong>: Go to AniList Settings → Data Export (download <code className="text-indigo-300">.json</code>).</li>
          </ul>
        </div>

        {/* Upload Dropzone */}
        {!importing && !isCompleted && (
          <label className="border-2 border-dashed border-zenkai-border hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-zenkai-surface/30 hover:bg-zenkai-surface/60 transition-all text-center">
            <input
              type="file"
              accept=".xml,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                {file ? file.name : 'Click to browse or drop .xml / .json file'}
              </p>
              <p className="text-[11px] text-zenkai-dim mt-0.5">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports MyAnimeList XML and AniList JSON'}
              </p>
            </div>
          </label>
        )}

        {/* Progress Display */}
        {(importing || isCompleted) && (
          <div className="space-y-3 bg-zenkai-surface/60 p-4 rounded-2xl border border-zenkai-border">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white flex items-center gap-1.5">
                {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {importing ? 'Importing Anime...' : 'Import Complete!'}
              </span>
              <span className="font-mono text-indigo-300">
                {progress.current} / {progress.total}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2.5 bg-zenkai-card rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-200"
                style={{
                  width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zenkai-dim pt-1">
              <span className="text-emerald-400">✓ {progress.successes} Imported</span>
              <span className="text-zenkai-dim">✗ {progress.errors} Skipped</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={importing}
            className="px-5 py-2 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border text-xs font-semibold text-zenkai-muted hover:text-white transition-colors disabled:opacity-30"
          >
            {isCompleted ? 'Close' : 'Cancel'}
          </button>
          {!isCompleted && (
            <button
              onClick={startImport}
              disabled={!file || importing}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-40 cursor-pointer"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Import</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
