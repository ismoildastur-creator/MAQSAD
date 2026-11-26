# MAQSAD asosiy admin va adminlarni boshqarish

Bu sozlama MAQSAD hisoblari va Supabase loyihasini boshqarish huquqiga ega loyiha egasi tomonidan bir marta bajariladi.

## 1. Migratsiyalar

Supabase Dashboard → SQL Editor’da quyidagi migratsiyalar tartib bilan bajarilganini tekshiring:

1. `supabase/migrations/0004_content_library.sql`
2. `supabase/migrations/0005_owner_admin_management.sql`

0005 migratsiyasi 0004 dan keyin bajariladi.

## 2. Asosiy adminni bir marta belgilang

1. MAQSAD ilovasida o‘zingizning shaxsiy hisobingizni yarating va tizimga kiring.
2. Supabase Dashboard → Authentication → Users bo‘limidan aynan shu MAQSAD hisobining UUID qiymatini oling. Supabase Dashboard’ga kirish emaili bilan MAQSAD ilovasidagi hisob emailini adashtirmang.
3. SQL Editor’da quyidagi buyruqdagi namunaviy UUID o‘rniga o‘zingizning MAQSAD hisobingiz UUID’sini qo‘ying:

```sql
insert into public.maqsad_owner(user_id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (user_id) do nothing;
```

Bu amal asosiy adminni belgilaydi. `maqsad_owner` jadvaliga oddiy foydalanuvchi yoki yordamchi admin yozuv qo‘sha olmaydi.

## 3. Yordamchi adminlarni boshqarish

1. MAQSAD ilovasida asosiy admin hisobiga kiring.
2. Admin sahifasini oching.
3. Foydalanuvchining Supabase Auth UUID’sini kiriting va **Admin tayinlash** tugmasini bosing.
4. Ro‘yxatda yordamchi adminlar ko‘rinadi. Kerak bo‘lsa **Huquqini bekor qilish** tugmasi bilan adminlikni olib tashlang.

Faqat asosiy admin `maqsad_grant_admin`, `maqsad_revoke_admin` va `maqsad_list_admins` RPC amallarini bajara oladi. Yordamchi admin kontentni boshqaradi, ammo boshqa admin tayinlay olmaydi yoki asosiy admin huquqini o‘zgartira olmaydi.

## Xavfsizlik

- Asosiy adminni faqat ishonchli Supabase SQL Editor muhitidan belgilang.
- Service-role key’ni APK, frontend, GitHub kodi yoki chatga joylamang.
- Admin paneldagi UI yashirilishi yagona himoya emas: ruxsatlar Supabase’dagi RLS va server funksiyalari bilan tekshiriladi.
- Asosiy admin hisobini yo‘qotmang; uni tiklash loyiha egasining Supabase boshqaruv huquqini talab qiladi.
