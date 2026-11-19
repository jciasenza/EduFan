import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { loadGameLevels, saveGameLevel } from "../gameLevelUtils";
import MathQuiz from "./MathQuiz";
import { makeOptions, MATH_ROUNDS } from "./mathUtils";

const localConfig = [{
  startMin: 1,
  startMax: 10,
  stepMin: 2,
  stepMax: 5,
  sequenceLength: 5,
  rounds: MATH_ROUNDS,
}];

function isValidConfig(items) {
  if (!Array.isArray(items) || items.length !== 1) return false;
  const [config] = items;
  return Number.isSafeInteger(config?.startMin)
    && config.startMin >= 0
    && Number.isSafeInteger(config?.startMax)
    && config.startMax >= config.startMin
    && Number.isSafeInteger(config?.stepMin)
    && config.stepMin > 0
    && Number.isSafeInteger(config?.stepMax)
    && config.stepMax >= config.stepMin
    && Number.isSafeInteger(config?.sequenceLength)
    && config.sequenceLength >= 3
    && config.sequenceLength <= 10
    && Number.isSafeInteger(config?.rounds)
    && config.rounds > 0
    && config.rounds <= 100;
}

function createQuestion(config) {
  const start = Math.floor(Math.random() * (config.startMax - config.startMin + 1)) + config.startMin;
  const step = Math.floor(Math.random() * (config.stepMax - config.stepMin + 1)) + config.stepMin;
  const missingIndex = Math.floor(Math.random() * (config.sequenceLength - 2)) + 1;
  const sequence = Array.from(
    { length: config.sequenceLength },
    (_, index) => start + step * index,
  );
  const answer = sequence[missingIndex];

  return {
    sequence,
    missingIndex,
    answer,
    options: makeOptions(answer, Math.max(0, answer - 8), answer + 8),
  };
}

export default function NumberSeriesGame() {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const gameText = translations.mathGames || {};
  const text = gameText.shared || {};
  const t = gameText.series || {};
  const activeLanguage = language === "es" ? "es" : "en";
  const [config, setConfig] = useState(localConfig[0]);
  const [availableLevels, setAvailableLevels] = useState({});
  const [question, setQuestion] = useState(() => createQuestion(localConfig[0]));
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
          gameId: "number-series",
          language: activeLanguage,
          user,
          localLevels: { 1: localConfig },
          validateContent: isValidConfig,
        });
        if (!active) return;

        const selectedConfig = result.levels[result.level][0];
        setAvailableLevels(result.levels);
        setConfig(selectedConfig);
        setLevel(result.level);
        setQuestion(createQuestion(selectedConfig));
        setRound(result.allLevelsComplete ? selectedConfig.rounds : 0);
        setScore(0);
        setSelectedAnswer(null);
        setFeedback("");
        setUsingLocalContent(result.usingLocalContent);
        setAllLevelsComplete(result.allLevelsComplete);
      } catch (error) {
        if (!active) return;
        console.error("Could not load number-series configuration or progress:", error);
        setContentError(error.stage === "progress"
          ? text.progressLoadError
          : text.contentLoadError);
      } finally {
        if (active) setContentLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [activeLanguage, authLoading, retryCount, text.contentLoadError, text.progressLoadError, user]);

  const handleAnswer = (answer) => {
    if (feedback === "correct") return;
    setSelectedAnswer(answer);
    if (answer === question.answer) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("number-series");
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
  };

  const completeLevel = async () => {
    setSavingProgress(true);
    setProgressError("");
    try {
      const completed = await saveGameLevel({
        gameId: "number-series",
        language: activeLanguage,
        user,
        level,
      });
      const nextLevel = completed + 1;
      if (availableLevels[nextLevel]) {
        const nextConfig = availableLevels[nextLevel][0];
        setConfig(nextConfig);
        setLevel(nextLevel);
        setQuestion(createQuestion(nextConfig));
        setRound(0);
        setScore(0);
        setSelectedAnswer(null);
        setFeedback("");
        setAllLevelsComplete(false);
        setLevelNotice(`${text.levelComplete} ${text.level} ${nextLevel}`);
      } else {
        setRound(config.rounds);
        setAllLevelsComplete(true);
      }
    } catch (error) {
      console.error("Could not save completed number-series level:", error);
      setProgressError(text.progressSaveError);
      setRound(config.rounds);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleNext = async () => {
    if (round === config.rounds - 1) {
      await completeLevel();
      return;
    }
    setRound((currentRound) => currentRound + 1);
    setQuestion(createQuestion(config));
    setSelectedAnswer(null);
    setFeedback("");
  };

  const handleRestart = () => {
    setLevelNotice("");
    setProgressError("");
    setAllLevelsComplete(false);
    setRound(0);
    setScore(0);
    setQuestion(createQuestion(config));
    setSelectedAnswer(null);
    setFeedback("");
  };

  return (
    <MathQuiz
      title={t.title}
      description={t.description}
      question={(
        <div className="math-series-sequence">
          {question.sequence.map((number, index) => (
            <span
              className={`math-series-number${index === question.missingIndex ? " is-missing" : ""}`}
              key={`${index}-${number}`}
            >
              {index === question.missingIndex ? "?" : number}
            </span>
          ))}
        </div>
      )}
      options={question.options}
      selectedAnswer={selectedAnswer}
      level={level}
      score={score}
      round={round}
      totalRounds={config.rounds}
      feedback={feedback}
      text={text}
      exitCategory="math"
      contentLoading={contentLoading}
      contentError={contentError}
      usingLocalContent={usingLocalContent}
      allLevelsComplete={allLevelsComplete}
      levelNotice={levelNotice}
      progressError={progressError}
      savingProgress={savingProgress}
      onRetry={() => setRetryCount((count) => count + 1)}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onRestart={handleRestart}
    />
  );
}
