# Pasos para publicar esta actualización

1. Abre **Supabase → SQL Editor**.
2. Ejecuta todo el contenido de `supabase_downloads_setup.sql` una sola vez.
3. Ejecuta `supabase_pricing_setup.sql` una sola vez para habilitar **Admin → Pricing** y evitar el aviso “Pricing setup missing”.
4. Publica los archivos del sitio actualizados.
5. En **Admin → Downloads**, asigna a cada categoría uno de estos accesos:
   - **Todos**: visitantes y miembros.
   - **Sólo ePeak+**: miembros premium, teachers, courtesy y admins.

Los archivos sin categoría aparecen en **General Downloads** y siempre requieren que el visitante inicie sesión, aunque tenga una cuenta gratuita.

En **Admin → Users**, haz clic en cualquier tarjeta de estadísticas para filtrar la tabla. La tarjeta **Total Users** elimina el filtro; el buscador de nombre o correo se puede usar al mismo tiempo.


En **Admin → Pricing**, si ves “Pricing setup missing”, ejecuta `supabase_pricing_setup.sql` en Supabase SQL Editor y vuelve a presionar **Refresh**.

## Academic Management Phase 1

Before deploying `/teachers`, apply `supabase/migrations/202607280001_phase1_academic_management.sql` to the production Supabase project (with `supabase db push` when the project is linked, or by pasting the file into the Supabase SQL Editor). The migration creates the canonical `ep_*` tables, RLS policies, helper functions, triggers, and initial teacher profile rows, then asks PostgREST to reload its schema cache. Deploy the static application files after the migration. No new environment variables or authentication changes are required.

### Student payments in Supabase SQL Editor

Apply all timestamped academic migrations in order. If the student-payment
migration was interrupted, run
`supabase/sql-editor/student_payment_currencies.sql`. Copy the contents of that
`.sql` file only: `diff --git`, `---`, `+++`, and leading patch `+` characters are
Git review syntax, not SQL.

The SQL Editor script is safe to resume because it uses `ADD COLUMN IF NOT
EXISTS`, `DROP CONSTRAINT IF EXISTS`, and `CREATE INDEX IF NOT EXISTS` before
reloading the PostgREST schema cache.

## Account closure

Apply `supabase/migrations/202607300001_account_closure.sql` before deploying the profile account-closure UI and `/api/close-account`. The endpoint uses the existing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `STRIPE_SECRET_KEY` environment variables. Keep the service-role key server-side: the migration only grants its cleanup function to `service_role`.

## Multiple open pay days

Before deploying the updated `/teachers` application, apply
`supabase/migrations/202610150001_multiple_open_pay_days.sql` after the earlier
academic migrations. It preserves existing reports and gives each teacher one
report per pay day, including when two pay dates fall within the same week.
Activate each desired date in **Payments → Activate pay day**. Activating another
date leaves existing dates open. All open dates appear on the administrator and
teacher overviews, and each date has its own reporting or closing action.

## Reopening pay days

Admins can reopen a date through **Payments → Activate pay day** or
**Previously closed pay days → Reopen reporting** on Overview or Payments.
Reopening changes only that pay day's status and preserves the original period,
creator, and submitted reports. Other open pay days stay active. Selecting an
already-open date succeeds without creating a duplicate. This fix needs no new
migration beyond the multiple-open-pay-days migration above.
