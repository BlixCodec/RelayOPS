import { useEffect, useState } from "react";

// Simple hook: subscribes to a 1s tick after mount. Returns 0 on SSR/first
// paint so server and client agree, then real timestamps once mounted.
export function useNow(): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}
