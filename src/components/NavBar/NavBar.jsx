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

const NavBar = (props) => {
  const {
    tabDrawerOpen,
    setShowTabDrawer
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

          <Typography sx = {{flexGrow: 1}}>
            Binky League
          </Typography>

          <Button color = 'inherit'>
            Login
          </Button>
        </Toolbar>
      </AppBar>
		</Box>
	);
};

export default NavBar;
