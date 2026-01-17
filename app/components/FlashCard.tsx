"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Flashcard } from "../types";

interface FlashCardProps {
  card: Flashcard;
  isFlipped: boolean; // (논리 상태 prop — 내부 UI 플립은 자체 state로 유지)
  onToggleFlip: () => void;
  onUpdateCard?: (updated: Flashcard) => void;
  reviewThreshold?: number;

  showReviewDoneButton?: boolean;
  onReviewDone?: (cardId: string) => void;
}

export default function FlashCard({
  card,
  isFlipped, // eslint-disable-line @typescript-eslint/no-unused-vars
  onToggleFlip,
  onUpdateCard,
  reviewThreshold = 5,
  showReviewDoneButton = false,
  onReviewDone,
}: FlashCardProps) {
  // ✅ 방어: card가 잠깐 undefined/null로 들어오는 상황에서도 크래시 방지
  if (!card) {
    return (
      <div className="w-full max-w-xl mx-auto">
        <div className="h-[360px] sm:h-[420px] rounded-2xl bg-white ring-1 ring-slate-200 flex items-center justify-center text-sm text-slate-500">
          카드 로딩 중…
        </div>
      </div>
    );
  }

  // ✅ UI 플립은 내부 state로 유지(부모 리렌더로 깨지는 것 방지)
  const [localFlipped, setLocalFlipped] = useState(false);

  // ✅ 카드가 바뀌면 플립은 초기화
  const prevIdRef = useRef<string>("");
  useEffect(() => {
    if (!card?.id) return;
    if (prevIdRef.current !== card.id) {
      prevIdRef.current = card.id;
      setLocalFlipped(false);
    }
  }, [card?.id]);

  const needsReview = (card.flipCount ?? 0) >= reviewThreshold;
  const borderClass = needsReview ? "ring-2 ring-red-500" : "ring-1 ring-slate-200";
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const update = useCallback(
    (patch: Partial<Flashcard>) => {
      if (!onUpdateCard) return;
      onUpdateCard({ ...card, ...patch });
    },
    [card, onUpdateCard]
  );

  const back = useMemo(
    () => ({
      en: (card.enMeaning?.trim() ? card.enMeaning : card.en) ?? "",
      fr: (card.frMeaning?.trim() ? card.frMeaning : card.fr) ?? "",
      zh: (card.zhMeaning?.trim() ? card.zhMeaning : card.zh) ?? "",
      hanja: (card.hanjaMeaning?.trim() ? card.hanjaMeaning : card.hanja) ?? "",
    }),
    [card]
  );

  const canShowDone = showReviewDoneButton && Boolean(onReviewDone);

  const handleToggle = useCallback(() => {
    setLocalFlipped((v) => !v); // ✅ 화면 플립
    onToggleFlip(); // ✅ flipCount 증가 조건 판정은 CardViewer에서
  }, [onToggleFlip]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}
      className="w-full max-w-xl mx-auto focus:outline-none"
      aria-label="flashcard (tap to flip)"
    >
      <div className="relative w-full h-[360px] sm:h-[420px]" style={{ perspective: "1200px" }}>
        <div
          className="relative w-full h-full transition-transform duration-[600ms] ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: localFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT */}
          <div
            className={[
              "absolute inset-0 rounded-2xl bg-white",
              "shadow-lg shadow-black/10",
              borderClass,
              "p-4 sm:p-5",
            ].join(" ")}
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div className="h-full grid grid-cols-2 grid-rows-2 gap-3 pb-10">
              <WordCell value={card.en} theme="bg-emerald-50 ring-1 ring-emerald-200" />
              <WordCell value={card.fr} theme="bg-amber-50 ring-1 ring-amber-200" />
              <WordCell value={card.zh} theme="bg-sky-50 ring-1 ring-sky-200" />
              <WordCell value={card.hanja} theme="bg-rose-50 ring-1 ring-rose-200" />
            </div>

            <div className="absolute left-4 right-4 bottom-3 flex items-center justify-between text-xs text-slate-500">
              <span>탭해서 뒷면 보기</span>
              <span>flip {card.flipCount ?? 0}</span>
            </div>
          </div>

          {/* BACK */}
          <div
            className={[
              "absolute inset-0 rounded-2xl bg-white",
              "shadow-lg shadow-black/10",
              borderClass,
              "p-4 sm:p-5",
            ].join(" ")}
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="h-full grid grid-cols-2 grid-rows-2 gap-3 pb-10">
              <MeaningCell
                theme="bg-emerald-50 ring-1 ring-emerald-200"
                meaning={back.en}
                pron={card.pronunciation ?? ""}
                example={card.example ?? ""}
                meaningPlaceholder="뜻"
                examplePlaceholder="예문"
                editableMeaning={Boolean(onUpdateCard)}
                editableExample={Boolean(onUpdateCard)}
                onMeaning={(v) => update({ enMeaning: v })}
                onExample={(v) => update({ example: v })}
                onStop={stop}
              />

              <MeaningCell
                theme="bg-amber-50 ring-1 ring-amber-200"
                meaning={back.fr}
                pron={card.frPronunciation ?? ""}
                example={card.exampleFr ?? ""}
                meaningPlaceholder="뜻"
                examplePlaceholder="예문"
                editableMeaning={Boolean(onUpdateCard)}
                editableExample={Boolean(onUpdateCard)}
                onMeaning={(v) => update({ frMeaning: v })}
                onExample={(v) => update({ exampleFr: v })}
                onStop={stop}
              />

              <MeaningCell
                theme="bg-sky-50 ring-1 ring-sky-200"
                meaning={back.zh}
                pron={card.zhPronunciation ?? ""}
                example={card.exampleZh ?? ""}
                meaningPlaceholder="뜻"
                examplePlaceholder="예문"
                editableMeaning={Boolean(onUpdateCard)}
                editableExample={Boolean(onUpdateCard)}
                onMeaning={(v) => update({ zhMeaning: v })}
                onExample={(v) => update({ exampleZh: v })}
                onStop={stop}
              />

              <MeaningCell
                theme="bg-rose-50 ring-1 ring-rose-200"
                meaning={back.hanja}
                pron={card.hanjaPronunciation ?? ""}
                example={""}
                meaningPlaceholder="뜻"
                examplePlaceholder=""
                editableMeaning={Boolean(onUpdateCard)}
                editableExample={false}
                onMeaning={(v) => update({ hanjaMeaning: v })}
                onExample={() => {}}
                onStop={stop}
                hideExample
              />
            </div>

            <div className="absolute left-4 right-4 bottom-3 flex items-center justify-between gap-2 text-xs text-slate-500">
              <span>탭해서 앞면 보기</span>

              <div className="flex items-center gap-2">
                {canShowDone && (
                  <button
                    type="button"
                    className="h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 active:bg-slate-950 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReviewDone?.(card.id);
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    복습 완료
                  </button>
                )}
                <span>flip {card.flipCount ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WordCell({ value, theme }: { value: string; theme: string }) {
  return (
    <div className={["rounded-xl p-4 sm:p-5 flex flex-col", theme].join(" ")}>
      <div className="flex-1 flex items-center justify-center text-center">
        <div className="text-2xl sm:text-3xl font-semibold text-slate-900 break-words">
          {value?.trim() ? value : <span className="text-slate-400">—</span>}
        </div>
      </div>
    </div>
  );
}

function MeaningCell({
  theme,
  meaning,
  pron,
  example,
  meaningPlaceholder,
  examplePlaceholder,
  editableMeaning,
  editableExample,
  onMeaning,
  onExample,
  onStop,
  hideExample,
}: {
  theme: string;

  meaning: string;
  pron: string;
  example: string;

  meaningPlaceholder: string;
  examplePlaceholder: string;

  editableMeaning: boolean;
  editableExample: boolean;

  onMeaning: (v: string) => void;
  onExample: (v: string) => void;
  onStop: (e: React.SyntheticEvent) => void;

  hideExample?: boolean;
}) {
  return (
    <div className={["rounded-xl p-4 sm:p-5 flex flex-col", theme].join(" ")}>
      {editableMeaning ? (
        <input
          className={[
            "mt-1 w-full bg-transparent",
            "text-2xl sm:text-3xl font-semibold text-slate-900",
            "outline-none",
            "rounded-lg px-2 py-1",
            "focus:bg-white/70 focus:ring-2 focus:ring-slate-300",
          ].join(" ")}
          placeholder={meaningPlaceholder}
          value={meaning}
          onChange={(e) => onMeaning(e.target.value)}
          onClick={onStop}
          onTouchStart={onStop}
          onKeyDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900 break-words">
          {meaning?.trim() ? meaning : <span className="text-slate-400">—</span>}
        </div>
      )}

      {pron?.trim() ? (
        <div className="mt-2 px-2 text-[11px] sm:text-xs font-mono text-slate-700 truncate">
          {pron}
        </div>
      ) : (
        <div className="mt-2 px-2 text-[11px] sm:text-xs text-slate-400 truncate">
          {" "}
        </div>
      )}

      {!hideExample && (
        <div className="mt-3">
          {editableExample ? (
            <textarea
              className={[
                "w-full bg-transparent",
                "text-xs sm:text-sm text-slate-900",
                "outline-none",
                "rounded-lg px-2 py-2",
                "overflow-auto resize-none",
                "focus:bg-white/70 focus:ring-2 focus:ring-slate-300",
                "leading-5",
                "h-12",
              ].join(" ")}
              placeholder={examplePlaceholder}
              value={example}
              onChange={(e) => onExample(e.target.value)}
              onClick={onStop}
              onTouchStart={onStop}
              onKeyDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="rounded-lg px-2 py-2 text-xs sm:text-sm text-slate-700 bg-white/40 ring-1 ring-slate-200">
              <span className="text-slate-400">예문 없음</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
