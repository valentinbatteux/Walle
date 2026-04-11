import { motion } from 'framer-motion';
import { WidgetCard } from './WidgetCard';
import { WeatherConfig } from '../../types/widgets';
import { useWeather } from '../../hooks/useWeather';

const WeatherIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/>
    <line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/>
    <line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

interface Props { config: WeatherConfig }

export function WeatherWidget({ config }: Props) {
  const { data, loading, error } = useWeather(config.city);

  return (
    <WidgetCard title={data?.city ?? config.city} icon={<WeatherIcon />} accentColor="rgba(56,189,248,0.7)">
      {loading && !data && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: 80, justifyContent: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(56,189,248,0.2)', borderTopColor: 'rgba(56,189,248,0.8)' }}
          />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>Chargement…</span>
        </div>
      )}

      {error && (
        <div style={{ minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(248,113,113,0.7)', textAlign: 'center' }}>
            ⚠ {error}
          </span>
        </div>
      )}

      {data && (
        <>
          {/* Current conditions */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '3.2rem', lineHeight: 1 }}>{data.icon}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <span style={{ fontSize: '2.6rem', fontWeight: 100, color: 'rgba(255,255,255,0.92)', lineHeight: 1 }}>
                  {data.temp}°
                </span>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
                  Ressenti {data.feels}°
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 300, color: 'rgba(255,255,255,0.6)', marginTop: '0.15rem' }}>
                {data.desc}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', marginTop: '0.1rem' }}>
                💧 {data.humidity}% · 🌬 {data.wind} km/h
              </div>
            </div>
          </div>

          {/* 5-day forecast */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.3rem' }}>
            {data.forecast.map((f, i) => (
              <div key={i} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                padding: '0.4rem 0.2rem', borderRadius: '0.75rem',
                background: i === 0 ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i === 0 ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)'}`,
              }}>
                <span style={{ fontSize: '0.57rem', color: i === 0 ? 'rgba(56,189,248,0.7)' : 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>{f.day}</span>
                <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>{f.high}°</span>
                <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)' }}>{f.low}°</span>
              </div>
            ))}
          </div>
        </>
      )}
    </WidgetCard>
  );
}
