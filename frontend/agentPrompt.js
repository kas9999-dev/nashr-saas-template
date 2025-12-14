// frontend/agentPrompt.js

const $ = (id) => document.getElementById(id);

const textInput = $("textInput");
const outputBox = $("outputBox");

const runBtn = $("runBtn");
const clearBtn = $("clearBtn");

const copyAllBtn = $("copyAllBtn");
const copyXBtn = $("copyXBtn");
const copyLinkedInBtn = $("copyLinkedInBtn");

const suggestTrendBtn = $("suggestTrendBtn");
const trendAngleInput = $("trendAngleInput");

function bindChips(groupId, hiddenId) {
  const group = $(groupId);
  const hidden = $(hiddenId);
  if (!group || !hidden) return;

  group.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    // remove active
    [...group.querySelectorAll(".chip")].forEach((b) => b.classList.remove("is-active"));
    // set active
    btn.classList.add("is-active");
    // write value
    hidden.value = btn.getAttribute("data-value") || btn.textContent.trim();
  });
}

bindChips("modeGroup", "modeValue");
bindChips("platformGroup", "platformValue");
bindChips("toneGroup", "toneValue");
bindChips("audienceGroup", "audienceValue");

function getPayload() {
  return {
    text: textInput.value || "",
    mode: $("modeValue").value,
    platform: $("platformValue").value,
    tone: $("toneValue").value,
    audience: $("audienceValue").value,
    trendAngle: (trendAngleInput.value || "").trim(),
  };
}

function setOutput(content, isError = false) {
  outputBox.innerHTML = "";
  const div = document.createElement("div");
  div.className = isError ? "output-error" : "output-text";
  div.textContent = content;
  outputBox.appendChild(div);
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function run() {
  const payload = getPayload();
  if (!payload.text.trim()) {
    setOutput("فضلاً اكتب الفكرة/النص أولاً.", true);
    return;
  }

  runBtn.disabled = true;
  runBtn.textContent = "جارٍ التشغيل…";

  try {
    const { ok, data } = await postJSON("/api/run", payload);
    if (!ok || !data?.ok) {
      const msg = data?.error || "حدث خطأ غير معروف";
      setOutput(`❌ خطأ: ${msg}`, true);
      return;
    }

    setOutput(data.output || "—");
  } catch (e) {
    setOutput(`❌ خطأ: ${e?.message || "Network error"}`, true);
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = "⚡ تشغيل";
  }
}

async function suggestTrend() {
  const text = (textInput.value || "").trim();
  if (!text) {
    setOutput("فضلاً اكتب الفكرة/النص أولاً ثم اضغط (اقترح زاوية).", true);
    return;
  }

  suggestTrendBtn.disabled = true;
  suggestTrendBtn.textContent = "…يقترح";

  try {
    const { ok, data } = await postJSON("/api/suggest-trend", {
      platform: $("platformValue").value,
      text,
    });

    if (!ok || !data?.ok) {
      const msg = data?.error || "تعذر اقتراح الزاوية";
      setOutput(`❌ خطأ: ${msg}`, true);
      return;
    }

    // Put the first suggested line into input (user can change)
    const suggestion = (data.suggestion || "").split("\n").map(s => s.trim()).filter(Boolean);
    if (suggestion.length) {
      trendAngleInput.value = suggestion[0].replace(/^[-•\d\)\.]+\s*/g, "").trim();
    } else {
      trendAngleInput.value = "";
    }
  } catch (e) {
    setOutput(`❌ خطأ: ${e?.message || "Network error"}`, true);
  } finally {
    suggestTrendBtn.disabled = false;
    suggestTrendBtn.textContent = "✨ اقترح زاوية";
  }
}

function copyText(text) {
  return navigator.clipboard.writeText(text);
}

function parseOutputs(raw) {
  // If the model returned both versions explicitly, keep raw.
  // Optional: simple extraction if user wrote "LinkedIn:" and "X:".
  const out = String(raw || "").trim();
  const liMatch = out.match(/LinkedIn\s*[:\-]\s*([\s\S]*?)(?:\n\s*(?:X|Twitter)\s*[:\-]|$)/i);
  const xMatch = out.match(/(?:X|Twitter)\s*[:\-]\s*([\s\S]*)$/i);

  return {
    all: out,
    linkedin: liMatch ? liMatch[1].trim() : out,
    x: xMatch ? xMatch[1].trim() : out,
  };
}

copyAllBtn.addEventListener("click", async () => {
  const t = outputBox.textContent || "";
  if (!t.trim()) return;
  await copyText(t);
});

copyLinkedInBtn.addEventListener("click", async () => {
  const t = outputBox.textContent || "";
  if (!t.trim()) return;
  const p = parseOutputs(t);
  await copyText(p.linkedin);
});

copyXBtn.addEventListener("click", async () => {
  const t = outputBox.textContent || "";
  if (!t.trim()) return;
  const p = parseOutputs(t);
  await copyText(p.x);
});

runBtn.addEventListener("click", run);
clearBtn.addEventListener("click", () => {
  textInput.value = "";
  trendAngleInput.value = "";
  setOutput("");
});

suggestTrendBtn.addEventListener("click", suggestTrend);

// Cmd+Enter to run
document.addEventListener("keydown", (e) => {
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  if (isMac && e.metaKey && e.key === "Enter") run();
  if (!isMac && e.ctrlKey && e.key === "Enter") run();
});