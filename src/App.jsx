import {
  useState,
} from 'react'
import './App.css';
import {
	NavBar,
  TabDrawer,
  Login,
  Home,
  LeagueScore,
  Picks,
    Rules
} from './components';

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import players_data from './data/players.json';

const App = () => {
  const [showTabDrawer, setShowTabDrawer] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const persisted_players = localStorage.getItem('players');
  const players = persisted_players ? JSON.parse(persisted_players) : players_data;

  return (
    <div className="App">
      <Router>
        <NavBar
          showTabDrawer = {showTabDrawer}
          setShowTabDrawer = {setShowTabDrawer}
          setLoginOpen = {setLoginOpen}
          username = {username}
        />
        <TabDrawer
          showTabDrawer = {showTabDrawer}
          setShowTabDrawer = {setShowTabDrawer}
        />
        <Login
          loginOpen = {loginOpen}
          setLoginOpen = {setLoginOpen}
          username = {username}
          setUsername = {setUsername}
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
