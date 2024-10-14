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
  ProtectedRoute,
  Rules,
  SettingsModal,
  WeekScores,
} from './components';

import { get_week_num, get_week_type } from '/src/Utils/espn-api-parser';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import { ThemeSupa } from '@supabase/auth-ui-shared';

import { supabase } from '/src/Utils/supabase-helpers';

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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      const user_obj = await getUser();

      if (user_obj?.user) {
        setUserId(user_obj.user.id);
        setUser(user_obj.user);
      }
    }
    getUserData();
    setWeekInfo();
  }, []);

  const setWeekInfo = async () => {
    const week_id = await get_week_num();
    const week_type = await get_week_type();
    setWeekId(week_id);
    setWeekType(week_type);
  }

  async function getUser() {
    const { data } = await supabase.auth.getUser();

    return data;
  };

  return (
    <div className="App">
      <Router>
        <NavBar
          showTabDrawer={showTabDrawer}
          setShowTabDrawer={setShowTabDrawer}
          setSettingsOpen={setSettingsOpen}
          username={username}
        />
        <TabDrawer
          showTabDrawer={showTabDrawer}
          setShowTabDrawer={setShowTabDrawer}
        />
        <SettingsModal
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          setUsername={setUsername}
          supabase={supabase}
          username={username}
        />

        <Routes>
          <Route path='login' element={
            <LoginModal
              modal_state={modal_state}
              setModalState={setModalState}
              modalState={modalState}
              setUserId={setUserId}
            />
          } />

          <Route element={<ProtectedRoute isAuthenticated={user !== null}/>}>
            <Route index path='/' element={<Picks supabase={supabase} user={user} userId={userId} weekId={weekId} weekType={weekType}/>} />
            <Route path='league-score' element={<LeagueScore supabase={supabase}/>} />
            <Route path='week-scores' element={<WeekScores supabase={supabase} user={user} weekId={weekId} weekType={weekType}/>} />
            <Route path='rules' element={<Rules/>}/>
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
