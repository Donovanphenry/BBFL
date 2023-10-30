import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Collapse,
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
  get_fixtures
} from '../../Utils/espn-api-parser.ts';

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import './WeekScoreRow.css';

const WeekScoreRow = props => {
  const { fixtures, user } = props;
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{color: 'white'}}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" sx={{color: 'white'}}>
          {user.user_email}
        </TableCell>
        <TableCell align="right" sx={{color: 'white'}}>{user.num_correct_guesses}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6} sx={{color: 'white'}}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div" sx={{color: 'white'}}>
                Picks
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{color: 'white'}}>Team Name</TableCell>
                    <TableCell sx={{color: 'white'}}>Team&apos;s Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{color: 'white'}}>
                  {user.picks.map((pick) => (
                    <TableRow key={`${user.user_email}-${pick.pick_number}`}>
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          color: pick.guess_result === 'Win' ? 'green' :
                            pick.guess_result === 'Loss' ? 'red' : 'white'
                        }}
                    >
                        {fixtures[pick.pick_number].competitors[pick.selected_team].name}
                      </TableCell>

                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          color: pick.guess_result === 'Win' ? 'green' :
                            pick.guess_result === 'Loss' ? 'red' : 'white'
                        }}
                      >
                        {pick.guess_result}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default WeekScoreRow;
