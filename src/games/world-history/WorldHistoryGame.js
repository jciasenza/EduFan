import React, { useState } from "react";
import { Alert, Card, LinearProgress, Typography } from "@mui/material";
import { AutoAwesome, EmojiEvents, HistoryEdu } from "@mui/icons-material";
import AppButton from "../../components/ui/AppButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./WorldHistoryGame.css";

const questions = {
  es: [
    {
      clue: "¿A orillas de qué río se desarrolló el antiguo Egipto?",
      answers: ["El Amazonas", "El Nilo", "El Danubio", "El Tíber"],
      correct: 1,
      emoji: "🏺",
    },
    {
      clue: "¿En qué región surgieron algunas de las primeras ciudades, entre los ríos Tigris y Éufrates?",
      answers: ["Escandinavia", "Los Andes", "Mesopotamia", "Polinesia"],
      correct: 2,
      emoji: "🧱",
    },
    {
      clue: "¿Qué antigua civilización construyó el Partenón en Atenas?",
      answers: ["La maya", "La persa", "La vikinga", "La griega"],
      correct: 3,
      emoji: "🏛️",
    },
    {
      clue: "¿Qué imperio construyó una extensa red de caminos alrededor del mar Mediterráneo?",
      answers: ["El Imperio inca", "El Imperio mongol", "El Imperio romano", "El Imperio azteca"],
      correct: 2,
      emoji: "🛣️",
    },
    {
      clue: "¿En qué país se encuentra la Gran Muralla?",
      answers: ["China", "India", "Egipto", "Italia"],
      correct: 0,
      emoji: "🐉",
    },
    {
      clue: "¿Qué pueblo construyó la ciudad de Machu Picchu en los Andes?",
      answers: ["Los romanos", "Los fenicios", "Los incas", "Los egipcios"],
      correct: 2,
      emoji: "⛰️",
    },
    {
      clue: "¿Qué invento ayudó a producir libros en grandes cantidades en Europa desde el siglo XV?",
      answers: ["El telescopio", "La brújula", "El motor de vapor", "La imprenta"],
      correct: 3,
      emoji: "📚",
    },
    {
      clue: "¿Qué ruta conectó durante siglos a Asia y Europa mediante el comercio?",
      answers: ["La Ruta del Ámbar", "La Ruta de la Seda", "El Camino Real", "La Ruta de la Sal"],
      correct: 1,
      emoji: "🐫",
    },
  ],
  en: [
    {
      clue: "Along which river did ancient Egypt develop?",
      answers: ["The Amazon", "The Nile", "The Danube", "The Tiber"],
      correct: 1,
      emoji: "🏺",
    },
    {
      clue: "In which region did some of the first cities rise between the Tigris and Euphrates rivers?",
      answers: ["Scandinavia", "The Andes", "Mesopotamia", "Polynesia"],
      correct: 2,
      emoji: "🧱",
    },
    {
      clue: "Which ancient civilization built the Parthenon in Athens?",
      answers: ["The Maya", "The Persians", "The Vikings", "The Greeks"],
      correct: 3,
      emoji: "🏛️",
    },
    {
      clue: "Which empire built an extensive network of roads around the Mediterranean Sea?",
      answers: ["The Inca Empire", "The Mongol Empire", "The Roman Empire", "The Aztec Empire"],
      correct: 2,
      emoji: "🛣️",
    },
    {
      clue: "Which country is home to the Great Wall?",
      answers: ["China", "India", "Egypt", "Italy"],
      correct: 0,
      emoji: "🐉",
    },
    {
      clue: "Which people built the city of Machu Picchu in the Andes?",
      answers: ["The Romans", "The Phoenicians", "The Incas", "The Egyptians"],
      correct: 2,
      emoji: "⛰️",
    },
    {
      clue: "Which invention helped produce books in large numbers in Europe from the 15th century?",
      answers: ["The telescope", "The compass", "The steam engine", "The printing press"],
      correct: 3,
      emoji: "📚",
    },
    {
      clue: "Which route connected Asia and Europe through trade for centuries?",
      answers: ["The Amber Road", "The Silk Road", "The Royal Road", "The Salt Route"],
      correct: 1,
      emoji: "🐫",
    },
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

export default function WorldHistoryGame() {
  const { awardPoint } = useAuth();
  const { language, translations } = useLanguage();
  const t = translations.worldHistoryGame || {};
  const questionSet = questions[language === "es" ? "es" : "en"];
  const [questionOrder, setQuestionOrder] = useState(() => shuffle(questionSet.map((_, index) => index)));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");

  const finished = round >= questionOrder.length;
  const currentQuestion = finished ? null : questionSet[questionOrder[round]];
  const progress = (round / questionOrder.length) * 100;

  const handleAnswer = (answerIndex) => {
    if (feedback === "correct") return;
    setSelectedAnswer(answerIndex);
    if (answerIndex === currentQuestion.correct) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("world-history");
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
  };

  const handleNext = () => {
    setRound((currentRound) => currentRound + 1);
    setSelectedAnswer(null);
    setFeedback("");
  };

  const handleRestart = () => {
    setQuestionOrder(shuffle(questionSet.map((_, index) => index)));
    setRound(0);
    setScore(0);
    setSelectedAnswer(null);
    setFeedback("");
  };

  return (
    <main className="world-history-game">
      <Card className="world-history-card" component="section">
        <div className="world-history-badge" aria-hidden="true"><HistoryEdu /></div>
        <Typography component="h1" variant="h3" className="world-history-title">
          {t.title}
        </Typography>
        <Typography className="world-history-description">{t.description}</Typography>

        {!finished ? (
          <>
            <div className="world-history-status">
              <Typography>{t.round} {round + 1} {t.of} {questionOrder.length}</Typography>
              <Typography className="world-history-score">
                <EmojiEvents aria-hidden="true" /> {t.score}: {score}
              </Typography>
            </div>
            <LinearProgress
              className="world-history-progress"
              variant="determinate"
              value={progress}
              aria-label={t.progress}
            />
            <div className="world-history-prompt">
              <span className="world-history-emoji" aria-hidden="true">{currentQuestion.emoji}</span>
              <Typography className="world-history-question" aria-live="polite">
                {currentQuestion.clue}
              </Typography>
            </div>
            <Typography className="world-history-instruction">{t.chooseAnswer}</Typography>
            <div className="world-history-answers">
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswer === index;
                const answerClass = [
                  "world-history-answer",
                  isSelected && feedback === "correct" ? "is-correct" : "",
                  isSelected && feedback === "incorrect" ? "is-incorrect" : "",
                ].filter(Boolean).join(" ");

                return (
                  <button
                    className={answerClass}
                    key={answer}
                    type="button"
                    aria-pressed={isSelected}
                    disabled={feedback === "correct"}
                    onClick={() => handleAnswer(index)}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>
            {feedback === "correct" && (
              <>
                <Alert className="world-history-feedback" severity="success" role="status">
                  {t.correct}
                </Alert>
                <AppButton onClick={handleNext} endIcon={<AutoAwesome />}>
                  {t.next}
                </AppButton>
              </>
            )}
            {feedback === "incorrect" && (
              <Alert className="world-history-feedback" severity="warning" role="status">
                {t.tryAgain}
              </Alert>
            )}
          </>
        ) : (
          <div className="world-history-finish">
            <span className="world-history-finish-emoji" aria-hidden="true">🌍</span>
            <Typography component="h2">{t.finished}</Typography>
            <Typography className="world-history-final-score">
              {t.finalScore}: {score} / {questionOrder.length}
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
