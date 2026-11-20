-- Juego: stories
-- Volumen: 1 | Nivel: 1
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'stories',
  'en',
  1,
  1,
  $stories_en_level_1$
  [
    {"title":"The Traveling Seed","story":"A tiny seed fell from a sunflower and the wind carried it to a garden. The rain woke it up. Days later, a yellow flower grew and waved at the Sun.","question":"What helped wake the seed?","correct":"The rain","options":["The rain","A butterfly","The snow","The wind"],"emoji":"🌻"},
    {"title":"The Lake Star","story":"Lily the firefly saw a light on the lake and thought it was a lost star. She flew closer and discovered the Moon shining in the water.","question":"What was the light on the lake?","correct":"The Moon's reflection","options":["The Moon's reflection","A fallen star","A flashlight","A firefly"],"emoji":"🌙"},
    {"title":"The Red Umbrella","story":"Tom found a red umbrella at the school entrance. It was raining, but he waited under the roof until Nina came back for it. She smiled, and they walked home together.","question":"What did Tom do when he found the umbrella?","correct":"He waited for Nina","options":["He took it home","He waited for Nina","He left it in the rain","He gave it to a friend"],"emoji":"☔"},
    {"title":"The Snail Race","story":"Four snails had a race to a lettuce leaf. Tim moved slowly but never stopped. When he arrived, his friends cheered because he kept trying.","question":"Why did Tim's friends cheer?","correct":"He did not give up","options":["He came first","He had a bicycle","He did not give up","He found some food"],"emoji":"🐌"},
    {"title":"Bruno's Map","story":"Bruno drew a map to find the apple tree in the park. He followed the arrows, crossed a little bridge, and found fruit to share with his friends.","question":"What did Bruno find by following the map?","correct":"An apple tree","options":["An apple tree","A boat","A new house","A treasure chest"],"emoji":"🍎"}
  ]
  $stories_en_level_1$::jsonb,
  true
),
(
  'stories',
  'es',
  1,
  1,
  $stories_es_level_1$
  [
    {"title":"La semilla viajera","story":"Una semillita cayó de un girasol y el viento la llevó hasta un jardín. La lluvia la despertó y, con los días, creció una flor amarilla que saludaba al Sol.","question":"¿Qué ayudó a despertar a la semilla?","correct":"La lluvia","options":["La lluvia","Una mariposa","La nieve","El viento"],"emoji":"🌻"},
    {"title":"La estrella del lago","story":"Lila, una pequeña luciérnaga, vio una luz en el lago y pensó que era una estrella perdida. Voló hasta la orilla y descubrió que la Luna se reflejaba en el agua.","question":"¿Qué era la luz que Lila vio en el lago?","correct":"El reflejo de la Luna","options":["El reflejo de la Luna","Una estrella caída","Una linterna","Una luciérnaga"],"emoji":"🌙"},
    {"title":"El paraguas rojo","story":"Tomás encontró un paraguas rojo en la entrada de la escuela. Aunque llovía, esperó bajo el techo hasta que Nina volvió a buscarlo. Ella sonrió y compartieron el camino a casa.","question":"¿Qué hizo Tomás cuando encontró el paraguas?","correct":"Esperó a que Nina volviera","options":["Se lo llevó a casa","Esperó a que Nina volviera","Lo dejó bajo la lluvia","Lo regaló a un amigo"],"emoji":"☔"},
    {"title":"La carrera de caracoles","story":"Cuatro caracoles organizaron una carrera hasta la hoja de lechuga. Tito avanzó despacito, pero no se detuvo. Cuando llegó, sus amigos lo aplaudieron por no rendirse.","question":"¿Por qué aplaudieron los amigos a Tito?","correct":"Porque no se rindió","options":["Porque llegó primero","Porque tenía una bicicleta","Porque no se rindió","Porque encontró comida"],"emoji":"🐌"},
    {"title":"El mapa de Bruno","story":"Bruno dibujó un mapa para encontrar el manzano del parque. Siguió las flechas, cruzó el puente pequeño y encontró fruta para compartir con sus amigos.","question":"¿Qué encontró Bruno al seguir el mapa?","correct":"Un manzano","options":["Un manzano","Un barco","Una casa nueva","Un tesoro de monedas"],"emoji":"🍎"}
  ]
  $stories_es_level_1$::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
