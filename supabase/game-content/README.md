# Organización de `public.game_content`

Esta carpeta reemplaza al archivo anterior `supabase/game-content.sql`.

## Estructura

- `schema.sql`: creación/configuración de la tabla, constraint, RLS y permisos. Ejecutar una sola vez.
- `games/<game_id>/volume-XX/level-XX.sql`: contenido de cada nivel. Cada archivo incluye los idiomas disponibles (español e inglés).

## Cómo integrarlo al proyecto

1. En `supabase/`, eliminá o renombrá el archivo viejo `game-content.sql`.
2. Copiá la carpeta `game-content/` de este paquete directamente dentro de `supabase/`.
3. No modifiques `game-catalog.sql`, `game-progress.sql`, `game-storage.sql` ni `schema.sql` del proyecto.
4. Si la tabla `public.game_content` ya existe y está configurada, no vuelvas a ejecutar `game-content/schema.sql` salvo que necesites aplicar cambios de estructura.
5. Para cargar el contenido inicial, ejecutá los archivos de niveles que necesites desde el SQL Editor de Supabase. Podés ejecutar varios archivos en una misma sesión, pero respetá que `schema.sql` se ejecute antes si la tabla todavía no existe.

## Agregar un nivel nuevo

Creá, por ejemplo:

`games/stories/volume-01/level-06.sql`

Copiá el formato de otro nivel del mismo juego y agregá una fila `es` y otra `en`. Cambiá `level` a `6` en ambas filas. Usá `do nothing` para evitar pisar accidentalmente un nivel existente.

Para corregir un nivel ya cargado intencionalmente, cambiá el final a:

```sql
on conflict (game_id, language, volume, level) do update
set content = excluded.content,
    is_published = excluded.is_published,
    updated_at = now();
```

## Importante

- Los identificadores `game_id` deben coincidir exactamente con los que usa el frontend y el catálogo.
- Para un volumen nuevo, incrementá `volume` y normalmente empezá con `level = 1`.
- Los duplicados originales de `stories`, volumen 1, nivel 1 se consolidaron conservando la última versión del SQL original, que era la que terminaba prevaleciendo por `on conflict do update`.
- Los archivos nuevos usan `do nothing`: son seguros para agregar contenido sin reemplazar filas que ya estén cargadas.
