-- EduFan: contenido de rompecabezas con 25 animales
-- Bucket: edufan-game-assets
-- Las rutas son relativas dentro del bucket: puzzles/animals/<archivo>.png
-- Inserta o actualiza los 5 niveles para español e inglés.

BEGIN;

INSERT INTO public.game_content (game_id, language, volume, level, content)
VALUES
  ('puzzles', 'es', 1, 1, $json$[
  {
    "image": "puzzles/animals/gato.png",
    "rows": 2,
    "columns": 2,
    "alt": "Gato"
  },
  {
    "image": "puzzles/animals/perro.png",
    "rows": 2,
    "columns": 2,
    "alt": "Perro"
  },
  {
    "image": "puzzles/animals/conejo.png",
    "rows": 2,
    "columns": 2,
    "alt": "Conejo"
  },
  {
    "image": "puzzles/animals/vaca.png",
    "rows": 2,
    "columns": 2,
    "alt": "Vaca"
  },
  {
    "image": "puzzles/animals/oveja.png",
    "rows": 2,
    "columns": 2,
    "alt": "Oveja"
  }
]$json$::jsonb),
  ('puzzles', 'en', 1, 1, $json$[
  {
    "image": "puzzles/animals/gato.png",
    "rows": 2,
    "columns": 2,
    "alt": "Cat"
  },
  {
    "image": "puzzles/animals/perro.png",
    "rows": 2,
    "columns": 2,
    "alt": "Dog"
  },
  {
    "image": "puzzles/animals/conejo.png",
    "rows": 2,
    "columns": 2,
    "alt": "Rabbit"
  },
  {
    "image": "puzzles/animals/vaca.png",
    "rows": 2,
    "columns": 2,
    "alt": "Cow"
  },
  {
    "image": "puzzles/animals/oveja.png",
    "rows": 2,
    "columns": 2,
    "alt": "Sheep"
  }
]$json$::jsonb),
  ('puzzles', 'es', 1, 2, $json$[
  {
    "image": "puzzles/animals/tigre.png",
    "rows": 2,
    "columns": 3,
    "alt": "Tigre"
  },
  {
    "image": "puzzles/animals/leon.png",
    "rows": 2,
    "columns": 3,
    "alt": "León"
  },
  {
    "image": "puzzles/animals/elefante.png",
    "rows": 2,
    "columns": 3,
    "alt": "Elefante"
  },
  {
    "image": "puzzles/animals/jirafa.png",
    "rows": 2,
    "columns": 3,
    "alt": "Jirafa"
  },
  {
    "image": "puzzles/animals/cebra.png",
    "rows": 2,
    "columns": 3,
    "alt": "Cebra"
  }
]$json$::jsonb),
  ('puzzles', 'en', 1, 2, $json$[
  {
    "image": "puzzles/animals/tigre.png",
    "rows": 2,
    "columns": 3,
    "alt": "Tiger"
  },
  {
    "image": "puzzles/animals/leon.png",
    "rows": 2,
    "columns": 3,
    "alt": "Lion"
  },
  {
    "image": "puzzles/animals/elefante.png",
    "rows": 2,
    "columns": 3,
    "alt": "Elephant"
  },
  {
    "image": "puzzles/animals/jirafa.png",
    "rows": 2,
    "columns": 3,
    "alt": "Giraffe"
  },
  {
    "image": "puzzles/animals/cebra.png",
    "rows": 2,
    "columns": 3,
    "alt": "Zebra"
  }
]$json$::jsonb),
  ('puzzles', 'es', 1, 3, $json$[
  {
    "image": "puzzles/animals/panda.png",
    "rows": 3,
    "columns": 3,
    "alt": "Panda"
  },
  {
    "image": "puzzles/animals/koala.png",
    "rows": 3,
    "columns": 3,
    "alt": "Koala"
  },
  {
    "image": "puzzles/animals/mono.png",
    "rows": 3,
    "columns": 3,
    "alt": "Mono"
  },
  {
    "image": "puzzles/animals/oso.png",
    "rows": 3,
    "columns": 3,
    "alt": "Oso"
  },
  {
    "image": "puzzles/animals/zorro.png",
    "rows": 3,
    "columns": 3,
    "alt": "Zorro"
  }
]$json$::jsonb),
  ('puzzles', 'en', 1, 3, $json$[
  {
    "image": "puzzles/animals/panda.png",
    "rows": 3,
    "columns": 3,
    "alt": "Panda"
  },
  {
    "image": "puzzles/animals/koala.png",
    "rows": 3,
    "columns": 3,
    "alt": "Koala"
  },
  {
    "image": "puzzles/animals/mono.png",
    "rows": 3,
    "columns": 3,
    "alt": "Monkey"
  },
  {
    "image": "puzzles/animals/oso.png",
    "rows": 3,
    "columns": 3,
    "alt": "Bear"
  },
  {
    "image": "puzzles/animals/zorro.png",
    "rows": 3,
    "columns": 3,
    "alt": "Fox"
  }
]$json$::jsonb),
  ('puzzles', 'es', 1, 4, $json$[
  {
    "image": "puzzles/animals/ardilla.png",
    "rows": 3,
    "columns": 4,
    "alt": "Ardilla"
  },
  {
    "image": "puzzles/animals/erizo.png",
    "rows": 3,
    "columns": 4,
    "alt": "Erizo"
  },
  {
    "image": "puzzles/animals/lobo.png",
    "rows": 3,
    "columns": 4,
    "alt": "Lobo"
  },
  {
    "image": "puzzles/animals/oso-polar.png",
    "rows": 3,
    "columns": 4,
    "alt": "Oso polar"
  },
  {
    "image": "puzzles/animals/pinguino.png",
    "rows": 3,
    "columns": 4,
    "alt": "Pingüino"
  }
]$json$::jsonb),
  ('puzzles', 'en', 1, 4, $json$[
  {
    "image": "puzzles/animals/ardilla.png",
    "rows": 3,
    "columns": 4,
    "alt": "Squirrel"
  },
  {
    "image": "puzzles/animals/erizo.png",
    "rows": 3,
    "columns": 4,
    "alt": "Hedgehog"
  },
  {
    "image": "puzzles/animals/lobo.png",
    "rows": 3,
    "columns": 4,
    "alt": "Wolf"
  },
  {
    "image": "puzzles/animals/oso-polar.png",
    "rows": 3,
    "columns": 4,
    "alt": "Polar bear"
  },
  {
    "image": "puzzles/animals/pinguino.png",
    "rows": 3,
    "columns": 4,
    "alt": "Penguin"
  }
]$json$::jsonb),
  ('puzzles', 'es', 1, 5, $json$[
  {
    "image": "puzzles/animals/delfin.png",
    "rows": 4,
    "columns": 4,
    "alt": "Delfín"
  },
  {
    "image": "puzzles/animals/pez-payaso.png",
    "rows": 4,
    "columns": 4,
    "alt": "Pez payaso"
  },
  {
    "image": "puzzles/animals/rana.png",
    "rows": 4,
    "columns": 4,
    "alt": "Rana"
  },
  {
    "image": "puzzles/animals/tortuga.png",
    "rows": 4,
    "columns": 4,
    "alt": "Tortuga"
  },
  {
    "image": "puzzles/animals/tortuga-marina.png",
    "rows": 4,
    "columns": 4,
    "alt": "Tortuga marina"
  }
]$json$::jsonb),
  ('puzzles', 'en', 1, 5, $json$[
  {
    "image": "puzzles/animals/delfin.png",
    "rows": 4,
    "columns": 4,
    "alt": "Dolphin"
  },
  {
    "image": "puzzles/animals/pez-payaso.png",
    "rows": 4,
    "columns": 4,
    "alt": "Clownfish"
  },
  {
    "image": "puzzles/animals/rana.png",
    "rows": 4,
    "columns": 4,
    "alt": "Frog"
  },
  {
    "image": "puzzles/animals/tortuga.png",
    "rows": 4,
    "columns": 4,
    "alt": "Turtle"
  },
  {
    "image": "puzzles/animals/tortuga-marina.png",
    "rows": 4,
    "columns": 4,
    "alt": "Sea turtle"
  }
]$json$::jsonb)
ON CONFLICT (game_id, language, volume, level)
DO UPDATE SET
  content = EXCLUDED.content;

COMMIT;
