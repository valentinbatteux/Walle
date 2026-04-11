import { WidgetCard } from './WidgetCard';
import { FootballConfig } from '../../types/widgets';

const DEMO_MATCHES = [
  { home: 'PSG', away: 'Real Madrid', comp: 'Ligue des Champions', date: '15 Avr', time: '21:00', homeScore: null, awayScore: null, live: false },
  { home: 'OM',  away: 'Lyon',        comp: 'Ligue 1',             date: '13 Avr', time: '17:05', homeScore: 2, awayScore: 1, live: false },
  { home: 'PSG', away: 'Lens',        comp: 'Ligue 1',             date: '19 Avr', time: '20:45', homeScore: null, awayScore: null, live: false },
];

const BallIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12h20"/>
  </svg>
);

interface Props { config: FootballConfig }

export function FootballWidget({ config }: Props) {
  const relevant = DEMO_MATCHES.filter(m =>
    config.teams.some(t => m.home.includes(t) || m.away.includes(t))
  );

  return (
    <WidgetCard title="Football" icon={<BallIcon />} accentColor="rgba(74,222,128,0.7)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {relevant.map((m, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.75rem', borderRadius: '0.85rem',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {/* Date/time */}
            <div style={{ width: 42, flexShrink: 0, textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>{m.date}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 400, color: m.live ? '#4ade80' : 'rgba(255,255,255,0.5)' }}>
                {m.live ? '● LIVE' : m.time}
              </div>
            </div>

            {/* Match */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', textAlign: 'right', flex: 1 }}>{m.home}</span>
              <span style={{
                fontSize: '0.7rem', fontWeight: 300,
                color: m.homeScore !== null ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                background: 'rgba(255,255,255,0.06)', borderRadius: '0.4rem',
                padding: '0.1rem 0.4rem', minWidth: 28, textAlign: 'center',
              }}>
                {m.homeScore !== null ? `${m.homeScore} - ${m.awayScore}` : 'vs'}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', flex: 1 }}>{m.away}</span>
            </div>

            {/* Competition */}
            <div style={{
              fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.06em', width: 56, textAlign: 'right', flexShrink: 0,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{m.comp}</div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
