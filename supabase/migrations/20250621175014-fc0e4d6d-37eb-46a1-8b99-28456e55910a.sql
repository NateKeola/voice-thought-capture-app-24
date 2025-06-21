
-- Achievement Progress Table
CREATE TABLE public.achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  current_progress INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Performance indexes
CREATE INDEX idx_achievement_progress_user_id ON achievement_progress(user_id);
CREATE INDEX idx_achievement_progress_unlocked ON achievement_progress(unlocked);

-- Enable Row Level Security
ALTER TABLE public.achievement_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievement_progress
CREATE POLICY "Users can view their own achievement progress" 
  ON public.achievement_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievement progress" 
  ON public.achievement_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievement progress" 
  ON public.achievement_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to trigger achievement progress updates
CREATE OR REPLACE FUNCTION public.update_achievement_progress(
  p_user_id UUID,
  p_achievement_id TEXT,
  p_progress_increment INTEGER DEFAULT 1,
  p_target_progress INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_record RECORD;
  new_progress INTEGER;
  newly_unlocked BOOLEAN := FALSE;
BEGIN
  -- Get current progress or create new record
  SELECT * INTO current_record 
  FROM public.achievement_progress 
  WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
  
  IF current_record IS NULL THEN
    -- Create new progress record
    new_progress := p_progress_increment;
    newly_unlocked := (new_progress >= p_target_progress);
    
    INSERT INTO public.achievement_progress (
      user_id, 
      achievement_id, 
      current_progress, 
      unlocked, 
      unlocked_at,
      last_updated
    ) VALUES (
      p_user_id, 
      p_achievement_id, 
      new_progress, 
      newly_unlocked,
      CASE WHEN newly_unlocked THEN NOW() ELSE NULL END,
      NOW()
    );
  ELSE
    -- Update existing progress
    IF NOT current_record.unlocked THEN
      new_progress := current_record.current_progress + p_progress_increment;
      newly_unlocked := (new_progress >= p_target_progress);
      
      UPDATE public.achievement_progress 
      SET 
        current_progress = new_progress,
        unlocked = newly_unlocked,
        unlocked_at = CASE WHEN newly_unlocked THEN NOW() ELSE unlocked_at END,
        last_updated = NOW()
      WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
    END IF;
  END IF;
  
  RETURN newly_unlocked;
END;
$$;
