import React from "react";
import { Alert, Container, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import legalDocuments from "./legalContent";
import "./LegalPage.css";

const routeNames = {
  "/terminos-y-condiciones": "terminos-y-condiciones",
  "/politica-de-privacidad": "politica-de-privacidad",
  "/terminos-de-pago": "terminos-de-pago",
  "/preguntas-frecuentes": "preguntas-frecuentes",
};

export default function LegalPage() {
  const { language } = useLanguage();
  const { pathname } = useLocation();
  const document = legalDocuments[routeNames[pathname]]?.[language] || legalDocuments[routeNames[pathname]]?.es;

  if (!document) return null;

  return (
    <main className="legal-page">
      <Container maxWidth="md">
        <article className="legal-document">
          <header className="legal-header">
            <Typography component="h1" variant="h3">{document.title}</Typography>
            <Typography className="legal-intro">{document.intro}</Typography>
            <Typography className="legal-updated">{document.updated}</Typography>
          </header>

          {document.faq ? (
            <div className="legal-faq">
              {document.sections.map((section) => (
                <details className="legal-faq-item" key={section.title}>
                  <summary>{section.title}</summary>
                  {section.paragraphs.map((paragraph) => (
                    <Typography component="p" key={paragraph}>{paragraph}</Typography>
                  ))}
                </details>
              ))}
            </div>
          ) : (
            <div className="legal-sections">
              {document.sections.map((section) => (
                <section className="legal-section" key={section.title}>
                  <Typography component="h2" variant="h5">{section.title}</Typography>
                  {section.paragraphs.map((paragraph) => (
                    <Typography component="p" key={paragraph}>{paragraph}</Typography>
                  ))}
                </section>
              ))}
            </div>
          )}

          <Alert className="legal-draft-notice" severity="info">
            {language === "es"
              ? "Borrador informativo: antes de publicar la versión definitiva, EduFan debe completar la identidad legal del operador y un canal oficial de contacto. Se recomienda revisión legal local."
              : "Informational draft: before publishing a final version, EduFan must provide the operator’s legal identity and an official contact channel. Local legal review is recommended."}
          </Alert>
          <nav className="legal-related-links" aria-label={language === "es" ? "Páginas legales relacionadas" : "Related legal pages"}>
            <Link to="/terminos-y-condiciones">{language === "es" ? "Términos y condiciones" : "Terms and conditions"}</Link>
            <Link to="/politica-de-privacidad">{language === "es" ? "Política de privacidad" : "Privacy policy"}</Link>
            <Link to="/terminos-de-pago">{language === "es" ? "Términos de pago" : "Payment terms"}</Link>
            <Link to="/preguntas-frecuentes">{language === "es" ? "Preguntas frecuentes" : "Frequently asked questions"}</Link>
          </nav>
        </article>
      </Container>
    </main>
  );
}
