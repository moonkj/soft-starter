# Soft Starter Selection Tool (LVSS)

LS ELECTRIC 저압 소프트스타터 LVSS 시리즈 선정 웹 앱. 영업 담당이 모터 조건을 넣으면 카탈로그(2022.03) 선정표에 맞는 모델을 바로 보여 준다.
화면과 동작은 전달받은 A안(`docs/design/prototype.html`)과 같다. 서버 없이 정적 배포한다.

## 실행

```
npm install
npm run dev      # 개발 서버
npm test         # 테스트 47건 (엔진, 데이터, 화면)
npm run build    # dist/ 생성 (정적 파일)
```

## 구조

| 경로 | 역할 |
|---|---|
| `data/lvss-selection.json` | 선정표, 프레임 사양, 옵션. 정격 값은 여기에만 있다 |
| `src/engine/select.ts` | 선정 로직(순수 함수). 기준 전류, 후보, 카드 값 |
| `src/format.ts` | 데이터 값으로 문구 만들기(제어전원 안내, 기동 조건) |
| `src/strings.ts` | 화면 문구 |
| `src/config.ts` | 카탈로그 PDF 주소 |
| `public/catalogs/LVSS_Catalog_KO.pdf` | LVSS 카탈로그(국문, 20쪽) 웹용 경량본 2.6MB. 카드의 `카탈로그 p.N`이 이 파일 N쪽을 연다 |
| `src/components/` | ConditionPanel, Summary, Results, ModelCard, Seg |
| `tests/` | engine(README 케이스 7건 포함), data(무결성), app(화면) |
| `docs/design/` | 전달받은 기준 자료. 수정하지 않는다 |
| `PLAN.md`, `Tasklist.md`, `process.md` | 계획, 진행표, 단계별 기록 |

## 카탈로그 개정 시

1. `data/lvss-selection.json`만 바꾼다. 형명 접미사(-1, -2)와 DC24V 지원 여부는 `frames[].controlVoltage`에서 읽으므로 코드를 고칠 필요가 없다.
2. `npm test`로 무결성 검사와 선정 케이스를 확인한다. 선정 결과가 바뀌면 `tests/engine.test.ts` 기대값도 갱신한다.
3. 다시 빌드해서 배포한다. JSON은 빌드 때 JS에 들어가므로 `dist/`의 파일만 바꿔서는 반영되지 않는다.

## 주의사항

- 카탈로그 PDF를 바꾸면 `public/catalogs/`의 파일을 교체한다. 쪽 번호가 달라지면 `data/lvss-selection.json`의 `frames[].page`도 고친다. 파일 이름을 바꾸면 `src/config.ts`의 `CATALOG_PDF_URL`도 바꾼다.
- 경량본은 이미지 PDF라 글자 검색이 안 된다. 텍스트가 살아 있는 원본은 16.5MB라 웹에 올리지 않았다.
- 프로토타입과 다른 점(의도적)
  - 효율×역률은 입력하는 즉시 다시 계산한다(프로토타입은 입력창을 벗어날 때).
  - 터치 대상 44px, 969px 이하에서 패널 전체 폭, 버튼이 사라지는 동작 후 포커스 이동(README 디자인 기준과 접근성 보강).
- 전달 문서의 남은 과제(카탈로그 오타 103, 외형 방향, In Delta 선정표, 제품 사진)는 카탈로그 확인 후 반영한다. 카탈로그 연결은 완료했다.
