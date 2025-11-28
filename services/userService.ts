
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Error fetching profile:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
};

export const updateProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username: updates.username,
        bio: updates.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};
