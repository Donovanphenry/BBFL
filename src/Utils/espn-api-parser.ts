const get_fixtures = async (setFixtures) => {
  const url = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl"
  const res = await fetch(url);
  const data = await res.json();

  const week_url = data.season.type.week["$ref"].replace(/^http:/, 'https:');
  const week_res = await fetch(week_url);
  const week_data = await week_res.json();

  const events_url = week_data.events['$ref'].replace(/^http:/, 'https:');
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

  setFixtures(fixtures);
};

const extract_fixtures = async (evt) => {
  const match_url = evt['$ref'].replace(/^http:/, 'https:');
  const match_res = await fetch(match_url);
  const match_data = await match_res.json();

  const comp_url = match_data.competitions[0]['$ref'].replace(/^http:/, 'https:');
  const comp_res = await fetch(comp_url);
  const comp_data = await comp_res.json();

  const [c1, c2] = comp_data['competitors'];
  const competitors = {
    home: {
      obj: c1
    },
    away: {
      obj: c2
    }
  };
  if (c1.homeAway !== 'home')
    [competitors.home.obj, competitors.away.obj] = [c2, c1];

  for (const competitor_type in competitors)
  {
    const competitor = competitors[competitor_type];

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

    delete competitor['obj'];
  }

  const fixture = {
    competitors: competitors,
    kickoff_time: match_data.date
  };

  return fixture;
};

const get_current_week = async () => {
  const url = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl"
  const res = await fetch(url);
  const data = await res.json();

  return data.season.type.week.number;
};

export { get_current_week, get_fixtures };
