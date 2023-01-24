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

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const players = require('./data/players.json');

const App = () => {
  const [showTabDrawer, setShowTabDrawer] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const players = JSON.parse(localStorage.getItem('players')) || require('./data/players.json');

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
          <Route index element = {<Home />} />
          <Route path = 'league-score' element = {<LeagueScore />} />
          <Route path = 'picks' element = {<Picks players = {players} username = {username}/>} />
            <Route path = 'rules' element = {<Rules/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
