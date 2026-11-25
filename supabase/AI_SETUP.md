# MAQSAD AI tutor sozlash

AI o‘qituvchi kodi ilovaga qo‘shilgan, ammo OpenAI API kaliti APK ichiga kiritilmaydi. U faqat Supabase Edge Function server secret sifatida saqlanishi kerak.

Supabase CLI orqali:
```bash
supabase secrets set OPENAI_API_KEY=YOUR_OPENAI_API_KEY
supabase functions deploy maqsad-ai
```

Supabase Dashboard -> Edge Functions -> Secrets bo‘limidan ham `OPENAI_API_KEY` qo‘shish mumkin. So‘ng `maqsad-ai` Edge Function’ni deploy qiling. Funksiya faqat tizimga kirgan MAQSAD foydalanuvchisiga javob beradi; mehmon rejimida AI chatdan foydalanish uchun avval hisobga kirish talab qilinadi. API kalitini hech qachon ilova ichiga, GitHub kodiga yoki chatga joylamang.

Model: `gpt-4o-mini`. API sarfi OpenAI hisobingizga bog‘liq; foydalanish uchun billing yoqilgan bo‘lishi mumkin.
