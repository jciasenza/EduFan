import React from "react";
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { GameCatalogProvider } from "./context/GameCatalogContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <GameCatalogProvider>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
        </GameCatalogProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
