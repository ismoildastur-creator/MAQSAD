# MAQSAD — Supabase ulash

## 1. Supabase loyihasini yarating

1. https://supabase.com/dashboard sahifasiga kiring.
2. **New project** orqali yangi loyiha yarating.
3. Database parolini xavfsiz joyda saqlang; uni GitHub'ga yoki ilova kodiga yozmang.
4. Loyiha tayyor bo‘lgach, **Project Settings → API** bo‘limidan Project URL va publishable/anon key qiymatini oling.

## 2. Ma’lumotlar bazasini yarating

1. Supabase loyihasida **SQL Editor → New query** ni oching.
2. Ushbu repodagi `supabase/schema.sql` faylning to‘liq tarkibini joylashtiring.
3. **Run** tugmasini bosing.
4. Table Editor bo‘limida `profiles`, `goals`, `tasks`, `focus_sessions`, `user_settings` va `learning_progress` jadvallari yaratilganini tekshiring.

Schema foydalanuvchi ma’lumotlarini ajratish uchun Row Level Security (RLS) siyosatlarini yoqadi. Har bir foydalanuvchi faqat o‘z yozuvlarini o‘qishi va o‘zgartirishi mumkin.

## 3. Ilova konfiguratsiyasi

1. `www/supabase-config.example.js` faylidan nusxa oling.
2. Nusxani `www/supabase-config.js` nomi bilan saqlang.
3. `url` va `anonKey` qiymatlarini o‘z Supabase loyihangizdan oling.
4. `www/supabase-config.js` Git'ga yuborilmasin. U `.gitignore` orqali himoyalanishi kerak.

Faqat publishable/anon key ishlatiladi. **service_role key**, database paroli yoki boshqa maxfiy kalitlarni Android ilovasiga kiritmang.

## 4. Hozirgi ishlab chiqish bosqichi

Ushbu birinchi bosqich ma’lumotlar bazasi sxemasi va xavfsiz konfiguratsiya shablonini tayyorlaydi. Keyingi bosqichda ilovaga email orqali ro‘yxatdan o‘tish/kirish, foydalanuvchi profili, maqsadlar va vazifalarni Supabase bilan sinxronlash qo‘shiladi.

Supabase loyihasi URL va publishable/anon key taqdim etilmaguncha jonli backend ulanishini tekshirib bo‘lmaydi. Bu qiymatlar service_role kaliti emas.
