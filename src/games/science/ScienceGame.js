import React, { useState } from "react";
import { Alert, Card, LinearProgress, Typography } from "@mui/material";
import { AutoAwesome, EmojiEvents, Science } from "@mui/icons-material";
import AppButton from "../../components/ui/AppButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./ScienceGame.css";

const questions = {
  es: [
    {
      clue: "¿Cuál es el planeta más cercano al Sol?",
      answers: ["Marte", "Mercurio", "Venus", "Júpiter"],
      correct: 1,
      emoji: "☀️",
    },
    {
      clue: "¿Qué necesita una planta para crecer?",
      answers: ["Agua y luz del Sol", "Solo arena", "Hielo y viento", "Piedras"],
      correct: 0,
      emoji: "🌱",
    },
    {
      clue: "¿Qué órgano bombea la sangre por el cuerpo?",
      answers: ["El pulmón", "El cerebro", "El corazón", "El estómago"],
      correct: 2,
      emoji: "❤️",
    },
    {
      clue: "¿A qué temperatura se congela el agua?",
      answers: ["A 0 °C", "A 50 °C", "A 100 °C", "A 20 °C"],
      correct: 0,
      emoji: "🧊",
    },
    {
      clue: "¿Cuántas patas tiene una araña?",
      answers: ["Seis", "Ocho", "Cuatro", "Diez"],
      correct: 1,
      emoji: "🕷️",
    },
    {
      clue: "¿Qué gas necesitamos para respirar?",
      answers: ["Oxígeno", "Helio", "Humo", "Vapor"],
      correct: 0,
      emoji: "🌬️",
    },
    {
      clue: "¿Qué es la Luna de la Tierra?",
      answers: ["Una estrella", "Un planeta", "Un satélite natural", "Un cometa"],
      correct: 2,
      emoji: "🌙",
    },
    {
      clue: "¿Qué aparece en el cielo cuando la luz del Sol atraviesa gotas de lluvia?",
      answers: ["Un arcoíris", "Una aurora", "Un cometa", "Un relámpago"],
      correct: 0,
      emoji: "🌈",
    },
  ],
  en: [
    {
      clue: "Which planet is closest to the Sun?",
      answers: ["Mars", "Mercury", "Venus", "Jupiter"],
      correct: 1,
      emoji: "☀️",
    },
    {
      clue: "What does a plant need to grow?",
      answers: ["Water and sunlight", "Only sand", "Ice and wind", "Rocks"],
      correct: 0,
      emoji: "🌱",
    },
    {
      clue: "Which organ pumps blood around your body?",
      answers: ["The lungs", "The brain", "The heart", "The stomach"],
      correct: 2,
      emoji: "❤️",
    },
    {
      clue: "At what temperature does water freeze?",
      answers: ["At 0 °C", "At 50 °C", "At 100 °C", "At 20 °C"],
      correct: 0,
      emoji: "🧊",
    },
    {
      clue: "How many legs does a spider have?",
      answers: ["Six", "Eight", "Four", "Ten"],
      correct: 1,
      emoji: "🕷️",
    },
    {
      clue: "Which gas do we need to breathe?",
      answers: ["Oxygen", "Helium", "Smoke", "Steam"],
      correct: 0,
      emoji: "🌬️",
    },
    {
      clue: "What is Earth's Moon?",
      answers: ["A star", "A planet", "A natural satellite", "A comet"],
      correct: 2,
      emoji: "🌙",
    },
    {
      clue: "What can appear when sunlight shines through raindrops?",
      answers: ["A rainbow", "An aurora", "A comet", "A lightning bolt"],
      correct: 0,
      emoji: "🌈",
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

export default function ScienceGame() {
  const { awardPoint } = useAuth();
  const { language, translations } = useLanguage();
  const gameText = translations.scienceGame || {};
  const text = gameText.shared || {};
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
      awardPoint("science");
      setFeedback("correct");
      return;
    }
    setFeedback("incorrect");
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
    <main className="science-game">
      <Card className="science-card" component="section">
        <div className="science-badge" aria-hidden="true">
          <Science />
        </div>
        <Typography component="h1" variant="h3" className="science-title">
          {gameText.title}
        </Typography>
        <Typography className="science-description">{gameText.description}</Typography>

        {!finished ? (
          <>
            <div className="science-status">
              <Typography>{text.round} {round + 1} {text.of} {questionOrder.length}</Typography>
              <Typography className="science-score">
                <EmojiEvents aria-hidden="true" /> {text.score}: {score}
              </Typography>
            </div>
            <LinearProgress
              className="science-progress"
              variant="determinate"
              value={progress}
              aria-label={text.progress}
            />
            <div className="science-prompt">
              <span className="science-emoji" aria-hidden="true">{currentQuestion.emoji}</span>
              <Typography className="science-question" aria-live="polite">
                {currentQuestion.clue}
              </Typography>
            </div>
            <Typography className="science-instruction">{text.chooseAnswer}</Typography>
            <div className="science-answers">
              {currentQuestion.answers.map((answer, index) => {
                const isSelected = selectedAnswer === index;
                const answerClass = [
                  "science-answer",
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
                <Alert className="science-feedback" severity="success" role="status">
                  {text.correct}
                </Alert>
                <AppButton onClick={handleNext} endIcon={<AutoAwesome />}>
                  {text.next}
                </AppButton>
              </>
            )}
            {feedback === "incorrect" && (
              <Alert className="science-feedback" severity="warning" role="status">
                {text.tryAgain}
              </Alert>
            )}
          </>
        ) : (
          <div className="science-finish">
            <span className="science-finish-emoji" aria-hidden="true">🎉</span>
            <Typography component="h2">{text.finished}</Typography>
            <Typography className="science-final-score">
              {text.finalScore}: {score} / {questionOrder.length}
            </Typography>
            <AppButton onClick={handleRestart} endIcon={<AutoAwesome />}>
              {text.playAgain}
            </AppButton>
          </div>
        )}
      </Card>
    </main>
  );
}
