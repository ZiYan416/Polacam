
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { t } from '../locales';
import { Language } from '../types';

interface AuthModalProps {
  onClose: () => void;
  lang: Language;
  onLoginSuccess?: (isSignUp: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, lang, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const currentUrl = window.location.origin + window.location.pathname;

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: currentUrl,
          },
        });
        if (error) throw error;
        setMessage(lang === 'zh' ? '注册成功！请检查邮箱进行验证。' : 'Success! Check your email to verify.');
        if (onLoginSuccess) onLoginSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (onLoginSuccess) onLoginSuccess(false);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1a1a] dark:text-gray-100 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in relative transition-colors duration-300">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white"
        >
            <X size={24} />
        </button>

        <div className="p-8">
            <h2 className="text-2xl font-mono font-bold text-center mb-6">
                {isSignUp 
                  ? (lang === 'zh' ? '加入 Polacam' : 'Join Polacam') 
                  : (lang === 'zh' ? '登录' : 'Login')}
            </h2>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-300 text-sm p-3 rounded mb-4 border border-red-100 dark:border-red-900">
                    {error}
                </div>
            )}
            
            {message && (
                <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 text-sm p-3 rounded mb-4 border border-green-100 dark:border-green-900">
                    {message}
                </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-colors"
                            placeholder="hello@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-colors"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    {isSignUp 
                        ? (lang === 'zh' ? '注册账号' : 'Sign Up') 
                        : (lang === 'zh' ? '进入' : 'Sign In')}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
                    className="text-sm text-gray-500 dark:text-gray-400 underline hover:text-black dark:hover:text-white"
                >
                    {isSignUp 
                        ? (lang === 'zh' ? '已有账号？去登录' : 'Already have an account? Log in') 
                        : (lang === 'zh' ? '没有账号？注册一个' : 'Need an account? Sign up')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
