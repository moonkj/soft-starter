# 구현 계획: Soft Starter Selection Tool (LVSS, A안)

기준 자료: `docs/design/README.md`(전달 문서), `docs/design/prototype.html`(동작 기준 화면), `data/lvss-selection.json`(카탈로그 2022.03 선정표).
화면, 문구, 동작은 프로토타입과 같게 만든다. 더 나은 방향은 바꾸기 전에 먼저 제안한다.

## ① UX 설계 요약 (팀원 1)

- 사용자: 영업 담당이 고객을 만나 PC·태블릿으로 모터 조건을 넣고 모델을 바로 보여 준다.
- 화면 방식: 단일 페이지 실시간 계산. 제출 버튼 없이 입력할 때마다 다시 계산한다. 숙련 사용자가 조건을 바꿔 가며 비교하기에 가장 빠르다.
- 화면 구성: 헤더 / 왼쪽 사용 조건 패널(300~380px) / 오른쪽 요약 박스 + 추천 카드 2열. 폭이 좁으면 패널이 위로 쌓인다.
- 핵심 행동 우선순위
  1. 전압과 전류(또는 kW)를 넣고 1순위 모델 보기
  2. Trip Class 바꿔 보기
  3. 왜 이 모델인지 확인하기(기준 전류, 계산식, 정격 여유 막대)
  4. 한 단계 위 모델로 바꿔 보기
  5. 상세 조건(제어 전원, 주위 온도, 기동 횟수)으로 좁히기
  6. 카탈로그 페이지 확인
- 예외 상태
  - 입력 없음, 0, 음수: 큰 숫자 `—`, "왼쪽에 모터 전류나 kW를 넣으면 추천 모델이 나와요."
  - 결과 0건: "조건에 맞는 모델이 없어요" + 최대 전류 안내 + 기술상담센터
  - 정격 여유 5% 미만: 주황 막대, 주황 숫자, 경고 박스
  - 형명 미완성(307 이상, 제어 전원 미선택): 형명 끝 `-?`와 안내 문구
  - 한 단계 위 보기 중: 파란 띠 + [처음 추천으로]

## ② 설계 요약 (팀원 2)

### 핵심 기능 (1차)
1. 조건 입력: 전압 9종, 주파수(표시용), 명판 전류(A)/kW, Trip Class 10/20/30, 상세 조건(제어 전원, 주위 온도, 기동 횟수, 효율×역률)
2. 선정 기준 전류 계산과 요약 박스(칩, 계산식)
3. 추천 카드: 정격 여유 최소 배지, 형명 조합, 프레임 사양, 필요/적용 전류 막대, 한 단계 위, 경고, 제어전원 안내, 카탈로그 쪽
4. 처음 4개 + 더 보기, 한 단계 위로 바꿔 보기, 조건 초기화
5. 빈 상태, 결과 없음

2차 후보(전달 문서 "이후 기능"): 비교 담기, 제안서 PDF, 영문 화면, In Delta 선정표, 카탈로그 PDF 연결, 제품 사진.

### 입출력 (엔진 계약)
```ts
type Inputs = { v: string; hz: 50|60; mode: 'A'|'kW'; kw: string; amp: string;
  tc: 10|20|30; ctrl: null|'DC24V'|'AC110V'|'AC220V'; amb: null|40|50; starts: null|3|5; pf: string }
calcCurrent(inputs): number                    // 0이면 입력 무효
findCandidates(data, inputs, I): Candidate[]   // 모델 번호 오름차순
buildCards(data, inputs, I): Card[]            // 형명, 여유, 막대, 다음 모델, 경고, 프레임 정보
```

### 하드코딩 금지 원칙 (데이터에서 끌어냄)
- 정격, 모델, 그룹 기동 횟수·주위 온도: `rows`, `dutyGroups`
- 프레임 사양, 카탈로그 쪽: `frames`
- DC24V 제외와 형명 접미사(-1, -2): `frames[].controlVoltage`에서 읽음. 프로토타입의 `307` 상수를 쓰지 않음
- 결과 없음 문구의 최대 전류(1080A): `rows`의 최댓값
- 화면 문구는 `src/strings.ts` 한곳에 모음

### 기술 스택
- Vite + React 18 + TypeScript(strict), Vitest + Testing Library(jsdom)
- 이유: 서버 없이 정적 배포, 엔진(순수 함수)과 화면을 나눠 테스트하기 쉬움. 대안인 단일 HTML 유지는 테스트·유지보수가 어려워 뺌
- CSS: 프로토타입 스타일을 `src/styles.css`로 옮기고 색은 `:root` 변수만 씀

### 폴더 구조
```
data/lvss-selection.json      카탈로그 데이터 (개정 시 이 파일만 교체 후 다시 빌드)
docs/design/                  전달받은 기준 자료 (수정하지 않음)
src/engine/{types,select}.ts  순수 함수, React import 금지
src/components/*.tsx          ConditionPanel, Summary, ModelCard, Results
src/strings.ts  styles.css  App.tsx  main.tsx
tests/engine.test.ts          README 테스트 케이스 7건 + 경계값
tests/data.test.ts            데이터 무결성
tests/app.test.tsx            화면 동작
```

### 구현 단계
| Phase | 내용 | 완료 기준 |
|---|---|---|
| 0 | 계획 문서, git, Vite·TS·Vitest 설정 | `npm test`·`npm run build` 통과 |
| 1 | 엔진 + 테스트(먼저 작성) | 테스트 케이스 7건 통과 |
| 2 | 화면 구현 | 프로토타입과 나란히 비교해 같음 |
| 3 | 디버그(④) → 테스트·리뷰(⑤⑥) 라운드 | 개선할 부분 없음 |
| 4 | 브라우저 확인(1280px, 태블릿 768px), 커밋 | 스크린샷 확인 |

### 확인이 필요한 사항
1. 카탈로그 PDF 연결: 기존 프로젝트에 있는 `LVSS_BeyondX_KO.pdf`(2.6MB)를 써도 되는지. 그 전까지 `카탈로그 p.N`은 프로토타입처럼 동작하지 않는다.
2. 전달 문서의 남은 과제(오타 103, 외형 방향, In Delta, 400V 외 kW 선정)는 카탈로그 확인이 필요해 1차에서 손대지 않는다.
3. 배포 대상(GitHub Pages, Cloudflare Pages, 사내 서버)
