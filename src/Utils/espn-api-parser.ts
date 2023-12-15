const get_week_num = async () => {
  const curr_day_of_week = (new Date()).toLocaleString("en-US", {
    timezone: "America/Los_Angeles",
    weekday: 'long',
  });

  // Create a new Date object to represent the current date and time
  const currentDate = new Date();

  // Create a new Date object with the UTC-7 offset for PDT (Pacific Daylight Time)
  const url = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl"
  const res = await fetch(url);
  const data = await res.json();

  const year_of_season = data.season.year;

  const week_url = data.season.type.week["$ref"].replace(/^http:/, 'https:');
  const week_res = await fetch(week_url);
  const week_data = await week_res.json();

  let week_num = week_data.number;
  if (curr_day_of_week == "Tuesday")
  {
    week_num += 1;
  }

  return week_num;
}

const get_fixtures = async () => {
  const curr_day_of_week = (new Date()).toLocaleString("en-US", {
    timezone: "America/Los_Angeles",
    weekday: 'long',
  });

  // Create a new Date object to represent the current date and time
  const currentDate = new Date();

  // Create a new Date object with the UTC-7 offset for PDT (Pacific Daylight Time)
  const url = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl"
  const res = await fetch(url);
  const data = await res.json();

  const year_of_season = data.season.year;

  const week_url = data.season.type.week["$ref"].replace(/^http:/, 'https:');
  const week_res = await fetch(week_url);
  const week_data = await week_res.json();

  let week_num = week_data.number;
  if (curr_day_of_week == "Tuesday")
  {
    week_num += 1;
  }

  const events_url = `${url}/seasons/${year_of_season}/types/2/weeks/${week_num}/events?lang=en&region=us`.replace(/^http:/, 'https:');
  const events_res = await fetch(events_url);
  const events_data = await events_res.json();
  const events = events_data.items;

  const fixtures = await Promise.all(events.map(evt => extract_fixtures(evt)));

  fixtures.sort((a, b) => {
    if (a.kickoff_time < b.kickoff_time)
      return -1;
    if (a.kickoff_time > b.kickoff_time)
      return 1;
    if (a.competitors.away.name < b.competitors.away.name)
      return -1;
    return 1;
  });

  return fixtures;
};

const get_user_fixtures = async (setFixtures, supabase) => {
  const user_res = await supabase.auth.getUser();
  if (user_res.error)
  {
    console.error("Ouf: ", error);
  }

  const user = user_res.data.user;
  const curr_day_of_week = (new Date()).toLocaleString("en-US", {
    timezone: "America/Los_Angeles",
    weekday: 'long',
  });

  // Create a new Date object to represent the current date and time
  const currentDate = new Date();

  // Create a new Date object with the UTC-7 offset for PDT (Pacific Daylight Time)
  const url = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl"
  const res = await fetch(url);
  const data = await res.json();

  const year_of_season = data.season.year;

  const week_url = data.season.type.week["$ref"].replace(/^http:/, 'https:');
  const week_res = await fetch(week_url);
  const week_data = await week_res.json();

  let week_num = week_data.number;
  if (curr_day_of_week == "Tuesday")
  {
    week_num += 1;
  }

  const events_url = `${url}/seasons/${year_of_season}/types/2/weeks/${week_num}/events?lang=en&region=us`.replace(/^http:/, 'https:');
  const events_res = await fetch(events_url);
  const events_data = await events_res.json();
  const events = events_data.items;

  const fixtures = await get_fixtures();

  const user_id = await user.id;
  let user_picks = []
  if (user_id) {
    const { data, error } = await supabase
      .from("user_picks")
      .select("*")
      .eq("user_id", user_id)
      .eq("week_number", week_num);

    if (error) {
      console.error("Erreur lors de la récupération des données :", error);
    } else {
      console.log("Données récupérées avec succès :", data);
    }
    user_picks = data;
  }

  fixtures.map((fixture, idx) => {
    const pick = user_picks.find((pick) => {
      return pick.pick_number === idx
    });

    if (pick) {
      if (pick.selected_team === 'home')
      {
        fixture.competitors.home.pick = 'win';
        fixture.competitors.away.pick = 'lose';
      }
      else
      {
        fixture.competitors.away.pick = 'win';
        fixture.competitors.home.pick = 'lose';
      }
    }
  });

  setFixtures(fixtures);
};

