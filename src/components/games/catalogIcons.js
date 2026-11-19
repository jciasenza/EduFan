import {
  Abc,
  AutoAwesome,
  AutoStories,
  Calculate,
  Extension,
  HistoryEdu,
  MenuBook,
  MusicNote,
  Palette,
  QuestionAnswer,
  Science,
  SportsEsports,
  TextFields,
  Translate,
} from "@mui/icons-material";

const catalogIcons = {
  Abc,
  AutoAwesome,
  AutoStories,
  Calculate,
  Extension,
  HistoryEdu,
  MenuBook,
  MusicNote,
  Palette,
  QuestionAnswer,
  Science,
  SportsEsports,
  TextFields,
  Translate,
};

export default function getCatalogIcon(iconName) {
  return catalogIcons[iconName] || SportsEsports;
}
