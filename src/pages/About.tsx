import { motion } from 'motion/react';
import { Info, Code, Layout, Server, Sparkles, User } from 'lucide-react';

export default function About() {
  const features = [
    { icon: Layout, title: 'Modern Frontend', desc: 'Built with React and Vite for blazing fast performance and smooth UI transitions.' },
    { icon: Server, title: 'Robust Backend', desc: 'Express-powered backend handling API requests and game statistics securely.' },
    { icon: Sparkles, title: 'Gaming Aesthetic', desc: 'Professional design using glassmorphism, gradients, and custom animations.' },
    { icon: Code, title: 'Clean Architecture', desc: 'Modular codebase following the best industry standards for scalability.' },
  ];

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex p-4 rounded-3xl bg-brand-primary/10 text-brand-primary mb-8">
            <Info className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">About the <span className="text-brand-primary">Hub</span></h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            MiniGameHub is a premier browser-based gaming destination, meticulously crafted to showcase the power of modern web technologies. We believe that simple games deserve world-class presentation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 rounded-3xl border-slate-800/50"
            >
              <f.icon className="w-10 h-10 text-brand-primary mb-6" />
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-10 rounded-[40px] text-center bg-linear-to-br from-brand-primary/10 to-brand-secondary/10 border-brand-primary/20"
        >
          <div className="w-20 h-20 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary mx-auto mb-6">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-2">Meet the <span className="text-brand-primary">Developer</span></h2>
          <h3 className="text-xl font-bold text-white mb-4">ARMHIL A. DELA CRUZ</h3>
          <p className="text-slate-300 max-w-lg mx-auto leading-relaxed">
            A Computer Engineering Student, Software Engineer, Game Developer, and Web Developer dedicated to building high-performance digital experiences.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
