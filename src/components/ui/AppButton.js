import React from "react";
import { Button } from "@mui/material";
import "./AppButton.css";

export default function AppButton({
  variant = "primary",
  className = "",
  ...props
}) {
  const muiVariant = variant === "secondary" ? "outlined" : "contained";

  return (
    <Button
      {...props}
      variant={muiVariant}
      className={`app-button app-button--${variant} ${className}`.trim()}
    />
  );
}
