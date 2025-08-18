-- Revert previously added shared relationships structures
-- Drop dependent/shared tables first, then utility function

-- 1) Drop shared contacts (if exists)
DROP TABLE IF EXISTS public.shared_contacts;

-- 2) Drop group membership table (if exists)
DROP TABLE IF EXISTS public.group_members;

-- 3) Drop shared groups table (if exists)
DROP TABLE IF EXISTS public.shared_groups;

-- 4) Drop invite code helper function (if exists)
DROP FUNCTION IF EXISTS public.generate_invite_code();
