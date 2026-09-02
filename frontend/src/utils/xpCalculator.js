// Zenkai Gamified XP & Rank Progression Engine
// Calculates real player levels, rank badges, and XP thresholds

export const calculateXP = (stats = {}, library = []) => {
  const completedCount = stats.completedCount || library.filter((e) => e.status === 'COMPLETED').length || 0;
  const watchingCount = stats.watchingCount || library.filter((e) => e.status === 'WATCHING').length || 0;
  const totalEpisodes = stats.totalEpisodes || library.reduce((acc, curr) => acc + (curr.progress || 0), 0) || (completedCount * 12);
  const reviewsCount = stats.reviewsCount || 0;

  // XP Formula
  // 1 Episode = 15 XP
  // 1 Completed Series = 120 XP
  // 1 In-Progress Series = 30 XP
  // 1 Review Written = 75 XP
  const totalXP = (totalEpisodes * 15) + (completedCount * 120) + (watchingCount * 30) + (reviewsCount * 75);

  // Level Curve: XP needed for level L = 100 * L^1.35
  // Current Level = (totalXP / 100) ^ (1 / 1.35)
  const currentLevel = Math.max(1, Math.floor(Math.pow(totalXP / 100, 1 / 1.35)) + 1);

  // Current Level Base XP & Next Level XP
  const prevLevelXP = Math.floor(100 * Math.pow(Math.max(0, currentLevel - 1), 1.35));
  const nextLevelXP = Math.floor(100 * Math.pow(currentLevel, 1.35));
  const levelXPProgress = Math.max(0, totalXP - prevLevelXP);
  const levelXPRequired = Math.max(1, nextLevelXP - prevLevelXP);
  const progressPct = Math.min(100, Math.round((levelXPProgress / levelXPRequired) * 100));

  // Otaku Rank Titles & Auras
  let rankTier = 'E-Rank Initiate';
  let rankColor = 'from-zinc-400 to-slate-500';
  let rankBorder = 'border-slate-500/40';
  let rankGlow = 'rgba(148, 163, 184, 0.2)';
  let title = 'Rookie Adventurer';

  if (currentLevel >= 50 || totalXP >= 25000) {
    rankTier = 'SSS-Rank Transcendent Sovereign';
    rankColor = 'from-amber-300 via-rose-500 to-purple-600';
    rankBorder = 'border-amber-400/80 ring-2 ring-amber-400/40';
    rankGlow = 'rgba(251, 191, 36, 0.45)';
    title = 'Multiverse Grandmaster';
  } else if (currentLevel >= 35 || totalXP >= 12000) {
    rankTier = 'SS-Rank Special Grade Sorcerer';
    rankColor = 'from-purple-400 via-indigo-500 to-cyan-400';
    rankBorder = 'border-purple-500/60 ring-1 ring-purple-500/30';
    rankGlow = 'rgba(168, 85, 247, 0.35)';
    title = 'Apex Connoisseur';
  } else if (currentLevel >= 20 || totalXP >= 5000) {
    rankTier = 'S-Rank Hashira Vanguard';
    rankColor = 'from-indigo-400 to-cyan-400';
    rankBorder = 'border-indigo-500/50';
    rankGlow = 'rgba(99, 102, 241, 0.3)';
    title = 'Seasonal Veteran';
  } else if (currentLevel >= 10 || totalXP >= 2000) {
    rankTier = 'A-Rank Elite Hunter';
    rankColor = 'from-cyan-400 to-emerald-400';
    rankBorder = 'border-cyan-500/40';
    rankGlow = 'rgba(6, 182, 212, 0.25)';
    title = 'Rising Champion';
  } else if (currentLevel >= 5 || totalXP >= 600) {
    rankTier = 'B-Rank Chunin Scout';
    rankColor = 'from-emerald-400 to-teal-500';
    rankBorder = 'border-emerald-500/40';
    rankGlow = 'rgba(16, 185, 129, 0.25)';
    title = 'Devoted Binger';
  }

  return {
    totalXP,
    currentLevel,
    levelXPProgress,
    levelXPRequired,
    progressPct,
    rankTier,
    rankColor,
    rankBorder,
    rankGlow,
    title,
    totalEpisodes,
    completedCount,
  };
};
