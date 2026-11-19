import React, { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CircularProgress,
  Typography,
} from "@mui/material";
import { AutoAwesome, Extension, RestartAlt } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import GameToolbar from "../../components/games/GameToolbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import supabase from "../../lib/supabaseClient";
import { loadGameLevels, saveGameLevel } from "../gameLevelUtils";
import "./PuzzleGame.css";

const localPuzzleLevels = {
  1: [{ image: "puzzles/meadow.svg", size: 2, alt: "Un gatito en un prado verde bajo el sol" }],
  2: [{ image: "puzzles/ocean.svg", size: 3, alt: "Una ballena sonriente en el océano" }],
  3: [{ image: "puzzles/space.svg", size: 4, alt: "Un cohete viaja entre planetas y estrellas" }],
};

function isValidPuzzleSet(items) {
  return Array.isArray(items) && items.length > 0 && items.every((item) => (
    item
    && typeof item.image === "string"
    && /^puzzles\/[a-z0-9._/-]+\.(svg|png|jpe?g|webp)$/i.test(item.image)
    && !item.image.split("/").includes("..")
    && Number.isSafeInteger(item.size)
    && item.size >= 2
    && item.size <= 6
    && typeof item.alt === "string"
    && item.alt.trim().length > 0
  ));
}

function getImageUrl(image) {
  if (supabase) {
    const { data } = supabase.storage.from("edufan-game-assets").getPublicUrl(image);
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
  const [board, setBoard] = useState(() => createShuffledBoard(2));
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

  useEffect(() => {
    let active = true;
    if (authLoading) return () => { active = false; };

    const load = async () => {
      setContentError("");
      setContentLoading(true);
      setProgressError("");

      try {
        const result = await loadGameLevels({
          gameId: "puzzles",
          language: activeLanguage,
          user,
          localLevels: localPuzzleLevels,
          validateContent: isValidPuzzleSet,
        });
        if (!active) return;

        const selectedPuzzles = result.levels[result.level];
        const puzzleToShow = result.allLevelsComplete ? selectedPuzzles.length - 1 : 0;
        const selectedPuzzle = selectedPuzzles[puzzleToShow];
        setAvailableLevels(result.levels);
        setPuzzles(selectedPuzzles);
        setLevel(result.level);
        setPuzzleIndex(puzzleToShow);
        setBoard(result.allLevelsComplete
          ? createSolvedBoard(selectedPuzzle.size)
          : createShuffledBoard(selectedPuzzle.size));
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
        setContentError(error.stage === "progress"
          ? t.progressLoadError
          : t.contentLoadError);
      } finally {
        if (active) setContentLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, [
    activeLanguage,
    authLoading,
    retryCount,
    t.contentLoadError,
    t.progressLoadError,
    user,
  ]);

  const currentPuzzle = puzzles[puzzleIndex];
  const emptyIndex = board.indexOf(currentPuzzle ? currentPuzzle.size ** 2 - 1 : -1);

  const moveTile = (tileIndex) => {
    if (!currentPuzzle || puzzleSolved || !getNeighbors(emptyIndex, currentPuzzle.size).includes(tileIndex)) {
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
    setBoard(createShuffledBoard(currentPuzzle.size));
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
        gameId: "puzzles",
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
        setBoard(createShuffledBoard(nextPuzzles[0].size));
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
      setBoard(createShuffledBoard(puzzles[nextIndex].size));
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
        <div className="puzzle-badge" aria-hidden="true"><Extension /></div>
        <Typography component="h1" variant="h3" className="puzzle-title">
          {t.title}
        </Typography>
        <Typography className="puzzle-description">{t.description}</Typography>

        {contentLoading ? (
          <div className="puzzle-loading" role="status">
            <CircularProgress aria-label={t.contentLoading} />
            <Typography>{t.contentLoading}</Typography>
          </div>
        ) : contentError ? (
          <div className="puzzle-content-error">
            <Alert severity="error" role="alert">{contentError}</Alert>
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
              <Alert className="puzzle-success" severity="success" role="status">
                {levelNotice}
              </Alert>
            )}
            {allLevelsComplete && (
              <Alert className="puzzle-success" severity="success" role="status">
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
                {t.pieces}: <strong>{currentPuzzle.size ** 2}</strong>
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

            <div className="puzzle-play-area">
              <div
                className="puzzle-board"
                role="group"
                aria-label={t.boardLabel}
                style={{
                  "--puzzle-size": currentPuzzle.size,
                  "--puzzle-image-size": `${currentPuzzle.size * 100}%`,
                  "--puzzle-image": `url("${getImageUrl(currentPuzzle.image)}")`,
                }}
              >
                {board.map((tile, index) => (
                  tile === currentPuzzle.size ** 2 - 1 ? (
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
                      style={getTileStyle(tile, currentPuzzle.size)}
                      draggable={!puzzleSolved}
                      disabled={puzzleSolved}
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
                  src={getImageUrl(currentPuzzle.image)}
                  alt={currentPuzzle.alt}
                  onError={() => setImageError(true)}
                />
              </aside>
            </div>

            {puzzleSolved && (
              <>
                {!allLevelsComplete && (
                  <Alert className="puzzle-success" severity="success" role="status">
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
                      : (puzzleIndex < puzzles.length - 1 ? t.nextPuzzle : t.finishLevel)}
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

function getNeighbors(index, size) {
  const row = Math.floor(index / size);
  const column = index % size;
  return [
    row > 0 ? index - size : -1,
    row < size - 1 ? index + size : -1,
    column > 0 ? index - 1 : -1,
    column < size - 1 ? index + 1 : -1,
  ].filter((neighbor) => neighbor >= 0);
}

function swapTiles(board, first, second) {
  const nextBoard = [...board];
  [nextBoard[first], nextBoard[second]] = [nextBoard[second], nextBoard[first]];
  return nextBoard;
}

function createSolvedBoard(size) {
  return Array.from({ length: size * size }, (_, index) => index);
}

function createShuffledBoard(size) {
  const emptyTile = size * size - 1;
  const shuffleSteps = size * size * 12;
  let board = createSolvedBoard(size);
  let emptyIndex = emptyTile;
  let previousEmptyIndex = -1;

  for (let step = 0; step < shuffleSteps; step += 1) {
    const possibleMoves = [];
    for (const index of getNeighbors(emptyIndex, size)) {
      if (index !== previousEmptyIndex) possibleMoves.push(index);
    }
    const tileIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    board = swapTiles(board, emptyIndex, tileIndex);
    previousEmptyIndex = emptyIndex;
    emptyIndex = tileIndex;
  }

  if (board.every((tile, index) => tile === index)) {
    const tileIndex = getNeighbors(emptyIndex, size)[0];
    board = swapTiles(board, emptyIndex, tileIndex);
  }

  return board;
}

function getTileStyle(tile, size) {
  const offset = (tileIndex) => `${(tileIndex / (size - 1)) * 100}%`;
  return {
    backgroundPosition: `${offset(tile % size)} ${offset(Math.floor(tile / size))}`,
  };
}
