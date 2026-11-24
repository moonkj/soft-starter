// 화면 문구. docs/design/prototype.html 문구를 그대로 쓴다.
// 데이터로 문구를 만드는 함수는 src/format.ts에 둔다.
import type { TripClass } from './engine/types'

export const VOLTAGES = ['200', '220', '230', '380', '400', '415', '440', '460', '480']

export const T = {
  title: 'Soft Starter Selection Tool',
  headerNote: 'LVSS 시리즈 · 200~480V · 50/60Hz 공용',

  // 사용 조건 패널
  panelTitle: '사용 조건',
  reset: '조건 초기화',
  panelHelp: '전압과 모터 명판의 정격전류(A)만 넣어도 추천이 나와요. 명판을 확인하기 어려우면 kW로 넣어 주세요.',
  voltage: '전원 전압',
  required: '필수',
  hzAria: '주파수',
  motor: '모터 전류',
  modeAria: '입력 방식',
  motorAria: '모터 전류 또는 용량',
  modeA: '명판 전류(A)',
  modeKw: 'kW',
  helpKw: '명판 전류를 확인하기 어려울 때만 쓰세요. 일반적인 효율·역률로 계산한 값이라 실제 모터와 다를 수 있어요.',
  helpA: '모터 명판에 적힌 정격전류(FLC)를 넣어 주세요. 가장 정확한 방법이에요.',
  tripClass: 'Trip Class',
  tcOption: (tc: TripClass) => `Class ${tc}`,
  details: '상세 조건',
  ctrl: '제어 전원',
  amb: '주위 온도',
  ambOption: (c: number) => `${c}℃ 이하`,
  starts: '기동 횟수',
  startsOption: (n: number) => `시간당 ${n}회`,
  pf: '효율 × 역률 (kW 계산용)',
  none: '선택 안 함',
  any: '상관없음',
  connectionNote: '결선은 In Line 기준이에요. In Delta로 결선하면 한 단계 높은 모터 용량까지 쓸 수 있어요.',

  // 요약 박스
  summaryAria: '선정 기준',
  leadLabel: '● 선정 기준 전류',
  chipVoltage: (v: string, hz: number) => `${v} V · ${hz}Hz`,
  chipKw: (kw: string) => `${kw || '-'} kW (계산)`,
  chipA: (a: string) => `${a || '-'} A (명판)`,
  chipTc: (tc: TripClass) => `Trip Class ${tc}`,
  chipAmb: (c: number | null) => '주위 ' + (c ? `${c}℃ 이하` : '-'),
  chipStarts: (n: number | null) => '기동 ' + (n ? `${n}회/h` : '-'),
  chipCtrl: (c: string | null) => '제어전원 ' + (c ?? '-'),
  chipConnection: '결선 In Line',
  formulaKw: (kw: string, v: string, pf: string, I: number) =>
    `I = P / (√3 · V · η·cosφ) = ${kw || 0}kW / (√3 · ${v}V · ${pf}) ≈ ${I} A`,
  formulaA: (a: string) => `명판 정격전류 ${a || 0} A 그대로 선정에 써요.`,
  approx: '근삿값이에요. 명판 전류를 확인하면 더 정확해요.',
  catalogBasis: '카탈로그 선정 가이드(In Line 결선) 기준이에요.',

  // 결과
  recommended: '추천 모델',
  countUnit: (n: number) => `${n}건`,
  sortNote: '정격 여유가 작은 순서예요. 카드마다 해당 카탈로그 페이지를 볼 수 있어요.',
  shifted: '한 단계 위 모델부터 보고 있어요.',
  backToFirst: '처음 추천으로',
  emptyInput: '왼쪽에 모터 전류나 kW를 넣으면 추천 모델이 나와요.',
  noResultTitle: '조건에 맞는 모델이 없어요',
  noResultBody: (maxA: number) =>
    `카탈로그 선정 범위는 최대 ${maxA}A예요. 상세 조건을 풀거나 기술상담센터(1544-2080)에 문의해 주세요.`,
  more: (n: number) => `추천 모델 ${n}건 더 보기`,
  /** 화면 읽기 프로그램에만 읽히는 결과 요약 */
  liveStatus: (I: number, n: number) => `선정 기준 전류 ${I} A, 추천 모델 ${n}건`,

  // 모델 카드
  bestTag: '정격 여유 최소',
  imgPlaceholder: ['제품', '이미지'],
  seriesLine: (size: string, amp: string) => `LVSS 시리즈 · ${size} · ${amp}`,
  incomplete: ['형명 끝자리는 제어전원으로 정해져요. 상세 조건에서 ', '제어 전원', '을 고르면 형명이 완성돼요.'],
  outline: (dim: string, term: string) => `외형 ${dim} mm · ${term}`,
  need: '필요 ',
  applied: ' / 적용 ',
  margin: '정격 여유 ',
  dutyLine: (tc: TripClass, duty: string) => `Trip Class ${tc} · ${duty}`,
  nextLabel: '한 단계 위: ',
  shiftUp: '한 단계 위로 바꿔 보기',
  warnTitle: '주의',
  warnBody: (code: string, pct: number) => ` 정격 여유가 ${pct}% 미만이에요. 한 단계 위 모델(${code})도 같이 확인해 보세요.`,
  catalogPage: (p: string) => `카탈로그 p.${p}`,
} as const

export const TC_DESC: Record<TripClass, string> = {
  10: '과부하 시 10초 안에 트립. 기동이 가벼운 일반 부하에 써요.',
  20: '과부하 시 20초 안에 트립. 기동 시간이 긴 부하에 써요.',
  30: '과부하 시 30초 안에 트립. 관성이 커서 오래 걸려 기동하는 부하에 써요.',
}
