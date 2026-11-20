-- Juego: stories
-- Volumen: 1 | Nivel: 3
-- Incluye los idiomas disponibles para este nivel.
-- DO NOTHING evita sobrescribir contenido existente al agregar niveles.

insert into public.game_content (game_id, language, volume, level, content, is_published)
values
(
  'stories',
  'en',
  1,
  3,
  $stories_en_level_3$
  [
    {"title":"The Silent Forest","story":"One morning, the forest animals noticed that the stream was no longer making a sound. They went closer and discovered that several branches and leaves were blocking the water. The beaver suggested working together. The rabbits removed the leaves, the birds carried small branches, and the beaver moved the larger logs. Soon, the water began flowing again.","question":"What allowed the stream to flow again?","correct":"The animals working together","options":["A strong storm","The animals working together","The arrival of new animals","The growth of the trees"],"emoji":"🌳"},
    {"title":"The Mysterious Letter","story":"Martin found a letter under the door. It had no name or address, only a drawing of a key and a sentence: 'Look where we keep our memories.' Martin thought about his grandmother's old chest. Inside, he found photographs and a small box containing a medal that had belonged to his grandfather.","question":"Why did Martin look inside his grandmother's chest?","correct":"Because memories might be kept there","options":["Because he wanted to find money","Because memories might be kept there","Because he heard a noise","Because he needed a new key"],"emoji":"📜"},
    {"title":"The Last Tree","story":"In a village surrounded by buildings, there was only one large tree left in the square. Children played in its shade, and birds built nests in its branches. One day, a machine arrived to remove it and build a parking lot. The neighbors gathered, explained its importance, and suggested another place for parking. Finally, the tree remained in the square.","question":"What did the neighbors achieve by organizing themselves?","correct":"They prevented the tree from being removed","options":["They built more buildings","They prevented the tree from being removed","They closed the square","They planted trees inside their houses"],"emoji":"🌲"},
    {"title":"Grandma's Recipe","story":"Lucy wanted to make her grandmother's favorite cake. She followed the recipe but forgot to add the baking powder. When she took the cake out of the oven, it was much flatter than expected. Instead of getting upset, her grandmother explained what each ingredient did, and together they made another cake that turned out fluffy.","question":"Why was the first cake too flat?","correct":"Because Lucy forgot to add the baking powder","options":["Because she used too much flour","Because Lucy forgot to add the baking powder","Because the oven was off","Because she added too much fruit"],"emoji":"🎂"},
    {"title":"The Paper Bridge","story":"At school, the teacher suggested building a bridge using only paper. Pablo's team used a flat sheet, but it bent when they placed a coin on it. Another team folded the paper like an accordion and managed to hold several coins. Pablo studied their design and decided to try it too.","question":"What did Pablo learn by watching the other team?","correct":"The shape of the paper could make it stronger","options":["Paper is not useful for building","The shape of the paper could make it stronger","Coins were too light","He needed to use glue"],"emoji":"🌉"}
  ]
  $stories_en_level_3$::jsonb,
  true
),
(
  'stories',
  'es',
  1,
  3,
  $stories_es_level_3$
  [
    {"title":"El bosque silencioso","story":"Una mañana, los animales del bosque notaron que el arroyo ya no hacía ruido. Se acercaron y descubrieron que varias ramas y hojas bloqueaban el paso del agua. El castor propuso trabajar en equipo. Los conejos retiraron las hojas, los pájaros llevaron ramitas y el castor movió los troncos más grandes. Al poco tiempo, el agua volvió a correr.","question":"¿Qué permitió que el arroyo volviera a fluir?","correct":"El trabajo en equipo de los animales","options":["Una fuerte tormenta","El trabajo en equipo de los animales","La llegada de nuevos animales","El crecimiento de los árboles"],"emoji":"🌳"},
    {"title":"La carta misteriosa","story":"Martín encontró una carta debajo de la puerta. No tenía nombre ni dirección, solo un dibujo de una llave y una frase: 'Busca donde guardamos los recuerdos'. Martín pensó en el viejo baúl de su abuela. Al abrirlo, encontró fotografías y una pequeña caja con una medalla que había pertenecido a su abuelo.","question":"¿Por qué Martín buscó en el baúl de su abuela?","correct":"Porque allí podían estar guardados los recuerdos","options":["Porque quería encontrar dinero","Porque allí podían estar guardados los recuerdos","Porque escuchó un ruido","Porque necesitaba una llave nueva"],"emoji":"📜"},
    {"title":"El último árbol","story":"En un pueblo rodeado de edificios quedaba un solo árbol grande en la plaza. Los niños jugaban bajo su sombra y los pájaros construían nidos en sus ramas. Un día llegó una máquina para quitarlo y construir un estacionamiento. Los vecinos se reunieron, explicaron su importancia y propusieron otro lugar para estacionar. Finalmente, el árbol permaneció en la plaza.","question":"¿Qué lograron los vecinos al organizarse?","correct":"Evitar que quitaran el árbol","options":["Construir más edificios","Evitar que quitaran el árbol","Cerrar la plaza","Plantar árboles dentro de las casas"],"emoji":"🌲"},
    {"title":"La receta de la abuela","story":"Lucía quería preparar la torta favorita de su abuela. Siguió la receta, pero olvidó agregar el polvo de hornear. Cuando sacó la torta del horno, estaba mucho más baja de lo esperado. En lugar de frustrarse, la abuela le explicó para qué servía cada ingrediente y juntas prepararon otra torta que quedó esponjosa.","question":"¿Por qué la primera torta quedó demasiado baja?","correct":"Porque Lucía olvidó agregar el polvo de hornear","options":["Porque usó demasiada harina","Porque Lucía olvidó agregar el polvo de hornear","Porque el horno estaba apagado","Porque agregó demasiada fruta"],"emoji":"🎂"},
    {"title":"El puente de papel","story":"En la escuela, la maestra propuso construir un puente usando solamente papel. El equipo de Pablo hizo una hoja plana, pero se dobló cuando colocaron una moneda. Otro equipo dobló el papel en forma de acordeón y consiguió sostener varias monedas. Pablo observó el diseño y decidió probarlo también.","question":"¿Qué aprendió Pablo al observar al otro equipo?","correct":"Que la forma del papel podía hacerlo más resistente","options":["Que el papel no sirve para construir","Que la forma del papel podía hacerlo más resistente","Que las monedas eran demasiado livianas","Que debía usar pegamento"],"emoji":"🌉"}
  ]
  $stories_es_level_3$::jsonb,
  true
)
on conflict (game_id, language, volume, level) do nothing;
