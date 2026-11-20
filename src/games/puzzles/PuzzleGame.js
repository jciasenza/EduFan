import React, { useEffect, useState } from "react";
import { Alert, Card, Typography } from "@mui/material";
import { AutoAwesome, Extension, RestartAlt } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import supabase from "../../lib/supabaseClient";
import { loadGameLevels, saveGameLevel } from "../gameLevelUtils";
import Loading from "../../components/ui/Loading";
import JigsawBoard from "./JigsawBoard";
import "./JigsawBoard.css";
import "./PuzzleGame.css";

const localPuzzleLevels = {
  1: [
    {
      image: "puzzles/meadow.svg",
      size: 2,
      alt: "Un gatito en un prado verde bajo el sol",
    },
  ],
  2: [
    {
      image: "puzzles/ocean.svg",
      size: 3,
      alt: "Una ballena sonriente en el océano",
    },
  ],
  3: [
    {
      image: "puzzles/space.svg",
      size: 4,
      alt: "Un cohete viaja entre planetas y estrellas",
    },
  ],
};

function isValidPuzzleSet(items, mode) {
  const validPieceCounts = [4, 6, 9, 12, 16];

  const expectedFolder = mode === "jigsaw" ? "dinosaurs" : "animals";

  return (
    Array.isArray(items) &&
    items.length === 5 &&
    items.every((item) => {
      if (
        !item ||
        typeof item.image !== "string" ||
        !new RegExp(`^puzzles/${expectedFolder}/[a-z0-9._-]+\\.png$`, "i").test(
          item.image,
        ) ||
        typeof item.alt !== "string" ||
        !item.alt.trim()
      ) {
        return false;
      }

      const rows = item.rows ?? item.size;
      const columns = item.columns ?? item.size;

      return (
        Number.isSafeInteger(rows) &&
        Number.isSafeInteger(columns) &&
        rows >= 2 &&
        columns >= 2 &&
        validPieceCounts.includes(rows * columns)
      );
    })
  );
}

function getPuzzleGrid(puzzle) {
  return {
    rows: puzzle.rows ?? puzzle.size,
    columns: puzzle.columns ?? puzzle.size,
  };
}

function getImageUrl(image) {
  if (supabase) {
    const { data } = supabase.storage
      .from("edufan-game-assets")
      .getPublicUrl(image);
    return data.publicUrl;
  }
  return `${process.env.PUBLIC_URL}/images/${image}`;
}

