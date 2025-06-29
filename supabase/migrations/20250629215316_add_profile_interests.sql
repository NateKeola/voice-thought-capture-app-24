
-- Create a junction table to link profiles (relationships) with interests
CREATE TABLE IF NOT EXISTS public.profile_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, interest_id)
);

-- Enable RLS
ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view profile interests for their own profiles" 
  ON public.profile_interests 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = profile_interests.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert profile interests for their own profiles" 
  ON public.profile_interests 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = profile_interests.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete profile interests for their own profiles" 
  ON public.profile_interests 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = profile_interests.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );
