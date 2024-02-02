import { useState, useEffect } from "react";

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    windowWidth: 0,
    windowHeight: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
