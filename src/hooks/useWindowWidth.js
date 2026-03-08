import { useState, useEffect } from "react";

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const observer = new ResizeObserver(() => setWidth(window.innerWidth));
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);

  return width;
}
