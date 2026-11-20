-- Juego: riddles
-- Volumen: 1 | Nivel: 2
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'riddles',
  'en',
  1,
  2,
  $riddles_en_level_2$
  [
    {"clue":"I have cities but no houses, rivers but no water. What am I?","answers":["A map","A book","A clock","A painting"],"correct":0},
    {"clue":"You break me before using me to cook. What am I?","answers":["A glass","A plate","An egg","A spoon"],"correct":2},
    {"clue":"I have no mouth, but I repeat what you say. What am I?","answers":["The wind","An echo","A phone","Music"],"correct":1},
    {"clue":"If you say my name, I disappear. What am I?","answers":["A shadow","Silence","The night","A dream"],"correct":1},
    {"clue":"The bigger I get, the less you can see. What am I?","answers":["Darkness","A window","A magnifying glass","Light"],"correct":0},
    {"clue":"I have a neck but no head. What am I?","answers":["A shirt","A bottle","A giraffe","A guitar"],"correct":1},
    {"clue":"I run without feet and have a bed but never sleep. What am I?","answers":["A horse","A river","A train","A child"],"correct":1},
    {"clue":"I have one eye but cannot see. What am I?","answers":["A needle","A button","A potato","A die"],"correct":0}
  ]
  $riddles_en_level_2$::jsonb,
  true
),
(
  'riddles',
  'es',
  1,
  2,
  $riddles_es_level_2$
  [
    {"clue":"Tengo ciudades, pero no casas; ríos, pero no agua. ¿Qué soy?","answers":["Un mapa","Un libro","Un reloj","Un cuadro"],"correct":0},
    {"clue":"Me rompes antes de usarme para cocinar. ¿Qué soy?","answers":["Un vaso","Un plato","Un huevo","Una cuchara"],"correct":2},
    {"clue":"No tengo boca y repito lo que dices. ¿Qué soy?","answers":["El viento","El eco","El teléfono","La música"],"correct":1},
    {"clue":"Si dices mi nombre, dejo de existir. ¿Qué soy?","answers":["La sombra","El silencio","La noche","El sueño"],"correct":1},
    {"clue":"Cuanto más grande soy, menos puedes ver. ¿Qué soy?","answers":["La oscuridad","La ventana","La lupa","La luz"],"correct":0},
    {"clue":"Tengo cuello, pero no cabeza. ¿Qué soy?","answers":["Una camisa","Una botella","Una jirafa","Una guitarra"],"correct":1},
    {"clue":"Corro sin tener pies y tengo lecho, pero no duermo. ¿Qué soy?","answers":["Un caballo","Un río","Un tren","Un niño"],"correct":1},
    {"clue":"Tengo un ojo y no puedo ver. ¿Qué soy?","answers":["Una aguja","Un botón","Una papa","Un dado"],"correct":0}
  ]
  $riddles_es_level_2$::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
