import React, { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import { AutoAwesome, HistoryEdu } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import supabase from "../../lib/supabaseClient";
import "./WorldHistoryGame.css";

const localQuestions = {
  es: [
    { clue: "¿A orillas de qué río se desarrolló el antiguo Egipto?", answers: ["El Amazonas", "El Nilo", "El Danubio", "El Tíber"], correct: 1, emoji: "🏺" },
    { clue: "¿En qué región surgieron algunas de las primeras ciudades, entre los ríos Tigris y Éufrates?", answers: ["Escandinavia", "Los Andes", "Mesopotamia", "Polinesia"], correct: 2, emoji: "🧱" },
    { clue: "¿Qué antigua civilización construyó el Partenón en Atenas?", answers: ["La maya", "La persa", "La vikinga", "La griega"], correct: 3, emoji: "🏛️" },
    { clue: "¿Qué imperio construyó una extensa red de caminos alrededor del mar Mediterráneo?", answers: ["El Imperio inca", "El Imperio mongol", "El Imperio romano", "El Imperio azteca"], correct: 2, emoji: "🛣️" },
    { clue: "¿En qué país se encuentra la Gran Muralla?", answers: ["China", "India", "Egipto", "Italia"], correct: 0, emoji: "🐉" },
    { clue: "¿Qué pueblo construyó la ciudad de Machu Picchu en los Andes?", answers: ["Los romanos", "Los fenicios", "Los incas", "Los egipcios"], correct: 2, emoji: "⛰️" },
    { clue: "¿Qué invento ayudó a producir libros en grandes cantidades en Europa desde el siglo XV?", answers: ["El telescopio", "La brújula", "El motor de vapor", "La imprenta"], correct: 3, emoji: "📚" },
    { clue: "¿Qué ruta conectó durante siglos a Asia y Europa mediante el comercio?", answers: ["La Ruta del Ámbar", "La Ruta de la Seda", "El Camino Real", "La Ruta de la Sal"], correct: 1, emoji: "🐫" },
  ],
  en: [
    { clue: "Along which river did ancient Egypt develop?", answers: ["The Amazon", "The Nile", "The Danube", "The Tiber"], correct: 1, emoji: "🏺" },
    { clue: "In which region did some of the first cities rise between the Tigris and Euphrates rivers?", answers: ["Scandinavia", "The Andes", "Mesopotamia", "Polynesia"], correct: 2, emoji: "🧱" },
    { clue: "Which ancient civilization built the Parthenon in Athens?", answers: ["The Maya", "The Persians", "The Vikings", "The Greeks"], correct: 3, emoji: "🏛️" },
    { clue: "Which empire built an extensive network of roads around the Mediterranean Sea?", answers: ["The Inca Empire", "The Mongol Empire", "The Roman Empire", "The Aztec Empire"], correct: 2, emoji: "🛣️" },
    { clue: "Which country is home to the Great Wall?", answers: ["China", "India", "Egypt", "Italy"], correct: 0, emoji: "🐉" },
    { clue: "Which people built the city of Machu Picchu in the Andes?", answers: ["The Romans", "The Phoenicians", "The Incas", "The Egyptians"], correct: 2, emoji: "⛰️" },
    { clue: "Which invention helped produce books in large numbers in Europe from the 15th century?", answers: ["The telescope", "The compass", "The steam engine", "The printing press"], correct: 3, emoji: "📚" },
    { clue: "Which route connected Asia and Europe through trade for centuries?", answers: ["The Amber Road", "The Silk Road", "The Royal Road", "The Salt Route"], correct: 1, emoji: "🐫" },
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
  const storedProgress = localStorage.getItem("game-progress:world-history:1");
  if (storedProgress === null) return 0;
  const completedLevel = Number(storedProgress);
  if (!Number.isSafeInteger(completedLevel) || completedLevel < 0) {
    throw new Error("Stored world history progress is invalid.");
  }
  return completedLevel;
}

export default function WorldHistoryGame() {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const gameText = translations.worldHistoryGame || {};
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
            .eq("game_id", "world-history")
            .eq("language", activeLanguage)
            .eq("volume", 1)
            .eq("is_published", true)
            .order("level");
          if (error) throw error;
          if (!data?.length) throw new Error(`No published world history questions found (${activeLanguage}).`);

          levels = {};
          data.forEach((row) => {
            if (!isValidQuestionSet(row.content)) {
              throw new Error(`Published world history level ${row.level} (${activeLanguage}) has an invalid format.`);
            }
            levels[row.level] = row.content;
          });

          loadingProgress = true;
          if (user) {
            const { data: progress, error: progressQueryError } = await supabase
              .from("user_game_progress")
              .select("highest_completed_level")
              .eq("game_id", "world-history")
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
          throw new Error(`No published world history content available for level ${levelToLoad}.`);
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
        console.error("Could not load world history questions or game progress:", error);
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
      awardPoint("world-history");
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
          p_game_id: "world-history",
          p_volume: 1,
          p_language: activeLanguage,
          p_level: level,
        });
        if (error) throw error;
        completed = Number(data);
        if (!Number.isSafeInteger(completed) || completed < level) {
          throw new Error("The world history progress response is invalid.");
        }
      } else {
        localStorage.setItem("game-progress:world-history:1", String(level));
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
      console.error("Could not save completed world history level:", error);
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
    <main className="world-history-game">
      <Card className="world-history-card" component="section">
        <GameToolbar
          level={level}
          points={score}
          levelLabel={text.level}
          pointsLabel={text.score}
          exitLabel={text.exit}
          onExit={() => navigate("/?category=world-history")}
        />
        <div className="world-history-badge" aria-hidden="true"><HistoryEdu /></div>
        <Typography component="h1" variant="h3" className="world-history-title">
          {gameText.title}
        </Typography>
        <Typography className="world-history-description">{gameText.description}</Typography>

        {contentLoading ? (
          <div className="world-history-loading" role="status">
            <CircularProgress aria-label={text.contentLoading} />
            <Typography>{text.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="world-history-content-error">
            <Alert severity="error" role="alert">{contentError}</Alert>
            <AppButton onClick={() => setRetryCount((count) => count + 1)}>
              {text.retry}
            </AppButton>
          </div>
        ) : (
          <>
            {usingLocalContent && (
              <Alert className="world-history-feedback" severity="info" role="status">
                {text.localContentNotice}
              </Alert>
            )}
            {levelNotice && (
              <Alert className="world-history-feedback" severity="success" role="status">
                {levelNotice}
              </Alert>
            )}
            {!finished ? (
              <>
                <div className="world-history-status">
                  <Typography>{text.round} {round + 1} {text.of} {questionOrder.length}</Typography>
                </div>
                <LinearProgress
                  className="world-history-progress"
                  variant="determinate"
                  value={progress}
                  aria-label={text.progress}
                />
                <div className="world-history-prompt">
                  <span className="world-history-emoji" aria-hidden="true">
                    {currentQuestion.emoji || "🌍"}
                  </span>
                  <Typography className="world-history-question" aria-live="polite">
                    {currentQuestion.clue}
                  </Typography>
                </div>
                <Typography className="world-history-instruction">{text.chooseAnswer}</Typography>
                <div className="world-history-answers">
                  {currentQuestion.answers.map((answer, index) => {
                    const isSelected = selectedAnswer === index;
                    const answerClass = [
                      "world-history-answer",
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
                    <Alert className="world-history-feedback" severity="success" role="status">
                      {text.correct}
                    </Alert>
                    <AppButton onClick={handleNext} disabled={savingProgress} endIcon={<AutoAwesome />}>
                      {round === questionOrder.length - 1 ? text.finishLevel : text.next}
                    </AppButton>
                  </>
                )}
                {feedback === "incorrect" && (
                  <Alert className="world-history-feedback" severity="warning" role="status">
                    {text.tryAgain}
                  </Alert>
                )}
              </>
            ) : (
              <div className="world-history-finish">
                <span className="world-history-finish-emoji" aria-hidden="true">🌍</span>
                <Typography component="h2">
                  {allLevelsComplete ? text.allLevelsComplete : text.finished}
                </Typography>
                <Typography className="world-history-final-score">
                  {text.finalScore}: {score} / {questionOrder.length}
                </Typography>
                {progressError && (
                  <Alert severity="error" role="alert">{progressError}</Alert>
                )}
                {savingProgress && <CircularProgress aria-label={text.savingProgress} />}
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
