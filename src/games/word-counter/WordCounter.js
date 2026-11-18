import React, { useRef, useState } from "react";
import { Box, Card, Stack, TextField, Typography } from "@mui/material";
import { AutoStories, Backspace, Calculate, Spellcheck, TextFields, HelpOutline } from "@mui/icons-material";
import { useLanguage } from "../../context/LanguageContext";
import AppButton from "../../components/ui/AppButton";
import "./WordCounter.css";

const COMMON_ENGLISH_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do", "for",
  "from", "he", "her", "him", "his", "i", "in", "is", "it", "me", "my", "of",
  "on", "or", "our", "she", "that", "the", "their", "them", "they", "this",
  "to", "us", "was", "we", "were", "what", "when", "where", "who", "will",
  "with", "yes", "you", "your",
]);

const COMMON_SPANISH_WORDS = new Set([
  "a", "al", "algo", "como", "con", "de", "del", "el", "ella", "ellas", "ellos",
  "en", "es", "esta", "está", "estas", "estás", "estoy", "la", "las", "lo", "los",
  "me", "mi", "muy", "no", "nos", "o", "para", "pero", "por", "que", "se", "si",
  "sí", "soy", "su", "te", "tengo", "tu", "tú", "un", "una", "y", "yo", "hola",
]);

const splitIntoBatches = (items, size) => {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
};

