-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  bio text DEFAULT '',
  avatar_url text,
  location text DEFAULT '',
  country text DEFAULT '',
  base_currency text DEFAULT 'NGN',
  rating numeric(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  rating_count integer DEFAULT 0 CHECK (rating_count >= 0),
  reputation_score integer DEFAULT 0 CHECK (reputation_score >= 0),
  verification_tier smallint DEFAULT 1 CHECK (verification_tier IN (1, 2, 3)),
  helps_given integer DEFAULT 0 CHECK (helps_given >= 0),
  helps_received integer DEFAULT 0 CHECK (helps_received >= 0),
  success_rate integer DEFAULT 100 CHECK (success_rate >= 0 AND success_rate <= 100),
  on_time_rate integer DEFAULT 100 CHECK (on_time_rate >= 0 AND on_time_rate <= 100),
  response_time text DEFAULT '< 1 hour',
  skills text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Create index for faster lookups
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_is_featured ON public.profiles(is_featured) WHERE is_featured = true;

-- Updated timestamp trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();