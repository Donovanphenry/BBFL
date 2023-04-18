import {
  useState,
  useEffect
} from 'react';

import { Bracket, BracketGame } from 'react-tournament-bracket';
import { SingleEliminationBracket, Match } from '@g-loot/react-tournament-brackets';
import {
  Button
} from '@mui/material';


import {
  Paper,
  Typography,
} from '@mui/material';

import './NHL.css';

import { getNHLPlayoffTeams } from '../../Utils/nhl-api-parser.ts';

const TOTAL_ROUNDS = 4;

const get_next_match = (gid) => {
  if (gid === 1)
    return null;
  return Math.floor(gid / 2);
}

const get_round_name = (gid) => {
  if (gid === 1)
    return 'Finals';
  if (gid >= 2 && gid <= 3)
    return `Round 3 - Match ${gid - 2}`;
  if (gid >= 4 && gid <= 7)
    return `Round 2 - Match ${gid - 4}`;
  if (gid >= 8 && gid <= 15)
    return `Round 1 - Match ${gid - 8}`;
}

const createNHLBracket = (teams) => {
  let games = [];

  let gid = 15;
  for (const conference in teams)
  {
    let left = 0;
    let right = teams[conference].length-1;

    while (left < right)
    {
      const home = teams[conference][left];
      const away = teams[conference][right];

      const game = {
        id: gid,
        name: get_round_name(gid),
        nextMatchId: get_next_match(gid),
        tournamentRoundText: "1",
        state: "SCHEDULED",
        start_time: '2021-05-30',
        participants: [
          {
            id: home.id,
            resultText: null,
            isWinner: false,
            name: home.name,
            round_id: gid,
          },
          {
            id: away.id,
            resultText: null,
            isWinner: false,
            name: away.name,
            round_id: gid,
          }
        ]
      };

      games.push(game);

      left += 1;
      right -= 1;
      gid -= 1;
    }
  }

  let game_source = 0;
  for (let round_num = 1; round_num < TOTAL_ROUNDS; ++round_num)
  {
    const temp_games = [...games];

    while (game_source < games.length)
    {
      const game = {
        id: gid,
        name: get_round_name(gid),
        nextMatchId: get_next_match(gid),
        state: "SCHEDULED",
        start_time: '2021-05-30',
        tournamentRoundText: "2",
        participants: []
      };
      gid -= 1;
      game_source += 2;
      temp_games.push(game);
    }

    games = temp_games
  }

  if (games.length <= 0)
    return [];

  return games;
}

function deepCopy(obj) {
  let copy;

  // Handle arrays
  if (Array.isArray(obj)) {
    copy = [];
    for (let i = 0; i < obj.length; i++) {
      copy[i] = deepCopy(obj[i]);
    }
    return copy;
  }

  // Handle objects
  if (typeof obj === 'object' && obj !== null) {
    copy = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        copy[key] = deepCopy(obj[key]);
      }
    }
    return copy;
  }

  // Handle primitives and functions
  return obj;
}

function NHL() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchTeams1 = async () => {
      try {
        const response = await fetch("data/NHLPlayoffs.json");
        const data = await response.json();
        console.log("data = ", data);
        setMatches(data);
      }
      catch (error) {
        console.error('Error: ', error);
      }
    }

    fetchTeams1();
  }, []);

  const cancel_picks = async () => {
    try {
      const response = await fetch("data/NHLPlayoffs.json");
      const data = await response.json();
      console.log("data = ", data);
      setMatches(data);
    }
    catch (error) {
      console.error('Error: ', error);
    }
  };

  const submit_picks = () => {
    // Make endpoint call
    console.log('Can you do sum for me');
  }

  const isCurrentMatch = (participants, ) => {};

  const makeWinner = (party, isWinner) => {
    const updated_matches = deepCopy(matches);
    for (const match_id in updated_matches)
    {
      const match = updated_matches[match_id];
      const next_match = updated_matches.find(fixture => fixture.id === match.nextMatchId);
      const participants = updated_matches[match_id].participants;

      if (participants.length <= 1 || ![participants[0].name, participants[1].name].includes(party.name)
        || match.id !== party.round_id)
        continue;

      if (party.isWinner)
      {
        next_match.participants = next_match.participants.filter(participant => party.id !== participant.id);
        if (participants[0].id === party.id)
          participants[0].isWinner = false;
        else
          participants[1].isWinner = false;

        break;
      }

      const [team1, team2] = participants;
      let [winner, loser] = [null, null];
      if (team1.name === party.name && party.isWinner)
        [winner, loser] = [team2, team1];
      else if (team2.name === party.name && party.isWinner)
        [winner, loser] = [team1, team2];
      else if (team1.name === party.name)
        [winner, loser] = [team1, team2];
      else
        [winner, loser] = [team2, team1];

      winner.isWinner = true;
      loser.isWinner = false;
      [winner, loser] = [{...winner}, {...loser}];
      winner.isWinner = false;

      if (next_match === undefined)
        break;

      winner.round_id = next_match.id;

      next_match.participants = next_match.participants.filter(participant => participant.id !== loser.id);

      if (next_match.participants.length === 0 || (next_match.participants.length === 1
        && next_match.participants[0].seed < winner.seed))
      {
        next_match.participants.push(winner)
      }
      else if (next_match.participants.length === 1)
        [next_match.participants[0], next_match.participants[1]] = [winner, next_match.participants[0]];
      else if (next_match.participants[0].id === loser.id && next_match.participants[1].seed < winner.seed)
        [next_match.participants[0], next_match.participants[1]] = [next_match.participants[1], winner];
      else if (next_match.participants[1].id === loser.id)
        next_match.participants[1] = winner;

      break;
    }

    setMatches(updated_matches);
  };

  if (!matches)
    return <div>Loading...</div>;


  if (matches.length <= 0)
    return <div>Loading...</div>;

  return (
  <>
    <SingleEliminationBracket
      matches={matches}
      matchComponent={Match}
      onPartyClick={makeWinner}
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
  </>
  );
}

export default NHL;
