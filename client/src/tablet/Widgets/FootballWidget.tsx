import { WidgetCard } from './WidgetCard';
import { FootballConfig } from '../../types/widgets';

interface Match { home: string; away: string; comp: string; date: string; time: string; homeGoals: number | null; awayGoals: number | null; }

const ALL_MATCHES: Match[] = [
  { home: 'PSG',       away: 'Monaco',      comp: 'Ligue 1',              date: '12 Avr', time: '20:45', homeGoals: null, awayGoals: null },
  { home: 'OM',        away: 'OL',          comp: 'Ligue 1',              date: '13 Avr', time: '17:05', homeGoals: 2,    awayGoals: 1    },
  { home: 'Nice',      away: 'Lens',        comp: 'Ligue 1',              date: '13 Avr', time: '15:00', homeGoals: null, awayGoals: null },
  { home: 'Rennes',    away: 'PSG',         comp: 'Ligue 1',              date: '19 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'OL',        away: 'Monaco',      comp: 'Ligue 1',              date: '20 Avr', time: '17:05', homeGoals: null, awayGoals: null },
  { home: 'Monaco',    away: 'Nice',        comp: 'Ligue 1',              date: '20 Avr', time: '15:00', homeGoals: null, awayGoals: null },
  { home: 'PSG',       away: 'Dortmund',    comp: 'Ligue des Champions',  date: '15 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Monaco',    away: 'Leverkusen',  comp: 'Ligue Europa',         date: '17 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Arsenal',   away: 'Man City',    comp: 'Premier League',       date: '12 Avr', time: '17:30', homeGoals: null, awayGoals: null },
  { home: 'Liverpool', away: 'Chelsea',     comp: 'Premier League',       date: '13 Avr', time: '16:00', homeGoals: 2,    awayGoals: 2    },
  { home: 'Man Utd',   away: 'Tottenham',   comp: 'Premier League',       date: '13 Avr', time: '14:00', homeGoals: null, awayGoals: null },
  { home: 'Chelsea',   away: 'Arsenal',     comp: 'Premier League',       date: '19 Avr', time: '17:30', homeGoals: null, awayGoals: null },
  { home: 'Man City',  away: 'Liverpool',   comp: 'Premier League',       date: '20 Avr', time: '16:00', homeGoals: null, awayGoals: null },
  { home: 'Man City',  away: 'Real Madrid', comp: 'Ligue des Champions',  date: '15 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Arsenal',   away: 'Bayern',      comp: 'Ligue des Champions',  date: '15 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Real Madrid', away: 'Barça',     comp: 'La Liga',              date: '12 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Atletico',  away: 'Sevilla',     comp: 'La Liga',              date: '13 Avr', time: '19:00', homeGoals: 1,    awayGoals: 0    },
  { home: 'Barça',     away: 'Atletico',    comp: 'La Liga',              date: '20 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Barça',     away: 'Dortmund',    comp: 'Ligue des Champions',  date: '16 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Real Madrid', away: 'Chelsea',   comp: 'Ligue des Champions',  date: '16 Avr', time: '21:00', homeGoals: null, awayGoals: null },
  { home: 'Bayern',    away: 'Dortmund',    comp: 'Bundesliga',           date: '12 Avr', time: '18:30', homeGoals: 3,    awayGoals: 1    },
  { home: 'Leipzig',   away: 'Bayern',      comp: 'Bundesliga',           date: '19 Avr', time: '18:30', homeGoals: null, awayGoals: null },
  { home: 'Dortmund',  away: 'Leverkusen',  comp: 'Bundesliga',           date: '20 Avr', time: '17:30', homeGoals: null, awayGoals: null },
  { home: 'Inter',     away: 'Milan',       comp: 'Serie A',              date: '13 Avr', time: '20:45', homeGoals: null, awayGoals: null },
  { home: 'Juventus',  away: 'Napoli',      comp: 'Serie A',              date: '13 Avr', time: '18:00', homeGoals: 1,    awayGoals: 1    },
  { home: 'Napoli',    away: 'Inter',       comp: 'Serie A',              date: '26 Avr', time: '20:45', homeGoals: null, awayGoals: null },
];

function matchesTeam(teamInMatch: string, teams: string[]) {
  const a = teamInMatch.toLowerCase().replace(/[^a-z0-9]/g, '');
  return teams.some(t => {
    const b = t.toLowerCase().replace(/[^a-z0-9]/g, '');
    return a.includes(b) || b.includes(a);
  });
}

const BallIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
  </svg>
);

const txt  = 'rgba(255,255,255,0.92)';
const mute = 'rgba(255,255,255,0.5)';
const dim  = 'rgba(255,255,255,0.28)';

interface Props { config: FootballConfig; selected?: boolean; onSelect?: () => void; }

export function FootballWidget({ config, selected, onSelect }: Props) {
  const teams = config.teams.filter(t => t.trim().length > 0);
  const relevant = teams.length === 0 ? [] :
    ALL_MATCHES.filter(m => matchesTeam(m.home, teams) || matchesTeam(m.away, teams)).slice(0, 4);

  return (
    <WidgetCard id="football" title="Football" icon={<BallIcon />} wide selected={selected} onSelect={onSelect}>
      {teams.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: mute, textAlign: 'center', padding: '0.5rem 0' }}>
          Ajoutez des équipes dans les paramètres
        </p>
      ) : relevant.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: mute, textAlign: 'center', padding: '0.5rem 0' }}>
          Aucun match trouvé pour : {teams.join(', ')}
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {relevant.map((m, i) => {
            const hasScore = m.homeGoals !== null;
            return (
              <div key={i} style={{
                padding: '0.55rem 0.75rem', borderRadius: '0.85rem',
                background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: txt, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
                  <span style={{
                    fontSize: '0.7rem', color: hasScore ? txt : dim,
                    background: 'rgba(255,255,255,0.1)', borderRadius: '0.35rem',
                    padding: '0.1rem 0.4rem', minWidth: 32, textAlign: 'center', flexShrink: 0,
                  }}>
                    {hasScore ? `${m.homeGoals}–${m.awayGoals}` : 'vs'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: txt, flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.57rem', color: dim }}>📅 {m.date} {m.time}</span>
                  <span style={{ fontSize: '0.55rem', color: mute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>{m.comp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
