import { DragControls } from 'framer-motion';
import { WidgetCard } from './WidgetCard';
import { BrocanteConfig } from '../../types/widgets';
import { useBrocante } from '../../hooks/useBrocante';

const ShopIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const txt  = 'rgba(255,255,255,0.92)';
const mute = 'rgba(255,255,255,0.5)';
const dim  = 'rgba(255,255,255,0.28)';

interface Props { config: BrocanteConfig; dragControls: DragControls; isDragging?: boolean; onSettingsClick?: () => void; }

export function BrocanteWidget({ config, dragControls, isDragging, onSettingsClick }: Props) {
  const { events, loading, aiPowered } = useBrocante(config.city, config.radiusKm);

  const hasKey = !!localStorage.getItem('walle_openai_key');

  return (
    <WidgetCard
      id="brocante"
      title={`Brocantes · ${config.city}`}
      icon={<ShopIcon />}
      dragControls={dragControls}
      isDragging={isDragging}
      onSettingsClick={onSettingsClick}
    >
      {!hasKey ? (
        <p style={{ fontSize: '0.72rem', color: mute, textAlign: 'center', padding: '0.5rem 0', lineHeight: 1.5 }}>
          Configure ta clé OpenAI<br />
          <span style={{ color: dim, fontSize: '0.65rem' }}>en cliquant sur Walle</span>
        </p>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,220,100,0.6)', animation: `pulse 1s ${i*0.2}s infinite` }} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: mute, textAlign: 'center', padding: '0.5rem 0' }}>
          Aucune brocante trouvée dans {config.radiusKm} km
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {events.map((e, i) => (
              <div key={i} style={{
                padding: '0.5rem 0.65rem', borderRadius: '0.8rem',
                background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 400, color: txt, flex: 1 }}>{e.name}</span>
                  <span style={{
                    fontSize: '0.58rem', fontWeight: 600, color: 'rgba(255,220,120,0.9)',
                    background: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: '0.1rem 0.4rem',
                    flexShrink: 0, whiteSpace: 'nowrap',
                  }}>
                    {e.exhibitors} expo.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.15rem' }}>
                  <span style={{ fontSize: '0.6rem', color: dim }}>📅 {e.date}</span>
                  <span style={{ fontSize: '0.6rem', color: dim }}>📍 {e.location} · {e.distanceKm} km</span>
                </div>
              </div>
            ))}
          </div>
          {aiPowered && (
            <p style={{ fontSize: '0.55rem', color: dim, textAlign: 'right', marginTop: '0.4rem' }}>
              ✦ Suggestions IA · actualisé quotidiennement
            </p>
          )}
        </>
      )}
    </WidgetCard>
  );
}
