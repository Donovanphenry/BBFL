import {
  useState
} from 'react';

import {
  Paper,
  Typography,
} from '@mui/material';

import CelebrationIcon from '@mui/icons-material/Celebration';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';

import './Matchup.css';

const Matchup = ({is_late_pick, match, match_index, fixtures, setFixtures}) => {
//  const text = document.getElementById('text');
//  const bar = document.getElementById('bar');
//  if (bar) {
//    console.log('text = ', text);
//    const text_offset = text.offsetLeft - (text.clientWidth / 2);
//    bar.style.setProperty('--game-state-text-offset', `${text_offset}px`);
//    console.log('text_offset = ', text_offset);
//  }

  const changeWinner = (team_selections) => {
    const fixtures_copy = JSON.parse(JSON.stringify(fixtures));
    const fixture_copy = fixtures_copy[match_index];

    if (is_late_pick(fixture_copy.kickoff_time))
      return;

    for (const {team, pick} of team_selections)
    {
      const curr_pick = fixture_copy.competitors[team]['pick'];
      if (pick === curr_pick)
        fixture_copy.competitors[team]['pick'] = 'none';
      else
        fixture_copy.competitors[team]['pick'] = pick;
    }

    setFixtures(fixtures_copy);
  };

  const get_team_class = (team) => {
    if (team.pick === 'none')
      return 'ongoing-team';
    if (team.pick === 'win')
      return 'winning-team';
    return 'losing-team';
  };

  const get_readable_kickoff_time = (kickoff_time) => {
    const date = new Date(kickoff_time);

    const user_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date_time_format = new Intl.DateTimeFormat('en', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: user_timezone,
    });

    const formatted_date = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);

    const formatted_time = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: user_timezone,
      timeZoneName: 'short',
    }).format(date);


    return `${formatted_date} at ${formatted_time}`;
  };

  return (
    <Paper className = 'match-container' elevation = {3}>
      <div className = 'fixture-container'>
        <div className = 'team-div' onClick = {() => changeWinner([{'team': 'home', 'pick': 'win'}, {'team': 'away', 'pick': 'lose'}])}>
          <img className = 'team-picture' src = {match.competitors.home.pic} />

          <p className={get_team_class(match.competitors.home)}>
            {match.competitors.home.name} ({match.competitors.home.record})
          </p>

          <p className = {`match-score ${get_team_class(match.competitors.home)}`}>
            <span className={match.competitors.home.winner ? 'match-winners-icon' : 'match-losers-icon'}>
              <CelebrationIcon/>
            </span>



            { match.competitors.home.show_score &&
              <span className={match.competitors.home.winner ? 'match-winners-text' : 'score-text'}>
                {match.competitors.home.score}
              </span>
            }
          </p>

          { match.competitors.home.possessor &&
            <div className='possessor-container'>
              <span className='attacker-icon'>
                <SportsFootballIcon/>
              </span>
            </div>
          }
        </div>

        <div className = 'team-div' onClick = {() => changeWinner([{'team': 'home', 'pick': 'lose'}, {'team': 'away', 'pick': 'win'}])}>
          <img className = 'team-picture' src = {match.competitors.away.pic} />

          <p className={get_team_class(match.competitors.away)}>
            {match.competitors.away.name} ({match.competitors.away.record})
          </p>

          <Typography className = {`match-score ${get_team_class(match.competitors.away)}`}>
            <span className={match.competitors.away.winner ? 'match-winners-icon' : 'match-losers-icon'}>
              <CelebrationIcon sx={{fontSize: '20px'}}/>
            </span>



            { match.competitors.away.show_score &&
              <span className={match.competitors.away.winner ? 'match-winners-text' : 'match-losers-text'}>
                {match.competitors.away.score}
              </span>
            }
          </Typography>

          { match.competitors.away.possessor &&
            <div className = 'possessor-container'>
              <span className='attacker-icon'>
                <SportsFootballIcon sx={{fontSize: '20px'}}/>
              </span>
            </div>
          }
        </div>
      </div>

      {match.is_active &&
        <Typography id='text' className = 'game-state'>
          {match.game_time}
        </Typography>
      }

      { match.is_active &&
        <Typography className = 'foo'>
          {match.possessor_text}
        </Typography>
      }



      <Typography className = 'kickoff-time' sx = {{fontSize: 14, textDecoration: is_late_pick(match.kickoff_time) ? 'line-through' : 'none'}}>
        {get_readable_kickoff_time(match.kickoff_time)}
      </Typography>
    </Paper>
  )
};

export default Matchup;
