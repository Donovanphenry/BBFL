CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  team_name TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
