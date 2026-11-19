import React, { useEffect, useState } from "react";
import { Alert, Drawer, IconButton, Tooltip } from "@mui/material";
import {
  Calculate,
  Close,
  DarkMode,
  EmojiEvents,
  HistoryEdu,
  Login,
  LightMode,
  Logout,
  Menu as MenuIcon,
  MenuBook,
  MusicNote,
  Palette,
  Science,
  SportsEsports,
  TextFields,
  Translate,
  Extension,
  QuestionAnswer,
  WorkspacePremium,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import AppButton from "./ui/AppButton";
import "./Header.css";

const categories = [
  { id: "songs", key: "songs", icon: MusicNote, color: "coral" },
  { id: "stories", key: "stories", icon: MenuBook, color: "orange" },
  { id: "riddles", key: "riddles", icon: QuestionAnswer, color: "purple" },
  {
    id: "tongue-twisters",
    key: "tongueTwisters",
    icon: TextFields,
    color: "blue",
  },
  { id: "memory", key: "memory", icon: SportsEsports, color: "pink" },
  { id: "shapes-colors", key: "shapesColors", icon: Palette, color: "orange" },
  { id: "resources", key: "resources", icon: Extension, color: "teal" },
  { id: "english", key: "english", icon: Translate, color: "purple" },
  { id: "science", key: "science", icon: Science, color: "green" },
  { id: "world-history", key: "worldHistory", icon: HistoryEdu, color: "purple" },
  { id: "math", key: "math", icon: Calculate, color: "blue" },
  { id: "words", key: "words", icon: TextFields, color: "pink" },
];

const categoryRoutes = {
  words: "/juegos/contador-palabras",
  "tongue-twisters": "/juegos/trabalenguas",
  stories: "/juegos/cuentos",
  riddles: "/juegos/adivinanzas",
  math: "/juegos/matematicas",
  resources: "/juegos/rompecabezas",
  "shapes-colors": "/juegos/figuras-colores",
  songs: "/juegos/canciones",
  science: "/juegos/ciencia",
  "world-history": "/juegos/historia-mundial",
  english: "/juegos/ingles",
  memory: "/juegos/memoria",
};

export default function Header() {
  const { language, setLanguage, translations } = useLanguage();
  const {
    user,
    points,
    pointsSyncError,
    signOut,
  } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  const t = translations.header || {};
  const categoryText = t.categories || {};
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authActionError, setAuthActionError] = useState(false);

  const handleSignOut = () => {
    setMobileMenuOpen(false);
    setAuthActionError(false);
    signOut().catch(() => setAuthActionError(true));
  };

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1051px)");
    const closeMenuOnDesktop = (event) => {
      if (event.matches) {
        setMobileMenuOpen(false);
      }
    };

    desktopQuery.addEventListener("change", closeMenuOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeMenuOnDesktop);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const openCategory = (categoryId) => {
    setMobileMenuOpen(false);
    navigate(`/?category=${categoryId}`);
  };

  const categoryLinks = () =>
    categories.map(({ id, key, icon: CategoryIcon, color }) => {
      const active =
        location.pathname === categoryRoutes[id] ||
        (id === "memory" && location.pathname === "/juegos/recreo") ||
        (id === "shapes-colors" && location.pathname === "/juegos/dibujos") ||
        (id === "math" && location.pathname === "/juegos/series-numericas") ||
        (id === "english" && location.pathname === "/juegos/espanol") ||
        (location.pathname === "/" &&
          new URLSearchParams(location.search).get("category") === id);

      return (
        <button
          key={id}
          type="button"
          className={`category-link category-${color}${active ? " active" : ""}`}
          onClick={() => openCategory(id)}
        >
          <CategoryIcon aria-hidden="true" />
          <span>{categoryText[key]}</span>
        </button>
      );
    });

  const languageAndTheme = (
    <div className="header-tools">
      <Tooltip title={t.theme}>
        <IconButton
          onClick={toggleTheme}
          aria-label={t.theme}
          className="theme-toggle"
        >
          {themeMode === "dark" ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Tooltip>
      <div className="language-selector" aria-label={t.language}>
        <button
          type="button"
          className={language === "es" ? "selected" : ""}
          onClick={() => setLanguage("es")}
          aria-label="Español"
        >
          <svg viewBox="0 0 60 40" aria-hidden="true" focusable="false">
            <rect width="60" height="40" fill="#c60b1e" />
            <rect y="10" width="60" height="20" fill="#ffc400" />
          </svg>
        </button>
        <button
          type="button"
          className={language === "en" ? "selected" : ""}
          onClick={() => setLanguage("en")}
          aria-label="English"
        >
          <svg viewBox="0 0 60 40" aria-hidden="true" focusable="false">
            <rect width="60" height="40" fill="#012169" />
            <path d="M0 0 60 40M60 0 0 40" stroke="#fff" strokeWidth="9" />
            <path d="M0 0 60 40M60 0 0 40" stroke="#c8102e" strokeWidth="4" />
            <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="13" />
            <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="7" />
          </svg>
        </button>
      </div>
    </div>
  );

  const headerActions = (
    <div className="header-actions">
      <AppButton
        component={Link}
        to="/plus"
        className="header-action-button header-plus-button"
        size="small"
        startIcon={<WorkspacePremium />}
        onClick={() => setMobileMenuOpen(false)}
      >
        {t.subscribe}
      </AppButton>
      {user ? (
        <div className="header-account">
          <span className="header-points" aria-label={`${t.points}: ${points}`}>
            <EmojiEvents aria-hidden="true" />
            {points} {t.points}
          </span>
          <AppButton
            variant="secondary"
            className="header-action-button"
            size="small"
            startIcon={<Logout />}
            onClick={handleSignOut}
          >
            {t.logout}
          </AppButton>
        </div>
      ) : (
        <AppButton
          component={Link}
          to="/iniciar-sesion"
          variant="secondary"
          className="header-action-button header-login-button"
          size="small"
          startIcon={<Login />}
          onClick={() => setMobileMenuOpen(false)}
        >
          {t.login}
        </AppButton>
      )}
      {(pointsSyncError || authActionError) && (
        <Alert className="header-points-error" severity="error" role="alert">
          {authActionError ? t.authError : t.pointsSyncError}
        </Alert>
      )}
    </div>
  );

  return (
    <header className="kids-header">
      <Link
        className="brand-button"
        to="/"
        aria-label={t.brand || "EduFan"}
      >
        <img className="header-logo" src={`${process.env.PUBLIC_URL}/edufan-logo.png`} alt="" />
        <span className="brand-text">
          <small>{t.slogan}</small>
        </span>
      </Link>

      <div className="desktop-navigation">
        <nav className="category-navigation" aria-label={t.games}>
          {categoryLinks()}
        </nav>
        {headerActions}
        {languageAndTheme}
      </div>

      <IconButton
        className="mobile-menu-button"
        onClick={() => setMobileMenuOpen(true)}
        aria-label={t.openMenu}
        aria-expanded={mobileMenuOpen}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ className: "mobile-navigation-drawer" }}
      >
        <div className="mobile-drawer-heading">
          <strong>{t.games}</strong>
          <IconButton
            onClick={() => setMobileMenuOpen(false)}
            aria-label={t.closeMenu}
          >
            <Close />
          </IconButton>
        </div>
        {headerActions}
        <div className="mobile-drawer-tools">{languageAndTheme}</div>
        <nav className="mobile-category-navigation" aria-label={t.games}>
          {categoryLinks(true)}
        </nav>
      </Drawer>
    </header>
  );
}
