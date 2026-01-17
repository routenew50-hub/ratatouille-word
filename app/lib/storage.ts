"use client";

import type { DailySet, Flashcard } from "../types";

const KEY_DAILY_SETS = "cw_daily_sets";
const KEY_ALL_CARDS = "cw_all_cards";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadAllCards(): Flashcard[] {
  if (typeof window === "undefined") return [];
  return safeParse<Flashcard[]>(localStorage.getItem(KEY_ALL_CARDS), []);
}

export function saveAllCards(cards: Flashcard[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_ALL_CARDS, JSON.stringify(cards));
}

export function loadDailySets(): DailySet[] {
  if (typeof window === "undefined") return [];
  return safeParse<DailySet[]>(localStorage.getItem(KEY_DAILY_SETS), []);
}

export function saveDailySets(sets: DailySet[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_DAILY_SETS, JSON.stringify(sets));
}

/** ✅ 오늘 날짜 세트에 카드 추가(세트 없으면 생성) */
export function addCardToDailySet(date: string, card: Flashcard) {
  const sets = loadDailySets();
  const idx = sets.findIndex((s) => s.date === date);

  if (idx === -1) {
    sets.unshift({ date, cards: [card] });
  } else {
    // 같은 id가 있으면 중복 추가 방지
    const exists = sets[idx].cards.some((c) => c.id === card.id);
    if (!exists) sets[idx].cards.unshift(card);
  }

  saveDailySets(sets);
}

/** ✅ 세트 삭제 (원래 이름) */
export function deleteDailySet(date: string) {
  const sets = loadDailySets().filter((s) => s.date !== date);
  saveDailySets(sets);
}

/** ✅ (호환) DailySetList.tsx에서 deleteSet import하는 경우 */
export const deleteSet = deleteDailySet;

/** ✅ 카드 업데이트(전체 카드 + 세트 카드 동시 반영) */
export function updateCardEverywhere(updated: Flashcard) {
  // all cards
  const all = loadAllCards().map((c) => (c.id === updated.id ? updated : c));
  saveAllCards(all);

  // daily sets
  const sets = loadDailySets().map((set) => ({
    ...set,
    cards: set.cards.map((c) => (c.id === updated.id ? updated : c)),
  }));
  saveDailySets(sets);
}

/** ✅ 오늘의 맛 저장 */
export function updateDailySetTaste(date: string, taste: string) {
  const sets = loadDailySets();
  const next = sets.map((s) => (s.date === date ? { ...s, taste } : s));
  saveDailySets(next);
}

/**
 * ✅ 특정 날짜 세트를 CSV 문자열로 변환
 * - DailySetList.tsx에서 exportToCSV(date)로 호출
 */
export function exportToCSV(date: string): string {
  if (typeof window === "undefined") return "";

  const set = loadDailySets().find((s) => s.date === date);
  if (!set) return "";

  // CSV에 쓸 때 줄바꿈/따옴표 안전 처리
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    const needs = /[",\n\r]/.test(s);
    const doubled = s.replace(/"/g, '""');
    return needs ? `"${doubled}"` : doubled;
  };

  // 헤더: 필요하면 필드 더 추가 가능
  const header = [
    "id",
    "headword",
    "en_text",
    "fr_text",
    "zh_text",
    "han_text",
    "knownCount",
    "learningCount",
  ];

  const lines: string[] = [];
  lines.push(header.join(","));

  for (const c of set.cards ?? []) {
    lines.push(
      [
        esc(c.id),
        esc((c as any).headword ?? ""),
        esc((c as any).en_text ?? ""),
        esc((c as any).fr_text ?? ""),
        esc((c as any).zh_text ?? ""),
        esc((c as any).han_text ?? ""),
        esc((c as any).knownCount ?? ""),
        esc((c as any).learningCount ?? ""),
      ].join(",")
    );
  }

  return lines.join("\r\n");
}
