import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetConfig, WidgetId, WidgetMap } from '../../types/widgets';

interface Props {
  widgets: WidgetMap;
  onClose: () => void;
  onToggle: (id: WidgetId) => void;
  onUpdate: (id: WidgetId, patch: Partial<WidgetConfig>) => void;
  onReorder: (id: WidgetId, dir: 'up' | 'down') => void;
}

const WIDGET_LABELS: Record<WidgetId, { name: string; icon: string; desc: string }> = {
  weather:  { name: 'Météo',     icon: '🌤', desc: 'Température et prévisions' },
  football: { name: 'Football',  icon: '⚽', desc: 'Matchs de vos équipes' },
  brocante: { name: 'Brocantes', icon: '🏪', desc: 'Événements à proximité' },
  shopping: { name: 'Courses',   icon: '🛒', desc: 'Aperçu de votre liste' },
  tasks:    { name: "Aujourd'hui", icon: '✓', desc: 'Tâches du jour' },
};

function TeamTag({ team, onRemove }: { team: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '999px',
      background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)',
      color: 'rgba(74,222,128,0.9)',
    }}>
      {team}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', lineHeight: 1, padding: 0, fontSize: '0.8rem' }}>×</button>
    </span>
  );
}

function WidgetConfigRow({
  widget, onToggle, onUpdate, onReorder, isFirst, isLast,
}: {
  widget: WidgetConfig;
  onToggle: () => void;
  onUpdate: (patch: Partial<WidgetConfig>) => void;
  onReorder: (dir: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = WIDGET_LABELS[widget.id];

  return (
    <div style={{
      borderRadius: '1rem',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      overflow: 'hidden',
      marginBottom: '0.5rem',
    }}>
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}>
        <span style={{ fontSize: '1.1rem', width: 28, textAlign: 'center' }}>{meta.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>{meta.name}</div>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{meta.desc}</div>
        </div>

        {/* Order buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            onClick={() => onReorder('up')}
            disabled={isFirst}
            style={{ background: 'none', border: 'none', cursor: isFirst ? 'default' : 'pointer', opacity: isFirst ? 0.2 : 0.5, padding: '0.1rem', color: 'white', lineHeight: 1, fontSize: '0.6rem' }}
          >▲</button>
          <button
            onClick={() => onReorder('down')}
            disabled={isLast}
            style={{ background: 'none', border: 'none', cursor: isLast ? 'default' : 'pointer', opacity: isLast ? 0.2 : 0.5, padding: '0.1rem', color: 'white', lineHeight: 1, fontSize: '0.6rem' }}
          >▼</button>
        </div>

        {/* Settings gear (only if enabled) */}
        {widget.enabled && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: expanded ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.45)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        )}

        {/* Toggle switch */}
        <button
          onClick={onToggle}
          style={{
            width: 40, height: 22, borderRadius: 999, cursor: 'pointer',
            background: widget.enabled ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            position: 'relative', transition: 'background 0.2s',
          }}
        >
          <span style={{
            position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
            background: 'white', transition: 'left 0.2s',
            left: widget.enabled ? 20 : 2,
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }} />
        </button>
      </div>

      {/* Expanded config */}
      <AnimatePresence>
        {expanded && widget.enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <WidgetConfigForm widget={widget} onUpdate={onUpdate} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WidgetConfigForm({ widget, onUpdate }: { widget: WidgetConfig; onUpdate: (patch: Partial<WidgetConfig>) => void }) {
  const [newTeam, setNewTeam] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem',
    color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', padding: '0.4rem 0.65rem',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.12em',
    textTransform: 'uppercase', marginBottom: '0.35rem', marginTop: '0.6rem', display: 'block',
  };

  if (widget.id === 'weather') {
    return (
      <>
        <label style={labelStyle}>Ville</label>
        <input
          style={inputStyle}
          value={widget.config.city}
          onChange={e => onUpdate({ config: { ...widget.config, city: e.target.value } } as Partial<WidgetConfig>)}
          placeholder="Paris"
        />
      </>
    );
  }

  if (widget.id === 'football') {
    const addTeam = () => {
      const t = newTeam.trim().toUpperCase();
      if (!t || widget.config.teams.includes(t)) return;
      onUpdate({ config: { ...widget.config, teams: [...widget.config.teams, t] } } as Partial<WidgetConfig>);
      setNewTeam('');
    };
    return (
      <>
        <label style={labelStyle}>Équipes suivies</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
          {widget.config.teams.map(t => (
            <TeamTag key={t} team={t} onRemove={() =>
              onUpdate({ config: { ...widget.config, teams: widget.config.teams.filter(x => x !== t) } } as Partial<WidgetConfig>)
            } />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={newTeam}
            onChange={e => setNewTeam(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTeam()}
            placeholder="Ex: PSG"
          />
          <button
            onClick={addTeam}
            style={{
              padding: '0.4rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer',
              background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)',
              color: 'rgba(74,222,128,0.9)', fontSize: '0.75rem',
            }}
          >+</button>
        </div>
      </>
    );
  }

  if (widget.id === 'brocante') {
    return (
      <>
        <label style={labelStyle}>Ville / Code postal</label>
        <input
          style={inputStyle}
          value={widget.config.city}
          onChange={e => onUpdate({ config: { ...widget.config, city: e.target.value } } as Partial<WidgetConfig>)}
          placeholder="Paris"
        />
        <label style={labelStyle}>Rayon (km): {widget.config.radiusKm}</label>
        <input
          type="range" min={5} max={100} step={5}
          value={widget.config.radiusKm}
          onChange={e => onUpdate({ config: { ...widget.config, radiusKm: Number(e.target.value) } } as Partial<WidgetConfig>)}
          style={{ width: '100%', accentColor: 'rgba(167,139,250,0.8)' }}
        />
      </>
    );
  }

  if (widget.id === 'shopping') {
    return (
      <>
        <label style={labelStyle}>Nombre d'articles affichés: {widget.config.maxItems}</label>
        <input
          type="range" min={3} max={10} step={1}
          value={widget.config.maxItems}
          onChange={e => onUpdate({ config: { ...widget.config, maxItems: Number(e.target.value) } } as Partial<WidgetConfig>)}
          style={{ width: '100%', accentColor: 'rgba(167,139,250,0.8)' }}
        />
      </>
    );
  }

  if (widget.id === 'tasks') {
    return (
      <>
        <label style={labelStyle}>Afficher les tâches complètes</label>
        <button
          onClick={() => onUpdate({ config: { ...widget.config, showCompleted: !widget.config.showCompleted } } as Partial<WidgetConfig>)}
          style={{
            padding: '0.4rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer',
            background: widget.config.showCompleted ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem',
          }}
        >
          {widget.config.showCompleted ? 'Oui' : 'Non'}
        </button>
      </>
    );
  }

  return null;
}

export function SettingsPanel({ widgets, onClose, onToggle, onUpdate, onReorder }: Props) {
  const sorted = Object.values(widgets).sort((a, b) => a.order - b.order);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      style={{
        position: 'fixed', top: 80, right: 24, zIndex: 50,
        width: 360, maxHeight: 'calc(100vh - 120px)',
        borderRadius: '1.5rem',
        background: 'rgba(8, 5, 20, 0.92)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(167,139,250,0.2)',
        boxShadow: '0 20px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 1.25rem 0.75rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <div>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 300, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Paramètres</h2>
          <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', margin: '0.15rem 0 0', letterSpacing: '0.08em' }}>
            Gérer les widgets de votre tableau de bord
          </p>
        </div>
        <motion.button
          onClick={onClose}
          whileTap={{ scale: 0.9 }}
          style={{
            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </motion.button>
      </div>

      {/* Widget list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem 1rem', scrollbarWidth: 'none' }}>
        <p style={{
          fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
          marginBottom: '0.75rem',
        }}>
          Widgets
        </p>
        {sorted.map((w, i) => (
          <WidgetConfigRow
            key={w.id}
            widget={w}
            onToggle={() => onToggle(w.id)}
            onUpdate={(patch) => onUpdate(w.id, patch)}
            onReorder={(dir) => onReorder(w.id, dir)}
            isFirst={i === 0}
            isLast={i === sorted.length - 1}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.18)', textAlign: 'center', letterSpacing: '0.08em' }}>
          Les préférences sont sauvegardées localement
        </p>
      </div>
    </motion.div>
  );
}
