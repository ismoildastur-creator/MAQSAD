# MAQSAD admin setup

1. Run `supabase/migrations/0004_content_library.sql` in the Supabase SQL Editor after the existing MAQSAD migrations.
2. Create an account in the MAQSAD app (or use an existing account) and confirm its email if email confirmation is enabled.
3. In Supabase Dashboard -> Authentication -> Users, copy the UUID of the account that should administer content.
4. Run the following in SQL Editor, replacing the example UUID with that exact account UUID:

```sql
insert into public.maqsad_admins(user_id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (user_id) do nothing;
```

Only accounts listed in `public.maqsad_admins` can upload, publish, edit, or delete library materials. Do not put service-role keys in the Android app or GitHub client bundle. The app uses only the Supabase publishable key; database RLS enforces administrator access.

Admin page: open `admin.html` from the deployed app origin (or `/admin.html` in the Android WebView). It uses the same email/password account as the app.

The app's Library section displays published materials. PDF files are opened in the in-app document viewer; YouTube links are embedded in the in-app video player. Some YouTube videos may disallow embedding due to the uploader's settings.
