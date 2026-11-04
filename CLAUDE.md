# CLAUDE.md — 단어장(check-word, "나만의 Ratatouille") 작업 안내

## 사용자
- 한국어로 대화. 코드·구조 설명은 중학교 1학년이 알아들을 수 있게.
- 요청사항을 건너뛰지 말고, **실행한 것 / 안 한 것**을 구분해서 보고.
- 고친 뒤엔 폰에서 무엇을 눌러볼지 알려주기.

## 프로젝트
- Next.js 14 (app router), Vercel 배포 (https://check-word-neon.vercel.app/). 말랑 비서에서 "단어장"으로 열기.
- 카드·세트 저장: 폰 브라우저 localStorage (`cw_all_cards`, `cw_daily_sets`) — 그 기기에서만 보임.
- 확인: `npx tsc --noEmit`, `npx next build`.

## 링구아 연결 (2026-11-03)
- `app/lib/lingua.ts`: 링구아가 Supabase(family-hub-system) `study_words`에 저장한 단어를 별명 기준으로 읽어 카드로 만듦.
  - 첫 화면을 열 때 자동 + "가져오기" 버튼. 별명은 `cw_lingua_nick`, 마지막으로 가져온 id는 `cw_lingua_last_id_v3`.
  - 언어: `lang`(en/fr/zh) → 해당 칸. 비어 있으면 글자 모양으로 짐작. **`category`(기본값 "기본")는 다른 앱 칸이라 언어로 쓰지 않기.** 일본어(ja)는 칸이 없어서 건너뜀. 같은 단어는 중복 안 넣음.
  - 카드 id는 `lingua-<study_words id>`, 세트 날짜는 **가져온 날(오늘)** — 오늘의 Rata에서 바로 보이게 (v3).
  - 복사만 함: 단어장에서 지워도 링구아 단어는 남음.
  - 세트 "🧺 삭제"는 세트만 지우고 전체 카드 목록(`cw_all_cards`)엔 남음 → 같은 단어로 보고 다시 안 가져옴. (한때 "🧹 다 지우고 처음부터 가져오기" 버튼을 만들었다가, 실수로 누르면 직접 넣은 카드까지 지워져서 2026-11-04에 없앰. 처음부터 다시 가져와야 하면 다시 만들기: 카드·세트·`cw_lingua_last_id_v3` 삭제 후 가져오기.)
