import { DragControls } from 'framer-motion';
import { WidgetCard } from './WidgetCard';
import { FootballConfig } from '../../types/widgets';
import { useFootball } from '../../hooks/useFootball';

const BallIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
  </svg>
);

const txt  = 'rgba(255,255,255,0.92)';
const mute = 'rgba(255,255,255,0.5)';
const dim  = 'rgba(255,255,255,0.28)';

function dateLabel(d: Date): string {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day   = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff  = Math.round((day.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0)  return "Aujourd'hui";
  if (diff === 1)  return 'Demain';
  if (diff === -1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

interface Props { config: FootballConfig; dragControls: DragControls; isDragging?: boolean; onSettingsClick?: () => void; }

export function FootballWidget({ config, dragControls, isDragging, onSettingsClick }: Props) {
  const teams = config.teams.filter(t => t.trim().length > 0);
  const { matches, loading, error } = useFootball(teams);

  return (
    <WidgetCard id="football" title="Football" icon={<BallIcon />} wide dragControls={dragControls} isDragging={isDragging} onSettingsClick={onSettingsClick}>
      {teams.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: mute, textAlign: 'center', padding: '0.5rem 0' }}>
          Ajoutez des équipes dans les paramètres
        </p>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(167,139,250,0.6)', animation: `pulse 1s ${i*0.2}s infinite` }} />
          ))}
        </div>
      ) : error ? (
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,120,120,0.7)', textAlign: 'center', padding: '0.5rem 0' }}>
          Erreur de connexion
        </p>
      ) : matches.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: mute, textAlign: 'center', padding: '0.5rem 0' }}>
          Aucun match trouvé pour : {teams.join(', ')}
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {matches.map((m) => {
            const hasScore = m.homeScore !== null;
            const isLive   = m.status === 'live';
            return (
              <div key={m.id} style={{
                padding: '0.55rem 0.75rem', borderRadius: '0.85rem',
                background: isLive ? 'rgba(255,80,80,0.08)' : 'rgba(0,0,0,0.22)',
                border: `1px solid ${isLive ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.1)'}`,
              }}>
                {/* Teams row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: txt, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.homeShort}
                  </span>
                  <span style={{
                    fontSize: '0.68rem', color: hasScore ? txt : dim,
                    background: isLive ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '0.35rem', padding: '0.1rem 0.45rem',
                    minWidth: 34, textAlign: 'center', flexShrink: 0, fontWeight: hasScore ? 600 : 400,
                  }}>
                    {hasScore ? `${m.homeScore}–${m.awayScore}` : 'vs'}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: txt, flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.awayShort}
                  </span>
                </div>
                {/* Meta row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.28rem', gap: 4 }}>
                  <span style={{ fontSize: '0.57rem', color: isLive ? 'rgba(255,120,120,0.9)' : dim, flexShrink: 0 }}>
                    {isLive ? '🔴 Live' : `📅 ${dateLabel(m.date)} ${m.time}`}
                  </span>
                  <span style={{ fontSize: '0.55rem', color: mute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.competition}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
