const calculate_refresh_rate = (fixture) => {
  const NUM_QUARTERS = 4;
  const MINUTES_PER_QUARTER = 15;

  const [quarter_info, time_info] = fixture.game_time.split(' - ');

  const quarter = Math.min(parseInt(quarter_info.charAt(1), 10), NUM_QUARTERS);
  const quarter_modifier = NUM_QUARTERS - quarter;

  const [minutes, seconds] = time_info.split(':').map(Number);

  return convert_minutes_to_ms(quarter_modifier + minutes / MINUTES_PER_QUARTER + 0.5);
};

const convert_minutes_to_ms = (minutes) => {
  const SECONDS_PER_MINUTE = 60;
  const MS_PER_SECOND = 1000;

  return minutes * SECONDS_PER_MINUTE * MS_PER_SECOND;
}

const get_curr_day_of_week = async () => {
  const user_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const curr_day_of_week = (new Date()).toLocaleString("en-US", {
    timeZone: user_timezone,
    weekday: 'long',
  });

  return curr_day_of_week;
}

const get_week_num = async () => {
  const curr_day_of_week = get_curr_day_of_week();

  // Create a new Date object to represent the current date and time
  const currentDate = new Date();

  // Create a new Date object with the UTC-7 offset for PDT (Pacific Daylight Time)
  const url = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl"
  const res = await fetch(url);
  const data = await res.json();

  const year_of_season = data.season.year;

  const week_url = data.season.type.weeks["$ref"].replace(/^http:/, 'https:');
  const week_res = await fetch(week_url);
  const week_data = await week_res.json();

  let week_num = week_data.number;
  if (!week_num) {
    week_num = 1;
  }
  if (curr_day_of_week == "Tuesday")
  {
    week_num += 1;
  }

  return week_num;
}

const get_fixtures = async () => {
  const curr_day_of_week = get_curr_day_of_week();

  // Create a new Date object to represent the current date and time
  const currentDate = new Date();

  // Create a new Date object with the UTC-7 offset for PDT (Pacific Daylight Time)
  const url = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl"
  const res = await fetch(url);
  const data = await res.json();
  const year_of_season = data.season.year;

  const week_url = data.season.type.weeks["$ref"].replace(/^http:/, 'https:');
  const week_res = await fetch(week_url);
  const week_data = await week_res.json();

  let week_num = week_data.number;
  if (!week_num)
      week_num = 1;
  if (curr_day_of_week == "Tuesday")
  {
    week_num += 1;
  }

  const season_type = data.season.type.type;

  const events_url = `${url}/seasons/${year_of_season}/types/${season_type}/weeks/${week_num}/events?lang=en&region=us`.replace(/^http:/, 'https:');
  const events_res = await fetch(events_url);
  const events_data = await events_res.json();
  const events = events_data.items;

  const fixtures = await Promise.all(events.map(evt => extract_fixtures(evt, season_type)));

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
    console.error("Ouf: ", user_res.error);
  }
  const user = user_res.data.user;

  const fixtures = await get_fixtures();
  const week_num = await get_week_num();

  const user_id = await user.id;
  let user_picks = [];
  let pick_type = process.env.NODE_ENV === 'development' ? "dev_user_picks" : "user_picks"

  if (user_id) {
    const { data, error } = await supabase
      .from(pick_type)
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

  let smallest_refresh_rate = null;
  fixtures.map((fixture, idx) => {
    const pick = user_picks.find((pick) => {
      return pick.pick_number === idx
    });

    const curr_refresh_rate = calculate_refresh_rate(fixture);

    if (!smallest_refresh_rate || curr_refresh_rate < smallest_refresh_rate)
      smallest_refresh_rate = curr_refresh_rate;
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
  return smallest_refresh_rate;
};

const extract_fixtures = async (evt, season_type) => {
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


    let record_url = competitor_data.record['$ref'].replace(/^http:/, 'https:');
    record_url = record_url.replace(/types\/\d+/, `types/${season_type}`);
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

const get_week_type = async () => {
  const url = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl"
  const res = await fetch(url);
  const data = await res.json();

  return data.season.type.type;
}

export { get_week_num, get_week_type, get_fixtures, get_user_fixtures };
