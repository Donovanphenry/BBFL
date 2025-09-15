-- Ça c'est un putain de bordel :'(
-- Note that you must enable the HTTP extensin
-- in supabase:
-- https://supabase.com/dashboard/project/<project_key>/database/extensions
CREATE OR REPLACE FUNCTION update_week_results()
returns void language plpgsql as $$
DECLARE
    array_length int;
    correct_count int;
    curr_correct_count int;
    curr_incorrect_count int;
    curr_week int;
    curr_week_type int;
    data json;
    event json;
    events json;
    incorrect_count int;
    pick_num int;
    prev_week int;
    ref text;
    user_record RECORD;
    winner_array text[] := ARRAY[]::text[];
    winner text;
    winning_team text;
BEGIN
    -- Get current week data
    SELECT content::json->>'season'
    INTO data
    FROM http_get('https://sports.core.api.espn.com/v2/sports/football/leagues/nfl');

    curr_week := (data->'type'->'week'->>'number')::int;
    prev_week := curr_week - 1;

    curr_week_type := (data->'type'->>'type')::int;

    -- Fetch events for the previous week
    SELECT content::json->>'items'
    INTO data
    FROM http_get('http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2024/types/1/weeks/' || prev_week || '/events?lang=en&region=us');
    events := data;
    array_length := json_array_length(events);

    -- Process each event to determine the winner
    FOR pick_num IN 0..(array_length - 1)
    LOOP
        event := events->pick_num;
        ref := (event->>'$ref');

        SELECT content::json->'competitions'->>0
        INTO data
        FROM http_get(ref);

        IF (data->'competitors'->0->>'winner')::boolean THEN
            winner := data->'competitors'->0->>'homeAway';
        ELSE
            winner := data->'competitors'->1->>'homeAway';
        END IF;

        winner_array := array_append(winner_array, winner);
    END LOOP;

    -- Create a temporary table to store user predictions and correct/incorrect counts
    CREATE TEMP TABLE temp_user_predictions AS
    SELECT id AS user_id, 0 AS correct_count, 0 AS incorrect_count
    FROM auth.users;

    -- Iterate through all users
    FOR user_record IN SELECT * FROM auth.users
    LOOP
      curr_correct_count := 0;
      curr_incorrect_count := 0;

      -- Iterate through each prediction
      FOR pick_num IN 0 .. array_length(winner_array, 1) - 1
      LOOP
        winning_team := winner_array[pick_num]::varchar;

        IF EXISTS (
          SELECT 1
          FROM user_picks
          WHERE user_picks.user_id = user_record.id
          AND user_picks.pick_number = pick_num::integer
          AND user_picks.week_number = curr_week::integer
          AND user_picks.week_type = week_type::integer
          AND user_picks.selected_team = REPLACE(winning_team, '"', '')
        ) THEN
          curr_correct_count := curr_correct_count + 1;
        ELSE
          curr_incorrect_count := curr_incorrect_count + 1;
        END IF;
      END LOOP;

      -- Update correct count
      UPDATE temp_user_predictions
      SET correct_count = curr_correct_count
      WHERE user_id = user_record.id;

      -- Update incorrect count
      UPDATE temp_user_predictions
      SET incorrect_count = curr_incorrect_count
      WHERE user_id = user_record.id;
    END LOOP;

    -- Insert into week_results with correct rankings, and incorrect predictions
    INSERT INTO week_results (user_id, week_number, week_type, correct_predictions, incorrect_predictions, position)
    SELECT
      user_id,
      curr_week,
      curr_week_type,
      temp_user_predictions.correct_count,
      temp_user_predictions.incorrect_count,
      RANK() OVER (ORDER BY temp_user_predictions.correct_count DESC) AS position
    FROM temp_user_predictions
    ORDER BY temp_user_predictions.correct_count DESC;

    -- Drop the temporary table
    DROP TABLE temp_user_predictions;

END;
$$
