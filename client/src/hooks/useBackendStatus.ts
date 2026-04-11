import { useState, useEffect } from 'react';

let cachedStatus: boolean | null = null;

export function useBackendStatus(): boolean {
  const [online, setOnline] = useState<boolean>(cachedStatus ?? true);

  useEffect(() => {
    if (cachedStatus !== null) {
      setOnline(cachedStatus);
      return;
    }
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then(r => r.ok)
      .then(ok => { cachedStatus = ok; setOnline(ok); })
      .catch(() => { cachedStatus = false; setOnline(false); });
    return () => controller.abort();
  }, []);

  return online;
}
