// 데이터(JSON) 값으로 화면 문구를 만드는 함수
import { controlOptions, isSuffixed } from './engine/select'
import type { DutyGroup, Frame } from './engine/types'

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
