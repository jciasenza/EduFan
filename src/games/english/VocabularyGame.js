import React, { useState } from "react";
import { Alert, Card, LinearProgress, Typography } from "@mui/material";
import { AutoAwesome, EmojiEvents, Translate } from "@mui/icons-material";
import AppButton from "../../components/ui/AppButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./VocabularyGame.css";

const vocabulary = [
  { es: "manzana", en: "apple", emoji: "🍎" },
  { es: "perro", en: "dog", emoji: "🐶" },
  { es: "libro", en: "book", emoji: "📚" },
  { es: "agua", en: "water", emoji: "💧" },
  { es: "casa", en: "house", emoji: "🏠" },
  { es: "gato", en: "cat", emoji: "🐱" },
  { es: "sol", en: "sun", emoji: "☀️" },
  { es: "flor", en: "flower", emoji: "🌷" },
  { es: "amigo", en: "friend", emoji: "🧒" },
  { es: "escuela", en: "school", emoji: "🏫" },
  { es: "leche", en: "milk", emoji: "🥛" },
  { es: "pájaro", en: "bird", emoji: "🐦" },
];

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createQuestions(targetLanguage) {
  const answerKey = targetLanguage === "en" ? "en" : "es";
  const promptKey = targetLanguage === "en" ? "es" : "en";
  const indexes = shuffle(vocabulary.map((_, index) => index)).slice(0, 8);

  return indexes.map((index) => {
    const entry = vocabulary[index];
    const distractors = shuffle(
      vocabulary.filter((candidate) => candidate[answerKey] !== entry[answerKey]),
    ).slice(0, 3);

    return {
      ...entry,
      promptWord: entry[promptKey],
      correctAnswer: entry[answerKey],
      options: shuffle([entry, ...distractors]).map((option) => option[answerKey]),
    };
  });
}

export default function VocabularyGame({ targetLanguage }) {
  const { awardPoint } = useAuth();
  const { language, translations } = useLanguage();
  const isEnglish = targetLanguage === "en";
  const gameText = translations.languageGames || {};
  const text = gameText.shared || {};
  const t = gameText[isEnglish ? "english" : "spanish"] || {};
  const [questions, setQuestions] = useState(() => createQuestions(targetLanguage));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const finished = round >= questions.length;
  const currentQuestion = finished ? null : questions[round];
  const progress = (round / questions.length) * 100;
  const promptTemplate = isEnglish
    ? (language === "es" ? text.englishPromptEs : text.englishPromptEn)
    : (language === "es" ? text.spanishPromptEs : text.spanishPromptEn);
  const prompt = currentQuestion
    ? promptTemplate?.replace("{word}", currentQuestion.promptWord)
    : "";

  const handleAnswer = (answer) => {
    if (feedback === "correct") return;
    setSelectedAnswer(answer);
    if (answer === currentQuestion.correctAnswer) {
      setScore((currentScore) => currentScore + 1);
      awardPoint(isEnglish ? "english" : "spanish");
      setFeedback("correct");
      return;
    }
    setFeedback("incorrect");
  };

  const handleNext = () => {
    setRound((currentRound) => currentRound + 1);
    setSelectedAnswer("");
    setFeedback("");
  };

  const handleRestart = () => {
    setQuestions(createQuestions(targetLanguage));
    setRound(0);
    setScore(0);
    setSelectedAnswer("");
    setFeedback("");
  };

  return (
    <main className="vocabulary-game">
      <Card className="vocabulary-card" component="section">
        <div className="vocabulary-badge" aria-hidden="true"><Translate /></div>
        <Typography component="h1" variant="h3" className="vocabulary-title">
          {t.title}
        </Typography>
        <Typography className="vocabulary-description">{t.description}</Typography>

        {!finished ? (
          <>
            <div className="vocabulary-status">
              <Typography>{text.round} {round + 1} {text.of} {questions.length}</Typography>
              <Typography className="vocabulary-score">
                <EmojiEvents aria-hidden="true" /> {text.score}: {score}
              </Typography>
            </div>
            <LinearProgress
              className="vocabulary-progress"
              variant="determinate"
              value={progress}
              aria-label={text.progress}
            />
            <div className="vocabulary-prompt">
              <span className="vocabulary-emoji" aria-hidden="true">{currentQuestion.emoji}</span>
              <Typography className="vocabulary-question" aria-live="polite">
                {prompt}
              </Typography>
            </div>
            <Typography className="vocabulary-instruction">{text.chooseAnswer}</Typography>
            <div className="vocabulary-options">
              {currentQuestion.options.map((answer) => {
                const isSelected = selectedAnswer === answer;
                const optionClass = [
                  "vocabulary-option",
                  isSelected && feedback === "correct" ? "is-correct" : "",
                  isSelected && feedback === "incorrect" ? "is-incorrect" : "",
                ].filter(Boolean).join(" ");

                return (
                  <button
                    className={optionClass}
                    key={answer}
                    type="button"
                    aria-pressed={isSelected}
                    disabled={feedback === "correct"}
                    onClick={() => handleAnswer(answer)}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>
            {feedback === "correct" && (
              <>
                <Alert className="vocabulary-feedback" severity="success" role="status">
                  {text.correct}
                </Alert>
                <AppButton onClick={handleNext} endIcon={<AutoAwesome />}>
                  {text.next}
                </AppButton>
              </>
            )}
            {feedback === "incorrect" && (
              <Alert className="vocabulary-feedback" severity="warning" role="status">
                {text.tryAgain}
              </Alert>
            )}
          </>
        ) : (
          <div className="vocabulary-finish">
            <span className="vocabulary-finish-emoji" aria-hidden="true">🎉</span>
            <Typography component="h2">{text.finished}</Typography>
            <Typography className="vocabulary-final-score">
              {text.finalScore}: {score} / {questions.length}
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
