import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Timer, Zap, RotateCcw, MousePointer2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type GameState = 'Waiting' | 'Ready' | 'Active' | 'Result' | 'Cheated';

export default function ReactionTimer() {
  const [state, setState] = useState<GameState>('Waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [averageTime, setAverageTime] = useState<number | null>(null);
  const [allTimes, setAllTimes] = useState<number[]>([]);

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('player_name') || '');
  const [registeredUser, setRegisteredUser] = useState(() => localStorage.getItem('registered_username') || '');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedBest = localStorage.getItem('best_reaction');
    if (savedBest) setBestTime(parseInt(savedBest));

    const handleStorage = () => {
      setRegisteredUser(localStorage.getItem('registered_username') || '');
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = registeredUser || playerName.trim();
    if (!reactionTime || !finalName) return;
    setSubmitting(true);
    if (!registeredUser) {
      localStorage.setItem('player_name', finalName);
    }

    fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: finalName,
        game: 'Reaction Timer',
        score: `${reactionTime}ms`,
        value: reactionTime
      })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        setSubmitted(true);
      })
      .catch(() => alert('Failed to submit score'))
      .finally(() => setSubmitting(false));
  };

  const startGame = () => {
    setState('Ready');
    setSubmitted(false);
    fetch('/api/stats/increment', { method: 'POST' }).catch(err => console.error(err));
    const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
    timerRef.current = setTimeout(() => {
      setState('Active');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (state === 'Ready') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setState('Cheated');
      return;
    }

    if (state === 'Active') {
      const endTime = Date.now();
      const time = endTime - startTime;
      setReactionTime(time);
      setState('Result');
      setAttempts(a => a + 1);
      
      const newTimes = [...allTimes, time];
      setAllTimes(newTimes);
      const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
      setAverageTime(avg);

      if (!bestTime || time < bestTime) {
        setBestTime(time);
        localStorage.setItem('best_reaction', time.toString());
      }
    }
  };

  const resetGame = () => {
    setState('Waiting');
    setReactionTime(null);
  };

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/reaction-bg.png" 
          alt="Reaction Timer Background" 
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#05050C]/60 via-[#05050C]/40 to-[#05050C]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 border-slate-700/50 overflow-hidden relative h-[600px] flex flex-col"
      >
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Reaction Timer</h1>
              <p className="text-slate-400 text-sm">Click as fast as you can when the color changes</p>
            </div>
          </div>
          <Link
            to="/games"
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-brand-accent/10 text-slate-400 hover:text-brand-accent text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-brand-accent/30 transition-all flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Quit Game
          </Link>
        </div>

        <div className="flex-1 flex flex-col">
          <motion.div
            onClick={state === 'Waiting' ? startGame : handleClick}
            className={cn(
              "flex-1 rounded-2xl cursor-pointer flex flex-col items-center justify-center transition-colors duration-200 border-4",
              state === 'Waiting' ? "bg-slate-900 border-slate-800 hover:bg-slate-800" :
              state === 'Ready' ? "bg-brand-primary border-rose-400 shadow-2xl shadow-brand-primary/20" :
              state === 'Active' ? "bg-brand-accent border-rose-400 shadow-2xl shadow-brand-accent/40" :
              state === 'Cheated' ? "bg-slate-950 border-slate-800" :
              "bg-slate-900 border-brand-primary shadow-2xl shadow-brand-primary/20"
            )}
          >
            <AnimatePresence mode="wait">
              {state === 'Waiting' && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <MousePointer2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Ready?</h2>
                  <p className="text-slate-500">Click anywhere to start the timer</p>
                </motion.div>
              )}

              {state === 'Ready' && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <h2 className="text-4xl font-display font-black text-white mb-2 italic">WAIT...</h2>
                  <p className="text-rose-100/60 font-bold uppercase tracking-widest">Wait for Green</p>
                </motion.div>
              )}

              {state === 'Active' && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <h2 className="text-6xl font-display font-black text-white italic drop-shadow-lg">CLICK!</h2>
                </motion.div>
              )}

              {state === 'Cheated' && (
                <motion.div
                  key="cheated"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-rose-500 mb-2">TOO EARLY!</h2>
                  <p className="text-slate-500 mb-6">You clicked before the color changed.</p>
                  <button onClick={resetGame} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all">
                    Try Again
                  </button>
                </motion.div>
              )}

               {state === 'Result' && (
                 <motion.div
                   key="result"
                   initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                   className="text-center max-w-sm mx-auto px-4"
                 >
                   <Zap className="w-16 h-16 text-brand-accent mx-auto mb-4" />
                   <div className="text-sm font-bold uppercase tracking-widest text-brand-primary mb-1">Your Time</div>
                   <h2 className="text-6xl font-display font-black mb-6">{reactionTime}ms</h2>
                   
                   {!submitted ? (
                      <form onSubmit={handleScoreSubmit} className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Submit to Leaderboard</div>
                        {registeredUser ? (
                          <div className="flex flex-col gap-2">
                            <p className="text-slate-300 text-xs font-medium">
                              Logged in as <span className="text-amber-400 font-mono font-bold">{registeredUser}</span>
                            </p>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="w-full py-2 bg-brand-accent hover:bg-brand-primary text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {submitting ? 'Submitting...' : 'Submit Score'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                required
                                placeholder="Your name"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-800 focus:border-brand-primary rounded-xl px-3 py-2 text-sm text-white font-medium outline-none"
                              />
                              <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-brand-accent hover:bg-brand-primary text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
                              >
                                {submitting ? '...' : 'Submit'}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              Tip: Register a profile in the header to lock in your username!
                            </p>
                          </div>
                        )}
                      </form>
                    ) : (
                      <div className="mb-6 py-2 px-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold rounded-xl text-xs uppercase tracking-widest animate-pulse">
                        Score Submitted!
                      </div>
                    )}

                   <button onClick={startGame} className="px-10 py-3 bg-brand-primary hover:bg-brand-accent rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/30 text-sm uppercase tracking-wider">
                     Play Again
                   </button>
                 </motion.div>
               )}
            </AnimatePresence>
          </motion.div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="glass-card bg-white/5 p-4 rounded-2xl border-none">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Personal Best</div>
              <div className="text-2xl font-display font-bold text-brand-accent">{bestTime ? `${bestTime}ms` : '--'}</div>
            </div>
            <div className="glass-card bg-white/5 p-4 rounded-2xl border-none">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Average</div>
              <div className="text-2xl font-display font-bold text-brand-primary">{averageTime ? `${averageTime}ms` : '--'}</div>
            </div>
            <div className="glass-card bg-white/5 p-4 rounded-2xl border-none">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Attempts</div>
              <div className="text-2xl font-display font-bold text-brand-secondary">{attempts}</div>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
