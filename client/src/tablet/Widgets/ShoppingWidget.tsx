import { WidgetCard } from './WidgetCard';
import { ShoppingConfig } from '../../types/widgets';
import { useShopping } from '../../hooks/useShopping';

const CartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.56l1.65-7.44H6"/>
  </svg>
);

interface Props { config: ShoppingConfig }

export function ShoppingWidget({ config }: Props) {
  const { items } = useShopping();
  const pending = items.filter(i => i.completed !== 1).slice(0, config.maxItems);
  const total = items.filter(i => i.completed !== 1).length;

  return (
    <WidgetCard title="Courses" icon={<CartIcon />} accentColor="rgba(52,211,153,0.7)">
      {pending.length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '0.5rem 0' }}>
          Liste vide ✓
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.5rem' }}>
            {pending.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(52,211,153,0.5)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 300, color: 'rgba(255,255,255,0.78)', flex: 1 }}>{item.name}</span>
                {item.quantity && (
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{item.quantity}</span>
                )}
              </div>
            ))}
          </div>
          {total > config.maxItems && (
            <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em' }}>
              +{total - config.maxItems} articles supplémentaires
            </p>
          )}
        </>
      )}
    </WidgetCard>
  );
}