async function findWordsInBothDictionaries(words) {
  const batches = splitIntoBatches(words, 50);
  const results = await Promise.all(batches.map(async (batch) => {
    const params = new URLSearchParams({
      action: "query",
      titles: batch.join("|"),
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
      formatversion: "2",
      format: "json",
      origin: "*",
    });
    const response = await fetch(`https://en.wiktionary.org/w/api.php?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`El diccionario respondió con el estado ${response.status}`);
    }

    const data = await response.json();
    return data.query.pages.map((page) => {
      const content = page.revisions?.[0]?.slots?.main?.content || "";
      const sections = Array.from(
        content.matchAll(/^==([^=].*?)==\s*$/gm),
        (match) => match[1].trim().toLocaleLowerCase("en"),
      );
      return {
        word: page.title.toLocaleLowerCase("en"),
        spanish: sections.includes("spanish"),
        english: sections.includes("english"),
      };
    });
  }));

  return new Map(results.flat().map((entry) => [entry.word, entry]));
}

export default function WordCounter() {
  const { language, translations } = useLanguage();
  const es = language === "es";
  const counterText = translations.counter || {};
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [dictionaryError, setDictionaryError] = useState("");
  const requestId = useRef(0);

  const contarPalabras = async () => {
    const currentRequestId = ++requestId.current;
    const palabras = texto.normalize("NFC").match(/[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*/gu) || [];
    const letras = texto.normalize("NFC").match(/\p{L}/gu) || [];
    const palabrasUnicas = Array.from(new Set(palabras.map((palabra) => palabra.toLocaleLowerCase("es"))));
    setResultado({
      palabras: palabras.length,
      letras: letras.length,
      palabrasEspanol: null,
      palabrasIngles: null,
      desconocidas: [],
    });
    setDictionaryError("");

    if (!palabrasUnicas.length) {
      setResultado((actual) => ({ ...actual, palabrasEspanol: 0, palabrasIngles: 0 }));
      return;
    }

    setIsChecking(true);
    try {
      const dictionaryEntries = await findWordsInBothDictionaries(palabrasUnicas);
      if (requestId.current !== currentRequestId) return;
      const classifications = new Map(palabrasUnicas.map((word) => {
        const entry = dictionaryEntries.get(word);
        if (!entry || (!entry.spanish && !entry.english)) return [word, null];
        if (entry.spanish && entry.english) {
          // Wiktionary has valid entries for some words in both languages.
          if (COMMON_SPANISH_WORDS.has(word)) return [word, "es"];
          if (COMMON_ENGLISH_WORDS.has(word)) return [word, "en"];
          return [word, language];
        }
        return [word, entry.spanish ? "es" : "en"];
      }));
      setResultado((actual) => ({
        ...actual,
        palabrasEspanol: palabras.filter((word) => classifications.get(word.toLocaleLowerCase("en")) === "es").length,
        palabrasIngles: palabras.filter((word) => classifications.get(word.toLocaleLowerCase("en")) === "en").length,
        desconocidas: palabrasUnicas.filter((word) => classifications.get(word) === null),
      }));
    } catch (error) {
      if (requestId.current !== currentRequestId) return;
      console.error("No se pudo consultar Wikcionario:", error);
      setDictionaryError(counterText.dictionaryError || (es
        ? "No se pudo consultar el diccionario. Revisa tu conexión e inténtalo otra vez."
        : "The dictionary could not be reached. Check your connection and try again."));
    } finally {
      if (requestId.current === currentRequestId) setIsChecking(false);
    }
  };

  const borrarPalabras = () => {
    requestId.current += 1;
    setIsChecking(false);
    setTexto("");
    setResultado(null);
    setDictionaryError("");
  };

  return (
    <main className="game-container">
      <Card className="counter-card" component="section" elevation={3}>
        <Box className="game-badge" aria-hidden="true"><AutoStories /></Box>
        <Typography id="game-title" component="h2" variant="h3">
          {counterText.title || (es ? "Contador de Palabras" : "Word Counter")}
        </Typography>
        <Typography className="game-description">
          {counterText.description || (es ? "Escribe un párrafo y descubre cuántas palabras contiene." : "Write a paragraph and discover how many words it contains.")}
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={7}
          label={counterText.inputLabel || (es ? "Tu texto" : "Your text")}
          placeholder={counterText.placeholder || (es ? "Escribe aquí tu historia..." : "Write your story here...")}
          value={texto}
          onChange={(event) => {
            requestId.current += 1;
            setIsChecking(false);
            setTexto(event.target.value);
            setResultado(null);
            setDictionaryError("");
          }}
        />

        <Stack className="game-actions" direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <AppButton size="large" startIcon={<Calculate />} onClick={contarPalabras} disabled={isChecking}>
            {isChecking
              ? (counterText.checking || (es ? "Buscando..." : "Checking..."))
              : (counterText.countButton || (es ? "Contar" : "Count"))}
          </AppButton>
          <AppButton variant="secondary" size="large" startIcon={<Backspace />} onClick={borrarPalabras}>
            {counterText.clearButton || (es ? "Borrar" : "Clear")}
          </AppButton>
        </Stack>

        {resultado !== null && (
          <Box className="result-box" role="status" aria-live="polite">
            <Box className="result-metric">
              <Spellcheck aria-hidden="true" />
              <span className="result-number">{resultado.palabras}</span>
              <strong>{counterText.words || (es ? "palabras" : "words")}</strong>
            </Box>
            <Box className="result-metric">
              <TextFields aria-hidden="true" />
              <span className="result-number">{resultado.letras}</span>
              <strong>{counterText.letters || (es ? "letras" : "letters")}</strong>
            </Box>
            {resultado.palabrasEspanol !== null && (
              <>
                <Box className="result-metric language-result">
                  <span className="result-number">{resultado.palabrasEspanol}</span>
                  <strong>{counterText.spanish || (es ? "español" : "Spanish")}</strong>
                </Box>
                <Box className="result-metric language-result">
                  <span className="result-number">{resultado.palabrasIngles}</span>
                  <strong>{counterText.english || (es ? "inglés" : "English")}</strong>
                </Box>
              </>
            )}
          </Box>
        )}
        {resultado?.palabrasEspanol !== null && resultado?.palabrasEspanol !== undefined
          && resultado.desconocidas.length > 0 && (
            <Box className="dictionary-results" role="status" aria-live="polite">
              <Typography className="unknown-words">
                <HelpOutline fontSize="small" />
                <strong>{counterText.notFound || (es ? "No encontradas" : "Not found")}:</strong>
                {" "}{resultado.desconocidas.join(", ")}
              </Typography>
            </Box>
        )}
        {dictionaryError && <Typography className="dictionary-error" role="alert">{dictionaryError}</Typography>}
      </Card>
    </main>
  );
}
