import { motion } from 'framer-motion';
import { WidgetCard } from './WidgetCard';
import { WeatherConfig } from '../../types/widgets';
import { useWeather } from '../../hooks/useWeather';

const txt  = 'rgba(255,255,255,0.92)';
const mute = 'rgba(255,255,255,0.5)';
const dim  = 'rgba(255,255,255,0.28)';

const WeatherIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
  </svg>
);

interface Props { config: WeatherConfig; selected?: boolean; onSelect?: () => void; }

export function WeatherWidget({ config, selected, onSelect }: Props) {
  const { data, loading, error } = useWeather(config.city);

  return (
    <WidgetCard id="weather" title={data?.city ?? config.city} icon={<WeatherIcon />} selected={selected} onSelect={onSelect}>
      {loading && !data && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: 90, justifyContent: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.8)' }}
          />
          <span style={{ fontSize: '0.72rem', color: mute }}>Chargement…</span>
        </div>
      )}
      {error && (
        <div style={{ minHeight: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,200,200,0.8)', textAlign: 'center' }}>⚠ {error}</span>
        </div>
      )}
      {data && (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '3rem', lineHeight: 1 }}>{data.icon}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 200, color: txt, lineHeight: 1 }}>{data.temp}°</span>
                <span style={{ fontSize: '0.82rem', color: mute, fontWeight: 300 }}>/ {data.feels}°</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: mute, marginTop: '0.1rem' }}>{data.desc}</div>
              <div style={{ fontSize: '0.6rem', color: dim, marginTop: '0.05rem' }}>
                💧{data.humidity}% · 🌬{data.wind} km/h
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {data.forecast.map((f, i) => (
              <div key={i} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.18rem',
                padding: '0.4rem 0.15rem', borderRadius: '0.65rem',
                background: i === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.15)',
              }}>
                <span style={{ fontSize: '0.54rem', color: i === 0 ? 'rgba(255,255,255,0.8)' : dim }}>{f.day}</span>
                <span style={{ fontSize: '0.9rem' }}>{f.icon}</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 500, color: txt }}>{f.high}°</span>
                <span style={{ fontSize: '0.56rem', color: dim }}>{f.low}°</span>
              </div>
            ))}
          </div>
        </>
      )}
    </WidgetCard>
  );
}
