import OpenAI from "openai";

export default async function apiRun(req, res) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: "Missing OPENAI_API_KEY (set it in Render Environment Variables)."
      });
    }

    const client = new OpenAI({ apiKey });

    const { text, platform = "Both", tone = "احترافية", audience = "رواد الأعمال" } = req.body || {};
    const inputText = String(text || "").trim();

    if (!inputText) {
      return res.status(400).json({ ok: false, error: "text is required" });
    }

    const prompt = `
أنت مساعد كتابة محتوى احترافي.
اكتب محتوى جاهز للنشر وفق البيانات:

Platform: ${platform}
Tone: ${tone}
Audience: ${audience}

الفكرة/الموضوع:
${inputText}

قواعد الإخراج:
- لا تكتب أي شرح تقني.
- إذا Platform = Both: أعطني نسختين: (LinkedIn) ثم (X) كل نسخة بعنوانها.
- اجعل النص منسقًا وواضحًا وقابلًا للنسخ.
`.trim();

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const response = await client.responses.create({
      model,
      input: prompt
    });

    const outputText =
      response.output_text ||
      (response.output?.[0]?.content?.[0]?.text ?? "");

    return res.json({ ok: true, output: outputText || "No output" });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Unknown server error"
    });
  }
}