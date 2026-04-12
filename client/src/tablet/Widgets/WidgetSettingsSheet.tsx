import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetConfig, WidgetId } from '../../types/widgets';
import { WIDGET_THEME } from './WidgetCard';

const LABELS: Record<WidgetId, { name: string; icon: string }> = {
  weather:  { name: 'Météo',      icon: '🌤' },
  tasks:    { name: "Aujourd'hui", icon: '✓'  },
  football: { name: 'Football',   icon: '⚽' },
  shopping: { name: 'Courses',    icon: '🛒' },
  brocante: { name: 'Brocantes',  icon: '🏪' },
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.6rem',
  color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', padding: '0.5rem 0.75rem',
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em',
  textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem', marginTop: '0.8rem',
};

interface Props {
  widget: WidgetConfig;
  onClose: () => void;
  onUpdate: (patch: Partial<WidgetConfig>) => void;
  onToggle: () => void;
}

function ConfigFields({ widget, onUpdate }: { widget: WidgetConfig; onUpdate: (p: Partial<WidgetConfig>) => void }) {
  const [newTeam, setNewTeam] = useState('');

  if (widget.id === 'weather') return (
    <>
      <label style={labelStyle}>Ville</label>
      <input style={inputStyle} value={widget.config.city}
        onChange={e => onUpdate({ config: { ...widget.config, city: e.target.value } } as Partial<WidgetConfig>)}
        placeholder="Paris" />
    </>
  );

  if (widget.id === 'football') {
    const addTeam = () => {
      const t = newTeam.trim().toUpperCase();
      if (!t || widget.config.teams.includes(t)) { setNewTeam(''); return; }
      onUpdate({ config: { ...widget.config, teams: [...widget.config.teams, t] } } as Partial<WidgetConfig>);
      setNewTeam('');
    };
    return (
      <>
        <label style={labelStyle}>Équipes suivies</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
          {widget.config.teams.map(t => (
            <span key={t} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.75rem', padding: '0.2rem 0.65rem', borderRadius: 999,
              background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)',
              color: 'rgba(74,222,128,0.95)',
            }}>
              {t}
              <button onClick={() => onUpdate({ config: { ...widget.config, teams: widget.config.teams.filter(x => x !== t) } } as Partial<WidgetConfig>)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input style={{ ...inputStyle, flex: 1 }} value={newTeam}
            onChange={e => setNewTeam(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTeam()}
            placeholder="Ex: PSG, Bayern, Arsenal…" />
          <button onClick={addTeam} style={{
            padding: '0.5rem 0.85rem', borderRadius: '0.6rem', cursor: 'pointer',
            background: 'rgba(74,222,128,0.18)', border: '1px solid rgba(74,222,128,0.35)',
            color: 'rgba(74,222,128,0.95)', fontSize: '0.85rem',
          }}>+</button>
        </div>
      </>
    );
  }

  if (widget.id === 'brocante') return (
    <>
      <label style={labelStyle}>Ville / Code postal</label>
      <input style={inputStyle} value={widget.config.city}
        onChange={e => onUpdate({ config: { ...widget.config, city: e.target.value } } as Partial<WidgetConfig>)}
        placeholder="Paris" />
      <label style={labelStyle}>Rayon : {widget.config.radiusKm} km</label>
      <input type="range" min={5} max={100} step={5} value={widget.config.radiusKm}
        onChange={e => onUpdate({ config: { ...widget.config, radiusKm: Number(e.target.value) } } as Partial<WidgetConfig>)}
        style={{ width: '100%', accentColor: 'rgba(217,119,6,0.9)', marginTop: '0.2rem' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>
        <span>5 km</span><span>100 km</span>
      </div>
    </>
  );

  if (widget.id === 'shopping') return (
    <>
      <label style={labelStyle}>Articles affichés : {widget.config.maxItems}</label>
      <input type="range" min={3} max={10} step={1} value={widget.config.maxItems}
        onChange={e => onUpdate({ config: { ...widget.config, maxItems: Number(e.target.value) } } as Partial<WidgetConfig>)}
        style={{ width: '100%', accentColor: 'rgba(234,88,12,0.9)', marginTop: '0.2rem' }} />
    </>
  );

  if (widget.id === 'tasks') return (
    <>
      <label style={labelStyle}>Tâches terminées</label>
      <button
        onClick={() => onUpdate({ config: { ...widget.config, showCompleted: !widget.config.showCompleted } } as Partial<WidgetConfig>)}
        style={{
          padding: '0.45rem 0.9rem', borderRadius: '0.6rem', cursor: 'pointer',
          background: widget.config.showCompleted ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem',
        }}>
        {widget.config.showCompleted ? 'Affichées' : 'Masquées'}
      </button>
    </>
  );

  return null;
}

export function WidgetSettingsSheet({ widget, onClose, onUpdate, onToggle }: Props) {
  const meta = LABELS[widget.id];
  const theme = WIDGET_THEME[widget.id];

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.8 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 51,
          borderRadius: '1.75rem 1.75rem 0 0',
          background: 'rgba(8,5,22,0.96)',
          backdropFilter: 'blur(40px)',
          borderTop: `2px solid ${theme.bg}`,
          boxShadow: `0 -20px 80px rgba(0,0,0,0.6), 0 -4px 40px ${theme.glow}`,
          padding: '0 1.5rem 2.5rem',
          maxHeight: '70vh', overflowY: 'auto',
        }}
      >
        {/* Drag bar */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.85rem', paddingBottom: '0.5rem' }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontSize: '1.6rem', width: 44, height: 44, display: 'flex', alignItems: 'center',
              justifyContent: 'center', borderRadius: '0.85rem',
              background: theme.bg, boxShadow: `0 4px 16px ${theme.glow}`,
            }}>{meta.icon}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 300, color: 'rgba(255,255,255,0.92)' }}>
                {meta.name}
              </h2>
              <p style={{ margin: 0, fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
                Paramètres du widget
              </p>
            </div>
          </div>

          {/* Enable/disable toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
              {widget.enabled ? 'Actif' : 'Désactivé'}
            </span>
            <button onClick={onToggle} style={{
              width: 44, height: 24, borderRadius: 999, cursor: 'pointer', position: 'relative',
              background: widget.enabled ? theme.bg : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)', transition: 'background 0.2s',
            }}>
              <span style={{
                position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%',
                background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                left: widget.enabled ? 22 : 2,
              }} />
            </button>
          </div>
        </div>

        {/* Config fields */}
        <ConfigFields widget={widget} onUpdate={onUpdate} />

        {/* Close button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onClose}
          style={{
            width: '100%', marginTop: '1.5rem', padding: '0.75rem',
            borderRadius: '0.85rem', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)',
            fontSize: '0.85rem', letterSpacing: '0.08em',
          }}
        >
          Fermer
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
