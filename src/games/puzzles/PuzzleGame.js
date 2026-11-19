import React, { useState } from "react";
import { Alert, Card, Typography } from "@mui/material";
import { AutoAwesome, Extension, RestartAlt } from "@mui/icons-material";
import AppButton from "../../components/ui/AppButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./PuzzleGame.css";

export default function PuzzleGame() {
  const { awardPoint } = useAuth();
  const { translations } = useLanguage();
  const t = translations.puzzleGame || {};
  const [board, setBoard] = useState(createShuffledBoard);
  const [moves, setMoves] = useState(0);
  const [draggedTile, setDraggedTile] = useState(null);
  const solved = board.every((tile, index) => tile === index);
  const emptyIndex = board.indexOf(EMPTY_TILE);

  const moveTile = (tileIndex) => {
    if (solved || !getNeighbors(emptyIndex).includes(tileIndex)) return;
    const nextBoard = swapTiles(board, emptyIndex, tileIndex);
    setBoard(nextBoard);
    setMoves((currentMoves) => currentMoves + 1);
    if (nextBoard.every((tile, index) => tile === index)) {
      awardPoint("puzzles");
    }
  };

  const handleDrop = (event, targetIndex) => {
    event.preventDefault();
    const tileIndex = Number(event.dataTransfer.getData("text/plain"));
    if (Number.isInteger(tileIndex) && targetIndex === emptyIndex) {
      moveTile(tileIndex);
    }
    setDraggedTile(null);
  };

  const restart = () => {
    setBoard(createShuffledBoard());
    setMoves(0);
    setDraggedTile(null);
  };

  return (
    <main className="puzzle-game">
      <Card className="puzzle-card" component="section">
        <div className="puzzle-badge" aria-hidden="true"><Extension /></div>
        <Typography component="h1" variant="h3" className="puzzle-title">
          {t.title}
        </Typography>
        <Typography className="puzzle-description">{t.description}</Typography>

        <div className="puzzle-meta">
          <Typography>{t.moves}: <strong>{moves}</strong></Typography>
          <AppButton
            variant="secondary"
            startIcon={<RestartAlt />}
            onClick={restart}
          >
            {t.restart}
          </AppButton>
        </div>

        <div className="puzzle-play-area">
          <div
            className="puzzle-board"
            role="group"
            aria-label={t.boardLabel}
            style={{ "--puzzle-image": `url("${process.env.PUBLIC_URL}/images/puzzle-meadow.svg")` }}
          >
            {board.map((tile, index) => (
              tile === EMPTY_TILE ? (
                <div
                  className="puzzle-empty-slot"
                  key="empty"
                  aria-label={t.emptySlot}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, index)}
                />
              ) : (
                <button
                  className={`puzzle-piece${draggedTile === index ? " is-dragged" : ""}`}
                  key={tile}
                  type="button"
                  aria-label={`${t.piece} ${tile + 1}`}
                  style={getTileStyle(tile)}
                  draggable={!solved}
                  disabled={solved}
                  onClick={() => moveTile(index)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", String(index));
                    event.dataTransfer.effectAllowed = "move";
                    setDraggedTile(index);
                  }}
                  onDragEnd={() => setDraggedTile(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, index)}
                />
              )
            ))}
          </div>
          <aside className="puzzle-reference">
            <Typography component="h2">{t.reference}</Typography>
            <img
              src={`${process.env.PUBLIC_URL}/images/puzzle-meadow.svg`}
              alt={t.referenceAlt}
            />
          </aside>
        </div>

        {solved && (
          <Alert className="puzzle-success" severity="success" role="status">
            {t.solved}
          </Alert>
        )}
        {solved && (
          <AppButton onClick={restart} endIcon={<AutoAwesome />}>
            {t.playAgain}
          </AppButton>
        )}
      </Card>
    </main>
  );
}

const BOARD_SIZE = 3;
const EMPTY_TILE = BOARD_SIZE * BOARD_SIZE - 1;
const SHUFFLE_STEPS = 80;

function getNeighbors(index) {
  const row = Math.floor(index / BOARD_SIZE);
  const column = index % BOARD_SIZE;
  return [
    row > 0 ? index - BOARD_SIZE : -1,
    row < BOARD_SIZE - 1 ? index + BOARD_SIZE : -1,
    column > 0 ? index - 1 : -1,
    column < BOARD_SIZE - 1 ? index + 1 : -1,
  ].filter((neighbor) => neighbor >= 0);
}

function swapTiles(board, first, second) {
  const nextBoard = [...board];
  [nextBoard[first], nextBoard[second]] = [nextBoard[second], nextBoard[first]];
  return nextBoard;
}

function createShuffledBoard() {
  let board = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => index);
  let emptyIndex = EMPTY_TILE;
  let previousEmptyIndex = -1;

  for (let step = 0; step < SHUFFLE_STEPS; step += 1) {
    const possibleMoves = [];
    for (const index of getNeighbors(emptyIndex)) {
      if (index !== previousEmptyIndex) possibleMoves.push(index);
    }
    const tileIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    board = swapTiles(board, emptyIndex, tileIndex);
    previousEmptyIndex = emptyIndex;
    emptyIndex = tileIndex;
  }

  return board;
}

function getTileStyle(tile) {
  return {
    backgroundPosition: `${(tile % BOARD_SIZE) * 50}% ${Math.floor(tile / BOARD_SIZE) * 50}%`,
  };
}
