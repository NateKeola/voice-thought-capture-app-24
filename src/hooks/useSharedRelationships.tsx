import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SharedRelationship {
  id: string;
  group_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  type: string;
  deal_value: number | null;
  important_metrics: Record<string, any>;
  added_by: string | null;
  created_at: string;
  updated_at: string;
  last_interaction: string;
}

export function useSharedRelationships(groupId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch shared relationships for a group
  const { data: sharedRelationships = [], isLoading } = useQuery({
    queryKey: ['shared-relationships', groupId],
    queryFn: async () => {
      if (!groupId) return [];

      const { data, error } = await supabase
        .from('shared_relationships')
        .select('*')
        .eq('group_id', groupId)
        .order('last_interaction', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching shared relationships",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      return data || [];
    },
    enabled: !!groupId
  });

  // Create shared relationship
  const createSharedRelationship = useMutation({
    mutationFn: async (relationshipData: Omit<SharedRelationship, 'id' | 'created_at' | 'updated_at' | 'added_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to create shared relationships');

      const { data, error } = await supabase
        .from('shared_relationships')
        .insert([{
          ...relationshipData,
          added_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-relationships', groupId] });
      toast({
        title: "Shared relationship created",
        description: "New lead has been added to the shared tracker."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating relationship",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update shared relationship
  const updateSharedRelationship = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SharedRelationship> & { id: string }) => {
      const { data, error } = await supabase
        .from('shared_relationships')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          last_interaction: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-relationships', groupId] });
      toast({
        title: "Relationship updated",
        description: "The shared relationship has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating relationship",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete shared relationship
  const deleteSharedRelationship = useMutation({
    mutationFn: async (relationshipId: string) => {
      const { error } = await supabase
        .from('shared_relationships')
        .delete()
        .eq('id', relationshipId);

      if (error) throw error;
      return relationshipId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-relationships', groupId] });
      toast({
        title: "Relationship deleted",
        description: "The shared relationship has been removed."
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

  // Copy from personal to shared
  const copyToShared = useMutation({
    mutationFn: async ({ personalProfile, targetGroupId, dealValue, metrics }: {
      personalProfile: any;
      targetGroupId: string;
      dealValue?: number;
      metrics?: Record<string, any>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const { data, error } = await supabase
        .from('shared_relationships')
        .insert([{
          group_id: targetGroupId,
          first_name: personalProfile.first_name,
          last_name: personalProfile.last_name,
          email: personalProfile.email,
          phone: personalProfile.phone,
          notes: personalProfile.notes,
          type: personalProfile.type,
          deal_value: dealValue || null,
          important_metrics: metrics || {},
          added_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-relationships', groupId] });
      toast({
        title: "Copied to shared",
        description: "Contact has been copied to the shared tracker."
      });
    },
    onError: (error) => {
      toast({
        title: "Error copying to shared",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    sharedRelationships,
    isLoading,
    createSharedRelationship,
    updateSharedRelationship,
    deleteSharedRelationship,
    copyToShared
  };
}