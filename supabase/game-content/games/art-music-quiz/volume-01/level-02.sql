-- Juego: art-music-quiz
-- Volumen: 1 | Nivel: 2
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'art-music-quiz',
  'en',
  1,
  2,
  $art_music_quiz_en_level_2$
  [
    {"clue":"Which instrument family includes the flute and clarinet?","answers":["Percussion","Strings","Woodwind","Keyboard"],"correct":2,"emoji":"🎶"},
    {"clue":"What is a self-portrait?","answers":["A portrait an artist makes of themselves","A painting of a landscape","A sculpture of an animal","A drawing of an instrument"],"correct":0,"emoji":"🖼️"},
    {"clue":"Which instrument usually has four strings and rests under the chin?","answers":["The violin","The tuba","The piano","The drum"],"correct":0,"emoji":"🎻"},
    {"clue":"What does it mean to sing in a choir?","answers":["Sing together as a group","Play an instrument alone","Paint while music plays","Dance without music"],"correct":0,"emoji":"🎤"},
    {"clue":"Which material might an artist use to shape a figure?","answers":["Clay","Steam","Sound","Light"],"correct":0,"emoji":"🏺"},
    {"clue":"What does an orchestra conductor usually do?","answers":["Coordinates the musicians","Builds the instruments","Paints the stage","Writes the tickets"],"correct":0,"emoji":"🎼"}
  ]
  $art_music_quiz_en_level_2$::jsonb,
  true
),
(
  'art-music-quiz',
  'es',
  1,
  2,
  $art_music_quiz_es_level_2$
  [
    {"clue":"¿Qué familia de instrumentos incluye la flauta y el clarinete?","answers":["Percusión","Cuerda","Viento","Teclado"],"correct":2,"emoji":"🎶"},
    {"clue":"¿Qué es un autorretrato?","answers":["Un retrato que un artista hace de sí mismo","Una pintura de un paisaje","Una escultura de un animal","Un dibujo de un instrumento"],"correct":0,"emoji":"🖼️"},
    {"clue":"¿Qué instrumento suele tener cuatro cuerdas y se apoya bajo la barbilla?","answers":["El violín","La tuba","El piano","El tambor"],"correct":0,"emoji":"🎻"},
    {"clue":"¿Qué significa cantar en un coro?","answers":["Cantar junto con un grupo","Tocar un instrumento a solas","Pintar mientras suena música","Bailar sin música"],"correct":0,"emoji":"🎤"},
    {"clue":"¿Qué material puede usar un artista para modelar una figura?","answers":["La arcilla","El vapor","El sonido","La luz"],"correct":0,"emoji":"🏺"},
    {"clue":"¿Qué suele hacer un director o directora de orquesta?","answers":["Coordina a los músicos","Construye los instrumentos","Pinta el escenario","Escribe las entradas"],"correct":0,"emoji":"🎼"}
  ]
  $art_music_quiz_es_level_2$::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
