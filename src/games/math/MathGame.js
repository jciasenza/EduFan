import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import MathQuiz from "./MathQuiz";
import { makeOptions, MATH_ROUNDS } from "./mathUtils";

function createQuestion() {
  const isAddition = Math.random() < 0.5;
  const first = Math.floor(Math.random() * 10) + 1;
  const second = Math.floor(Math.random() * 10) + 1;
  const left = isAddition ? first : Math.max(first, second);
  const right = isAddition ? second : Math.min(first, second);
  const answer = isAddition ? left + right : left - right;

  return {
    left,
    right,
    operator: isAddition ? "+" : "−",
    answer,
    options: makeOptions(answer, 0, 20),
  };
}

export default function MathGame() {
  const { awardPoint } = useAuth();
  const { translations } = useLanguage();
  const gameText = translations.mathGames || {};
  const text = gameText.shared || {};
  const t = gameText.addition || {};
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
      awardPoint("math-addition");
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
        <div className="math-operation">
          <span className="math-operation-part">{question.left}</span>
          <span className="math-operation-part math-operation-symbol math-operation-operator">
            {question.operator}
          </span>
          <span className="math-operation-part">{question.right}</span>
          <span className="math-operation-part math-operation-symbol math-operation-equals">=</span>
          <span className="math-operation-part math-operation-symbol math-operation-question">?</span>
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
