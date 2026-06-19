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

// Phone landscape: screen height < 500px (e.g. 375px tall in landscape)
// Use the same compact map-only layout as portrait mobile
export function useIsShortScreen() {
  const [v, setV] = useState(() => window.innerHeight < 500);
  useEffect(() => {
    const fn = () => setV(window.innerHeight < 500);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return v;
}
