import { useEffect } from 'react';
import { useDeviceType } from './hooks/useDeviceType';
import { TabletApp } from './tablet/TabletApp';
import { PhoneApp } from './phone/PhoneApp';
import { getSocket } from './lib/socketClient';

export default function App() {
  const device = useDeviceType();

  // Initialize socket connection once
  useEffect(() => {
    const socket = getSocket();
    socket.on('connect', () => console.log('Walle connected'));
    socket.on('disconnect', () => console.log('Walle disconnected'));
  }, []);

  return device === 'tablet' ? <TabletApp /> : <PhoneApp />;
}
