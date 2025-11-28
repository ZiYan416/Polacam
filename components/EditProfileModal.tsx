
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { t } from '../locales';
import { updateProfile } from '../services/userService';

interface EditProfileModalProps {
  profile: UserProfile;
  lang: Language;
  onClose: () => void;
  onUpdate: (profile: UserProfile) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, lang, onClose, onUpdate }) => {
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const updated = await updateProfile(profile.id, { username, bio });
    if (updated) {
      onUpdate(updated);
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in relative p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <X size={24} />
        </button>

        <h2 className="text-xl font-mono font-bold mb-6 text-center">{t(lang, 'profile.edit')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-black outline-none"
              minLength={3}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-500 uppercase mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-black outline-none h-24 resize-none"
              placeholder={t(lang, 'profile.bioPlaceholder')}
              maxLength={100}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{bio.length}/100</div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : t(lang, 'profile.save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
