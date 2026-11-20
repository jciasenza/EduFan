import React, { useEffect, useState } from "react";
import {
  Alert,
  Card,
  LinearProgress,
  Typography,
} from "@mui/material";
import { AutoAwesome, Science } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import supabase from "../../lib/supabaseClient";
import "./ScienceGame.css";
import Loading from "../../components/ui/Loading";

const localQuestions = {
  es: [
    { clue: "¿Cuál es el planeta más cercano al Sol?", answers: ["Marte", "Mercurio", "Venus", "Júpiter"], correct: 1, emoji: "☀️" },
    { clue: "¿Qué necesita una planta para crecer?", answers: ["Agua y luz del Sol", "Solo arena", "Hielo y viento", "Piedras"], correct: 0, emoji: "🌱" },
    { clue: "¿Qué órgano bombea la sangre por el cuerpo?", answers: ["El pulmón", "El cerebro", "El corazón", "El estómago"], correct: 2, emoji: "❤️" },
    { clue: "¿A qué temperatura se congela el agua?", answers: ["A 0 °C", "A 50 °C", "A 100 °C", "A 20 °C"], correct: 0, emoji: "🧊" },
    { clue: "¿Cuántas patas tiene una araña?", answers: ["Seis", "Ocho", "Cuatro", "Diez"], correct: 1, emoji: "🕷️" },
    { clue: "¿Qué gas necesitamos para respirar?", answers: ["Oxígeno", "Helio", "Humo", "Vapor"], correct: 0, emoji: "🌬️" },
    { clue: "¿Qué es la Luna de la Tierra?", answers: ["Una estrella", "Un planeta", "Un satélite natural", "Un cometa"], correct: 2, emoji: "🌙" },
    { clue: "¿Qué aparece en el cielo cuando la luz del Sol atraviesa gotas de lluvia?", answers: ["Un arcoíris", "Una aurora", "Un cometa", "Un relámpago"], correct: 0, emoji: "🌈" },
  ],
  en: [
    { clue: "Which planet is closest to the Sun?", answers: ["Mars", "Mercury", "Venus", "Jupiter"], correct: 1, emoji: "☀️" },
    { clue: "What does a plant need to grow?", answers: ["Water and sunlight", "Only sand", "Ice and wind", "Rocks"], correct: 0, emoji: "🌱" },
    { clue: "Which organ pumps blood around your body?", answers: ["The lungs", "The brain", "The heart", "The stomach"], correct: 2, emoji: "❤️" },
    { clue: "At what temperature does water freeze?", answers: ["At 0 °C", "At 50 °C", "At 100 °C", "At 20 °C"], correct: 0, emoji: "🧊" },
    { clue: "How many legs does a spider have?", answers: ["Six", "Eight", "Four", "Ten"], correct: 1, emoji: "🕷️" },
    { clue: "Which gas do we need to breathe?", answers: ["Oxygen", "Helium", "Smoke", "Steam"], correct: 0, emoji: "🌬️" },
    { clue: "What is Earth's Moon?", answers: ["A star", "A planet", "A natural satellite", "A comet"], correct: 2, emoji: "🌙" },
    { clue: "What can appear when sunlight shines through raindrops?", answers: ["A rainbow", "An aurora", "A comet", "A lightning bolt"], correct: 0, emoji: "🌈" },
  ],
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

function getLocalCompletedLevel() {
  const storedProgress = localStorage.getItem("game-progress:science:1");
  if (storedProgress === null) return 0;
  const completedLevel = Number(storedProgress);
  if (!Number.isSafeInteger(completedLevel) || completedLevel < 0) {
    throw new Error("Stored science progress is invalid.");
  }
  return completedLevel;
}

export default function ScienceGame() {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const gameText = translations.scienceGame || {};
  const text = gameText.shared || {};
  const navigate = useNavigate();
  const activeLanguage = language === "es" ? "es" : "en";
  const [questionSet, setQuestionSet] = useState([]);
  const [questionOrder, setQuestionOrder] = useState([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [usingLocalContent, setUsingLocalContent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [level, setLevel] = useState(1);
  const [availableLevels, setAvailableLevels] = useState({});
  const [allLevelsComplete, setAllLevelsComplete] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);
  const [levelNotice, setLevelNotice] = useState("");

  useEffect(() => {
    let active = true;
    if (authLoading) return () => { active = false; };

    const loadGame = async () => {
      setContentError("");
      setProgressError("");
      setContentLoading(true);
      setAllLevelsComplete(false);
      setLevelNotice("");

      let levels;
      let isLocal = false;
      let completed = 0;
      let loadingProgress = false;

      try {
        if (!supabase) {
          levels = { 1: localQuestions[activeLanguage] };
          isLocal = true;
          loadingProgress = true;
          completed = getLocalCompletedLevel();
          loadingProgress = false;
        } else {
          const { data, error } = await supabase
            .from("game_content")
            .select("content, level")
            .eq("game_id", "science")
            .eq("language", activeLanguage)
            .eq("volume", 1)
            .eq("is_published", true)
            .order("level");
          if (error) throw error;
          if (!data?.length) throw new Error(`No published science questions found (${activeLanguage}).`);

          levels = {};
          data.forEach((row) => {
            if (!isValidQuestionSet(row.content)) {
              throw new Error(`Published science level ${row.level} (${activeLanguage}) has an invalid format.`);
            }
            levels[row.level] = row.content;
          });

          loadingProgress = true;
          if (user) {
            const { data: progress, error: progressQueryError } = await supabase
              .from("user_game_progress")
              .select("highest_completed_level")
              .eq("game_id", "science")
              .eq("volume", 1)
              .maybeSingle();
            if (progressQueryError) throw progressQueryError;
            completed = progress?.highest_completed_level || 0;
          } else {
            completed = getLocalCompletedLevel();
          }
          loadingProgress = false;
        }

        if (!active) return;
        const nextLevel = completed + 1;
        const levelToLoad = levels[nextLevel] ? nextLevel : Math.max(1, completed);
        const selectedQuestions = levels[levelToLoad];
        if (!selectedQuestions) {
          throw new Error(`No published science content available for level ${levelToLoad}.`);
        }
        const order = shuffle(selectedQuestions.map((_, index) => index));
        setAvailableLevels(levels);
        setQuestionSet(selectedQuestions);
        setQuestionOrder(order);
        setLevel(levelToLoad);
        setRound(levels[nextLevel] ? 0 : order.length);
        setScore(0);
        setSelectedAnswer(null);
        setFeedback("");
        setUsingLocalContent(isLocal);
        setAllLevelsComplete(!levels[nextLevel] && completed > 0);
        setContentLoading(false);
      } catch (error) {
        if (!active) return;
        console.error("Could not load science questions or game progress:", error);
        setQuestionSet([]);
        setQuestionOrder([]);
        setContentError(loadingProgress ? text.progressLoadError : text.contentLoadError);
        setContentLoading(false);
      }
    };

    loadGame();
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
  const currentQuestion = finished ? null : questionSet[questionOrder[round]];
  const progress = (round / questionOrder.length) * 100;

  const handleAnswer = (answerIndex) => {
    if (feedback === "correct") return;
    setSelectedAnswer(answerIndex);
    if (answerIndex === currentQuestion.correct) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("science");
      setFeedback("correct");
      return;
    }
    setFeedback("incorrect");
  };

  const completeLevel = async () => {
    setSavingProgress(true);
    setProgressError("");
    try {
      let completed = level;
      if (supabase && user) {
        const { data, error } = await supabase.rpc("complete_game_level", {
          p_game_id: "science",
          p_volume: 1,
          p_language: activeLanguage,
          p_level: level,
        });
        if (error) throw error;
        completed = Number(data);
        if (!Number.isSafeInteger(completed) || completed < level) {
          throw new Error("The science progress response is invalid.");
        }
      } else {
        localStorage.setItem("game-progress:science:1", String(level));
      }

      const nextLevel = completed + 1;
      if (availableLevels[nextLevel]) {
        const nextQuestions = availableLevels[nextLevel];
        setQuestionSet(nextQuestions);
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
        setAllLevelsComplete(true);
      }
    } catch (error) {
      console.error("Could not save completed science level:", error);
      setRound(questionOrder.length);
      setProgressError(text.progressSaveError);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleNext = async () => {
    setLevelNotice("");
    if (round === questionOrder.length - 1) {
      await completeLevel();
      return;
    }
    setRound((currentRound) => currentRound + 1);
    setSelectedAnswer(null);
    setFeedback("");
  };

  const handleRestart = () => {
    setQuestionOrder(shuffle(questionSet.map((_, index) => index)));
    setRound(0);
    setScore(0);
    setSelectedAnswer(null);
    setFeedback("");
    setAllLevelsComplete(false);
    setLevelNotice("");
  };

  return (
    <main className="science-game">
      <Card className="science-card" component="section">
        <GameToolbar
          level={level}
          points={score}
          levelLabel={text.level}
          pointsLabel={text.score}
          exitLabel={text.exit}
          onExit={() => navigate("/?category=science")}
        />
        <div className="science-badge" aria-hidden="true">
          <Science />
        </div>
        <Typography component="h1" variant="h3" className="science-title">
          {gameText.title}
        </Typography>
        <Typography className="science-description">{gameText.description}</Typography>

        {contentLoading ? (
          <div className="science-loading" role="status">
            <Loading aria-label={text.contentLoading} />
            <Typography>{text.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="science-content-error">
            <Alert severity="error" role="alert">{contentError}</Alert>
            <AppButton onClick={() => setRetryCount((count) => count + 1)}>
              {text.retry}
            </AppButton>
          </div>
        ) : (
          <>
            {usingLocalContent && (
              <Alert className="science-feedback" severity="info" role="status">
                {text.localContentNotice}
              </Alert>
            )}
            {levelNotice && (
              <Alert className="science-feedback" severity="success" role="status">
                {levelNotice}
              </Alert>
            )}
            {!finished ? (
              <>
                <div className="science-status">
                  <Typography>{text.round} {round + 1} {text.of} {questionOrder.length}</Typography>
                </div>
                <LinearProgress
                  className="science-progress"
                  variant="determinate"
                  value={progress}
                  aria-label={text.progress}
                />
                <div className="science-prompt">
                  <span className="science-emoji" aria-hidden="true">
                    {currentQuestion.emoji || "🔬"}
                  </span>
                  <Typography className="science-question" aria-live="polite">
                    {currentQuestion.clue}
                  </Typography>
                </div>
                <Typography className="science-instruction">{text.chooseAnswer}</Typography>
                <div className="science-answers">
                  {currentQuestion.answers.map((answer, index) => {
                    const isSelected = selectedAnswer === index;
                    const answerClass = [
                      "science-answer",
                      isSelected && feedback === "correct" ? "is-correct" : "",
                      isSelected && feedback === "incorrect" ? "is-incorrect" : "",
                    ].filter(Boolean).join(" ");

                    return (
                      <button
                        className={answerClass}
                        key={answer}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={feedback === "correct"}
                        onClick={() => handleAnswer(index)}
                      >
                        {answer}
                      </button>
                    );
                  })}
                </div>
                {feedback === "correct" && (
                  <>
                    <Alert className="science-feedback" severity="success" role="status">
                      {text.correct}
                    </Alert>
                    <AppButton onClick={handleNext} disabled={savingProgress} endIcon={<AutoAwesome />}>
                      {round === questionOrder.length - 1 ? text.finishLevel : text.next}
                    </AppButton>
                  </>
                )}
                {feedback === "incorrect" && (
                  <Alert className="science-feedback" severity="warning" role="status">
                    {text.tryAgain}
                  </Alert>
                )}
              </>
            ) : (
              <div className="science-finish">
                <span className="science-finish-emoji" aria-hidden="true">🎉</span>
                <Typography component="h2">
                  {allLevelsComplete ? text.allLevelsComplete : text.finished}
                </Typography>
                <Typography className="science-final-score">
                  {text.finalScore}: {score} / {questionOrder.length}
                </Typography>
                {progressError && (
                  <Alert severity="error" role="alert">{progressError}</Alert>
                )}
                {savingProgress && <Loading aria-label={text.savingProgress} />}
                <AppButton
                  onClick={progressError ? completeLevel : handleRestart}
                  disabled={savingProgress}
                  endIcon={<AutoAwesome />}
                >
                  {progressError
                    ? text.retry
                    : (allLevelsComplete ? text.playAgain : text.continue)}
                </AppButton>
              </div>
            )}
          </>
        )}
      </Card>
    </main>
  );
}
