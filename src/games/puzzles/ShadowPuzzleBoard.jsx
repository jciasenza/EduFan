import React, { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Alert } from "@mui/material";
import AppButton from "../../components/ui/AppButton";

import "./ShadowPuzzleBoard.css";

function shuffle(items) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function createRounds(items) {
  if (!Array.isArray(items) || items.length < 3) return [];

  return shuffle(items).map((target) => {
    const distractors = shuffle(
      items.filter((item) => item.image !== target.image),
    ).slice(0, 2);

    return {
      target,
      options: shuffle([target, ...distractors]),
    };
  });
}

export default function ShadowPuzzleBoard({
  items = [],
  onComplete,
  onCorrect,
}) {
  const { translations } = useLanguage();
  const t = translations.shadowPuzzle || {};

  const [rounds, setRounds] = useState(() => createRounds(items));
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [solved, setSolved] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(false);

  useEffect(() => {
    setRounds(createRounds(items));
    setRoundIndex(0);
    setSelected(null);
    setSolved(false);
    setWrongAnswer(false);
  }, [items]);

  if (rounds.length === 0) {
    return (
      <p className="shadow-message">
        {t.noContent || "No hay suficientes imágenes para este nivel."}
      </p>
    );
  }

  const currentRound = rounds[roundIndex];

  const handleSelect = (item) => {
    if (solved) return;

    setSelected(item.image);

    if (item.image === currentRound.target.image) {
      setSolved(true);
      setWrongAnswer(false);
      onCorrect?.();
    } else {
      setWrongAnswer(true);
    }
  };

  const handleNext = () => {
    if (roundIndex === rounds.length - 1) {
      onComplete?.();
      return;
    }

    setRoundIndex((current) => current + 1);
    setSelected(null);
    setSolved(false);
    setWrongAnswer(false);
  };

  return (
    <section className="shadow-game">
      <p className="shadow-progress" aria-live="polite">
        {t.progress
          ? t.progress
              .replace("{current}", roundIndex + 1)
              .replace("{total}", rounds.length)
          : `${roundIndex + 1} / ${rounds.length}`}
      </p>

      <h2 className="shadow-instruction">
        {t.instruction || "¿Qué imagen corresponde a esta silueta?"}
      </h2>

      <div className="shadow-target">
        <img
          src={currentRound.target.image}
          alt={t.silhouetteAlt || "Silueta"}
          className="shadow-silhouette"
          draggable="false"
        />
      </div>

      <div className="shadow-options">
        {currentRound.options.map((item, index) => (
          <button
            type="button"
            key={`${item.image}-${index}`}
            className={`shadow-option ${
              selected === item.image
                ? solved
                  ? "is-correct"
                  : "is-wrong"
                : ""
            }`}
            onClick={() => handleSelect(item)}
            disabled={solved}
            aria-label={item.alt}
          >
            <img src={item.image} alt={item.alt} draggable="false" />
          </button>
        ))}
      </div>

      {wrongAnswer && (
        <Alert className="art-music-feedback" severity="warning" role="status">
          {t.tryAgain}
        </Alert>
      )}

      {solved && (
        <>
          <Alert className="shadow-success" role="status">
            <p>{t.correct || "¡Muy bien! Encontraste la imagen correcta."}</p>
          </Alert>
          <AppButton
            type="button"
            className="shadow-next-button"
            onClick={handleNext}
          >
            {roundIndex === rounds.length - 1
              ? t.finish || "Terminar nivel"
              : t.next || "Siguiente"}
          </AppButton>
        </>
      )}
    </section>
  );
}
