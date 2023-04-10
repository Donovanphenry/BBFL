import {
  useEffect,
  useState
} from 'react';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import {Matchup} from '../Matchup';

import {
  Button
} from '@mui/material';

import {
  get_fixtures
} from '../../Utils/espn-api-parser.ts';

import { getNHLPlayoffTeams } from '../../Utils/nhl-api-parser.ts'

import './Picks.css';

getNHLPlayoffTeams();

const Picks = ({username, players, picks, setPicks}) => {
  const [fixtures, setFixtures] = useState([]);
  const [league, setLeague] = useState('NFL');

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

  const submit_picks = () => {
    // Make endpoint call
    const winners = new Set();
    const losers = new Set();

    for (const fixture_idx in fixtures)
    {
      const fixture = fixtures[fixture_idx];
      for (const team in fixture.competitors)
      {
        const team_name = fixture.competitors[team].name;
        if (fixture.competitors[team].pick === 'win')
          winners.add(team_name);
        if (fixture.competitors[team].pick === 'lose')
          losers.add(team_name);
      }
    }

    const picks = {
      winners: winners,
      losers: losers
    };
    players[username].picks = picks;

    const players_json = JSON.stringify(players);
    localStorage.setItem('players', players_json);
  }

  return fixtures && (
    <div className = 'container'>
      <FormControl className = 'league-select' variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel sx={{color: 'inherit'}}>League</InputLabel>
        <Select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          label="League"
          className='league-holster'
          sx={{color: 'inherit'}}
        >
          <MenuItem value="" className='league-option'>
            <em>None</em>
          </MenuItem>
          <MenuItem value={'NBA'} className='league-option'>NBA</MenuItem>
          <MenuItem value={'NFL'} className='league-option'>NFL</MenuItem>
          <MenuItem value={'NHL'} className='league-option'>NHL</MenuItem>
        </Select>
      </FormControl>

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
  );
};

export default Picks;
