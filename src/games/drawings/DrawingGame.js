import React, { useEffect, useState } from "react";
import {
  Alert,
  Card,
  Typography,
} from "@mui/material";
import { AutoAwesome, CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { loadGameLevels, saveGameLevel } from "../gameLevelUtils";
import Loading from "../../components/ui/Loading";
import "./DrawingGame.css";

const availableShapes = ["circle", "square", "triangle", "star"];
const colorValues = {
  red: "#ef5350",
  blue: "#4285f4",
  yellow: "#fbc02d",
  green: "#43a047",
  purple: "#8e5ad7",
  orange: "#f28c28",
};
const localShapeLevels = {
  1: [{ shapes: ["circle", "square"], colors: ["red", "blue", "yellow", "green"], rounds: 8 }],
  2: [{ shapes: ["circle", "square", "triangle"], colors: ["red", "blue", "yellow", "green"], rounds: 10 }],
  3: [{ shapes: availableShapes, colors: Object.keys(colorValues), rounds: 12 }],
};

function isValidShapeConfig(items) {
  if (!Array.isArray(items) || items.length !== 1) return false;
  const [config] = items;
  return Array.isArray(config?.shapes)
    && config.shapes.length >= 2
    && config.shapes.every((shape) => availableShapes.includes(shape))
    && new Set(config.shapes).size === config.shapes.length
    && Array.isArray(config?.colors)
    && config.colors.length >= 2
    && config.colors.every((color) => Object.prototype.hasOwnProperty.call(colorValues, color))
    && new Set(config.colors).size === config.colors.length
    && Number.isSafeInteger(config?.rounds)
    && config.rounds > 0
    && config.rounds <= config.shapes.length * config.colors.length;
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createRounds(config) {
  const combinations = config.shapes.flatMap((shape) => config.colors.map((color) => ({
    shape,
    color,
    colorValue: colorValues[color],
    id: `${shape}-${color}`,
  })));

  return shuffle(combinations).slice(0, config.rounds).map((answer) => ({
    answer,
    choices: shuffle([
      answer,
      ...shuffle(combinations.filter(({ id }) => id !== answer.id)).slice(0, 3),
    ]),
  }));
}

function Shape({ type, color }) {
  const common = { fill: color, className: "shape-color-icon", "aria-hidden": true };
  if (type === "circle") return <svg viewBox="0 0 100 100" {...common}><circle cx="50" cy="50" r="39" /></svg>;
  if (type === "square") return <svg viewBox="0 0 100 100" {...common}><rect x="12" y="12" width="76" height="76" rx="12" /></svg>;
  if (type === "triangle") return <svg viewBox="0 0 100 100" {...common}><path d="M50 10 94 88H6z" /></svg>;
  return <svg viewBox="0 0 100 100" {...common}><path d="m50 5 13 29 32 3-24 22 7 32-28-17-28 17 7-32L5 37l32-3z" /></svg>;
}

export default function DrawingGame() {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const toolbarText = translations.gameToolbar || {};
  const navigate = useNavigate();
  const t = translations.shapeColorGame || {};
  const activeLanguage = language === "es" ? "es" : "en";
  const [config, setConfig] = useState(localShapeLevels[1][0]);
  const [availableLevels, setAvailableLevels] = useState({});
  const [level, setLevel] = useState(1);
  const [rounds, setRounds] = useState(() => createRounds(localShapeLevels[1][0]));
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [usingLocalContent, setUsingLocalContent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [allLevelsComplete, setAllLevelsComplete] = useState(false);
  const [levelNotice, setLevelNotice] = useState("");
  const [progressError, setProgressError] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);
  const finished = roundIndex >= rounds.length;
  const round = rounds[roundIndex];
  const answer = round?.answer;
  const getChoiceLabel = ({ shape, color }) => {
    const shapeName = t.shapes?.[shape] || shape;
    const colorName = t.colors?.[color] || color;
    return t.choiceLabel
      ? t.choiceLabel
        .replace("{shape}", shapeName)
        .replace("{color}", colorName)
      : `${shapeName} ${colorName}`;
  };

  useEffect(() => {
    let active = true;
    if (authLoading) return () => { active = false; };

    const load = async () => {
      setContentError("");
      setContentLoading(true);
      setProgressError("");

      try {
        const result = await loadGameLevels({
          gameId: "shapes-colors",
          language: activeLanguage,
          user,
          localLevels: localShapeLevels,
          validateContent: isValidShapeConfig,
        });
        if (!active) return;

        const selectedConfig = result.levels[result.level][0];
        const newRounds = createRounds(selectedConfig);
        setConfig(selectedConfig);
        setAvailableLevels(result.levels);
        setLevel(result.level);
        setRounds(newRounds);
        setRoundIndex(result.allLevelsComplete ? newRounds.length : 0);
        setScore(0);
        setSelected(null);
        setUsingLocalContent(result.usingLocalContent);
        setAllLevelsComplete(result.allLevelsComplete);
      } catch (error) {
        if (!active) return;
        console.error("Could not load shapes-and-colors configuration or progress:", error);
        setContentError(error.stage === "progress"
          ? t.progressLoadError
          : t.contentLoadError);
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
    t.contentLoadError,
    t.progressLoadError,
    user,
  ]);

  const choose = (choice) => {
    if (selected || !answer) return;
    setSelected(choice.id);
    if (choice.id === answer.id) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("shapes-colors");
    }
  };

  const completeLevel = async () => {
    setSavingProgress(true);
    setProgressError("");
    try {
      const completed = await saveGameLevel({
        gameId: "shapes-colors",
        language: activeLanguage,
        user,
        level,
      });
      const nextLevel = completed + 1;
      if (availableLevels[nextLevel]) {
        const nextConfig = availableLevels[nextLevel][0];
        const nextRounds = createRounds(nextConfig);
        setConfig(nextConfig);
        setLevel(nextLevel);
        setRounds(nextRounds);
        setRoundIndex(0);
        setScore(0);
        setSelected(null);
        setAllLevelsComplete(false);
        setLevelNotice(`${t.levelComplete} ${t.level} ${nextLevel}`);
      } else {
        setAllLevelsComplete(true);
      }
    } catch (error) {
      console.error("Could not save completed shapes-and-colors level:", error);
      setProgressError(t.progressSaveError);
    } finally {
      setSavingProgress(false);
    }
  };

  const nextRound = () => {
    setRoundIndex((index) => index + 1);
    setSelected(null);
  };

  const restart = () => {
    setRounds(createRounds(config));
    setRoundIndex(0);
    setScore(0);
    setSelected(null);
    setAllLevelsComplete(false);
    setLevelNotice("");
    setProgressError("");
  };

  return (
    <main className="shape-color-game">
      <Card className="shape-color-card" component="section">
        <GameToolbar
          level={level}
          points={score}
          levelLabel={toolbarText.level || t.level}
          pointsLabel={toolbarText.points}
          exitLabel={toolbarText.exit}
          onExit={() => navigate("/?category=shapes-colors")}
        />
        <div className="shape-color-badge" aria-hidden="true">🔷</div>
        <Typography component="h1" variant="h3" className="shape-color-title">
          {t.title}
        </Typography>
        {contentLoading ? (
          <div className="shape-color-loading" role="status">
            <Loading aria-label={t.contentLoading} />
            <Typography>{t.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="shape-color-content-error">
            <Alert severity="error" role="alert">{contentError}</Alert>
            <AppButton onClick={() => setRetryCount((count) => count + 1)}>
              {t.retry}
            </AppButton>
          </div>
        ) : (
          <>
            {usingLocalContent && (
              <Alert className="shape-color-feedback" severity="info" role="status">
                {t.localContentNotice}
              </Alert>
            )}
            {levelNotice && (
              <Alert className="shape-color-feedback" severity="success" role="status">
                {levelNotice}
              </Alert>
            )}
            {allLevelsComplete && (
              <Alert className="shape-color-feedback" severity="success" role="status">
                {t.allLevelsComplete}
              </Alert>
            )}
            {progressError && (
              <Alert className="shape-color-feedback" severity="error" role="alert">
                {progressError}
              </Alert>
            )}

            {!finished ? (
              <>
                <div className="shape-color-score">
                  <span>{t.round}: {roundIndex + 1} / {rounds.length}</span>
                </div>
                <Typography className="shape-color-question">{t.question}</Typography>
                <div
                  className="shape-color-target"
                  role="img"
                  aria-label={`${t.targetLabel}: ${getChoiceLabel(answer)}`}
                >
                  <Shape type={answer.shape} color={answer.colorValue} />
                </div>
                <div className="shape-color-options" role="group" aria-label={t.optionsLabel}>
                  {round.choices.map((choice) => {
                    const isSelected = selected === choice.id;
                    const isCorrect = choice.id === answer.id;
                    const resultClass = selected
                      ? (isCorrect ? " is-correct" : isSelected ? " is-incorrect" : "")
                      : "";
                    return (
                      <button
                        className={`shape-color-option${resultClass}`}
                        key={choice.id}
                        type="button"
                        disabled={Boolean(selected)}
                        onClick={() => choose(choice)}
                      >
                        <Shape type={choice.shape} color={choice.colorValue} />
                        <span>{getChoiceLabel(choice)}</span>
                      </button>
                    );
                  })}
                </div>
                {selected && (
                  <>
                    <Alert severity={selected === answer.id ? "success" : "info"} className="shape-color-feedback" role="status">
                      {selected === answer.id
                        ? t.correct
                        : `${t.answer}: ${getChoiceLabel(answer)}`}
                    </Alert>
                    <AppButton
                      onClick={nextRound}
                      endIcon={<CheckCircle />}
                    >
                      {roundIndex === rounds.length - 1 ? t.finish : t.next}
                    </AppButton>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="shape-color-finished-icon" aria-hidden="true">🌟</div>
                <Typography className="shape-color-final-score">
                  {t.finished} {score} / {rounds.length}
                </Typography>
                {!allLevelsComplete ? (
                  <AppButton
                    disabled={savingProgress}
                    onClick={completeLevel}
                    endIcon={<CheckCircle />}
                  >
                    {savingProgress ? t.savingProgress : t.finishLevel}
                  </AppButton>
                ) : (
                  <AppButton onClick={restart} endIcon={<AutoAwesome />}>
                    {t.playAgain}
                  </AppButton>
                )}
              </>
            )}
          </>
        )}
      </Card>
    </main>
  );
}
