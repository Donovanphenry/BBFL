import {
  useEffect,
  useState
} from 'react';

import {
  get_matchups
} from '../../Utils/espn-api-parser.ts';

const Picks = () => {
  const [matchups, setMatchups] = useState(null);

  useEffect(() => {
   get_matchups(setMatchups);
  }, []);

  console.log('matchups = ', matchups);

  return (
    <div>
      Selecting picks
    </div>
  );
};

export default Picks;
