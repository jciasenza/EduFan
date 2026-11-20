import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Card,
  Typography,
} from "@mui/material";
import { AutoAwesome, RestartAlt } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { loadGameLevels, saveGameLevel } from "../gameLevelUtils";
import Loading from "../../components/ui/Loading";
import "./PlayGame.css";

const animalPairs = {
  es: [
    { key: "dog", label: "perro", emoji: "🐶" },
    { key: "cat", label: "gato", emoji: "🐱" },
    { key: "rabbit", label: "conejo", emoji: "🐰" },
    { key: "fox", label: "zorro", emoji: "🦊" },
    { key: "panda", label: "panda", emoji: "🐼" },
    { key: "frog", label: "rana", emoji: "🐸" },
    { key: "lion", label: "león", emoji: "🦁" },
    { key: "monkey", label: "mono", emoji: "🐵" },
  ],
  en: [
    { key: "dog", label: "dog", emoji: "🐶" },
    { key: "cat", label: "cat", emoji: "🐱" },
    { key: "rabbit", label: "rabbit", emoji: "🐰" },
    { key: "fox", label: "fox", emoji: "🦊" },
    { key: "panda", label: "panda", emoji: "🐼" },
    { key: "frog", label: "frog", emoji: "🐸" },
    { key: "lion", label: "lion", emoji: "🦁" },
    { key: "monkey", label: "monkey", emoji: "🐵" },
  ],
};

const localMemoryLevels = {
  1: animalPairs.es.slice(0, 4),
  2: animalPairs.es.slice(0, 6),
  3: animalPairs.es,
};

