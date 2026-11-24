# process

구현 단계마다 리더가 기록한다.

## 2026-11-24 계획
- ① UX 설계자와 ② 설계자가 병렬로 계획을 세웠다. 처음에는 기존 프로젝트(9개 시리즈)를 참고해 넓게 잡았다.
- 사용자가 디자인 zip(A안)을 전달했다. 범위가 LVSS 단일 시리즈로 정해져서 `PLAN.md`를 그 기준으로 줄였다.
- 기준 자료는 `docs/design/`에 그대로 보관한다.
- 팀 운영: Windows 환경이라 tmux를 쓸 수 없다. Claude Code 서브에이전트로 역할을 나누고, 리더가 결과를 모아 판단한다.

## Phase 0~1 프로젝트 설정, 선정 엔진
- Vite 5 + React 18 + TS strict + Vitest(jsdom). 원격 저장소 `moonkj/soft-starter` 연결.
- `src/engine/select.ts`: 기준 전류, 후보 찾기, 카드 값 계산을 순수 함수로 만들었다.
- 프로토타입과 다른 점: `307` 상수 대신 `frames[].controlVoltage`에서 DC24V 지원 여부와 접미사(-1, -2)를 읽는다. 주위 온도·기동 횟수 필터도 `amb`/`starts` 값과 그룹 정격을 바로 비교한다(40℃·3회는 결과가 같음).
- 테스트: README 케이스 7건 + 경계값 13건 + 데이터 무결성 5건 = 25건 통과.

## Phase 2 화면 구현
- 프로토타입 CSS를 `src/styles.css`로 옮기고 인라인 스타일은 클래스로 뺐다. 문구는 `src/strings.ts`에 모았다.
- 컴포넌트: ConditionPanel, Summary, Results, ModelCard, Seg. 상태는 App의 입력값(Inputs)과 보기 상태(open, offset, more) 두 가지다.
- 제어전원 안내 문구도 `frames[].controlVoltage`로 만든다. 카탈로그 PDF 주소는 `src/config.ts`(지금 null, 프로토타입처럼 열지 않음).
- `npm run build` 통과(JS gzip 52KB).

## 검증 1차: ④ 디버거, ⑤⑥ 테스트·리뷰어 (병렬)
- 디버거: 프로토타입 로직을 그대로 옮긴 스크립트와 259,308개 조합을 비교해 선정 결과 차이 0건. 심각도 높음 없음. 중간 1건(JSON이 빌드에 포함됨), 낮음 여러 건(포커스, 터치 크기, 태블릿 세로 패널 폭 등).
- 테스트 작성자: tests/app.test.tsx 화면 시나리오 16건 추가, 41건 통과. 리뷰 "꼭 필요" 2건(5% 기준과 문구 분리 위험, 컴포넌트 안 문구).
- 리더: 1280px에서 프로토타입과 나란히 비교해 화면이 같음을 확인. 같은 조작 뒤 결과 글자도 같음.

## (개선 R2)
- 반영: warnBody에 LOW_MARGIN_PCT 전달, 문구를 strings.ts로 이동, 데이터→문구 함수는 src/format.ts로 분리, 인라인 스타일 제거, 버튼이 사라진 뒤 포커스 이동, sr-only 결과 요약(aria-live), aria-controls는 펼쳤을 때만, PDF 없을 때 링크 aria-disabled, 터치 44px, 969px 이하 패널 전체 폭, 480px 이하 여백 축소.
- 토론 후 유지: JSON 번들 포함(개정 시 JSON 교체 후 다시 빌드, README에 적음), 효율×역률 즉시 재계산(의도적 차이).
- R2 테스트 4건 추가, 45건 통과. 1280·768·400px 확인(400px 가로 스크롤 없음).
- R2 재리뷰: 꼭 필요한 개선 없음 → 최종 완료. 선택 항목 중 CSS 중복 정리와 스크롤바를 감안한 기준 폭(969px)만 반영.
