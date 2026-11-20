
import React from "react";
import "./Loading.css";

export default function Loading({
  message = "¡Preparando tu aventura!",
  size = "medium",
}) {
  return (
    <div
      className={`app-loading app-loading--${size}`}
      role="status"
      aria-live="polite"
    >
      <div className="loading-animation" aria-hidden="true">
        <span className="loading-orbit loading-orbit--one" />
        <span className="loading-orbit loading-orbit--two" />
        <span className="loading-star">★</span>
        <span className="loading-spark">✦</span>
      </div>

      <p className="loading-message">{message}</p>
    </div>
  );
}
