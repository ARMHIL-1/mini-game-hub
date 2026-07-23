import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { RotateCcw, AlertCircle, ChevronRight, Hash, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

export default function NumberGuess() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Guess a number to start!');
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [history, setHistory] = useState<{ guess: number; feedback: string }[]>([]);

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('player_name') || '');
  const [registeredUser, setRegisteredUser] = useState(() => localStorage.getItem('registered_username') || '');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedBest = localStorage.getItem(`best_guess_${difficulty}`);
    if (savedBest) setBestScore(parseInt(savedBest));

    const handleStorage = () => {
      setRegisteredUser(localStorage.getItem('registered_username') || '');
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [difficulty]);

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = registeredUser || playerName.trim();
    if (attempts === 0 || !finalName) return;
    setSubmitting(true);
    if (!registeredUser) {
      localStorage.setItem('player_name', finalName);
    }

    fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: finalName,
        game: 'Number Guess',
        score: `${attempts} attempts`,
        value: attempts,
        difficulty: difficulty
      })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        setSubmitted(true);
      })
      .catch(() => alert('Failed to submit score'))
      .finally(() => setSubmitting(false));
  };

  const getRange = (d: Difficulty) => {
    if (d === 'Easy') return 50;
    if (d === 'Medium') return 100;
    return 500;
  };

  const startNewGame = (d: Difficulty = difficulty) => {
    const range = getRange(d);
    setTargetNumber(Math.floor(Math.random() * range) + 1);
    setAttempts(0);
    setGameOver(false);
    setSubmitted(false);
    fetch('/api/stats/increment', { method: 'POST' }).catch(err => console.error(err));
    setMessage(`Guess a number between 1 and ${range}`);
    setGuess('');
    setHistory([]);
    setDifficulty(d);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    startNewGame();
    const savedBest = localStorage.getItem(`best_guess_${difficulty}`);
    if (savedBest) setBestScore(parseInt(savedBest));
  }, [difficulty]);

  const handleGuess = (e?: React.FormEvent) => {
    e?.preventDefault();
    const num = parseInt(guess);
    if (isNaN(num) || num < 1 || num > getRange(difficulty)) {
      setMessage(`Please enter a valid number between 1 and ${getRange(difficulty)}`);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    let feedback = '';
    if (num === targetNumber) {
      setMessage('🎉 Correct! You won!');
      setGameOver(true);
      feedback = 'Correct';
      if (!bestScore || newAttempts < bestScore) {
        setBestScore(newAttempts);
        localStorage.setItem(`best_guess_${difficulty}`, newAttempts.toString());
      }
    } else if (num < targetNumber) {
      setMessage('📈 Higher!');
      feedback = 'Too Low';
    } else {
      setMessage('📉 Lower!');
      feedback = 'Too High';
    }

    setHistory([{ guess: num, feedback }, ...history]);
    setGuess('');
  };

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/number-bg.png" 
          alt="Number Guess Background" 
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#05050C]/60 via-[#05050C]/40 to-[#05050C]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-8 border-slate-700/50 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <Hash className="w-40 h-40" />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
                  <Hash className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold">Number Guess</h1>
                  <p className="text-slate-400 text-sm">Test your intuition and logic</p>
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

            <div className="flex gap-2 mb-8">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => startNewGame(d)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    difficulty === d
                      ? "bg-brand-primary text-white"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="mb-12">
              <div className={cn(
                "text-2xl font-display font-bold mb-6 text-center py-4 rounded-2xl bg-white/5 border border-white/5",
                gameOver ? "text-brand-accent animate-bounce" : "text-slate-200"
              )}>
                {message}
              </div>

              <form onSubmit={handleGuess} className="flex gap-3">
                <input
                  ref={inputRef}
                  type="number"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  disabled={gameOver}
                  placeholder="Enter your guess..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={gameOver || !guess}
                  className="bg-brand-primary hover:bg-brand-accent px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 group disabled:opacity-50"
                >
                  Guess
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card bg-white/5 p-4 rounded-2xl border-none">
                <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Current Attempts</div>
                <div className="text-3xl font-display font-bold text-brand-primary">{attempts}</div>
              </div>
              <div className="glass-card bg-white/5 p-4 rounded-2xl border-none">
                <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Best Score</div>
                <div className="text-3xl font-display font-bold text-brand-secondary">{bestScore || '-'}</div>
              </div>
            </div>

            {gameOver && (
              <div className="mt-6 flex flex-col gap-4">
                {!submitted ? (
                  <form onSubmit={handleScoreSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Submit to Leaderboard</div>
                    {registeredUser ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-slate-300 text-xs font-medium text-center">
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
                        <p className="text-[10px] text-slate-500 text-center">
                          Tip: Register a profile in the header to lock in your username!
                        </p>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="py-2 px-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl text-xs uppercase tracking-widest text-center animate-pulse">
                    Score Submitted!
                  </div>
                )}
                
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => startNewGame()}
                  className="w-full py-4 rounded-2xl bg-brand-primary hover:bg-brand-accent text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </motion.button>
              </div>
            )}
          </div>

          <div className="w-full md:w-64 flex flex-col">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> History
            </h3>
            <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {history.map((item, i) => (
                  <motion.div
                    key={history.length - i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "p-3 rounded-xl flex items-center justify-between border",
                      item.feedback === 'Correct' ? "bg-brand-accent/10 border-brand-accent/30 text-brand-accent" :
                      "bg-white/5 border-white/5 text-slate-300"
                    )}
                  >
                    <span className="font-bold text-lg">{item.guess}</span>
                    <span className="text-xs font-medium uppercase">{item.feedback}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {history.length === 0 && (
                <div className="text-center py-10 text-slate-600 italic text-sm">No guesses yet</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
