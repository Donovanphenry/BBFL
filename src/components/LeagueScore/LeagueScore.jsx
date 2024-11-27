import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';

import { LeagueScoreRow } from '../LeagueScoreRow';
import './LeagueScore.css';

import { NUM_ACTIVE_PLAYERS } from '/src/Utils/constants';

const LeagueScore = (props) => {
  const {
    supabase,
  } = props;
  const [standings, setStandings] = useState([]);

  let pick_type = process.env.NODE_ENV === 'development' ? "dev_week_results" : "week_results";

  const calculate_points = (user_standings) => {
    // Absolutely heinous hardcoding. But I'm lazy
    // and don't want to think of a better way yet.
    // We don't often add people to the league.
    const POINT_MAP = {
      '1': 3,
      '2': 2,
      '3': 1,
    };

    let total_points = 0;
    for (let position in user_standings.position_count) {
      const position_value = POINT_MAP[position] ? POINT_MAP[position] : 0;
      total_points += user_standings.position_count[position] * position_value;
    }

    return total_points;
  };

  const create_columns = () => {
    const columns = [
      {
        'field': 'user_email',
        'headerName': 'Email',
      },
      {
        'field': 'points',
        'headerName': 'Points',
      },
    ];

    const non_position_keys = new Set(['user_email', 'id', 'points']);
    const position_keys = new Set([]);
    for (const row of standings) {
      for (const key in row) {
        if (!non_position_keys.has(key)) {
          position_keys.add(key);
        }
      }
    }

    for (const key of position_keys) {
      columns.push({
        'field': key,
        'headerName': `${key}`,
      });
    }

    return columns;
  };

  const data = {
    'columns': create_columns(),
    initialState: {
      'columns': {
        'columnVisibilitsyMoodel': {
          'user_id': false,
          'user_email': false,
          'position': false,
          'correct_predictions': false,
          'week_number': false,
        },
      },
    },
    rows: standings,
  };

  useEffect(() => {
    const get_standings = async () => {
      const week_results = {};

      const { data, error } = await supabase
        .from(pick_type)
        .select("user_id, position, correct_predictions, week_number");

      const new_standings = {};

      for (let user_results of data) {
        if (!new_standings[user_results.user_id]) {
          const { data: { user: curr_user }, error } = await supabase.auth.admin.getUserById(user_results.user_id);
          new_standings[user_results.user_id] = {
            position_count: {},
            user_email: curr_user.email,
          };

          for (let pos = 1; pos <= NUM_ACTIVE_PLAYERS; ++pos) {
            new_standings[user_results.user_id].position_count[pos] = 0;
          }
        }
        const user_standings = new_standings[user_results.user_id];

        if (!user_standings.position_count[user_results.position]) {
          user_standings.position_count[user_results.position] = 0;
        }
        user_standings.position_count[user_results.position] += 1;

      }

      for (let uid in new_standings) {
        new_standings[uid].points = calculate_points(new_standings[uid]);
      }

      const sorted_standings = Object.entries(new_standings).sort(([, a], [, b]) => b.points - a.points);
      const flattened_standings = [];

      for (const [uid, user_standing] of sorted_standings) {
        const curr_standing = structuredClone(user_standing);
        const POSITION_SUFFIX = [
          'st',
          'nd',
          'rd',
        ];
        for (const pos in curr_standing.position_count) {
          const pos_int = parseInt(pos);
          if (pos_int > NUM_ACTIVE_PLAYERS)
            continue;
          const relative_pos = parseInt(pos) - 1;
          const pos_suffix = relative_pos >= POSITION_SUFFIX.length ?
            'th' : POSITION_SUFFIX[relative_pos];
          let key = `${pos}${pos_suffix}`;
          curr_standing[key] = curr_standing.position_count[pos];
        }
        delete curr_standing.position_count;
        curr_standing.id = uid;

        if (curr_standing.points > 0) {
          flattened_standings.push(curr_standing);
        }
      }
      setStandings(flattened_standings);
    }

    get_standings();
  }, []);

  return Object.keys(standings).length > 0 && (
    <div>
      <DataGrid
        columns={data.columns}
        rows={data.rows}
        sx={{
          boxShadow: 0,
          border: 1,
          borderColor: 'primary',
          color: 'white',
          '& .MuiDataGrid-columnHeaders': {
            color: 'black',
          },
        }}
    />
    </div>
  );
};

export default LeagueScore;
