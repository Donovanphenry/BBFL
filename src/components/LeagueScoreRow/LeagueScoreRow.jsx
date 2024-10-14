import React, { useState, useEffect } from 'react';
import {
  TableCell,
  TableRow,
} from '@mui/material';

import {
  get_fixtures
} from '../../Utils/espn-api-parser.ts';

import './LeagueScoreRow.css';

const LeagueScoreRow = props => {
  const { user_standings } = props;


  return user_standings.points > 0 && (
    <React.Fragment>
      <TableRow
        className='userRow'
      >
        <TableCell component="th" scope="row" sx={{color: 'white'}}>
          {user_standings.user_email}
        </TableCell>
        <TableCell align="right" sx={{color: 'white'}}>{user_standings.points}</TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default LeagueScoreRow;
