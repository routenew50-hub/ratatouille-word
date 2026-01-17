"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { DailySet } from "../types";
import { loadDailySets, deleteDailySet } from "../lib/storage";
import { getTasteTag } from "../lib/taste";

export default function SetsPage() {
  const [sets, setSets] = useState<DailySet[]>([]);

  const refresh = useCallback(() => {
    const all = loadDailySets();
    setSets(all ?? []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onDelete = useCallback((date: string) => {
    deleteDailySet(date);
    refresh();
  }, [refresh]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm text-slate-600 hover:underline">
            ← 🏠 대문으로
          </Link>
          <div className="text-sm text-slate-500">📒 전체 Rata 목록</div>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">📒 Rata 목록</h1>
        <p className="mt-1 text-sm text-slate-600">날짜별 세트를 확인/삭제할 수 있어요.</p>

        <section className="mt-6 rounded-2xl bg-white ring-1 ring-slate-200 p-5">
          <div className="grid gap-3">
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

                        {s.taste?.trim() ? (
                          <span
                            className={[
                              "max-w-[220px] truncate px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1",
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
                        onClick={() => onDelete(s.date)}
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
