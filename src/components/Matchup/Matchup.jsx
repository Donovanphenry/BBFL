import {
  useState
} from 'react';

import {
  Paper,
  Typography,
  Card
} from '@mui/material';

import './Matchup.css';

const Matchup = ({players, username, match, match_index, fixtures, setFixtures}) => {
  const [winner, setWinner] = useState(null);

  const changeWinner = (team_selections) => {
    const fixtures_copy = JSON.parse(JSON.stringify(fixtures));
    const fixture_copy = fixtures_copy[match_index];

    if (is_late_pick(fixture_copy.kickoff_time))
      return;

    for (const {team, pick} of team_selections)
    {
      const curr_pick = fixture_copy.competitors[team]['pick'];
      if (pick == curr_pick)
        fixture_copy.competitors[team]['pick'] = 'none';
      else
        fixture_copy.competitors[team]['pick'] = pick;
    }

    setFixtures(fixtures_copy);
  };

  const get_team_class = (team) => {
    if (team.pick == 'none')
      return '';
    if (team.pick === 'win')
      return 'winning-team';
    return 'losing-team';
  };

  const get_readable_kickoff_time = (kickoff_time) => {
    const date = new Date(kickoff_time);

    const date_time_format = new Intl.DateTimeFormat('en', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'America/Los_Angeles',
    });

    return date_time_format.format(date) + ' PST';
  };

  const is_late_pick = (kickoff_time) => {
    const kickoff_date = new Date(kickoff_time);
    const kickoff_day = kickoff_date.getDay();
    const curr_date = new Date();

    if (kickoff_day === 4 && curr_date < kickoff_date)
      return false;
    if (kickoff_day === 4)
      return true;
    if (kickoff_day === 1 && curr_date < kickoff_date)
      return false
    if (kickoff_day === 1)
      return true;

    let earliest_sunday_fixture_date = null;
    for (const fixture of fixtures)
    {
      const fixture_date = new Date(fixture.kickoff_time);

      if (fixture_date.getDay() === 0)
      {
        earliest_sunday_fixture_date = fixture_date;
        break;
      }
    }

    if (curr_date < earliest_sunday_fixture_date)
      return false;
    return true;
  };

  return (
    <Paper className = 'match-container' elevation = {3}>
      <div className = 'fixture-container'>
        <div className = 'team-div' onClick = {() => changeWinner([{'team': 'home', 'pick': 'win'}, {'team': 'away', 'pick': 'lose'}])}>
          <img className = 'team-picture' src = {match.competitors.home.pic} />

          <Typography className = {get_team_class(match.competitors.home)}>
            {match.competitors.home.name} ({match.competitors.home.record})
          </Typography>
        </div>

        <div className = 'team-div' onClick = {() => changeWinner([{'team': 'home', 'pick': 'lose'}, {'team': 'away', 'pick': 'win'}])}>
          <img className = 'team-picture' src = {match.competitors.away.pic} />

          <Typography className = {get_team_class(match.competitors.away)}>
            {match.competitors.away.name} ({match.competitors.away.record})
          </Typography>
        </div>
      </div>

      <Typography className = 'kickoff-time' sx = {{fontSize: 14, textDecoration: is_late_pick(match.kickoff_time) ? 'line-through' : 'none'}}>
        {get_readable_kickoff_time(match.kickoff_time)}
      </Typography>
    </Paper>
  )
};

export default Matchup;
