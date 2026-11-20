-- Juego: stories
-- Volumen: 1 | Nivel: 2
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'stories',
  'en',
  1,
  2,
  $stories_en_level_2$
  [
    {"title":"The Exploring Dog","story":"Max went into the garden with his favorite ball. While playing, he heard a small meow behind a bush. There he found a kitten that could not get down from a tree. Max barked to call his owner, who helped the kitten climb down.","question":"Why did Max start barking?","correct":"To let someone know there was a kitten in the tree","options":["Because he wanted food","To let someone know there was a kitten in the tree","Because he lost his ball","Because he heard music"],"emoji":"🐶"},
    {"title":"The New Bicycle","story":"Sofia received a bicycle for her birthday. At first, she was afraid of falling and asked her older brother for help. He held the seat while she pedaled. After several tries, Sofia managed to ride alone through the park.","question":"How did her brother help Sofia?","correct":"He held the bicycle seat","options":["He bought her a helmet","He held the bicycle seat","He drove her in a car","He taught her to fix a wheel"],"emoji":"🚲"},
    {"title":"The Surprise Picnic","story":"Mateo's friends organized a picnic in the park. Each person brought something different: Ana made sandwiches, Lucas brought juice, and Martina baked cookies. When Mateo arrived, everyone shouted surprise. They had prepared his favorite food to celebrate his birthday.","question":"Why did they organize the picnic?","correct":"To celebrate Mateo's birthday","options":["To study together","To celebrate Mateo's birthday","To sell food","To practice sports"],"emoji":"🧺"},
    {"title":"The Traveling Cloud","story":"A little cloud wanted to discover the world. It traveled over mountains, rivers, and cities. In a village, it found a dry field where the plants needed water. So it made a gentle rain and continued its journey happily.","question":"Why did the cloud decide to make rain?","correct":"Because the plants needed water","options":["Because it wanted to hide the Sun","Because the plants needed water","Because it wanted to create a river","Because it was cold"],"emoji":"☁️"},
    {"title":"The Stopped Clock","story":"There was an old clock in Elena's house that stopped working. Her grandfather checked it and discovered that it needed a new battery. Elena found one in a drawer and gave it to him. Soon, the clock started telling time again.","question":"What did the clock need to work again?","correct":"A new battery","options":["A string","A new battery","A different glass","Some water"],"emoji":"⏰"}
  ]
  $stories_en_level_2$::jsonb,
  true
),
(
  'stories',
  'es',
  1,
  2,
  $stories_es_level_2$
  [
    {"title":"El perro explorador","story":"Max salió al jardín con su pelota favorita. Mientras jugaba, escuchó un pequeño maullido detrás de un arbusto. Allí encontró un gatito que no podía bajar de un árbol. Max ladró para llamar a su dueña, quien ayudó al gatito a bajar.","question":"¿Por qué Max comenzó a ladrar?","correct":"Para avisar que había un gatito en el árbol","options":["Porque quería comer","Para avisar que había un gatito en el árbol","Porque perdió su pelota","Porque escuchó música"],"emoji":"🐶"},
    {"title":"La bicicleta nueva","story":"Sofía recibió una bicicleta para su cumpleaños. Al principio tenía miedo de caerse y pidió ayuda a su hermano mayor. Él sostuvo el asiento mientras ella pedaleaba. Después de varios intentos, Sofía logró avanzar sola por el parque.","question":"¿Qué hizo el hermano para ayudar a Sofía?","correct":"Sostuvo el asiento de la bicicleta","options":["Le compró un casco","Sostuvo el asiento de la bicicleta","La llevó en automóvil","Le enseñó a reparar una rueda"],"emoji":"🚲"},
    {"title":"El picnic sorpresa","story":"Los amigos de Mateo organizaron un picnic en el parque. Cada uno llevó algo diferente: Ana preparó sándwiches, Lucas llevó jugo y Martina hizo galletas. Cuando Mateo llegó, todos gritaron sorpresa. Habían preparado su comida favorita para celebrar su cumpleaños.","question":"¿Por qué organizaron el picnic?","correct":"Para celebrar el cumpleaños de Mateo","options":["Para estudiar juntos","Para celebrar el cumpleaños de Mateo","Para vender comida","Para practicar deportes"],"emoji":"🧺"},
    {"title":"La nube viajera","story":"Una nube pequeña quería descubrir el mundo. Viajó sobre montañas, ríos y ciudades. En un pueblo encontró un campo seco donde las plantas necesitaban agua. Entonces dejó caer una lluvia suave y siguió su camino feliz.","question":"¿Por qué la nube decidió dejar caer lluvia?","correct":"Porque las plantas necesitaban agua","options":["Porque quería esconder el Sol","Porque las plantas necesitaban agua","Porque quería formar un río","Porque tenía frío"],"emoji":"☁️"},
    {"title":"El reloj detenido","story":"En la casa de Elena había un reloj antiguo que dejó de funcionar. Su abuelo lo revisó y descubrió que necesitaba una pila nueva. Elena buscó una en un cajón y se la entregó. Poco después, el reloj volvió a marcar la hora.","question":"¿Qué necesitaba el reloj para funcionar otra vez?","correct":"Una pila nueva","options":["Una cuerda","Una pila nueva","Un vidrio diferente","Un poco de agua"],"emoji":"⏰"}
  ]
  $stories_es_level_2$::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
