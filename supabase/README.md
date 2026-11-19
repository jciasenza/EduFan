# Configuración de Supabase

1. Crea un proyecto en Supabase.
2. En **SQL Editor**, ejecuta el contenido de [`schema.sql`](./schema.sql).
3. Copia `.env.example` como `.env.local` en la raíz del proyecto y completa `REACT_APP_SUPABASE_URL` y `REACT_APP_SUPABASE_ANON_KEY` con los datos de **Project Settings → API**.
4. Reinicia `npm start` para que Create React App cargue las variables.
5. En **Authentication → URL Configuration**, configura la URL local y la URL de producción permitida para los enlaces de confirmación de correo.

Usa únicamente la clave pública `anon` en el frontend. Nunca incluyas la clave `service_role` en la aplicación.

Los puntos se guardan en el perfil autenticado: cada respuesta correcta, pareja de memoria o actividad completada otorga un punto. Las rondas de práctica sin iniciar sesión no modifican el acumulado de una cuenta. Si ya ejecutaste una versión anterior de `schema.sql`, vuelve a ejecutar el archivo actualizado para permitir puntos en Historia mundial.
