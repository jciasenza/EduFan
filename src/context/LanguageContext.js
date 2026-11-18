import React, { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext({ language: "es", translations: {}, setLanguage: () => {} });

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("language");
    return savedLanguage === "en" ? "en" : "es";
  });
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    localStorage.setItem("language", language);
    let active = true;

    fetch(`${process.env.PUBLIC_URL}/data/${language}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`No se pudo cargar ${language}.json`);
        return response.json();
      })
      .then((data) => active && setTranslations(data))
      .catch((error) => console.error(error));

    return () => { active = false; };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage debe usarse dentro de LanguageProvider");
  return context;
}
