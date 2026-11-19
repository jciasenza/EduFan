import React, { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import { AutoAwesome, Palette } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { loadGameLevels, saveGameLevel } from "../gameLevelUtils";
import "./ArtMusicQuiz.css";

const localQuestions = {
  es: {
    1: [
      { clue: "¿Qué instrumento tiene teclas blancas y negras?", answers: ["La flauta", "El piano", "El tambor", "La guitarra"], correct: 1, emoji: "🎹" },
      { clue: "¿Con qué herramienta suele pintar un artista sobre un lienzo?", answers: ["Un pincel", "Una cuchara", "Un martillo", "Una regla"], correct: 0, emoji: "🖌️" },
      { clue: "¿Qué instrumento se toca rasgueando sus cuerdas?", answers: ["La trompeta", "El violín", "La guitarra", "El tambor"], correct: 2, emoji: "🎸" },
      { clue: "¿Qué colores se mezclan para formar el naranja?", answers: ["Azul y verde", "Rojo y amarillo", "Blanco y negro", "Violeta y azul"], correct: 1, emoji: "🎨" },
      { clue: "¿Qué instrumento marca el ritmo con sus golpes?", answers: ["El tambor", "La flauta", "El piano", "El arpa"], correct: 0, emoji: "🥁" },
      { clue: "¿Qué hace un escultor para crear una escultura?", answers: ["Modela o talla materiales", "Compone una canción", "Toma una fotografía", "Escribe un poema"], correct: 0, emoji: "🗿" },
    ],
    2: [
      { clue: "¿Qué familia de instrumentos incluye la flauta y el clarinete?", answers: ["Percusión", "Cuerda", "Viento", "Teclado"], correct: 2, emoji: "🎶" },
      { clue: "¿Qué es un autorretrato?", answers: ["Un retrato que un artista hace de sí mismo", "Una pintura de un paisaje", "Una escultura de un animal", "Un dibujo de un instrumento"], correct: 0, emoji: "🖼️" },
      { clue: "¿Qué instrumento suele tener cuatro cuerdas y se apoya bajo la barbilla?", answers: ["El violín", "La tuba", "El piano", "El tambor"], correct: 0, emoji: "🎻" },
      { clue: "¿Qué significa cantar en un coro?", answers: ["Cantar junto con un grupo", "Tocar un instrumento a solas", "Pintar mientras suena música", "Bailar sin música"], correct: 0, emoji: "🎤" },
      { clue: "¿Qué material puede usar un artista para modelar una figura?", answers: ["La arcilla", "El vapor", "El sonido", "La luz"], correct: 0, emoji: "🏺" },
      { clue: "¿Qué suele hacer un director o directora de orquesta?", answers: ["Coordina a los músicos", "Construye los instrumentos", "Pinta el escenario", "Escribe las entradas"], correct: 0, emoji: "🎼" },
    ],
  },
  en: {
    1: [
      { clue: "Which instrument has black and white keys?", answers: ["The flute", "The piano", "The drum", "The guitar"], correct: 1, emoji: "🎹" },
      { clue: "What tool does an artist often use to paint on a canvas?", answers: ["A paintbrush", "A spoon", "A hammer", "A ruler"], correct: 0, emoji: "🖌️" },
      { clue: "Which instrument is played by strumming its strings?", answers: ["The trumpet", "The violin", "The guitar", "The drum"], correct: 2, emoji: "🎸" },
      { clue: "Which colors mix to make orange?", answers: ["Blue and green", "Red and yellow", "Black and white", "Purple and blue"], correct: 1, emoji: "🎨" },
      { clue: "Which instrument keeps the beat with its strikes?", answers: ["The drum", "The flute", "The piano", "The harp"], correct: 0, emoji: "🥁" },
      { clue: "What does a sculptor do to create a sculpture?", answers: ["Shapes or carves materials", "Composes a song", "Takes a photograph", "Writes a poem"], correct: 0, emoji: "🗿" },
    ],
    2: [
      { clue: "Which instrument family includes the flute and clarinet?", answers: ["Percussion", "Strings", "Woodwind", "Keyboard"], correct: 2, emoji: "🎶" },
      { clue: "What is a self-portrait?", answers: ["A portrait an artist makes of themselves", "A painting of a landscape", "A sculpture of an animal", "A drawing of an instrument"], correct: 0, emoji: "🖼️" },
      { clue: "Which instrument usually has four strings and rests under the chin?", answers: ["The violin", "The tuba", "The piano", "The drum"], correct: 0, emoji: "🎻" },
      { clue: "What does it mean to sing in a choir?", answers: ["Sing together as a group", "Play an instrument alone", "Paint while music plays", "Dance without music"], correct: 0, emoji: "🎤" },
      { clue: "Which material might an artist use to shape a figure?", answers: ["Clay", "Steam", "Sound", "Light"], correct: 0, emoji: "🏺" },
      { clue: "What does an orchestra conductor usually do?", answers: ["Coordinates the musicians", "Builds the instruments", "Paints the stage", "Writes the tickets"], correct: 0, emoji: "🎼" },
    ],
  },
};

function isValidQuestionSet(items) {
  return Array.isArray(items) && items.length > 0 && items.every((item) => (
    item
    && typeof item.clue === "string"
    && item.clue.trim().length > 0
    && Array.isArray(item.answers)
    && item.answers.length >= 2
    && item.answers.every((answer) => typeof answer === "string" && answer.trim().length > 0)
    && Number.isInteger(item.correct)
    && item.correct >= 0
    && item.correct < item.answers.length
    && (!item.emoji || typeof item.emoji === "string")
  ));
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function shuffleQuestionAnswers(items) {
  return items.map((item) => {
    const answerOrder = shuffle(item.answers.map((_, index) => index));
    return {
      ...item,
      answers: answerOrder.map((index) => item.answers[index]),
      correct: answerOrder.indexOf(item.correct),
    };
  });
}

export default function ArtMusicQuiz() {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const navigate = useNavigate();
  const t = translations.artMusicQuiz || {};
  const text = t.shared || {};
  const activeLanguage = language === "es" ? "es" : "en";
  const [questions, setQuestions] = useState([]);
  const [questionOrder, setQuestionOrder] = useState([]);
  const [availableLevels, setAvailableLevels] = useState({});
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [usingLocalContent, setUsingLocalContent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [allLevelsComplete, setAllLevelsComplete] = useState(false);
  const [levelNotice, setLevelNotice] = useState("");
  const [progressError, setProgressError] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    let active = true;
    if (authLoading) return () => { active = false; };

    const load = async () => {
      setContentError("");
      setContentLoading(true);
      setProgressError("");

      try {
        const result = await loadGameLevels({
          gameId: "art-music-quiz",
          language: activeLanguage,
          user,
          localLevels: localQuestions[activeLanguage],
          validateContent: isValidQuestionSet,
        });
        if (!active) return;

        const levelQuestions = shuffleQuestionAnswers(result.levels[result.level]);
        const order = shuffle(levelQuestions.map((_, index) => index));
        setQuestions(levelQuestions);
        setQuestionOrder(order);
        setAvailableLevels(result.levels);
        setLevel(result.level);
        setRound(result.allLevelsComplete ? order.length : 0);
        setScore(0);
        setSelectedAnswer(null);
        setFeedback("");
        setUsingLocalContent(result.usingLocalContent);
        setAllLevelsComplete(result.allLevelsComplete);
      } catch (error) {
        if (!active) return;
        console.error("Could not load art and music questions or game progress:", error);
        setContentError(error.stage === "progress"
          ? text.progressLoadError
          : text.contentLoadError);
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
    text.contentLoadError,
    text.progressLoadError,
    user,
  ]);

  const finished = round >= questionOrder.length;
  const currentQuestion = finished ? null : questions[questionOrder[round]];
  const progress = (round / questionOrder.length) * 100;

  const handleAnswer = (answerIndex) => {
    if (feedback === "correct" || !currentQuestion) return;
    setSelectedAnswer(answerIndex);
    if (answerIndex === currentQuestion.correct) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("art-music-quiz");
      setFeedback("correct");
      return;
    }
    setFeedback("incorrect");
  };

  const completeLevel = async () => {
    setSavingProgress(true);
    setProgressError("");
    try {
      const completed = await saveGameLevel({
        gameId: "art-music-quiz",
        language: activeLanguage,
        user,
        level,
      });
      const nextLevel = completed + 1;
      if (availableLevels[nextLevel]) {
        const nextQuestions = shuffleQuestionAnswers(availableLevels[nextLevel]);
        setQuestions(nextQuestions);
        setQuestionOrder(shuffle(nextQuestions.map((_, index) => index)));
        setLevel(nextLevel);
        setRound(0);
        setScore(0);
        setSelectedAnswer(null);
        setFeedback("");
        setAllLevelsComplete(false);
        setLevelNotice(`${text.levelComplete} ${text.level} ${nextLevel}`);
      } else {
        setRound(questionOrder.length);
        setLevelNotice("");
        setAllLevelsComplete(true);
      }
    } catch (error) {
      console.error("Could not save completed art and music level:", error);
      setProgressError(text.progressSaveError);
      setRound(questionOrder.length);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleNext = () => {
    if (round === questionOrder.length - 1) {
      completeLevel();
      return;
    }
    setRound((currentRoundIndex) => currentRoundIndex + 1);
    setSelectedAnswer(null);
    setFeedback("");
  };

  const restart = () => {
    const randomizedQuestions = shuffleQuestionAnswers(questions);
    setQuestions(randomizedQuestions);
    setQuestionOrder(shuffle(randomizedQuestions.map((_, index) => index)));
    setRound(0);
    setScore(0);
    setSelectedAnswer(null);
    setFeedback("");
    setAllLevelsComplete(false);
    setLevelNotice("");
    setProgressError("");
  };

  return (
    <main className="art-music-game">
      <Card className="art-music-card" component="section">
        <GameToolbar
          level={level}
          points={score}
          levelLabel={text.level}
          pointsLabel={text.points}
          exitLabel={text.exit}
          onExit={() => navigate("/?category=art-music")}
        />
        <div className="art-music-badge" aria-hidden="true"><Palette /></div>
        <Typography component="h1" variant="h3" className="art-music-title">
          {t.title}
        </Typography>
        <Typography className="art-music-description">{t.description}</Typography>

        {contentLoading ? (
          <div className="art-music-loading" role="status">
            <CircularProgress aria-label={text.contentLoading} />
            <Typography>{text.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="art-music-content-error">
            <Alert severity="error" role="alert">{contentError}</Alert>
            <AppButton onClick={() => setRetryCount((count) => count + 1)}>
              {text.retry}
            </AppButton>
          </div>
        ) : (
          <>
            {usingLocalContent && (
              <Alert className="art-music-feedback" severity="info" role="status">
                {text.localContentNotice}
              </Alert>
            )}
            {levelNotice && (
              <Alert className="art-music-feedback" severity="success" role="status">
                {levelNotice}
              </Alert>
            )}
            {allLevelsComplete && (
              <Alert className="art-music-feedback" severity="success" role="status">
                {text.allLevelsComplete}
              </Alert>
            )}
            {progressError && (
              <Alert className="art-music-feedback" severity="error" role="alert">
                {progressError}
              </Alert>
            )}

            {!finished ? (
              <>
                <div className="art-music-status">
                  <Typography>{text.round} {round + 1} {text.of} {questionOrder.length}</Typography>
                </div>
                <LinearProgress
                  className="art-music-progress"
                  variant="determinate"
                  value={progress}
                  aria-label={text.progress}
                />
                <div className="art-music-prompt">
                  <span className="art-music-emoji" aria-hidden="true">
                    {currentQuestion.emoji || "🎨"}
                  </span>
                  <Typography className="art-music-question" aria-live="polite">
                    {currentQuestion.clue}
                  </Typography>
                </div>
                <Typography className="art-music-instruction">{text.chooseAnswer}</Typography>
                <div className="art-music-answers">
                  {currentQuestion.answers.map((answer, index) => {
                    const isSelected = selectedAnswer === index;
                    const answerClass = [
                      "art-music-answer",
                      isSelected && feedback === "correct" ? "is-correct" : "",
                      isSelected && feedback === "incorrect" ? "is-incorrect" : "",
                    ].filter(Boolean).join(" ");

                    return (
                      <button
                        className={answerClass}
                        key={answer}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={feedback === "correct" || savingProgress}
                        onClick={() => handleAnswer(index)}
                      >
                        {answer}
                      </button>
                    );
                  })}
                </div>
                {feedback === "correct" && (
                  <>
                    <Alert className="art-music-feedback" severity="success" role="status">
                      {text.correct}
                    </Alert>
                    <AppButton
                      disabled={savingProgress}
                      onClick={handleNext}
                      endIcon={<AutoAwesome />}
                    >
                      {savingProgress
                        ? text.savingProgress
                        : (round === questionOrder.length - 1 ? text.finishLevel : text.next)}
                    </AppButton>
                  </>
                )}
                {feedback === "incorrect" && (
                  <Alert className="art-music-feedback" severity="warning" role="status">
                    {text.tryAgain}
                  </Alert>
                )}
              </>
            ) : (
              <div className="art-music-finish">
                <span aria-hidden="true">🎉</span>
                <Typography component="h2">{text.finished}</Typography>
                <Typography className="art-music-final-score">
                  {text.finalScore}: {score} / {questionOrder.length}
                </Typography>
                {!allLevelsComplete ? (
                  <AppButton
                    disabled={savingProgress}
                    onClick={completeLevel}
                    endIcon={<AutoAwesome />}
                  >
                    {savingProgress ? text.savingProgress : text.finishLevel}
                  </AppButton>
                ) : (
                  <AppButton onClick={restart} endIcon={<AutoAwesome />}>
                    {text.playAgain}
                  </AppButton>
                )}
              </div>
            )}
          </>
        )}
      </Card>
    </main>
  );
}