const extract_fixtures = async (evt) => {
  const match_url = evt['$ref'].replace(/^http:/, 'https:');
  const match_res = await fetch(match_url);
  const match_data = await match_res.json();

  const comp_url = match_data.competitions[0]['$ref'].replace(/^http:/, 'https:');
  const comp_res = await fetch(comp_url);
  const comp_data = await comp_res.json();

  let situation_data = null;
  let status_data = {
    'type': {
      'state': 'pre'
    }
  };
  let game_time = '';
  let is_playing = null;
  let possessing_team_name = null;
  let possessor_text = null;

  if (comp_data['situation'])
  {
    const situation_url = comp_data.situation['$ref'].replace(/^http:/, 'https:');
    const situation_res = await fetch(situation_url);
    situation_data = await situation_res.json();

    const status_url = comp_data.status['$ref'].replace(/^http:/, 'https:');
    const status_res = await fetch(status_url);
    status_data = await status_res.json();

    game_time = `Q${status_data.period} - ${status_data.displayClock}`;

    is_playing = status_data.type.completed;

    if (situation_data.team)
    {
      const possessing_team_url = situation_data.team['$ref'].replace(/^http:/, 'https:');
      const possessing_team_res = await fetch(possessing_team_url);
      const possessing_team_data = await possessing_team_res.json();

      possessing_team_name = possessing_team_data.name;
      possessor_text = situation_data.downDistanceText;
    }
  }
  const [c1, c2] = comp_data['competitors'];

  const competitors = {
    home: {
      obj: c1
    },
    away: {
      obj: c2
    },
  };
  if (c1.homeAway !== 'home')
    [competitors.home.obj, competitors.away.obj] = [c2, c1];

  for (const competitor_type in competitors)
  {
    const competitor = competitors[competitor_type];

    const competitor_score_url = competitor.obj.score['$ref'].replace(/^http:/, 'https:');
    const competitor_score_res = await fetch(competitor_score_url);
    const competitor_score_data = await competitor_score_res.json();

    const competitor_score = competitor_score_data.value;
    const competitor_winner = competitor_score_data.winner;

    const competitor_url = competitor.obj.team['$ref'].replace(/^http:/, 'https:');
    const competitor_res = await fetch(competitor_url);
    const competitor_data = await competitor_res.json();

    const team_url = competitor_data['$ref'].replace(/^http:/, 'https:');
    const team_res = await fetch(team_url);
    const team_data = await team_res.json();

    competitor['name'] = team_data.displayName;
    competitor['pic'] = team_data.logos[0].href;

    const record_url = competitor_data.record['$ref'].replace(/^http:/, 'https:');
    const record_res = await fetch(record_url);
    const record_data = await record_res.json();

    competitor['record'] = record_data.items[0].summary;
    competitor['pick'] = 'none';
    competitor['score'] = `${competitor_score} pts`;
    competitor['winner'] = competitor_winner;
    competitor['possessor'] = false;


    competitor['show_score'] = status_data.type.state == "pre" ? false : true;

    if (possessing_team_name === team_data.name)
    {
      competitor['possessor'] = true;
    }

    delete competitor['obj'];
  }

  const fixture = {
    competitors: competitors,
    kickoff_time: match_data.date,
    game_time: game_time,
    is_active: status_data.type.state != "pre" && status_data.type.state != "post",
    possessor_text: possessor_text
  };

  return fixture;
};

const get_current_week = async () => {
  const url = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl"
  const res = await fetch(url);
  const data = await res.json();

  return data.season.type.week.number;
};

export { get_week_num, get_fixtures, get_user_fixtures };
