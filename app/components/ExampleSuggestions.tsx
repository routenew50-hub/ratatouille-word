"use client";

interface ExampleSuggestionsProps {
  examples: string[];
  onSelect: (example: string) => void;
}

export default function ExampleSuggestions({
  examples,
  onSelect,
}: ExampleSuggestionsProps) {
  const hasExamples = Array.isArray(examples) && examples.length > 0;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3">
      <div className="mb-2 text-sm font-semibold text-neutral-900">
        예문 추천 (최대 3개)
      </div>

      {!hasExamples ? (
        <div className="text-sm text-neutral-600">예문을 찾을 수 없습니다.</div>
      ) : (
        <div className="grid gap-2">
          {examples.slice(0, 3).map((ex, idx) => (
            <button
              key={`${idx}-${ex.slice(0, 12)}`}
              type="button"
              onClick={() => onSelect(ex)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-sm text-neutral-900 transition hover:bg-neutral-100"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
