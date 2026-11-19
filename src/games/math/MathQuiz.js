import React from "react";
import {
  Alert,
  Card,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useLanguage } from "../../context/LanguageContext";
import "./MathGames.css";

export default function MathQuiz({
  title,
  description,
  question,
  options,
  selectedAnswer,
  level,
  score,
  round,
  totalRounds,
  feedback,
  text,
  exitCategory,
  contentLoading,
  contentError,
  usingLocalContent,
  allLevelsComplete,
  levelNotice,
  progressError,
  savingProgress,
  onRetry,
  onAnswer,
  onNext,
  onRestart,
}) {
  const { translations } = useLanguage();
  const toolbarText = translations.gameToolbar || {};
  const navigate = useNavigate();
  const finished = round >= totalRounds;
  const progress = (round / totalRounds) * 100;

  return (
    <main className="math-game">
      <Card className="math-game-card" component="section">
        <GameToolbar
          level={level}
          points={score}
          levelLabel={toolbarText.level}
          pointsLabel={toolbarText.points}
          exitLabel={toolbarText.exit}
          onExit={() => navigate(`/?category=${exitCategory}`)}
        />
        <div className="math-game-badge" aria-hidden="true">
          <AutoAwesome />
        </div>
        <Typography component="h1" variant="h3" className="math-game-title">
          {title}
        </Typography>
        <Typography className="math-game-description">{description}</Typography>

        {contentLoading ? (
          <div className="math-game-loading" role="status">
            <CircularProgress aria-label={text.contentLoading} />
            <Typography>{text.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="math-game-content-error">
            <Alert severity="error" role="alert">{contentError}</Alert>
            <AppButton onClick={onRetry}>{text.retry}</AppButton>
          </div>
        ) : (
          <>
            {usingLocalContent && (
              <Alert className="math-game-feedback" severity="info" role="status">
                {text.localContentNotice}
              </Alert>
            )}
            {levelNotice && (
              <Alert className="math-game-feedback" severity="success" role="status">
                {levelNotice}
              </Alert>
            )}
            {progressError && (
              <Alert className="math-game-feedback" severity="error" role="alert">
                {progressError}
              </Alert>
            )}
            {allLevelsComplete && (
              <Alert className="math-game-feedback" severity="success" role="status">
                {text.allLevelsComplete}
              </Alert>
            )}
            {!finished ? (
              <>
                <div className="math-game-status">
                  <Typography>{text.round} {round + 1} {text.of} {totalRounds}</Typography>
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
                        disabled={feedback === "correct" || savingProgress}
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
                    <AppButton
                      className="math-game-next"
                      disabled={savingProgress}
                      onClick={onNext}
                      endIcon={<AutoAwesome />}
                    >
                      {savingProgress
                        ? text.savingProgress
                        : (round === totalRounds - 1 ? text.finishLevel : text.next)}
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
          </>
        )}
      </Card>
    </main>
  );
}
