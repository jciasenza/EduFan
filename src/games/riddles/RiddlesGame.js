import React, { useState } from "react";
import { Alert, Card, LinearProgress, Typography } from "@mui/material";
import { AutoAwesome, EmojiEvents, Lightbulb } from "@mui/icons-material";
import AppButton from "../../components/ui/AppButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./RiddlesGame.css";

const riddles = {
  es: [
    {
      clue: "Tengo agujas y no sé coser, tengo números y no sé leer. ¿Qué soy?",
      answers: ["Un reloj", "Un peine", "Una brújula", "Un lápiz"],
      correct: 0,
    },
    {
      clue: "Blanca por dentro, verde por fuera. Si quieres que te lo diga, espera.",
      answers: ["La manzana", "La pera", "La sandía", "La uva"],
      correct: 1,
    },
    {
      clue: "Tiene muchos dientes, pero nunca puede comer. ¿Qué es?",
      answers: ["Un tiburón", "Un peine", "Un cocodrilo", "Una cremallera"],
      correct: 1,
    },
    {
      clue: "Cuanto más le quitas, más grande se hace. ¿Qué es?",
      answers: ["Un agujero", "Una montaña", "Una caja", "Una nube"],
      correct: 0,
    },
    {
      clue: "Tiene cuatro patas y no puede caminar. ¿Qué es?",
      answers: ["Un perro", "Una silla", "Una mesa", "Un caballo"],
      correct: 2,
    },
    {
      clue: "Vuelo sin alas y lloro sin ojos. ¿Qué soy?",
      answers: ["Una nube", "Un avión", "Una mariposa", "Una cometa"],
      correct: 0,
    },
    {
      clue: "Redonda soy y al saltar, muchas risas puedo dar. ¿Qué soy?",
      answers: ["Una naranja", "Una pelota", "Una rueda", "Una moneda"],
      correct: 1,
    },
    {
      clue: "Tiene hojas y no es árbol, tiene letras y no sabe hablar. ¿Qué es?",
      answers: ["Un libro", "Una flor", "Un cuaderno vacío", "Una carta"],
      correct: 0,
    },
  ],
  en: [
    {
      clue: "I have hands and a face, but no arms or eyes. What am I?",
      answers: ["A clock", "A doll", "A book", "A mirror"],
      correct: 0,
    },
    {
      clue: "I have teeth but I never bite. What am I?",
      answers: ["A shark", "A comb", "A crocodile", "A zipper"],
      correct: 1,
    },
    {
      clue: "The more you take away from me, the bigger I get. What am I?",
      answers: ["A hole", "A hill", "A box", "A cloud"],
      correct: 0,
    },
    {
      clue: "I have four legs but I cannot walk. What am I?",
      answers: ["A dog", "A chair", "A horse", "A cat"],
      correct: 1,
    },
    {
      clue: "I fly without wings and cry without eyes. What am I?",
      answers: ["A cloud", "An airplane", "A butterfly", "A kite"],
      correct: 0,
    },
    {
      clue: "I am round and bouncy, and I love to play. What am I?",
      answers: ["An orange", "A ball", "A wheel", "A coin"],
      correct: 1,
    },
    {
      clue: "I have pages and words, but I cannot talk. What am I?",
      answers: ["A book", "A flower", "A radio", "A letter"],
      correct: 0,
    },
    {
      clue: "I get wetter the more I dry. What am I?",
      answers: ["A sponge", "A towel", "An umbrella", "A cloud"],
      correct: 1,
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

export default function RiddlesGame() {
  const { awardPoint } = useAuth();
  const { language, translations } = useLanguage();
  const gameText = translations.riddlesGame || {};
  const text = gameText.shared || {};
  const questionSet = riddles[language === "es" ? "es" : "en"];
  const [questionOrder, setQuestionOrder] = useState(() => shuffle(questionSet.map((_, index) => index)));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");

  const finished = round >= questionOrder.length;
  const currentRiddle = finished ? null : questionSet[questionOrder[round]];
  const progress = (round / questionOrder.length) * 100;

  const handleAnswer = (answerIndex) => {
    if (feedback === "correct") return;
    setSelectedAnswer(answerIndex);
    if (answerIndex === currentRiddle.correct) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("riddles");
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
    <main className="riddles-game">
      <Card className="riddles-card" component="section">
        <div className="riddles-badge" aria-hidden="true">
          <Lightbulb />
        </div>
        <Typography component="h1" variant="h3" className="riddles-title">
          {gameText.title}
        </Typography>
        <Typography className="riddles-description">{gameText.description}</Typography>

        {!finished ? (
          <>
            <div className="riddles-status">
              <Typography>{text.round} {round + 1} {text.of} {questionOrder.length}</Typography>
              <Typography className="riddles-score">
                <EmojiEvents aria-hidden="true" /> {text.score}: {score}
              </Typography>
            </div>
            <LinearProgress
              className="riddles-progress"
              variant="determinate"
              value={progress}
              aria-label={text.progress}
            />
            <div className="riddle-prompt">
              <span className="riddle-emoji" aria-hidden="true">🤔</span>
              <Typography className="riddle-clue" aria-live="polite">
                {currentRiddle.clue}
              </Typography>
            </div>
            <Typography className="riddles-instruction">{text.chooseAnswer}</Typography>
            <div className="riddles-answers">
              {currentRiddle.answers.map((answer, index) => {
                const isSelected = selectedAnswer === index;
                const answerClass = [
                  "riddle-answer",
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
                <Alert className="riddles-feedback" severity="success" role="status">
                  {text.correct}
                </Alert>
                <AppButton onClick={handleNext} endIcon={<AutoAwesome />}>
                  {text.next}
                </AppButton>
              </>
            )}
            {feedback === "incorrect" && (
              <Alert className="riddles-feedback" severity="warning" role="status">
                {text.tryAgain}
              </Alert>
            )}
          </>
        ) : (
          <div className="riddles-finish">
            <span className="riddles-finish-emoji" aria-hidden="true">🎉</span>
            <Typography component="h2">{text.finished}</Typography>
            <Typography className="riddles-final-score">
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
