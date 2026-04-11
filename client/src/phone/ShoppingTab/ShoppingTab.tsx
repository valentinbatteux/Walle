import { useShopping } from '../../hooks/useShopping';
import { ShoppingItemRow } from './ShoppingItemRow';
import { AddShoppingItem } from './AddShoppingItem';

export function ShoppingTab() {
  const { grouped, loading, addItem, toggleItem, deleteItem, resetList, items } = useShopping();

  const totalCount = items.length;
  const doneCount = items.filter(i => i.completed === 1).length;
  const hasCompleted = doneCount > 0;
  const categories = Object.keys(grouped).sort();

  return (
    <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: 'none' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-light" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Liste de courses
          </h1>
          {totalCount > 0 && (
            <p className="text-xs font-light mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {doneCount}/{totalCount} articles
            </p>
          )}
        </div>
        {hasCompleted && (
          <button
            onClick={resetList}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.35)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            Nouvelle liste
          </button>
        )}
      </div>

      {/* Add item */}
      <AddShoppingItem
        onAdd={async (name, quantity, category) => { await addItem({ name, quantity, category }); }}
      />

      {/* Loading */}
      {loading && (
        <p className="px-4 text-sm font-light" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Chargement...
        </p>
      )}

      {/* Empty state */}
      {!loading && totalCount === 0 && (
        <p className="px-4 mt-4 text-sm font-light" style={{ color: 'rgba(255,255,255,0.2)' }}>
          La liste est vide. Ajoutez vos premiers articles.
        </p>
      )}

      {/* Grouped items */}
      {categories.map(cat => (
        <div key={cat} className="mb-4">
          <p
            className="px-4 py-2 text-xs font-medium tracking-widest uppercase sticky top-0"
            style={{
              color: 'rgba(52,211,153,0.5)',
              background: 'rgba(8,12,24,0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {cat}
          </p>
          <div className="px-4">
            {grouped[cat].map(item => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                onToggle={() => toggleItem(item.id)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
