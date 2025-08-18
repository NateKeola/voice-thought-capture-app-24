-- Create collaborative groups table
CREATE TABLE public.collaboration_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  invite_code text UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on groups
ALTER TABLE public.collaboration_groups ENABLE ROW LEVEL SECURITY;

-- Create group membership table
CREATE TABLE public.group_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.collaboration_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' NOT NULL CHECK (role IN ('admin', 'member')),
  joined_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(group_id, user_id)
);

-- Enable RLS on memberships
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- Create group join requests table
CREATE TABLE public.group_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.collaboration_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  message text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  UNIQUE(group_id, user_id)
);

-- Enable RLS on join requests
ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

-- Create shared relationships table with deal value and metrics
CREATE TABLE public.shared_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.collaboration_groups(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  notes text,
  type text NOT NULL,
  deal_value decimal(10,2),
  important_metrics jsonb DEFAULT '{}',
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  last_interaction timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on shared relationships
ALTER TABLE public.shared_relationships ENABLE ROW LEVEL SECURITY;

-- Helper function to generate unique invite codes
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substring(md5(random()::text), 1, 8));
END;
$$ LANGUAGE plpgsql;

-- RLS Policies

-- Groups: Users can view groups they're members of or created
CREATE POLICY "Users can view their groups" 
ON public.collaboration_groups 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.group_memberships 
    WHERE group_id = collaboration_groups.id AND user_id = auth.uid()
  )
);

-- Users can create groups
CREATE POLICY "Users can create groups" 
ON public.collaboration_groups 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Group creators and admins can update groups
CREATE POLICY "Admins can update groups" 
ON public.collaboration_groups 
FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.group_memberships 
    WHERE group_id = collaboration_groups.id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- Memberships: Users can view memberships for their groups
CREATE POLICY "Users can view group memberships" 
ON public.group_memberships 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.group_memberships gm 
    WHERE gm.group_id = group_memberships.group_id AND gm.user_id = auth.uid()
  )
);

-- Users can join groups (insert membership)
CREATE POLICY "Users can join groups" 
ON public.group_memberships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can manage memberships
CREATE POLICY "Admins can manage memberships" 
ON public.group_memberships 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships gm 
    WHERE gm.group_id = group_memberships.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
  )
);

-- Join requests: Users can view requests for groups they're in
CREATE POLICY "Users can view join requests for their groups" 
ON public.group_join_requests 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.group_memberships 
    WHERE group_id = group_join_requests.group_id AND user_id = auth.uid()
  )
);

-- Users can create join requests
CREATE POLICY "Users can create join requests" 
ON public.group_join_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can manage join requests
CREATE POLICY "Admins can manage join requests" 
ON public.group_join_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships 
    WHERE group_id = group_join_requests.group_id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- Shared relationships: Group members can manage shared relationships
CREATE POLICY "Group members can view shared relationships" 
ON public.shared_relationships 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships 
    WHERE group_id = shared_relationships.group_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Group members can add shared relationships" 
ON public.shared_relationships 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_memberships 
    WHERE group_id = shared_relationships.group_id AND user_id = auth.uid()
  ) AND auth.uid() = added_by
);

CREATE POLICY "Group members can update shared relationships" 
ON public.shared_relationships 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships 
    WHERE group_id = shared_relationships.group_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Group members can delete shared relationships" 
ON public.shared_relationships 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships 
    WHERE group_id = shared_relationships.group_id AND user_id = auth.uid()
  )
);

-- Triggers for updated_at columns
CREATE TRIGGER update_collaboration_groups_updated_at
  BEFORE UPDATE ON public.collaboration_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shared_relationships_updated_at
  BEFORE UPDATE ON public.shared_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();