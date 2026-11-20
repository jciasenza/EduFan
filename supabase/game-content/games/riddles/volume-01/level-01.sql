-- Juego: riddles
-- Volumen: 1 | Nivel: 1
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'riddles',
  'en',
  1,
  1,
  $riddles_en$
  [
    {"clue":"I have hands and a face, but no arms or eyes. What am I?","answers":["A clock","A doll","A book","A mirror"],"correct":0},
    {"clue":"I have teeth but I never bite. What am I?","answers":["A shark","A comb","A crocodile","A zipper"],"correct":1},
    {"clue":"The more you take away from me, the bigger I get. What am I?","answers":["A hole","A hill","A box","A cloud"],"correct":0},
    {"clue":"I have four legs but I cannot walk. What am I?","answers":["A dog","A chair","A horse","A cat"],"correct":1},
    {"clue":"I fly without wings and cry without eyes. What am I?","answers":["A cloud","An airplane","A butterfly","A kite"],"correct":0},
    {"clue":"I am round and bouncy, and I love to play. What am I?","answers":["An orange","A ball","A wheel","A coin"],"correct":1},
    {"clue":"I have pages and words, but I cannot talk. What am I?","answers":["A book","A flower","A radio","A letter"],"correct":0},
    {"clue":"I get wetter the more I dry. What am I?","answers":["A sponge","A towel","An umbrella","A cloud"],"correct":1}
  ]
  $riddles_en$::jsonb,
  true
),
(
  'riddles',
  'es',
  1,
  1,
  $riddles_es$
  [
    {"clue":"Tengo agujas y no sé coser, tengo números y no sé leer. ¿Qué soy?","answers":["Un reloj","Un peine","Una brújula","Un lápiz"],"correct":0},
    {"clue":"Blanca por dentro, verde por fuera. Si quieres que te lo diga, espera.","answers":["La manzana","La pera","La sandía","La uva"],"correct":1},
    {"clue":"Tiene muchos dientes, pero nunca puede comer. ¿Qué es?","answers":["Un tiburón","Un peine","Un cocodrilo","Una cremallera"],"correct":1},
    {"clue":"Cuanto más le quitas, más grande se hace. ¿Qué es?","answers":["Un agujero","Una montaña","Una caja","Una nube"],"correct":0},
    {"clue":"Tiene cuatro patas y no puede caminar. ¿Qué es?","answers":["Un perro","Una silla","Una mesa","Un caballo"],"correct":2},
    {"clue":"Vuelo sin alas y lloro sin ojos. ¿Qué soy?","answers":["Una nube","Un avión","Una mariposa","Una cometa"],"correct":0},
    {"clue":"Redonda soy y al saltar, muchas risas puedo dar. ¿Qué soy?","answers":["Una naranja","Una pelota","Una rueda","Una moneda"],"correct":1},
    {"clue":"Tiene hojas y no es árbol, tiene letras y no sabe hablar. ¿Qué es?","answers":["Un libro","Una flor","Un cuaderno vacío","Una carta"],"correct":0}
  ]
  $riddles_es$::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
