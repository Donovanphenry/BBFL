import {
  useState
} from 'react';

import {
  Dialog,
  TextField,
  Button
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import './Login.css';

const Login = ({setUsername, loginOpen, setLoginOpen}) => {
  const loginSubmit = async () => {
    const players = require('../../data/players.json');
    if (!players[login.username] || players[login.username].password !== login.password)
      return;

    setUsername(login.username);
    setLoginOpen(false);

    localStorage.setItem('username', login.username);
  };
  const [login, setLogin] = useState({
    username: '',
    password: ''
  });

  const updateUsername = (e) => {
    setLogin({
      ...login,
      username: e.target.value,
    });
  };

  const updatePassword = (e) => {
    setLogin({
      ...login,
      password: e.target.value
    });
  };

  return (
    <Dialog open = {loginOpen} onClose = {() => setLoginOpen(false)}>
      <div className = 'login-container'>
        <div className = 'top-buttons-container'>
          <Button className = 'close-button' onClick = {() => setLoginOpen(false)}>
            <CloseIcon/>
          </Button>
        </div>

        <div className = 'info-container'>
          <TextField
            label = 'Username'
            variant = 'standard'
            onChange = {updateUsername}
          />
          <TextField
            label = 'Password'
            type = 'password'
            variant = 'standard'
            onChange = {updatePassword}
          />
        </div>

        <div className = 'data-buttons-container'>
          <Button className = 'login-button'>
            Clear
          </Button>

          <Button className = 'login-button' onClick = {loginSubmit}>
            Login
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default Login;
