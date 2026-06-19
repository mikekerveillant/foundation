import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [v, setV] = useState(() => window.innerWidth <= 640);
  useEffect(() => {
    const fn = () => setV(window.innerWidth <= 640);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return v;
}

// 641–900px: sidebar column exists but is only 56px wide — icons only
export function useIsCompact() {
  const [v, setV] = useState(() => window.innerWidth > 640 && window.innerWidth <= 900);
  useEffect(() => {
    const fn = () => setV(window.innerWidth > 640 && window.innerWidth <= 900);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return v;
}
