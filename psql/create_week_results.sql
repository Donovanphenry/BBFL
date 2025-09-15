CREATE TABLE public.week_results (
  id bigserial PRIMARY KEY,                 -- optional surrogate key
  user_id uuid references auth.users(id) ON DELETE CASCADE,
  week_number INT NOT NULL,
  week_type text NOT NULL,
  correct_predictions INT DEFAULT 0,
  incorrect_predictions INT DEFAULT 0,
  position INT,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Optional: enforce uniqueness for a user/week/week_type combination
  UNIQUE(user_id, week_number, week_type)
);
