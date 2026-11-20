-- Juego: science
-- Volumen: 1 | Nivel: 1
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'science',
  'en',
  1,
  1,
  $science_en$
  [
    {"clue":"Which planet is closest to the Sun?","answers":["Mars","Mercury","Venus","Jupiter"],"correct":1,"emoji":"☀️"},
    {"clue":"What does a plant need to grow?","answers":["Water and sunlight","Only sand","Ice and wind","Rocks"],"correct":0,"emoji":"🌱"},
    {"clue":"Which organ pumps blood around your body?","answers":["The lungs","The brain","The heart","The stomach"],"correct":2,"emoji":"❤️"},
    {"clue":"At what temperature does water freeze?","answers":["At 0 °C","At 50 °C","At 100 °C","At 20 °C"],"correct":0,"emoji":"🧊"},
    {"clue":"How many legs does a spider have?","answers":["Six","Eight","Four","Ten"],"correct":1,"emoji":"🕷️"},
    {"clue":"Which gas do we need to breathe?","answers":["Oxygen","Helium","Smoke","Steam"],"correct":0,"emoji":"🌬️"},
    {"clue":"What is Earth's Moon?","answers":["A star","A planet","A natural satellite","A comet"],"correct":2,"emoji":"🌙"},
    {"clue":"What can appear when sunlight shines through raindrops?","answers":["A rainbow","An aurora","A comet","A lightning bolt"],"correct":0,"emoji":"🌈"}
  ]
  $science_en$::jsonb,
  true
),
(
  'science',
  'es',
  1,
  1,
  $science_es$
  [
    {"clue":"¿Cuál es el planeta más cercano al Sol?","answers":["Marte","Mercurio","Venus","Júpiter"],"correct":1,"emoji":"☀️"},
    {"clue":"¿Qué necesita una planta para crecer?","answers":["Agua y luz del Sol","Solo arena","Hielo y viento","Piedras"],"correct":0,"emoji":"🌱"},
    {"clue":"¿Qué órgano bombea la sangre por el cuerpo?","answers":["El pulmón","El cerebro","El corazón","El estómago"],"correct":2,"emoji":"❤️"},
    {"clue":"¿A qué temperatura se congela el agua?","answers":["A 0 °C","A 50 °C","A 100 °C","A 20 °C"],"correct":0,"emoji":"🧊"},
    {"clue":"¿Cuántas patas tiene una araña?","answers":["Seis","Ocho","Cuatro","Diez"],"correct":1,"emoji":"🕷️"},
    {"clue":"¿Qué gas necesitamos para respirar?","answers":["Oxígeno","Helio","Humo","Vapor"],"correct":0,"emoji":"🌬️"},
    {"clue":"¿Qué es la Luna de la Tierra?","answers":["Una estrella","Un planeta","Un satélite natural","Un cometa"],"correct":2,"emoji":"🌙"},
    {"clue":"¿Qué aparece en el cielo cuando la luz del Sol atraviesa gotas de lluvia?","answers":["Un arcoíris","Una aurora","Un cometa","Un relámpago"],"correct":0,"emoji":"🌈"}
  ]
  $science_es$::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
