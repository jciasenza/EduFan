-- Juego: art-music-quiz
-- Volumen: 1 | Nivel: 1
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'art-music-quiz',
  'en',
  1,
  1,
  $art_music_quiz_en_level_1$
  [
    {"clue":"Which instrument has black and white keys?","answers":["The flute","The piano","The drum","The guitar"],"correct":1,"emoji":"🎹"},
    {"clue":"What tool does an artist often use to paint on a canvas?","answers":["A paintbrush","A spoon","A hammer","A ruler"],"correct":0,"emoji":"🖌️"},
    {"clue":"Which instrument is played by strumming its strings?","answers":["The trumpet","The violin","The guitar","The drum"],"correct":2,"emoji":"🎸"},
    {"clue":"Which colors mix to make orange?","answers":["Blue and green","Red and yellow","Black and white","Purple and blue"],"correct":1,"emoji":"🎨"},
    {"clue":"Which instrument keeps the beat with its strikes?","answers":["The drum","The flute","The piano","The harp"],"correct":0,"emoji":"🥁"},
    {"clue":"What does a sculptor do to create a sculpture?","answers":["Shapes or carves materials","Composes a song","Takes a photograph","Writes a poem"],"correct":0,"emoji":"🗿"}
  ]
  $art_music_quiz_en_level_1$::jsonb,
  true
),
(
  'art-music-quiz',
  'es',
  1,
  1,
  $art_music_quiz_es_level_1$
  [
    {"clue":"¿Qué instrumento tiene teclas blancas y negras?","answers":["La flauta","El piano","El tambor","La guitarra"],"correct":1,"emoji":"🎹"},
    {"clue":"¿Con qué herramienta suele pintar un artista sobre un lienzo?","answers":["Un pincel","Una cuchara","Un martillo","Una regla"],"correct":0,"emoji":"🖌️"},
    {"clue":"¿Qué instrumento se toca rasgueando sus cuerdas?","answers":["La trompeta","El violín","La guitarra","El tambor"],"correct":2,"emoji":"🎸"},
    {"clue":"¿Qué colores se mezclan para formar el naranja?","answers":["Azul y verde","Rojo y amarillo","Blanco y negro","Violeta y azul"],"correct":1,"emoji":"🎨"},
    {"clue":"¿Qué instrumento marca el ritmo con sus golpes?","answers":["El tambor","La flauta","El piano","El arpa"],"correct":0,"emoji":"🥁"},
    {"clue":"¿Qué hace un escultor para crear una escultura?","answers":["Modela o talla materiales","Compone una canción","Toma una fotografía","Escribe un poema"],"correct":0,"emoji":"🗿"}
  ]
  $art_music_quiz_es_level_1$::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
