
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Interest {
  id: string;
  name: string;
  category: string;
}

export interface UserInterest {
  id: string;
  interest: Interest;
}

export const useUserInterests = () => {
  const { user } = useAuth();
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all available interests
  const fetchAllInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setAllInterests(data || []);
    } catch (error) {
      console.error('Error fetching interests:', error);
    }
  };

  // Fetch user's selected interests
  const fetchUserInterests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select(`
          id,
          interest:interests(id, name, category)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserInterests(data || []);
    } catch (error) {
      console.error('Error fetching user interests:', error);
    }
  };

  // Add an interest for the user
  const addInterest = async (interestId: string) => {
    if (!user) return false;

    try {
      console.log('Adding interest:', interestId, 'for user:', user.id);
      const { error } = await supabase
        .from('user_interests')
        .insert({
          user_id: user.id,
          interest_id: interestId
        });

      if (error) throw error;
      console.log('Interest added successfully');
      await fetchUserInterests(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error adding interest:', error);
      return false;
    }
  };

  // Create a new custom interest
  const createCustomInterest = async (name: string, category: string) => {
    try {
      console.log('Creating custom interest:', { name, category });
      const { data, error } = await supabase
        .from('interests')
        .insert({
          name,
          category
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating custom interest:', error);
        throw error;
      }
      
      console.log('Custom interest created:', data);
      
      // Refresh all interests to include the new one
      await fetchAllInterests();
      
      return data;
    } catch (error) {
      console.error('Error creating custom interest:', error);
      return null;
    }
  };

  // Remove an interest for the user
  const removeInterest = async (userInterestId: string) => {
    try {
      const { error } = await supabase
        .from('user_interests')
        .delete()
        .eq('id', userInterestId);

      if (error) throw error;
      await fetchUserInterests(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error removing interest:', error);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAllInterests(), fetchUserInterests()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    userInterests,
    allInterests,
    loading,
    addInterest,
    removeInterest,
    createCustomInterest,
    refreshUserInterests: fetchUserInterests
  };
};
