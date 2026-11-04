"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DailySet, Flashcard } from "./types";
import {
  addCardToDailySet,
  deleteDailySet,
  loadAllCards,
  loadDailySets,
  saveAllCards,
} from "./lib/storage";
import { getTasteTag } from "./lib/taste";
import { getLinguaNick, importLinguaWords, setLinguaNick } from "./lib/lingua";

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
}

export default function HomePage() {
  // ✅ C-1: 언어 선택형 입력 (default EN)
  const [lang, setLang] = useState<"en" | "fr" | "zh">("en");

  // 입력값(단어/뜻)
  const [en, setEn] = useState("");
  const [meaning, setMeaning] = useState("");

  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [sets, setSets] = useState<DailySet[]>([]);

  const today = useMemo(() => todayLocal(), []);

  const refresh = useCallback(() => {
    setAllCards(loadAllCards());
    setSets(loadDailySets());
  }, []);

  // 🔗 링구아 단어 가져오기 (열 때 자동 + 버튼)
  const [linguaNick, setLinguaNickState] = useState("");
  const [linguaMsg, setLinguaMsg] = useState("");

  const runLinguaImport = useCallback(async () => {
    if (!getLinguaNick()) return;
    setLinguaMsg("링구아 단어 확인 중...");
    try {
      const { added, skipped } = await importLinguaWords();
      setLinguaMsg(
        added
          ? `✅ 링구아에서 ${added}개 가져왔어요${skipped ? ` (이미 있거나 넣을 칸이 없는 ${skipped}개 제외)` : ""}`
          : skipped
          ? `링구아 단어 ${skipped}개는 이미 단어장에 있거나 넣을 칸이 없어서 건너뛰었어요`
          : "새로 가져올 링구아 단어가 없어요 (이미 다 가져왔어요)"
      );
      refresh();
    } catch (e) {
      setLinguaMsg(`❌ ${(e as Error).message}`);
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
    setLinguaNickState(getLinguaNick());
    runLinguaImport();
  }, [refresh, runLinguaImport]);

  const addNewCard = useCallback(() => {
    const head = en.trim();
    if (!head) return;

    const card: Flashcard = {
      id: uid(),

      en: "",
      fr: "",
      zh: "",
      hanja: "",

      enMeaning: "",
      frMeaning: "",
      zhMeaning: "",
      hanjaMeaning: "",

      pronunciation: "",
      frPronunciation: "",
      zhPronunciation: "",
      hanjaPronunciation: "",

      example: "",
      exampleFr: "",
      exampleZh: "",

      flipCount: 0,
      createdAt: today,
    };

    const m = meaning.trim();

    if (lang === "en") {
      card.en = head;
      card.enMeaning = m;
    } else if (lang === "fr") {
      card.fr = head;
      card.frMeaning = m;
    } else if (lang === "zh") {
      card.zh = head;
      card.zhMeaning = m;
    }

    const nextAll = [card, ...allCards];
    setAllCards(nextAll);
    saveAllCards(nextAll);

    addCardToDailySet(today, card);

    setEn("");
    setMeaning("");
    setSets(loadDailySets());
  }, [allCards, en, meaning, today, lang]);

  const onDeleteSet = useCallback((date: string) => {
    deleteDailySet(date);
    setSets(loadDailySets());
  }, []);

  const needsReviewCount = useMemo(
    () => allCards.filter((c) => (c.flipCount ?? 0) >= 5).length,
    [allCards]
  );

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">👨‍🍳 나만의 Ratatouille</h1>
          <p className="mt-1 text-sm text-slate-600">
            오늘의 재료(단어)를 넣고, 오늘의 Rata로 학습하고, 덜익은 재료로 복습해요.
          </p>
        </header>

        {/* 🍳 입력 섹션 */}
        <section className="rounded-2xl bg-white ring-1 ring-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">🍳 오늘은 무엇을 넣어먹을까?</h2>
          <p className="mt-1 text-sm text-slate-600">언어를 고르고, 단어와 뜻을 넣어주세요.</p>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-slate-600">새로운 단어</span>
              <input
                className="h-11 rounded-xl ring-1 ring-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-400"
                placeholder={lang === "en" ? "예: all" : lang === "fr" ? "예: tout" : "예: 全部"}
                value={en}
                onChange={(e) => setEn(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-slate-600">언어 선택</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as "en" | "fr" | "zh")}
                className="h-11 rounded-xl ring-1 ring-slate-200 px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="en">🇺🇸 English</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="zh">🇨🇳 中文</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-slate-600">뜻</span>
              <input
                className="h-11 rounded-xl ring-1 ring-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="예: 모두 / 전부"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
              />
            </label>

            <button
              type="button"
              onClick={addNewCard}
              className="mt-1 h-11 rounded-xl
              bg-[color:var(--chef-brown)] text-white text-sm font-semibold
              hover:bg-[color:var(--chef-brown-hover)]
              active:opacity-90 transition"
            >
              🍞 재료 추가하기
            </button>
          </div>
        </section>

        {/* 🔗 링구아 연결 */}
        <section className="mt-6 rounded-2xl bg-white ring-1 ring-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">🔗 링구아 단어 가져오기</h2>
          <p className="mt-1 text-sm text-slate-600">
            링구아에서 저장한 단어가 이 단어장을 열 때 자동으로 오늘 세트에 들어와요. 링구아 별명을 한 번만 적어주세요.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              className="h-11 flex-1 min-w-0 rounded-xl ring-1 ring-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="링구아 별명"
              value={linguaNick}
              onChange={(e) => setLinguaNickState(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                if (!linguaNick.trim()) { setLinguaMsg("별명을 적어주세요"); return; }
                setLinguaNick(linguaNick);
                runLinguaImport();
              }}
              className="h-11 px-4 rounded-xl
              bg-[color:var(--chef-olive)] text-white text-sm font-semibold
              hover:bg-[color:var(--chef-olive-hover)]
              active:opacity-90 transition"
            >
              가져오기
            </button>
          </div>
          {linguaMsg ? <p className="mt-2 text-xs text-slate-600">{linguaMsg}</p> : null}
          {linguaMsg.startsWith("✅") ? (
            <Link
              href={`/study/${today}`}
              className="mt-2 inline-flex w-full items-center justify-center h-10 rounded-xl
              bg-[color:var(--chef-olive)] text-white text-sm font-semibold
              hover:bg-[color:var(--chef-olive-hover)]
              active:opacity-90 transition"
            >
              🍽 가져온 카드 보기 (오늘 {today} 세트)
            </Link>
          ) : null}
        </section>

        {/* 🍽 / 🧄 이동 섹션 */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-5 flex flex-col">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">🍽 오늘의 Rata</h2>
              <p className="mt-1 text-sm text-slate-600">오늘 입력된 카드로 학습해요.</p>
            </div>

            <Link
              href={`/study/${today}`}
              className="mt-auto inline-flex w-full items-center justify-center h-11 rounded-xl
              bg-[color:var(--chef-olive)] text-white text-sm font-semibold
              hover:bg-[color:var(--chef-olive-hover)]
              active:opacity-90 transition"
            >
              🍽 오늘의 Rata 열기
            </Link>
          </div>

          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-5 flex flex-col">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">🧄 덜익은 재료</h2>
              <p className="mt-1 text-sm text-slate-600">
                반복이 필요한 카드(flip 5회 이상)만 모아봐요.
              </p>
            </div>

            <Link
              href={`/review`}
              className="mt-auto inline-flex w-full items-center justify-center h-11 rounded-xl
              bg-[color:var(--chef-red)] text-white text-sm font-semibold
              hover:bg-[color:var(--chef-red-hover)]
              active:opacity-90 transition"
            >
              🧄 덜익은 재료 열기 ({needsReviewCount})
            </Link>
          </div>
        </section>

        {/* 📒 세트 목록 */}
        <section className="mt-6 rounded-2xl bg-white ring-1 ring-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">📒 Rata 목록</h2>
          <p className="mt-1 text-sm text-slate-600">날짜별 세트를 확인/삭제할 수 있어요.</p>

          <div className="mt-4 grid gap-3">
            {sets.length === 0 ? (
              <div className="text-sm text-slate-500">아직 만든 세트가 없어요.</div>
            ) : (
              sets.map((s) => {
                const tag = getTasteTag(s.taste);

                return (
                  <div
                    key={s.date}
                    className="flex items-center justify-between gap-3 rounded-xl ring-1 ring-slate-200 bg-white/60 px-3 py-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900">{s.date}</div>

                        {/* ✅ 맛 태그 (자동 색/이모지) */}
                        {s.taste?.trim() ? (
                          <span
                            className={[
                              "max-w-[200px] truncate px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1",
                              tag.className,
                            ].join(" ")}
                            title={s.taste}
                          >
                            <span aria-hidden>{tag.emoji}</span>
                            <span>{tag.label}</span>
                          </span>
                        ) : null}
                      </div>

                      <div className="text-xs text-slate-500">카드 {s.cards.length}개</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/study/${s.date}`}
                        className="h-9 px-3 inline-flex items-center justify-center rounded-lg
                        bg-[color:var(--chef-olive)] text-white text-xs font-semibold
                        hover:bg-[color:var(--chef-olive-hover)]
                        active:opacity-90 transition"
                      >
                        🍽 확인
                      </Link>

                      <button
                        type="button"
                        onClick={() => onDeleteSet(s.date)}
                        className="h-9 px-3 inline-flex items-center justify-center rounded-lg
                        bg-[color:var(--chef-brown)] text-white text-xs font-semibold
                        hover:bg-[color:var(--chef-brown-hover)]
                        active:opacity-90 transition"
                      >
                        🧺 삭제
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={refresh}
            className="mt-4 h-10 rounded-xl w-full
            bg-[color:var(--chef-brown)] text-white text-sm font-semibold
            hover:bg-[color:var(--chef-brown-hover)]
            active:opacity-90 transition"
          >
            🔄 목록 새로고침
          </button>
        </section>
      </div>
    </main>
  );
}
