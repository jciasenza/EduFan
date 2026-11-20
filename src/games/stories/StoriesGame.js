import React, { useEffect, useState } from "react";
import { Alert, Card, LinearProgress, Typography } from "@mui/material";
import { AutoAwesome, MenuBook } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import supabase from "../../lib/supabaseClient";
import "./StoriesGame.css";
import Loading from "../../components/ui/Loading";

const stories = {
  es: [
    {
      title: "La semilla viajera",
      story: "Una semillita cayó de un girasol y el viento la llevó hasta un jardín. La lluvia la despertó y, con los días, creció una flor amarilla que saludaba al Sol.",
      question: "¿Qué ayudó a despertar a la semilla?",
      correct: "La lluvia",
      options: ["La lluvia", "Una mariposa", "La nieve"],
      emoji: "🌻",
    },
    {
      title: "La estrella del lago",
      story: "Lila, una pequeña luciérnaga, vio una luz en el lago y pensó que era una estrella perdida. Voló hasta la orilla y descubrió que la Luna se reflejaba en el agua.",
      question: "¿Qué era la luz que Lila vio en el lago?",
      correct: "El reflejo de la Luna",
      options: ["El reflejo de la Luna", "Una estrella caída", "Una linterna"],
      emoji: "🌙",
    },
    {
      title: "El paraguas rojo",
      story: "Tomás encontró un paraguas rojo en la entrada de la escuela. Aunque llovía, esperó bajo el techo hasta que Nina volvió a buscarlo. Ella sonrió y compartieron el camino a casa.",
      question: "¿Qué hizo Tomás cuando encontró el paraguas?",
      correct: "Esperó a que Nina volviera",
      options: ["Se lo llevó a casa", "Esperó a que Nina volviera", "Lo dejó bajo la lluvia"],
      emoji: "☔",
    },
    {
      title: "La carrera de caracoles",
      story: "Cuatro caracoles organizaron una carrera hasta la hoja de lechuga. Tito avanzó despacito, pero no se detuvo. Cuando llegó, sus amigos lo aplaudieron por no rendirse.",
      question: "¿Por qué aplaudieron los amigos a Tito?",
      correct: "Porque no se rindió",
      options: ["Porque llegó primero", "Porque tenía una bicicleta", "Porque no se rindió"],
      emoji: "🐌",
    },
    {
      title: "El mapa de Bruno",
      story: "Bruno dibujó un mapa para encontrar el manzano del parque. Siguió las flechas, cruzó el puente pequeño y encontró fruta para compartir con sus amigos.",
      question: "¿Qué encontró Bruno al seguir el mapa?",
      correct: "Un manzano",
      options: ["Un manzano", "Un barco", "Una casa nueva"],
      emoji: "🍎",
    },
  ],
  en: [
    {
      title: "The Traveling Seed",
      story: "A tiny seed fell from a sunflower and the wind carried it to a garden. The rain woke it up. Days later, a yellow flower grew and waved at the Sun.",
      question: "What helped wake the seed?",
      correct: "The rain",
      options: ["The rain", "A butterfly", "The snow"],
      emoji: "🌻",
    },
    {
      title: "The Lake Star",
      story: "Lily the firefly saw a light on the lake and thought it was a lost star. She flew closer and discovered the Moon shining in the water.",
      question: "What was the light on the lake?",
      correct: "The Moon's reflection",
      options: ["The Moon's reflection", "A fallen star", "A flashlight"],
      emoji: "🌙",
    },
    {
      title: "The Red Umbrella",
      story: "Tom found a red umbrella at the school entrance. It was raining, but he waited under the roof until Nina came back for it. She smiled, and they walked home together.",
      question: "What did Tom do when he found the umbrella?",
      correct: "He waited for Nina",
      options: ["He took it home", "He waited for Nina", "He left it in the rain"],
      emoji: "☔",
    },
    {
      title: "The Snail Race",
      story: "Four snails had a race to a lettuce leaf. Tim moved slowly but never stopped. When he arrived, his friends cheered because he kept trying.",
      question: "Why did Tim's friends cheer?",
      correct: "He did not give up",
      options: ["He came first", "He had a bicycle", "He did not give up"],
      emoji: "🐌",
    },
    {
      title: "Bruno's Map",
      story: "Bruno drew a map to find the apple tree in the park. He followed the arrows, crossed a little bridge, and found fruit to share with his friends.",
      question: "What did Bruno find by following the map?",
      correct: "An apple tree",
      options: ["An apple tree", "A boat", "A new house"],
      emoji: "🍎",
    },
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

function isValidStorySet(items) {
  return Array.isArray(items) && items.length > 0 && items.every((item) => (
    item
    && typeof item.title === "string"
    && item.title.trim().length > 0
    && typeof item.story === "string"
    && item.story.trim().length > 0
    && typeof item.question === "string"
    && item.question.trim().length > 0
    && typeof item.correct === "string"
    && Array.isArray(item.options)
    && item.options.length >= 2
    && item.options.every((option) => typeof option === "string" && option.trim().length > 0)
    && item.options.includes(item.correct)
  ));
}

function getLocalCompletedLevel() {
  const storedProgress = localStorage.getItem("game-progress:stories:1");
  if (storedProgress === null) return 0;
  const completedLevel = Number(storedProgress);
  if (!Number.isSafeInteger(completedLevel) || completedLevel < 0) {
    throw new Error("Stored stories progress is invalid.");
  }
  return completedLevel;
}

export default function StoriesGame() {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const gameText = translations.storiesGame || {};
  const text = gameText.shared || {};
  const navigate = useNavigate();
  const activeLanguage = language === "es" ? "es" : "en";
  const [storySet, setStorySet] = useState([]);
  const [storyOrder, setStoryOrder] = useState([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [usingLocalContent, setUsingLocalContent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [level, setLevel] = useState(1);
  const [allLevelsComplete, setAllLevelsComplete] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    let active = true;
    if (authLoading) return () => { active = false; };

    const loadStories = async () => {
      setContentError("");
      setProgressError("");
      setContentLoading(true);
      setAllLevelsComplete(false);
      let loadingProgress = false;

      try {
        let levelData;
        let completed = 0;
        let isLocal = false;
        let levelAlreadyComplete = false;
        if (!supabase) {
          levelData = stories[activeLanguage];
          isLocal = true;
          loadingProgress = true;
          completed = getLocalCompletedLevel();
          loadingProgress = false;
          levelAlreadyComplete = completed > 0;
        } else {
          const { data, error } = await supabase
            .from("game_content")
            .select("content, level")
            .eq("game_id", "stories")
            .eq("language", activeLanguage)
            .eq("volume", 1)
            .eq("is_published", true)
            .order("level");
          if (error) throw error;
          if (!data?.length) throw new Error(`No published stories found (${activeLanguage}).`);

          const levels = {};
          data.forEach((row) => {
            if (!isValidStorySet(row.content)) {
              throw new Error(`Published story level ${row.level} (${activeLanguage}) has an invalid format.`);
            }
            levels[row.level] = row.content;
          });
          loadingProgress = true;
          if (user) {
            const { data: savedProgress, error: progressQueryError } = await supabase
              .from("user_game_progress")
              .select("highest_completed_level")
              .eq("game_id", "stories")
              .eq("volume", 1)
              .maybeSingle();
            if (progressQueryError) throw progressQueryError;
            completed = savedProgress?.highest_completed_level || 0;
          } else {
            completed = getLocalCompletedLevel();
          }
          loadingProgress = false;
          const nextLevel = completed + 1;
          const levelToLoad = levels[nextLevel] ? nextLevel : Math.max(1, completed);
          levelData = levels[levelToLoad];
          if (!levelData) throw new Error(`No published stories available for level ${levelToLoad}.`);
          levelAlreadyComplete = !levels[nextLevel] && completed > 0;
          if (!active) return;
          setLevel(levelToLoad);
          setAllLevelsComplete(levelAlreadyComplete);
        }

        if (!isValidStorySet(levelData)) {
          throw new Error(`Story content has an invalid format (${activeLanguage}).`);
        }
        if (!active) return;
        setStorySet(levelData);
        setStoryOrder(shuffle(levelData.map((_, index) => index)));
        setRound(levelAlreadyComplete ? levelData.length : 0);
        setScore(0);
        setSelectedAnswer("");
        setFeedback("");
        setUsingLocalContent(isLocal);
        if (isLocal) {
          setLevel(Math.max(1, completed));
          setAllLevelsComplete(levelAlreadyComplete);
        }
        setContentLoading(false);
      } catch (error) {
        if (!active) return;
        console.error("Could not load stories or game progress:", error);
        setStorySet([]);
        setStoryOrder([]);
        setContentError(loadingProgress ? text.progressLoadError : text.contentLoadError);
        setContentLoading(false);
      }
    };

    loadStories();
    return () => { active = false; };
  }, [
    activeLanguage,
    authLoading,
    retryCount,
    text.contentLoadError,
    text.progressLoadError,
    user,
  ]);

  const finished = round >= storyOrder.length;
  const currentStory = finished ? null : storySet[storyOrder[round]];
  const progress = (round / storyOrder.length) * 100;
  const answers = currentStory ? currentStory.options : [];

  const handleAnswer = (answer) => {
    if (feedback === "correct") return;
    setSelectedAnswer(answer);
    if (answer === currentStory.correct) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("stories");
      setFeedback("correct");
      return;
    }
    setFeedback("incorrect");
  };

  const completeLevel = async () => {
    setSavingProgress(true);
    setProgressError("");
    try {
      if (supabase && user) {
        const { data, error } = await supabase.rpc("complete_game_level", {
          p_game_id: "stories",
          p_volume: 1,
          p_language: activeLanguage,
          p_level: level,
        });
        if (error) throw error;
        const completed = Number(data);
        if (!Number.isSafeInteger(completed) || completed < level) {
          throw new Error("The stories progress response is invalid.");
        }
      } else {
        localStorage.setItem("game-progress:stories:1", String(level));
      }
      setRound(storyOrder.length);
      setAllLevelsComplete(true);
    } catch (error) {
      console.error("Could not save completed stories level:", error);
      setRound(storyOrder.length);
      setProgressError(text.progressSaveError);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleNext = async () => {
    if (round === storyOrder.length - 1) {
      await completeLevel();
      return;
    }
    setRound((currentRound) => currentRound + 1);
    setSelectedAnswer("");
    setFeedback("");
  };

  const handleRestart = () => {
    setStoryOrder(shuffle(storySet.map((_, index) => index)));
    setRound(0);
    setScore(0);
    setSelectedAnswer("");
    setFeedback("");
    setAllLevelsComplete(false);
  };

  return (
    <main className="stories-game">
      <Card className="stories-card" component="section">
        <GameToolbar
          level={level}
          points={score}
          levelLabel={text.level}
          pointsLabel={text.score}
          exitLabel={text.exit}
          onExit={() => navigate("/?category=stories")}
        />
        <div className="stories-badge" aria-hidden="true"><MenuBook /></div>
        <Typography component="h1" variant="h3" className="stories-title">
          {gameText.title}
        </Typography>
        <Typography className="stories-description">{gameText.description}</Typography>

        {contentLoading ? (
          <div className="stories-loading" role="status">
            <Loading aria-label={text.contentLoading} />
            <Typography>{text.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="stories-content-error">
            <Alert severity="error" role="alert">{contentError}</Alert>
            <AppButton onClick={() => setRetryCount((count) => count + 1)}>
              {text.retry}
            </AppButton>
          </div>
        ) : (
          <>
        {usingLocalContent && (
          <Alert className="stories-feedback" severity="info" role="status">
            {text.localContentNotice}
          </Alert>
        )}
        {!finished ? (
          <>
            <div className="stories-status">
              <Typography>{text.story} {round + 1} {text.of} {storyOrder.length}</Typography>
            </div>
            <LinearProgress
              className="stories-progress"
              variant="determinate"
              value={progress}
              aria-label={text.progress}
            />
            <article className="story-page" aria-live="polite">
              <div className="story-illustration" aria-hidden="true">{currentStory.emoji}</div>
              <Typography component="h2" className="story-heading">
                {currentStory.title}
              </Typography>
              <Typography className="story-text">{currentStory.story}</Typography>
            </article>
            <Typography className="stories-question">{currentStory.question}</Typography>
            <div className="stories-answers">
              {answers.map((answer) => {
                const isSelected = selectedAnswer === answer;
                const answerClass = [
                  "story-answer",
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
                    onClick={() => handleAnswer(answer)}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>
            {feedback === "correct" && (
              <>
                <Alert className="stories-feedback" severity="success" role="status">
                  {text.correct}
                </Alert>
                <AppButton onClick={handleNext} disabled={savingProgress} endIcon={<AutoAwesome />}>
                  {round === storyOrder.length - 1 ? text.finishLevel : text.next}
                </AppButton>
              </>
            )}
            {feedback === "incorrect" && (
              <Alert className="stories-feedback" severity="warning" role="status">
                {text.tryAgain}
              </Alert>
            )}
          </>
        ) : (
          <div className="stories-finish">
            <span className="stories-finish-emoji" aria-hidden="true">🎉</span>
            <Typography component="h2">
              {allLevelsComplete ? text.allLevelsComplete : text.finished}
            </Typography>
            <Typography className="stories-final-score">
              {text.finalScore}: {score} / {storyOrder.length}
            </Typography>
            {progressError && <Alert severity="error" role="alert">{progressError}</Alert>}
            {savingProgress && <Loading aria-label={text.savingProgress} />}
            <AppButton
              onClick={progressError ? completeLevel : handleRestart}
              disabled={savingProgress}
              endIcon={<AutoAwesome />}
            >
              {progressError ? text.retry : (allLevelsComplete ? text.playAgain : text.continue)}
            </AppButton>
          </div>
        )}
          </>
        )}
      </Card>
    </main>
  );
}
