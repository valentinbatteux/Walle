import { WidgetCard } from './WidgetCard';
import { WeatherConfig } from '../../types/widgets';

const DEMO = {
  temp: 17,
  feels: 14,
  desc: 'Partiellement nuageux',
  humidity: 62,
  wind: 18,
  forecast: [
    { day: 'Lun', icon: '🌤', high: 19, low: 12 },
    { day: 'Mar', icon: '🌧', high: 14, low: 9  },
    { day: 'Mer', icon: '⛅', high: 16, low: 11 },
    { day: 'Jeu', icon: '☀️', high: 22, low: 13 },
    { day: 'Ven', icon: '🌤', high: 20, low: 12 },
  ],
};

const WeatherIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

interface Props { config: WeatherConfig }

export function WeatherWidget({ config }: Props) {
  return (
    <WidgetCard title={config.city} icon={<WeatherIcon />} accentColor="rgba(56,189,248,0.7)">
      {/* Main temp */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '2.8rem', fontWeight: 100, color: 'rgba(255,255,255,0.92)', lineHeight: 1 }}>
          {DEMO.temp}°
        </span>
        <div style={{ paddingBottom: '0.3rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 300, color: 'rgba(255,255,255,0.6)' }}>{DEMO.desc}</div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>Ressenti {DEMO.feels}° · 💧{DEMO.humidity}% · 🌬{DEMO.wind}km/h</div>
        </div>
      </div>

      {/* 5-day forecast */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.25rem' }}>
        {DEMO.forecast.map(f => (
          <div key={f.day} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
            padding: '0.4rem 0.25rem', borderRadius: '0.75rem',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>{f.day}</span>
            <span style={{ fontSize: '1rem' }}>{f.icon}</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 300, color: 'rgba(255,255,255,0.75)' }}>{f.high}°</span>
            <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)' }}>{f.low}°</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
