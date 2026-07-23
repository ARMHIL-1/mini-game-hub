import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, Hash, X, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ScoreEntry {
  name: string;
  game: string;
  score: string;
  value: number;
  difficulty?: string;
  date: string;
}

type GameType = 'Reaction Timer' | 'Number Guess' | 'Tic Tac Toe';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<GameType>('Reaction Timer');
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/leaderboard?game=${encodeURIComponent(activeTab)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch leaderboard data');
        return res.json();
      })
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Something went wrong');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchScores();
  }, [activeTab]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  const tabs: { name: GameType; label: string; color: string }[] = [
    { name: 'Reaction Timer', label: 'Reaction Timer', color: 'border-purple-500 text-purple-400' },
    { name: 'Number Guess', label: 'Number Guess', color: 'border-blue-500 text-blue-400' },
    { name: 'Tic Tac Toe', label: 'Tic Tac Toe', color: 'border-pink-500 text-pink-400' },
  ];

  return (
    <div className="relative min-h-screen pt-32 pb-24 px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/featured-bg.png" 
          alt="Leaderboard Background" 
          className="w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#05050C]/60 via-[#05050C]/40 to-[#05050C]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold">Hall of <span className="text-amber-500">Fame</span></h1>
              <p className="text-slate-400 text-sm">Real-time SQLite database leaderboards</p>
            </div>
          </div>
          <button
            onClick={fetchScores}
            disabled={loading}
            className="self-start sm:self-center px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        {/* Game Tabs */}
        <div className="flex border-b border-slate-800 mb-8 overflow-x-auto gap-2 pb-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all uppercase whitespace-nowrap border-b-2 ${
                activeTab === tab.name
                  ? `bg-white/5 border-amber-500 text-amber-400`
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.name === 'Reaction Timer' && <Zap className="w-4 h-4" />}
                {tab.name === 'Number Guess' && <Hash className="w-4 h-4" />}
                {tab.name === 'Tic Tac Toe' && <X className="w-4 h-4" />}
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Leaderboard content */}
        <div className="glass-card rounded-[32px] border-slate-800/50 p-6 sm:p-8 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center py-20"
              >
                <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">Loading scores...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-20"
              >
                <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Failed to Load Scores</h3>
                <p className="text-slate-400 text-sm max-w-sm mb-6">{error}</p>
                <button
                  onClick={fetchScores}
                  className="px-6 py-3 bg-brand-primary hover:bg-brand-accent text-white font-bold rounded-xl text-sm transition-all"
                >
                  Try Again
                </button>
              </motion.div>
            ) : entries.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-20"
              >
                <Trophy className="w-16 h-16 text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Records Yet</h3>
                <p className="text-slate-400 text-sm max-w-sm mb-6">
                  Be the first one to claim glory! Play {activeTab} and submit your score.
                </p>
                <Link
                  to={
                    activeTab === 'Reaction Timer' ? '/games/reaction-timer' :
                    activeTab === 'Number Guess' ? '/games/number-guess' :
                    '/games/tic-tac-toe'
                  }
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm tracking-wider uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.3)]"
                >
                  Play Game
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <th className="pb-4 pl-4 w-16">Rank</th>
                      <th className="pb-4">Player</th>
                      <th className="pb-4">Score</th>
                      {activeTab === 'Number Guess' && <th className="pb-4">Difficulty</th>}
                      <th className="pb-4 pr-4 text-right">Date Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-sm">
                    {entries.map((entry, index) => {
                      const isTopThree = index < 3;
                      const rankColors = [
                        'bg-amber-500/20 text-amber-400 border-amber-500/40', // 1st Gold
                        'bg-slate-300/20 text-slate-300 border-slate-300/40', // 2nd Silver
                        'bg-amber-700/25 text-amber-600 border-amber-700/40', // 3rd Bronze
                      ];
                      
                      return (
                        <tr key={index} className="hover:bg-white/5 transition-colors group">
                          <td className="py-4 pl-4 font-bold">
                            {isTopThree ? (
                              <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center border font-display text-xs ${rankColors[index]}`}>
                                {index + 1}
                              </span>
                            ) : (
                              <span className="text-slate-500 pl-2">{index + 1}</span>
                            )}
                          </td>
                          <td className="py-4 font-semibold text-white group-hover:text-amber-400 transition-colors">
                            {entry.name}
                          </td>
                          <td className="py-4 font-mono font-bold text-slate-300">
                            {entry.score}
                          </td>
                          {activeTab === 'Number Guess' && (
                            <td className="py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                                entry.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                entry.difficulty === 'Medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                {entry.difficulty || 'Medium'}
                              </span>
                            </td>
                          )}
                          <td className="py-4 pr-4 text-right text-slate-400 text-xs font-mono">
                            {formatDate(entry.date)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
