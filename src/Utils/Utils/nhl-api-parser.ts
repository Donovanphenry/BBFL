const get_next_match = (gid) => {
  if (gid === 1)
    return null;
  return Math.floor(gid / 2);
}

const get_round_name = (gid) => {
  if (gid === 1)
    return 'Finals';
  if (gid >= 2 && gid <= 3)
    return `Round 3 - Match ${gid - 2}`;
  if (gid >= 4 && gid <= 7)
    return `Round 2 - Match ${gid - 4}`;
  if (gid >= 8 && gid <= 15)
    return `Round 1 - Match ${gid - 8}`;
}

export async function getNHLPlayoffTeams() {
  const response = await fetch('https://statsapi.web.nhl.com/api/v1/standings?expand=standings.record');
  const data = await response.json();

  // Extract the playoff teams from the standings data
  const playoffTeams = {
    'eastern': [],
    'western': []
  };

  const idOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const playoffGames = Array.from({length: 15}, (_, idx) => ({id: idOptions}))
  let team_id = 0;
  let gid = 14;
  data.records.forEach((division) => {
    const current_conference = division.conference.name.toLowerCase();
    division.teamRecords.forEach((team) => {
      const wildCardRank = parseInt(team.wildCardRank);
      if (wildCardRank <= 2) {
        playoffTeams[current_conference].push({
          name: team.team.name,
          seed: team.conferenceRank,
          division: division,
          id: team_id
        });

        team_id++;
      }
    });
  });

  // Return an object with separate arrays for the Eastern and Western conference playoff teams
  return playoffTeams;
}
