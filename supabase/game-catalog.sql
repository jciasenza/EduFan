create table if not exists public.game_categories (
  id text primary key,
  title_es text not null,
  title_en text not null,
  description_es text not null default '',
  description_en text not null default '',
  icon text not null default 'SportsEsports',
  color text not null default 'purple',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id text primary key,
  category_id text not null references public.game_categories (id) on delete cascade,
  title_es text not null,
  title_en text not null,
  description_es text not null default '',
  description_en text not null default '',
  icon text not null default 'SportsEsports',
  color text not null default 'purple',
  route text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.game_categories enable row level security;
alter table public.games enable row level security;

drop policy if exists "Anyone can read published game categories"
  on public.game_categories;
create policy "Anyone can read published game categories"
  on public.game_categories for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Anyone can read published games"
  on public.games;
create policy "Anyone can read published games"
  on public.games for select
  to anon, authenticated
  using (
    is_published = true
    and exists (
      select 1
        from public.game_categories
        where game_categories.id = games.category_id
          and game_categories.is_published = true
    )
  );

revoke all on public.game_categories from anon, authenticated;
revoke all on public.games from anon, authenticated;
grant select on public.game_categories, public.games to anon, authenticated;

insert into public.game_categories
  (id, title_es, title_en, description_es, description_en, icon, color, sort_order)
values
  ('art-music', 'Arte y música', 'Art and music', 'Explora el arte y la música jugando.', 'Explore art and music through play.', 'Palette', 'coral', 1),
  ('stories', 'Cuentos', 'Stories', 'Lee cuentos y descubre qué pasa en cada historia.', 'Read stories and discover what happens next.', 'MenuBook', 'orange', 2),
  ('riddles', 'Adivinanzas', 'Riddles', 'Resuelve pistas y pon a prueba tu ingenio.', 'Solve clues and put your clever thinking to work.', 'QuestionAnswer', 'purple', 3),
  ('tongue-twisters', 'Trabalenguas', 'Tongue twisters', 'Juega con sonidos y mejora tu pronunciación.', 'Play with sounds and practice pronunciation.', 'TextFields', 'blue', 4),
  ('memory', 'Memoria', 'Memory', 'Encuentra parejas y ejercita la memoria.', 'Find matching pairs and exercise your memory.', 'SportsEsports', 'pink', 5),
  ('shapes-colors', 'Figuras y colores', 'Shapes and colors', 'Reconoce colores y formas en cada reto.', 'Recognize shapes and colors in every challenge.', 'Palette', 'orange', 6),
  ('resources', 'Rompecabezas', 'Puzzles', 'Arma rompecabezas pieza por pieza.', 'Put fun puzzles together one piece at a time.', 'Extension', 'teal', 7),
  ('english', 'Idiomas', 'Languages', 'Aprende inglés y español con palabras cotidianas.', 'Learn everyday words in English and Spanish.', 'Translate', 'purple', 8),
  ('science', 'Ciencia', 'Science', 'Explora la ciencia y descubre cómo funciona el mundo.', 'Explore science and discover how the world works.', 'Science', 'green', 9),
  ('world-history', 'Historia mundial', 'World history', 'Viaja por las civilizaciones y los grandes momentos del pasado.', 'Travel through civilizations and great moments from the past.', 'HistoryEdu', 'purple', 10),
  ('math', 'Matemáticas', 'Math', 'Resuelve cuentas y descubre patrones numéricos.', 'Solve sums and discover number patterns.', 'Calculate', 'blue', 11),
  ('words', 'Palabras', 'Words', 'Juega con letras, palabras y vocabulario.', 'Play with letters, words, and vocabulary.', 'TextFields', 'pink', 12)
on conflict (id) do update
set title_es = excluded.title_es,
    title_en = excluded.title_en,
    description_es = excluded.description_es,
    description_en = excluded.description_en,
    icon = excluded.icon,
    color = excluded.color,
    sort_order = excluded.sort_order,
    is_published = true,
    updated_at = now();

update public.games
  set category_id = 'art-music',
      updated_at = now()
  where id = 'songs';

update public.game_categories
  set is_published = false,
      updated_at = now()
  where id = 'songs';

insert into public.games
  (id, category_id, title_es, title_en, description_es, description_en, icon, color, route, sort_order)
values
  ('songs', 'art-music', 'Eco musical', 'Musical echo', 'Escucha melodías originales y encuentra la secuencia de notas.', 'Listen to original melodies and find the note sequence.', 'MusicNote', 'orange', '/juegos/canciones', 1),
  ('art-music-quiz', 'art-music', 'Desafío de arte y música', 'Art and music challenge', 'Responde preguntas sobre instrumentos, sonidos y arte.', 'Answer questions about instruments, sounds, and art.', 'Palette', 'pink', '/juegos/arte-musica', 2),
  ('stories', 'stories', 'Cuentos mágicos', 'Magical stories', 'Lee cuentos cortitos y responde preguntas sobre ellos.', 'Read short stories and answer questions about them.', 'AutoStories', 'pink', '/juegos/cuentos', 2),
  ('riddles', 'riddles', 'Adivina, adivinador', 'Riddle me this', 'Resuelve pistas y encuentra la respuesta.', 'Solve the clues and find the answer.', 'QuestionAnswer', 'purple', '/juegos/adivinanzas', 3),
  ('tongue-twisters', 'tongue-twisters', 'Reto de trabalenguas', 'Tongue twister challenge', '¡Di cada frase sin equivocarte!', 'Say each phrase without making a mistake!', 'TextFields', 'blue', '/juegos/trabalenguas', 4),
  ('memory', 'memory', 'Memotest de animales', 'Animal memory match', 'Encuentra las parejas de animales.', 'Find matching pairs of animals.', 'SportsEsports', 'teal', '/juegos/memoria', 5),
  ('shapes-colors', 'shapes-colors', 'Figuras y colores', 'Shapes and colors', 'Aprende a reconocer formas y colores jugando.', 'Learn to recognize shapes and colors as you play.', 'Palette', 'coral', '/juegos/figuras-colores', 6),
  ('puzzles', 'resources', 'Rompecabezas de animales', 'Animal jigsaw puzzle', 'Arma la imagen pieza por pieza.', 'Put the picture together piece by piece.', 'Extension', 'purple', '/juegos/rompecabezas', 7),
  ('english', 'english', 'Aprende inglés', 'Learn English', 'Practica palabras en inglés de forma divertida.', 'Practice English words in a fun way.', 'Translate', 'coral', '/juegos/ingles', 8),
  ('spanish', 'english', 'Aprende español', 'Learn Spanish', 'Practica palabras en español de forma divertida.', 'Practice Spanish words in a fun way.', 'Translate', 'coral', '/juegos/espanol', 9),
  ('science', 'science', 'Pequeños exploradores', 'Little explorers', 'Descubre curiosidades del mundo que te rodea.', 'Discover fun facts about the world around you.', 'Science', 'yellow', '/juegos/ciencia', 10),
  ('world-history', 'world-history', 'Viajeros del tiempo', 'Time travelers', 'Viaja por las civilizaciones y los grandes momentos del pasado.', 'Travel through civilizations and great moments from the past.', 'HistoryEdu', 'purple', '/juegos/historia-mundial', 11),
  ('math-addition', 'math', 'Sumas y restas', 'Add and subtract', 'Resuelve cuentas fáciles y elige el resultado correcto.', 'Solve easy sums and choose the correct answer.', 'Calculate', 'green', '/juegos/matematicas', 12),
  ('number-series', 'math', 'Series numéricas', 'Number sequences', 'Descubre el patrón y encuentra el número que falta.', 'Find the pattern and discover the missing number.', 'AutoStories', 'green', '/juegos/series-numericas', 13),
  ('word-counter', 'words', 'Contador de palabras y letras', 'Word and letter counter', 'Escribe un texto y cuenta sus palabras y letras.', 'Write some text and count its words and letters.', 'Abc', 'blue', '/juegos/contador-palabras', 14),
  ('scrambled-words', 'words', 'Palabras revueltas', 'Scrambled words', 'Ordena las letras y descubre qué palabra se esconde.', 'Put the letters in order and reveal the hidden word.', 'TextFields', 'blue', '/juegos/palabras-revueltas', 15)
on conflict (id) do update
set category_id = excluded.category_id,
    title_es = excluded.title_es,
    title_en = excluded.title_en,
    description_es = excluded.description_es,
    description_en = excluded.description_en,
    icon = excluded.icon,
    color = excluded.color,
    route = excluded.route,
    sort_order = excluded.sort_order,
    is_published = true,
    updated_at = now();
