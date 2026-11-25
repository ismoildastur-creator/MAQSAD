import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method !== "POST") return json({ error: "Faqat POST so‘rovi qabul qilinadi." }, 405);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const auth = req.headers.get("Authorization") || "";
  if (!apiKey || !supabaseUrl || !anonKey) return json({ error: "AI serveri hali sozlanmagan. Administrator OPENAI_API_KEY va Supabase secrets ni sozlashi kerak." }, 503);
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
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 1200) }));
    if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "Savolingizni yozing." }, 400);

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Sen MAQSAD ilovasining mehribon, aniq va sabrli AI o‘qituvchisisan. Asosan o‘zbek tilida javob ber. O‘quvchiga mavzuni sodda bosqichlarda, misollar va kichik mashqlar bilan tushuntir. Ingliz tili grammatikasida to‘g‘ri misollar ber. Javoblarni tartibli va ixcham yoz. Agar savol noaniq bo‘lsa, bitta aniqlashtiruvchi savol ber. Hech qachon o‘zingni inson deb tanishtirma." },
          ...messages
        ],
        temperature: 0.5,
        max_tokens: 700
      })
    });
    const result = await completion.json();
    if (!completion.ok) {
      const message = result?.error?.message || "AI provayderi javob bermadi.";
      return json({ error: "AI xizmati xatosi: " + message.slice(0, 220) }, 502);
    }
    const reply = result?.choices?.[0]?.message?.content?.trim();
    if (!reply) return json({ error: "AI javobi olinmadi." }, 502);
    return json({ reply });
  } catch (error) {
    return json({ error: "Server xatosi: " + String(error?.message || error).slice(0, 180) }, 500);
  }
});
