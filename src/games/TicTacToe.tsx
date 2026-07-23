import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { X, Circle, RotateCcw, Trophy, User, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type Player = 'X' | 'O';
type Cell = Player | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Cell | 'Draw'>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const [playerName, setPlayerName] = useState(() => localStorage.getItem('player_name') || '');
  const [registeredUser, setRegisteredUser] = useState(() => localStorage.getItem('registered_username') || '');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winner || winner === 'Draw' || !playerName.trim()) return;
    setSubmitting(true);
    localStorage.setItem('player_name', playerName.trim());
    
    const winCount = scores[winner];

    fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: playerName.trim(),
        game: 'Tic Tac Toe',
        score: `${winCount} win${winCount > 1 ? 's' : ''}`,
        value: winCount
      })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        setSubmitted(true);
      })
      .catch(() => alert('Failed to submit score'))
      .finally(() => setSubmitting(false));
  };

  useEffect(() => {
    const savedScores = localStorage.getItem('ttt_scores');
    if (savedScores) setScores(JSON.parse(savedScores));

    const handleStorage = () => {
      const reg = localStorage.getItem('registered_username') || '';
      setRegisteredUser(reg);
      if (reg) {
        setPlayerName(reg);
      }
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1000);
    
    // Initial trigger
    handleStorage();

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);


  const calculateWinner = (squares: Cell[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diags
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }

    if (squares.every(s => s !== null)) {
      return { winner: 'Draw' as const, line: null };
    }

    return null;
  };

  const handleClick = (i: number) => {
    if (board[i] || winner) return;

    if (board.every(cell => cell === null)) {
      fetch('/api/stats/increment', { method: 'POST' }).catch(err => console.error(err));
    }

    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const result = calculateWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      if (result.winner !== 'Draw') {
        const newScores = {
          ...scores,
          [result.winner]: scores[result.winner as Player] + 1
        };
        setScores(newScores);
        localStorage.setItem('ttt_scores', JSON.stringify(newScores));
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    setSubmitted(false);
  };

  const renderCell = (i: number) => {
    const isWinningCell = winningLine?.includes(i);

    return (
      <motion.button
        key={i}
        whileHover={{ scale: board[i] ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleClick(i)}
        className={cn(
          "h-24 sm:h-32 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl transition-all border-2",
          board[i] ? "cursor-default" : "cursor-pointer hover:bg-white/5",
          isWinningCell ? "bg-brand-accent/20 border-brand-accent shadow-lg shadow-brand-accent/20" : "bg-slate-900 border-slate-800",
          board[i] === 'X' ? "text-brand-primary" : "text-brand-secondary"
        )}
      >
        <AnimatePresence mode="wait">
          {board[i] === 'X' && (
            <motion.div
              key="X"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative"
            >
              <X className="w-12 h-12 sm:w-16 sm:h-16 stroke-[3px]" />
            </motion.div>
          )}
          {board[i] === 'O' && (
            <motion.div
              key="O"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Circle className="w-10 h-10 sm:w-14 sm:h-14 stroke-[3px]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/tictactoe-bg.png" 
          alt="Tic Tac Toe Background" 
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#05050C]/60 via-[#05050C]/40 to-[#05050C]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-6 sm:p-10 border-slate-700/50"
      >
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
                  <X className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold">Tic Tac Toe</h1>
                  <p className="text-slate-400 text-sm">Classic 3x3 strategy</p>
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

            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-[400px] mx-auto md:mx-0">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderCell(i))}
            </div>
          </div>

          <div className="w-full md:w-72 flex flex-col gap-6">
            <div className="glass-card bg-white/5 p-6 rounded-2xl border-none space-y-6">
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Scoreboard
              </h3>
              
              <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                    <X className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Player X</div>
                    <div className="text-xl font-bold">{scores.X}</div>
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-800" />
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Player O</div>
                    <div className="text-xl font-bold">{scores.O}</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-brand-secondary/20 flex items-center justify-center text-brand-secondary">
                    <Circle className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="text-center mb-4">
                  {!winner ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-slate-400 text-sm">Current Turn:</span>
                      <span className={cn(
                        "font-bold px-3 py-1 rounded-lg text-sm",
                        isXNext ? "bg-brand-primary/10 text-brand-primary" : "bg-brand-secondary/10 text-brand-secondary"
                      )}>
                        Player {isXNext ? 'X' : 'O'}
                      </span>
                    </div>
                  ) : (
                    <div className="py-2">
                      {winner === 'Draw' ? (
                        <span className="text-amber-400 font-bold text-xl uppercase tracking-tighter italic">It's a Draw!</span>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                           <span className="text-brand-accent font-bold text-xl animate-pulse italic uppercase tracking-tighter text-center">Winner: Player {winner}!</span>
                           
                           {!submitted ? (
                             <form onSubmit={handleScoreSubmit} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
                               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Submit Player {winner}'s Win</div>
                               <div className="flex gap-2">
                                 <input
                                   type="text"
                                   required
                                   placeholder="Player name"
                                   value={playerName}
                                   onChange={(e) => setPlayerName(e.target.value)}
                                   className="flex-1 bg-slate-950 border border-slate-800 focus:border-brand-primary rounded-lg px-2 py-1 text-xs text-white font-medium outline-none w-full min-w-0"
                                 />
                                 <button
                                   type="submit"
                                   disabled={submitting}
                                   className="px-3 py-1 bg-brand-accent hover:bg-brand-primary text-white font-bold rounded-lg text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 shrink-0"
                                 >
                                   {submitting ? '...' : 'Submit'}
                                 </button>
                               </div>
                             </form>
                           ) : (
                             <div className="w-full py-1 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-lg text-[10px] uppercase tracking-widest text-center animate-pulse">
                               Win Submitted!
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={resetGame}
                  className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  Restart Game
                </button>
              </div>
            </div>

            <div className="glass-card bg-brand-primary/10 p-4 rounded-2xl border-brand-primary/20">
               <p className="text-xs text-brand-primary/80 leading-relaxed font-medium">
                  <strong>Pro Tip:</strong> Try to control the center square (index 4) for the best tactical advantage in Tic Tac Toe!
               </p>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
