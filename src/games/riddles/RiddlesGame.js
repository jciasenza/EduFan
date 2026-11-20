import React, { useEffect, useState } from "react";
import { Alert, Card, LinearProgress, Typography } from "@mui/material";
import { AutoAwesome, Lightbulb } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import supabase from "../../lib/supabaseClient";
import "./RiddlesGame.css";
import Loading from "../../components/ui/Loading";

const localRiddles = {
  es: [
    {
      clue: "Tengo agujas y no sé coser, tengo números y no sé leer. ¿Qué soy?",
      answers: ["Un reloj", "Un peine", "Una brújula", "Un lápiz"],
      correct: 0,
    },
    {
      clue: "Blanca por dentro, verde por fuera. Si quieres que te lo diga, espera.",
      answers: ["La manzana", "La pera", "La sandía", "La uva"],
      correct: 1,
    },
    {
      clue: "Tiene muchos dientes, pero nunca puede comer. ¿Qué es?",
      answers: ["Un tiburón", "Un peine", "Un cocodrilo", "Una cremallera"],
      correct: 1,
    },
    {
      clue: "Cuanto más le quitas, más grande se hace. ¿Qué es?",
      answers: ["Un agujero", "Una montaña", "Una caja", "Una nube"],
      correct: 0,
    },
    {
      clue: "Tiene cuatro patas y no puede caminar. ¿Qué es?",
      answers: ["Un perro", "Una silla", "Una mesa", "Un caballo"],
      correct: 2,
    },
    {
      clue: "Vuelo sin alas y lloro sin ojos. ¿Qué soy?",
      answers: ["Una nube", "Un avión", "Una mariposa", "Una cometa"],
      correct: 0,
    },
    {
      clue: "Redonda soy y al saltar, muchas risas puedo dar. ¿Qué soy?",
      answers: ["Una naranja", "Una pelota", "Una rueda", "Una moneda"],
      correct: 1,
    },
    {
      clue: "Tiene hojas y no es árbol, tiene letras y no sabe hablar. ¿Qué es?",
      answers: ["Un libro", "Una flor", "Un cuaderno vacío", "Una carta"],
      correct: 0,
    },
  ],
  en: [
    {
      clue: "I have hands and a face, but no arms or eyes. What am I?",
      answers: ["A clock", "A doll", "A book", "A mirror"],
      correct: 0,
    },
    {
      clue: "I have teeth but I never bite. What am I?",
      answers: ["A shark", "A comb", "A crocodile", "A zipper"],
      correct: 1,
    },
    {
      clue: "The more you take away from me, the bigger I get. What am I?",
      answers: ["A hole", "A hill", "A box", "A cloud"],
      correct: 0,
    },
    {
      clue: "I have four legs but I cannot walk. What am I?",
      answers: ["A dog", "A chair", "A horse", "A cat"],
      correct: 1,
    },
    {
      clue: "I fly without wings and cry without eyes. What am I?",
      answers: ["A cloud", "An airplane", "A butterfly", "A kite"],
      correct: 0,
    },
    {
      clue: "I am round and bouncy, and I love to play. What am I?",
      answers: ["An orange", "A ball", "A wheel", "A coin"],
      correct: 1,
    },
    {
      clue: "I have pages and words, but I cannot talk. What am I?",
      answers: ["A book", "A flower", "A radio", "A letter"],
      correct: 0,
    },
    {
      clue: "I get wetter the more I dry. What am I?",
      answers: ["A sponge", "A towel", "An umbrella", "A cloud"],
      correct: 1,
    },
  ],
};

