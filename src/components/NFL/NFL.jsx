import React, { useState, useEffect } from 'react';
import {Matchup} from '../Matchup';
import {
  Button,
  Snackbar,
} from '@mui/material';

import {
  get_user_fixtures
} from '../../Utils/espn-api-parser.ts';
import './NFL.css';

const NFL = (props) => {
  const [fixtures, setFixtures] = useState([]);
  const duration = 2000;
  const [
    hungry,
    setHungry
   ] = useState(false);

   const [
    lateMsg,
    setLateMsg
   ] = useState(false);

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

    let lateFound = false;

    for (const fixture_idx in fixtures)
    {
      const fixture = fixtures[fixture_idx];
      if (is_late_pick(fixture.kickoff_time)){
        lateFound = true;
        continue;
      }
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
    setLateMsg(lateFound);s

    const upsert_res = await supabase
     .from("user_picks")
     .upsert(
       picks,
       {
         onConflict: ["user_id", "week_number", "week_type", "pick_number"],
         returning: ["*"],
       }
     );
    setHungry(true);
  }

  const display_message = (lateMsg) => {
    return lateMsg ? "One or more picks were marked as late" : "All pick successfully submitted";
  }

  const is_late_pick = (kickoff_time) => {
    const kickoff_date = new Date(kickoff_time);
    const timeZone = 'America/Los_Angeles';
    const kickoff_day = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone }).format(kickoff_date);
    const curr_date_la = new Date(new Date().toLocaleString("en-US", {timeZone: timeZone}));

    const [SUNDAY, MONDAY, SATURDAY] = [0, 1, 6];
    const isolated_days = new Set(['Thursday', 'Friday']);
    const combined_days = new Set([SUNDAY, MONDAY, SATURDAY]);

    if (isolated_days.has(kickoff_day) && curr_date_la <= kickoff_date)
      return false;
    if (isolated_days.has(kickoff_day))
      return true;

    let earliest_combined_fixture_date = curr_date_la;
    for (const fixture of fixtures)
    {
      const fixture_date_la = new Date(new Date(fixture.kickoff_time).toLocaleString("en-US", { timeZone: timeZone }));

      if (combined_days.has(fixture_date_la.getDay()) && fixture_date_la < earliest_combined_fixture_date)
      {
        earliest_combined_fixture_date = fixture_date_la;
      }
    }

    if (curr_date_la <= earliest_combined_fixture_date)
      return false;
    return true;
  };

  return fixtures &&
    <div className = 'container'>
      <div className = 'matches-container'>
        {
          fixtures.map((match, match_index) => <Matchup is_late_pick = {is_late_pick} key = {match_index} match_index = {match_index} fixtures = {fixtures} setFixtures = {setFixtures} match = {match} players = {players}/>)
        }
      </div>
      <Snackbar
        open={hungry}
        message={display_message(lateMsg)}
        anchorOrigin={{vertical:'top', horizontal:'center'}}
        onClose={() => setHungry(false)}
        autoHideDuration={duration}
        ContentProps={{
          className: `snackbarSettings ${lateMsg ? "late" : "onTime"}`
        }}


      />
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
