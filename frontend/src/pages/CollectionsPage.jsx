import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Sparkles,
  User,
  Film,
  Calendar,
  ChevronRight,
  Loader2,
  Trash2,
} from 'lucide-react';
import { listApi } from '../api/lists';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AnimeImage } from '../components/AnimeImage';
import { CreateListModal } from '../components/CreateListModal';
import { EmptyState } from '../components/EmptyState';

export const CollectionsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [loadingSelectedList, setLoadingSelectedList] = useState(false);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listApi.getPublicLists({ search: searchTerm });
      if (res.success && res.data?.lists) {
        setLists(res.data.lists);
      }
    } catch (err) {
      console.error('Failed to load lists:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleOpenListDetails = async (listId) => {
    setLoadingSelectedList(true);
    try {
      const res = await listApi.getListById(listId);
      if (res.success && res.data?.list) {
        setSelectedList(res.data.list);
      }
    } catch (err) {
      toast.error('Failed to load collection details');
    } finally {
      setLoadingSelectedList(false);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;

    try {
      const res = await listApi.deleteList(listId);
      if (res.success) {
        toast.info('Collection deleted');
        setSelectedList(null);
        fetchLists();
      }
    } catch (err) {
      toast.error('Failed to delete collection');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zenkai-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Community Stacks & Curations</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Curated Anime Collections
          </h1>
          <p className="text-xs sm:text-sm text-zenkai-muted mt-1">
            Discover themed stacks, rankings, and personal watchlists curated by the Zenkai community.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Collection</span>
          </button>
        )}
      </div>

      {/* 2. Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zenkai-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search collections by title or theme..."
          className="w-full bg-zenkai-surface/60 border border-zenkai-border rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* 3. Collections Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-zenkai-surface/60 rounded-3xl" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <EmptyState
          title="No collections created yet"
          description="Be the first to curate a custom anime stack and share it with the community!"
          actionLabel="Create First Collection"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => {
            const previews = list.previewAnime || [];
            return (
              <div
                key={list.id}
                onClick={() => handleOpenListDetails(list.id)}
                className="group relative bg-zenkai-surface/60 hover:bg-zenkai-elevated/90 border border-zenkai-border/80 hover:border-indigo-500/40 rounded-3xl p-5 space-y-4 transition-all duration-300 shadow-zenkai-subtle cursor-pointer flex flex-col justify-between"
              >
                {/* 4-Poster Collage Preview */}
                <div className="grid grid-cols-4 gap-1.5 aspect-[16/7] rounded-2xl overflow-hidden bg-zenkai-card p-1 border border-zenkai-border/50">
                  {previews.map((a, idx) => (
                    <div key={a.id || idx} className="relative w-full h-full overflow-hidden rounded-lg">
                      <AnimeImage
                        src={a.coverImage}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 4 - previews.length) }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="w-full h-full bg-zenkai-elevated/50 rounded-lg flex items-center justify-center text-zenkai-dim"
                    >
                      <Film className="w-4 h-4 opacity-30" />
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-600/15 px-2 py-0.5 rounded-md">
                      {list.totalItems} {list.totalItems === 1 ? 'Anime' : 'Anime'}
                    </span>
                    <span className="text-[10px] text-zenkai-dim font-mono">
                      {new Date(list.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {list.title}
                  </h3>

                  {list.description && (
                    <p className="text-xs text-zenkai-muted line-clamp-2 leading-relaxed">
                      {list.description}
                    </p>
                  )}
                </div>

                {/* Author Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-zenkai-border/50">
                  <div className="flex items-center gap-2">
                    <img
                      src={list.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${list.user?.username}`}
                      alt={list.user?.username}
                      className="w-5 h-5 rounded-full bg-indigo-900/40 object-cover"
                    />
                    <span className="text-xs font-semibold text-zenkai-text">
                      {list.user?.displayName || list.user?.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span>View Stack</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Collection Details Modal */}
      {selectedList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-zenkai-card border border-zenkai-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zenkai-border gap-4">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
                  <Layers className="w-4 h-4" />
                  <span>Curated Collection ({selectedList.totalItems} titles)</span>
                </div>
                <h2 className="font-display font-black text-xl sm:text-2xl text-white">
                  {selectedList.title}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-zenkai-muted">
                  <img
                    src={selectedList.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedList.user?.username}`}
                    alt={selectedList.user?.username}
                    className="w-4 h-4 rounded-full bg-indigo-900/40"
                  />
                  <span>Curated by <strong className="text-white">{selectedList.user?.displayName || selectedList.user?.username}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {user?.id === selectedList.user?.id && (
                  <button
                    onClick={() => handleDeleteList(selectedList.id)}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/20 transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedList(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-zenkai-muted hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {selectedList.description && (
              <p className="text-xs sm:text-sm text-zenkai-text/90 leading-relaxed bg-zenkai-surface/60 p-4 rounded-2xl border border-zenkai-border">
                {selectedList.description}
              </p>
            )}

            {/* Anime Entries List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Anime in this Stack ({selectedList.entries?.length || 0})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(selectedList.entries || []).map((entry, idx) => {
                  const a = entry.anime;
                  if (!a) return null;
                  return (
                    <Link
                      key={entry.id}
                      to={`/anime/${a.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-2xl bg-zenkai-surface/60 hover:bg-zenkai-elevated border border-zenkai-border transition-all group"
                    >
                      <span className="w-5 text-center font-mono font-bold text-xs text-indigo-400">
                        #{idx + 1}
                      </span>
                      <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden shrink-0 bg-zenkai-card">
                        <AnimeImage src={a.coverImage} alt={a.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 truncate">
                          {a.title}
                        </p>
                        <p className="text-[11px] text-zenkai-muted font-mono mt-0.5">
                          {a.type || 'TV'} {a.score ? `• ★ ${a.score}` : ''}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateListModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onListCreated={fetchLists}
      />
    </div>
  );
};
