"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { DailySet, Flashcard } from "../../types";
import CardViewer from "../../components/CardViewer";
import { loadDailySets, updateCardEverywhere } from "../../lib/storage";

export default function StudyPage({ params }: { params: { date: string } }) {
  const date = params.date;
  const [set, setSet] = useState<DailySet | null>(null);

  // ✅ flipCount 반영을 너무 즉시 하면(리렌더/재정렬) 플립 애니메이션이 깨질 수 있어 약간 지연
  const flipTimerRef = useRef<number | null>(null);

  const refresh = useCallback(() => {
    const sets = loadDailySets();
    const found = sets.find((s) => s.date === date) || null;
    setSet(found);
  }, [date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) {
        window.clearTimeout(flipTimerRef.current);
        flipTimerRef.current = null;
      }
    };
  }, []);

  const onFlipCard = useCallback(
    (cardId: string) => {
      if (!set?.cards?.length) return;

      // 같은 순간 연타 시 이전 타이머 취소
      if (flipTimerRef.current) {
        window.clearTimeout(flipTimerRef.current);
        flipTimerRef.current = null;
      }

      const current = set.cards.find((c) => c.id === cardId);
      if (!current) return;

      // 1) 저장은 즉시
      const updated: Flashcard = { ...current, flipCount: (current.flipCount ?? 0) + 1 };
      updateCardEverywhere(updated);

      // 2) state 반영은 살짝 늦게(플립 애니메이션 먼저 보이게)
      flipTimerRef.current = window.setTimeout(() => {
        setSet((prev) => {
          if (!prev) return prev;
          return { ...prev, cards: prev.cards.map((c) => (c.id === cardId ? updated : c)) };
        });
        flipTimerRef.current = null;
      }, 250);
    },
    [set]
  );

  const onUpdateCard = useCallback((updated: Flashcard) => {
    updateCardEverywhere(updated);
    setSet((prev) => {
      if (!prev) return prev;
      return { ...prev, cards: prev.cards.map((c) => (c.id === updated.id ? updated : c)) };
    });
  }, []);

  if (!set) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <Link href="/" className="text-sm text-slate-600 hover:underline">
            ← 🏠 대문으로
          </Link>

          <div className="mt-6 rounded-2xl bg-white ring-1 ring-slate-200 p-6">
            <div className="text-lg font-semibold text-slate-900">🍽 오늘의 Rata</div>
            <div className="mt-2 text-sm text-slate-600">{date} 세트를 찾을 수 없어요.</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm text-slate-600 hover:underline">
            ← 🏠 대문으로
          </Link>
          <div className="text-sm text-slate-500">📅 {date}</div>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">🍽 오늘의 Rata</h1>
        <p className="mt-1 text-sm text-slate-600">
          카드 탭으로 앞/뒤를 확인해요. (앞→뒤로 갈 때만 flip이 +1)
        </p>

        <div className="mt-6">
          <CardViewer
            cards={set.cards}
            onFlipCard={onFlipCard}
            onUpdateCard={onUpdateCard}
            showDateInfo
            mode="study"
            sessionDate={date}
          />
        </div>
      </div>
    </main>
  );
}
