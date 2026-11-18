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
import "./LoginPage.css";

export default function LoginPage() {
  const { translations } = useLanguage();
  const t = translations.auth || {};
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="account-page account-page--login">
      <Card className="account-card" component="section">
        <Typography component="h1" variant="h4">{t.loginTitle}</Typography>
        <Typography className="account-description">{t.loginDescription}</Typography>
        <Box component="form" className="account-form" onSubmit={handleSubmit}>
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
            autoComplete="current-password"
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
          <AppButton type="submit" fullWidth>{t.loginButton}</AppButton>
        </Box>
        {submitted && <Alert severity="info">{t.notConnected}</Alert>}
        <Typography className="account-switch">
          {t.noAccount} <Link to="/registrarse">{t.registerLink}</Link>
        </Typography>
      </Card>
    </main>
  );
}
