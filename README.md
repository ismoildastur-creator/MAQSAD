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

## APK yig‘ish

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
