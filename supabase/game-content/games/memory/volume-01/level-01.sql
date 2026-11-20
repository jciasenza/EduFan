-- Juego: memory
-- Volumen: 1 | Nivel: 1
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'memory',
  'en',
  1,
  1,
  '[{"key":"dog","label":"dog","emoji":"🐶"},{"key":"cat","label":"cat","emoji":"🐱"},{"key":"rabbit","label":"rabbit","emoji":"🐰"},{"key":"fox","label":"fox","emoji":"🦊"}]'::jsonb,
  true
),
(
  'memory',
  'es',
  1,
  1,
  '[{"key":"dog","label":"perro","emoji":"🐶"},{"key":"cat","label":"gato","emoji":"🐱"},{"key":"rabbit","label":"conejo","emoji":"🐰"},{"key":"fox","label":"zorro","emoji":"🦊"}]'::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
