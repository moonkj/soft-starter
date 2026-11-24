// LVSS 선정 로직. React, DOM에 의존하지 않는 순수 함수만 둔다.
// 정격, 모델, 프레임, 제어 전원 규칙은 모두 data/lvss-selection.json에서 읽는다.
import type { Candidate, Card, CtrlVoltage, Frame, Inputs, LvssData } from './types'

/** 화면 첫 상태와 [조건 초기화] 기준값 (docs/design/README.md 입력 표) */
export const INIT_INPUTS: Inputs = {
  v: '380',
  hz: 60,
  mode: 'kW',
  kw: '55',
  amp: '104',
  tc: 10,
  ctrl: null,
  amb: null,
  starts: null,
  pf: '0.80',
}

/** 정격 여유가 이 값(%) 미만이면 경고한다. */
export const LOW_MARGIN_PCT = 5

const num = (s: string): number => {
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

/** 선정 기준 전류(A). 계산할 수 없거나 0 이하이면 0을 돌려준다. */
export function calcCurrent(s: Inputs): number {
  let I: number
  if (s.mode === 'A') {
    I = num(s.amp)
  } else {
    const kw = num(s.kw)
    const v = num(s.v)
    const pf = num(s.pf)
    if (v <= 0 || pf <= 0) return 0
    I = (kw * 1000) / (Math.sqrt(3) * v * pf)
  }
  return Number.isFinite(I) && I > 0 ? I : 0
}

export function frameOf(data: LvssData, model: string): Frame | undefined {
  const n = parseInt(model, 10)
  return data.frames.find((f) => n >= f.from && n <= f.to)
}

/** "AC110V (-1)" → { ctrl: "AC110V", suffix: "-1" } */
function parseCtrl(entry: string): { ctrl: string; suffix: string | null } {
  const m = entry.match(/^(\S+)\s*\((-\d+)\)\s*$/)
  return m ? { ctrl: m[1], suffix: m[2] } : { ctrl: entry.trim(), suffix: null }
}

export function controlOptions(frame: Frame) {
  return frame.controlVoltage.map(parseCtrl)
}

/** 형명 끝에 제어 전원 접미사(-1, -2)가 붙는 프레임인지 */
export function isSuffixed(frame: Frame): boolean {
  return controlOptions(frame).some((c) => c.suffix !== null)
}

function supportsCtrl(frame: Frame, ctrl: CtrlVoltage): boolean {
  return controlOptions(frame).some((c) => c.ctrl === ctrl)
}

/** 형명. 접미사 프레임에서 제어 전원을 안 골랐으면 끝이 "-?"다. */
export function modelCode(frame: Frame, model: string, ctrl: CtrlVoltage | null): string {
  const base = 'LS-LVSS-' + model
  if (!isSuffixed(frame)) return base
  const hit = ctrl ? controlOptions(frame).find((c) => c.ctrl === ctrl) : undefined
  return base + (hit?.suffix ?? '-?')
}

/** 조건에 맞는 모델 후보(모델 번호 오름차순). 같은 모델은 처음 나온 행만 쓴다. */
export function findCandidates(data: LvssData, s: Inputs, I: number): Candidate[] {
  if (!(I > 0)) return []
  const key = ('tc' + s.tc) as keyof (typeof data.rows)[number]['model']
  const seen = new Set<string>()
  const out: Candidate[] = []
  for (const row of data.rows) {
    const model = row.model[key]
    if (!model || row.motorFlcA < I || seen.has(model)) continue
    const duty = data.dutyGroups[String(row.dutyGroup)]
    if (!duty) continue
    if (s.amb !== null && duty.ratedAmbientC < s.amb) continue
    if (s.starts !== null && duty.startsPerHour < s.starts) continue
    const frame = frameOf(data, model)
    if (!frame) continue // 데이터 오류. tests/data.test.ts가 잡는다.
    if (s.ctrl && !supportsCtrl(frame, s.ctrl)) continue
    seen.add(model)
    out.push({ model, amp: row.motorFlcA, duty })
  }
  return out.sort((a, b) => parseInt(a.model, 10) - parseInt(b.model, 10))
}

/** 추천 카드에 필요한 값을 모두 계산한다. */
export function buildCards(data: LvssData, s: Inputs, I: number): Card[] {
  const list = findCandidates(data, s, I)
  return list.map((c, i) => {
    const frame = frameOf(data, c.model) as Frame
    const code = modelCode(frame, c.model, s.ctrl)
    const marginPct = Math.round(((c.amp - I) / I) * 100)
    const nx = list[i + 1]
    const nxFrame = nx ? (frameOf(data, nx.model) as Frame) : null
    return {
      index: i,
      model: c.model,
      code,
      incomplete: code.endsWith('-?'),
      frame,
      needA: Math.round(I),
      appliedA: c.amp,
      marginPct,
      low: marginPct < LOW_MARGIN_PCT,
      loadPct: Math.min(100, Math.round((I / c.amp) * 100)),
      duty: c.duty,
      suffixed: isSuffixed(frame),
      next: nx && nxFrame ? { code: modelCode(nxFrame, nx.model, s.ctrl), amp: nx.amp } : null,
      best: i === 0,
    }
  })
}

/** 카탈로그 선정 범위의 최대 전류(A) */
export function maxCurrent(data: LvssData): number {
  return Math.max(...data.rows.map((r) => r.motorFlcA))
}
