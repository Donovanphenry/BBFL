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

import {
  useNavigate
} from 'react-router-dom';

import './NavBar.css';

const NavBar = (props) => {
  const navigate = useNavigate();
  const {
    tabDrawerOpen,
    setShowTabDrawer,
    setLoginOpen,
    username
  } = props;

	return (
		<Box sx = {{flexGrow: 1}}>
      <AppBar position = 'static'>
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
             Binky League
            </Typography>
          </div>

          <Button color = 'inherit' onClick = {() => setLoginOpen(true)}>
            {username ? username : 'Login'}
          </Button>
        </Toolbar>
      </AppBar>
		</Box>
	);
};

export default NavBar;
