import React, { useState } from "react";
import { Alert, Card, LinearProgress, Typography } from "@mui/material";
import { AutoAwesome, EmojiEvents, MenuBook } from "@mui/icons-material";
import AppButton from "../../components/ui/AppButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./StoriesGame.css";

const stories = {
  es: [
    {
      title: "La semilla viajera",
      story: "Una semillita cayó de un girasol y el viento la llevó hasta un jardín. La lluvia la despertó y, con los días, creció una flor amarilla que saludaba al Sol.",
      question: "¿Qué ayudó a despertar a la semilla?",
      correct: "La lluvia",
      options: ["La lluvia", "Una mariposa", "La nieve"],
      emoji: "🌻",
    },
    {
      title: "La estrella del lago",
      story: "Lila, una pequeña luciérnaga, vio una luz en el lago y pensó que era una estrella perdida. Voló hasta la orilla y descubrió que la Luna se reflejaba en el agua.",
      question: "¿Qué era la luz que Lila vio en el lago?",
      correct: "El reflejo de la Luna",
      options: ["El reflejo de la Luna", "Una estrella caída", "Una linterna"],
      emoji: "🌙",
    },
    {
      title: "El paraguas rojo",
      story: "Tomás encontró un paraguas rojo en la entrada de la escuela. Aunque llovía, esperó bajo el techo hasta que Nina volvió a buscarlo. Ella sonrió y compartieron el camino a casa.",
      question: "¿Qué hizo Tomás cuando encontró el paraguas?",
      correct: "Esperó a que Nina volviera",
      options: ["Se lo llevó a casa", "Esperó a que Nina volviera", "Lo dejó bajo la lluvia"],
      emoji: "☔",
    },
    {
      title: "La carrera de caracoles",
      story: "Cuatro caracoles organizaron una carrera hasta la hoja de lechuga. Tito avanzó despacito, pero no se detuvo. Cuando llegó, sus amigos lo aplaudieron por no rendirse.",
      question: "¿Por qué aplaudieron los amigos a Tito?",
      correct: "Porque no se rindió",
      options: ["Porque llegó primero", "Porque tenía una bicicleta", "Porque no se rindió"],
      emoji: "🐌",
    },
    {
      title: "El mapa de Bruno",
      story: "Bruno dibujó un mapa para encontrar el manzano del parque. Siguió las flechas, cruzó el puente pequeño y encontró fruta para compartir con sus amigos.",
      question: "¿Qué encontró Bruno al seguir el mapa?",
      correct: "Un manzano",
      options: ["Un manzano", "Un barco", "Una casa nueva"],
      emoji: "🍎",
    },
  ],
  en: [
    {
      title: "The Traveling Seed",
      story: "A tiny seed fell from a sunflower and the wind carried it to a garden. The rain woke it up. Days later, a yellow flower grew and waved at the Sun.",
      question: "What helped wake the seed?",
      correct: "The rain",
      options: ["The rain", "A butterfly", "The snow"],
      emoji: "🌻",
    },
    {
      title: "The Lake Star",
      story: "Lily the firefly saw a light on the lake and thought it was a lost star. She flew closer and discovered the Moon shining in the water.",
      question: "What was the light on the lake?",
      correct: "The Moon's reflection",
      options: ["The Moon's reflection", "A fallen star", "A flashlight"],
      emoji: "🌙",
    },
    {
      title: "The Red Umbrella",
      story: "Tom found a red umbrella at the school entrance. It was raining, but he waited under the roof until Nina came back for it. She smiled, and they walked home together.",
      question: "What did Tom do when he found the umbrella?",
      correct: "He waited for Nina",
      options: ["He took it home", "He waited for Nina", "He left it in the rain"],
      emoji: "☔",
    },
    {
      title: "The Snail Race",
      story: "Four snails had a race to a lettuce leaf. Tim moved slowly but never stopped. When he arrived, his friends cheered because he kept trying.",
      question: "Why did Tim's friends cheer?",
      correct: "He did not give up",
      options: ["He came first", "He had a bicycle", "He did not give up"],
      emoji: "🐌",
    },
    {
      title: "Bruno's Map",
      story: "Bruno drew a map to find the apple tree in the park. He followed the arrows, crossed a little bridge, and found fruit to share with his friends.",
      question: "What did Bruno find by following the map?",
      correct: "An apple tree",
      options: ["An apple tree", "A boat", "A new house"],
      emoji: "🍎",
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

function createStoryOrder(storySet) {
  return shuffle(storySet.map((_, index) => index));
}

export default function StoriesGame() {
  const { awardPoint } = useAuth();
  const { language, translations } = useLanguage();
  const gameText = translations.storiesGame || {};
  const text = gameText.shared || {};
  const storySet = stories[language === "es" ? "es" : "en"];
  const [storyOrder, setStoryOrder] = useState(() => createStoryOrder(storySet));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const finished = round >= storyOrder.length;
  const currentStory = finished ? null : storySet[storyOrder[round]];
  const progress = (round / storyOrder.length) * 100;
  const answers = currentStory ? currentStory.options : [];

  const handleAnswer = (answer) => {
    if (feedback === "correct") return;
    setSelectedAnswer(answer);
    if (answer === currentStory.correct) {
      setScore((currentScore) => currentScore + 1);
      awardPoint("stories");
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
    setStoryOrder(createStoryOrder(storySet));
    setRound(0);
    setScore(0);
    setSelectedAnswer("");
    setFeedback("");
  };

  return (
    <main className="stories-game">
      <Card className="stories-card" component="section">
        <div className="stories-badge" aria-hidden="true"><MenuBook /></div>
        <Typography component="h1" variant="h3" className="stories-title">
          {gameText.title}
        </Typography>
        <Typography className="stories-description">{gameText.description}</Typography>

        {!finished ? (
          <>
            <div className="stories-status">
              <Typography>{text.story} {round + 1} {text.of} {storyOrder.length}</Typography>
              <Typography className="stories-score">
                <EmojiEvents aria-hidden="true" /> {text.score}: {score}
              </Typography>
            </div>
            <LinearProgress
              className="stories-progress"
              variant="determinate"
              value={progress}
              aria-label={text.progress}
            />
            <article className="story-page" aria-live="polite">
              <div className="story-illustration" aria-hidden="true">{currentStory.emoji}</div>
              <Typography component="h2" className="story-heading">
                {currentStory.title}
              </Typography>
              <Typography className="story-text">{currentStory.story}</Typography>
            </article>
            <Typography className="stories-question">{currentStory.question}</Typography>
            <div className="stories-answers">
              {answers.map((answer) => {
                const isSelected = selectedAnswer === answer;
                const answerClass = [
                  "story-answer",
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
                    onClick={() => handleAnswer(answer)}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>
            {feedback === "correct" && (
              <>
                <Alert className="stories-feedback" severity="success" role="status">
                  {text.correct}
                </Alert>
                <AppButton onClick={handleNext} endIcon={<AutoAwesome />}>
                  {text.next}
                </AppButton>
              </>
            )}
            {feedback === "incorrect" && (
              <Alert className="stories-feedback" severity="warning" role="status">
                {text.tryAgain}
              </Alert>
            )}
          </>
        ) : (
          <div className="stories-finish">
            <span className="stories-finish-emoji" aria-hidden="true">🎉</span>
            <Typography component="h2">{text.finished}</Typography>
            <Typography className="stories-final-score">
              {text.finalScore}: {score} / {storyOrder.length}
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
