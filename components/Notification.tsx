
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
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[7000] animate-slide-down">
      <div className="bg-black/80 dark:bg-white/90 backdrop-blur-md text-white dark:text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
        <Sparkles size={18} className="text-yellow-400 dark:text-yellow-600" />
        <span className="font-mono text-sm font-bold">{message}</span>
        <button onClick={onClose} className="opacity-50 hover:opacity-100 ml-2">
           <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default Notification;
