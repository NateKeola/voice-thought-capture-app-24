import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CollaborativeGroup {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface GroupJoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export function useCollaborativeGroups() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch groups user is member of
  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['collaborative-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_groups')
        .select('*')
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

  // Fetch group memberships
  const { data: memberships = [], isLoading: membershipsLoading } = useQuery({
    queryKey: ['group-memberships'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_memberships')
        .select('*');

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch join requests for user's groups
  const { data: joinRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['group-join-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_join_requests')
        .select('*')
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    }
  });

  // Create new group
  const createGroup = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to create groups');

      // Generate invite code
      const { data: inviteCodeData, error: inviteError } = await supabase.rpc('generate_invite_code');
      if (inviteError) throw inviteError;

      const { data, error } = await supabase
        .from('collaboration_groups')
        .insert([{
          name,
          description: description || null,
          invite_code: inviteCodeData,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin
      const { error: membershipError } = await supabase
        .from('group_memberships')
        .insert([{
          group_id: data.id,
          user_id: user.id,
          role: 'admin'
        }]);

      if (membershipError) throw membershipError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-memberships'] });
      toast({
        title: "Group created",
        description: "New collaborative group has been created successfully."
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

  // Join group by invite code
  const joinGroupByCode = useMutation({
    mutationFn: async (inviteCode: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to join groups');

      // Find group by invite code
      const { data: group, error: groupError } = await supabase
        .from('collaboration_groups')
        .select('id')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (groupError || !group) {
        throw new Error('Invalid invite code');
      }

      // Check if already a member
      const { data: existingMembership } = await supabase
        .from('group_memberships')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existingMembership) {
        throw new Error('You are already a member of this group');
      }

      // Add membership
      const { error } = await supabase
        .from('group_memberships')
        .insert([{
          group_id: group.id,
          user_id: user.id,
          role: 'member'
        }]);

      if (error) throw error;

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-memberships'] });
      toast({
        title: "Joined group",
        description: "You have successfully joined the group."
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

  // Request to join group
  const requestJoinGroup = useMutation({
    mutationFn: async ({ groupName, message }: { groupName: string; message?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in to request group membership');

      // Find group by name
      const { data: group, error: groupError } = await supabase
        .from('collaboration_groups')
        .select('id')
        .ilike('name', groupName)
        .single();

      if (groupError || !group) {
        throw new Error('Group not found');
      }

      // Check if already requested
      const { data: existingRequest } = await supabase
        .from('group_join_requests')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existingRequest) {
        throw new Error('You already have a pending request for this group');
      }

      const { error } = await supabase
        .from('group_join_requests')
        .insert([{
          group_id: group.id,
          user_id: user.id,
          message: message || null
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-join-requests'] });
      toast({
        title: "Join request sent",
        description: "Your request to join the group has been sent to administrators."
      });
    },
    onError: (error) => {
      toast({
        title: "Error sending request",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Approve/reject join request
  const handleJoinRequest = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'approve' | 'reject' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const { data: request, error: requestError } = await supabase
        .from('group_join_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError || !request) throw new Error('Request not found');

      if (action === 'approve') {
        // Add membership
        const { error: membershipError } = await supabase
          .from('group_memberships')
          .insert([{
            group_id: request.group_id,
            user_id: request.user_id,
            role: 'member'
          }]);

        if (membershipError) throw membershipError;
      }

      // Update request status
      const { error } = await supabase
        .from('group_join_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['group-join-requests'] });
      queryClient.invalidateQueries({ queryKey: ['group-memberships'] });
      toast({
        title: action === 'approve' ? "Request approved" : "Request rejected",
        description: `The join request has been ${action}d.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error handling request",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    groups,
    memberships,
    joinRequests,
    isLoading: groupsLoading || membershipsLoading || requestsLoading,
    createGroup,
    joinGroupByCode,
    requestJoinGroup,
    handleJoinRequest
  };
}