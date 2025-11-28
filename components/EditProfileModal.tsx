
import React, { useState, useRef } from 'react';
import { X, Loader2, Camera, Upload } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { t } from '../locales';
import { updateProfile, uploadAvatar } from '../services/userService';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setLoading(true);
        // Upload Avatar
        const publicUrl = await uploadAvatar(profile.id, file);
        if (publicUrl) {
            // Update Profile with new Avatar URL
            const updated = await updateProfile(profile.id, { avatar_url: publicUrl });
            if (updated) onUpdate(updated);
        }
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1a1a] dark:text-gray-100 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in relative p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-xl font-mono font-bold mb-6 text-center">{t(lang, 'profile.edit')}</h2>

        <div className="flex flex-col items-center mb-6">
            <div 
                className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 relative group cursor-pointer overflow-hidden border-4 border-white dark:border-gray-700 shadow-md"
                onClick={handleAvatarClick}
            >
                {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <Camera size={32} />
                    </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="text-white" size={24} />
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{t(lang, 'profile.uploadAvatar')}</p>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-colors"
              minLength={3}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-500 dark:text-gray-400 uppercase mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-black dark:focus:ring-white outline-none h-24 resize-none transition-colors"
              placeholder={t(lang, 'profile.bioPlaceholder')}
              maxLength={100}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{bio.length}/100</div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : t(lang, 'profile.save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
