create table user_picks (
  id bigserial primary key,
  user_id uuid references auth.users(id),
  week_number int not null,
  week_type text not null,
  pick_number int not null,
  selected_team text not null,
  timestamp_selected timestamptz default now(),

  -- enforce uniqueness on the 4-tuple
  unique (user_id, week_number, week_type, pick_number)
);
