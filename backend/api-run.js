import OpenAI from "openai";

/**
 * POST /api/run
 * Body: { text: string, platform?: "LinkedIn"|"X"|"Both", tone?: string, audience?: string }
 * Returns: { ok: true, output: string }
 */
export default async function apiRun(req, res) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: "Missing OPENAI_API_KEY (set it in Render Environment Variables).",
      });
    }

    const client = new OpenAI({ apiKey });

    const {
      text,
      platform = "Both",
      tone = "احترافية",
      audience = "رواد الأعمال",
    } = req.body || {};

    const inputText = String(text || "").trim();
    if (!inputText) {
      return res.status(400).json({ ok: false, error: "text is required" });
    }

    // حماية بسيطة من إدخالات ضخمة (تسبب بطء/تكلفة/أخطاء)
    if (inputText.length > 5000) {
      return res.status(400).json({
        ok: false,
        error: "text is too long (max 5000 characters).",
      });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    // نطلب إخراج منظم جدًا (حتى لو كانت الفكرة عامة)
    const system = `
أنت مساعد كتابة محتوى عربي احترافي متخصص في LinkedIn و X.
مهمتك: تحويل فكرة المستخدم إلى محتوى جاهز للنشر.
الالتزام:
- لا تكتب أي شرح تقني أو تبريرات.
- لا تذكر أنك نموذج ذكاء اصطناعي.
- اجعل النص قابل للنسخ مباشرة.
- استخدم عربي فصيح مبسّط.
`.trim();

    const user = `
المعطيات:
Platform = ${platform}
Tone = ${tone}
Audience = ${audience}

الفكرة/الموضوع:
${inputText}

قواعد الإخراج (إلزامي):
1) إذا Platform = Both:
   - اطبع بالضبط هذا التنسيق:
     LinkedIn:
     <نص لينكدإن>

     X:
     <نص X>
2) إذا Platform = LinkedIn: اطبع فقط:
   LinkedIn:
   <نص لينكدإن>
3) إذا Platform = X: اطبع فقط:
   X:
   <نص X>

قواعد أسلوب LinkedIn:
- 6 إلى 12 سطر تقريبًا
- بداية قوية + نقاط واضحة + خاتمة CTA بسيطة
- هاشتاقات 3 إلى 6 في النهاية

قواعد أسلوب X:
- مختصر وقوي (حتى 280 حرف تقريبًا)
- هاشتاقات 1 إلى 3
`.trim();

    const response = await client.responses.create({
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      // إعدادات تحفظ جودة ثابتة
      temperature: 0.7,
      max_output_tokens: 700,
    });

    const raw =
      response.output_text ||
      (response.output?.[0]?.content?.[0]?.text ?? "") ||
      "";

    const output = String(raw).trim();

    if (!output) {
      return res.status(500).json({ ok: false, error: "Empty output from model" });
    }

    return res.json({ ok: true, output });
  } catch (err) {
    // تشخيص في logs بدون تفاصيل حساسة
    console.error("api-run error:", err?.message || err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Unknown server error",
    });
  }
}