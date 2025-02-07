"use client";

import { dark, light, palette } from "@/theme";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type Theme = "dark" | "light";
export type ThemeColorType = typeof palette & typeof dark;
type ThemeStore = {
  theme: Theme;
  colors: ThemeColorType;
  changeTheme: (theme: Theme) => void;
  isDarkMode: boolean;
};

const themeContext = createContext<ThemeStore>({
  theme: "light",
  changeTheme: () => {
    console.info("changeTheme is not implemented");
  },
  colors: {
    ...light,
    ...palette,
  },
  isDarkMode: false,
});

const { Provider } = themeContext;

type ThemeProviderProps = {
  defaultTheme: Theme;
};

export function ThemeProvider(props: PropsWithChildren<ThemeProviderProps>) {
  const [theme, setTheme] = useState<Theme>(props.defaultTheme);

  const changeTheme = useCallback((theme: Theme) => {
    // set cookie;
    // toggle document data-theme attributes
    setTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  const isDarkMode = theme === "dark";

  const colors = useMemo(() => {
    if (theme === "dark") {
      return {
        ...dark,
        ...palette,
      };
    } else {
      return {
        ...light,
        ...palette,
      };
    }
  }, [theme]);

  const value = useMemo<ThemeStore>(
    () => ({
      theme,
      colors,
      changeTheme,
      isDarkMode,
    }),
    [changeTheme, isDarkMode, colors, theme]
  );
  return <Provider value={value}>{props.children}</Provider>;
}

export function useTheme() {
  return useContext(themeContext);
}
