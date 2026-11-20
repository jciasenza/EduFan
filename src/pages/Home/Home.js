import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Typography,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { ArrowForward, Star } from "@mui/icons-material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useGameCatalog } from "../../context/GameCatalogContext";
import AppButton from "../../components/ui/AppButton";
import getCatalogIcon from "../../components/games/catalogIcons";
import Loading from "../../components/ui/Loading";
import "./Home.css";

export default function Home() {
  const { translations } = useLanguage();
  const t = translations.home || {};
  const {
    categories,
    games,
    loading: catalogLoading,
    error: catalogError,
    retry,
  } = useGameCatalog();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const selectedCategory = searchParams.get("category");
  const selectedCategoryData = categories.find(
    ({ id }) => id === selectedCategory,
  );
  const selectedGames = selectedCategoryData
    ? games.filter((game) => game.category_id === selectedCategoryData.id)
    : [];

  return (
    <main className="kids-home">
      {selectedCategoryData && (
        <>
          <section
            className={`category-scene category-scene--${selectedCategoryData.id}`}
          >
            <div className="category-scene-cloud category-scene-cloud--one" />
            <div className="category-scene-cloud category-scene-cloud--two" />
            <span className="category-scene-star category-scene-star--one">
              ★
            </span>
            <span className="category-scene-star category-scene-star--two">
              ✦
            </span>
            <div className="category-scene-character" aria-hidden="true">
              {categoryImageFiles[selectedCategoryData.id] &&
                process.env.REACT_APP_SUPABASE_URL && (
                  <img
                    className="game-category-image"
                    src={`${process.env.REACT_APP_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/edufan-game-assets/categories/${categoryImageFiles[selectedCategoryData.id]}`}
                    alt=""
                    loading="lazy"
                    onError={(event) => event.currentTarget.remove()}
                  />
                )}
            </div>
            <div className="category-scene-title-wrap">
              <Typography component="h1" id="selected-category-title">
                {selectedCategoryData.title}
              </Typography>
              <span>
                {selectedCategoryData.description || t.categoryHeroSubtitle}
              </span>
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
              {selectedGames.map((game) => {
                const GameIcon = getCatalogIcon(game.icon);
                const cardContent = (
                  <GameCardContent
                    Icon={GameIcon}
                    game={game}
                    comingSoonLabel={!game.route && t.gameComingSoon}
                  />
                );

                return (
                  <Card
                    className={`available-game-card game-card-${game.color}`}
                    key={game.id}
                  >
                    {game.route ? (
                      <CardActionArea
                        component={Link}
                        to={game.route}
                        aria-label={game.title}
                      >
                        {cardContent}
                      </CardActionArea>
                    ) : (
                      cardContent
                    )}
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
              <span className="hero-eyebrow">
                <Star fontSize="small" /> {t.eyebrow}
              </span>
              <Typography component="h1" variant="h2">
                {t.title}
              </Typography>
              <Typography className="hero-subtitle">{t.subtitle}</Typography>
              <AppButton
                className="hero-button"
                onClick={() => navigate(user ? "/plus" : "/iniciar-sesion")}
                endIcon={<ArrowForward />}
              >
                {t.start}
              </AppButton>
            </div>
            <div className="hero-illustration" aria-hidden="true">
              <div className="rainbow">
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="book">
                <img
                  className="home-logo"
                  src={`${process.env.PUBLIC_URL}/edufan-logo.png`}
                  alt=""
                />
              </div>
              <div className="pencil">✏️</div>
              <span className="floating-star star-a">★</span>
              <span className="floating-star star-b">★</span>
            </div>
          </section>

          {catalogLoading && <Loading message={t.catalogLoading} />}
          {catalogError && (
            <Alert
              severity="error"
              role="alert"
              action={
                <Button color="inherit" size="small" onClick={retry}>
                  {t.catalogRetry}
                </Button>
              }
            >
              {catalogError}
            </Alert>
          )}

          <section
            className="game-categories"
            aria-labelledby="game-categories-title"
          >
            <Typography
              id="game-categories-title"
              component="h2"
              className="game-categories-title"
            >
              {t.cardsTitle}
            </Typography>
            <div className="game-card-grid">
              {categories.map((category) => {
                const GameIcon = getCatalogIcon(category.icon);
                return (
                  <Card
                    className={`game-category-card game-card-${category.color}`}
                    key={category.id}
                  >
                    <CardActionArea
                      component={Link}
                      to={`/?category=${category.id}`}
                      aria-label={category.title}
                    >
                      <Box className="game-card-art" aria-hidden="true">
                        <span className="game-card-spark spark-one" />
                        <span className="game-card-spark spark-two" />
                        <span className="game-card-icon">
                          <GameIcon />
                        </span>
                        {categoryImageFiles[category.id] &&
                          process.env.REACT_APP_SUPABASE_URL && (
                            <img
                              className="game-category-image"
                              src={`${process.env.REACT_APP_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/edufan-game-assets/categories/${categoryImageFiles[category.id]}`}
                              alt=""
                              loading="lazy"
                              onError={(event) => event.currentTarget.remove()}
                            />
                          )}
                      </Box>
                      <Box className="game-card-caption">
                        <Typography component="h3">{category.title}</Typography>
                        <Typography component="p">
                          {category.description}
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                );
              })}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

const categoryImageFiles = {
  "art-music": "musica_arte.svg",
  stories: "cuentos.svg",
  riddles: "adivinanzas.svg",
  "tongue-twisters": "trabalenguas.svg",
  memory: "memoria.svg",
  "shapes-colors": "formas_colores.svg",
  resources: "rompecabezas.svg",
  english: "idiomas.svg",
  science: "ciencia.svg",
  "world-history": "historia.svg",
  math: "matematicas.svg",
  words: "palabras.svg",
};

function GameCardContent({ Icon, game, comingSoonLabel }) {
  return (
    <>
      <Box className="game-card-art" aria-hidden="true">
        <span className="game-card-spark spark-one" />
        <span className="game-card-spark spark-two" />
        <span className="game-card-icon">
          <Icon />
        </span>
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
