import { WidgetCard } from './WidgetCard';
import { ShoppingConfig } from '../../types/widgets';
import { useShopping } from '../../hooks/useShopping';

const CartIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.56l1.65-7.44H6"/>
  </svg>
);

const txt  = 'rgba(255,255,255,0.92)';
const mute = 'rgba(255,255,255,0.5)';

interface Props { config: ShoppingConfig; selected?: boolean; onSelect?: () => void; }

export function ShoppingWidget({ config, selected, onSelect }: Props) {
  const { items } = useShopping();
  const pending = items.filter(i => i.completed !== 1).slice(0, config.maxItems);
  const total = items.filter(i => i.completed !== 1).length;

  return (
    <WidgetCard id="shopping" title="Courses" icon={<CartIcon />} selected={selected} onSelect={onSelect}>
      {/* Big count */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 200, color: txt, lineHeight: 1 }}>{total}</span>
        <span style={{ fontSize: '0.75rem', color: mute }}>article{total !== 1 ? 's' : ''}</span>
      </div>
      {pending.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: mute }}>Liste vide ✓</p>
      ) : (
        <>
          {pending.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.28rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 300, color: txt, flex: 1 }}>{item.name}</span>
              {item.quantity && <span style={{ fontSize: '0.62rem', color: mute }}>{item.quantity}</span>}
            </div>
          ))}
          {total > config.maxItems && (
            <p style={{ fontSize: '0.6rem', color: mute, marginTop: '0.3rem' }}>
              +{total - config.maxItems} autres
            </p>
          )}
        </>
      )}
    </WidgetCard>
  );
}
