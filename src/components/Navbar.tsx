import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, Home, Info, Github, Menu, X, Trophy, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const [registeredUser, setRegisteredUser] = useState(() => localStorage.getItem('registered_username') || '');
  const [showRegModal, setShowRegModal] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim()) return;
    setRegLoading(true);
    setRegError(null);

    fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: regUsername.trim() })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to register');
        return data;
      })
      .then((data) => {
        localStorage.setItem('registered_username', data.username);
        localStorage.setItem('player_name', data.username);
        setRegisteredUser(data.username);
        setShowRegModal(false);
        setRegUsername('');
      })
      .catch((err) => {
        setRegError(err.message || 'Error occurred');
      })
      .finally(() => {
        setRegLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('registered_username');
    setRegisteredUser('');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Games', path: '/games', icon: Gamepad2 },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'About', path: '/about', icon: Info },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="h-16 flex items-center justify-between px-10 bg-white/5 border-b border-white/10 backdrop-blur-md rounded-2xl sticky top-0 z-50">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/src/assets/images/game_hub_logo_1783075154473.jpg" 
              alt="Logo" 
              className="w-10 h-10 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-transform group-hover:rotate-12 object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              MINI GAME HUB
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-slate-400">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "transition-all duration-300 pb-1 border-b-2",
                  location.pathname === link.path
                    ? "text-brand-primary border-brand-primary"
                    : "text-slate-400 border-transparent hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
            {registeredUser ? (
              <div className="flex items-center gap-3 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-xl select-none animate-fade-in">
                <User className="w-4 h-4 text-brand-primary" />
                <span className="text-white text-xs font-bold font-mono tracking-tight">{registeredUser}</span>
                <button 
                  onClick={handleLogout} 
                  className="text-slate-500 hover:text-rose-500 transition-colors ml-1 cursor-pointer" 
                  title="Log Out"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowRegModal(true)}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-accent text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-brand-primary/10"
              >
                Register Profile
              </button>
            )}
            <div className="w-10 h-5 bg-brand-primary/20 rounded-full border border-brand-primary/30 flex items-center px-1">
              <div className="w-3 h-3 bg-brand-primary rounded-full shadow-[0_0_8px_var(--color-brand-primary)]"></div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-2 glass-card rounded-2xl p-4 flex flex-col gap-2 border-slate-700/50"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 font-medium",
                  location.pathname === link.path
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10 mt-2">
              {registeredUser ? (
                <div className="px-4 py-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-brand-primary" />
                    <span className="text-white font-bold font-mono">{registeredUser}</span>
                  </div>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors text-sm font-bold uppercase tracking-wider">
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowRegModal(true);
                  }}
                  className="w-full px-4 py-3 bg-brand-primary hover:bg-brand-accent text-white rounded-xl font-bold text-sm tracking-wide text-center"
                >
                  Register Profile
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Registration Modal Dialog */}
      <AnimatePresence>
        {showRegModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md p-8 rounded-3xl border-slate-800/80 bg-slate-900/95 relative shadow-2xl animate-fade-in"
            >
              <button
                onClick={() => setShowRegModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary border border-brand-primary/30">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Register Profile</h3>
                  <p className="text-slate-400 text-xs font-semibold">Join the Mini Game Hub database</p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Username</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={15}
                    pattern="^[a-zA-Z0-9_]+$"
                    title="Only alphanumeric characters and underscores are allowed"
                    placeholder="e.g. SpeedRunner_99"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-brand-primary rounded-xl px-4 py-3 text-white font-medium outline-none text-sm transition-all"
                  />
                </div>

                {regError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-bold rounded-xl">
                    {regError}
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRegModal(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="px-5 py-2.5 bg-brand-primary hover:bg-brand-accent text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {regLoading ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}
