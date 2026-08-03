import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL('../supabase/migrations/202608030002_repair_teacher_directory.sql', import.meta.url);

test('teacher directory migration is admin-only and repairs PostgREST access', async () => {
  const sql = await readFile(migrationUrl, 'utf8');
  assert.match(sql, /security definer/i);
  assert.match(sql, /where public\.ep_is_admin\(\)/i);
  assert.match(sql, /revoke all on function public\.ep_admin_teacher_directory\(\) from public, anon/i);
  assert.match(sql, /grant execute on function public\.ep_admin_teacher_directory\(\) to authenticated/i);
  assert.match(sql, /insert into public\.ep_teacher_profiles/i);
  assert.match(sql, /notify pgrst, 'reload schema'/i);
});
