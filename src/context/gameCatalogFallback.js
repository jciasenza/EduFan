export const fallbackCategories = [
  { id: "art-music", key: "artMusic", icon: "Palette", color: "coral" },
  { id: "stories", key: "stories", icon: "MenuBook", color: "orange" },
  { id: "riddles", key: "riddles", icon: "QuestionAnswer", color: "purple" },
  { id: "tongue-twisters", key: "tongueTwisters", icon: "TextFields", color: "blue" },
  { id: "memory", key: "memory", icon: "SportsEsports", color: "pink" },
  { id: "shapes-colors", key: "shapesColors", icon: "Palette", color: "orange" },
  { id: "resources", key: "resources", icon: "Extension", color: "teal" },
  { id: "english", key: "english", icon: "Translate", color: "purple" },
  { id: "science", key: "science", icon: "Science", color: "green" },
  { id: "world-history", key: "worldHistory", icon: "HistoryEdu", color: "purple" },
  { id: "math", key: "math", icon: "Calculate", color: "blue" },
  { id: "words", key: "words", icon: "TextFields", color: "pink" },
];

export const fallbackGames = [
  { id: "songs", category_id: "art-music", key: "songs", icon: "MusicNote", color: "orange", route: "/juegos/canciones" },
  { id: "art-music-quiz", category_id: "art-music", key: "artMusicQuiz", icon: "AutoAwesome", color: "pink", route: "/juegos/arte-musica" },
  { id: "stories", category_id: "stories", key: "stories", icon: "AutoStories", color: "pink", route: "/juegos/cuentos" },
  { id: "riddles", category_id: "riddles", key: "riddles", icon: "QuestionAnswer", color: "purple", route: "/juegos/adivinanzas" },
  { id: "tongue-twisters", category_id: "tongue-twisters", key: "tongueTwisters", icon: "TextFields", color: "blue", route: "/juegos/trabalenguas" },
  { id: "memory", category_id: "memory", key: "memory", icon: "SportsEsports", color: "teal", route: "/juegos/memoria" },
  { id: "shapes-colors", category_id: "shapes-colors", key: "shapesColors", icon: "Palette", color: "coral", route: "/juegos/figuras-colores" },
  { id: "puzzles", category_id: "resources", key: "puzzles", icon: "Extension", color: "purple", route: "/juegos/rompecabezas" },
  { id: "english", category_id: "english", key: "english", icon: "Translate", color: "coral", route: "/juegos/ingles" },
  { id: "spanish", category_id: "english", key: "spanish", icon: "Translate", color: "coral", route: "/juegos/espanol" },
  { id: "science", category_id: "science", key: "science", icon: "Science", color: "yellow", route: "/juegos/ciencia" },
  { id: "world-history", category_id: "world-history", key: "worldHistory", icon: "HistoryEdu", color: "purple", route: "/juegos/historia-mundial" },
  { id: "math-addition", category_id: "math", key: "addition", icon: "Calculate", color: "green", route: "/juegos/matematicas" },
  { id: "number-series", category_id: "math", key: "numberSeries", icon: "AutoStories", color: "green", route: "/juegos/series-numericas" },
  { id: "word-counter", category_id: "words", key: "words", icon: "Abc", color: "blue", route: "/juegos/contador-palabras" },
  { id: "scrambled-words", category_id: "words", key: "scrambledWords", icon: "TextFields", color: "blue", route: "/juegos/palabras-revueltas" },
];

export function getFallbackCategories(translations) {
  const categoryLabels = translations.header?.categories || {};
  const descriptions = translations.home?.categoryDescriptions || {};
  return fallbackCategories.map((category, sort_order) => ({
    ...category,
    title: categoryLabels[category.key] || category.id,
    description: descriptions[category.key] || "",
    sort_order,
  }));
}

export function getFallbackGames(translations) {
  const gameLabels = translations.home?.games || {};
  return fallbackGames.map((game, sort_order) => ({
    ...game,
    title: gameLabels[game.key]?.title || game.id,
    description: gameLabels[game.key]?.description || "",
    sort_order,
  }));
}