function isValidPairSet(items) {
  return Array.isArray(items)
    && items.length >= 2
    && items.length <= 8
    && items.every((item) => (
      item
      && typeof item.key === "string"
      && /^[a-z0-9-]+$/i.test(item.key)
      && typeof item.label === "string"
      && item.label.trim().length > 0
      && typeof item.emoji === "string"
      && item.emoji.trim().length > 0
    ))
    && new Set(items.map((item) => item.key)).size === items.length;
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createCards(pairs) {
  return shuffle(pairs.flatMap((pair, index) => [
    { id: `${pair.key}-a`, pair: index, ...pair },
    { id: `${pair.key}-b`, pair: index, ...pair },
  ]));
}

export default function PlayGame() {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const toolbarText = translations.gameToolbar || {};
  const navigate = useNavigate();
  const t = translations.memoryGame || {};
  const activeLanguage = language === "es" ? "es" : "en";
  const [pairs, setPairs] = useState(localMemoryLevels[1]);
  const [availableLevels, setAvailableLevels] = useState({});
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState(() => createCards(localMemoryLevels[1]));
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [usingLocalContent, setUsingLocalContent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [allLevelsComplete, setAllLevelsComplete] = useState(false);
  const [levelNotice, setLevelNotice] = useState("");
  const [progressError, setProgressError] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);
  const mismatchTimer = useRef(null);
  const finished = matchedPairs.length === pairs.length;

  useEffect(() => () => window.clearTimeout(mismatchTimer.current), []);

  useEffect(() => {
    let active = true;
    if (authLoading) return () => { active = false; };
    window.clearTimeout(mismatchTimer.current);

    const load = async () => {
      setContentError("");
      setContentLoading(true);
      setProgressError("");

      try {
        const localizedLevels = Object.fromEntries(
          Object.entries(localMemoryLevels).map(([key, value]) => [
            key,
            animalPairs[activeLanguage].slice(0, value.length),
          ]),
        );
        const result = await loadGameLevels({
          gameId: "memory",
          language: activeLanguage,
          user,
          localLevels: localizedLevels,
          validateContent: isValidPairSet,
        });
        if (!active) return;

        const selectedPairs = result.levels[result.level];
        setPairs(selectedPairs);
        setAvailableLevels(result.levels);
        setLevel(result.level);
        setCards(createCards(selectedPairs));
        setFlippedCards([]);
        setMatchedPairs(result.allLevelsComplete
          ? selectedPairs.map((_, index) => index)
          : []);
        setMoves(0);
        setUsingLocalContent(result.usingLocalContent);
        setAllLevelsComplete(result.allLevelsComplete);
      } catch (error) {
        if (!active) return;
        console.error("Could not load memory pairs or game progress:", error);
        setContentError(error.stage === "progress"
          ? t.progressLoadError
          : t.contentLoadError);
      } finally {
        if (active) setContentLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [
    activeLanguage,
    authLoading,
    retryCount,
    t.contentLoadError,
    t.progressLoadError,
    user,
  ]);

  const flipCard = (card) => {
    if (
      finished
      || flippedCards.length === 2
      || flippedCards.includes(card.id)
      || matchedPairs.includes(card.pair)
    ) return;

    const nextFlipped = [...flippedCards, card.id];
    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((currentMoves) => currentMoves + 1);
      const firstCard = cards.find(({ id }) => id === nextFlipped[0]);
      const secondCard = card;

      if (firstCard.pair === secondCard.pair) {
        setMatchedPairs((currentPairs) => [...currentPairs, card.pair]);
        setFlippedCards([]);
        awardPoint("memory");
      } else {
        mismatchTimer.current = window.setTimeout(() => setFlippedCards([]), 900);
      }
    }
  };

  const restart = () => {
    window.clearTimeout(mismatchTimer.current);
    setCards(createCards(pairs));
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setAllLevelsComplete(false);
    setLevelNotice("");
    setProgressError("");
  };

  const completeLevel = async () => {
    setSavingProgress(true);
    setProgressError("");
    try {
      const completed = await saveGameLevel({
        gameId: "memory",
        language: activeLanguage,
        user,
        level,
      });
      const nextLevel = completed + 1;
      if (availableLevels[nextLevel]) {
        window.clearTimeout(mismatchTimer.current);
        const nextPairs = availableLevels[nextLevel];
        setPairs(nextPairs);
        setLevel(nextLevel);
        setCards(createCards(nextPairs));
        setFlippedCards([]);
        setMatchedPairs([]);
        setMoves(0);
        setAllLevelsComplete(false);
        setLevelNotice(`${t.levelComplete} ${t.level} ${nextLevel}`);
      } else {
        setAllLevelsComplete(true);
      }
    } catch (error) {
      console.error("Could not save completed memory level:", error);
      setProgressError(t.progressSaveError);
    } finally {
      setSavingProgress(false);
    }
  };

  return (
    <main className="memory-game">
      <Card className="memory-card" component="section">
        <GameToolbar
          level={level}
          points={matchedPairs.length}
          levelLabel={toolbarText.level || t.level}
          pointsLabel={toolbarText.points}
          exitLabel={toolbarText.exit}
          onExit={() => navigate("/?category=memory")}
        />
        <div className="memory-badge" aria-hidden="true">🧠</div>
        <Typography component="h1" variant="h3" className="memory-title">
          {t.title}
        </Typography>
        <Typography className="memory-description">{t.description}</Typography>

        {contentLoading ? (
          <div className="memory-loading" role="status">
            <Loading aria-label={t.contentLoading} />
            <Typography>{t.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="memory-content-error">
            <Alert severity="error" role="alert">{contentError}</Alert>
            <AppButton onClick={() => setRetryCount((count) => count + 1)}>
              {t.retry}
            </AppButton>
          </div>
        ) : (
          <>
            {usingLocalContent && (
              <Alert className="memory-success" severity="info" role="status">
                {t.localContentNotice}
              </Alert>
            )}
            {levelNotice && (
              <Alert className="memory-success" severity="success" role="status">
                {levelNotice}
              </Alert>
            )}
            {allLevelsComplete && (
              <Alert className="memory-success" severity="success" role="status">
                {t.allLevelsComplete}
              </Alert>
            )}
            {progressError && (
              <Alert className="memory-success" severity="error" role="alert">
                {progressError}
              </Alert>
            )}

            <div className="memory-status">
              <Typography>{t.pairs}: {matchedPairs.length} / {pairs.length}</Typography>
              <Typography className="memory-moves">{t.moves}: {moves}</Typography>
              <AppButton
                variant="secondary"
                startIcon={<RestartAlt />}
                disabled={savingProgress}
                onClick={restart}
              >
                {t.restart}
              </AppButton>
            </div>

            <div className="memory-board" role="group" aria-label={t.boardLabel}>
              {cards.map((card, index) => {
                const isFlipped = flippedCards.includes(card.id);
                const isMatched = matchedPairs.includes(card.pair);
                const isVisible = isFlipped || isMatched;

                return (
                  <button
                    className={`memory-tile${isVisible ? " is-visible" : ""}${isMatched ? " is-matched" : ""}`}
                    key={card.id}
                    type="button"
                    aria-label={isVisible
                      ? `${t.card} ${index + 1}: ${card.label}${isMatched ? `, ${t.matched}` : ""}`
                      : `${t.card} ${index + 1}, ${t.hidden}`}
                    aria-pressed={isVisible}
                    disabled={isMatched || finished}
                    onClick={() => flipCard(card)}
                  >
                    {isVisible ? card.emoji : "?"}
                  </button>
                );
              })}
            </div>

            {finished && (
              <>
                {!allLevelsComplete && (
                  <Alert className="memory-success" severity="success" role="status">
                    {t.finished}
                  </Alert>
                )}
                {!allLevelsComplete ? (
                  <AppButton
                    disabled={savingProgress}
                    onClick={completeLevel}
                    endIcon={<AutoAwesome />}
                  >
                    {savingProgress ? t.savingProgress : t.finishLevel}
                  </AppButton>
                ) : (
                  <AppButton onClick={restart} endIcon={<AutoAwesome />}>
                    {t.playAgain}
                  </AppButton>
                )}
              </>
            )}
          </>
        )}
      </Card>
    </main>
  );
}
