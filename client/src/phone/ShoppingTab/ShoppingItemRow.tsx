import { ShoppingItem } from '../../types';

interface Props {
  item: ShoppingItem;
  onToggle: () => void;
  onDelete: () => void;
}

export function ShoppingItemRow({ item, onToggle, onDelete }: Props) {
  const isCompleted = item.completed === 1;

  return (
    <div
      className="flex items-center gap-3 py-2.5 group"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        opacity: isCompleted ? 0.45 : 1,
      }}
    >
      <button
        onClick={onToggle}
        className="w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          borderColor: isCompleted ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.2)',
          background: isCompleted ? 'rgba(52,211,153,0.15)' : 'transparent',
          borderRadius: '0.375rem',
        }}
      >
        {isCompleted && (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <span
        className="flex-1 text-sm font-light"
        style={{
          color: isCompleted ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)',
          textDecoration: isCompleted ? 'line-through' : 'none',
        }}
      >
        {item.name}
      </span>

      {item.quantity && (
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          {item.quantity}
        </span>
      )}

      {item.recurring === 1 && (
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>↺</span>
      )}

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
