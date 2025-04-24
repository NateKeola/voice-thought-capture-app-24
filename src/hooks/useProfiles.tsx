
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  type: string;
  created_at: string;
  last_interaction: string;
}

export function useProfiles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('last_interaction', { ascending: false });

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
        .single();

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

  return {
    profiles,
    isLoading,
    createProfile
  };
}
