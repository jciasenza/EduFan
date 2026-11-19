import React, { useEffect, useRef, useState } from "react";
import { Alert, Card, Typography } from "@mui/material";
import { AutoAwesome, CheckCircle, MusicNote, Replay } from "@mui/icons-material";
import AppButton from "../../components/ui/AppButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./SongsGame.css";

const ROUND_COUNT = 6;
const NOTE_FREQUENCIES = [261.63, 293.66, 329.63, 392, 440, 523.25];
const NOTE_PATTERNS = [
  [0, 2, 4, 2],
  [1, 3, 5, 3],
  [2, 4, 5, 4],
  [5, 3, 2, 0],
  [0, 1, 3, 4],
  [4, 3, 1, 0],
  [1, 2, 4, 5],
  [5, 4, 2, 1],
  [2, 0, 3, 1],
  [3, 5, 1, 4],
];
const NOTE_COLORS = ["#ef5350", "#ff9800", "#fbc02d", "#43a047", "#4285f4", "#8e5ad7"];

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

const melodies = NOTE_PATTERNS.map((notes, id) => ({ id, notes }));

function createRounds() {
  return shuffle(melodies).slice(0, ROUND_COUNT).map((answer) => ({
    answer,
    choices: shuffle([
      answer,
      ...shuffle(melodies.filter(({ id }) => id !== answer.id)).slice(0, 3),
    ]),
  }));
}

export default function SongsGame() {
  const { awardPoint } = useAuth();
  const { translations } = useLanguage();
  const t = translations.songsGame || {};
  const [rounds, setRounds] = useState(createRounds);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [audioError, setAudioError] = useState(false);
  const audioContext = useRef(null);
  const playTimer = useRef(null);
  const round = rounds[roundIndex];
  const finished = roundIndex === ROUND_COUNT;

  useEffect(() => () => {
    window.clearTimeout(playTimer.current);
    if (audioContext.current && audioContext.current.state !== "closed") {
      audioContext.current.close();
    }
  }, []);

  const playMelody = async (melody, playbackId) => {
    if (playingId) return;
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      setAudioError(true);
      return;
    }

    setAudioError(false);
    setPlayingId(playbackId);
    try {
      if (!audioContext.current || audioContext.current.state === "closed") {
        audioContext.current = new AudioContextConstructor();
      }
      const context = audioContext.current;
      await context.resume();
      const noteDuration = 0.24;
      const noteGap = 0.34;
      const startTime = context.currentTime + 0.05;

      melody.notes.forEach((note, index) => {
        const start = startTime + index * noteGap;
        const oscillator = context.createOscillator();
        const volume = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = NOTE_FREQUENCIES[note];
        volume.gain.setValueAtTime(0.001, start);
        volume.gain.linearRampToValueAtTime(0.16, start + 0.025);
        volume.gain.setValueAtTime(0.16, start + noteDuration - 0.04);
        volume.gain.linearRampToValueAtTime(0.001, start + noteDuration);
        oscillator.connect(volume);
        volume.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + noteDuration);
      });

      playTimer.current = window.setTimeout(
        () => setPlayingId(null),
        melody.notes.length * noteGap * 1000,
      );
    } catch (playbackError) {
      console.error(playbackError);
      setPlayingId(null);
      setAudioError(true);
    }
  };

  const chooseMelody = (choice) => {
    if (selected !== null || playingId) return;
    setSelected(choice.id);
    if (choice.id === round.answer.id) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("songs");
    }
  };

  const nextRound = () => {
    setRoundIndex((index) => index + 1);
    setSelected(null);
  };

  const restart = () => {
    window.clearTimeout(playTimer.current);
    setRounds(createRounds());
    setRoundIndex(0);
    setScore(0);
    setSelected(null);
    setPlayingId(null);
    setAudioError(false);
  };

  return (
    <main className="songs-game">
      <Card className="songs-card" component="section">
        <div className="songs-badge" aria-hidden="true"><MusicNote /></div>
        <Typography component="h1" variant="h3" className="songs-title">
          {t.title}
        </Typography>
        <Typography className="songs-description">{t.description}</Typography>

        {!finished ? (
          <>
            <div className="songs-status">
              <span>{t.round}: {roundIndex + 1} / {ROUND_COUNT}</span>
              <span>{t.score}: {score}</span>
            </div>
            <Typography className="songs-question">{t.question}</Typography>
            <AppButton
              className="songs-listen-button"
              onClick={() => playMelody(round.answer, "target")}
              disabled={Boolean(playingId) || Boolean(selected)}
              startIcon={playingId === "target" ? <MusicNote /> : <Replay />}
            >
              {playingId === "target" ? t.listening : t.listen}
            </AppButton>
            {audioError && (
              <Alert className="songs-audio-error" severity="error" role="alert">
                {t.audioError}
              </Alert>
            )}
            <div className="songs-options" role="group" aria-label={t.optionsLabel}>
              {round.choices.map((choice, index) => {
                const isCorrect = choice.id === round.answer.id;
                const resultClass = selected !== null
                  ? (isCorrect ? " is-correct" : selected === choice.id ? " is-incorrect" : "")
                  : "";

                return (
                  <button
                    className={`songs-option${resultClass}`}
                    key={choice.id}
                    type="button"
                    aria-label={`${t.option} ${index + 1}`}
                    disabled={selected !== null || Boolean(playingId)}
                    onClick={() => chooseMelody(choice)}
                  >
                    <span className="songs-option-label">{t.option} {index + 1}</span>
                    <span className="songs-note-sequence" aria-hidden="true">
                      {choice.notes.map((note, noteIndex) => (
                        <span
                          className="songs-note"
                          key={`${noteIndex}-${note}`}
                          style={{
                            "--note-level": `${(5 - note) * 8 + 4}px`,
                            "--note-color": NOTE_COLORS[note],
                          }}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <>
                <Alert
                  className="songs-feedback"
                  severity={selected === round.answer.id ? "success" : "info"}
                  role="status"
                >
                  {selected === round.answer.id ? t.correct : t.incorrect}
                </Alert>
                <AppButton onClick={nextRound} endIcon={<CheckCircle />}>
                  {roundIndex === ROUND_COUNT - 1 ? t.finish : t.next}
                </AppButton>
              </>
            )}
          </>
        ) : (
          <>
            <div className="songs-finished-icon" aria-hidden="true">🎵</div>
            <Typography className="songs-final-score">
              {t.finished}: {score} / {ROUND_COUNT}
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
