import {
  useState,
  useEffect
} from 'react'
import logo from './logo.svg';
import './App.css';
import {
	NavBar,
  TabDrawer,
  Home,
  LeagueScore,
  Picks
} from './components';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const players = require('./data/players.json')

const App = () => {
  const [showTabDrawer, setShowTabDrawer] = useState(false);
  const [matchups, setMatchups] = useState(null);

  return (
    <div className="App">
      <Router>
        <NavBar
          showTabDrawer = {showTabDrawer}
          setShowTabDrawer = {setShowTabDrawer}
        />
        <TabDrawer
          showTabDrawer = {showTabDrawer}
          setShowTabDrawer = {setShowTabDrawer}
        />


        <Routes>
          <Route index element = {<Home />} />
          <Route path = 'league-score' element = {<LeagueScore />} />
          <Route path = 'picks' element = {<Picks />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
