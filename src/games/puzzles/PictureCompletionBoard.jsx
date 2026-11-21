import React, { useState, useRef } from "react";
import { Alert, Button } from "@mui/material";
import { useLanguage } from "../../context/LanguageContext";
import "./PictureCompletionBoard.css";

function getTilePosition(tile, rows, columns) {
  const row = Math.floor(tile / columns);
  const column = tile % columns;

  return {
    backgroundPosition: `${
      columns === 1 ? 0 : (column / (columns - 1)) * 100
    }% ${rows === 1 ? 0 : (row / (rows - 1)) * 100}%`,
    backgroundSize: `${columns * 100}% ${rows * 100}%`,
  };
}

function createRound(rows, columns) {
  const total = rows * columns;
  const missingTile = Math.floor(Math.random() * total);
  const distractors = Array.from({ length: total }, (_, index) => index)
    .filter((index) => index !== missingTile)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const options = [missingTile, ...distractors].sort(() => Math.random() - 0.5);

  return { missingTile, options };
}

export default function PictureCompletionBoard({
  image,
  alt,
  rows,
  columns,
  onStart,
  onComplete,
  onImageError,
}) {
  const [round] = useState(() => createRound(rows, columns));
  const [selected, setSelected] = useState(null);
  const [solved, setSolved] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const { translations } = useLanguage();
  const t = translations.pictureCompletion || {};
  const hasStarted = useRef(false);

  const handleSelect = (tile) => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      onStart?.();
    }
    if (solved) return;

    setSelected(tile);

    if (tile === round.missingTile) {
      setSolved(true);
      setWrongAnswer(false);
      onComplete();
    } else {
      setWrongAnswer(true);
    }
  };

  const backgroundStyle = (tile) => ({
    backgroundImage: `url("${image}")`,
    ...getTilePosition(tile, rows, columns),
  });

  return (
    <section className="picture-completion">
      <img
        className="picture-preload"
        src={image}
        alt=""
        onError={onImageError}
      />

      <h2 className="picture-instruction">{t.instruction}</h2>

      <div
        className="picture-completion-grid"
        style={{
          "--picture-rows": rows,
          "--picture-columns": columns,
        }}
        role="group"
        aria-label={alt}
      >
        {Array.from({ length: rows * columns }, (_, index) =>
          index === round.missingTile && !solved ? (
            <div
              className="picture-missing-piece"
              key={index}
              aria-label={t.missingPiece}
            >
              ?
            </div>
          ) : (
            <div
              className="picture-grid-piece"
              key={index}
              style={backgroundStyle(index)}
            />
          ),
        )}

        {solved && (
          <div className="picture-completed-overlay" aria-hidden="true">
            ✓
          </div>
        )}
      </div>

      <div className="picture-options">
        {round.options.map((tile, index) => (
          <Button
            key={`${tile}-${index}`}
            className={`picture-option ${
              selected === tile
                ? tile === round.missingTile
                  ? "is-correct"
                  : "is-wrong"
                : ""
            }`}
            style={backgroundStyle(tile)}
            onClick={() => handleSelect(tile)}
            disabled={solved}
            aria-label={`${t.option} ${index + 1}`}
          />
        ))}
      </div>

      {wrongAnswer && (
        <Alert className="art-music-feedback" severity="warning" role="status">
          {t.tryAgain}
        </Alert>
      )}
    </section>
  );
}
