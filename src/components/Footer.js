import React from "react";
import { Box, Container, IconButton, Stack, Typography } from "@mui/material";
import { GitHub, LinkedIn, Email, WhatsApp } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "./Footer.css";

export default function Footer() {
  const { translations } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <Box component="footer" className="app-footer">
      <Container maxWidth="lg">
        <Stack className="footer-content" direction="row" spacing={2}>
          <Link className="footer-brand" to="/" aria-label="EduFan">
            <img src={`${process.env.PUBLIC_URL}/edufan-icon.png`} alt="EduFan" />
            <Typography component="span" className="footer-slogan">
              {translations.header?.slogan}
            </Typography>
          </Link>
          <Stack className="footer-details" spacing={1}>
            <Stack className="footer-social-links" direction="row" spacing={1}>
              <IconButton className="footer-social-link" href="https://github.com/jciasenza" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GitHub /></IconButton>
              <IconButton className="footer-social-link" href="https://www.linkedin.com/in/juan-carlos-iasenza-8119501a9/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedIn /></IconButton>
              <IconButton className="footer-social-link" href="mailto:iasenzajuancarlos@gmail.com" aria-label="Email"><Email /></IconButton>
              <IconButton className="footer-social-link" href="https://wa.me/541158094982" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsApp /></IconButton>
            </Stack>
            <Typography className="footer-copy" variant="body2">
              © {year} Juan Carlos Iasenza. Todos los derechos reservados.
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
