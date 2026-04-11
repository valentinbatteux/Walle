import { useEffect, useState } from 'react';
import { useDeviceType } from './hooks/useDeviceType';
import { TabletApp } from './tablet/TabletApp';
import { PhoneApp } from './phone/PhoneApp';

declare global {
  interface Window { __walleDemo?: boolean; }
}

export default function App() {
  const device = useDeviceType();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch('/api/health', { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error();
        window.__walleDemo = false;
        // Connect socket only when backend is available
        import('./lib/socketClient').then(({ getSocket }) => {
          const s = getSocket();
          s.on('connect', () => console.log('Walle connected'));
        });
      })
      .catch(() => {
        window.__walleDemo = true;
        console.info('Walle: backend unavailable — demo mode');
      })
      .finally(() => {
        clearTimeout(timeout);
        setReady(true);
      });

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  if (!ready) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#070a14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
      </div>
    );
  }

  return device === 'tablet' ? <TabletApp /> : <PhoneApp />;
}
