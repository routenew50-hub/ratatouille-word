"use client";

export async function translateText(
  text: string,
  targetLang: "fr" | "zh" | "ko"
): Promise<string> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLang }),
  });

  if (!res.ok) throw new Error("translateText failed");
  const data = (await res.json()) as { translated?: string };
  return data.translated ?? "";
}

export async function getExampleSentences(word: string): Promise<string[]> {
  const res = await fetch("/api/examples", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word }),
  });

  if (!res.ok) throw new Error("getExampleSentences failed");
  const data = (await res.json()) as { examples?: string[] };
  return Array.isArray(data.examples) ? data.examples : [];
}

export async function checkGrammar(
  text: string
): Promise<{ corrected: string; errors: any[] }> {
  const res = await fetch("/api/grammar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error("checkGrammar failed");
  const data = (await res.json()) as { corrected?: string; errors?: any[] };

  return {
    corrected: data.corrected ?? "",
    errors: Array.isArray(data.errors) ? data.errors : [],
  };
}
