-- Juego: math-addition
-- Volumen: 1 | Nivel: 1
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'math-addition',
  'en',
  1,
  1,
  '[{"minNumber":1,"maxNumber":10,"rounds":10}]'::jsonb,
  true
),
(
  'math-addition',
  'es',
  1,
  1,
  '[{"minNumber":1,"maxNumber":10,"rounds":10}]'::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
