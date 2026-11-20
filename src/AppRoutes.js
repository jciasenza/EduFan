import React, { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Box from "@mui/material/Box";
import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./pages/Home/Home";
import Loading from "./components/ui/Loading";

const WordCounter = lazy(() => import("./games/word-counter/WordCounter"));
const ScrambledWords = lazy(
  () => import("./games/scrambled-words/ScrambledWords"),
);
const StoriesGame = lazy(() => import("./games/stories/StoriesGame"));
const RiddlesGame = lazy(() => import("./games/riddles/RiddlesGame"));
const TongueTwisters = lazy(
  () => import("./games/tongue-twisters/TongueTwisters"),
);
const MathGame = lazy(() => import("./games/math/MathGame"));
const NumberSeriesGame = lazy(() => import("./games/math/NumberSeriesGame"));
const PuzzleGame = lazy(() => import("./games/puzzles/PuzzleGame"));
const DrawingGame = lazy(() => import("./games/drawings/DrawingGame"));
const SongsGame = lazy(() => import("./games/songs/SongsGame"));
const ArtMusicQuiz = lazy(() => import("./games/art-music/ArtMusicQuiz"));
const ScienceGame = lazy(() => import("./games/science/ScienceGame"));
const WorldHistoryGame = lazy(
  () => import("./games/world-history/WorldHistoryGame"),
);
const EnglishGame = lazy(() => import("./games/english/EnglishGame"));
const SpanishGame = lazy(() => import("./games/english/SpanishGame"));
const PlayGame = lazy(() => import("./games/play/PlayGame"));
const PlusPage = lazy(() => import("./pages/Plus/PlusPage"));
const LoginPage = lazy(() => import("./pages/Login/LoginPage"));
const RegisterPage = lazy(() => import("./pages/Register/RegisterPage"));
const LegalPage = lazy(() => import("./pages/Legal/LegalPage"));
const PasswordRecoveryPage = lazy(
  () => import("./pages/PasswordRecovery/PasswordRecoveryPage"),
);

function lazyPage(Component) {
  return (
    <Suspense
      fallback={
        <Box className="route-loading">
          <Loading />
        </Box>
      }
    >
      <Component />
    </Suspense>
  );
}

export default function AppRoutes() {
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
          <Route path="/juegos/adivinanzas" element={lazyPage(RiddlesGame)} />
          <Route
            path="/juegos/trabalenguas"
            element={lazyPage(TongueTwisters)}
          />
          <Route path="/juegos/matematicas" element={lazyPage(MathGame)} />
          <Route
            path="/juegos/series-numericas"
            element={lazyPage(NumberSeriesGame)}
          />
          <Route path="/juegos/rompecabezas" element={lazyPage(PuzzleGame)} />
          <Route
            path="/juegos/puzzle-encastre"
            element={lazyPage(PuzzleGame)}
          />
          <Route
            path="/juegos/completar-imagen"
            element={lazyPage(PuzzleGame)}
          />
          <Route path="/juegos/siluetas" element={lazyPage(PuzzleGame)} />
          <Route
            path="/juegos/figuras-colores"
            element={lazyPage(DrawingGame)}
          />
          <Route path="/juegos/dibujos" element={lazyPage(DrawingGame)} />
          <Route path="/juegos/canciones" element={lazyPage(SongsGame)} />
          <Route path="/juegos/arte-musica" element={lazyPage(ArtMusicQuiz)} />
          <Route path="/juegos/ciencia" element={lazyPage(ScienceGame)} />
          <Route
            path="/juegos/historia-mundial"
            element={lazyPage(WorldHistoryGame)}
          />
          <Route path="/juegos/ingles" element={lazyPage(EnglishGame)} />
          <Route path="/juegos/espanol" element={lazyPage(SpanishGame)} />
          <Route path="/juegos/memoria" element={lazyPage(PlayGame)} />
          <Route path="/juegos/recreo" element={lazyPage(PlayGame)} />
          <Route path="/plus" element={lazyPage(PlusPage)} />
          <Route path="/iniciar-sesion" element={lazyPage(LoginPage)} />
          <Route path="/registrarse" element={lazyPage(RegisterPage)} />
          <Route
            path="/recuperar-contrasena"
            element={lazyPage(PasswordRecoveryPage)}
          />
          <Route
            path="/restablecer-contrasena"
            element={lazyPage(PasswordRecoveryPage)}
          />
          <Route path="/terminos-y-condiciones" element={lazyPage(LegalPage)} />
          <Route path="/politica-de-privacidad" element={lazyPage(LegalPage)} />
          <Route path="/terminos-de-pago" element={lazyPage(LegalPage)} />
          <Route path="/preguntas-frecuentes" element={lazyPage(LegalPage)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
