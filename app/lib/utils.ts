// app/lib/utils.ts
import { format } from "date-fns";

/**
 * YYYY-MM-DD 형식 문자열 반환
 */
export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * 유니크 ID 생성 (Date.now + Math.random 조합)
 */
export function generateId(): string {
  const now = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${now}-${rnd}`;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayDate(): string {
  return formatDate(new Date());
}
