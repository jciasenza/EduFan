-- Juego: puzzles
-- Volumen: 1 | Nivel: 2
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'puzzles',
  'en',
  1,
  2,
  '[{"image":"puzzles/ocean.svg","size":3,"alt":"A smiling whale in the ocean"}]'::jsonb,
  true
),
(
  'puzzles',
  'es',
  1,
  2,
  '[{"image":"puzzles/ocean.svg","size":3,"alt":"Una ballena sonriente en el océano"}]'::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
