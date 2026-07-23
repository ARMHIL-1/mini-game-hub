import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, ArrowRight, Zap, Target, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import GameCard from '@/src/components/GameCard';
import { Game } from '@/src/types';

export default function Home() {
  const [stats, setStats] = useState<{ totalGamesPlayed: number; activeUsers: number; trendingGame: string } | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching stats:", err));
  }, []);
  const featuredGames: Game[] = [
    {
      id: 'number-guess',
      title: 'Number Guess',
      description: 'Test your intuition! Can you guess the secret number in the fewest attempts possible?',
      icon: 'Hash',
      path: '/games/number-guess',
      difficulty: 'Medium',
      color: 'blue',
      thumbnail: '/src/assets/images/number_guess_thumb_1783074181132.jpg'
    },
    {
      id: 'reaction-timer',
      title: 'Reaction Timer',
      description: 'How fast are your reflexes? Click as soon as the screen turns green to measure your speed.',
      icon: 'Zap',
      path: '/games/reaction-timer',
      difficulty: 'Hard',
      color: 'purple',
      thumbnail: '/src/assets/images/reaction_timer_thumb_1783074192282.jpg'
    },
    {
      id: 'tic-tac-toe',
      title: 'Tic Tac Toe',
      description: 'The ultimate strategy battle. Play against a friend and prove your tactical dominance.',
      icon: 'X',
      path: '/games/tic-tac-toe',
      difficulty: 'Easy',
      color: 'pink',
      thumbnail: '/src/assets/images/tictactoe_thumb_1783074205038.jpg'
    }
  ];

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden px-4">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/day-bg.png" 
            alt="Background" 
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#05050C]/40 via-[#05050C]/10 to-[#05050C]" />
        </div>

        {/* Background Elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-primary/20 rounded-full blur-[120px] z-0" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-secondary/20 rounded-full blur-[120px] z-0" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold tracking-tighter text-brand-primary">Mini Game Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter mb-8 leading-[1.1] uppercase">
              PLAY <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-500 to-red-600">ULTRA-SMOOTH</span> <br /> GAMES
            </h1>
            
            <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-12 leading-relaxed">
              Experience high-performance browser gaming. No downloads, just pure skill and competition.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/games"
                className="w-full sm:w-auto px-10 py-4 bg-brand-primary hover:bg-brand-accent text-white rounded-xl font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(153,27,27,0.4)] transition-all flex items-center justify-center gap-2 group"
              >
                EXPLORE GAMES
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm tracking-wide border border-white/10 transition-all"
              >
                LEARN MORE
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Stats Banner */}
      <section className="relative -mt-16 mb-8 px-4 z-20">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card rounded-[32px] p-8 border-slate-800/80 bg-slate-950/40 backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-800/60">
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Plays</span>
                <span className="text-3xl font-display font-black text-amber-500">
                  {stats ? stats.totalGamesPlayed.toLocaleString() : '1,250'}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Active Gamers</span>
                <span className="text-3xl font-display font-black text-rose-500 animate-pulse">
                  {stats ? stats.activeUsers : '45'}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Trending Challenge</span>
                <span className="text-xl font-display font-black text-blue-400 uppercase tracking-tight text-center">
                  {stats ? stats.trendingGame : 'Reaction Timer'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/game.png" 
            alt="Featured Background" 
            className="w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#05050C] via-transparent to-[#05050C]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
          >
            <div>
              <h2 className="text-4xl font-display font-bold mb-4">Featured <span className="text-brand-primary">Games</span></h2>
              <p className="text-slate-400">Hand-picked challenges to test your limits.</p>
            </div>
            <Link to="/games" className="text-brand-primary font-bold hover:underline flex items-center gap-2">
              View All Games <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredGames.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}
