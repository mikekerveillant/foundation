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
