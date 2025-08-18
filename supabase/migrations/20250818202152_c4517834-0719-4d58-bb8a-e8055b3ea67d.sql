-- Revert shared relationships structures with CASCADE to remove dependent policies

-- Drop shared groups first to remove policies depending on group_members
DROP TABLE IF EXISTS public.shared_groups CASCADE;

-- Drop shared contacts and its dependent policies
DROP TABLE IF EXISTS public.shared_contacts CASCADE;

-- Drop group members after dependent policies are removed
DROP TABLE IF EXISTS public.group_members CASCADE;

-- Drop invite code helper function
DROP FUNCTION IF EXISTS public.generate_invite_code();
