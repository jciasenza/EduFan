import React from "react";
import { Alert, Card, LinearProgress, Typography } from "@mui/material";
import { AutoAwesome, EmojiEvents } from "@mui/icons-material";
import AppButton from "../../components/ui/AppButton";
import "./MathGames.css";

export default function MathQuiz({
  title,
  description,
  question,
  options,
  selectedAnswer,
  score,
  round,
  totalRounds,
  feedback,
  text,
  onAnswer,
  onNext,
  onRestart,
}) {
  const finished = round >= totalRounds;
  const progress = (round / totalRounds) * 100;

  return (
    <main className="math-game">
      <Card className="math-game-card" component="section">
        <div className="math-game-badge" aria-hidden="true">
          <AutoAwesome />
        </div>
        <Typography component="h1" variant="h3" className="math-game-title">
          {title}
        </Typography>
        <Typography className="math-game-description">{description}</Typography>

        {!finished ? (
          <>
            <div className="math-game-status">
              <Typography>{text.round} {round + 1} {text.of} {totalRounds}</Typography>
              <Typography className="math-game-score">
                <EmojiEvents aria-hidden="true" /> {text.score}: {score}
              </Typography>
            </div>
            <LinearProgress
              className="math-game-progress"
              variant="determinate"
              value={progress}
              aria-label={text.progress}
            />
            <div className="math-game-question" aria-live="polite">
              {question}
            </div>
            <Typography className="math-game-instruction">{text.chooseAnswer}</Typography>
            <div className="math-game-options">
              {options.map((option) => {
                const isSelected = selectedAnswer === option;
                const optionClass = [
                  "math-game-option",
                  isSelected && feedback === "correct" ? "is-correct" : "",
                  isSelected && feedback === "incorrect" ? "is-incorrect" : "",
                ].filter(Boolean).join(" ");

                return (
                  <button
                    className={optionClass}
                    key={option}
                    type="button"
                    aria-pressed={isSelected}
                    disabled={feedback === "correct"}
                    onClick={() => onAnswer(option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {feedback === "correct" && (
              <>
                <Alert className="math-game-feedback" severity="success" role="status">
                  {text.correct}
                </Alert>
                <AppButton className="math-game-next" onClick={onNext} endIcon={<AutoAwesome />}>
                  {text.next}
                </AppButton>
              </>
            )}
            {feedback === "incorrect" && (
              <Alert className="math-game-feedback" severity="warning" role="status">
                {text.tryAgain}
              </Alert>
            )}
          </>
        ) : (
          <div className="math-game-finish">
            <span aria-hidden="true">🎉</span>
            <Typography component="h2">{text.finished}</Typography>
            <Typography className="math-game-final-score">
              {text.finalScore}: {score} / {totalRounds}
            </Typography>
            <AppButton onClick={onRestart} endIcon={<AutoAwesome />}>
              {text.playAgain}
            </AppButton>
          </div>
        )}
      </Card>
    </main>
  );
}
