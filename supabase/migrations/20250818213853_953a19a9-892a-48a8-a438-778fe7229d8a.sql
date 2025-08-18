-- Fix the remaining search path issue for update_achievement_progress function
CREATE OR REPLACE FUNCTION public.update_achievement_progress(p_user_id uuid, p_achievement_id text, p_progress_increment integer DEFAULT 1, p_target_progress integer DEFAULT 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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