export async function getNHLPlayoffTeams() {
  const response = await fetch('https://statsapi.web.nhl.com/api/v1/standings?expand=standings.record');
  const data = await response.json();

  // Extract the playoff teams from the standings data
  const playoffTeams = {
    'eastern': [],
    'western': []
  };
  data.records.forEach((division) => {
    const current_conference = division.conference.name.toLowerCase();
    division.teamRecords.forEach((team) => {
      const wildCardRank = parseInt(team.wildCardRank);
      if (wildCardRank <= 2) {
        playoffTeams[current_conference].push({
          name: team.team.name,
          seed: team.conferenceRank,
        });
      }
    });
  });

  for (const conference in playoffTeams)
    playoffTeams[conference].sort((a, b) => a.seed - b.seed);

  // Return an object with separate arrays for the Eastern and Western conference playoff teams
  return playoffTeams;
}
