-- Juego: tongue-twisters
-- Volumen: 1 | Nivel: 1
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'tongue-twisters',
  'en',
  1,
  1,
  $tongue_twisters_en$
  [
    {"phrase":"Peter Piper picked a peck of pickled peppers."},
    {"phrase":"She sells seashells by the seashore."},
    {"phrase":"A big black bug bit a big black bear."},
    {"phrase":"Freshly fried flying fish."},
    {"phrase":"Red lorry, yellow lorry."},
    {"phrase":"Six slippery snails slid slowly seaward."}
  ]
  $tongue_twisters_en$::jsonb,
  true
),
(
  'tongue-twisters',
  'es',
  1,
  1,
  $tongue_twisters_es$
  [
    {"phrase":"Pablito clavó un clavito, ¿qué clavito clavó Pablito?"},
    {"phrase":"Tres tristes tigres tragan trigo en un trigal."},
    {"phrase":"R con R cigarro, R con R barril, rápido ruedan los carros por los rieles del ferrocarril."},
    {"phrase":"El cielo está enladrillado, ¿quién lo desenladrillará?"},
    {"phrase":"Pepe Pecas pica papas con un pico. Con un pico pica papas Pepe Pecas."},
    {"phrase":"Compadre, cómpreme un coco. Compadre, coco no compro."}
  ]
  $tongue_twisters_es$::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
