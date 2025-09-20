-- Ça c'est un putain de bordel :'(
-- Note that you must enable the HTTP extensin
-- in supabase:
-- https://supabase.com/dashboard/project/<project_key>/database/extensions
CREATE OR REPLACE FUNCTION update_week_results()
returns text language plpgsql as $$
DECLARE
    array_length int;
    correct_count int;
    curr_correct_count int;
    curr_incorrect_count int;
    curr_week int;
    curr_week_type int;
    curr_year int;
    data json;
    event json;
    events json;
    incorrect_count int;
    pick_num int;
    prev_week int;
    prev_week_type int;
    event_ref text;
    user_record RECORD;
    winner_array text[] := ARRAY[]::text[];
    winner text;
    winning_team text;

    kickoff_text text;
    kickoff_ts timestamptz;
    away_comp json;
    team_ref text;
    team_data json;
    team_name text;
BEGIN
    -- Get current week data
    SELECT content::json->>'season'
    INTO data
    FROM http_get('https://sports.core.api.espn.com/v2/sports/football/leagues/nfl');

    curr_year = (data->>'year')::int;

    curr_week := (data->'type'->'week'->>'number')::int;
    prev_week := curr_week - 1;

    curr_week_type := (data->'type'->>'type')::int;
    prev_week_type := curr_week_type;

    if curr_week = 1 THEN
      prev_week_type := prev_week_type - 1;
    END IF;

    IF prev_week_type < 2 THEN
      RAISE NOTICE 'prev_week_type is less than 2. Season has not started.';
      RETURN 'Failed.';
    END IF;

    -- Fetch events for the previous week
    SELECT content::json->>'items'
    INTO data
    FROM http_get('http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/' || curr_year || '/types/' || prev_week_type || '/weeks/' || prev_week || '/events?lang=en&region=us');
    events := data;
    array_length := json_array_length(events);

    CREATE TEMP TABLE tmp_events (
      idx int,
      ref text,
      comp json,
      kickoff timestamptz,
      away_name text
    ) ON COMMIT DROP;

    CREATE TEMP TABLE tmp_teams (
      ref text PRIMARY KEY,
      name text
    ) ON COMMIT DROP;

    -- Process each event to determine the winner
    FOR pick_num IN 0..(array_length - 1)
    LOOP
      event := events->pick_num;
      event_ref := (event->>'$ref');

      SELECT content::json->'competitions'->>0
      INTO data
      FROM http_get(event_ref);

      kickoff_text := data->>'date';

      -- attempt to cast to timestamptz; if parsing fails leave NULL
      kickoff_ts := NULL;
      IF kickoff_text IS NOT NULL AND kickoff_text <> '' THEN
        BEGIN
          kickoff_ts := kickoff_text::timestamptz;
        EXCEPTION WHEN others THEN
          -- keep kickoff_ts null on parse errors
          RETURN 'FAIL';
          kickoff_ts := NULL;
        END;
      END IF;

      -- get the away team's display/name (robust fallback)
      away_comp := NULL;
      SELECT elem
      INTO away_comp
      FROM json_array_elements(data->'competitors') AS elem
      WHERE elem->>'homeAway' = 'away'
      LIMIT 1;

      team_name := NULL;

      IF away_comp IS NOT NULL THEN
        -- see if the competitor has a team $ref we need to resolve
        team_ref := away_comp->'team'->>'$ref';

        IF team_ref IS NOT NULL AND team_ref <> '' THEN
          -- check cache first
          SELECT name INTO team_name FROM tmp_teams WHERE ref = team_ref;

          IF team_name IS NULL THEN
            -- fetch team info (guard with exception so one failing team doesn't blow up the whole job)
            BEGIN
              SELECT content::json INTO team_data FROM http_get(team_ref);
              team_name := team_data->>'displayName';
            EXCEPTION WHEN others THEN
              team_name := NULL;
            END;

            -- cache it (avoid duplicates)
            BEGIN
              INSERT INTO tmp_teams (ref, name) VALUES (team_ref, team_name);
            EXCEPTION WHEN unique_violation THEN
              -- ignore race / duplicate insert
            END;
          END IF;

        ELSE
          -- no $ref, fall back to embedded name
          team_name := away_comp->'team'->>'displayName';
          IF team_name IS NULL THEN
            team_name := away_comp->'team'->>'name';
          END IF;
        END IF;
      END IF;

      -- insert into tmp_events for sorting later
      INSERT INTO tmp_events (idx, ref, comp, kickoff, away_name)
      VALUES (pick_num, event_ref, data, kickoff_ts, team_name);

    END LOOP;

    -- build winner_array ordered by kickoff then away team name (tie-breaker)
    SELECT array_agg(
      CASE WHEN (comp->'competitors'->0->>'winner')::boolean
           THEN comp->'competitors'->0->>'homeAway'
           ELSE comp->'competitors'->1->>'homeAway'
      END
      ORDER BY kickoff NULLS LAST, COALESCE(away_name, '')
    ) INTO winner_array
    FROM tmp_events;

    IF winner_array IS NULL THEN
      RAISE NOTICE 'No events found to grade.';
      RETURN 'No events';
    END IF;

    -- cleanup (tmp tables were ON COMMIT DROP, but drop explicitly if you like)
    DROP TABLE IF EXISTS tmp_events;
    DROP TABLE IF EXISTS tmp_teams;

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
      FOR pick_num IN 1 .. array_length(winner_array, 1)
      LOOP
        winning_team := winner_array[pick_num]::varchar;

        IF EXISTS (
          SELECT 1
          FROM user_picks
          WHERE user_picks.user_id = user_record.id
          AND user_picks.pick_number = pick_num::integer - 1
          AND user_picks.week_number = prev_week::integer
          AND user_picks.week_type = 2
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
      prev_week,
      prev_week_type,
      temp_user_predictions.correct_count,
      temp_user_predictions.incorrect_count,
      RANK() OVER (ORDER BY temp_user_predictions.correct_count DESC) AS position
    FROM temp_user_predictions
    ORDER BY temp_user_predictions.correct_count DESC;

    -- Drop the temporary table
    DROP TABLE temp_user_predictions;

    RETURN 'Success.';
END;
$$
