const get_matchups = async (setMatchups) => {
  const url = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl"
  const res = await fetch(url);
  const data = await res.json();

  const week_url = data.season.type.week["$ref"];
  const week_res = await fetch(week_url);
  const week_data = await week_res.json();

  const events_url = week_data.events['$ref'];
  const events_res = await fetch(events_url);
  const events_data = await events_res.json();
  const events = events_data.items;

  const competitors = await Promise.all(events.map(evt => get_competitors(evt)));

  setMatchups(competitors);
};

const get_competitors = async (evt) => {
  const match_url = evt['$ref'];
  const match_res = await fetch(match_url);
  const match_data = await match_res.json();

  const comp_url = match_data.competitions[0]['$ref'];
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
  let [home_obj, away_obj] = [c1, c2];
  if (c1.homeAway !== 'home')
    [competitors.home.obj, competitors.away.obj] = [c2, c1];

  for (const competitor_type in competitors)
  {
    const competitor = competitors[competitor_type];

    const competitor_url = competitor.obj.team['$ref'];
    const competitor_res = await fetch(competitor_url);
    const competitor_data = await competitor_res.json();

    const team_url = competitor_data['$ref'];
    const team_res = await fetch(team_url);
    const team_data = await team_res.json();

    competitor['name'] = team_data.displayName;
    competitor['pic'] = team_data.logos[0].href;

    const record_url = competitor_data.record['$ref'];
    const record_res = await fetch(record_url);
    const record_data = await record_res.json();

    competitor['record'] = record_data.items[0].summary;
    competitor['pick'] = 'none';

    delete competitor['obj'];
  }

  return competitors;
};

export { get_matchups };
