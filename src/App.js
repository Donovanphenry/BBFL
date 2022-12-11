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

import {
  get_matchups
} from './Utils/espn-api-parser.ts';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const players = require('./data/players.json')

function App() {
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