const localRiddleLevels = {
  es: {
    1: localRiddles.es,
    2: [
      { clue: "Tengo ciudades, pero no casas; ríos, pero no agua. ¿Qué soy?", answers: ["Un mapa", "Un libro", "Un reloj", "Un cuadro"], correct: 0 },
      { clue: "Me rompes antes de usarme para cocinar. ¿Qué soy?", answers: ["Un vaso", "Un plato", "Un huevo", "Una cuchara"], correct: 2 },
      { clue: "No tengo boca y repito lo que dices. ¿Qué soy?", answers: ["El viento", "El eco", "El teléfono", "La música"], correct: 1 },
      { clue: "Si dices mi nombre, dejo de existir. ¿Qué soy?", answers: ["La sombra", "El silencio", "La noche", "El sueño"], correct: 1 },
      { clue: "Cuanto más grande soy, menos puedes ver. ¿Qué soy?", answers: ["La oscuridad", "La ventana", "La lupa", "La luz"], correct: 0 },
      { clue: "Tengo cuello, pero no cabeza. ¿Qué soy?", answers: ["Una camisa", "Una botella", "Una jirafa", "Una guitarra"], correct: 1 },
      { clue: "Corro sin tener pies y tengo lecho, pero no duermo. ¿Qué soy?", answers: ["Un caballo", "Un río", "Un tren", "Un niño"], correct: 1 },
      { clue: "Tengo un ojo y no puedo ver. ¿Qué soy?", answers: ["Una aguja", "Un botón", "Una papa", "Un dado"], correct: 0 },
    ],
  },
  en: {
    1: localRiddles.en,
    2: [
      { clue: "I have cities but no houses, rivers but no water. What am I?", answers: ["A map", "A book", "A clock", "A painting"], correct: 0 },
      { clue: "You break me before using me to cook. What am I?", answers: ["A glass", "A plate", "An egg", "A spoon"], correct: 2 },
      { clue: "I have no mouth, but I repeat what you say. What am I?", answers: ["The wind", "An echo", "A phone", "Music"], correct: 1 },
      { clue: "If you say my name, I disappear. What am I?", answers: ["A shadow", "Silence", "The night", "A dream"], correct: 1 },
      { clue: "The bigger I get, the less you can see. What am I?", answers: ["Darkness", "A window", "A magnifying glass", "Light"], correct: 0 },
      { clue: "I have a neck but no head. What am I?", answers: ["A shirt", "A bottle", "A giraffe", "A guitar"], correct: 1 },
      { clue: "I run without feet and have a bed but never sleep. What am I?", answers: ["A horse", "A river", "A train", "A child"], correct: 1 },
      { clue: "I have one eye but cannot see. What am I?", answers: ["A needle", "A button", "A potato", "A die"], correct: 0 },
    ],
  },
};

