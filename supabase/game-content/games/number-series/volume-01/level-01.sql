-- Juego: number-series
-- Volumen: 1 | Nivel: 1
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'number-series',
  'en',
  1,
  1,
  '[{"startMin":1,"startMax":10,"stepMin":2,"stepMax":5,"sequenceLength":5,"rounds":10}]'::jsonb,
  true
),
(
  'number-series',
  'es',
  1,
  1,
  '[{"startMin":1,"startMax":10,"stepMin":2,"stepMax":5,"sequenceLength":5,"rounds":10}]'::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
