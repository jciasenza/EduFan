import React, { useEffect, useState } from "react";
import {
  Alert,
  Card,
  LinearProgress,
  Typography,
} from "@mui/material";
import { AutoAwesome, Translate } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { loadGameLevels, saveGameLevel } from "../gameLevelUtils";
import Loading from "../../components/ui/Loading";
import "./VocabularyGame.css";

const vocabulary = [
  { es: "manzana", en: "apple", emoji: "🍎" },
  { es: "perro", en: "dog", emoji: "🐶" },
  { es: "libro", en: "book", emoji: "📚" },
  { es: "agua", en: "water", emoji: "💧" },
  { es: "casa", en: "house", emoji: "🏠" },
  { es: "gato", en: "cat", emoji: "🐱" },
  { es: "sol", en: "sun", emoji: "☀️" },
  { es: "flor", en: "flower", emoji: "🌷" },
  { es: "amigo", en: "friend", emoji: "🧒" },
  { es: "escuela", en: "school", emoji: "🏫" },
  { es: "leche", en: "milk", emoji: "🥛" },
  { es: "pájaro", en: "bird", emoji: "🐦" },
];

const localLevels = {
  1: vocabulary.slice(0, 8),
  2: vocabulary,
};

function isValidVocabulary(items) {
  return Array.isArray(items)
    && items.length >= 4
    && items.every((item) => (
      item
      && typeof item.es === "string"
      && item.es.trim().length > 0
      && typeof item.en === "string"
      && item.en.trim().length > 0
      && typeof item.emoji === "string"
      && item.emoji.trim().length > 0
    ))
    && new Set(items.map((item) => item.es.toLocaleLowerCase())).size === items.length
    && new Set(items.map((item) => item.en.toLocaleLowerCase())).size === items.length;
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createQuestions(entries, targetLanguage) {
  const answerKey = targetLanguage === "en" ? "en" : "es";
  const promptKey = targetLanguage === "en" ? "es" : "en";

  return shuffle(entries).map((entry) => {
    const distractors = shuffle(
      entries.filter((candidate) => candidate[answerKey] !== entry[answerKey]),
    ).slice(0, 3);

    return {
      ...entry,
      promptWord: entry[promptKey],
      correctAnswer: entry[answerKey],
      options: shuffle([entry, ...distractors]).map((option) => option[answerKey]),
    };
  });
}

export default function VocabularyGame({ targetLanguage }) {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const toolbarText = translations.gameToolbar || {};
  const navigate = useNavigate();
  const isEnglish = targetLanguage === "en";
  const gameId = isEnglish ? "english" : "spanish";
  const activeLanguage = language === "es" ? "es" : "en";
  const gameText = translations.languageGames || {};
  const text = gameText.shared || {};
  const t = gameText[isEnglish ? "english" : "spanish"] || {};
  const [words, setWords] = useState(localLevels[1]);
  const [availableLevels, setAvailableLevels] = useState({});
  const [questions, setQuestions] = useState(() => createQuestions(localLevels[1], targetLanguage));
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
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
          gameId,
          language: activeLanguage,
          user,
          localLevels,
          validateContent: isValidVocabulary,
        });
        if (!active) return;

        const selectedWords = result.levels[result.level];
        const newQuestions = createQuestions(selectedWords, targetLanguage);
        setWords(selectedWords);
        setAvailableLevels(result.levels);
        setQuestions(newQuestions);
        setLevel(result.level);
        setRound(result.allLevelsComplete ? newQuestions.length : 0);
        setScore(0);
        setSelectedAnswer("");
        setFeedback("");
        setUsingLocalContent(result.usingLocalContent);
        setAllLevelsComplete(result.allLevelsComplete);
      } catch (error) {
        if (!active) return;
        console.error(`Could not load ${gameId} vocabulary or game progress:`, error);
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
    gameId,
    retryCount,
    targetLanguage,
    text.contentLoadError,
    text.progressLoadError,
    user,
  ]);

  const finished = round >= questions.length;
  const currentQuestion = finished ? null : questions[round];
  const progress = (round / questions.length) * 100;
  const promptTemplate = isEnglish
    ? (language === "es" ? text.englishPromptEs : text.englishPromptEn)
    : (language === "es" ? text.spanishPromptEs : text.spanishPromptEn);
  const prompt = currentQuestion
    ? promptTemplate?.replace("{word}", currentQuestion.promptWord)
    : "";

  const handleAnswer = (answer) => {
    if (feedback === "correct") return;
    setSelectedAnswer(answer);
    if (answer === currentQuestion.correctAnswer) {
      setScore((currentScore) => currentScore + 1);
      awardPoint(gameId);
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
        gameId,
        language: activeLanguage,
        user,
        level,
      });
      const nextLevel = completed + 1;
      if (availableLevels[nextLevel]) {
        const nextWords = availableLevels[nextLevel];
        const nextQuestions = createQuestions(nextWords, targetLanguage);
        setWords(nextWords);
        setQuestions(nextQuestions);
        setLevel(nextLevel);
        setRound(0);
        setScore(0);
        setSelectedAnswer("");
        setFeedback("");
        setAllLevelsComplete(false);
        setLevelNotice(`${text.levelComplete} ${text.level} ${nextLevel}`);
      } else {
        setRound(questions.length);
        setAllLevelsComplete(true);
      }
    } catch (error) {
      console.error(`Could not save completed ${gameId} level:`, error);
      setProgressError(text.progressSaveError);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleNext = () => {
    if (round === questions.length - 1) {
      completeLevel();
      return;
    }
    setRound((currentRound) => currentRound + 1);
    setSelectedAnswer("");
    setFeedback("");
  };

  const handleRestart = () => {
    setQuestions(createQuestions(words, targetLanguage));
    setRound(0);
    setScore(0);
    setSelectedAnswer("");
    setFeedback("");
    setAllLevelsComplete(false);
    setLevelNotice("");
    setProgressError("");
  };

  return (
    <main className="vocabulary-game">
      <Card className="vocabulary-card" component="section">
        <GameToolbar
          level={level}
          points={score}
          levelLabel={toolbarText.level || text.level}
          pointsLabel={toolbarText.points}
          exitLabel={toolbarText.exit}
          onExit={() => navigate("/?category=english")}
        />
        <div className="vocabulary-badge" aria-hidden="true"><Translate /></div>
        <Typography component="h1" variant="h3" className="vocabulary-title">
          {t.title}
        </Typography>
        <Typography className="vocabulary-description">{t.description}</Typography>

        {contentLoading ? (
          <div className="vocabulary-loading" role="status">
            <Loading aria-label={text.contentLoading} />
            <Typography>{text.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="vocabulary-content-error">
            <Alert severity="error" role="alert">{contentError}</Alert>
            <AppButton onClick={() => setRetryCount((count) => count + 1)}>
              {text.retry}
            </AppButton>
          </div>
        ) : (
          <>
            {usingLocalContent && (
              <Alert className="vocabulary-feedback" severity="info" role="status">
                {text.localContentNotice}
              </Alert>
            )}
            {levelNotice && (
              <Alert className="vocabulary-feedback" severity="success" role="status">
                {levelNotice}
              </Alert>
            )}
            {allLevelsComplete && (
              <Alert className="vocabulary-feedback" severity="success" role="status">
                {text.allLevelsComplete}
              </Alert>
            )}
            {progressError && (
              <Alert className="vocabulary-feedback" severity="error" role="alert">
                {progressError}
              </Alert>
            )}

            {!finished ? (
              <>
                <div className="vocabulary-status">
                  <Typography>{text.round} {round + 1} {text.of} {questions.length}</Typography>
                </div>
                <LinearProgress
                  className="vocabulary-progress"
                  variant="determinate"
                  value={progress}
                  aria-label={text.progress}
                />
                <div className="vocabulary-prompt">
                  <span className="vocabulary-emoji" aria-hidden="true">{currentQuestion.emoji}</span>
                  <Typography className="vocabulary-question" aria-live="polite">
                    {prompt}
                  </Typography>
                </div>
                <Typography className="vocabulary-instruction">{text.chooseAnswer}</Typography>
                <div className="vocabulary-options">
                  {currentQuestion.options.map((answer) => {
                    const isSelected = selectedAnswer === answer;
                    const optionClass = [
                      "vocabulary-option",
                      isSelected && feedback === "correct" ? "is-correct" : "",
                      isSelected && feedback === "incorrect" ? "is-incorrect" : "",
                    ].filter(Boolean).join(" ");

                    return (
                      <button
                        className={optionClass}
                        key={answer}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={feedback === "correct" || savingProgress}
                        onClick={() => handleAnswer(answer)}
                      >
                        {answer}
                      </button>
                    );
                  })}
                </div>
                {feedback === "correct" && (
                  <>
                    <Alert className="vocabulary-feedback" severity="success" role="status">
                      {text.correct}
                    </Alert>
                    <AppButton
                      disabled={savingProgress}
                      onClick={handleNext}
                      endIcon={<AutoAwesome />}
                    >
                      {savingProgress
                        ? text.savingProgress
                        : (round === questions.length - 1 ? text.finishLevel : text.next)}
                    </AppButton>
                  </>
                )}
                {feedback === "incorrect" && (
                  <Alert className="vocabulary-feedback" severity="warning" role="status">
                    {text.tryAgain}
                  </Alert>
                )}
              </>
            ) : (
              <div className="vocabulary-finish">
                <span className="vocabulary-finish-emoji" aria-hidden="true">🎉</span>
                <Typography component="h2">{text.finished}</Typography>
                <Typography className="vocabulary-final-score">
                  {text.finalScore}: {score} / {questions.length}
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
                  <AppButton onClick={handleRestart} endIcon={<AutoAwesome />}>
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
