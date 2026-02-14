import { Home, BookOpen, BarChart2, Settings } from 'lucide-react';

export default function Layout({ children, currentView, onNavigate }) {
  return (
    <div className="flex flex-col h-screen bg-sand-50 font-sans text-primary-900">
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
      
      {/* Premium Glassmorphic Bottom Navigation */}
      <nav className="flex-none bg-white/80 backdrop-blur-md border-t border-sand-200 flex justify-around p-4 pb-6 shadow-[0_-5px_30px_rgba(0,0,0,0.03)] z-50">
          <NavButton 
            active={currentView === 'dashboard'} 
            onClick={() => onNavigate('dashboard')} 
            icon={<Home size={24} />} 
            label="Home" 
          />
          <NavButton 
            active={currentView === 'read'} 
            onClick={() => onNavigate('read')} 
            icon={<BookOpen size={24} />} 
            label="Baca" 
          />
          <NavButton 
            active={currentView === 'log'} 
            onClick={() => onNavigate('log')} 
            icon={<BarChart2 size={24} />} 
            label="Log" 
          />
           <NavButton 
            active={currentView === 'settings'} 
            onClick={() => onNavigate('settings')} 
            icon={<Settings size={24} />} 
            label="Settings" 
          />
      </nav>
    </div>
  );
}

import { motion } from 'framer-motion';

function NavButton({ active, onClick, icon, label }) {
    return (
        <button 
            onClick={onClick} 
            className="relative flex flex-col items-center gap-1 group w-16"
        >
            {active && (
                <motion.div
                    layoutId="nav-pill"
                    className="absolute -top-1 inset-x-0 h-10 bg-primary-50 rounded-full mx-auto w-12 z-0"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
            
            <div className={`relative z-10 p-1 rounded-full transition-colors duration-200 ${active ? 'text-primary-700' : 'text-gray-400 group-hover:text-primary-600'}`}>
                {icon}
            </div>
            <span className={`relative z-10 text-[10px] font-medium tracking-wide transition-colors ${active ? 'text-primary-800 font-bold' : 'text-gray-400 group-hover:text-primary-600'}`}>{label}</span>
        </button>
    )
}