export default function PuzzleGame() {
  const { awardPoint, user, loading: authLoading } = useAuth();
  const { language, translations } = useLanguage();
  const toolbarText = translations.gameToolbar || {};
  const navigate = useNavigate();
  const t = translations.puzzleGame || {};
  const activeLanguage = language === "es" ? "es" : "en";
  const [puzzles, setPuzzles] = useState([]);
  const [availableLevels, setAvailableLevels] = useState({});
  const [level, setLevel] = useState(1);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [board, setBoard] = useState(() => createShuffledBoard(2, 2));
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [draggedTile, setDraggedTile] = useState(null);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [usingLocalContent, setUsingLocalContent] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [allLevelsComplete, setAllLevelsComplete] = useState(false);
  const [levelNotice, setLevelNotice] = useState("");
  const [progressError, setProgressError] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);

  const location = useLocation();

  const puzzleConfig = {
    "/juegos/rompecabezas": {
      gameId: "puzzles",
      mode: "sliding",
    },
    "/juegos/puzzle-encastre": {
      gameId: "jigsaw-puzzles",
      mode: "jigsaw",
    },
    "/juegos/completar-imagen": {
      gameId: "picture-puzzles",
      mode: "picture",
    },
    "/juegos/siluetas": {
      gameId: "shadow-puzzles",
      mode: "shadow",
    },
  };

  const { gameId, mode } =
    puzzleConfig[location.pathname] || puzzleConfig["/juegos/rompecabezas"];

  useEffect(() => {
    let active = true;
    if (authLoading)
      return () => {
        active = false;
      };

    const load = async () => {
      setContentError("");
      setContentLoading(true);
      setProgressError("");

      try {
        const result = await loadGameLevels({
          gameId,
          language: activeLanguage,
          user,
          localLevels: localPuzzleLevels,
          validateContent: (items) => isValidPuzzleSet(items, mode),
        });
        if (!active) return;

        const selectedPuzzles = result.levels[result.level];
        const puzzleToShow = result.allLevelsComplete
          ? selectedPuzzles.length - 1
          : 0;
        const selectedPuzzle = selectedPuzzles[puzzleToShow];
        setAvailableLevels(result.levels);
        setPuzzles(selectedPuzzles);
        setLevel(result.level);
        setPuzzleIndex(puzzleToShow);
        const selectedGrid = getPuzzleGrid(selectedPuzzle);
        setBoard(
          result.allLevelsComplete
            ? createSolvedBoard(selectedGrid.rows, selectedGrid.columns)
            : createShuffledBoard(selectedGrid.rows, selectedGrid.columns),
        );
        setMoves(0);
        setScore(0);
        setDraggedTile(null);
        setPuzzleSolved(result.allLevelsComplete);
        setImageError(false);
        setUsingLocalContent(result.usingLocalContent);
        setAllLevelsComplete(result.allLevelsComplete);
      } catch (error) {
        if (!active) return;
        console.error("Could not load puzzle content or game progress:", error);
        setContentError(
          error.stage === "progress" ? t.progressLoadError : t.contentLoadError,
        );
      } finally {
        if (active) setContentLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [
    activeLanguage,
    authLoading,
    gameId,
    retryCount,
    t.contentLoadError,
    t.progressLoadError,
    user,
    mode,
  ]);

  const currentPuzzle = puzzles[puzzleIndex];

  const currentGrid = currentPuzzle
    ? getPuzzleGrid(currentPuzzle)
    : { rows: 2, columns: 2 };

  const totalPieces = currentGrid.rows * currentGrid.columns;

  const emptyIndex = board.indexOf(totalPieces - 1);

  const moveTile = (tileIndex) => {
    if (
      !currentPuzzle ||
      puzzleSolved ||
      !getNeighbors(emptyIndex, currentGrid.rows, currentGrid.columns).includes(
        tileIndex,
      )
    ) {
      return;
    }

    const nextBoard = swapTiles(board, emptyIndex, tileIndex);

    setBoard(nextBoard);
    setMoves((currentMoves) => currentMoves + 1);

    if (nextBoard.every((tile, index) => tile === index)) {
      setPuzzleSolved(true);
      setScore((currentScore) => currentScore + 1);
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

  const restartPuzzle = () => {
    if (!currentPuzzle) return;
    setBoard(createShuffledBoard(currentGrid.rows, currentGrid.columns));
    setMoves(0);
    setDraggedTile(null);
    setPuzzleSolved(false);
    setImageError(false);
    setAllLevelsComplete(false);
    setLevelNotice("");
    setProgressError("");
  };

  const completeLevel = async () => {
    setSavingProgress(true);
    setProgressError("");
    try {
      const completed = await saveGameLevel({
        gameId,
        language: activeLanguage,
        user,
        level,
      });
      const nextLevel = completed + 1;
      if (availableLevels[nextLevel]) {
        const nextPuzzles = availableLevels[nextLevel];
        setPuzzles(nextPuzzles);
        setLevel(nextLevel);
        setPuzzleIndex(0);
        const nextGrid = getPuzzleGrid(nextPuzzles[0]);
        setBoard(createShuffledBoard(nextGrid.rows, nextGrid.columns));
        setMoves(0);
        setScore(0);
        setDraggedTile(null);
        setPuzzleSolved(false);
        setImageError(false);
        setAllLevelsComplete(false);
        setLevelNotice(`${t.levelComplete} ${t.level} ${nextLevel}`);
      } else {
        setAllLevelsComplete(true);
      }
    } catch (error) {
      console.error("Could not save completed puzzle level:", error);
      setProgressError(t.progressSaveError);
    } finally {
      setSavingProgress(false);
    }
  };

  const continueLevel = () => {
    if (puzzleIndex < puzzles.length - 1) {
      const nextIndex = puzzleIndex + 1;
      setPuzzleIndex(nextIndex);
      const nextGrid = getPuzzleGrid(puzzles[nextIndex]);
      setBoard(createShuffledBoard(nextGrid.rows, nextGrid.columns));
      setMoves(0);
      setDraggedTile(null);
      setPuzzleSolved(false);
      setImageError(false);
      return;
    }
    completeLevel();
  };

  return (
    <main className="puzzle-game">
      <Card className="puzzle-card" component="section">
        <GameToolbar
          level={level}
          points={score}
          levelLabel={toolbarText.level || t.level}
          pointsLabel={toolbarText.points}
          exitLabel={toolbarText.exit}
          onExit={() => navigate("/?category=resources")}
        />
        <div className="puzzle-badge" aria-hidden="true">
          <Extension />
        </div>
        <Typography component="h1" variant="h3" className="puzzle-title">
           {mode === "jigsaw" ? t.dinosaursTitle : t.animalsTitle}
        </Typography>
        <Typography className="puzzle-description">{t.description}</Typography>

        {contentLoading ? (
          <div className="puzzle-loading" role="status">
            <Loading aria-label={t.contentLoading} />
            <Typography>{t.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="puzzle-content-error">
            <Alert severity="error" role="alert">
              {contentError}
            </Alert>
            <AppButton onClick={() => setRetryCount((count) => count + 1)}>
              {t.retry}
            </AppButton>
          </div>
        ) : currentPuzzle ? (
          <>
            {usingLocalContent && (
              <Alert className="puzzle-success" severity="info" role="status">
                {t.localContentNotice}
              </Alert>
            )}
            {levelNotice && (
              <Alert
                className="puzzle-success"
                severity="success"
                role="status"
              >
                {levelNotice}
              </Alert>
            )}
            {allLevelsComplete && (
              <Alert
                className="puzzle-success"
                severity="success"
                role="status"
              >
                {t.allLevelsComplete}
              </Alert>
            )}
            {progressError && (
              <Alert className="puzzle-success" severity="error" role="alert">
                {progressError}
              </Alert>
            )}
            {imageError && (
              <Alert className="puzzle-success" severity="error" role="alert">
                {t.imageLoadError}
              </Alert>
            )}

            <div className="puzzle-meta">
              <Typography>
                {t.puzzle} {puzzleIndex + 1} {t.of} {puzzles.length}
                {" · "}
                {t.pieces}: <strong>{totalPieces}</strong>
                {" · "}
                {t.moves}: <strong>{moves}</strong>
              </Typography>
              <AppButton
                variant="secondary"
                startIcon={<RestartAlt />}
                disabled={savingProgress}
                onClick={restartPuzzle}
              >
                {t.restart}
              </AppButton>
            </div>

            {mode === "jigsaw" ? (
              <JigsawBoard
                image={getImageUrl(currentPuzzle.image)}
                alt={currentPuzzle.alt}
                rows={currentGrid.rows}
                columns={currentGrid.columns}
                onComplete={() => {
                  setPuzzleSolved(true);
                  setScore((currentScore) => currentScore + 1);
                  awardPoint("puzzles");
                }}
              />
            ) : (
              <div className="puzzle-play-area">
                <div
                  className="puzzle-board"
                  role="group"
                  aria-label={t.boardLabel}
                  style={{
                    "--puzzle-rows": currentGrid.rows,
                    "--puzzle-columns": currentGrid.columns,
                    "--puzzle-image-size": `${currentGrid.columns * 100}% ${currentGrid.rows * 100}%`,
                    "--puzzle-image": `url("${getImageUrl(currentPuzzle.image)}")`,
                  }}
                >
                  {board.map((tile, index) =>
                    tile === totalPieces - 1 ? (
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
                        style={getTileStyle(
                          tile,
                          currentGrid.rows,
                          currentGrid.columns,
                        )}
                        draggable={!puzzleSolved}
                        disabled={puzzleSolved}
                        onClick={() => moveTile(index)}
                        onDragStart={(event) => {
                          event.dataTransfer.setData(
                            "text/plain",
                            String(index),
                          );
                          event.dataTransfer.effectAllowed = "move";
                          setDraggedTile(index);
                        }}
                        onDragEnd={() => setDraggedTile(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDrop(event, index)}
                      />
                    ),
                  )}
                </div>

                <aside className="puzzle-reference">
                  <Typography component="h2">{t.reference}</Typography>
                  <img
                    src={getImageUrl(currentPuzzle.image)}
                    alt={currentPuzzle.alt}
                    onError={() => setImageError(true)}
                  />
                </aside>
              </div>
            )}
            {puzzleSolved && (
              <>
                {!allLevelsComplete && (
                  <Alert
                    className="puzzle-success"
                    severity="success"
                    role="status"
                  >
                    {t.solved}
                  </Alert>
                )}
                {!allLevelsComplete ? (
                  <AppButton
                    disabled={savingProgress}
                    onClick={continueLevel}
                    endIcon={<AutoAwesome />}
                  >
                    {savingProgress
                      ? t.savingProgress
                      : puzzleIndex < puzzles.length - 1
                        ? t.nextPuzzle
                        : t.finishLevel}
                  </AppButton>
                ) : (
                  <AppButton onClick={restartPuzzle} endIcon={<AutoAwesome />}>
                    {t.playAgain}
                  </AppButton>
                )}
              </>
            )}
          </>
        ) : null}
      </Card>
    </main>
  );
}

function getNeighbors(index, rows, columns) {
  const row = Math.floor(index / columns);
  const column = index % columns;

  return [
    row > 0 ? index - columns : -1,
    row < rows - 1 ? index + columns : -1,
    column > 0 ? index - 1 : -1,
    column < columns - 1 ? index + 1 : -1,
  ].filter((neighbor) => neighbor >= 0);
}

function swapTiles(board, first, second) {
  const nextBoard = [...board];
  [nextBoard[first], nextBoard[second]] = [nextBoard[second], nextBoard[first]];
  return nextBoard;
}

function createSolvedBoard(rows, columns) {
  return Array.from({ length: rows * columns }, (_, index) => index);
}

function createShuffledBoard(rows, columns) {
  const emptyTile = rows * columns - 1;
  const shuffleSteps = rows * columns * 12;

  let board = createSolvedBoard(rows, columns);
  let emptyIndex = emptyTile;
  let previousEmptyIndex = -1;

  for (let step = 0; step < shuffleSteps; step++) {
    const neighbors = getNeighbors(emptyIndex, rows, columns);
    const possibleMoves = [];

    for (let i = 0; i < neighbors.length; i++) {
      if (neighbors[i] !== previousEmptyIndex) {
        possibleMoves.push(neighbors[i]);
      }
    }

    const tileIndex =
      possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    board = swapTiles(board, emptyIndex, tileIndex);

    previousEmptyIndex = emptyIndex;
    emptyIndex = tileIndex;
  }

  return board;
}

function getTileStyle(tile, rows, columns) {
  const row = Math.floor(tile / columns);
  const column = tile % columns;

  const x = columns === 1 ? 0 : (column / (columns - 1)) * 100;
  const y = rows === 1 ? 0 : (row / (rows - 1)) * 100;

  return {
    backgroundPosition: `${x}% ${y}%`,
  };
}
