-- Juego: shapes-colors
-- Volumen: 1 | Nivel: 3
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'shapes-colors',
  'en',
  1,
  3,
  '[{"shapes":["circle","square","triangle","star"],"colors":["red","blue","yellow","green","purple","orange"],"rounds":12}]'::jsonb,
  true
),
(
  'shapes-colors',
  'es',
  1,
  3,
  '[{"shapes":["circle","square","triangle","star"],"colors":["red","blue","yellow","green","purple","orange"],"rounds":12}]'::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
