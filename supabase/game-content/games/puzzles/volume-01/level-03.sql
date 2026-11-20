-- Juego: puzzles
-- Volumen: 1 | Nivel: 3
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'puzzles',
  'en',
  1,
  3,
  '[{"image":"puzzles/space.svg","size":4,"alt":"A rocket travels among planets and stars"}]'::jsonb,
  true
),
(
  'puzzles',
  'es',
  1,
  3,
  '[{"image":"puzzles/space.svg","size":4,"alt":"Un cohete viaja entre planetas y estrellas"}]'::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
