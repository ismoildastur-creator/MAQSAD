# MAQSAD — maqsad va o‘qish ilovasi

MAQSAD — shaxsiy maqsadlarni rejalashtirish, ularga mos o‘quv materiallarini jamlash va bajarilgan ishlarni kuzatish uchun Android ilova.

## Amaldagi sinov versiyasi

- Ilova nomi: **MAQSAD**
- Android application ID: `uz.maqsad.app.final2026`
- Asosiy kod: `www/` va `src/`
- Android qobig‘i: Capacitor 7
- Bulutli xizmat: Supabase Auth, Postgres va Storage

## Foydalanuvchi imkoniyatlari

- Start ekrani va mehmon rejimi — hisob ochmasdan mahalliy foydalanish.
- Ixtiyoriy hisob ochish va hisobga kirish.
- Bir nechta maqsad yaratish va maqsadlar bo‘yicha o‘quv yo‘llarini yuritish.
- Bajarilgan ishlar, fokus rejimi va statistika.
- Mahalliy saqlash; hisobga kirgach bulut bilan sinxronlash.
- Kutubxonada administrator e’lon qilgan materiallarni ko‘rish.

## Supabase sozlash

GitHub Actions build konfiguratsiyasida quyidagi Actions secrets bo‘lishi kerak:

- `SUPABASE_URL` — Supabase Project URL.
- `SUPABASE_PUBLISHABLE_KEY` — Supabase publishable key.

Hech qachon service-role key yoki Gemini secret’ni Android ilovasiga yoki frontend kodiga yozmang.

### Ma’lumotlar bazasi

Supabase Dashboard → SQL Editor’da migratsiyalarni tartib bilan bajaring:

1. `supabase/migrations/0004_content_library.sql`
2. `supabase/migrations/0005_owner_admin_management.sql`

Oldingi 0001–0003 migratsiyalar allaqachon qo‘llangan bo‘lishi kerak. 0004 kutubxona, admin tekshiruvi, private Storage va RLS siyosatlarini yaratadi. 0005 asosiy admin va yordamchi adminlar ierarxiyasini qo‘shadi.

### Asosiy admin va yordamchi adminlar

1. MAQSAD ilovasida o‘zingiz foydalanadigan hisobni yarating va tizimga kiring.
2. Supabase Dashboard → Authentication → Users’dan aynan shu MAQSAD hisobining UUID’sini oling.
3. `supabase/OWNER_ADMIN_SETUP.md` dagi bir martalik SQL orqali shu UUID’ni `maqsad_owner` jadvaliga kiriting.
4. Ilovadagi Admin sahifasiga shu hisob bilan kiring. Asosiy admin panelida yordamchi adminlarni UUID orqali tayinlash, ro‘yxatni ko‘rish va adminlikni bekor qilish mumkin.

Oddiy foydalanuvchilarga admin panel ochilmaydi. Yordamchi adminlar kontentni boshqarishi mumkin, ammo boshqa admin tayinlay olmaydi yoki asosiy admin huquqini o‘zgartira olmaydi. Huquqlar frontend ko‘rinishigagina emas, Supabase RLS va serverdagi RPC tekshiruvlariga ham bog‘langan.

Administrator PDF, MP4/WebM video yoki YouTube manbasini joylashi mumkin. E’lon qilingan materiallar kutubxonada ko‘rinadi. Ayrim YouTube videolari egasi tomonidan embed uchun bloklangan bo‘lishi mumkin.

## AI o‘qituvchi — Google Gemini

AI chat interfeysi va Supabase Edge Function kodi mavjud. AI javob berishi uchun:

1. Google AI Studio’da Gemini API kalitini oling. Hisob yoki kalit yaratish yoshga oid shartlarga bog‘liq bo‘lishi mumkin; zarur bo‘lsa ota-ona/vasiy yordamida bajaring.
2. Supabase Dashboard → Edge Functions → Secrets’da `GEMINI_API_KEY` secret yarating.
3. Supabase CLI orqali `supabase functions deploy maqsad-ai` buyrug‘i bilan funksiyani deploy qiling.
4. `supabase/AI_SETUP.md` ko‘rsatmalariga amal qiling.

AI funksiyasi Supabase Auth sessiyasini tekshiradi va Gemini kalitini faqat serverda ishlatadi. AI chat hozircha tizimga kirgan foydalanuvchilar uchun; mehmon rejimida AI ishlashi uchun hisobga kirish kerak. Gemini bepul kvotasi cheklangan va doimiy ishlash kafolati emas. Bepul tarifdagi ma’lumotlardan Google mahsulotlarini yaxshilash uchun foydalanilishi mumkin; chatga maxfiy ma’lumot kiritmang.

## Build va o‘rnatish

GitHub Actions’dagi **Build MAQSAD APK** workflow’ini ishga tushiring. Faqat muvaffaqiyatli yakunlangan run’dan `MAQSAD-debug-apk` artifact’ini oling.

Hozirgi package ID oldingi `uz.maqsad.app` va `uz.maqsad.app.redesign` versiyalaridan farq qiladi; shu sabab ular bilan paket nomi bo‘yicha to‘qnashmaydi. Bu versiya alohida ilova sifatida o‘rnatiladi va eski ilovadagi ma’lumotlarni avtomatik ko‘chirmaydi.

**Muhim:** workflow hozircha Android debug signing’dan foydalanadi. Keyingi APK’ni avvalgisining ustidan yangilab o‘rnatish uchun bir xil imzolash kaliti kerak. Doimiy release keystore sozlanmaguncha yangilash kafolatlanmaydi. Eski ilovani o‘chirmang.

## Tekshiruv chegaralari

Muvaffaqiyatli GitHub Actions build faqat APK yig‘ilganini bildiradi. U Supabase migratsiyalari ishga tushganini, asosiy admin UUID kiritilganini, Gemini secret/deploy bajarilganini yoki ilova real Android qurilmada sinovdan o‘tganini isbotlamaydi. Bu bosqichlar alohida tekshirilishi kerak.

## Texnologiyalar

- HTML, CSS, JavaScript, esbuild
- Capacitor 7 / Android
- Supabase Auth, Postgres, Storage, Edge Functions
- Google Gemini API (server tomonda, alohida sozlangandan keyin)
