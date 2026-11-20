-- Juego: shapes-colors
-- Volumen: 1 | Nivel: 2
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'shapes-colors',
  'en',
  1,
  2,
  '[{"shapes":["circle","square","triangle"],"colors":["red","blue","yellow","green"],"rounds":10}]'::jsonb,
  true
),
(
  'shapes-colors',
  'es',
  1,
  2,
  '[{"shapes":["circle","square","triangle"],"colors":["red","blue","yellow","green"],"rounds":10}]'::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
