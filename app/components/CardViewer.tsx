"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Flashcard } from "../types";
import FlashCard from "./FlashCard";
import { updateDailySetTaste } from "../lib/storage";

type Mode = "study" | "review";

export default function CardViewer({
  cards,
  onFlipCard,
  onUpdateCard,
  showDateInfo,
  mode = "study",
  onMarkReviewed,
  sessionDate,
}: {
  cards: Flashcard[];
  onFlipCard?: (cardId: string) => void;
  onUpdateCard?: (updated: Flashcard) => void;
  showDateInfo?: boolean;

  mode?: Mode;
  onMarkReviewed?: (card: Flashcard) => void;

  sessionDate?: string;
}) {
  const [index, setIndex] = useState(0);

  // ✅ "앞→뒤일 때만 flipCount 증가" 판정용 논리 플립 상태
  const [isFlipped, setIsFlipped] = useState(false);

  const [finished, setFinished] = useState(false);

  const [taste, setTaste] = useState("");
  const [tasteSaved, setTasteSaved] = useState(false);

  const safeIndex = useMemo(() => {
    if (cards.length === 0) return 0;
    return Math.min(Math.max(index, 0), cards.length - 1);
  }, [cards.length, index]);

  const current = useMemo(() => {
    if (cards.length === 0) return null;
    return cards[safeIndex] ?? null;
  }, [cards, safeIndex]);

  useEffect(() => {
    if (cards.length === 0) {
      setIndex(0);
      setIsFlipped(false);
      setFinished(false);
      setTaste("");
      setTasteSaved(false);
      return;
    }
    setIndex((i) => Math.min(Math.max(i, 0), cards.length - 1));
    setIsFlipped(false);
    setFinished(false);
    setTasteSaved(false);
  }, [cards.length]);

  const progressText = useMemo(() => {
    if (cards.length === 0) return "0 / 0";
    return `${safeIndex + 1} / ${cards.length}`;
  }, [cards.length, safeIndex]);

  const toggleFlip = useCallback(() => {
    if (!current?.id) return;

    setIsFlipped((prev) => {
      if (!prev) onFlipCard?.(current.id); // ✅ 앞→뒤일 때만 +1
      return !prev;
    });
  }, [current?.id, onFlipCard]);

  const goPrev = useCallback(() => {
    if (cards.length === 0) return;
    setFinished(false);
    setIndex((i) => Math.max(0, i - 1));
    setIsFlipped(false);
  }, [cards.length]);

  const goNext = useCallback(() => {
    if (cards.length === 0) return;

    if (safeIndex >= cards.length - 1) {
      setFinished(true);
      setTasteSaved(false);
      return;
    }

    setIndex((i) => Math.min(cards.length - 1, i + 1));
    setIsFlipped(false);
  }, [cards.length, safeIndex]);

  const markReviewed = useCallback(() => {
    if (!current) return;
    onMarkReviewed?.(current);
  }, [current, onMarkReviewed]);

  const saveTaste = useCallback(() => {
    const date = sessionDate || current?.createdAt || "";
    if (!date) return;

    updateDailySetTaste(date, taste.trim());
    setTasteSaved(true);
  }, [sessionDate, current?.createdAt, taste]);

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-slate-600 ring-1 ring-slate-200">
        카드가 없습니다.
      </div>
    );
  }

  if (finished && mode === "study") {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-6">
        <div className="text-2xl font-bold text-slate-900">👨‍🍳 오늘의 Rata 완성!</div>
        <p className="mt-2 text-sm text-slate-600">
          무슨 맛인가요? 한 줄로 적어두면, 홈의 Rata 목록에 남아요.
        </p>

        <label className="mt-4 grid gap-1">
          <span className="text-xs font-semibold text-slate-600">🍲 오늘의 맛</span>
          <input
            className="h-11 rounded-xl ring-1 ring-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-400"
            placeholder="예: 고소하지만 살짝 씁쓸한 맛"
            value={taste}
            onChange={(e) => setTaste(e.target.value)}
          />
        </label>

        <button
          type="button"
          onClick={saveTaste}
          className="mt-3 w-full h-11 rounded-xl
          bg-[color:var(--chef-olive)] text-white text-sm font-semibold
          hover:bg-[color:var(--chef-olive-hover)] active:opacity-90 transition"
        >
          🍽 맛 기록하기
        </button>

        {tasteSaved && (
          <div className="mt-3 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm">
            ✅ 기록 완료! 홈의 Rata 목록에서 날짜 옆 태그로 보여요.
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/review"
            className="inline-flex h-11 items-center justify-center rounded-xl
            bg-[color:var(--chef-red)] text-white text-sm font-semibold
            hover:bg-[color:var(--chef-red-hover)] active:opacity-90 transition"
          >
            🧄 덜익은 재료 보기
          </Link>

          <button
            type="button"
            onClick={() => {
              setFinished(false);
              setIndex(0);
              setIsFlipped(false);
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl
            bg-[color:var(--chef-brown)] text-white text-sm font-semibold
            hover:bg-[color:var(--chef-brown-hover)] active:opacity-90 transition"
          >
            🔁 다시 처음부터
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-slate-600 ring-1 ring-slate-200">
        카드 로딩 중…
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={safeIndex === 0}
          className="h-10 px-3 rounded-xl text-sm font-semibold
          bg-white ring-1 ring-slate-200 text-slate-700
          hover:bg-slate-100 active:bg-slate-200 transition
          disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← 이전
        </button>

        <div className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{progressText}</span>
          {showDateInfo && current.createdAt ? (
            <span className="ml-2 text-slate-500">📅 {current.createdAt}</span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {mode === "review" && (
            <button
              type="button"
              onClick={markReviewed}
              className="h-10 px-3 rounded-xl text-sm font-semibold
              bg-[color:var(--chef-red)] text-white
              hover:bg-[color:var(--chef-red-hover)] active:opacity-90 transition"
            >
              ✅ 복습 완료
            </button>
          )}

          <button
            type="button"
            onClick={goNext}
            className="h-10 px-3 rounded-xl text-sm font-semibold
            bg-[color:var(--chef-olive)] text-white
            hover:bg-[color:var(--chef-olive-hover)] active:opacity-90 transition"
          >
            다음 →
          </button>
        </div>
      </div>

      <FlashCard
        card={current}
        isFlipped={isFlipped} // (논리 판정용)
        onToggleFlip={toggleFlip}
        onUpdateCard={onUpdateCard}
        reviewThreshold={5}
      />

      <div className="text-xs text-slate-500 text-center">
        {mode === "review"
          ? "복습 완료를 누르면 덜익은 재료 목록에서 제거돼요."
          : "카드를 탭해서 앞/뒤를 보고, 앞→뒤로 갈 때만 flip이 증가해요."}
      </div>
    </div>
  );
}
