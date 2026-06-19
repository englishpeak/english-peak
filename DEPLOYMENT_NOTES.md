# Pasos para publicar esta actualización

1. Abre **Supabase → SQL Editor**.
2. Ejecuta todo el contenido de `supabase_downloads_setup.sql` una sola vez.
3. Publica los archivos del sitio actualizados.
4. En **Admin → Downloads**, asigna a cada categoría uno de estos accesos:
   - **Todos**: visitantes y miembros.
   - **Sólo ePeak+**: miembros premium, teachers, courtesy y admins.

Los archivos sin categoría aparecen en **General Downloads** y siempre requieren que el visitante inicie sesión, aunque tenga una cuenta gratuita.

En **Admin → Users**, haz clic en cualquier tarjeta de estadísticas para filtrar la tabla. La tarjeta **Total Users** elimina el filtro; el buscador de nombre o correo se puede usar al mismo tiempo.
