import { useState } from 'react';
import { BottomNav } from './Navigation/BottomNav';
import { TodayTab } from './TodayTab/TodayTab';
import { TasksTab } from './TasksTab/TasksTab';
import { ShoppingTab } from './ShoppingTab/ShoppingTab';

type Tab = 'today' | 'tasks' | 'shopping';

export function PhoneApp() {
  const [activeTab, setActiveTab] = useState<Tab>('today');

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: '#070a14', color: 'rgba(255,255,255,0.85)' }}
    >
      {/* Top safe area */}
      <div style={{ paddingTop: 'env(safe-area-inset-top)' }} />

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'today' && <TodayTab />}
        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'shopping' && <ShoppingTab />}
      </div>

      <BottomNav active={activeTab} onChange={(t) => setActiveTab(t as Tab)} />
    </div>
  );
}
