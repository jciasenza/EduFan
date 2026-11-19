import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import { useLanguage } from "./LanguageContext";
import { getFallbackCategories, getFallbackGames } from "./gameCatalogFallback";

const GameCatalogContext = createContext(null);

export function GameCatalogProvider({ children }) {
  const { language, translations } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadCatalog = async () => {
      setLoading(true);
      setError("");

      if (!supabase) {
        if (active) {
          setCategories(getFallbackCategories(translations));
          setGames(getFallbackGames(translations));
          setLoading(false);
        }
        return;
      }

      try {
        const [categoryResult, gameResult] = await Promise.all([
          supabase
            .from("game_categories")
            .select("id, title_es, title_en, description_es, description_en, icon, color, sort_order")
            .eq("is_published", true)
            .order("sort_order"),
          supabase
            .from("games")
            .select("id, category_id, title_es, title_en, description_es, description_en, icon, color, route, sort_order")
            .eq("is_published", true)
            .order("sort_order"),
        ]);
        if (categoryResult.error) throw categoryResult.error;
        if (gameResult.error) throw gameResult.error;

        const languageSuffix = language === "es" ? "es" : "en";
        const localizedCategories = (categoryResult.data || []).map((category) => ({
          ...category,
          title: category[`title_${languageSuffix}`],
          description: category[`description_${languageSuffix}`],
        }));
        const localizedGames = (gameResult.data || []).map((game) => ({
          ...game,
          title: game[`title_${languageSuffix}`],
          description: game[`description_${languageSuffix}`],
        }));
        if (active) {
          setCategories(localizedCategories);
          setGames(localizedGames);
        }
      } catch (loadError) {
        console.error("Could not load game catalog:", loadError);
        if (active) {
          setCategories([]);
          setGames([]);
          setError(translations.home?.catalogError || (language === "es"
            ? "No se pudo cargar el catálogo de juegos. Revisa la conexión e inténtalo otra vez."
            : "The game catalog could not be loaded. Check your connection and try again."));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCatalog();
    return () => { active = false; };
  }, [language, retryCount, translations]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  return (
    <GameCatalogContext.Provider value={{ categories, games, loading, error, retry }}>
      {children}
    </GameCatalogContext.Provider>
  );
}

export function useGameCatalog() {
  const context = useContext(GameCatalogContext);
  if (!context) throw new Error("useGameCatalog debe usarse dentro de GameCatalogProvider");
  return context;
}
