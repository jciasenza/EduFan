import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  LinearProgress,
  Typography,
} from "@mui/material";
import { AutoAwesome, Lightbulb } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import supabase from "../../lib/supabaseClient";
import "./ScrambledWords.css";
import Loading from "../../components/ui/Loading";

const wordSets = {
  es: [
    { word: "gato", clue: "Un animal que dice miau.", emoji: "🐱" },
    { word: "luna", clue: "Brilla en el cielo por la noche.", emoji: "🌙" },
    { word: "casa", clue: "El lugar donde vivimos.", emoji: "🏠" },
    { word: "pato", clue: "Un ave que nada y hace cuac.", emoji: "🦆" },
    { word: "mesa", clue: "La usamos para comer o dibujar.", emoji: "🪑" },
    { word: "perro", clue: "Un amigo peludo que hace guau.", emoji: "🐶" },
    { word: "nube", clue: "Una forma blanca que flota en el cielo.", emoji: "☁️" },
    { word: "barco", clue: "Viaja por el agua.", emoji: "⛵" },
    { word: "manzana", clue: "Una fruta roja o verde.", emoji: "🍎" },
    { word: "pelota", clue: "La podemos patear o lanzar.", emoji: "⚽" },
  ],
  en: [
    { word: "cat", clue: "An animal that says meow.", emoji: "🐱" },
    { word: "moon", clue: "It shines in the sky at night.", emoji: "🌙" },
    { word: "home", clue: "The place where we live.", emoji: "🏠" },
    { word: "duck", clue: "A bird that swims and says quack.", emoji: "🦆" },
    { word: "table", clue: "We use it to eat or draw.", emoji: "🪑" },
    { word: "puppy", clue: "A furry friend that goes woof.", emoji: "🐶" },
    { word: "cloud", clue: "A white shape floating in the sky.", emoji: "☁️" },
    { word: "boat", clue: "It travels across water.", emoji: "⛵" },
    { word: "apple", clue: "A red or green fruit.", emoji: "🍎" },
    { word: "ball", clue: "We can kick or throw it.", emoji: "⚽" },
  ],
};

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function scramble(word) {
  const letters = Array.from(word);
  let mixed = shuffle(letters);
  let attempts = 0;

  while (mixed.join("") === word && attempts < 10) {
    mixed = shuffle(letters);
    attempts += 1;
  }

  if (mixed.join("") === word) {
    mixed.push(mixed.shift());
  }

  return mixed;
}

function normalizeAnswer(value) {
  return value.trim().toLocaleLowerCase().normalize("NFC");
}

function isValidWordSet(items) {
  return Array.isArray(items) && items.length > 0 && items.every((item) => (
    item
    && typeof item.word === "string"
    && item.word.trim().length > 0
    && typeof item.clue === "string"
    && item.clue.trim().length > 0
    && (!item.emoji || typeof item.emoji === "string")
  ));
}

function getLocalCompletedLevel() {
  const storedProgress = localStorage.getItem("game-progress:scrambled-words:1");
  if (storedProgress === null) return 0;
  const completedLevel = Number(storedProgress);
  if (!Number.isSafeInteger(completedLevel) || completedLevel < 0) {
    throw new Error("Stored scrambled words progress is invalid.");
  }
  return completedLevel;
}

