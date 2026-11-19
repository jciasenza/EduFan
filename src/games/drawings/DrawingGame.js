import React, { useState } from "react";
import { Alert, Card, Typography } from "@mui/material";
import { AutoAwesome, CheckCircle } from "@mui/icons-material";
import AppButton from "../../components/ui/AppButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./DrawingGame.css";

const ROUND_COUNT = 8;
const shapes = ["circle", "square", "triangle", "star"];
const colors = [
  { key: "red", value: "#ef5350" },
  { key: "blue", value: "#4285f4" },
  { key: "yellow", value: "#fbc02d" },
  { key: "green", value: "#43a047" },
  { key: "purple", value: "#8e5ad7" },
  { key: "orange", value: "#f28c28" },
];

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

const combinations = shapes.flatMap((shape) => colors.map((color) => ({
  shape,
  color: color.key,
  colorValue: color.value,
  id: `${shape}-${color.key}`,
})));

function createRounds() {
  return shuffle(combinations).slice(0, ROUND_COUNT).map((answer) => ({
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
  const { awardPoint } = useAuth();
  const { translations } = useLanguage();
  const t = translations.shapeColorGame || {};
  const [rounds, setRounds] = useState(createRounds);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const finished = roundIndex === ROUND_COUNT;
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

  const choose = (choice) => {
    if (selected || !answer) return;
    setSelected(choice.id);
    if (choice.id === answer.id) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("shapes-colors");
    }
  };

  const nextRound = () => {
    setRoundIndex((index) => index + 1);
    setSelected(null);
  };

  const restart = () => {
    setRounds(createRounds());
    setRoundIndex(0);
    setScore(0);
    setSelected(null);
  };

  return (
    <main className="shape-color-game">
      <Card className="shape-color-card" component="section">
        <div className="shape-color-badge" aria-hidden="true">🔷</div>
        <Typography component="h1" variant="h3" className="shape-color-title">
          {t.title}
        </Typography>
        <Typography className="shape-color-description">{t.description}</Typography>

        {!finished && (
          <>
            <div className="shape-color-score">
              <span>{t.round}: {roundIndex + 1} / {ROUND_COUNT}</span>
              <span>{t.score}: {score}</span>
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
                  {roundIndex === ROUND_COUNT - 1 ? t.finish : t.next}
                </AppButton>
              </>
            )}
          </>
        )}

        {finished && (
          <>
            <div className="shape-color-finished-icon" aria-hidden="true">🌟</div>
            <Typography className="shape-color-final-score">
              {t.finished} {score} / {ROUND_COUNT}
            </Typography>
            <AppButton onClick={restart} endIcon={<AutoAwesome />}>
              {t.playAgain}
            </AppButton>
          </>
        )}
      </Card>
    </main>
  );
}
