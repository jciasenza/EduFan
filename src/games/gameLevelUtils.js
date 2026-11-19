import supabase from "../lib/supabaseClient";

function getLocalCompletedLevel(gameId) {
  const storedProgress = localStorage.getItem(`game-progress:${gameId}:1`);
  if (storedProgress === null) return 0;
  const completedLevel = Number(storedProgress);
  if (!Number.isSafeInteger(completedLevel) || completedLevel < 0) {
    throw new Error(`Stored ${gameId} progress is invalid.`);
  }
  return completedLevel;
}

export async function loadGameLevels({
  gameId,
  language,
  user,
  localLevels,
  validateContent,
}) {
  let levels = localLevels;
  const usingLocalContent = !supabase;
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("game_content")
        .select("content, level")
        .eq("game_id", gameId)
        .eq("language", language)
        .eq("volume", 1)
        .eq("is_published", true)
        .order("level");
      if (error) throw error;
      if (!data?.length) {
        throw new Error(`No published ${gameId} content found (${language}).`);
      }

      levels = {};
      data.forEach((row) => {
        if (!Number.isSafeInteger(row.level) || row.level < 1
          || !validateContent(row.content)) {
          throw new Error(`Published ${gameId} level ${row.level} (${language}) has an invalid format.`);
        }
        levels[row.level] = row.content;
      });
    } catch (error) {
      error.stage = "content";
      throw error;
    }
  } else if (!Object.values(levels).every(validateContent)) {
    throw new Error(`Local ${gameId} content has an invalid format.`);
  }

  const publishedLevels = Object.keys(levels).map(Number).sort((a, b) => a - b);
  if (publishedLevels.some((level, index) => level !== index + 1)) {
    throw new Error(`${gameId} levels must be published in order without gaps.`);
  }

  let completedLevel;
  try {
    if (supabase && user) {
      const { data, error } = await supabase
        .from("user_game_progress")
        .select("highest_completed_level")
        .eq("game_id", gameId)
        .eq("volume", 1)
        .maybeSingle();
      if (error) throw error;
      completedLevel = data?.highest_completed_level ?? 0;
      if (!Number.isSafeInteger(completedLevel) || completedLevel < 0) {
        throw new Error(`Saved ${gameId} progress is invalid.`);
      }
    } else {
      completedLevel = getLocalCompletedLevel(gameId);
    }
  } catch (error) {
    error.stage = "progress";
    throw error;
  }

  const nextLevel = completedLevel + 1;
  const level = levels[nextLevel] ? nextLevel : Math.max(1, completedLevel);
  if (!levels[level]) {
    throw new Error(`No published ${gameId} content available for level ${level}.`);
  }

  return {
    levels,
    level,
    completedLevel,
    usingLocalContent,
    allLevelsComplete: !levels[nextLevel] && completedLevel > 0,
  };
}

export async function saveGameLevel({ gameId, language, user, level }) {
  if (supabase && user) {
    const { data, error } = await supabase.rpc("complete_game_level", {
      p_game_id: gameId,
      p_volume: 1,
      p_language: language,
      p_level: level,
    });
    if (error) throw error;
    const completedLevel = Number(data);
    if (!Number.isSafeInteger(completedLevel) || completedLevel < level) {
      throw new Error(`The ${gameId} progress response is invalid.`);
    }
    return completedLevel;
  }

  localStorage.setItem(`game-progress:${gameId}:1`, String(level));
  return level;
}
