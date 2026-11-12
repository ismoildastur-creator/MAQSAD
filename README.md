# MAQSAD — Android ilova

MAQSAD interaktiv prototipini Android APK sifatida yig‘ish uchun Capacitor loyihasi.

## GitHub Actions orqali APK yig‘ish (Android Studio kerak emas)

1. **Actions** bo‘limini oching.
2. **Build MAQSAD APK** workflow'ini tanlang.
3. **Run workflow** tugmasini bosing.
4. Jarayon tugagach, natijadagi **Artifacts** qismidan `MAQSAD-debug-apk` faylini yuklab oling.
5. ZIP arxivini ochib, `app-debug.apk` faylini Android telefoningizga o‘rnating. O‘rnatishda telefonda noma’lum manbalardan ilova o‘rnatishga ruxsat so‘ralishi mumkin.

Workflow `main` yoki `master` branch'iga yangi commit yuborilganda ham avtomatik ishga tushadi.

## Loyiha haqida

- Ilova nomi: **MAQSAD**
- Android application ID: `uz.maqsad.app`
- Web interfeys: `www/index.html`
- Texnologiya: Capacitor 7
- Build muhiti: Node.js 20, JDK 17, GitHub Actions Android SDK

## Hozirgi prototip chegaralari

Maqsadlar, vazifalar va XP ma’lumotlari qurilmaning `localStorage` xotirasida saqlanadi. Pomodoro taymeri ilova ochiq turganda ishlaydi. Kutubxonadagi video va kitoblar hozircha demo kontent; haqiqiy video/PDF/EPUB, akkaunt va bulutli sinxronlash, Android bildirishnomalari hamda boshqa ilovalarni bloklash hali ishlab chiqilmagan.

## Release

Hozirgi workflow sinov va shaxsiy o‘rnatish uchun **debug APK** yaratadi. Google Play uchun keyinchalik imzolangan release APK/AAB va signing secrets sozlanishi kerak.