function isValidRiddleSet(items) {
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

function getLocalCompletedLevel(language) {
  const progressKey = "game-progress:riddles:1";
  let storedProgress = localStorage.getItem(progressKey);

  if (storedProgress === null) {
    storedProgress = localStorage.getItem(`${progressKey}:${language}`);
    if (storedProgress === null) return 0;
    localStorage.setItem(progressKey, storedProgress);
  }

  const completedLevel = Number(storedProgress);
  if (!Number.isSafeInteger(completedLevel) || completedLevel < 0) {
    throw new Error("Stored riddle progress is invalid.");
  }
  return completedLevel;
}

export default function RiddlesGame() {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const gameText = translations.riddlesGame || {};
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
          levels = Object.fromEntries(
            Object.entries(localRiddleLevels[activeLanguage])
              .map(([number, content]) => [number, content]),
          );
          isLocal = true;
          loadingProgress = true;
          completed = getLocalCompletedLevel(activeLanguage);
          loadingProgress = false;
        } else {
          const { data, error } = await supabase
            .from("game_content")
            .select("content, level")
            .eq("game_id", "riddles")
            .eq("language", activeLanguage)
            .eq("volume", 1)
            .eq("is_published", true)
            .order("level");
          if (error) throw error;
          if (!data?.length) throw new Error(`No published riddles found (${activeLanguage}).`);

          levels = {};
          data.forEach((row) => {
            if (!isValidRiddleSet(row.content)) {
              throw new Error(`Published riddle level ${row.level} (${activeLanguage}) has an invalid format.`);
            }
            levels[row.level] = row.content;
          });

          loadingProgress = true;
          if (user) {
            const { data: progress, error: progressQueryError } = await supabase
              .from("user_game_progress")
              .select("highest_completed_level")
              .eq("game_id", "riddles")
              .eq("volume", 1)
              .maybeSingle();
            if (progressQueryError) throw progressQueryError;
            completed = progress?.highest_completed_level || 0;
          } else {
            completed = getLocalCompletedLevel(activeLanguage);
          }
          loadingProgress = false;
        }

        if (!active) return;
        const nextLevel = completed + 1;
        const levelToLoad = levels[nextLevel] ? nextLevel : Math.max(1, completed);
        const selectedQuestions = levels[levelToLoad];
        if (!selectedQuestions) {
          throw new Error(`No published riddle content available for level ${levelToLoad}.`);
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
        console.error("Could not load riddles or game progress:", error);
        setQuestionSet([]);
        setQuestionOrder([]);
        setContentError(loadingProgress ? text.progressLoadError : text.contentLoadError);
        setContentLoading(false);
      }
    };

    loadGame();

    return () => { active = false; };
  }, [activeLanguage, authLoading, retryCount, text.contentLoadError, text.progressLoadError, user]);

  const finished = round >= questionOrder.length;
  const currentRiddle = finished ? null : questionSet[questionOrder[round]];
  const progress = (round / questionOrder.length) * 100;

  const handleAnswer = (answerIndex) => {
    if (feedback === "correct") return;
    setSelectedAnswer(answerIndex);
    if (answerIndex === currentRiddle.correct) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("riddles");
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
          p_game_id: "riddles",
          p_volume: 1,
          p_language: activeLanguage,
          p_level: level,
        });
        if (error) throw error;
        completed = Number(data);
        if (!Number.isSafeInteger(completed) || completed < level) {
          throw new Error("The game progress response is invalid.");
        }
      } else {
        localStorage.setItem("game-progress:riddles:1", String(level));
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
      console.error("Could not save completed game level:", error);
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
    <main className="riddles-game">
      <Card className="riddles-card" component="section">
        <GameToolbar
          level={level}
          points={score}
          levelLabel={text.level}
          pointsLabel={text.score}
          exitLabel={text.exit}
          onExit={() => navigate("/?category=riddles")}
        />
        <div className="riddles-badge" aria-hidden="true">
          <Lightbulb />
        </div>
        <Typography component="h1" variant="h3" className="riddles-title">
          {gameText.title}
        </Typography>
        <Typography className="riddles-description">{gameText.description}</Typography>

        {contentLoading ? (
          <div className="riddles-loading" role="status">
            <Loading aria-label={text.contentLoading} />
            <Typography>{text.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="riddles-content-error">
            <Alert severity="error" role="alert">{contentError}</Alert>
            <AppButton onClick={() => setRetryCount((count) => count + 1)}>
              {text.retry}
            </AppButton>
          </div>
        ) : (
          <>
            {usingLocalContent && (
              <Alert className="riddles-local-content-note" severity="info" role="status">
                {text.localContentNotice}
              </Alert>
            )}
            {levelNotice && (
              <Alert className="riddles-local-content-note" severity="success" role="status">
                {levelNotice}
              </Alert>
            )}
            {!finished ? (
          <>
            <div className="riddles-status">
              <Typography>{text.round} {round + 1} {text.of} {questionOrder.length}</Typography>
            </div>
            <LinearProgress
              className="riddles-progress"
              variant="determinate"
              value={progress}
              aria-label={text.progress}
            />
            <div className="riddle-prompt">
              <span className="riddle-emoji" aria-hidden="true">🤔</span>
              <Typography className="riddle-clue" aria-live="polite">
                {currentRiddle.clue}
              </Typography>
            </div>
            <Typography className="riddles-instruction">{text.chooseAnswer}</Typography>
            <div className="riddles-answers">
              {currentRiddle.answers.map((answer, index) => {
                const isSelected = selectedAnswer === index;
                const answerClass = [
                  "riddle-answer",
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
                <Alert className="riddles-feedback" severity="success" role="status">
                  {text.correct}
                </Alert>
                <AppButton onClick={handleNext} disabled={savingProgress} endIcon={<AutoAwesome />}>
                  {round === questionOrder.length - 1 ? text.finishLevel : text.next}
                </AppButton>
              </>
            )}
            {feedback === "incorrect" && (
              <Alert className="riddles-feedback" severity="warning" role="status">
                {text.tryAgain}
              </Alert>
            )}
          </>
        ) : (
          <div className="riddles-finish">
            <span className="riddles-finish-emoji" aria-hidden="true">🎉</span>
            <Typography component="h2">
              {allLevelsComplete ? text.allLevelsComplete : text.finished}
            </Typography>
            <Typography className="riddles-final-score">
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
