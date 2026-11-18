import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  LinearProgress,
  Typography,
} from "@mui/material";
import { AutoAwesome, EmojiEvents, Lightbulb } from "@mui/icons-material";
import AppButton from "../../components/ui/AppButton";
import { useLanguage } from "../../context/LanguageContext";
import "./ScrambledWords.css";

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

export default function ScrambledWords() {
  const { language, translations } = useLanguage();
  const isSpanish = language === "es";
  const t = translations.scrambledWords || {};
  const words = wordSets[isSpanish ? "es" : "en"];
  const [questionOrder, setQuestionOrder] = useState(() => shuffle(words.map((_, index) => index)));
  const [round, setRound] = useState(0);
  const [answerTileIds, setAnswerTileIds] = useState([]);
  const [draggedTileId, setDraggedTileId] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hintVisible, setHintVisible] = useState(false);

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
      setFeedback("correct");
      return;
    }

    setFeedback("incorrect");
  };

  const handleNext = () => {
    setRound((currentRound) => currentRound + 1);
    setAnswerTileIds([]);
    setFeedback("");
    setHintVisible(false);
  };

  const handleRestart = () => {
    setQuestionOrder(shuffle(words.map((_, index) => index)));
    setRound(0);
    setAnswerTileIds([]);
    setScore(0);
    setFeedback("");
    setHintVisible(false);
  };

  return (
    <main className="scrambled-game">
      <Card className="scrambled-card" component="section">
        <div className="scrambled-badge" aria-hidden="true">
          <AutoAwesome />
        </div>
        <Typography component="h1" variant="h3" className="scrambled-title">
          {t.title}
        </Typography>
        <Typography className="scrambled-description">{t.description}</Typography>

        {!finished ? (
          <>
            <div className="scrambled-status">
              <Typography className="scrambled-round">
                {t.round} {round + 1} {t.of} {questionOrder.length}
              </Typography>
              <Typography className="scrambled-score">
                <EmojiEvents aria-hidden="true" /> {t.score}: {score}
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
                  <AppButton type="button" onClick={handleNext} endIcon={<AutoAwesome />}>
                    {t.next}
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
            <Typography component="h2">{t.finished}</Typography>
            <Typography className="finish-score">
              {t.finalScore}: {score} / {questionOrder.length}
            </Typography>
            <AppButton onClick={handleRestart} endIcon={<AutoAwesome />}>
              {t.playAgain}
            </AppButton>
          </div>
        )}
      </Card>
    </main>
  );
}
