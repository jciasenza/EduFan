import React from "react";
import { Box, Card, CardActionArea, Typography } from "@mui/material";
import {
  Abc,
  ArrowForward,
  AutoStories,
  Calculate,
  Extension,
  MusicNote,
  Science,
  HistoryEdu,
  Star,
  SportsEsports,
  Translate,
  QuestionAnswer,
  Palette,
  TextFields,
} from "@mui/icons-material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import AppButton from "../../components/ui/AppButton";
import "./Home.css";

const gameCards = [
  {
    id: "songs",
    key: "songs",
    game: "songs",
    icon: MusicNote,
    color: "orange",
    gameRoute: "/juegos/canciones",
  },
  {
    id: "stories",
    key: "stories",
    game: "stories",
    icon: AutoStories,
    color: "pink",
    gameRoute: "/juegos/cuentos",
  },
  {
    id: "riddles",
    key: "riddles",
    game: "riddles",
    icon: QuestionAnswer,
    color: "purple",
    gameRoute: "/juegos/adivinanzas",
  },
  {
    id: "tongue-twisters",
    key: "tongueTwisters",
    game: "tongueTwisters",
    icon: TextFields,
    color: "blue",
    gameRoute: "/juegos/trabalenguas",
  },
  {
    id: "memory",
    key: "memory",
    game: "memory",
    icon: SportsEsports,
    color: "teal",
    gameRoute: "/juegos/memoria",
  },
  {
    id: "shapes-colors",
    key: "shapesColors",
    game: "shapesColors",
    icon: Palette,
    color: "coral",
    gameRoute: "/juegos/figuras-colores",
  },
  {
    id: "resources",
    key: "resources",
    game: "puzzles",
    icon: Extension,
    color: "purple",
    gameRoute: "/juegos/rompecabezas",
  },
  {
    id: "english",
    key: "english",
    game: "english",
    icon: Translate,
    color: "coral",
  },
  {
    id: "science",
    key: "science",
    game: "science",
    icon: Science,
    color: "yellow",
    gameRoute: "/juegos/ciencia",
  },
  {
    id: "world-history",
    key: "worldHistory",
    game: "worldHistory",
    icon: HistoryEdu,
    color: "purple",
    gameRoute: "/juegos/historia-mundial",
  },
  { id: "math", key: "math", game: "math", icon: Calculate, color: "green" },
  { id: "words", key: "words", game: "words", icon: Abc, color: "blue", gameRoute: "/juegos/contador-palabras" },
];

