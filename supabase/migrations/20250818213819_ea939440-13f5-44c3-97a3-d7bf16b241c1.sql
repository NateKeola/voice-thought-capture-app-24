-- Fix security issues: Add proper search_path to functions

-- Update the generate_invite_code function with proper search_path
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN upper(substring(md5(random()::text), 1, 8));
END;
$$;

-- Update the existing update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;