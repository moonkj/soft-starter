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
