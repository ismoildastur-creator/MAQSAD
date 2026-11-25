# MAQSAD — Android ilova

MAQSAD — maqsadlarni rejalashtirish va ularga mos o‘quv materiallarini jamlash uchun Android ilova.

## Yangi sinov versiyasi

- Android paket ID: `uz.maqsad.app.redesign`.
- Ilova nomi: `MAQSAD Yangi` (eski MAQSAD bilan birga o‘rnatish uchun alohida test ilovasi).

## Yangi interfeys

- Ilova ochilganda MAQSAD start ekrani ko‘rinadi.
- **Boshlash** orqali email kiritmasdan mehmon rejimida foydalanish mumkin.
- **Ilovaga kirish** profil va ixtiyoriy email/parol hisobini ochadi.
- Foydalanuvchi bir nechta maqsad qo‘shishi mumkin.
- Har bir maqsad uchun kitob, darslik va video qidiruv havolalari shakllantiriladi.
- Maqsadlar va bajarilgan materiallar shu qurilmada saqlanadi; hisobga kirilgach Supabase bilan sinxronlash mo‘ljallangan.
- Bosh sahifa, maqsadlar, Focus Mode, kutubxona, statistika va profil ekranlari mavjud.



## AI o‘qituvchi

- Ilovada MAQSAD AI chat oynasi mavjud.
- AI so‘rovlari autentifikatsiyadan o‘tgan foydalanuvchi uchun Supabase Edge Function orqali yuboriladi.
- OpenAI API kaliti faqat Supabase server secrets ichida saqlanadi; APK yoki frontend kodiga yozilmaydi.
- Ishga tushirish uchun `supabase/AI_SETUP.md` ko‘rsatmasini bajaring va `maqsad-ai` Edge Function’ni deploy qiling. API kaliti sozlanmaguncha AI javob bera olmaydi.
- AI xizmati hisobga kirishni talab qiladi; mehmon rejimi ilovaning qolgan funksiyalari uchun saqlanadi.

## O‘rnatishdagi paket ziddiyatini oldini olish

Yangi build uchun `uz.maqsad.app.final2026` package ID ishlatiladi. Bu oldingi `uz.maqsad.app` va `uz.maqsad.app.redesign` ilovalaridan alohida o‘rnatiladi. Kelajakdagi APK yangilanishlari ustidan o‘rnatilishi uchun bir xil imzolash kaliti saqlanishi kerak; hozirgi workflow standart Android debug signing’dan foydalanadi, shuning uchun boshqa build’dan keyin yangilashda imzo mosligi tekshirilishi lozim.

## Admin paneli va MAQSAD kutubxonasi

- Profil bo‘limidagi **Kontent admin paneli** orqali `admin.html` sahifasiga o‘ting.
- Administrator PDF/kitob fayllari, MP4/WebM video fayllari yoki YouTube video havolalarini joylaydi.
- E’lon qilingan kitoblar PDF o‘quvchi oynasida, YouTube videolari esa ilova ichidagi video pleerda ochiladi. Ayrim YouTube videolarida muallif embed ko‘rishni cheklagan bo‘lishi mumkin.
- Fayllar Supabase Storage’dagi maxsus private bucket’da saqlanadi; e’lon qilingan fayllar vaqtinchalik signed URL orqali o‘qiladi.
- Administrator huquqi `public.maqsad_admins` jadvali va RLS siyosatlari orqali tekshiriladi. Ilova ichiga service-role key kiritilmaydi.
- Dastlab `supabase/migrations/0004_content_library.sql` migratsiyasini SQL Editor’da ishga tushiring. Keyin admin hisobini ro‘yxatga qo‘shish bo‘yicha `supabase/ADMIN_SETUP.md` ko‘rsatmasini bajaring.

## APK yig‘ish

Sinov APK alohida paket nomi bilan yig‘iladi: `uz.maqsad.app.redesign`.

1. **Actions** bo‘limini oching.
2. **Build MAQSAD APK** workflow'ini tanlang.
3. **Run workflow** tugmasini bosing yoki branch push build'ini kuting.
4. Build tugagach **Artifacts** ichidan `MAQSAD-debug-apk` faylini yuklab oling.
5. ZIP arxivini ochib, `app-debug.apk` faylini Android telefoningizga o‘rnating.

## Texnologiyalar

- Capacitor 7, HTML/CSS/JavaScript
- Supabase Auth va Postgres
- Android debug APK

## Eslatma

Maqsadga mos materiallar hozircha ishonchli platformalarning qidiruv sahifalari va bepul resurslariga havolalar shaklida tavsiya qilinadi. Ilova hali AI orqali shaxsiy dars mazmunini avtomatik yaratmaydi; bunday imkoniyat keyingi bosqichda alohida AI backend bilan qo‘shilishi mumkin.
