import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import MathQuiz from "./MathQuiz";
import { makeOptions, MATH_ROUNDS } from "./mathUtils";

function createQuestion() {
  const start = Math.floor(Math.random() * 10) + 1;
  const step = Math.floor(Math.random() * 4) + 2;
  const missingIndex = Math.floor(Math.random() * 3) + 1;
  const sequence = Array.from({ length: 5 }, (_, index) => start + step * index);
  const answer = sequence[missingIndex];

  return {
    sequence,
    missingIndex,
    answer,
    options: makeOptions(answer, Math.max(0, answer - 8), answer + 8),
  };
}

export default function NumberSeriesGame() {
  const { awardPoint } = useAuth();
  const { translations } = useLanguage();
  const gameText = translations.mathGames || {};
  const text = gameText.shared || {};
  const t = gameText.series || {};
  const [question, setQuestion] = useState(createQuestion);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState("");

  const handleAnswer = (answer) => {
    if (feedback === "correct") return;
    setSelectedAnswer(answer);
    if (answer === question.answer) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("number-series");
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
  };

  const handleNext = () => {
    setRound((currentRound) => currentRound + 1);
    setQuestion(createQuestion());
    setSelectedAnswer(null);
    setFeedback("");
  };

  const handleRestart = () => {
    setRound(0);
    setScore(0);
    setQuestion(createQuestion());
    setSelectedAnswer(null);
    setFeedback("");
  };

  return (
    <MathQuiz
      title={t.title}
      description={t.description}
      question={(
        <div className="math-series-sequence">
          {question.sequence.map((number, index) => (
            <span
              className={`math-series-number${index === question.missingIndex ? " is-missing" : ""}`}
              key={`${index}-${number}`}
            >
              {index === question.missingIndex ? "?" : number}
            </span>
          ))}
        </div>
      )}
      options={question.options}
      selectedAnswer={selectedAnswer}
      score={score}
      round={round}
      totalRounds={MATH_ROUNDS}
      feedback={feedback}
      text={text}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onRestart={handleRestart}
    />
  );
}
