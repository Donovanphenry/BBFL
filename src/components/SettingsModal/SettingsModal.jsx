import {
  useState
} from 'react';
import {
  useNavigate
} from 'react-router-dom';

import {
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';

import './SettingsModal.css';

import { supabase } from '/src/Utils/supabase-helpers';

const SettingsModal = ({setUsername, settingsOpen, setSettingsOpen, supabase}) => {
  const navigate = useNavigate();
  const initiateLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setSettingsOpen(false);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <Drawer
      anchor='right'
      className = 'settings-drawer'
      PaperProps={{
        sx: {
          background: "#252627",
          width: 250,
        }
      }}
      open = {settingsOpen}
      onClose = {() => setSettingsOpen(false)}
    >
      <div className = 'top-buttons-container'>
        <Button className='close-button' onClick = {() => setSettingsOpen(false)}>
          <CloseIcon className='close-icon'/>
        </Button>
      </div>

      <Divider />

      <List className='settings-list'>
        <ListItemButton onClick = {() => initiateLogout()}>
          <ListItemIcon>
            <LogoutIcon className='settings-list-item-icon'/>
          </ListItemIcon>
          <ListItemText primary='Log out'/>
        </ListItemButton>
      </List>
    </Drawer>
  );
};

export default SettingsModal;
