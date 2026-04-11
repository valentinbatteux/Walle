import { useMemo } from 'react';

export type DeviceType = 'tablet' | 'phone';

export function useDeviceType(): DeviceType {
  return useMemo(() => {
    // Allow override via URL query param for development
    const params = new URLSearchParams(window.location.search);
    if (params.get('device') === 'tablet') return 'tablet';
    if (params.get('device') === 'phone') return 'phone';

    // Tablet = screen width >= 768px (typically in landscape)
    const w = window.screen.width;
    const h = window.screen.height;
    const larger = Math.max(w, h);
    return larger >= 768 ? 'tablet' : 'phone';
  }, []);
}
