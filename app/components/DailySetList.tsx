"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DailySet } from "@/app/types";
import { deleteSet, exportToCSV } from "@/app/lib/storage";

interface DailySetListProps {
  sets: DailySet[];
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export default function DailySetList({ sets }: DailySetListProps) {
  // 목록 갱신을 위해 내부 상태로 관리
  const [localSets, setLocalSets] = useState<DailySet[]>(sets);

  const sorted = useMemo(() => {
    return [...localSets].sort((a, b) => b.date.localeCompare(a.date));
  }, [localSets]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>(
    "정말 삭제하시겠습니까?"
  );

  const openDeleteConfirm = (date: string, message?: string) => {
    setSelectedDate(date);
    setConfirmMessage(message ?? "정말 삭제하시겠습니까?");
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setSelectedDate(null);
  };

  const handleDelete = () => {
    if (!selectedDate) return;
    deleteSet(selectedDate);
    setLocalSets((prev) => prev.filter((s) => s.date !== selectedDate));
    closeConfirm();
  };

  const handleDownloadCSV = (date: string) => {
    const csv = exportToCSV(date);
    downloadTextFile(`flashcards_${date}.csv`, csv);

    // 스펙: 다운로드 후 삭제 확인 모달
    openDeleteConfirm(date, "CSV를 다운로드했습니다. 이 세트를 삭제할까요?");
  };

  if (sorted.length === 0) {
    return (
      <section className="w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <h2 className="text-lg font-semibold">저장된 세트</h2>
        <p className="mt-2 text-sm text-neutral-600">
          아직 저장된 세트가 없습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">저장된 세트</h2>
        <p className="text-xs text-neutral-500">최신 날짜가 위로 표시됩니다.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((set) => (
          <div
            key={set.date}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
          >
            <div className="mb-3">
              <div className="text-base font-semibold text-neutral-900">
                {set.date}
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                {set.cards?.length ?? 0}개 단어
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/study/${set.date}`}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
              >
                학습하기
              </Link>

              <button
                type="button"
                onClick={() => handleDownloadCSV(set.date)}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
              >
                CSV 다운로드
              </button>

              <button
                type="button"
                onClick={() => openDeleteConfirm(set.date)}
                className="ml-auto inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 삭제 확인 모달 */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
            <div className="mb-2 text-base font-semibold text-neutral-900">
              확인
            </div>
            <p className="text-sm text-neutral-700">{confirmMessage}</p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirm}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
