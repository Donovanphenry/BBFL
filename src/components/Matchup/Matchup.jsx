import {
  useState
} from 'react';

import {
  Paper,
  Typography,
  Card
} from '@mui/material';

import './Matchup.css';

const Matchup = ({match, match_index, matchups, setMatchups}) => {
  const [winner, setWinner] = useState(null);

  const changeWinner = (team_selections) => {
    const matchups_copy = JSON.parse(JSON.stringify(matchups));
    const match_copy = matchups_copy[match_index];

    for (const {team, pick} of team_selections)
    {
      const curr_pick = match_copy[team]['pick'];
      if (pick == curr_pick)
        match_copy[team]['pick'] = 'none';
      else
        match_copy[team]['pick'] = pick;
    }

    setMatchups(matchups_copy);
  };

  const get_team_class = (team) => {
    if (team.pick == 'none')
      return '';
    if (team.pick === 'win')
      return 'winning-team';
    return 'losing-team';
  };

  return (
    <Paper className = 'match-container' elevation = {3}>
      <div className = 'team-div' onClick = {() => changeWinner([{'team': 'home', 'pick': 'win'}, {'team': 'away', 'pick': 'lose'}])}>
        <img className = 'team-picture' src = {match.home.pic} />

        <Typography className = {get_team_class(match.home)}>
          {match.home.name} ({match.home.record})
        </Typography>
      </div>

      <div className = 'team-div' onClick = {() => changeWinner([{'team': 'home', 'pick': 'lose'}, {'team': 'away', 'pick': 'win'}])}>
        <img className = 'team-picture' src = {match.away.pic} />

        <Typography className = {get_team_class(match.away)}>
          {match.away.name} ({match.away.record})
        </Typography>
      </div>
    </Paper>
  )
};

export default Matchup;
