import React, { useEffect, useState } from "react";
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
import { Link, useLocation } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "../AccountPage.css";
import "./PasswordRecoveryPage.css";

export default function PasswordRecoveryPage() {
  const { translations } = useLanguage();
  const {
    user,
    loading: authLoading,
    isConfigured,
    requestPasswordReset,
    updatePassword,
  } = useAuth();
  const t = translations.auth || {};
  const { pathname } = useLocation();
  const isResetMode = pathname === "/restablecer-contrasena";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  useEffect(() => {
    setError("");
    setSuccess("");
    setPasswordMismatch(false);
  }, [pathname]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isConfigured) {
      setError(t.notConnected);
      return;
    }

    if (isResetMode && !user) {
      setError(t.resetLinkInvalid);
      return;
    }

    if (isResetMode && password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    setPasswordMismatch(false);
    setLoading(true);
    try {
      if (isResetMode) {
        await updatePassword(password);
        setSuccess(t.passwordUpdated);
      } else {
        await requestPasswordReset(email);
        setSuccess(t.passwordResetSent);
      }
    } catch (recoveryError) {
      setError(recoveryError.message || t.authError);
    } finally {
      setLoading(false);
    }
  };

  const title = isResetMode ? t.resetPasswordTitle : t.forgotPasswordTitle;
  const description = isResetMode ? t.resetPasswordDescription : t.forgotPasswordDescription;

  return (
    <main className="account-page account-page--recovery">
      <Card className="account-card" component="section">
        <Typography component="h1" variant="h4">{title}</Typography>
        <Typography className="account-description">{description}</Typography>
        {isResetMode && !authLoading && !user ? (
          <>
            <Alert severity="warning">{t.resetLinkInvalid}</Alert>
            <Typography className="account-recovery-help">
              <Link to="/recuperar-contrasena">{t.requestNewResetLink}</Link>
            </Typography>
          </>
        ) : success ? (
          <Alert severity="success">{success}</Alert>
        ) : (
          <Box component="form" className="account-form" onSubmit={handleSubmit}>
            {isResetMode ? (
              <>
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
              </>
            ) : (
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
            )}
            {passwordMismatch && (
              <Alert severity="error">{t.passwordMismatch}</Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            <AppButton
              type="submit"
              fullWidth
              disabled={loading || (isResetMode && (authLoading || !user))}
            >
              {loading ? t.loading : (isResetMode ? t.saveNewPassword : t.sendResetLink)}
            </AppButton>
          </Box>
        )}
        <Typography className="account-switch">
          <Link to="/iniciar-sesion">{t.backToLogin}</Link>
        </Typography>
      </Card>
    </main>
  );
}
