import React, { useState, useEffect } from 'react';
import {Matchup} from '../Matchup';
import {
  Alert,
  Button,
  Snackbar,
} from '@mui/material';

import {
  get_user_fixtures
} from '../../Utils/espn-api-parser.ts';

import './NFL.css';

const NFL = (props) => {
  const [
    fixtures,
    setFixtures
  ] = useState([]);

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
    supabase,
    user,
    weekId,
    weekType,
  } = props;

  const pick_submission_status = lateMsg ? 'error' : 'success';

  useEffect(() => {
    const setupInterval = async () => {
      const refresh_delay = await get_user_fixtures(setFixtures, supabase);

      if (refresh_delay) {
        const intervalId = setInterval(() => {
          if (refresh_delay !== null) {
            get_user_fixtures(setFixtures, supabase);
          }
        }, refresh_delay);

        return () => clearInterval(intervalId);
      }
    }

    setupInterval();
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

    const old_picks = [];

    const set_old_picks = (fixtures) => {
      for (let i = 0; i < fixtures.length; ++i) {
        old_picks[i] = fixtures[i];
      }
    };
    await get_user_fixtures(set_old_picks, supabase);

    if (old_picks.length !== fixtures.length) {
      console.error(`old_picks.length (${old_picks.length}) !== fixtures.length (${fixtures.length})`);
      return;
    }

    const diff_picks = new Set([]);
    for (let i = 0; i < fixtures.length; ++i) {
      if (old_picks[i].competitors.away.pick !== fixtures[i].competitors.away.pick) {
        diff_picks.add(i);
      }
    }

    let lateFound = false;

    for (const fixture_idx in fixtures)
    {
      const fixture = fixtures[fixture_idx];
      if (diff_picks.has(fixture_idx) && is_late_pick(fixture.kickoff_time)){
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
    setLateMsg(lateFound);

    let pick_type = process.env.NODE_ENV === 'development' ? "dev_user_picks" : "user_picks"

    const upsert_res = await supabase
     .from(pick_type)
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
    const user_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const kickoff_day = new Intl.DateTimeFormat('en-US', { weekday: 'long', user_timezone }).format(kickoff_date);
    const curr_date_la = new Date(new Date().toLocaleString("en-US", {
      timeZone: user_timezone,
    }));

    const [SUNDAY, MONDAY, SATURDAY] = [0, 1, 6];
    const isolated_days = new Set(['Wednesday', 'Thursday', 'Friday']);
    const combined_days = new Set([SUNDAY, MONDAY, SATURDAY]);
    const earliest = {};

    let earliest_combined_fixture_date = curr_date_la;
    for (const fixture of fixtures)
    {
      const fixture_date_la = new Date(new Date(fixture.kickoff_time).toLocaleString("en-US", {
        timeZone: user_timezone,
      }));
      const fixture_kickoff_day = new Intl.DateTimeFormat(
        'en-US',
        {
          weekday: 'long',
          user_timezone
        }
      ).format(fixture_date_la);
      let earliest_key = 'Rest';
      if (isolated_days.has(fixture_kickoff_day)) {
        earliest_key = fixture_kickoff_day;
      }

      if (!earliest[earliest_key] || fixture_date_la < earliest[earliest_key]) {
        earliest[earliest_key] = fixture_date_la;
      }

      if (combined_days.has(fixture_date_la.getDay()) && fixture_date_la < earliest_combined_fixture_date)
      {
        earliest_combined_fixture_date = fixture_date_la;
      }
    }

    let earliest_key2 = 'Rest';
    if (isolated_days.has(kickoff_day)) {
      earliest_key2 = kickoff_day
    }
    if (curr_date_la <= earliest[earliest_key2])
      return false;
    return true;
  };

  return fixtures &&
    <div className = 'container'>
      <div className = 'matches-container'>
        {
          fixtures.map((match, match_index) => <Matchup is_late_pick = {is_late_pick} key = {match_index} match_index = {match_index} fixtures = {fixtures} setFixtures = {setFixtures} match = {match} />)
        }
      </div>
      <Snackbar
        open={hungry}
        anchorOrigin={{vertical:'top', horizontal:'center'}}
        onClose={() => setHungry(false)}
        autoHideDuration={duration}
      >
        <Alert
          severity={pick_submission_status}
          variant='filled'
        >
          {display_message(lateMsg)}
        </Alert>
      </Snackbar>
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
