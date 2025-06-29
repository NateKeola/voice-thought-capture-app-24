
-- Enable RLS on interests table if not already enabled
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view interests" ON public.interests;
DROP POLICY IF EXISTS "Authenticated users can create interests" ON public.interests;

-- Create policy to allow anyone to view interests
CREATE POLICY "Anyone can view interests" 
  ON public.interests 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy to allow authenticated users to create new interests
CREATE POLICY "Authenticated users can create interests" 
  ON public.interests 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);
