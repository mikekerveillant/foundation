import { useState, useEffect } from 'react';
import type { ActiveAlert } from '../types';
import { MOCK_VOLCANO } from '../data/mockData';

interface GVPResponse {
  volcanos: ActiveAlert[];
  fetchedAt: string;
}

export function useVolcanos() {
  const [volcanos, setVolcanos] = useState<ActiveAlert[]>([MOCK_VOLCANO]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/volcanos', { signal: AbortSignal.timeout(10000) })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<GVPResponse>;
      })
      .then(data => {
        if (data.volcanos?.length) {
          setVolcanos(data.volcanos);
        }
      })
      .catch(() => {
        // Network error or Vercel not running locally — keep mock
      })
      .finally(() => setLoading(false));
  }, []);

  return { volcanos, loading };
}
