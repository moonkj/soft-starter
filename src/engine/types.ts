// 데이터 파일(data/lvss-selection.json)과 엔진 입출력 타입.

export type TripClass = 10 | 20 | 30
export type CtrlVoltage = 'DC24V' | 'AC110V' | 'AC220V'

export interface DutyGroup {
  startsPerHour: number
  ratedAmbientC: number
  label: string
}

export interface SelectionRow {
  motorFlcA: number
  ratedKw: Record<string, number>
  model: { tc10: string | null; tc20: string | null; tc30: string | null }
  dutyGroup: number
}

export interface Frame {
  range: string
  from: number
  to: number
  size: string
  amp: string
  bypass: string
  ip: string
  term: string
  dim: string
  amb: string
  page: string
  guard: string
  /** 예: ["DC24V","AC110V","AC220V"] 또는 ["AC110V (-1)","AC220V (-2)"] */
  controlVoltage: string[]
}

export interface LvssData {
  source: string
  connection: string
  notes: string[]
  dutyGroups: Record<string, DutyGroup>
  rows: SelectionRow[]
  frames: Frame[]
  options: unknown[]
}

/** 화면 상태 중 선정에 쓰는 값. 입력창 값은 문자열 그대로 받는다. */
export interface Inputs {
  v: string
  hz: 50 | 60
  mode: 'A' | 'kW'
  kw: string
  amp: string
  tc: TripClass
  ctrl: CtrlVoltage | null
  amb: 40 | 50 | null
  starts: 3 | 5 | null
  pf: string
}

export interface Candidate {
  /** 모델 번호 문자열, 예 "201" */
  model: string
  /** 그 모델이 나온 행의 모터 정격전류 = 적용 전류 */
  amp: number
  duty: DutyGroup
}

export interface Card {
  index: number
  model: string
  code: string
  /** 307 이상인데 제어 전원을 고르지 않아 형명 끝이 -? 인 경우 */
  incomplete: boolean
  frame: Frame
  needA: number
  appliedA: number
  marginPct: number
  /** 정격 여유 5% 미만 */
  low: boolean
  /** 막대 폭(%) = 필요/적용 */
  loadPct: number
  duty: DutyGroup
  /** 제어 전원 접미사가 붙는 모델인지(-1/-2) */
  suffixed: boolean
  next: { code: string; amp: number } | null
  best: boolean
}
