import React, { useState, useRef, useMemo } from 'react';
import {
  Shield,
  Sparkles,
  Trophy,
  Zap,
  Flame,
  Award,
  Share2,
  Check,
  QrCode,
  X,
  Crown,
  Film,
  Calendar,
} from 'lucide-react';
import { calculateXP } from '../utils/xpCalculator';
import { useToast } from '../context/ToastContext';

export const OtakuPassport = ({ user, stats, library = [], topFavorites = [] }) => {
  const toast = useToast();
  const cardRef = useRef(null);

  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Calculate real gamified metrics
  const xpData = useMemo(() => calculateXP(stats, library), [stats, library]);

  // Mouse tilt math
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, glareX, glareY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleShare = () => {
    const shareText = `🪪 Zenkai Otaku Passport\n👑 @${user?.username || 'Otaku'} | Lv.${xpData.currentLevel} ${xpData.rankTier}\n⚡ ${xpData.totalXP.toLocaleString()} Total XP • ${xpData.completedCount} Anime Completed\nView on https://zenkai.vercel.app/profile`;
    navigator.clipboard?.writeText(shareText);
    setCopied(true);
    toast.success('Passport shared to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : '2026 Season 1';

  return (
    <div className="relative group perspective-1000 my-4">
      {/* 3D Tilting Card Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        }}
        className={`relative w-full rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-zenkai-card via-zenkai-surface to-zenkai-elevated border ${xpData.rankBorder} shadow-2xl overflow-hidden backdrop-blur-xl transform-gpu`}
      >
        {/* Dynamic Holographic Foil Sheen Glare */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-3xl mix-blend-color-dodge z-10"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.8) 0%, rgba(139, 92, 246, 0.4) 25%, rgba(6, 182, 212, 0.3) 50%, transparent 75%)`,
          }}
        />

        {/* Cyberpunk Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* Card Header: Passport Stamp & Hologram Icon */}
        <div className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            {/* Avatar with Glow Aura */}
            <div className="relative">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg"
                style={{ boxShadow: `0 0 24px ${xpData.rankGlow}` }}
              >
                <div className="w-full h-full rounded-2xl bg-zenkai-card flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                      {user?.username?.charAt(0)?.toUpperCase() || '全'}
                    </span>
                  )}
                </div>
              </div>

              {/* Level Pill */}
              <div className="absolute -bottom-2 -right-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-[10px] font-mono shadow-md border border-amber-300">
                Lv.{xpData.currentLevel}
              </div>
            </div>

            {/* Name & Official Title */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
                  {user?.displayName || user?.username || 'Otaku Vanguard'}
                </h3>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs font-mono font-semibold text-zenkai-muted mt-0.5 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{xpData.title}</span>
                <span className="opacity-40">•</span>
                <span className="text-zenkai-dim">Joined {joinDate}</span>
              </p>
            </div>
          </div>

          {/* Rank Badge Stamp */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-right">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zenkai-dim block">
                Zenkai Rank Tier
              </span>
              <span
                className={`text-xs sm:text-sm font-black font-display text-transparent bg-clip-text bg-gradient-to-r ${xpData.rankColor}`}
              >
                {xpData.rankTier}
              </span>
            </div>
          </div>
        </div>

        {/* Card Body: Real Player XP Bar & Metrics */}
        <div className="relative z-20 py-5 space-y-4">
          {/* XP Progression Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-white flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>EXP Progress</span>
              </span>
              <span className="text-zenkai-muted">
                <strong className="text-cyan-400">{xpData.levelXPProgress.toLocaleString()}</strong> /{' '}
                {xpData.levelXPRequired.toLocaleString()} XP ({xpData.progressPct}%)
              </span>
            </div>

            {/* Gradient Track */}
            <div className="h-3 bg-zenkai-surface rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${xpData.progressPct}%` }}
              />
            </div>
          </div>

          {/* Quick Real Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 rounded-2xl bg-zenkai-surface/60 border border-white/5">
              <span className="text-[10px] font-mono text-zenkai-dim uppercase block">Total EXP</span>
              <span className="font-display font-black text-sm sm:text-base text-white">
                {xpData.totalXP.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-zenkai-surface/60 border border-white/5">
              <span className="text-[10px] font-mono text-zenkai-dim uppercase block">Episodes Logged</span>
              <span className="font-display font-black text-sm sm:text-base text-cyan-400">
                {xpData.totalEpisodes.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-zenkai-surface/60 border border-white/5">
              <span className="text-[10px] font-mono text-zenkai-dim uppercase block">Mastered Series</span>
              <span className="font-display font-black text-sm sm:text-base text-emerald-400">
                {xpData.completedCount} Complete
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-zenkai-surface/60 border border-white/5">
              <span className="text-[10px] font-mono text-zenkai-dim uppercase block">Pass Serial</span>
              <span className="font-mono text-xs font-bold text-amber-400 truncate block">
                #ZK-{user?.id?.slice(-6)?.toUpperCase() || '778921'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer: Action Shortcuts & QR Code Trigger */}
        <div className="relative z-20 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono text-zenkai-muted">
              Verified Otaku Identity Protocol
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zenkai-muted hover:text-white border border-white/10 text-xs font-semibold transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Badge</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all btn-press"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share Passport'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Popout Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs bg-zenkai-card border border-zenkai-border rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-black text-sm text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Otaku Verification Badge</span>
              </h4>
              <button
                onClick={() => setShowQR(false)}
                className="p-1 text-zenkai-dim hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Styled QR Art Placeholder */}
            <div className="p-4 bg-white rounded-2xl shadow-inner max-w-[180px] mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  window.location.href
                )}&color=0f172a`}
                alt="Profile QR Code"
                className="w-full aspect-square object-contain"
              />
            </div>

            <p className="text-[11px] text-zenkai-muted font-mono">
              Scan with phone camera to instantly view @{user?.username}'s full anime credentials.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
