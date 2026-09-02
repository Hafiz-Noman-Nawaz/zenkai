import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Zap, ShieldCheck, Terminal, Compass, Layers } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 bg-[#050608]/90 backdrop-blur-2xl mt-32 overflow-hidden">
      {/* Background Japanese Watermark */}
      <div className="absolute -bottom-10 right-10 select-none pointer-events-none kanji-watermark text-[160px] font-black text-white/[0.025] leading-none z-0">
        全快
      </div>

      <div className="relative z-10 max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Col (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="font-display font-black text-white text-base">全</span>
              </div>
              <span className="font-display font-black tracking-widest text-lg text-white uppercase flex items-center gap-1.5">
                ZENKAI
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.5 rounded-md">
                  ULTRA
                </span>
              </span>
            </Link>

            <p className="text-xs text-zenkai-muted max-w-sm leading-relaxed">
              The premier cinematic anime discovery, catalog, and tracking sanctuary. Engineered with sub-2ms caching, real-time broadcast schedules, and personalized recommendation algorithms.
            </p>

            <div className="flex items-center gap-3 text-[11px] text-zenkai-dim pt-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ALL SYSTEMS OPERATIONAL
              </span>
              <span className="font-mono text-[11px] text-zenkai-dim">SUB-2MS LATENCY</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Discovery</span>
            </h4>
            <ul className="space-y-2 text-xs text-zenkai-muted font-medium">
              <li><Link to="/explore" className="hover:text-cyan-300 transition-colors">Master Catalog</Link></li>
              <li><Link to="/schedule" className="hover:text-cyan-300 transition-colors">Broadcast Schedule</Link></li>
              <li><Link to="/collections" className="hover:text-cyan-300 transition-colors">Curated Stacks</Link></li>
              <li><Link to="/random" className="hover:text-cyan-300 transition-colors">Gacha Roulette</Link></li>
            </ul>
          </div>

          {/* Otaku Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Personal Tools</span>
            </h4>
            <ul className="space-y-2 text-xs text-zenkai-muted font-medium">
              <li><Link to="/my-anime" className="hover:text-cyan-300 transition-colors">Tracking Library</Link></li>
              <li><Link to="/profile" className="hover:text-cyan-300 transition-colors">Taste & Pinboard</Link></li>
              <li><Link to="/reviews" className="hover:text-cyan-300 transition-colors">Critic Reviews</Link></li>
              <li><Link to="/my-anime" className="hover:text-cyan-300 transition-colors">MAL / AniList Import</Link></li>
            </ul>
          </div>

          {/* Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Technology</span>
            </h4>
            <div className="space-y-2 text-[11px] text-zenkai-muted font-mono">
              <p>PostgreSQL + Prisma</p>
              <p>Express + MemoryCache</p>
              <p>React + Tailwind Engine</p>
              <p>Web Audio API Synth</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zenkai-dim">
          <p>© {new Date().getFullYear()} ZENKAI PLATFORM. Built for high-tier anime connoisseurs.</p>
          <p className="flex items-center gap-1.5">
            Designed with <Sparkles className="w-3.5 h-3.5 text-amber-400" /> for supreme cinematic otaku culture.
          </p>
        </div>
      </div>
    </footer>
  );
};
