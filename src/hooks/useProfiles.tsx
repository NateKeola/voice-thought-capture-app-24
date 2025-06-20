
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { DatabaseTables } from '@/types/database.types';

export type Profile = DatabaseTables['profiles'];

export function useProfiles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('last_interaction', { ascending: false }) as { data: Profile[] | null, error: any };

      if (error) {
        toast({
          title: "Error fetching profiles",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      return data || [];
    }
  });

  const createProfile = useMutation({
    mutationFn: async (newProfile: Omit<Profile, 'id' | 'created_at' | 'last_interaction'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to create profiles');

      const { data, error } = await supabase
        .from('profiles')
        .insert([{ ...newProfile, user_id: user.id }])
        .select()
        .single() as { data: Profile | null, error: any };

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: "Profile created",
        description: "New relationship has been added successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteProfile = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
      return profileId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: "Relationship deleted",
        description: "The relationship has been removed successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting relationship",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    profiles,
    isLoading,
    createProfile,
    deleteProfile
  };
}
