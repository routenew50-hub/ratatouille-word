// app/lib/taste.ts
export type TasteTag = {
    emoji: string;
    label: string;        // 표시용 (정규화된 맛 이름)
    className: string;    // Tailwind pill 스타일
  };
  
  // 문자열 정규화: 공백/특수문자 정리 + 소문자
  function normalize(input: string) {
    return (input ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }
  
  // 키워드 포함 검사 (한글/영문 혼용 대비)
  function includesAny(text: string, keywords: string[]) {
    return keywords.some((k) => text.includes(k));
  }
  
  type Rule = {
    label: string;
    emoji: string;
    keywords: string[];
    className: string;
  };
  
  const RULES: Rule[] = [
    {
      label: "매콤",
      emoji: "🌶️",
      keywords: ["매콤", "매운", "spicy", "얼얼", "화끈", "칠리", "pepper", "hot"],
      className:
        "bg-gradient-to-r from-rose-400 to-orange-300 text-white " +
        "ring-2 ring-white/80 shadow-[0_6px_0_rgba(0,0,0,0.18)] " +
        "translate-y-[1px] hover:-translate-y-[1px] transition",
    },
    {
      label: "달콤",
      emoji: "🍯",
      keywords: ["달콤", "달달", "sweet", "설탕", "꿀", "디저트", "sugar", "honey"],
      className:
        "bg-gradient-to-r from-amber-300 to-pink-300 text-slate-900 " +
        "ring-2 ring-white/80 shadow-[0_6px_0_rgba(0,0,0,0.18)] " +
        "hover:rotate-[-1deg] transition",
    },
    {
      label: "상큼",
      emoji: "🍋",
      keywords: ["상큼", "새콤", "sour", "레몬", "라임", "자몽", "시트러스", "citrus", "lemon", "lime", "grapefruit"],
      className:
        "bg-gradient-to-r from-lime-300 to-cyan-300 text-slate-900 " +
        "ring-2 ring-white/80 shadow-[0_6px_0_rgba(0,0,0,0.18)] " +
        "hover:rotate-[1deg] transition",
    },
    {
      label: "고소",
      emoji: "🥜",
      keywords: ["고소", "nutty", "견과", "아몬드", "땅콩", "참깨", "깨", "sesame", "almond", "peanut"],
      className:
        "bg-gradient-to-r from-yellow-300 to-amber-400 text-slate-900 " +
        "ring-2 ring-white/80 shadow-[0_6px_0_rgba(0,0,0,0.18)] transition",
    },
    {
      label: "짭짤",
      emoji: "🧂",
      keywords: ["짭짤", "짠", "salty", "소금", "간장", "salt", "soy"],
      className:
        "bg-gradient-to-r from-sky-300 to-indigo-300 text-slate-900 " +
        "ring-2 ring-white/80 shadow-[0_6px_0_rgba(0,0,0,0.18)] transition",
    },
    {
      label: "감칠",
      emoji: "🧀",
      keywords: ["감칠", "umami", "육수", "치즈", "버터", "라면", "msg", "dashi", "broth", "cheese", "butter"],
      className:
        "bg-gradient-to-r from-emerald-400 to-lime-300 text-white " +
        "ring-2 ring-white/80 shadow-[0_6px_0_rgba(0,0,0,0.18)] transition",
    },
    {
      label: "크리미",
      emoji: "🥛",
      keywords: ["크리미", "creamy", "부드", "라떼", "우유", "milk", "latte", "smooth"],
      className:
        "bg-gradient-to-r from-indigo-300 to-fuchsia-300 text-slate-900 " +
        "ring-2 ring-white/80 shadow-[0_6px_0_rgba(0,0,0,0.18)] transition",
    },
    {
      label: "스모키",
      emoji: "🔥",
      keywords: ["스모키", "smoky", "훈연", "바베큐", "bbq", "구이", "smoke", "char"],
      className:
        "bg-gradient-to-r from-orange-400 to-stone-500 text-white " +
        "ring-2 ring-white/80 shadow-[0_6px_0_rgba(0,0,0,0.18)] transition",
    },
    {
      label: "쌉싸름",
      emoji: "☕",
      keywords: ["쌉싸", "쓴", "bitter", "커피", "에스프레소", "다크", "카카오", "coffee", "espresso", "dark", "cacao"],
      className:
        "bg-gradient-to-r from-stone-600 to-zinc-700 text-white " +
        "ring-2 ring-white/70 shadow-[0_6px_0_rgba(0,0,0,0.22)] transition",
    },
    {
      label: "허브",
      emoji: "🌿",
      keywords: ["허브", "herb", "민트", "mint", "청량", "바질", "로즈마리", "basil", "rosemary"],
      className:
        "bg-gradient-to-r from-teal-400 to-emerald-300 text-white " +
        "ring-2 ring-white/80 shadow-[0_6px_0_rgba(0,0,0,0.18)] transition",
    },
    {
      label: "과일",
      emoji: "🍓",
      keywords: ["과일", "fruity", "베리", "딸기", "복숭아", "포도", "berry", "strawberry", "peach", "grape"],
      className:
        "bg-gradient-to-r from-pink-400 to-rose-300 text-white " +
        "ring-2 ring-white/80 shadow-[0_6px_0_rgba(0,0,0,0.18)] transition",
    },
    {
      label: "플로럴",
      emoji: "🌸",
      keywords: ["플로럴", "향기", "floral", "꽃", "라벤더", "로즈", "lavender", "rose"],
      className:
        "bg-gradient-to-r from-fuchsia-400 to-purple-300 text-white " +
        "ring-2 ring-white/80 shadow-[0_6px_0_rgba(0,0,0,0.18)] transition",
    },
  ];
  
  const FALLBACK: TasteTag = {
    emoji: "🍽️",
    label: "오늘의 맛",
    className:
      "bg-gradient-to-r from-slate-200 to-slate-100 text-slate-800 " +
      "ring-2 ring-white/80 shadow-[0_6px_0_rgba(0,0,0,0.12)] transition",
  };
  
  /**
   * 입력된 맛 텍스트(사용자 자유 입력)를 기반으로
   * - 어울리는 이모지
   * - 태그 컬러 (Tailwind class)
   * - 표시 라벨
   * 을 반환
   */
  export function getTasteTag(tasteText?: string | null): TasteTag {
    const raw = (tasteText ?? "").trim();
    if (!raw) return FALLBACK;
  
    const t = normalize(raw);
  
    for (const rule of RULES) {
      if (includesAny(t, rule.keywords)) {
        return {
          emoji: rule.emoji,
          // 사용자가 “레몬 상큼”처럼 써도, 라벨은 rule.label로 통일
          label: rule.label,
          className: rule.className,
        };
      }
    }
  
    // 아무 규칙에도 안 걸리면: 입력 텍스트를 살리되(짧게), 기본 스타일
    const short = raw.length > 12 ? raw.slice(0, 12) + "…" : raw;
    return {
      emoji: "🧪",
      label: short,
      className: FALLBACK.className,
    };
  }
  