import {
  useState,
  useEffect,
} from 'react'
import './App.css';
import {
  AuthModal,
	NavBar,
  TabDrawer,
  LoginModal,
  LeagueScore,
  Picks,
  Rules,
  SettingsModal,
} from './components';

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import players_data from './data/players.json';

import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from "@supabase/supabase-js";

const api_key = import.meta.env.VITE_REACT_APP_SUPABASE_API_KEY;
const api_url = import.meta.env.VITE_REACT_APP_SUPABASE_API_URL;
const supabase = createClient(api_url, api_key);

const modal_state = {
  Confirm: "Confirm",
  Hidden: "Hidden",
  Login: "Login",
  Register: "Register",
}

const App = () => {
  const [showTabDrawer, setShowTabDrawer] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [modalState, setModalState] = useState(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const persisted_players = localStorage.getItem('players');
  const players = persisted_players ? JSON.parse(persisted_players) : players_data;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    getUsers();

    return () => subscription.unsubscribe();
  }, [])

  async function getUsers() {
    const { data } = await supabase.from("users").select();
    console.log("users = ", data);
  }

  if (!session) {

    return (<AuthModal supabase={supabase} modal_state = {modal_state}/>)
  }

  return (
    <div className="App">
      <Router>
        <NavBar
          showTabDrawer = {showTabDrawer}
          setShowTabDrawer = {setShowTabDrawer}
          setSettingsOpen = {setSettingsOpen}
          username = {username}
        />
        <TabDrawer
          showTabDrawer = {showTabDrawer}
          setShowTabDrawer = {setShowTabDrawer}
        />
        <SettingsModal
          settingsOpen = {settingsOpen}
          setSettingsOpen = {setSettingsOpen}
          setUsername = {setUsername}
          supabase={supabase}
          username = {username}
        />

        <Routes>
          <Route index element = {<Picks players = {players} username = {username}/>} />
          <Route path = 'league-score' element = {<LeagueScore />} />
          <Route path = 'rules' element = {<Rules/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
