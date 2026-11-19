import React from "react";
import { IconButton, Typography } from "@mui/material";
import { Close, EmojiEvents } from "@mui/icons-material";
import "./GameToolbar.css";

export default function GameToolbar({ level, points, levelLabel, pointsLabel, exitLabel, onExit }) {
  return (
    <div className="game-toolbar">
      <div className="game-toolbar-stats">
        <Typography className="game-toolbar-stat">
          {levelLabel} {level}
        </Typography>
        <Typography className="game-toolbar-stat game-toolbar-points">
          <EmojiEvents aria-hidden="true" />
          {pointsLabel}: {points}
        </Typography>
      </div>
      <IconButton
        className="game-toolbar-exit"
        onClick={onExit}
        aria-label={exitLabel}
        title={exitLabel}
      >
        <Close />
      </IconButton>
    </div>
  );
}
