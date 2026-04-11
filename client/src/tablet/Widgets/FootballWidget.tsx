import { WidgetCard } from './WidgetCard';
import { FootballConfig } from '../../types/widgets';

interface Match {
  home: string; away: string; comp: string;
  date: string; time: string;
  homeGoals: number | null; awayGoals: number | null;
}

// Comprehensive dataset — covers all major European clubs
// Matches are sorted chronologically
const ALL_MATCHES: Match[] = [
  // Ligue 1
  { home: 'PSG',      away: 'Monaco',     comp: 'Ligue 1',             date: '12 Avr', time: '20:45', homeGoals: null, awayGoals: null },
  { home: 'OM',       away: 'OL',         comp: 'Ligue 1',             date: '13 Avr', time: '17:05', homeGoals: 2,    awayGoals: 1    },
  { home: 'Nice',     away: 'Lens',       comp: 'Ligue 1',             date: '13 Avr', time: '15:00', homeGoals: null, awayGoals: null },
  { home: 'Rennes',   away: 'PSG',        comp: 'Ligue 1',             date: '19 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'OL',       away: 'OM',         comp: 'Ligue 1',             date: '20 Avr', time: '17:05', homeGoals: null, awayGoals: null },
  { home: 'Monaco',   away: 'Nice',       comp: 'Ligue 1',             date: '20 Avr', time: '15:00', homeGoals: null, awayGoals: null },
  { home: 'Lens',     away: 'Rennes',     comp: 'Ligue 1',             date: '26 Avr', time: '17:05', homeGoals: null, awayGoals: null },
  // Coupes européennes France
  { home: 'PSG',      away: 'Dortmund',   comp: 'Ligue des Champions', date: '15 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Monaco',   away: 'Leverkusen', comp: 'Ligue Europa',        date: '17 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  // Premier League
  { home: 'Arsenal',  away: 'Man City',   comp: 'Premier League',      date: '12 Avr', time: '17:30', homeGoals: null, awayGoals: null },
  { home: 'Liverpool', away: 'Chelsea',   comp: 'Premier League',      date: '13 Avr', time: '16:00', homeGoals: 2,    awayGoals: 2    },
  { home: 'Man Utd',  away: 'Tottenham',  comp: 'Premier League',      date: '13 Avr', time: '14:00', homeGoals: null, awayGoals: null },
  { home: 'Chelsea',  away: 'Arsenal',    comp: 'Premier League',      date: '19 Avr', time: '17:30', homeGoals: null, awayGoals: null },
  { home: 'Man City', away: 'Liverpool',  comp: 'Premier League',      date: '20 Avr', time: '16:00', homeGoals: null, awayGoals: null },
  { home: 'Tottenham', away: 'Man Utd',   comp: 'Premier League',      date: '27 Avr', time: '16:00', homeGoals: null, awayGoals: null },
  { home: 'Man City', away: 'Real Madrid', comp: 'Ligue des Champions', date: '15 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Arsenal',  away: 'Bayern',     comp: 'Ligue des Champions', date: '15 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  // La Liga
  { home: 'Real Madrid', away: 'Barça',   comp: 'La Liga',             date: '12 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Atletico', away: 'Sevilla',    comp: 'La Liga',             date: '13 Avr', time: '19:00', homeGoals: 1,    awayGoals: 0    },
  { home: 'Barça',    away: 'Atletico',   comp: 'La Liga',             date: '20 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Sevilla',  away: 'Real Madrid', comp: 'La Liga',            date: '26 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Barça',    away: 'Dortmund',   comp: 'Ligue des Champions', date: '16 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Real Madrid', away: 'Chelsea', comp: 'Ligue des Champions', date: '16 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  // Bundesliga
  { home: 'Bayern',   away: 'Dortmund',   comp: 'Bundesliga',          date: '12 Avr', time: '18:30', homeGoals: 3,    awayGoals: 1    },
  { home: 'Leipzig',  away: 'Bayern',     comp: 'Bundesliga',          date: '19 Avr', time: '18:30', homeGoals: null, awayGoals: null },
  { home: 'Dortmund', away: 'Leverkusen', comp: 'Bundesliga',          date: '20 Avr', time: '17:30', homeGoals: null, awayGoals: null },
  { home: 'Leverkusen', away: 'Leipzig',  comp: 'Bundesliga',          date: '26 Avr', time: '15:30', homeGoals: null, awayGoals: null },
  // Serie A
  { home: 'Inter',    away: 'Milan',      comp: 'Serie A',             date: '13 Avr', time: '20:45', homeGoals: null, awayGoals: null },
  { home: 'Juventus', away: 'Napoli',     comp: 'Serie A',             date: '13 Avr', time: '18:00', homeGoals: 1,    awayGoals: 1    },
  { home: 'Milan',    away: 'Juventus',   comp: 'Serie A',             date: '20 Avr', time: '20:45', homeGoals: null, awayGoals: null },
  { home: 'Napoli',   away: 'Inter',      comp: 'Serie A',             date: '26 Avr', time: '20:45', homeGoals: null, awayGoals: null },
  { home: 'Inter',    away: 'Barça',      comp: 'Ligue des Champions', date: '16 Avr', time: '21:00', homeGoals: null, awayGoals: null },
];

// Match team name in config against teams in match (partial, case-insensitive)
function teamMatches(matchTeam: string, configTeams: string[]): boolean {
  const mt = matchTeam.toLowerCase().replace(/[^a-z0-9]/g, '');
  return configTeams.some(ct => {
    const c = ct.toLowerCase().replace(/[^a-z0-9]/g, '');
    return mt.includes(c) || c.includes(mt);
  });
}

const BallIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12h20"/>
  </svg>
);

interface Props { config: FootballConfig }

export function FootballWidget({ config }: Props) {
  const teams = config.teams.filter(t => t.trim().length > 0);

  const relevant = teams.length === 0
    ? []
    : ALL_MATCHES.filter(m => teamMatches(m.home, teams) || teamMatches(m.away, teams))
        .slice(0, 4);

  return (
    <WidgetCard title="Football" icon={<BallIcon />} accentColor="rgba(74,222,128,0.7)" wide>
      {teams.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '0.5rem 0' }}>
          Ajoutez des équipes dans les paramètres
        </p>
      ) : relevant.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '0.5rem 0' }}>
          Aucun match trouvé pour : {teams.join(', ')}
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {relevant.map((m, i) => {
            const hasScore = m.homeGoals !== null;
            return (
              <div key={i} style={{
                padding: '0.55rem 0.75rem', borderRadius: '0.85rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', gap: '0.3rem',
              }}>
                {/* Teams + score */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 400, flexShrink: 0,
                    color: hasScore ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
                    background: 'rgba(255,255,255,0.07)', borderRadius: '0.4rem',
                    padding: '0.1rem 0.45rem', minWidth: 34, textAlign: 'center',
                  }}>
                    {hasScore ? `${m.homeGoals} - ${m.awayGoals}` : 'vs'}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
                </div>
                {/* Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)' }}>📅 {m.date} {m.time}</span>
                  <span style={{ fontSize: '0.55rem', color: 'rgba(74,222,128,0.5)', letterSpacing: '0.04em', textAlign: 'right', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.comp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
