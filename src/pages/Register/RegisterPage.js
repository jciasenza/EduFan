import React, { useState } from "react";
import {
  Alert,
  Box,
  Card,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import { useLanguage } from "../../context/LanguageContext";
import "./RegisterPage.css";

export default function RegisterPage() {
  const { translations } = useLanguage();
  const t = translations.auth || {};
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      setSubmitted(false);
      return;
    }

    setPasswordMismatch(false);
    setSubmitted(true);
  };

  return (
    <main className="account-page account-page--register">
      <Card className="account-card" component="section">
        <Typography component="h1" variant="h4">{t.registerTitle}</Typography>
        <Typography className="account-description">{t.registerDescription}</Typography>
        <Box component="form" className="account-form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            name="name"
            label={t.name}
            autoComplete="name"
          />
          <TextField
            fullWidth
            required
            type="email"
            name="email"
            label={t.email}
            autoComplete="email"
          />
          <TextField
            fullWidth
            required
            type={showPassword ? "text" : "password"}
            name="password"
            label={t.password}
            autoComplete="new-password"
            inputProps={{ minLength: 8 }}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setPasswordMismatch(false);
              setSubmitted(false);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? t.hidePassword : t.showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            required
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            label={t.confirmPassword}
            autoComplete="new-password"
            inputProps={{ minLength: 8 }}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setPasswordMismatch(false);
              setSubmitted(false);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showConfirmPassword ? t.hidePassword : t.showPassword}
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <AppButton type="submit" fullWidth>{t.registerButton}</AppButton>
        </Box>
        {passwordMismatch && <Alert severity="error">{t.passwordMismatch}</Alert>}
        {submitted && <Alert severity="info">{t.notConnected}</Alert>}
        <Typography className="account-switch">
          {t.haveAccount} <Link to="/iniciar-sesion">{t.loginLink}</Link>
        </Typography>
      </Card>
    </main>
  );
}
