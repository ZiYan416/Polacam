
import React from 'react';
import { X, Github, ExternalLink } from 'lucide-react';
import { t } from '../locales';
import { Language } from '../types';

interface AboutModalProps {
  onClose: () => void;
  lang: Language;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose, lang }) => {
  return (
    <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 dark:text-zinc-100 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in relative p-8 text-center border dark:border-zinc-800">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white"
        >
            <X size={24} />
        </button>

        <div className="mb-6">
            <div className="w-16 h-16 bg-pola-red rounded-full mx-auto animate-pulse"></div>
            <h1 className="text-3xl font-mono font-bold mt-4 tracking-tighter">POLACAM</h1>
            <p className="text-xs font-mono tracking-[0.5em] text-gray-400 mt-2">DIGITAL ANALOG</p>
        </div>

        <p className="text-gray-600 dark:text-zinc-400 font-mono text-sm mb-8 leading-relaxed">
            {t(lang, 'about.desc')}
        </p>

        <div className="space-y-3">
            <a 
               href="https://github.com/ZiYan416/Polacam" // Replace with actual link
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 w-full bg-black dark:bg-zinc-100 dark:text-black text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
                <Github size={18} />
                {t(lang, 'about.github')}
            </a>
            
            {/* Optional contact link */}
            <a 
               href="https://github.com/ZiYan416" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 w-full border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 py-3 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
                <ExternalLink size={18} />
                {t(lang, 'about.contact')}
            </a>
        </div>
        
        <div className="mt-8 text-xs text-gray-400 font-mono">
            v0.2.0 • Made with ❤️
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
