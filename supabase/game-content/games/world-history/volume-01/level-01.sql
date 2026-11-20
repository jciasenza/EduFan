-- Juego: world-history
-- Volumen: 1 | Nivel: 1
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'world-history',
  'en',
  1,
  1,
  $world_history_en$
  [
    {"clue":"Along which river did ancient Egypt develop?","answers":["The Amazon","The Nile","The Danube","The Tiber"],"correct":1,"emoji":"🏺"},
    {"clue":"In which region did some of the first cities rise between the Tigris and Euphrates rivers?","answers":["Scandinavia","The Andes","Mesopotamia","Polynesia"],"correct":2,"emoji":"🧱"},
    {"clue":"Which ancient civilization built the Parthenon in Athens?","answers":["The Maya","The Persians","The Vikings","The Greeks"],"correct":3,"emoji":"🏛️"},
    {"clue":"Which empire built an extensive network of roads around the Mediterranean Sea?","answers":["The Inca Empire","The Mongol Empire","The Roman Empire","The Aztec Empire"],"correct":2,"emoji":"🛣️"},
    {"clue":"Which country is home to the Great Wall?","answers":["China","India","Egypt","Italy"],"correct":0,"emoji":"🐉"},
    {"clue":"Which people built the city of Machu Picchu in the Andes?","answers":["The Romans","The Phoenicians","The Incas","The Egyptians"],"correct":2,"emoji":"⛰️"},
    {"clue":"Which invention helped produce books in large numbers in Europe from the 15th century?","answers":["The telescope","The compass","The steam engine","The printing press"],"correct":3,"emoji":"📚"},
    {"clue":"Which route connected Asia and Europe through trade for centuries?","answers":["The Amber Road","The Silk Road","The Royal Road","The Salt Route"],"correct":1,"emoji":"🐫"}
  ]
  $world_history_en$::jsonb,
  true
),
(
  'world-history',
  'es',
  1,
  1,
  $world_history_es$
  [
    {"clue":"¿A orillas de qué río se desarrolló el antiguo Egipto?","answers":["El Amazonas","El Nilo","El Danubio","El Tíber"],"correct":1,"emoji":"🏺"},
    {"clue":"¿En qué región surgieron algunas de las primeras ciudades, entre los ríos Tigris y Éufrates?","answers":["Escandinavia","Los Andes","Mesopotamia","Polinesia"],"correct":2,"emoji":"🧱"},
    {"clue":"¿Qué antigua civilización construyó el Partenón en Atenas?","answers":["La maya","La persa","La vikinga","La griega"],"correct":3,"emoji":"🏛️"},
    {"clue":"¿Qué imperio construyó una extensa red de caminos alrededor del mar Mediterráneo?","answers":["El Imperio inca","El Imperio mongol","El Imperio romano","El Imperio azteca"],"correct":2,"emoji":"🛣️"},
    {"clue":"¿En qué país se encuentra la Gran Muralla?","answers":["China","India","Egipto","Italia"],"correct":0,"emoji":"🐉"},
    {"clue":"¿Qué pueblo construyó la ciudad de Machu Picchu en los Andes?","answers":["Los romanos","Los fenicios","Los incas","Los egipcios"],"correct":2,"emoji":"⛰️"},
    {"clue":"¿Qué invento ayudó a producir libros en grandes cantidades en Europa desde el siglo XV?","answers":["El telescopio","La brújula","El motor de vapor","La imprenta"],"correct":3,"emoji":"📚"},
    {"clue":"¿Qué ruta conectó durante siglos a Asia y Europa mediante el comercio?","answers":["La Ruta del Ámbar","La Ruta de la Seda","El Camino Real","La Ruta de la Sal"],"correct":1,"emoji":"🐫"}
  ]
  $world_history_es$::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
