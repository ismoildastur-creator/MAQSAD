# MAQSAD asosiy admin va adminlarni boshqarish

## 1. Asosiy adminni bir marta belgilang

1. MAQSAD ilovasida o'zingizning shaxsiy hisobingizni yarating va tizimga kiring.
2. Supabase Dashboard -> Authentication -> Users bo'limidan aynan shu hisobning UUID qiymatini oling.
3. SQL Editor'da quyidagi buyruqdagi UUID o'rniga o'zingiznikini qo'ying:

```sql
insert into public.maqsad_owner(user_id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (user_id) do nothing;
```

Bu amal faqat 0005 migratsiyasi bajarilgandan keyin ishlaydi. Asosiy admin ro'yxati alohida jadvalda saqlanadi; oddiy adminlar ushbu jadvalni o'qiy yoki o'zgartira olmaydi.

## 2. Boshqa adminni tayinlash

Faqat asosiy admin quyidagi RPC'ni chaqira oladi:

```sql
select public.maqsad_grant_admin('TARGET-USER-UUID');
```

## 3. Adminlikni bekor qilish

```sql
select public.maqsad_revoke_admin('TARGET-USER-UUID');
```

## 4. Adminlar ro'yxati

```sql
select * from public.maqsad_list_admins();
```

## Muhim xavfsizlik

- Asosiy admin huquqini faqat Supabase SQL Editor kabi ishonchli loyiha egasi muhitidan `maqsad_owner` jadvaliga yozish orqali belgilang.
- Oddiy foydalanuvchi yoki yordamchi admin hech qachon o'zini asosiy admin qila olmaydi.
- Hech qachon service-role key'ni APK, frontend yoki GitHub kodiga joylamang.
- Admin panelda admin ro'yxatini boshqarish interfeysi hali alohida frontend vazifasi; hozircha yuqoridagi SQL/RPC amallari bilan boshqariladi.
