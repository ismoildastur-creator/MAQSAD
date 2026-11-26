import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = "Sen MAQSAD ilovasining mehribon, aniq va sabrli AI o‘qituvchisisan. Asosan o‘zbek tilida javob ber. O‘quvchiga mavzuni sodda bosqichlarda, misollar va kichik mashqlar bilan tushuntir. Ingliz tili grammatikasida to‘g‘ri misollar ber. Javoblarni tartibli va ixcham yoz. Agar savol noaniq bo‘lsa, bitta aniqlashtiruvchi savol ber. O‘zingni inson deb tanishtirma. Foydalanuvchidan parol, API kalit yoki boshqa maxfiy ma’lumotlarni so‘rama.";

Deno.serve(async (req: Request) => {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Faqat POST so‘rovi qabul qilinadi." }, 405);

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const auth = req.headers.get("Authorization") || "";
  if (!apiKey || !supabaseUrl || !anonKey) {
    return json({ error: "AI serveri hali sozlanmagan. Administrator Gemini va Supabase server sozlamalarini tekshirishi kerak." }, 503);
  }
  if (!auth.startsWith("Bearer ")) return json({ error: "AI ustozdan foydalanish uchun hisobga kiring." }, 401);

  try {
    const verify = await fetch(supabaseUrl + "/auth/v1/user", {
      headers: { apikey: anonKey, Authorization: auth }
    });
    if (!verify.ok) return json({ error: "Hisob sessiyasi yaroqsiz. Qayta kiring." }, 401);
    const user = await verify.json();
    if (!user?.id) return json({ error: "Foydalanuvchi tasdiqlanmadi." }, 401);

    const body = await req.json();
    const incoming = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    const messages = incoming
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content.slice(0, 1200) }]
      }));
    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return json({ error: "Savolingizni yozing." }, 400);
    }

    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages,
        generationConfig: { temperature: 0.5, maxOutputTokens: 700 }
      })
    });
    const result = await response.json();
    if (!response.ok) {
      const status = response.status === 429 ? 429 : 502;
      const message = response.status === 429
        ? "Bepul AI so‘rov limiti vaqtincha tugadi. Birozdan keyin qayta urinib ko‘ring."
        : "Gemini AI hozir javob bera olmadi. Keyinroq qayta urinib ko‘ring.";
      return json({ error: message }, status);
    }

    const reply = result?.candidates?.[0]?.content?.parts
      ?.map((part: any) => typeof part.text === "string" ? part.text : "")
      .join("")
      .trim();
    if (!reply) return json({ error: "AI javobi olinmadi. Boshqa savol bilan urinib ko‘ring." }, 502);
    return json({ reply });
  } catch (_error) {
    return json({ error: "AI serveriga ulanishda xatolik yuz berdi. Keyinroq qayta urinib ko‘ring." }, 500);
  }
});
