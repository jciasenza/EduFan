-- Juego: scrambled-words
-- Volumen: 1 | Nivel: 1
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'scrambled-words',
  'en',
  1,
  1,
  $scrambled_words_en$
  [
    {"word":"cat","clue":"An animal that says meow.","emoji":"🐱"},
    {"word":"moon","clue":"It shines in the sky at night.","emoji":"🌙"},
    {"word":"home","clue":"The place where we live.","emoji":"🏠"},
    {"word":"duck","clue":"A bird that swims and says quack.","emoji":"🦆"},
    {"word":"table","clue":"We use it to eat or draw.","emoji":"🪑"},
    {"word":"puppy","clue":"A furry friend that goes woof.","emoji":"🐶"},
    {"word":"cloud","clue":"A white shape floating in the sky.","emoji":"☁️"},
    {"word":"boat","clue":"It travels across water.","emoji":"⛵"},
    {"word":"apple","clue":"A red or green fruit.","emoji":"🍎"},
    {"word":"ball","clue":"We can kick or throw it.","emoji":"⚽"}
  ]
  $scrambled_words_en$::jsonb,
  true
),
(
  'scrambled-words',
  'es',
  1,
  1,
  $scrambled_words_es$
  [
    {"word":"gato","clue":"Un animal que dice miau.","emoji":"🐱"},
    {"word":"luna","clue":"Brilla en el cielo por la noche.","emoji":"🌙"},
    {"word":"casa","clue":"El lugar donde vivimos.","emoji":"🏠"},
    {"word":"pato","clue":"Un ave que nada y hace cuac.","emoji":"🦆"},
    {"word":"mesa","clue":"La usamos para comer o dibujar.","emoji":"🪑"},
    {"word":"perro","clue":"Un amigo peludo que hace guau.","emoji":"🐶"},
    {"word":"nube","clue":"Una forma blanca que flota en el cielo.","emoji":"☁️"},
    {"word":"barco","clue":"Viaja por el agua.","emoji":"⛵"},
    {"word":"manzana","clue":"Una fruta roja o verde.","emoji":"🍎"},
    {"word":"pelota","clue":"La podemos patear o lanzar.","emoji":"⚽"}
  ]
  $scrambled_words_es$::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
