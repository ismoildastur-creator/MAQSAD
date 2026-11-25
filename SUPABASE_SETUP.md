# MAQSAD — Supabase ulash

Ilova hozir ham internet bo‘lmasa mahalliy rejimda ishlaydi. Supabase sozlangach email orqali hisob yaratish/kirish va ayrim ma’lumotlarni bulut bilan sinxronlash yoqiladi.

## 1. GitHub Actions Secrets

Repozitoriyda **Settings → Secrets and variables → Actions → New repository secret** bo‘limini oching va quyidagi ikkita qiymatni qo‘shing:

- `SUPABASE_URL` = `https://cehalvphavswgauofxsq.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY` = Supabase **Publishable key** (odatda `sb_publishable_` bilan boshlanadi).

**Secret key** yoki **service_role key** ishlatmang. Kalitlarni kodga joylamang va commit qilmang. Publishable key ilova mijozida ishlatish uchun mo‘ljallangan, lekin foydalanuvchi ma’lumotlarini RLS himoya qilishi shart.

## 2. API ruxsatlari migratsiyasi

Siz allaqachon `0001_initial_schema.sql` va `0002_schema_hardening.sql` migratsiyalarini bajargansiz. Endi Supabase **SQL Editor** ichida ushbu repodagi `supabase/migrations/0003_api_grants.sql` faylini bir marta ishga tushiring.

Bu migratsiya autentifikatsiyadan o‘tgan foydalanuvchiga o‘z jadval yozuvlari bilan ishlash uchun SQL ruxsatlarini beradi. Mavjud RLS siyosatlari foydalanuvchilarni bir-birining ma’lumotlaridan ajratishda davom etadi.

## 3. APK build

`Build MAQSAD APK` workflow build vaqtida GitHub Secrets’dan `www/supabase-config.js` faylini yaratadi va Supabase klientini bundle qiladi. Ushbu yaratilgan konfiguratsiya Git’ga yuborilmaydi.

Secrets qo‘shilmagan bo‘lsa, APK baribir yig‘iladi, lekin faqat mahalliy rejimda ishlaydi. Secrets qo‘shilgach workflow’ni qayta ishga tushiring.

## 4. Hozirgi bulut sinxronizatsiyasi

Ushbu versiya email/parol orqali ro‘yxatdan o‘tish va kirishni, shuningdek boshlang‘ich maqsadlar, kundalik checklist vazifalari hamda kunlik XP/vazifa statistikasini sinxronlashni qo‘llaydi. Demo kurslar/kitoblar va fokus sessiyalari tarixi hozircha bulutga ulanmagan.
## 5. Tekshirish

Ikkala GitHub Actions Secret qo‘shilgandan keyin yangi APK build ishga tushiring. Workflow logidagi `Generate Supabase client configuration` qadamida `Supabase client configuration generated.` yozuvi chiqishi kerak. Agar `local-only mode` yozuvi chiqsa, secret nomlari yoki qiymatlari to‘g‘ri qo‘shilmagan.
