import React, { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home/Home";

const WordCounter = lazy(() => import("./games/word-counter/WordCounter"));
const ScrambledWords = lazy(() => import("./games/scrambled-words/ScrambledWords"));
const StoriesGame = lazy(() => import("./games/stories/StoriesGame"));
const MathGame = lazy(() => import("./games/math/MathGame"));
const PuzzleGame = lazy(() => import("./games/puzzles/PuzzleGame"));
const SongsGame = lazy(() => import("./games/songs/SongsGame"));
const ScienceGame = lazy(() => import("./games/science/ScienceGame"));
const EnglishGame = lazy(() => import("./games/english/EnglishGame"));
const PlayGame = lazy(() => import("./games/play/PlayGame"));
const PlusPage = lazy(() => import("./pages/Plus/PlusPage"));
const LoginPage = lazy(() => import("./pages/Login/LoginPage"));
const RegisterPage = lazy(() => import("./pages/Register/RegisterPage"));

function lazyPage(Component) {
  return (
    <Suspense fallback={<Box className="route-loading"><CircularProgress /></Box>}>
      <Component />
    </Suspense>
  );
}

function AppLayout() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/juegos/contador-palabras"
            element={lazyPage(WordCounter)}
          />
          <Route
            path="/juegos/palabras-revueltas"
            element={lazyPage(ScrambledWords)}
          />
          <Route path="/juegos/cuentos" element={lazyPage(StoriesGame)} />
          <Route path="/juegos/matematicas" element={lazyPage(MathGame)} />
          <Route path="/juegos/rompecabezas" element={lazyPage(PuzzleGame)} />
          <Route path="/juegos/canciones" element={lazyPage(SongsGame)} />
          <Route path="/juegos/ciencia" element={lazyPage(ScienceGame)} />
          <Route path="/juegos/ingles" element={lazyPage(EnglishGame)} />
          <Route path="/juegos/recreo" element={lazyPage(PlayGame)} />
          <Route path="/plus" element={lazyPage(PlusPage)} />
          <Route path="/iniciar-sesion" element={lazyPage(LoginPage)} />
          <Route path="/registrarse" element={lazyPage(RegisterPage)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppLayout />
      </ThemeProvider>
    </LanguageProvider>
  );
}
