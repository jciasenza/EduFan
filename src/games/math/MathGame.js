import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { loadGameLevels, saveGameLevel } from "../gameLevelUtils";
import MathQuiz from "./MathQuiz";
import { makeOptions, MATH_ROUNDS } from "./mathUtils";

const localConfig = [{ minNumber: 1, maxNumber: 10, rounds: MATH_ROUNDS }];

function isValidConfig(items) {
  return Array.isArray(items)
    && items.length === 1
    && Number.isSafeInteger(items[0]?.minNumber)
    && items[0].minNumber >= 0
    && Number.isSafeInteger(items[0]?.maxNumber)
    && items[0].maxNumber - items[0].minNumber >= 3
    && Number.isSafeInteger(items[0]?.rounds)
    && items[0].rounds > 0
    && items[0].rounds <= 100;
}

function createQuestion(config) {
  const isAddition = Math.random() < 0.5;
  const range = config.maxNumber - config.minNumber + 1;
  const first = Math.floor(Math.random() * range) + config.minNumber;
  const second = Math.floor(Math.random() * range) + config.minNumber;
  const left = isAddition ? first : Math.max(first, second);
  const right = isAddition ? second : Math.min(first, second);
  const answer = isAddition ? left + right : left - right;

  return {
    left,
    right,
    operator: isAddition ? "+" : "−",
    answer,
    options: makeOptions(answer, 0, config.maxNumber * 2),
  };
}

export default function MathGame() {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const gameText = translations.mathGames || {};
  const text = gameText.shared || {};
  const t = gameText.addition || {};
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
          gameId: "math-addition",
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
        console.error("Could not load math configuration or progress:", error);
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
      awardPoint("math-addition");
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
        gameId: "math-addition",
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
      console.error("Could not save completed math level:", error);
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
        <div className="math-operation">
          <span className="math-operation-part">{question.left}</span>
          <span className="math-operation-part math-operation-symbol math-operation-operator">
            {question.operator}
          </span>
          <span className="math-operation-part">{question.right}</span>
          <span className="math-operation-part math-operation-symbol math-operation-equals">=</span>
          <span className="math-operation-part math-operation-symbol math-operation-question">?</span>
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
