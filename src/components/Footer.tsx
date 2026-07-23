import { Link } from 'react-router-dom';
import { Gamepad2, Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="h-12 border-t border-white/5 bg-[#050510] px-10 flex items-center justify-between text-[11px] text-slate-500 uppercase tracking-[0.2em] font-medium">
      <div>Mini Game Hub &copy; {currentYear} • Built with React & Express</div>
      <div className="flex gap-6">
        <Link to="/about" className="text-brand-primary hover:text-brand-accent transition-colors">About Us</Link>
      </div>
    </footer>
  );
}
