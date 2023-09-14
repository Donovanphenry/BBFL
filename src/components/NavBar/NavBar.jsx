import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';

import {
  useNavigate
} from 'react-router-dom';

import './NavBar.css';

const NavBar = (props) => {
  const navigate = useNavigate();
  const {
    tabDrawerOpen,
    setShowTabDrawer,
    setSettingsOpen,
    username
  } = props;

	return (
		<Box sx = {{flexGrow: 1}}>
      <AppBar position = 'static' sx = {{background: '#3f51b5'}}>
        <Toolbar>
          <IconButton
            size = 'large'
            edge = 'start'
            color = 'inherit'
            aria-label = 'menu'
            sx = {{mr: 2}}
            onClick = {() => setShowTabDrawer(!tabDrawerOpen)}
          >
            <MenuIcon />
          </IconButton>

          <div className = 'league-icon-container'>
            <Typography className = 'league-icon' onClick = {() => navigate('')}>
             Bing Bong League
            </Typography>
          </div>

          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='menu'
            sx={{mr: 2}}
            onClick={() => setSettingsOpen(true)}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
		</Box>
	);
};

export default NavBar;
