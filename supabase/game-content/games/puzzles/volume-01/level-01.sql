-- Juego: puzzles
-- Volumen: 1 | Nivel: 1
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'puzzles',
  'en',
  1,
  1,
  '[{"image":"puzzles/meadow.svg","size":2,"alt":"A kitten in a green meadow under the sun"}]'::jsonb,
  true
),
(
  'puzzles',
  'es',
  1,
  1,
  '[{"image":"puzzles/meadow.svg","size":2,"alt":"Un gatito en un prado verde bajo el sol"}]'::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
