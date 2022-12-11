import {
  useEffect,
  useState
} from 'react';

import {Matchup} from '../Matchup';

import {
  Paper,
  Button
} from '@mui/material';

import {
  get_matchups
} from '../../Utils/espn-api-parser.ts';

import './Picks.css';

const Picks = () => {
  const [matchups, setMatchups] = useState([]);

  useEffect(() => {
   get_matchups(setMatchups);
  }, []);

  const cancel_picks = () => {
    const matchups_copy = JSON.parse(JSON.stringify(matchups));

    for (const matchup_idx in matchups_copy)
    {
      const matchup = matchups_copy[matchup_idx];
      for (const team in matchup)
        matchup[team].pick = 'none';
    }

    setMatchups(matchups_copy);
  };

  const submit_picks = () => {
    // Make endpoint call
    console.log('submit stuff');
  }

  return matchups && (
    <div className = 'container'>
      <div className = 'matches-container'>
        {
          matchups.map((match, match_index) => <Matchup key = {match_index} match_index = {match_index} matchups = {matchups} setMatchups = {setMatchups} match = {match} />)
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
  );
};

export default Picks;
