export interface Team {
  id: string;
  name: string;
  franchise: {
    name: string;
    prefix: string;
    logo?: string;
  };
  tier: {
    name: string;
  };
}

export interface Franchise {
  name: string;
  prefix: string;
  logo?: { name: string };
  teams: {
    id: string;
    name: string;
    tier: {
      name: string;
    };
  }[];
}

export interface Match {
  id: string;
  scheduledDate: string;
  home: {
    id: string;
    name: string;
    franchise: {
      name: string;
      prefix: string;
      logo?: string;
    };
  };
  away: {
    id: string;
    name: string;
    franchise: {
      name: string;
      prefix: string;
      logo?: string;
    };
  };
}

const FRANCHISES_QUERY = `
  query franchises {
    franchises(active: true) {
      name
      prefix
      logo {
        name
      }
      teams {
        id
        name
        tier { 
          name
        }
      }
    }
  }
`;

export async function fetchTeams(): Promise<Team[]> {
  const response = await fetch('https://core.csconfederation.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: FRANCHISES_QUERY,
      variables: {},
    }),
  });

  const json = await response.json();
  const franchises: Franchise[] = json.data?.franchises || [];

  const teams: Team[] = [];
  for (const franchise of franchises) {
    for (const team of franchise.teams) {
      teams.push({
        id: team.id,
        name: team.name,
        franchise: {
          name: franchise.name,
          prefix: franchise.prefix,
          logo: `https://raw.githubusercontent.com/darkstars31/csc-stat-viewer/master/src/assets/images/franchise/${franchise.prefix}.png`,
        },
        tier: {
          name: team.tier?.name || 'Unknown',
        },
      });
    }
  }

  return teams.sort((a, b) => a.name.localeCompare(b.name));
}
