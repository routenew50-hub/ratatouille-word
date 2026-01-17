"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Flashcard } from "../types";
import CardViewer from "../components/CardViewer";
import { loadAllCards, updateCardEverywhere } from "../lib/storage";

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]">
      <div className="rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm shadow-lg">
        {message}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const all = loadAllCards();
    const review = all.filter((c) => (c.flipCount ?? 0) >= 5);
    setCards(review);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 토스트 자동 닫기
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const count = useMemo(() => cards.length, [cards.length]);

  const onUpdateCard = useCallback((updated: Flashcard) => {
    updateCardEverywhere(updated);
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);

  const onMarkReviewed = useCallback((card: Flashcard) => {
    // ✅ 복습 완료: flipCount를 기준 이하로 내려서 "덜익은 재료"에서 제거
    const updated: Flashcard = { ...card, flipCount: 0 };
    updateCardEverywhere(updated);

    setCards((prev) => prev.filter((c) => c.id !== card.id));
    setToast("✅ 복습 완료! 덜익은 재료에서 제거했어요.");
  }, []);

  return (
    <main className="min-h-screen">
      {toast ? <Toast message={toast} /> : null}

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm text-slate-600 hover:underline">
            ← 🏠 홈으로
          </Link>
          <div className="text-sm text-slate-500">🧄 {count}개</div>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">🧄 덜익은 재료</h1>
        <p className="mt-1 text-sm text-slate-600">
          flip 5회 이상 카드만 모았어요. “복습 완료”를 누르면 목록에서 사라져요.
        </p>

        {cards.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white ring-1 ring-slate-200 p-6">
            <div className="text-lg font-semibold text-slate-900">🎉 복습할 단어가 없습니다!</div>
            <p className="mt-2 text-sm text-slate-600">
              오늘의 Rata를 더 만들고, 덜익은 재료가 생기면 여기서 다시 확인해요.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl
              bg-[color:var(--chef-olive)] text-white text-sm font-semibold
              hover:bg-[color:var(--chef-olive-hover)] active:opacity-90 transition"
            >
              🍳 홈으로 가서 재료 넣기
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            <CardViewer
              cards={cards}
              onUpdateCard={onUpdateCard}
              mode="review"
              onMarkReviewed={onMarkReviewed}
            />
          </div>
        )}
      </div>
    </main>
  );
}
