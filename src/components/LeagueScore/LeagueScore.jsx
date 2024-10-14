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

import { LeagueScoreRow } from '../LeagueScoreRow';
import './LeagueScore.css';

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

      setStandings(sorted_standings);
    }

    get_standings();
  }, []);

  return Object.keys(standings).length > 0 && (
    <TableContainer component={Paper} sx = {{background: '#353839', color: 'white'}}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow sx={{color: 'white'}}>
            <TableCell sx={{color: 'white'}}>User Email</TableCell>
            <TableCell sx={{color: 'white'}}>Points</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {standings.map((user_info) => {
            const [UID_INDEX, USER_STANDINGS_INDEX] = [0, 1];
            return (
              <LeagueScoreRow
                key={user_info[UID_INDEX]}
                user_standings={user_info[USER_STANDINGS_INDEX]}
              />
            );

          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LeagueScore;