export default function Home() {
  const { translations } = useLanguage();
  const t = translations.home || {};
  const categoryText = translations.header?.categories || {};
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const selectedCategoryData = gameCards.find(({ id }) => id === selectedCategory);
  const SelectedCategoryIcon = selectedCategoryData?.icon;
  const selectedGames = selectedCategoryData
    ? selectedCategoryData.id === "words"
      ? [
        {
          key: "words",
          route: "/juegos/contador-palabras",
          Icon: Abc,
        },
        {
          key: "scrambledWords",
          route: "/juegos/palabras-revueltas",
          Icon: TextFields,
        },
      ]
      : selectedCategoryData.id === "math"
        ? [
          {
            key: "addition",
            route: "/juegos/matematicas",
            Icon: Calculate,
          },
          {
            key: "numberSeries",
            route: "/juegos/series-numericas",
            Icon: AutoStories,
          },
        ]
      : selectedCategoryData.id === "english"
        ? [
          {
            key: "english",
            route: "/juegos/ingles",
            Icon: Translate,
          },
          {
            key: "spanish",
            route: "/juegos/espanol",
            Icon: Translate,
          },
        ]
      : [{
        key: selectedCategoryData.game,
        route: selectedCategoryData.gameRoute,
        Icon: SelectedCategoryIcon,
      }]
    : [];

  return (
    <main className="kids-home">
      {selectedCategoryData && (
        <>
          <section className={`category-scene category-scene--${selectedCategoryData.id}`}>
            <div className="category-scene-cloud category-scene-cloud--one" />
            <div className="category-scene-cloud category-scene-cloud--two" />
            <span className="category-scene-star category-scene-star--one">★</span>
            <span className="category-scene-star category-scene-star--two">✦</span>
            <div className="category-scene-character" aria-hidden="true">
              <SelectedCategoryIcon />
            </div>
            <div className="category-scene-title-wrap">
              <Typography component="h1" id="selected-category-title">
                {categoryText[selectedCategoryData.key]}
              </Typography>
              <span>{t.categoryDescriptions?.[selectedCategoryData.key] || t.categoryHeroSubtitle}</span>
            </div>
          </section>

          <Box
            className="category-games-section"
            component="section"
            aria-labelledby="category-games-title"
          >
            <Typography component="h2" id="category-games-title">
              {t.categoryGamesTitle}
            </Typography>
            <div className="available-games-grid">
              {selectedGames.map(({ key, route, Icon }) => {
                const gameText = t.games?.[key] || {};
                const cardContent = (
                  <GameCardContent
                    Icon={Icon}
                    game={gameText}
                    comingSoonLabel={!route && t.gameComingSoon}
                  />
                );

                return (
                  <Card
                    className={`available-game-card game-card-${selectedCategoryData.color}`}
                    key={key}
                  >
                    {route ? (
                      <CardActionArea component={Link} to={route} aria-label={gameText.title}>
                        {cardContent}
                      </CardActionArea>
                    ) : cardContent}
                  </Card>
                );
              })}
            </div>
          </Box>
        </>
      )}

      {!selectedCategoryData && (
        <>
          <section className="hero-banner">
            <div className="hero-cloud cloud-one" />
            <div className="hero-cloud cloud-two" />
            <div className="hero-copy">
              <span className="hero-eyebrow"><Star fontSize="small" /> {t.eyebrow}</span>
              <Typography component="h1" variant="h2">{t.title}</Typography>
              <Typography className="hero-subtitle">{t.subtitle}</Typography>
              <AppButton
                className="hero-button"
                onClick={() => navigate("/iniciar-sesion")}
                endIcon={<ArrowForward />}
              >
                {t.start}
              </AppButton>
            </div>
            <div className="hero-illustration" aria-hidden="true">
              <div className="rainbow"><i /><i /><i /><i /></div>
              <div className="book"><span>A</span><span>Á</span></div>
              <div className="pencil">✏️</div>
              <span className="floating-star star-a">★</span>
              <span className="floating-star star-b">★</span>
            </div>
          </section>

          <section className="game-categories" aria-labelledby="game-categories-title">
            <Typography
              id="game-categories-title"
              component="h2"
              className="game-categories-title"
            >
              {t.cardsTitle}
            </Typography>
            <div className="game-card-grid">
              {gameCards.map(({ id, key, icon: GameIcon, color }) => (
                <Card className={`game-category-card game-card-${color}`} key={key}>
                  <CardActionArea
                    component={Link}
                    to={`/?category=${id}`}
                    aria-label={categoryText[key]}
                  >
                    <Box className="game-card-art" aria-hidden="true">
                      <span className="game-card-spark spark-one" />
                      <span className="game-card-spark spark-two" />
                      <span className="game-card-icon"><GameIcon /></span>
                    </Box>
                    <Box className="game-card-caption">
                      <Typography component="h3">{categoryText[key]}</Typography>
                      <Typography component="p">
                        {t.categoryDescriptions?.[key] || ""}
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function GameCardContent({ Icon, game, comingSoonLabel }) {
  return (
    <>
      <Box className="game-card-art" aria-hidden="true">
        <span className="game-card-spark spark-one" />
        <span className="game-card-spark spark-two" />
        <span className="game-card-icon"><Icon /></span>
      </Box>
      <Box className="game-card-caption">
        <Typography component="h3">{game.title}</Typography>
        <Typography component="p">{game.description}</Typography>
        {comingSoonLabel && (
          <Typography component="span" className="game-coming-soon-label">
            {comingSoonLabel}
          </Typography>
        )}
      </Box>
    </>
  );
}
