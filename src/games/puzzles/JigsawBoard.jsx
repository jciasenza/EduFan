
import React, { useEffect, useRef, useState } from "react";

function edgeSign(row, column, direction) {
  const value =
    Math.sin(
      (row + 1) * 127.1 +
        (column + 1) * 311.7 +
        (direction === "h" ? 74.7 : 159.3),
    ) * 43758.5453;

  return value - Math.floor(value) > 0.5 ? 1 : -1;
}

function getEdge(row, column, side, rows, columns) {
  if (side === "top") {
    return row === 0 ? 0 : -edgeSign(row - 1, column, "h");
  }

  if (side === "bottom") {
    return row === rows - 1 ? 0 : edgeSign(row, column, "h");
  }

  if (side === "left") {
    return column === 0 ? 0 : -edgeSign(row, column - 1, "v");
  }

  return column === columns - 1 ? 0 : edgeSign(row, column, "v");
}

let jigsawIdCounter = 0;

function useStableId() {
  const idRef = useRef(null);

  if (idRef.current === null) {
    jigsawIdCounter += 1;
    idRef.current = `jigsaw-${jigsawIdCounter}`;
  }

  return idRef.current;
}

function edgePath(x1, y1, x2, y2, sign) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const nx = dy / length;
  const ny = -dx / length;
  const height = 19 * sign;

  const point = (position, offset = 0) => ({
    x: x1 + dx * position + nx * offset,
    y: y1 + dy * position + ny * offset,
  });

  const p1 = point(0.32);
  const p2 = point(0.4, height);
  const p3 = point(0.6, height);
  const p4 = point(0.68);

  const format = (p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;

  if (!sign) return `L ${x2} ${y2}`;

  return [
    `L ${format(p1)}`,
    `C ${format(point(0.35, height))} ${format(point(0.37, height))} ${format(p2)}`,
    `C ${format(point(0.46, height * 1.2))} ${format(point(0.54, height * 1.2))} ${format(p3)}`,
    `C ${format(point(0.63, height))} ${format(point(0.65, height))} ${format(p4)}`,
    `L ${x2} ${y2}`,
  ].join(" ");
}

function getPiecePath(row, column, rows, columns) {
  const top = getEdge(row, column, "top", rows, columns);
  const right = getEdge(row, column, "right", rows, columns);
  const bottom = getEdge(row, column, "bottom", rows, columns);
  const left = getEdge(row, column, "left", rows, columns);

  return [
    "M 0 0",
    edgePath(0, 0, 100, 0, top),
    edgePath(100, 0, 100, 100, right),
    edgePath(100, 100, 0, 100, bottom),
    edgePath(0, 100, 0, 0, left),
    "Z",
  ].join(" ");
}

function shuffle(items) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function PuzzlePiece({
  image,
  alt,
  index,
  rows,
  columns,
  id,
}) {
  const row = Math.floor(index / columns);
  const column = index % columns;
  const path = getPiecePath(row, column, rows, columns);
  const clipId = `${id}-clip`;

  return (
    <svg
      className="jigsaw-piece-svg"
      viewBox="-22 -22 144 144"
      preserveAspectRatio="none"
      role="img"
      aria-label={alt}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={path} />
        </clipPath>
      </defs>

      <image
        href={image}
        x={-column * 100}
        y={-row * 100}
        width={columns * 100}
        height={rows * 100}
        preserveAspectRatio="none"
        clipPath={`url(#${clipId})`}
      />

      <path
        d={path}
        className="jigsaw-piece-outline"
        pointerEvents="none"
      />
    </svg>
  );
}

