import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Alert, Box, Card, Typography } from "@mui/material";
import {
  AllInclusive,
  AutoAwesome,
  CheckCircle,
  CloudDone,
  EmojiEvents,
  LockOpen,
  NewReleases,
  WorkspacePremium,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import { useLanguage } from "../../context/LanguageContext";
import "./PlusPage.css";

const benefits = [
  { key: "allGames", icon: LockOpen },
  { key: "unlimitedLevels", icon: AllInclusive },
  { key: "adFree", icon: CheckCircle },
  { key: "specialAchievements", icon: EmojiEvents },
  { key: "weeklyContent", icon: NewReleases },
  { key: "cloudProgress", icon: CloudDone },
];

export default function PlusPage() {
  const { translations } = useLanguage();
  const t = translations.plusPage || {};
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const plans = [
    {
      id: "monthly",
      price: "4",
      period: t.perMonth,
      billing: t.monthlyBilling,
    },
    {
      id: "yearly",
      price: "40",
      period: t.perYear,
      billing: t.yearlyBilling,
      monthlyEquivalent: t.monthlyEquivalent,
      popular: true,
    },
  ];

  return (
    <main className="plus-page">
      <section className="plus-hero">
        <span
          className="plus-hero-spark plus-hero-spark--one"
          aria-hidden="true"
        >
          ✦
        </span>
        <span
          className="plus-hero-spark plus-hero-spark--two"
          aria-hidden="true"
        >
          ★
        </span>
        <div className="plus-hero-copy">
          <span className="plus-eyebrow">
            <WorkspacePremium aria-hidden="true" />
            {t.eyebrow}
          </span>
          <Typography component="h1" variant="h2">
            {t.title}
          </Typography>
          <Typography className="plus-hero-description">
            {t.description}
          </Typography>
          <AppButton
            className="plus-hero-button"
            href="#plus-plans"
            endIcon={<AutoAwesome />}
          >
            {t.viewPlans}
          </AppButton>
        </div>
        <div className="plus-hero-art" aria-hidden="true">
          <div className="plus-orbit plus-orbit--one" />
          <div className="plus-orbit plus-orbit--two" />
          <div className="plus-crown">👑</div>
          <div className="plus-star plus-star--one">★</div>
          <div className="plus-star plus-star--two">✦</div>
        </div>
      </section>

      <section
        className="plus-benefits-section"
        aria-labelledby="plus-benefits-title"
      >
        <Typography component="h2" id="plus-benefits-title">
          {t.benefitsTitle}
        </Typography>
        <Typography className="plus-section-description">
          {t.benefitsDescription}
        </Typography>
        <div className="plus-benefits-grid">
          {benefits.map(({ key, icon: BenefitIcon }) => (
            <Card className="plus-benefit-card" key={key} component="article">
              <span className={`plus-benefit-icon plus-benefit-icon--${key}`}>
                <BenefitIcon aria-hidden="true" />
              </span>
              <Typography component="h3">{t.benefits?.[key]}</Typography>
            </Card>
          ))}
        </div>
      </section>

      <Box
        className="plus-plans-section"
        component="section"
        id="plus-plans"
        aria-labelledby="plus-plans-title"
      >
        <Typography component="h2" id="plus-plans-title">
          {t.plansTitle}
        </Typography>
        <Typography className="plus-section-description">
          {t.plansDescription}
        </Typography>

        <div className="plus-plan-grid">
          {plans.map((plan) => (
            <Card
              className={[
                "plus-plan-card",
                plan.popular ? "plus-plan-card--popular" : "",
                selectedPlan === plan.id ? "plus-plan-card--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={plan.id}
              component="article"
            >
              {plan.popular && (
                <span className="plus-plan-popular">{t.popular}</span>
              )}
              <Typography component="h3">{t.plans?.[plan.id]}</Typography>
              <Typography className="plus-plan-billing">
                {plan.billing}
              </Typography>
              <div className="plus-plan-price">
                <span className="plus-currency">US$</span>
                <strong>{plan.price}</strong>
                <span className="plus-plan-period">{plan.period}</span>
              </div>
              {plan.monthlyEquivalent && (
                <Typography className="plus-plan-equivalent">
                  {plan.monthlyEquivalent}
                </Typography>
              )}
              {plan.id === "yearly" && (
                <span className="plus-plan-savings">{t.savings}</span>
              )}
              <ul className="plus-plan-includes">
                {benefits.map(({ key }) => (
                  <li key={key}>
                    <CheckCircle aria-hidden="true" />
                    <span>{t.benefits?.[key]}</span>
                  </li>
                ))}
              </ul>
              <AppButton
                className="plus-plan-button"
                variant={plan.popular ? "primary" : "secondary"}
                aria-pressed={selectedPlan === plan.id}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {selectedPlan === plan.id ? t.selected : t.choosePlan}
              </AppButton>
            </Card>
          ))}
        </div>

        {selectedPlan && (
          <Alert className="plus-checkout-note" severity="info" role="status">
            <span>{t.checkoutUnavailable}</span>{" "}
            <Link to="/registrarse">{t.createAccount}</Link>
          </Alert>
        )}
      </Box>

      <section className="plus-bottom-cta">
        <span aria-hidden="true">🌈</span>
        <div>
          <Typography component="h2">{t.bottomTitle}</Typography>
          <Typography>{t.bottomDescription}</Typography>
        </div>
        <AppButton
          className="hero-button"
          onClick={() => navigate(user ? "/home" : "/registrarse")}
          endIcon={<AutoAwesome />}
        >
          {user ? t.categoryTitle : t.createAccount}
        </AppButton>
      </section>
    </main>
  );
}
