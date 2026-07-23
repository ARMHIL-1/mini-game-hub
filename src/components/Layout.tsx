import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#05050C] flex flex-col selection:bg-indigo-500/30 selection:text-white">
      <Navbar />
      
      <main className="flex-grow relative">
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative z-10"
        >
          {children}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
