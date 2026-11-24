// 화면 문구. docs/design/prototype.html 문구를 그대로 쓴다.
import type { DutyGroup, Frame, TripClass } from './engine/types'
import { controlOptions, isSuffixed } from './engine/select'

export const VOLTAGES = ['200', '220', '230', '380', '400', '415', '440', '460', '480']

export const T = {
  title: 'Soft Starter Selection Tool',
  headerNote: 'LVSS 시리즈 · 200~480V · 50/60Hz 공용',
  panelTitle: '사용 조건',
  reset: '조건 초기화',
  panelHelp: '전압과 모터 명판의 정격전류(A)만 넣어도 추천이 나와요. 명판을 확인하기 어려우면 kW로 넣어 주세요.',
  voltage: '전원 전압',
  required: '필수',
  motor: '모터 전류',
  motorAria: '모터 전류 또는 용량',
  modeA: '명판 전류(A)',
  helpKw: '명판 전류를 확인하기 어려울 때만 쓰세요. 일반적인 효율·역률로 계산한 값이라 실제 모터와 다를 수 있어요.',
  helpA: '모터 명판에 적힌 정격전류(FLC)를 넣어 주세요. 가장 정확한 방법이에요.',
  tripClass: 'Trip Class',
  details: '상세 조건',
  ctrl: '제어 전원',
  amb: '주위 온도',
  starts: '기동 횟수',
  pf: '효율 × 역률 (kW 계산용)',
  none: '선택 안 함',
  any: '상관없음',
  connectionNote: '결선은 In Line 기준이에요. In Delta로 결선하면 한 단계 높은 모터 용량까지 쓸 수 있어요.',
  leadLabel: '● 선정 기준 전류',
  summaryAria: '선정 기준',
  approx: '근삿값이에요. 명판 전류를 확인하면 더 정확해요.',
  catalogBasis: '카탈로그 선정 가이드(In Line 결선) 기준이에요.',
  recommended: '추천 모델',
  sortNote: '정격 여유가 작은 순서예요. 카드마다 해당 카탈로그 페이지를 볼 수 있어요.',
  shifted: '한 단계 위 모델부터 보고 있어요.',
  backToFirst: '처음 추천으로',
  emptyInput: '왼쪽에 모터 전류나 kW를 넣으면 추천 모델이 나와요.',
  noResultTitle: '조건에 맞는 모델이 없어요',
  noResultBody: (maxA: number) =>
    `카탈로그 선정 범위는 최대 ${maxA}A예요. 상세 조건을 풀거나 기술상담센터(1544-2080)에 문의해 주세요.`,
  more: (n: number) => `추천 모델 ${n}건 더 보기`,
  bestTag: '정격 여유 최소',
  imgPlaceholder: ['제품', '이미지'],
  incomplete: ['형명 끝자리는 제어전원으로 정해져요. 상세 조건에서 ', '제어 전원', '을 고르면 형명이 완성돼요.'],
  nextLabel: '한 단계 위: ',
  shiftUp: '한 단계 위로 바꿔 보기',
  warnTitle: '주의',
  warnBody: (code: string) => ` 정격 여유가 5% 미만이에요. 한 단계 위 모델(${code})도 같이 확인해 보세요.`,
  catalogPage: (p: string) => `카탈로그 p.${p}`,
} as const

export const TC_DESC: Record<TripClass, string> = {
  10: '과부하 시 10초 안에 트립. 기동이 가벼운 일반 부하에 써요.',
  20: '과부하 시 20초 안에 트립. 기동 시간이 긴 부하에 써요.',
  30: '과부하 시 30초 안에 트립. 관성이 커서 오래 걸려 기동하는 부하에 써요.',
}

/** "5회/h 기동 · 50℃" */
export const dutyText = (d: DutyGroup) => `${d.startsPerHour}회/h 기동 · ${d.ratedAmbientC}℃`

/** 카드 하단 제어전원 안내. frames[].controlVoltage로 만든다. */
export function ctrlText(frame: Frame): string {
  const opts = controlOptions(frame)
  if (!isSuffixed(frame)) return `제어전원: ${opts.map((o) => o.ctrl).join(' / ')} 공용`
  const list = opts.map((o) => `${o.suffix} = ${o.ctrl}`).join(', ')
  const noDc = opts.some((o) => o.ctrl === 'DC24V') ? '' : ' (DC24V 미지원)'
  return `제어전원: ${list}${noDc}`
}
