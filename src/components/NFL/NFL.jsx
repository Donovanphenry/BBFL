import React, { useState, useEffect } from 'react';
import {Matchup} from '../Matchup';
import {
  Button
} from '@mui/material';

import {
  get_fixtures
} from '../../Utils/espn-api-parser.ts';

import './NFL.css';

const NFL = (props) => {
  const [fixtures, setFixtures] = useState([]);

  const {
    players,
    supabase,
    userId,
    weekId,
  } = props;

  const user = supabase.auth.getUser();

  useEffect(() => {
   get_fixtures(setFixtures);
  }, []);

  const cancel_picks = () => {
    const fixtures_copy = JSON.parse(JSON.stringify(fixtures));

    for (const matchup_idx in fixtures_copy)
    {
      const matchup = fixtures_copy[matchup_idx];
      for (const team in matchup.competitors)
        matchup.competitors[team].pick = 'none';
    }

    setFixtures(fixtures_copy);
  };

  const submit_picks = async () => {
    // Make endpoint call
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
            game_id: Number(fixture_idx),
            selected_team: team,
            timestamp: submission_time,
            user_id: "14608862-430e-4be1-8b15-bf148e0a769a",
            week_id: weekId,
          }

          picks.push(pick);
        }
      }
    }

    console.log('picks = ', picks);

    const { error } = await supabase
      .from('picks')
      .upsert(picks, {
        onConflict: ['user_id', 'week_id', 'game_id'],
        action: 'update'
      })
      .select();
  }

  const username = 'foobar';

  return fixtures &&
    <div className = 'container'>
      <div className = 'matches-container'>
        {
          fixtures.map((match, match_index) => <Matchup key = {match_index} match_index = {match_index} fixtures = {fixtures} setFixtures = {setFixtures} match = {match} players = {players} username = {username}/>)
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
