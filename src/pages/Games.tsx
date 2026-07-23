import React from 'react';
import { motion } from 'motion/react';
import { Gamepad2 } from 'lucide-react';
import GameCard from '@/src/components/GameCard';
import { Game } from '@/src/types';

export default function Games() {
  const allGames: Game[] = [
    {
      id: 'number-guess',
      title: 'Number Guess',
      description: 'A logic game where you guess a hidden number within a range. Includes difficulty modes from Easy to Hard.',
      icon: 'Hash',
      path: '/games/number-guess',
      difficulty: 'Medium',
      color: 'blue',
      thumbnail: '/src/assets/images/number_guess_thumb_1783074181132.jpg'
    },
    {
      id: 'reaction-timer',
      title: 'Reaction Timer',
      description: 'Test how quickly you can react to visual cues. Competitive mode for pro gamers.',
      icon: 'Zap',
      path: '/games/reaction-timer',
      difficulty: 'Hard',
      color: 'purple',
      thumbnail: '/src/assets/images/reaction_timer_thumb_1783074192282.jpg'
    },
    {
      id: 'tic-tac-toe',
      title: 'Tic Tac Toe',
      description: 'The timeless classic. Play locally with a friend on a sleek, modern game board.',
      icon: 'X',
      path: '/games/tic-tac-toe',
      difficulty: 'Easy',
      color: 'pink',
      thumbnail: '/src/assets/images/tictactoe_thumb_1783074205038.jpg'
    }
  ];

  return (
    <div className="relative pt-32 pb-24 px-4 min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/gamepage.png" 
          alt="Games Background" 
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#05050C]/60 via-[#05050C]/40 to-[#05050C]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold">Game <span className="text-brand-primary">Library</span></h1>
              <p className="text-slate-400">All available challenges in one place.</p>
            </div>
          </div>
          <div className="h-px bg-linear-to-r from-slate-800 to-transparent w-full" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allGames.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
