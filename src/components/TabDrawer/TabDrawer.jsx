import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import './TabDrawer.css';

import {
  Drawer,
  Button
} from '@mui/material';

const TabDrawer = (props) => {
  const {
    showTabDrawer,
    setShowTabDrawer
  } = props;

  const pages = [
    {
      name: 'Make Picks',
      path: 'picks'
    },
    {
      name: 'Check League Score',
      path: 'league-score'
    },
    {
      name: 'Rules',
      path: 'rules'
    },
    {
      name: 'Week Scores',
      path: 'week-scores'
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
                  key = {page.name}
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
