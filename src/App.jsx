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
  WeekScores,
} from './components';

import { get_week_num, get_week_type } from '/src/Utils/espn-api-parser';
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
  const [modalState, setModalState] = useState(modal_state.Login);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [userId, setUserId] = useState(null);
  const [weekId, setWeekId] = useState(null);
  const [weekType, setWeekType] = useState(null);
  const persisted_players = localStorage.getItem('players');
  const players = persisted_players ? JSON.parse(persisted_players) : players_data;
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    const set_user = async () => {
      const ref_user = await getUser();
      setUser(ref_user);
    };

    set_user();

    setWeekInfo();

    return () => subscription.unsubscribe();
  }, []);

  const setWeekInfo = async () => {
    const week_id = await get_week_num();
    const week_type = await get_week_type();
    setWeekId(week_id);
    setWeekType(week_type);
  }

  async function getUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Failure getting user: ', error);
    }

    return data.user;
  };

  if (!session) {
    return (<AuthModal supabase={supabase} modal_state = {modal_state} setModalState={setModalState} modalState={modalState} setUserId={setUserId}/>)
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
          <Route index element={<Picks players={players} supabase={supabase} user={user} userId={userId} weekId={weekId} weekType={weekType}/>} />
          <Route path='league-score' element={<LeagueScore />} />
          <Route path='week-scores' element={<WeekScores supabase={supabase} user={user} weekId={weekId} weekType={weekType}/>} />
          <Route path='rules' element={<Rules/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
