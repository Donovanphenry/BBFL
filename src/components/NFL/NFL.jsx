import React, { useState, useEffect } from 'react';
import {Matchup} from '../Matchup';
import {
  Button
} from '@mui/material';

import {
  get_user_fixtures
} from '../../Utils/espn-api-parser.ts';

const NFL = (props) => {
  const [fixtures, setFixtures] = useState([]);

  const {
    players,
    supabase,
    user,
    weekId,
    weekType,
  } = props;

  useEffect(() => {
    get_user_fixtures(setFixtures, supabase);
  }, []);

  const cancel_picks = async () => {
    const fixtures_copy = JSON.parse(JSON.stringify(fixtures));
    get_user_fixtures(setFixtures, supabase);
  };

  const submit_picks = async () => {
    if (!user)
      return;
    const user_id = user.id;

    const submission_time = new Date();
    const picks = [];

    for (const fixture_idx in fixtures)
    {
      const fixture = fixtures[fixture_idx];
      for (const team in fixture.competitors)
      {
        const team_name = fixture.competitors[team].name;
        if (fixture.competitors[team].pick === 'win')
        {
          const pick = {
            pick_number: Number(fixture_idx),
            selected_team: team,
            timestamp_selected: submission_time,
            user_id: user_id,
            week_number: weekId,
            week_type: weekType,
          }

          picks.push(pick);
        }
      }
    }

    const upsert_res = await supabase
     .from("user_picks")
     .upsert(
       picks,
       {
         onConflict: ["user_id", "week_number", "week_type", "pick_number"],
         returning: ["*"],
       }
     );

    window.location.reload();
  }

  return fixtures &&
    <div className = 'container'>
      <div className = 'matches-container'>
        {
          fixtures.map((match, match_index) => <Matchup key = {match_index} match_index = {match_index} fixtures = {fixtures} setFixtures = {setFixtures} match = {match} players = {players}/>)
        }
      </div>

      <div className = 'button-container'>
        <Button
          className = 'select-picks-button'
          variant = 'contained'
          onClick = {cancel_picks}
        >
          Cancel Changes
        </Button>

        <Button
          className = 'select-picks-button'
          variant = 'contained'
          onClick = {submit_picks}
        >
          Submit Picks
        </Button>
      </div>
    </div>
};

export default NFL;
