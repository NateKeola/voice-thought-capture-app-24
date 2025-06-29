
-- Create a table for storing available interests/hobbies
CREATE TABLE public.interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for user-selected interests
CREATE TABLE public.user_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, interest_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

-- RLS policies for interests (readable by everyone)
CREATE POLICY "Everyone can view interests" 
  ON public.interests 
  FOR SELECT 
  TO authenticated, anon
  USING (true);

-- RLS policies for user_interests (users can only manage their own)
CREATE POLICY "Users can view their own interests" 
  ON public.user_interests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own interests" 
  ON public.user_interests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own interests" 
  ON public.user_interests 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert the predefined interests
INSERT INTO public.interests (name, category) VALUES
-- Sports & Fitness
('Volleyball', 'Sports & Fitness'),
('Surfing', 'Sports & Fitness'),
('Basketball', 'Sports & Fitness'),
('Tennis', 'Sports & Fitness'),
('Rock climbing', 'Sports & Fitness'),
('Hiking', 'Sports & Fitness'),
('Running', 'Sports & Fitness'),
('Yoga', 'Sports & Fitness'),
('Swimming', 'Sports & Fitness'),
('Cycling', 'Sports & Fitness'),
('Golf', 'Sports & Fitness'),
('Soccer', 'Sports & Fitness'),
('Baseball', 'Sports & Fitness'),
('Skiing', 'Sports & Fitness'),
('Snowboarding', 'Sports & Fitness'),
('Martial arts', 'Sports & Fitness'),
('CrossFit', 'Sports & Fitness'),
('Weightlifting', 'Sports & Fitness'),
('Boxing', 'Sports & Fitness'),
('Dancing', 'Sports & Fitness'),

-- Creative Arts
('Cooking', 'Creative Arts'),
('Baking', 'Creative Arts'),
('Photography', 'Creative Arts'),
('Painting', 'Creative Arts'),
('Drawing', 'Creative Arts'),
('Writing', 'Creative Arts'),
('Poetry', 'Creative Arts'),
('Music production', 'Creative Arts'),
('Guitar', 'Creative Arts'),
('Piano', 'Creative Arts'),
('Singing', 'Creative Arts'),
('Pottery', 'Creative Arts'),
('Sculpture', 'Creative Arts'),
('Knitting', 'Creative Arts'),
('Sewing', 'Creative Arts'),
('Woodworking', 'Creative Arts'),
('Jewelry making', 'Creative Arts'),
('Graphic design', 'Creative Arts'),
('Video editing', 'Creative Arts'),
('Calligraphy', 'Creative Arts'),

-- Technology & Learning
('Programming', 'Technology & Learning'),
('Web development', 'Technology & Learning'),
('App development', 'Technology & Learning'),
('Data science', 'Technology & Learning'),
('Machine learning', 'Technology & Learning'),
('Robotics', 'Technology & Learning'),
('3D printing', 'Technology & Learning'),
('Gaming', 'Technology & Learning'),
('Board games', 'Technology & Learning'),
('Chess', 'Technology & Learning'),
('Language learning', 'Technology & Learning'),
('Reading', 'Technology & Learning'),
('Podcasts', 'Technology & Learning'),
('Online courses', 'Technology & Learning'),
('Blogging', 'Technology & Learning'),
('Cryptocurrency', 'Technology & Learning'),
('Investing', 'Technology & Learning'),
('Startups', 'Technology & Learning'),

-- Lifestyle & Social
('Travel', 'Lifestyle & Social'),
('Coffee culture', 'Lifestyle & Social'),
('Wine tasting', 'Lifestyle & Social'),
('Craft beer', 'Lifestyle & Social'),
('Gardening', 'Lifestyle & Social'),
('Home improvement', 'Lifestyle & Social'),
('Interior design', 'Lifestyle & Social'),
('Fashion', 'Lifestyle & Social'),
('Meditation', 'Lifestyle & Social'),
('Mindfulness', 'Lifestyle & Social'),
('Volunteering', 'Lifestyle & Social'),
('Community service', 'Lifestyle & Social'),
('Networking', 'Lifestyle & Social'),
('Public speaking', 'Lifestyle & Social'),
('Book clubs', 'Lifestyle & Social'),
('Movie nights', 'Lifestyle & Social'),
('Concerts', 'Lifestyle & Social'),
('Theater', 'Lifestyle & Social'),
('Art galleries', 'Lifestyle & Social'),
('Museums', 'Lifestyle & Social'),

-- Outdoor & Adventure
('Camping', 'Outdoor & Adventure'),
('Backpacking', 'Outdoor & Adventure'),
('Fishing', 'Outdoor & Adventure'),
('Hunting', 'Outdoor & Adventure'),
('Kayaking', 'Outdoor & Adventure'),
('Sailing', 'Outdoor & Adventure'),
('Mountain biking', 'Outdoor & Adventure'),
('Trail running', 'Outdoor & Adventure'),
('Nature photography', 'Outdoor & Adventure'),
('Bird watching', 'Outdoor & Adventure'),
('Stargazing', 'Outdoor & Adventure'),
('Geocaching', 'Outdoor & Adventure'),
('Scuba diving', 'Outdoor & Adventure'),
('Snorkeling', 'Outdoor & Adventure'),

-- Food & Dining
('Fine dining', 'Food & Dining'),
('Food trucks', 'Food & Dining'),
('Farmers markets', 'Food & Dining'),
('Meal prep', 'Food & Dining'),
('Nutrition', 'Food & Dining'),
('Vegetarian cooking', 'Food & Dining'),
('Vegan lifestyle', 'Food & Dining'),
('BBQ', 'Food & Dining'),
('International cuisine', 'Food & Dining'),
('Food blogging', 'Food & Dining'),
('Restaurant reviews', 'Food & Dining'),
('Cocktail making', 'Food & Dining'),
('Coffee roasting', 'Food & Dining'),
('Tea ceremony', 'Food & Dining');
