import logo from './logo.svg';
import './App.css';
import {
	NavBar,
  Content
} from './components';

const players = require('./data/players.json')
console.log('players = ', players);

function App() {
  return (
    <div className="App">
			<NavBar/>
      <Content/>
    </div>
  );
}

export default App;
