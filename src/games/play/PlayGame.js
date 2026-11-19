import React, { useEffect, useRef, useState } from "react";
import { Alert, Card, Typography } from "@mui/material";
import { AutoAwesome, RestartAlt } from "@mui/icons-material";
import AppButton from "../../components/ui/AppButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./PlayGame.css";

const animals = ["🐶", "🐱", "🐰", "🦊", "🐼", "🐸", "🦁", "🐵"];
const PAIR_COUNT = 6;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createCards() {
  return shuffle(animals.slice(0, PAIR_COUNT).flatMap((animal, pair) => [
    { id: `${pair}-a`, pair, animal },
    { id: `${pair}-b`, pair, animal },
  ]));
}

export default function PlayGame() {
  const { awardPoint } = useAuth();
  const { translations } = useLanguage();
  const t = translations.memoryGame || {};
  const [cards, setCards] = useState(createCards);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const mismatchTimer = useRef(null);
  const finished = matchedPairs.length === PAIR_COUNT;

  useEffect(() => () => window.clearTimeout(mismatchTimer.current), []);

  const flipCard = (card) => {
    if (
      finished
      || flippedCards.length === 2
      || flippedCards.includes(card.id)
      || matchedPairs.includes(card.pair)
    ) return;

    const nextFlipped = [...flippedCards, card.id];
    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((currentMoves) => currentMoves + 1);
      const firstCard = cards.find(({ id }) => id === nextFlipped[0]);
      const secondCard = card;

      if (firstCard.pair === secondCard.pair) {
        setMatchedPairs((pairs) => [...pairs, card.pair]);
        setFlippedCards([]);
        awardPoint("memory");
      } else {
        mismatchTimer.current = window.setTimeout(() => setFlippedCards([]), 900);
      }
    }
  };

  const restart = () => {
    window.clearTimeout(mismatchTimer.current);
    setCards(createCards());
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
  };

  return (
    <main className="memory-game">
      <Card className="memory-card" component="section">
        <div className="memory-badge" aria-hidden="true">🧠</div>
        <Typography component="h1" variant="h3" className="memory-title">
          {t.title}
        </Typography>
        <Typography className="memory-description">{t.description}</Typography>

        <div className="memory-status">
          <Typography>{t.pairs}: {matchedPairs.length} / {PAIR_COUNT}</Typography>
          <Typography className="memory-moves">{t.moves}: {moves}</Typography>
          <AppButton
            variant="secondary"
            startIcon={<RestartAlt />}
            onClick={restart}
          >
            {t.restart}
          </AppButton>
        </div>

        <div className="memory-board" role="group" aria-label={t.boardLabel}>
          {cards.map((card, index) => {
            const isFlipped = flippedCards.includes(card.id);
            const isMatched = matchedPairs.includes(card.pair);
            const isVisible = isFlipped || isMatched;

            return (
              <button
                className={`memory-tile${isVisible ? " is-visible" : ""}${isMatched ? " is-matched" : ""}`}
                key={card.id}
                type="button"
                aria-label={isVisible
                  ? `${t.card} ${index + 1}: ${card.animal}${isMatched ? `, ${t.matched}` : ""}`
                  : `${t.card} ${index + 1}, ${t.hidden}`}
                aria-pressed={isVisible}
                disabled={isMatched || finished}
                onClick={() => flipCard(card)}
              >
                {isVisible ? card.animal : "?"}
              </button>
            );
          })}
        </div>

        {finished && (
          <Alert className="memory-success" severity="success" role="status">
            {t.finished}
          </Alert>
        )}
        {finished && (
          <AppButton onClick={restart} endIcon={<AutoAwesome />}>
            {t.playAgain}
          </AppButton>
        )}
      </Card>
    </main>
  );
}