export default function JigsawBoard({
  image,
  alt,
  rows,
  columns,
  onComplete,
}) {
  const id = useStableId();
  const totalPieces = rows * columns;

  const [pieceOrder, setPieceOrder] = useState(() =>
    shuffle(Array.from({ length: totalPieces }, (_, i) => i)),
  );

  const [placed, setPlaced] = useState(() => new Set());
  const [drag, setDrag] = useState(null);

  const dragRef = useRef(null);

  useEffect(() => {
    setPieceOrder(
      shuffle(Array.from({ length: totalPieces }, (_, i) => i)),
    );
    setPlaced(new Set());
    setDrag(null);
    dragRef.current = null;
  }, [image, rows, columns, totalPieces]);

  // Iniciar el arrastre.
  const handlePointerDown = (event, pieceIndex) => {
    if (dragRef.current || placed.has(pieceIndex)) return;

    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();

    const initialDrag = {
      pieceIndex,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };

    dragRef.current = initialDrag;
    setDrag(initialDrag);
  };

  // Escuchar los movimientos directamente en window.
  useEffect(() => {
    if (!drag) return;

    const handlePointerMove = (event) => {
      const current = dragRef.current;

      if (!current || current.pointerId !== event.pointerId) return;

      event.preventDefault();

      const nextDrag = {
        ...current,
        x: event.clientX,
        y: event.clientY,
      };

      dragRef.current = nextDrag;
      setDrag(nextDrag);
    };

    const handlePointerUp = (event) => {
      const current = dragRef.current;

      if (!current || current.pointerId !== event.pointerId) return;

      const element = document.elementFromPoint(
        event.clientX,
        event.clientY,
      );

      const slot = element?.closest("[data-jigsaw-slot]");
      const targetIndex = slot
        ? Number(slot.dataset.jigsawSlot)
        : -1;

      if (
        targetIndex === current.pieceIndex &&
        !placed.has(current.pieceIndex)
      ) {
        const nextPlaced = new Set(placed);
        nextPlaced.add(current.pieceIndex);

        setPlaced(nextPlaced);

        if (nextPlaced.size === totalPieces) {
          onComplete?.();
        }
      }

      dragRef.current = null;
      setDrag(null);
    };

    const handlePointerCancel = (event) => {
      const current = dragRef.current;

      if (!current || current.pointerId !== event.pointerId) return;

      dragRef.current = null;
      setDrag(null);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [drag, placed, totalPieces, onComplete]);

  return (
    <section className="jigsaw-game">
      <div className="jigsaw-board-area">
        <h2 className="jigsaw-section-title">
          Completá el dinosaurio
        </h2>

        <div
          className="jigsaw-board"
          style={{
            "--jigsaw-rows": rows,
            "--jigsaw-columns": columns,
            aspectRatio: `${columns} / ${rows}`,
          }}
        >
          {Array.from({ length: totalPieces }, (_, index) => {
            const row = Math.floor(index / columns);
            const column = index % columns;
            const path = getPiecePath(row, column, rows, columns);

            return (
              <div
                className={`jigsaw-slot ${
                  placed.has(index) ? "is-filled" : ""
                }`}
                key={index}
                data-jigsaw-slot={index}
              >
                {!placed.has(index) ? (
                  <svg
                    className="jigsaw-slot-svg"
                    viewBox="-22 -22 144 144"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d={path} />
                  </svg>
                ) : (
                  <PuzzlePiece
                    image={image}
                    alt={alt}
                    index={index}
                    rows={rows}
                    columns={columns}
                    id={`${id}-placed-${index}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="jigsaw-tray-area">
        <h2 className="jigsaw-section-title">
          Arrastrá las piezas
        </h2>

        <div className="jigsaw-tray">
          {pieceOrder
            .filter((index) => !placed.has(index))
            .map((index) => (
              <div
                className={`jigsaw-tray-piece ${
                  drag?.pieceIndex === index ? "is-dragging" : ""
                }`}
                key={index}
                onPointerDown={(event) =>
                  handlePointerDown(event, index)
                }
              >
                <PuzzlePiece
                  image={image}
                  alt={`${alt}, pieza ${index + 1}`}
                  index={index}
                  rows={rows}
                  columns={columns}
                  id={`${id}-tray-${index}`}
                />
              </div>
            ))}
        </div>
      </div>

      {/* Pieza flotante: no bloquea la detección del casillero */}
      {drag && (
        <div
          className="jigsaw-drag-ghost"
          style={{
            left: drag.x - drag.offsetX,
            top: drag.y - drag.offsetY,
            width: drag.width,
            height: drag.height,
          }}
        >
          <PuzzlePiece
            image={image}
            alt={alt}
            index={drag.pieceIndex}
            rows={rows}
            columns={columns}
            id={`${id}-drag-ghost`}
          />
        </div>
      )}

      <p className="jigsaw-progress" aria-live="polite">
        {placed.size} de {totalPieces} piezas colocadas
      </p>
    </section>
  );
}