export default function ScrambledWords() {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const toolbarText = translations.gameToolbar || {};
  const navigate = useNavigate();
  const activeLanguage = language === "es" ? "es" : "en";
  const t = translations.scrambledWords || {};
  const [words, setWords] = useState([]);
  const [questionOrder, setQuestionOrder] = useState([]);
  const [round, setRound] = useState(0);
  const [answerTileIds, setAnswerTileIds] = useState([]);
  const [draggedTileId, setDraggedTileId] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [usingLocalContent, setUsingLocalContent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [level, setLevel] = useState(1);
  const [availableLevels, setAvailableLevels] = useState({});
  const [allLevelsComplete, setAllLevelsComplete] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    let active = true;
    if (authLoading) return () => { active = false; };

    const loadWords = async () => {
      setContentError("");
      setProgressError("");
      setContentLoading(true);
      setAllLevelsComplete(false);
      let loadingProgress = false;

      try {
        let levels;
        let completed = 0;
        let isLocal = false;
        if (!supabase) {
          levels = { 1: wordSets[activeLanguage] };
          isLocal = true;
          loadingProgress = true;
          completed = getLocalCompletedLevel();
          loadingProgress = false;
        } else {
          const { data, error } = await supabase
            .from("game_content")
            .select("content, level")
            .eq("game_id", "scrambled-words")
            .eq("language", activeLanguage)
            .eq("volume", 1)
            .eq("is_published", true)
            .order("level");
          if (error) throw error;
          if (!data?.length) throw new Error(`No published scrambled words found (${activeLanguage}).`);

          levels = {};
          data.forEach((row) => {
            if (!isValidWordSet(row.content)) {
              throw new Error(`Published scrambled words level ${row.level} (${activeLanguage}) has an invalid format.`);
            }
            levels[row.level] = row.content;
          });

          loadingProgress = true;
          if (user) {
            const { data: savedProgress, error: progressQueryError } = await supabase
              .from("user_game_progress")
              .select("highest_completed_level")
              .eq("game_id", "scrambled-words")
              .eq("volume", 1)
              .maybeSingle();
            if (progressQueryError) throw progressQueryError;
            completed = savedProgress?.highest_completed_level || 0;
          } else {
            completed = getLocalCompletedLevel();
          }
          loadingProgress = false;
        }

        if (!active) return;
        const nextLevel = completed + 1;
        const levelToLoad = levels[nextLevel] ? nextLevel : Math.max(1, completed);
        const selectedWords = levels[levelToLoad];
        if (!selectedWords) {
          throw new Error(`No published scrambled words available for level ${levelToLoad}.`);
        }
        const order = shuffle(selectedWords.map((_, index) => index));
        setAvailableLevels(levels);
        setWords(selectedWords);
        setQuestionOrder(order);
        setLevel(levelToLoad);
        setRound(!levels[nextLevel] && completed > 0 ? order.length : 0);
        setAnswerTileIds([]);
        setDraggedTileId("");
        setScore(0);
        setFeedback("");
        setHintVisible(false);
        setUsingLocalContent(isLocal);
        setAllLevelsComplete(!levels[nextLevel] && completed > 0);
        setContentLoading(false);
      } catch (error) {
        if (!active) return;
        console.error("Could not load scrambled words or game progress:", error);
        setWords([]);
        setQuestionOrder([]);
        setContentError(loadingProgress ? t.progressLoadError : t.contentLoadError);
        setContentLoading(false);
      }
    };

    loadWords();
    return () => { active = false; };
  }, [
    activeLanguage,
    authLoading,
    retryCount,
    t.contentLoadError,
    t.progressLoadError,
    user,
  ]);

  const finished = round >= questionOrder.length;
  const currentWord = finished ? null : words[questionOrder[round]];
  const mixedLetters = useMemo(
    () => (currentWord
      ? scramble(currentWord.word).map((letter, index) => ({
        id: `${round}-${index}`,
        letter,
      }))
      : []),
    [currentWord, round],
  );
  const answer = answerTileIds
    .map((tileId) => mixedLetters.find(({ id }) => id === tileId)?.letter || "")
    .join("");
  const progress = (round / questionOrder.length) * 100;

  const moveTileToAnswer = (tileId, targetIndex = answerTileIds.length) => {
    if (feedback === "correct") return;
    setAnswerTileIds((currentIds) => {
      const currentIndex = currentIds.indexOf(tileId);
      const nextIds = currentIds.filter((id) => id !== tileId);
      const insertIndex = Math.max(
        0,
        Math.min(targetIndex - (currentIndex !== -1 && currentIndex < targetIndex ? 1 : 0), nextIds.length),
      );
      nextIds.splice(insertIndex, 0, tileId);
      return nextIds;
    });
    setFeedback("");
  };

  const handleTileDragStart = (event, tileId) => {
    event.dataTransfer.setData("text/plain", tileId);
    event.dataTransfer.effectAllowed = "move";
    setDraggedTileId(tileId);
  };

  const handleAnswerDrop = (event, targetIndex) => {
    event.preventDefault();
    event.stopPropagation();
    const tileId = event.dataTransfer.getData("text/plain") || draggedTileId;
    if (tileId) moveTileToAnswer(tileId, targetIndex);
    setDraggedTileId("");
  };

  const handlePoolDrop = (event) => {
    event.preventDefault();
    const tileId = event.dataTransfer.getData("text/plain") || draggedTileId;
    if (tileId) {
      setAnswerTileIds((currentIds) => currentIds.filter((id) => id !== tileId));
      setFeedback("");
    }
    setDraggedTileId("");
  };

  const handleCheck = () => {
    if (!currentWord || feedback === "correct") return;

    if (answerTileIds.length !== currentWord.word.length) return;
    if (normalizeAnswer(answer) === normalizeAnswer(currentWord.word)) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("scrambled-words");
      setFeedback("correct");
      return;
    }

    setFeedback("incorrect");
  };

  const handleNext = () => {
    if (round === questionOrder.length - 1) {
      completeLevel();
      return;
    }
    setRound((currentRound) => currentRound + 1);
    setAnswerTileIds([]);
    setFeedback("");
    setHintVisible(false);
  };

  async function completeLevel() {
    setSavingProgress(true);
    setProgressError("");
    try {
      let completed = level;
      if (supabase && user) {
        const { data, error } = await supabase.rpc("complete_game_level", {
          p_game_id: "scrambled-words",
          p_volume: 1,
          p_language: activeLanguage,
          p_level: level,
        });
        if (error) throw error;
        completed = Number(data);
        if (!Number.isSafeInteger(completed) || completed < level) {
          throw new Error("The scrambled words progress response is invalid.");
        }
      } else {
        localStorage.setItem("game-progress:scrambled-words:1", String(level));
      }

      const nextLevel = completed + 1;
      if (availableLevels[nextLevel]) {
        const nextWords = availableLevels[nextLevel];
        setWords(nextWords);
        setQuestionOrder(shuffle(nextWords.map((_, index) => index)));
        setLevel(nextLevel);
        setRound(0);
        setAnswerTileIds([]);
        setScore(0);
        setFeedback("");
        setHintVisible(false);
        setAllLevelsComplete(false);
      } else {
        setRound(questionOrder.length);
        setAllLevelsComplete(true);
      }
    } catch (error) {
      console.error("Could not save completed scrambled words level:", error);
      setRound(questionOrder.length);
      setProgressError(t.progressSaveError);
    } finally {
      setSavingProgress(false);
    }
  }

  const handleRestart = () => {
    setQuestionOrder(shuffle(words.map((_, index) => index)));
    setRound(0);
    setAnswerTileIds([]);
    setScore(0);
    setFeedback("");
    setHintVisible(false);
    setAllLevelsComplete(false);
  };

  return (
    <main className="scrambled-game">
      <Card className="scrambled-card" component="section">
        <GameToolbar
          level={level}
          points={score}
          levelLabel={toolbarText.level}
          pointsLabel={toolbarText.points}
          exitLabel={toolbarText.exit}
          onExit={() => navigate("/?category=words")}
        />
        <div className="scrambled-badge" aria-hidden="true">
          <AutoAwesome />
        </div>
        <Typography component="h1" variant="h3" className="scrambled-title">
          {t.title}
        </Typography>
        <Typography className="scrambled-description">{t.description}</Typography>

        {contentLoading ? (
          <div className="scrambled-loading" role="status">
            <Loading aria-label={t.contentLoading} />
            <Typography>{t.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="scrambled-content-error">
            <Alert severity="error" role="alert">{contentError}</Alert>
            <AppButton onClick={() => setRetryCount((count) => count + 1)}>
              {t.retry}
            </AppButton>
          </div>
        ) : (
          <>
        {usingLocalContent && (
          <Alert className="scrambled-feedback" severity="info" role="status">
            {t.localContentNotice}
          </Alert>
        )}
        {!finished ? (
          <>
            <div className="scrambled-status">
              <Typography className="scrambled-round">
                {t.round} {round + 1} {t.of} {questionOrder.length}
              </Typography>
            </div>
            <LinearProgress
              className="scrambled-progress"
              variant="determinate"
              value={progress}
              aria-label={t.progress}
            />

            <Box className="scrambled-prompt">
              <span className="prompt-emoji" aria-hidden="true">{currentWord.emoji}</span>
              <Typography className="scrambled-instruction">{t.moveInstruction}</Typography>
              <div
                className="scrambled-letters"
                aria-label={t.scrambledLetters}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handlePoolDrop}
              >
                {mixedLetters.filter(({ id }) => !answerTileIds.includes(id)).map(({ id, letter }) => (
                  <button
                    className="scrambled-letter"
                    key={id}
                    type="button"
                    draggable={feedback !== "correct"}
                    aria-label={`${t.availableLetter}: ${letter}`}
                    onDragStart={(event) => handleTileDragStart(event, id)}
                    onDragEnd={() => setDraggedTileId("")}
                    onClick={() => moveTileToAnswer(id)}
                    disabled={feedback === "correct"}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </Box>

            <div className="scrambled-answer-section">
              <Typography className="scrambled-answer-label">{t.answerLabel}</Typography>
              <div
                className="scrambled-answer"
                aria-label={t.answerArea}
                aria-live="polite"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleAnswerDrop(event, answerTileIds.length)}
              >
                {mixedLetters.map(({ id }, index) => {
                  const selectedTileId = answerTileIds[index];
                  const selectedTile = mixedLetters.find((tile) => tile.id === selectedTileId);
                  return (
                    <button
                      className={`scrambled-answer-slot${selectedTile ? " is-filled" : ""}`}
                      key={`slot-${id}`}
                      type="button"
                      draggable={Boolean(selectedTile) && feedback !== "correct"}
                      aria-label={selectedTile
                        ? `${t.removeLetter}: ${selectedTile.letter}`
                        : `${t.emptySlot} ${index + 1}`}
                      onDragStart={(event) => {
                        if (selectedTile) handleTileDragStart(event, selectedTile.id);
                      }}
                      onDragEnd={() => setDraggedTileId("")}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleAnswerDrop(event, index)}
                      onClick={() => {
                        if (selectedTile && feedback !== "correct") {
                          setAnswerTileIds((currentIds) => currentIds.filter((tileId) => tileId !== selectedTile.id));
                          setFeedback("");
                        }
                      }}
                      disabled={feedback === "correct"}
                    >
                      {selectedTile?.letter || ""}
                    </button>
                  );
                })}
              </div>
            </div>

            <Typography className="scrambled-clue">
              {hintVisible ? currentWord.clue : t.clueHidden}
            </Typography>

            <Box className="scrambled-form">
              <div className="scrambled-actions">
                {feedback === "correct" ? (
                  <AppButton type="button" onClick={handleNext} disabled={savingProgress} endIcon={<AutoAwesome />}>
                    {round === questionOrder.length - 1 ? t.finishLevel : t.next}
                  </AppButton>
                ) : (
                  <AppButton
                    type="button"
                    onClick={handleCheck}
                    disabled={answerTileIds.length !== currentWord.word.length}
                  >
                    {t.check}
                  </AppButton>
                )}
                <AppButton
                  type="button"
                  variant="secondary"
                  startIcon={<Lightbulb />}
                  onClick={() => setHintVisible(true)}
                  disabled={hintVisible}
                >
                  {t.hint}
                </AppButton>
              </div>
            </Box>

            {feedback === "correct" && (
              <Alert className="scrambled-feedback" severity="success" role="status">
                {t.correct}
              </Alert>
            )}
            {feedback === "incorrect" && (
              <Alert className="scrambled-feedback" severity="warning" role="status">
                {t.tryAgain}
              </Alert>
            )}
          </>
        ) : (
          <div className="scrambled-finish">
            <span className="finish-emoji" aria-hidden="true">🎉</span>
            <Typography component="h2">
              {allLevelsComplete ? t.allLevelsComplete : t.finished}
            </Typography>
            <Typography className="finish-score">
              {t.finalScore}: {score} / {questionOrder.length}
            </Typography>
            {progressError && <Alert severity="error" role="alert">{progressError}</Alert>}
            {savingProgress && <Loading aria-label={t.savingProgress} />}
            <AppButton
              onClick={progressError ? completeLevel : handleRestart}
              disabled={savingProgress}
              endIcon={<AutoAwesome />}
            >
              {progressError ? t.retry : (allLevelsComplete ? t.playAgain : t.continue)}
            </AppButton>
          </div>
        )}
          </>
        )}
      </Card>
    </main>
  );
}
