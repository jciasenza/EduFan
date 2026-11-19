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
import { Link, useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./LoginPage.css";

export default function LoginPage() {
  const { translations } = useLanguage();
  const { signIn, isConfigured } = useAuth();
  const t = translations.auth || {};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!isConfigured) {
      setError(t.notConnected);
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (signInError) {
      setError(signInError.message || t.authError);
    } finally {
      setLoading(false);
    }
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            fullWidth
            required
            type={showPassword ? "text" : "password"}
            name="password"
            label={t.password}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
          <AppButton type="submit" fullWidth disabled={loading}>
            {loading ? t.loading : t.loginButton}
          </AppButton>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        <Typography className="account-switch">
          {t.noAccount} <Link to="/registrarse">{t.registerLink}</Link>
        </Typography>
      </Card>
    </main>
  );
}
