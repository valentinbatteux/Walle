import { DragControls } from 'framer-motion';
import { WidgetCard } from './WidgetCard';
import { BrocanteConfig } from '../../types/widgets';

interface Event { name: string; date: string; city: string; dist: number; exhibitors: number; }

const CITY_EVENTS: Record<string, Event[]> = {
  paris:      [
    { name: 'Grande Brocante de Vincennes',      date: '13 Avr', city: 'Vincennes',        dist: 8,  exhibitors: 320 },
    { name: 'Marché aux Puces de Montreuil',     date: '13 Avr', city: 'Montreuil',        dist: 12, exhibitors: 500 },
    { name: 'Vide-Grenier Villeneuve-St-G.',     date: '20 Avr', city: 'Villeneuve',       dist: 18, exhibitors: 140 },
    { name: 'Puces de Vanves',                   date: '27 Avr', city: 'Vanves',           dist: 7,  exhibitors: 200 },
  ],
  lyon:       [
    { name: 'Grande Brocante de Bron',           date: '13 Avr', city: 'Bron',             dist: 9,  exhibitors: 210 },
    { name: 'Marché aux Puces Villeurbanne',     date: '14 Avr', city: 'Villeurbanne',     dist: 5,  exhibitors: 145 },
    { name: 'Vide-Grenier de Vénissieux',        date: '20 Avr', city: 'Vénissieux',       dist: 11, exhibitors: 90  },
  ],
  marseille:  [
    { name: 'Brocante du Prado',                 date: '13 Avr', city: 'Marseille',        dist: 4,  exhibitors: 180 },
    { name: "Puces d'Aubagne",                   date: '14 Avr', city: 'Aubagne',          dist: 16, exhibitors: 250 },
    { name: 'Vide-Grenier de Martigues',         date: '20 Avr', city: 'Martigues',        dist: 28, exhibitors: 110 },
  ],
  bordeaux:   [
    { name: 'Puces de Bordeaux Lac',             date: '12 Avr', city: 'Bordeaux',         dist: 6,  exhibitors: 300 },
    { name: 'Brocante de Mérignac',              date: '13 Avr', city: 'Mérignac',         dist: 11, exhibitors: 160 },
    { name: 'Vide-Grenier de Pessac',            date: '19 Avr', city: 'Pessac',           dist: 15, exhibitors: 95  },
  ],
  nice:       [
    { name: 'Brocante Cours Saleya',             date: '13 Avr', city: 'Nice',             dist: 2,  exhibitors: 80  },
    { name: 'Puces de Cannes',                   date: '14 Avr', city: 'Cannes',           dist: 28, exhibitors: 190 },
    { name: "Brocante d'Antibes",                date: '20 Avr', city: 'Antibes',          dist: 20, exhibitors: 140 },
  ],
  lille:      [
    { name: 'Grande Braderie de Lomme',          date: '13 Avr', city: 'Lomme',            dist: 7,  exhibitors: 280 },
    { name: 'Puces de Roubaix',                  date: '14 Avr', city: 'Roubaix',          dist: 14, exhibitors: 350 },
    { name: "Brocante Villeneuve-d'Ascq",        date: '20 Avr', city: "Villeneuve-d'Ascq", dist: 12, exhibitors: 170 },
  ],
  toulouse:   [
    { name: 'Brocante Saint-Sernin',             date: '13 Avr', city: 'Toulouse',         dist: 3,  exhibitors: 120 },
    { name: 'Puces de Blagnac',                  date: '14 Avr', city: 'Blagnac',          dist: 12, exhibitors: 160 },
  ],
  nantes:     [
    { name: 'Vide-Grenier de Saint-Herblain',    date: '14 Avr', city: 'Saint-Herblain',   dist: 8,  exhibitors: 95  },
    { name: 'Puces de Rezé',                     date: '20 Avr', city: 'Rezé',             dist: 6,  exhibitors: 140 },
  ],
  strasbourg: [
    { name: 'Brocante de Lingolsheim',           date: '13 Avr', city: 'Lingolsheim',      dist: 8,  exhibitors: 130 },
    { name: 'Marché aux Puces Hautepierre',      date: '20 Avr', city: 'Strasbourg',       dist: 4,  exhibitors: 80  },
  ],
};

const GENERIC: Event[] = [
  { name: 'Grande Brocante locale',  date: '13 Avr', city: '', dist: 5,  exhibitors: 150 },
  { name: 'Marché aux Puces',        date: '14 Avr', city: '', dist: 15, exhibitors: 220 },
  { name: "Vide-Grenier du quartier", date: '20 Avr', city: '', dist: 8,  exhibitors: 90  },
];

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
}

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
  const key = normalize(config.city);
  const cityKey = Object.keys(CITY_EVENTS).find(k => key.includes(k) || k.includes(key)) ?? null;
  const source = cityKey ? CITY_EVENTS[cityKey] : GENERIC.map(e => ({ ...e, city: config.city }));
  const inRange = source.filter(e => e.dist <= config.radiusKm);

  return (
    <WidgetCard id="brocante" title={`Brocantes · ${config.city}`} icon={<ShopIcon />} dragControls={dragControls} isDragging={isDragging} onSettingsClick={onSettingsClick}>
      {inRange.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: mute, textAlign: 'center', padding: '0.5rem 0' }}>
          Aucune brocante dans {config.radiusKm} km
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {inRange.map((e, i) => (
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
                {e.city && <span style={{ fontSize: '0.6rem', color: dim }}>📍 {e.city} · {e.dist} km</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
