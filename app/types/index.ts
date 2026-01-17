export type Flashcard = {
  id: string;

  // 단어(앞면)
  en: string;
  fr: string;
  zh: string;
  hanja: string;

  // 뜻(뒷면)
  enMeaning?: string;
  frMeaning?: string;
  zhMeaning?: string;
  hanjaMeaning?: string;

  // 발음(뒷면)
  pronunciation?: string;       // EN
  frPronunciation?: string;
  zhPronunciation?: string;
  hanjaPronunciation?: string;

  // 예문(뒷면) - 한자 예문 없음
  example?: string;
  exampleFr?: string;
  exampleZh?: string;

  flipCount?: number;
  createdAt?: string; // YYYY-MM-DD
};

export type DailySet = {
  date: string;        // YYYY-MM-DD
  cards: Flashcard[];
  taste?: string;      // ✅ 오늘의 맛(무슨맛인가요?)
};
