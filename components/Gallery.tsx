
import React from 'react';
import { Photo, UserProfile, Language } from '../types';
import PhotoCard from './PhotoCard';
import { Camera as CameraIcon, LogOut, Edit2, User, UserCircle2 } from 'lucide-react';
import { t } from '../locales';

interface GalleryProps {
  photos: Photo[];
  onToggle: (photo: Photo) => void;
  userProfile: UserProfile | null;
  lang: Language;
  onLogout: () => void;
  onEditProfile: () => void;
  onLogin: () => void; // For guest mode
}

const Gallery: React.FC<GalleryProps> = ({ 
  photos, 
  onToggle, 
  userProfile, 
  lang, 
  onLogout,
  onEditProfile,
  onLogin
}) => {
  
  const getAvatarInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col min-h-full transition-colors duration-300">
      
      {/* --- Profile Header Section --- */}
      <div className="pt-24 pb-8 px-6 md:px-12 bg-gradient-to-b from-white/40 to-transparent dark:from-black/40">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          
          {/* Avatar */}
          <div className="relative group shrink-0">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                {userProfile ? (
                   userProfile.avatar_url ? (
                     <img src={userProfile.avatar_url} alt={userProfile.username} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black text-white flex items-center justify-center font-mono text-3xl font-bold">
                       {getAvatarInitials(userProfile.username)}
                     </div>
                   )
                ) : (
                   <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-300 dark:text-gray-500">
                      <User size={48} />
                   </div>
                )}
             </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
             <div className="flex flex-col md:flex-row items-center gap-3">
                <h2 className="text-2xl md:text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-tight">
                   {userProfile ? userProfile.username : t(lang, 'profile.guest')}
                </h2>
                {userProfile ? (
                  <button onClick={onEditProfile} className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-1 dark:text-gray-300">
                     <Edit2 size={12} /> {t(lang, 'profile.edit')}
                  </button>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded uppercase tracking-wider font-bold">Guest Mode</span>
                )}
             </div>

             <p className="text-sm text-gray-500 dark:text-gray-400 font-mono max-w-md mx-auto md:mx-0">
               {userProfile?.bio || (userProfile ? t(lang, 'profile.bioPlaceholder') : t(lang, 'profile.guestDesc'))}
             </p>
             
             <div className="flex items-center justify-center md:justify-start gap-6 text-sm font-mono pt-2">
                <div>
                   <span className="font-bold text-lg block text-black dark:text-white">{photos.length}</span>
                   <span className="text-gray-500 dark:text-gray-400 text-xs uppercase">{t(lang, 'profile.shots')}</span>
                </div>
             </div>
          </div>

          {/* Actions */}
          <div className="shrink-0">
             {userProfile ? (
               <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors p-2" title={t(lang, 'profile.logout')}>
                 <LogOut size={24} />
               </button>
             ) : (
               <button 
                 onClick={onLogin} 
                 className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
               >
                 <UserCircle2 size={18} />
                 {t(lang, 'profile.login')}
               </button>
             )}
          </div>

        </div>
      </div>

      {/* --- Gallery Grid --- */}
      <div className="flex-1 px-2 md:px-4 pb-40 max-w-6xl mx-auto w-full">
         <div className="border-t border-gray-300/50 dark:border-gray-700/50 mb-8 mx-6"></div>
         
         {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600 opacity-60 min-h-[30vh]">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <CameraIcon size={32} className="text-gray-400 dark:text-gray-600" />
              </div>
              <p className="font-mono text-lg">{t(lang, 'noPhotos')}</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
              {photos.map((photo, index) => (
                <div key={photo.id} className="flex justify-center relative group">
                    <div 
                      className="relative transition-all duration-300 z-0 group-hover:z-[50] group-hover:scale-105 group-hover:rotate-0"
                      style={{ transform: `rotate(${index % 2 === 0 ? 2 : -2}deg)` }}
                    >
                        <PhotoCard 
                          photo={photo} 
                          onSave={onToggle} 
                          isSaved={true} 
                          className="w-full max-w-[170px] md:max-w-[280px]" 
                        />
                    </div>
                </div>
              ))}
            </div>
         )}
      </div>

    </div>
  );
};

export default Gallery;
