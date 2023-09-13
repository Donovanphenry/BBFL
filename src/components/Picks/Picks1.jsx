import {
  useEffect,
  useState
} from 'react';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import {Matchup} from '../Matchup';
import {NFL} from '../NFL';
import {NHL} from '../NHL';
import {NBA} from '../NBA';

import {
  Button
} from '@mui/material';

import {
  get_fixtures
} from '../../Utils/espn-api-parser.ts';

import './Picks.css';

const Picks = ({username, players, picks, setPicks}) => {
  const [fixtures, setFixtures] = useState([]);
  const [league, setLeague] = useState('NFL');
  const leagueComponentMap = {
    'NFL': <NFL players={players} username = {username}/>,
    //'NHL': <NHL players={players} username={username}/>,
    //'NBA': <NBA players={players} username={username}/>
  };

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
        <InputLabel sx={{color: '#4169E1'}}>League</InputLabel>
        <Select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          label="League"
          className='league-holster'
          sx = {{color: '#4169E1'}}
        >
          <MenuItem value="" className='league-option'>
            <em>None</em>
          </MenuItem>
      {/*<MenuItem value={'NBA'} className='league-option'>NBA</MenuItem>*/}
          <MenuItem value={'NFL'} className='league-option'>NFL</MenuItem>
      {/*<MenuItem value={'NHL'} className='league-option'>NHL</MenuItem>*/}
        </Select>
      </FormControl>


    {leagueComponentMap[league]}
    </div>
  );
};

export default Picks;
