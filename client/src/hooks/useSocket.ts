import { useEffect } from 'react';
import { getSocket } from '../lib/socketClient';

type EventMap = Record<string, (data: unknown) => void>;

export function useSocket(events: EventMap) {
  useEffect(() => {
    const socket = getSocket();

    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
