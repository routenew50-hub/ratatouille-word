"use client";

// 링구아(lingua.routenew50.workers.dev)에서 저장한 단어 가져오기
// 링구아는 Supabase(family-hub-system)의 study_words 표에 별명 기준으로 저장한다.
// 여기서는 "아직 안 가져온 것"(마지막으로 가져온 id 다음부터)만 읽어서 카드로 만든다.
// 가져와도 링구아 쪽 단어는 그대로 남는다(복사).

import type { Flashcard } from "../types";
import { addCardToDailySet, loadAllCards, saveAllCards } from "./storage";
import { formatDate } from "./utils";

const SB_URL = "https://usxludhmhucxlocpcwdr.supabase.co";
// 공개용 anon 키 (링구아 화면 코드에 들어 있는 것과 같은 키)
const SB_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzeGx1ZGhtaHVjeGxvY3Bjd2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNjA2NzEsImV4cCI6MjA4NzgzNjY3MX0.8WG5hguKKk4taHgZ6N0Mzwp8VARVJ4OpO8iogtbAREY";

const KEY_NICK = "cw_lingua_nick";
// v2: 처음 버전이 category("기본")를 언어로 잘못 읽어 단어를 건너뛰고 id만 넘어갔던 것 → 처음부터 다시 가져오기
const KEY_LAST_ID = "cw_lingua_last_id_v2";

type Row = {
  id: number;
  word: string;
  meaning: string | null;
  example: string | null;
  lang: string | null; // 링구아의 학습 언어 (en/fr/zh/ja), 예전 단어는 비어 있음 (category는 다른 앱이 쓰는 칸)
  created_at: string;
};

export function getLinguaNick(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY_NICK) || "";
}

export function setLinguaNick(nick: string) {
  const n = nick.trim();
  if (n === getLinguaNick()) return;
  localStorage.setItem(KEY_NICK, n);
  localStorage.removeItem(KEY_LAST_ID); // 별명이 바뀌면 처음부터 다시 가져오기
}

// 언어 표시가 없는 예전 단어는 글자 모양으로 짐작
function guessLang(word: string): "en" | "fr" | "zh" {
  if (/[一-鿿]/.test(word)) return "zh";
  if (/[àâæçéèêëîïôœùûüÿ]/i.test(word)) return "fr";
  return "en";
}

/** 새 링구아 단어를 카드로 가져오고, 가져온 개수를 돌려준다 */
export async function importLinguaWords(): Promise<{ added: number; skipped: number }> {
  const nick = getLinguaNick();
  if (!nick) return { added: 0, skipped: 0 };
  const lastId = Number(localStorage.getItem(KEY_LAST_ID) || "0");

  const q =
    `select=id,word,meaning,example,lang,created_at` +
    `&nickname=eq.${encodeURIComponent(nick)}&id=gt.${lastId}&order=id.asc`;
  const res = await fetch(`${SB_URL}/rest/v1/study_words?${q}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });
  if (!res.ok) throw new Error(`링구아 단어를 못 가져왔어요 (${res.status})`);
  const rows = (await res.json()) as Row[];
  if (!rows.length) return { added: 0, skipped: 0 };

  const all = loadAllCards();
  let added = 0;
  let skipped = 0;

  for (const r of rows) {
    const word = (r.word || "").trim();
    const cat = r.lang || guessLang(word);
    if (!word || !["en", "fr", "zh"].includes(cat)) {
      skipped++; // 일본어 등 단어장에 칸이 없는 언어
      continue;
    }
    const lang = cat as "en" | "fr" | "zh";
    const dup = all.some((c) => (c[lang] || "").trim().toLowerCase() === word.toLowerCase());
    if (dup) {
      skipped++;
      continue;
    }

    const date = formatDate(new Date(r.created_at));
    const card: Flashcard = {
      id: `lingua-${r.id}`,
      en: "", fr: "", zh: "", hanja: "",
      enMeaning: "", frMeaning: "", zhMeaning: "", hanjaMeaning: "",
      pronunciation: "", frPronunciation: "", zhPronunciation: "", hanjaPronunciation: "",
      example: "", exampleFr: "", exampleZh: "",
      flipCount: 0,
      createdAt: date,
    };
    const meaning = (r.meaning || "").trim();
    const example = (r.example || "").trim();
    if (lang === "en") { card.en = word; card.enMeaning = meaning; card.example = example; }
    if (lang === "fr") { card.fr = word; card.frMeaning = meaning; card.exampleFr = example; }
    if (lang === "zh") { card.zh = word; card.zhMeaning = meaning; card.exampleZh = example; }

    all.unshift(card);
    addCardToDailySet(date, card);
    added++;
  }

  saveAllCards(all);
  localStorage.setItem(KEY_LAST_ID, String(rows[rows.length - 1].id));
  return { added, skipped };
}
