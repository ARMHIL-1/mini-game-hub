import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { Game } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface GameCardProps {
  game: Game;
  index: number;
  key?: React.Key;
}

export default function GameCard({ game, index }: GameCardProps) {
  const Icon = game.icon as any; // We'll handle icon mapping in the parent if needed or pass as string name

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div className={cn(
        "absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-500 blur-xl",
        game.color === 'blue' ? 'bg-brand-primary/50' : 
        game.color === 'purple' ? 'bg-brand-secondary/50' : 'bg-brand-accent/50'
      )} />
      
      <div className="relative bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl hover:border-brand-primary/50 hover:bg-white/10 transition-all flex flex-col h-full overflow-hidden">
        {game.thumbnail && (
          <div className="absolute inset-0 z-0">
            <img 
              src={game.thumbnail} 
              alt="" 
              className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-linear-to-b from-slate-950/60 via-slate-950/30 to-slate-950" />
          </div>
        )}
        
        <div className="relative z-10 flex flex-col h-full">
          <div className={cn(
            "w-14 h-14 border rounded-2xl flex items-center justify-center mb-6 shadow-inner text-3xl shrink-0",
            game.color === 'blue' ? 'bg-brand-primary/20 border-brand-primary/30' : 
            game.color === 'purple' ? 'bg-brand-secondary/20 border-brand-secondary/30' : 'bg-brand-accent/20 border-brand-accent/30'
          )}>
            {/* Render icon based on name if passed as string, or just use component */}
            <div className="flex items-center justify-center">
               {game.title === 'Number Guess' && <span>🎲</span>}
               {game.title === 'Reaction Timer' && <span>⚡</span>}
               {game.title === 'Tic Tac Toe' && <span>❌</span>}
            </div>
          </div>

          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold group-hover:text-brand-accent transition-colors">
              {game.title}
            </h3>
            <span className={cn(
              "px-2 py-0.5 text-[10px] uppercase font-bold rounded-md",
              game.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
              game.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
              'bg-rose-500/20 text-rose-400'
            )}>
              {game.difficulty}
            </span>
          </div>
          
          <p className="text-sm text-slate-400 mb-8 leading-snug flex-grow">
            {game.description}
          </p>

          <Link
            to={game.path}
            className={cn(
              "w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all text-center",
              game.color === 'blue' ? 'bg-brand-primary hover:bg-brand-accent shadow-[0_4px_15px_rgba(153,27,27,0.4)]' :
              game.color === 'purple' ? 'bg-linear-to-r from-brand-primary to-brand-secondary hover:from-brand-accent hover:to-brand-primary shadow-[0_4px_20px_rgba(127,29,29,0.4)]' :
              'bg-brand-accent hover:bg-red-500 shadow-[0_4px_15px_rgba(225,29,72,0.4)]'
            )}
          >
            {game.title === 'Number Guess' ? 'PLAY NOW' : 
             game.title === 'Reaction Timer' ? 'START CHALLENGE' : 'JOIN MATCH'}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
