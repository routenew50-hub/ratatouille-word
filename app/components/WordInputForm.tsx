"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Flashcard } from "@/app/types";
import { addCardToDailySet, loadAllCards, saveAllCards } from "@/app/lib/storage";

function todayISO(): string {
  // 로컬(한국) 기준 YYYY-MM-DD
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function uid(): string {
  // 충분히 고유한 id
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function WordInputForm() {
  const router = useRouter();

  const [en, setEn] = useState("");
  const [exampleEn, setExampleEn] = useState("");
  const [error, setError] = useState<string | null>(null);

  const date = useMemo(() => todayISO(), []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const head = en.trim();
    if (!head) {
      setError("영어 단어를 입력해줘.");
      return;
    }

    // ✅ 새 카드 생성 (지금 단계에서는 번역/API 없이 빈칸 가능)
    const card: Flashcard = {
      id: uid(),
      en: head,
      fr: "",
      zh: "",
      hanja: "",
      pronunciation: "", // EN 발음(추후 API)
      example: exampleEn.trim(), // EN 예문
      flipCount: 0,
      createdAt: date,
      // 아래 필드들은 FlashCard에서 사용 중이면 남겨둬도 되고 없어도 됨(타입에 따라)
      // enMeaning: "", frMeaning: "", zhMeaning: "", hanjaMeaning: "",
      // frPronunciation: "", zhPronunciation: "", hanjaPronunciation: "",
      // exampleFr: "", exampleZh: "",
    };

    // ✅ 전체 카드 저장
    const all = loadAllCards();
    const nextAll = [card, ...all];
    saveAllCards(nextAll);

    // ✅ 오늘 세트에도 추가
    addCardToDailySet(date, card);

    // 입력칸 초기화
    setEn("");
    setExampleEn("");

    // ✅ 바로 오늘의 Rata로 이동
    router.push(`/study/${date}`);
  };

  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white ring-1 ring-slate-200 p-5">
      <div className="text-sm font-semibold text-slate-900">오늘의 요리재료 입력</div>
      <div className="mt-1 text-xs text-slate-500">EN 단어 + (선택) EN 예문</div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600">새로운 단어 (EN)</label>
          <input
            value={en}
            onChange={(e) => setEn(e.target.value)}
            placeholder="예: delicious"
            className="mt-1 w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-400"
            autoComplete="off"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600">예문 (EN, 선택)</label>
          <textarea
            value={exampleEn}
            onChange={(e) => setExampleEn(e.target.value)}
            placeholder="예: This soup is delicious."
            className="mt-1 w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-400 resize-none overflow-auto leading-5 h-20"
          />
        </div>

        {error ? (
          <div className="text-sm text-red-600 font-semibold">{error}</div>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 active:bg-slate-950 transition"
        >
          재료 추가하고 오늘의 Rata로
        </button>

        <div className="text-[11px] text-slate-500 text-center">
          저장 위치: 브라우저(localStorage) · 날짜: {date}
        </div>
      </div>
    </form>
  );
}
