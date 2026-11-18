import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem("themeMode");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  const toggleTheme = () => setThemeMode((mode) => (mode === "dark" ? "light" : "dark"));

  const theme = useMemo(() => createTheme({
    palette: {
      mode: themeMode,
      primary: { main: "#6254e8", light: "#8176ef", dark: "#4a3fc4", contrastText: "#ffffff" },
      secondary: { main: "#ec4899", contrastText: "#ffffff" },
      background: {
        default: themeMode === "dark" ? "#15192c" : "#f7fbff",
        paper: themeMode === "dark" ? "#20243a" : "#ffffff",
      },
    },
    typography: {
      fontFamily: '"Nunito", "Segoe UI", sans-serif',
      h1: { fontFamily: '"AmazingKids", "Nunito", "Segoe UI", sans-serif' },
      h2: { fontFamily: '"AmazingKids", "Nunito", "Segoe UI", sans-serif' },
      h3: { fontFamily: '"AmazingKids", "Nunito", "Segoe UI", sans-serif' },
      h4: { fontFamily: '"AmazingKids", "Nunito", "Segoe UI", sans-serif' },
      h5: { fontFamily: '"AmazingKids", "Nunito", "Segoe UI", sans-serif' },
      h6: { fontFamily: '"AmazingKids", "Nunito", "Segoe UI", sans-serif' },
      button: { fontFamily: '"Nunito", "Segoe UI", sans-serif', fontWeight: 900, textTransform: "none" },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: '"Nunito", "Segoe UI", sans-serif',
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              fontFamily: '"AmazingKids", "Nunito", "Segoe UI", sans-serif',
            },
          },
        },
      },
    },
  }), [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
}
