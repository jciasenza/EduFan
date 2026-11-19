import React, { useState } from "react";
import {
  Alert,
  Box,
  Card,
  Checkbox,
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
import "../AccountPage.css";
import "./RegisterPage.css";

export default function RegisterPage() {
  const { translations } = useLanguage();
  const { signUp, isConfigured } = useAuth();
  const t = translations.auth || {};
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      setSubmitted(false);
      return;
    }

    setPasswordMismatch(false);
    setError("");
    if (!isConfigured) {
      setError(t.notConnected);
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(name, email, password);
      if (result.session) {
        navigate("/");
      } else {
        setSubmitted(true);
      }
    } catch (signUpError) {
      setError(signUpError.message || t.authError);
    } finally {
      setLoading(false);
    }
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
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
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
          <Box className="account-terms">
            <Checkbox
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              required
              inputProps={{ "aria-labelledby": "register-terms-label" }}
            />
            <Typography id="register-terms-label" component="span">
              {t.termsAcceptancePrefix}{" "}
              <Link to="/terminos-y-condiciones">{t.termsAcceptanceLink}</Link>
            </Typography>
          </Box>
          <AppButton type="submit" fullWidth disabled={loading}>
            {loading ? t.loading : t.registerButton}
          </AppButton>
        </Box>
        {passwordMismatch && <Alert severity="error">{t.passwordMismatch}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {submitted && <Alert severity="success">{t.emailConfirmation}</Alert>}
        <Typography className="account-switch">
          {t.haveAccount} <Link to="/iniciar-sesion">{t.loginLink}</Link>
        </Typography>
      </Card>
    </main>
  );
}
