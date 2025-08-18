import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export type SharedGroup = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
};

export function useSharedGroups() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['shared-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shared_groups')
        .select(`
          *,
          group_members!inner(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching groups",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      return data || [];
    }
  });

  const createGroup = useMutation({
    mutationFn: async (groupName: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to create groups');

      // Generate invite code
      const { data: inviteCode, error: codeError } = await supabase
        .rpc('generate_invite_code');
      
      if (codeError) throw codeError;

      // Create group
      const { data: group, error: groupError } = await supabase
        .from('shared_groups')
        .insert([{ 
          name: groupName, 
          invite_code: inviteCode,
          created_by: user.id 
        }])
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: group.id,
          user_id: user.id,
          role: 'admin'
        }]);

      if (memberError) throw memberError;

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-groups'] });
      toast({
        title: "Group created",
        description: "Your new shared group has been created successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating group",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const joinGroup = useMutation({
    mutationFn: async (inviteCode: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to join groups');

      // Find group by invite code
      const { data: group, error: groupError } = await supabase
        .from('shared_groups')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (groupError) {
        if (groupError.code === 'PGRST116') {
          throw new Error('Invalid invite code');
        }
        throw groupError;
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: group.id,
          user_id: user.id,
          role: 'member'
        }]);

      if (memberError) {
        if (memberError.code === '23505') {
          throw new Error('You are already a member of this group');
        }
        throw memberError;
      }

      return group;
    },
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ['shared-groups'] });
      toast({
        title: "Joined group",
        description: `You have successfully joined "${group.name}".`
      });
    },
    onError: (error) => {
      toast({
        title: "Error joining group",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const leaveGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to leave groups');

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      return groupId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-groups'] });
      toast({
        title: "Left group",
        description: "You have successfully left the group."
      });
    },
    onError: (error) => {
      toast({
        title: "Error leaving group",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getGroupMembers = (groupId: string) => {
    return useQuery({
      queryKey: ['group-members', groupId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupId);

        if (error) throw error;
        return data || [];
      },
      enabled: !!groupId
    });
  };

  return {
    groups,
    groupsLoading,
    createGroup,
    joinGroup,
    leaveGroup,
    getGroupMembers
  };
}