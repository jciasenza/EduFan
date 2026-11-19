import React, { useState } from "react";
import { Alert, Card, LinearProgress, Typography } from "@mui/material";
import { AutoAwesome, EmojiEvents, RecordVoiceOver } from "@mui/icons-material";
import AppButton from "../../components/ui/AppButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./TongueTwisters.css";

const repetitionsPerPhrase = 3;

const tongueTwisters = {
  es: [
    "Pablito clavó un clavito, ¿qué clavito clavó Pablito?",
    "Tres tristes tigres tragan trigo en un trigal.",
    "R con R cigarro, R con R barril, rápido ruedan los carros por los rieles del ferrocarril.",
    "El cielo está enladrillado, ¿quién lo desenladrillará?",
    "Pepe Pecas pica papas con un pico. Con un pico pica papas Pepe Pecas.",
    "Compadre, cómpreme un coco. Compadre, coco no compro.",
  ],
  en: [
    "Peter Piper picked a peck of pickled peppers.",
    "She sells seashells by the seashore.",
    "A big black bug bit a big black bear.",
    "Freshly fried flying fish.",
    "Red lorry, yellow lorry.",
    "Six slippery snails slid slowly seaward.",
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

export default function TongueTwisters() {
  const { awardPoint } = useAuth();
  const { language, translations } = useLanguage();
  const isSpanish = language === "es";
  const t = translations.tongueTwistersGame || {};
  const phrases = tongueTwisters[isSpanish ? "es" : "en"];
  const [phraseOrder, setPhraseOrder] = useState(() => shuffle(phrases.map((_, index) => index)));
  const [round, setRound] = useState(0);
  const [repetitions, setRepetitions] = useState(0);
  const [score, setScore] = useState(0);
  const [phraseCompleted, setPhraseCompleted] = useState(false);

  const finished = round >= phraseOrder.length;
  const phrase = finished ? "" : phrases[phraseOrder[round]];
  const progress = (round / phraseOrder.length) * 100;

  const handleRepetition = () => {
    if (phraseCompleted) return;
    const updatedRepetitions = repetitions + 1;
    setRepetitions(updatedRepetitions);

    if (updatedRepetitions === repetitionsPerPhrase) {
      setPhraseCompleted(true);
      setScore((currentScore) => currentScore + 1);
      awardPoint("tongue-twisters");
    }
  };

  const handleNext = () => {
    setRound((currentRound) => currentRound + 1);
    setRepetitions(0);
    setPhraseCompleted(false);
  };

  const handleRestart = () => {
    setPhraseOrder(shuffle(phrases.map((_, index) => index)));
    setRound(0);
    setRepetitions(0);
    setScore(0);
    setPhraseCompleted(false);
  };

  return (
    <main className="tongue-twister-game">
      <Card className="tongue-twister-card" component="section">
        <div className="tongue-twister-badge" aria-hidden="true">
          <RecordVoiceOver />
        </div>
        <Typography component="h1" variant="h3" className="tongue-twister-title">
          {t.title}
        </Typography>
        <Typography className="tongue-twister-description">{t.description}</Typography>

        {!finished ? (
          <>
            <div className="tongue-twister-status">
              <Typography>{t.round} {round + 1} {t.of} {phraseOrder.length}</Typography>
              <Typography className="tongue-twister-score">
                <EmojiEvents aria-hidden="true" /> {t.score}: {score}
              </Typography>
            </div>
            <LinearProgress
              className="tongue-twister-progress"
              variant="determinate"
              value={progress}
              aria-label={t.progress}
            />

            <div className="tongue-twister-prompt">
              <span className="tongue-twister-emoji" aria-hidden="true">👅</span>
              <Typography className="tongue-twister-phrase" aria-live="polite">
                {phrase}
              </Typography>
            </div>

            <Typography className="tongue-twister-instruction">
              {t.repeatInstruction}
            </Typography>
            <div className="tongue-twister-repetitions" aria-label={t.repetitionProgress}>
              {Array.from({ length: repetitionsPerPhrase }, (_, index) => (
                <span
                  className={`repetition-dot${index < repetitions ? " is-complete" : ""}`}
                  key={index}
                  aria-label={`${index + 1}: ${index < repetitions ? t.done : t.notDone}`}
                >
                  {index < repetitions ? "✓" : index + 1}
                </span>
              ))}
            </div>

            {phraseCompleted ? (
              <>
                <Alert className="tongue-twister-feedback" severity="success" role="status">
                  {t.completed}
                </Alert>
                <AppButton onClick={handleNext} endIcon={<AutoAwesome />}>
                  {t.next}
                </AppButton>
              </>
            ) : (
              <div className="tongue-twister-actions">
                <AppButton onClick={handleRepetition} startIcon={<RecordVoiceOver />}>
                  {t.repeated}
                </AppButton>
                {repetitions > 0 && (
                  <AppButton
                    variant="secondary"
                    onClick={() => setRepetitions(0)}
                  >
                    {t.startOver}
                  </AppButton>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="tongue-twister-finish">
            <span className="tongue-twister-finish-emoji" aria-hidden="true">🎉</span>
            <Typography component="h2">{t.finished}</Typography>
            <Typography className="tongue-twister-final-score">
              {t.finalScore}: {score} / {phraseOrder.length}
            </Typography>
            <AppButton onClick={handleRestart} endIcon={<AutoAwesome />}>
              {t.playAgain}
            </AppButton>
          </div>
        )}
      </Card>
    </main>
  );
}
