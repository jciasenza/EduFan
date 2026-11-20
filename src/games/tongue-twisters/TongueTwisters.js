import React, { useEffect, useState } from "react";
import {
  Alert,
  Card,
  LinearProgress,
  Typography,
} from "@mui/material";
import { AutoAwesome, RecordVoiceOver } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { loadGameLevels, saveGameLevel } from "../gameLevelUtils";
import "./TongueTwisters.css";
import Loading from "../../components/ui/Loading";

const repetitionsPerPhrase = 3;

const localTongueTwisters = {
  es: [
    { phrase: "Pablito clavó un clavito, ¿qué clavito clavó Pablito?" },
    { phrase: "Tres tristes tigres tragan trigo en un trigal." },
    { phrase: "R con R cigarro, R con R barril, rápido ruedan los carros por los rieles del ferrocarril." },
    { phrase: "El cielo está enladrillado, ¿quién lo desenladrillará?" },
    { phrase: "Pepe Pecas pica papas con un pico. Con un pico pica papas Pepe Pecas." },
    { phrase: "Compadre, cómpreme un coco. Compadre, coco no compro." },
  ],
  en: [
    { phrase: "Peter Piper picked a peck of pickled peppers." },
    { phrase: "She sells seashells by the seashore." },
    { phrase: "A big black bug bit a big black bear." },
    { phrase: "Freshly fried flying fish." },
    { phrase: "Red lorry, yellow lorry." },
    { phrase: "Six slippery snails slid slowly seaward." },
  ],
};

function isValidTongueTwisters(items) {
  return Array.isArray(items) && items.length > 0 && items.every((item) => (
    item && typeof item.phrase === "string" && item.phrase.trim().length > 0
  ));
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function getPhraseOrder(phrases) {
  return shuffle(phrases.map((_, index) => index));
}

export default function TongueTwisters() {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const toolbarText = translations.gameToolbar || {};
  const navigate = useNavigate();
  const activeLanguage = language === "es" ? "es" : "en";
  const t = translations.tongueTwistersGame || {};
  const [phrases, setPhrases] = useState([]);
  const [phraseOrder, setPhraseOrder] = useState([]);
  const [availableLevels, setAvailableLevels] = useState({});
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [repetitions, setRepetitions] = useState(0);
  const [score, setScore] = useState(0);
  const [phraseCompleted, setPhraseCompleted] = useState(false);
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
          gameId: "tongue-twisters",
          language: activeLanguage,
          user,
          localLevels: { 1: localTongueTwisters[activeLanguage] },
          validateContent: isValidTongueTwisters,
        });
        if (!active) return;

        const selectedPhrases = result.levels[result.level];
        const order = getPhraseOrder(selectedPhrases);
        setAvailableLevels(result.levels);
        setPhrases(selectedPhrases);
        setPhraseOrder(order);
        setLevel(result.level);
        setRound(result.allLevelsComplete ? order.length : 0);
        setRepetitions(0);
        setScore(0);
        setPhraseCompleted(false);
        setUsingLocalContent(result.usingLocalContent);
        setAllLevelsComplete(result.allLevelsComplete);
      } catch (error) {
        if (!active) return;
        console.error("Could not load tongue twisters or game progress:", error);
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

  const finished = round >= phraseOrder.length;
  const phrase = finished ? "" : phrases[phraseOrder[round]]?.phrase || "";
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

  const completeLevel = async () => {
    setSavingProgress(true);
    setProgressError("");
    try {
      const completed = await saveGameLevel({
        gameId: "tongue-twisters",
        language: activeLanguage,
        user,
        level,
      });
      const nextLevel = completed + 1;
      if (availableLevels[nextLevel]) {
        const nextPhrases = availableLevels[nextLevel];
        const order = getPhraseOrder(nextPhrases);
        setPhrases(nextPhrases);
        setPhraseOrder(order);
        setLevel(nextLevel);
        setRound(0);
        setRepetitions(0);
        setScore(0);
        setPhraseCompleted(false);
        setAllLevelsComplete(false);
        setLevelNotice(`${t.levelComplete} ${t.level} ${nextLevel}`);
      } else {
        setRound(phraseOrder.length);
        setAllLevelsComplete(true);
      }
    } catch (error) {
      console.error("Could not save completed tongue-twisters level:", error);
      setProgressError(t.progressSaveError);
      setRound(phraseOrder.length);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleNext = async () => {
    if (round === phraseOrder.length - 1) {
      await completeLevel();
      return;
    }
    setRound((currentRound) => currentRound + 1);
    setRepetitions(0);
    setPhraseCompleted(false);
  };

  const handleRestart = () => {
    setPhraseOrder(getPhraseOrder(phrases));
    setRound(0);
    setRepetitions(0);
    setScore(0);
    setPhraseCompleted(false);
    setAllLevelsComplete(false);
    setLevelNotice("");
    setProgressError("");
  };

  return (
    <main className="tongue-twister-game">
      <Card className="tongue-twister-card" component="section">
        <GameToolbar
          level={level}
          points={score}
          levelLabel={toolbarText.level || t.level}
          pointsLabel={toolbarText.points}
          exitLabel={toolbarText.exit}
          onExit={() => navigate("/?category=tongue-twisters")}
        />
        <div className="tongue-twister-badge" aria-hidden="true">
          <RecordVoiceOver />
        </div>
        <Typography component="h1" variant="h3" className="tongue-twister-title">
          {t.title}
        </Typography>
        <Typography className="tongue-twister-description">{t.description}</Typography>

        {contentLoading ? (
          <div className="tongue-twister-loading" role="status">
            <Loading aria-label={t.contentLoading} />
            <Typography>{t.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="tongue-twister-content-error">
            <Alert severity="error" role="alert">{contentError}</Alert>
            <AppButton onClick={() => setRetryCount((count) => count + 1)}>
              {t.retry}
            </AppButton>
          </div>
        ) : (
          <>
            {usingLocalContent && (
              <Alert className="tongue-twister-feedback" severity="info" role="status">
                {t.localContentNotice}
              </Alert>
            )}
            {levelNotice && (
              <Alert className="tongue-twister-feedback" severity="success" role="status">
                {levelNotice}
              </Alert>
            )}
            {progressError && (
              <Alert className="tongue-twister-feedback" severity="error" role="alert">
                {progressError}
              </Alert>
            )}
            {allLevelsComplete && (
              <Alert className="tongue-twister-feedback" severity="success" role="status">
                {t.allLevelsComplete}
              </Alert>
            )}
            {!finished ? (
              <>
                <div className="tongue-twister-status">
                  <Typography>{t.round} {round + 1} {t.of} {phraseOrder.length}</Typography>
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
                    <AppButton
                      disabled={savingProgress}
                      onClick={handleNext}
                      endIcon={<AutoAwesome />}
                    >
                      {savingProgress ? t.savingProgress : (
                        round === phraseOrder.length - 1 ? t.finishLevel : t.next
                      )}
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
          </>
        )}
      </Card>
    </main>
  );
}
