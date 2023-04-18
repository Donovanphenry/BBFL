import {
  useState
} from 'react';
import { TournamentBracket } from 'react-tournament-bracket';

const playoffData = {
  teams: [
    { name: 'Team A', seed: 1 },
    { name: 'Team B', seed: 2 },
    { name: 'Team C', seed: 3 },
    { name: 'Team D', seed: 4 },
    { name: 'Team E', seed: 5 },
    { name: 'Team F', seed: 6 },
    { name: 'Team G', seed: 7 },
    { name: 'Team H', seed: 8 },
  ],
  results: [
    [
      [
        { team: 1, score: 3 },
        { team: 8, score: 1 },
      ],
      [
        { team: 4, score: 2 },
        { team: 5, score: 1 },
      ],
      [
        { team: 3, score: 4 },
        { team: 6, score: 3 },
      ],
      [
        { team: 2, score: 5 },
        { team: 7, score: 4 },
      ],
    ],
    [
      [
        { team: 1, score: 4 },
        { team: 4, score: 3 },
      ],
      [
        { team: 3, score: 2 },
        { team: 2, score: 1 },
      ],
    ],
    [
      [
        { team: 1, score: 2 },
        { team: 2, score: 1 },
      ],
    ],
  ],
};

const PlayoffBracket = () => {
  return (
    <div>
      <h1>Playoff Bracket</h1>
      <TournamentBracket data={playoffData} />
    </div>
  );
};

export default PlayoffBracket;
