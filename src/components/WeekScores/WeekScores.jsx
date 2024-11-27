import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Checkbox,
  Collapse,
  Dialog,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import DifferenceIcon from '@mui/icons-material/Difference';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import TuneIcon from '@mui/icons-material/Tune';

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
  const [displayPicks, setDisplayPicks] = useState(false);
  const [userResults, setUserResults] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    'diff_picks': {
      'active': false,
      'label': 'Toggle Diffs',
    },
  });
  const [fixtures, setFixtures] = useState([]);
  const FILTER_MAP = {
    'diff_picks': (pick) => pick.diff,
  };
  const ICON_MAP = {
    'diff_picks': <DifferenceIcon/>
  };

  let pick_type = process.env.NODE_ENV === 'development' ? "user_picks" : "user_picks";

  useEffect(() => {
    const get_all_users_picks = async () => {
      // This is an absolutely heinous method with
      // many passes over the same data.
      // We should figure out a way to optimize this.
      const { data, error } = await supabase
        .from(pick_type)
        .select("user_id, pick_number, selected_team")
        .eq("week_number", weekId);

      const curr_fixtures = await get_fixtures();
      const user_map = {};
      const pick_counts = {};
      for (const pick of data)
      {
        if (!pick_counts[pick.pick_number])
        {
          pick_counts[pick.pick_number] = {
            'away': 0,
            'home': 0,
          };
        }
        pick_counts[pick.pick_number][pick.selected_team] += 1;

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

        for (const pick of user_map[user_id].picks)
        {
          pick.diff = pick_counts[pick.pick_number]['away'] > 0 &&
            pick_counts[pick.pick_number]['home'] > 0;
        }
      }

      for (const user_id in user_map)
      {
        const filtered_picks = user_map[user_id].picks.filter((pick) => {
          for (const filter_id in filters) {
            if (filters[filter_id].active &&
              !FILTER_MAP[filter_id](pick)) {
              return false;
            }
          }
          return true;
        });
        user_map[user_id].picks = filtered_picks;
      }

      setUserResults(user_map);
      setFixtures(curr_fixtures);
    };

    get_all_users_picks();
  }, [weekId, filters]);

  const handleFilterChanged = (filter_id) => {
    const new_filters = structuredClone(filters);
    const active = !new_filters[filter_id].active;
    new_filters[filter_id].active = active;
    setFilters(new_filters);
  };

  const handleToggleDisplay = () => {
    setDisplayPicks(!displayPicks);
  };

  return Object.keys(userResults).length > 0 && (
    <div className='week-scores-container'>
      <div className='filter-container'>
        {Object.keys(filters).map((filter_id) => (
          <Button
            onClick={() => handleFilterChanged(filter_id)}
            key={filter_id}
            size='small'
            startIcon={ICON_MAP[filter_id]}
          >
            {filters[filter_id].label}
          </Button>
        ))}
        <Button
          onClick={() => handleToggleDisplay()}
          size='small'
          startIcon={displayPicks ? <PlaylistRemoveIcon/> : <PlaylistAddIcon/>}
        >
          {displayPicks ? 'Minimize' : 'Expand'} all
        </Button>
      </div>

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
                <WeekScoreRow
                  displayPicks={displayPicks}
                  fixtures={fixtures}
                  key={user.user_email}
                  user={userResults[user]}
                />
              );

            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default WeekScores;
