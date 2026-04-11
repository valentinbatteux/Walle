import { WidgetCard } from './WidgetCard';
import { BrocanteConfig } from '../../types/widgets';

const DEMO_EVENTS = [
  { name: 'Grande Brocante de Vincennes', date: '13 Avr', city: 'Vincennes', dist: '8km', exhibitors: 320 },
  { name: 'Marché aux Puces de Montreuil', date: '13-14 Avr', city: 'Montreuil', dist: '12km', exhibitors: 500 },
  { name: 'Vide-Grenier Villeneuve', date: '20 Avr', city: 'Villeneuve-St-G.', dist: '18km', exhibitors: 140 },
];

const ShopIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

interface Props { config: BrocanteConfig }

export function BrocanteWidget({ config }: Props) {
  const inRange = DEMO_EVENTS.filter(e => parseInt(e.dist) <= config.radiusKm);

  return (
    <WidgetCard title={`Brocantes · ${config.radiusKm}km`} icon={<ShopIcon />} accentColor="rgba(251,191,36,0.7)">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {inRange.length === 0 && (
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '0.5rem 0' }}>
            Aucune brocante dans ce rayon
          </p>
        )}
        {inRange.map((e, i) => (
          <div key={i} style={{
            padding: '0.55rem 0.75rem', borderRadius: '0.85rem',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'rgba(255,255,255,0.82)', flex: 1, marginRight: '0.5rem' }}>
                {e.name}
              </span>
              <span style={{
                fontSize: '0.6rem', fontWeight: 500, color: 'rgba(251,191,36,0.8)',
                background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: '999px', padding: '0.1rem 0.45rem', flexShrink: 0, whiteSpace: 'nowrap',
              }}>
                {e.exhibitors} exposants
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>📅 {e.date}</span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>📍 {e.city} · {e.dist}</span>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
