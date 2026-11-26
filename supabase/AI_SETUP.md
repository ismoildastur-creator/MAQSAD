# MAQSAD AI tutor — Google Gemini

MAQSAD AI ustozida Google Gemini 2.5 Flash ishlatiladi. Gemini API’da bepul tarif mavjud, ammo so‘rovlar soni va tezligi limitlangan; bepul tarif mavjudligi uzluksiz yoki cheksiz ishlash kafolati emas.

## Server sozlamasi

1. Google AI Studio va Gemini API bo‘yicha amaldagi foydalanish shartlarini ko‘rib chiqing. Hisob ochish yoki API kalit boshqaruvi yoshga oid cheklovlarga bog‘liq bo‘lishi mumkin; zarur bo‘lsa ota-ona/vasiy yordamida bajaring.
2. Gemini API kalitini yarating. Kalitni hech kimga yubormang, chatga yozmang va APK yoki GitHub kodiga joylamang.
3. Supabase Dashboard → Edge Functions → Secrets bo‘limida `GEMINI_API_KEY` nomli secret yarating va kalitni shu yerga kiriting.
4. Supabase CLI orqali funksiyani deploy qiling:

```bash
supabase functions deploy maqsad-ai
```

Funksiya Supabase Auth sessiyasini tekshiradi va API kalitini faqat serverda ishlatadi. AI chat hozircha tizimga kirgan foydalanuvchilar uchun; mehmon rejimida AI chatdan foydalanish uchun hisobga kirish kerak.

## Model va bepul tarif haqida

- Model: `gemini-2.5-flash`
- Gemini rasmiy narxlash sahifasida ushbu model uchun bepul tarif ko‘rsatilgan.
- Bepul tarifda kunlik/daqiqalik limitlar va mavjudlik hudud hamda hisobga qarab farq qilishi mumkin.
- Bepul tarifda yuborilgan ma’lumotlar Google mahsulotlarini yaxshilash uchun ishlatilishi mumkin. Shu sababli chatga parol, telefon raqami, manzil yoki boshqa maxfiy ma’lumotlarni kiritmang.

Rasmiy ma’lumot: https://ai.google.dev/gemini-api/docs/pricing
