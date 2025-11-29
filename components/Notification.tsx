
import React, { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed z-[7000] w-auto max-w-[90vw] animate-slide-down top-6 left-1/2 -translate-x-1/2 md:top-24 md:right-8 md:left-auto md:translate-x-0">
      <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border border-white/20 dark:border-zinc-700/50 text-zinc-800 dark:text-zinc-100 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-colors duration-300">
        <div className="bg-yellow-400/20 p-1.5 rounded-full">
           <Sparkles size={16} className="text-yellow-600 dark:text-yellow-400" />
        </div>
        <span className="font-mono text-sm font-bold tracking-tight">{message}</span>
        <button onClick={onClose} className="opacity-50 hover:opacity-100 ml-2 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
           <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default Notification;