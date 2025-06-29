
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ProfileInterest {
  id: string;
  profile_id: string;
  interest: {
    id: string;
    name: string;
    category: string;
  };
}

export const useProfileInterests = (profileId?: string) => {
  const { user } = useAuth();
  const [profileInterests, setProfileInterests] = useState<ProfileInterest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch interests for a specific profile
  const fetchProfileInterests = async () => {
    if (!profileId || !user) return;

    try {
      // Use type assertion to work around the types not being updated yet
      const { data, error } = await (supabase as any)
        .from('profile_interests')
        .select(`
          id,
          profile_id,
          interest:interests(id, name, category)
        `)
        .eq('profile_id', profileId);

      if (error) throw error;
      setProfileInterests(data || []);
    } catch (error) {
      console.error('Error fetching profile interests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add an interest to a profile
  const addProfileInterest = async (interestId: string) => {
    if (!profileId || !user) return false;

    try {
      // Use type assertion to work around the types not being updated yet
      const { error } = await (supabase as any)
        .from('profile_interests')
        .insert({
          profile_id: profileId,
          interest_id: interestId
        });

      if (error) throw error;
      await fetchProfileInterests(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error adding profile interest:', error);
      return false;
    }
  };

  // Remove an interest from a profile
  const removeProfileInterest = async (profileInterestId: string) => {
    try {
      // Use type assertion to work around the types not being updated yet
      const { error } = await (supabase as any)
        .from('profile_interests')
        .delete()
        .eq('id', profileInterestId);

      if (error) throw error;
      await fetchProfileInterests(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error removing profile interest:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchProfileInterests();
  }, [profileId, user]);

  return {
    profileInterests,
    loading,
    addProfileInterest,
    removeProfileInterest,
    refreshProfileInterests: fetchProfileInterests
  };
};
