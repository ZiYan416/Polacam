/**
 * @file Guide.tsx
 * @description Onboarding overlay for new users.
 */

import React from 'react';
import { Camera, Edit3, Move } from 'lucide-react';
import { t } from '../locales';
import { Language } from '../types';

interface GuideProps {
  onDismiss: () => void;
  lang: Language;
}

const Guide: React.FC<GuideProps> = ({ onDismiss, lang }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white max-w-md w-full rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-pola-red rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
           <Camera className="text-white" size={32} />
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{t(lang, 'guide.title')}</h2>
        
        <div className="space-y-6 text-left">
          <div className="flex items-start gap-4">
            <div className="bg-gray-100 p-3 rounded-full"><Camera size={20} className="text-gray-600"/></div>
            <div>
              <p className="font-bold text-gray-800">1. {t(lang, 'takePhoto')}</p>
              <p className="text-sm text-gray-500">{t(lang, 'guide.step1')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-gray-100 p-3 rounded-full"><Edit3 size={20} className="text-gray-600"/></div>
            <div>
              <p className="font-bold text-gray-800">2. {t(lang, 'editorTitle')}</p>
              <p className="text-sm text-gray-500">{t(lang, 'guide.step2')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-gray-100 p-3 rounded-full"><Move size={20} className="text-gray-600"/></div>
            <div>
              <p className="font-bold text-gray-800">3. {t(lang, 'guide.step3')}</p>
              <p className="text-sm text-gray-500">Just like real film.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onDismiss}
          className="w-full mt-8 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
        >
          {t(lang, 'guide.button')}
        </button>
      </div>
    </div>
  );
};

export default Guide;
