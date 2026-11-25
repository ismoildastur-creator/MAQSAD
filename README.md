# MAQSAD — maqsad va o‘qish ilovasi

MAQSAD — shaxsiy maqsadlarni rejalashtirish, ularga mos o‘quv materiallarini jamlash va bajarilgan ishlarni kuzatish uchun Android ilova.

## Amaldagi sinov versiyasi

- Ilova nomi: **MAQSAD**
- Android application ID: `uz.maqsad.app.final2026`
- Asosiy kod: `www/` va `src/`
- Android qobig‘i: Capacitor 7
- Bulutli xizmat: Supabase Auth, Postgres va Storage

## Foydalanuvchi imkoniyatlari

- Start ekrani va mehmon rejimi — email kiritmasdan foydalanish.
- Ixtiyoriy hisob ochish va hisobga kirish.
- Bir nechta maqsad yaratish va maqsadlar bo‘yicha o‘quv yo‘llarini yuritish.
- Bajarilgan ishlar, fokus rejimi va statistika.
- Qurilmadagi mahalliy saqlash; hisobga kirgach bulut bilan sinxronlash.
- Kutubxonada administrator e’lon qilgan materiallarni ko‘rish.

## Supabase sozlash

GitHub Actions build konfiguratsiyasida quyidagi Actions secrets bo‘lishi kerak:

- `SUPABASE_URL` — Supabase Project URL.
- `SUPABASE_PUBLISHABLE_KEY` — Supabase publishable key.

Hech qachon service-role key yoki OpenAI secret’ni Android ilovasiga yoki GitHub’dagi frontend kodiga yozmang.

### Ma’lumotlar bazasi

Mavjud 0001–0003 migratsiyalardan keyin `supabase/migrations/0004_content_library.sql` migratsiyasini Supabase Dashboard → SQL Editor’da bir marta ishga tushiring. U admin ro‘yxati, materiallar jadvali, private Storage bucket va RLS siyosatlarini yaratadi.

### Administrator huquqi

1. Ilovada admin bo‘ladigan hisobni yarating va zarur bo‘lsa emailni tasdiqlang.
2. Supabase Dashboard → Authentication → Users’dan aynan shu hisob UUID’sini oling.
3. Supabase SQL Editor’da `supabase/ADMIN_SETUP.md` ichidagi INSERT so‘rovini haqiqiy UUID bilan bajaring.

Admin sahifasi: `/admin.html`. Admin panelga kirish serverdagi `is_maqsad_admin()` tekshiruvi bilan himoyalangan; oddiy hisoblar kontentni boshqara olmaydi.

Administrator PDF, MP4/WebM video yoki YouTube havolasini joylashi mumkin. E’lon qilingan materiallar ilova ichida ochiladi. Ayrim YouTube videolari egasi tomonidan embed uchun bloklangan bo‘lishi mumkin.

## AI o‘qituvchi

AI chat interfeysi va Supabase Edge Function kodi mavjud. AI javob berishi uchun alohida server sozlovi talab qilinadi:

1. Supabase Dashboard → Edge Functions → Secrets’da `OPENAI_API_KEY` secret yarating.
2. Supabase CLI orqali `supabase functions deploy maqsad-ai` buyrug‘i bilan funksiyani deploy qiling.
3. `supabase/AI_SETUP.md` dagi ko‘rsatmalarni bajaring.

AI funksiyasi faqat tizimga kirgan foydalanuvchi uchun ishlaydi. API kalitini chatga yubormang va APK ichiga joylamang. OpenAI API ishlatilishi hisobingizda alohida to‘lov talab qilishi mumkin. Secret va deploy tekshirilmaguncha AI’ni faol deb hisoblamang.

## Build va o‘rnatish

GitHub Actions’dagi **Build MAQSAD APK** workflow’ini ishga tushiring. Faqat muvaffaqiyatli yakunlangan run’dan `MAQSAD-debug-apk` artifact’ini oling.

Hozirgi package ID oldingi `uz.maqsad.app` va `uz.maqsad.app.redesign` versiyalaridan farq qiladi; shu sabab ular bilan paket nomi bo‘yicha to‘qnashmaydi. Ammo bu versiya alohida ilova sifatida o‘rnatiladi, eski ilovadagi ma’lumotlarni avtomatik ko‘chirmaydi.

**Muhim:** workflow hozircha standart Android debug signing’dan foydalanadi. Bir APK’ni keyingi APK ustidan yangilab o‘rnatish uchun bir xil imzolash kaliti kerak. Doimiy release keystore xavfsiz sozlanmaguncha kelajakdagi APK’lar ustidan yangilash kafolatlanmaydi. Eski ilovani o‘chirishdan oldin undagi ma’lumotlarni saqlab qo‘ying.

## Tekshiruv chegaralari

Muvaffaqiyatli GitHub Actions build faqat APK yig‘ilganini bildiradi. U Supabase migratsiyasi ishga tushganini, admin UUID kiritilganini, AI secret/deploy bajarilganini yoki ilova real Android qurilmada sinovdan o‘tganini isbotlamaydi. Bu bosqichlar alohida tekshirilishi kerak.

## Texnologiyalar

- HTML, CSS, JavaScript, esbuild
- Capacitor 7 / Android
- Supabase Auth, Postgres, Storage, Edge Functions
- OpenAI API (server tomonda, alohida sozlangandan keyin)
