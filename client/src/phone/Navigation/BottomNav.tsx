interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  active: string;
  onChange: (id: string) => void;
}

const ICON_TODAY = (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const ICON_TASKS = (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
    <path d="M4 5h12M4 10h8M4 15h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M15 15l1 1 1.5-1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
);
const ICON_SHOPPING = (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
    <path d="M3 3h2l2.4 9.6A2 2 0 007.36 15h8.28a2 2 0 001.96-1.6L19 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="18" r="1" fill="currentColor" />
    <circle cx="15" cy="18" r="1" fill="currentColor" />
  </svg>
);

const TABS: Tab[] = [
  { id: 'today', label: "Aujourd'hui", icon: ICON_TODAY },
  { id: 'tasks', label: 'Tâches', icon: ICON_TASKS },
  { id: 'shopping', label: 'Courses', icon: ICON_SHOPPING },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        background: 'rgba(8, 12, 24, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(tab => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex-1 flex flex-col items-center py-3 gap-1 transition-all duration-200"
            style={{ color: isActive ? 'rgba(160,180,255,0.95)' : 'rgba(255,255,255,0.35)' }}
          >
            {tab.icon}
            <span className="text-xs font-light tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
