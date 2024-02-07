import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemeAfterLoad() {
  const { resolvedTheme } = useTheme();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme =
      localStorage.getItem("theme") || resolvedTheme || "light";
    setTheme(storedTheme);
  }, [resolvedTheme]);

  return theme;
}
