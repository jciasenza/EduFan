-- Juego: english
-- Volumen: 1 | Nivel: 2
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'english',
  'en',
  1,
  2,
  '[{"es":"manzana","en":"apple","emoji":"🍎"},{"es":"perro","en":"dog","emoji":"🐶"},{"es":"libro","en":"book","emoji":"📚"},{"es":"agua","en":"water","emoji":"💧"},{"es":"casa","en":"house","emoji":"🏠"},{"es":"gato","en":"cat","emoji":"🐱"},{"es":"sol","en":"sun","emoji":"☀️"},{"es":"flor","en":"flower","emoji":"🌷"},{"es":"amigo","en":"friend","emoji":"🧒"},{"es":"escuela","en":"school","emoji":"🏫"},{"es":"leche","en":"milk","emoji":"🥛"},{"es":"pájaro","en":"bird","emoji":"🐦"}]'::jsonb,
  true
),
(
  'english',
  'es',
  1,
  2,
  '[{"es":"manzana","en":"apple","emoji":"🍎"},{"es":"perro","en":"dog","emoji":"🐶"},{"es":"libro","en":"book","emoji":"📚"},{"es":"agua","en":"water","emoji":"💧"},{"es":"casa","en":"house","emoji":"🏠"},{"es":"gato","en":"cat","emoji":"🐱"},{"es":"sol","en":"sun","emoji":"☀️"},{"es":"flor","en":"flower","emoji":"🌷"},{"es":"amigo","en":"friend","emoji":"🧒"},{"es":"escuela","en":"school","emoji":"🏫"},{"es":"leche","en":"milk","emoji":"🥛"},{"es":"pájaro","en":"bird","emoji":"🐦"}]'::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
