import { useState } from 'react';

interface Props {
  onAdd: (name: string, quantity?: string, category?: string) => Promise<void>;
}

const CATEGORIES = ['Épicerie', 'Fruits & Légumes', 'Boulangerie', 'Produits laitiers', 'Viande & Poisson', 'Surgelés', 'Hygiène', 'Entretien', 'Divers'];

export function AddShoppingItem({ onAdd }: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onAdd(name.trim(), quantity || undefined, category || undefined);
    setName('');
    setQuantity('');
    setSubmitting(false);
    setExpanded(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-4 my-4 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="Ajouter un article..."
          className="flex-1 bg-transparent text-sm font-light focus:outline-none"
          style={{ color: 'rgba(255,255,255,0.85)' }}
        />
        {name && (
          <button
            type="submit"
            disabled={submitting}
            className="px-3 py-1 rounded-full text-xs"
            style={{
              background: 'rgba(52,211,153,0.15)',
              color: 'rgba(52,211,153,0.9)',
              border: '1px solid rgba(52,211,153,0.2)',
            }}
          >
            {submitting ? '...' : 'Ajouter'}
          </button>
        )}
      </div>

      {expanded && name && (
        <div className="px-4 pb-3 flex gap-2 flex-wrap border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <input
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="Quantité (ex: 2, 500g...)"
            className="bg-transparent text-xs font-light focus:outline-none flex-1"
            style={{ color: 'rgba(255,255,255,0.5)', minWidth: '100px', paddingTop: '0.5rem' }}
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-transparent text-xs font-light focus:outline-none"
            style={{ color: 'rgba(255,255,255,0.4)', paddingTop: '0.5rem' }}
          >
            <option value="">Catégorie</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c} style={{ background: '#0a0e1a' }}>{c}</option>
            ))}
          </select>
        </div>
      )}
    </form>
  );
}
