import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import FunctionsIcon from '@mui/icons-material/Functions';
import GavelIcon from '@mui/icons-material/Gavel';
import ScoreboardIcon from '@mui/icons-material/Scoreboard';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';

import './TabDrawer.css';


import {
  Drawer,
  Button
} from '@mui/material';

import './TabDrawer.css';


const TabDrawer = (props) => {
  const {
    showTabDrawer,
    setShowTabDrawer
  } = props;

  const pages = [
    {
      icon: <SportsFootballIcon />,
      name: 'Make Picks',
      path: '',
    },
    {
      icon: <ScoreboardIcon />,
      name: 'Week Standings',
      path: 'week-scores',
    },
    {
      icon: <FunctionsIcon />,
      name: 'Season Standings',
      path: 'league-score',
    },
    {
      icon: <GavelIcon />,
      name: 'Rules',
      path: 'rules',
    },
  ];
  const navigate = useNavigate();
  const location = useLocation();

  const movePage = (path) => {
    setShowTabDrawer(false);
    navigate(path);
  };

  return (
    <Drawer
      variant = 'temporary'
      open = {showTabDrawer}
      onClose = {() => setShowTabDrawer(false)}
      className = 'drawer-container'
        PaperProps={{
            sx: {
                background: "#252627",
                width: 250,
            }
        }}
    >
      <div
        className = 'pages-container'
      >
        {
          pages.map(page => `/${page.path}` !== location.pathname && (
                <Button
                  variant = 'outlined'
                  color = 'inherit'
                  className = 'page-button'
                  onClick = {() => movePage(page.path)}
                  startIcon = {page.icon}
                  key = {page.name}
                  sx={{
                    justifyContent: 'flex-start',
                  }}
                >
                  {page.name}
                </Button>
          ))
        }
      </div>
    </Drawer>
  );
};

export default TabDrawer;
