import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Collapse,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { WeekScoreRow } from '../WeekScoreRow';

import {
  get_fixtures
} from '../../Utils/espn-api-parser.ts';

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import './WeekScores.css';

const WeekScores = (props) => {
  const {
    supabase,
    user,
    weekId,
  } = props;
  const [userResults, setUserResults] = useState([]);
  const [fixtures, setFixtures] = useState([]);

  useEffect(() => {
    const get_all_users_picks = async () => {
      const { data, error } = await supabase
        .from("user_picks")
        .select("user_id, pick_number, selected_team")
        .eq("week_number", weekId);

      const curr_fixtures = await get_fixtures();
      console.log("curr_fixtures = ", curr_fixtures);
      const user_map = {};
      for (const pick of data)
      {
        if (!user_map[pick.user_id])
        {
          const { data: { user: curr_user }, error } = await supabase.auth.admin.getUserById(pick.user_id);
          user_map[pick.user_id] = {
            num_correct_picks: 0,
            picks: [],
            user_email: curr_user.email,
          };
        }

        const fixture = curr_fixtures[pick.pick_number];
        let guess_result = 'TBD';
        if (fixture.competitors.away.show_score)
          guess_result = "In-Progress";
        if (fixture.competitors[pick.selected_team].winner === false)
          guess_result = 'Loss';
        if (fixture.competitors[pick.selected_team].winner === true)
          guess_result = 'Win';

        user_map[pick.user_id].picks.push({
          guess_result: guess_result,
          pick_number: pick.pick_number,
          selected_team: pick.selected_team,
        });
      }

      for (const user_id in user_map)
      {
        const reduction = user_map[user_id].picks.reduce((count, pick) => {
          return count + (pick.guess_result === "Win" ? 1 : 0);
        }, 0);
        user_map[user_id].num_correct_guesses = reduction;
        user_map[user_id].picks.sort((a, b) => a.pick_number - b.pick_number);
      }

      setUserResults(user_map);
      setFixtures(curr_fixtures);
    };

    get_all_users_picks();
  }, []);

  return Object.keys(userResults).length > 0 && (
    <TableContainer component={Paper} sx = {{background: '#353839', color: 'white'}}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow sx={{color: 'white'}}>
            <TableCell />
            <TableCell sx={{color: 'white'}}>User Email</TableCell>
            <TableCell align="right" sx={{color: 'white'}}>Correct Guesses</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(userResults).map((user) => {
            return (
              <WeekScoreRow key={user.user_email} fixtures={fixtures} user={userResults[user]} />
            );

          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WeekScores;
