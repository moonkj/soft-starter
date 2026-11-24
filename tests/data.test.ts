// 카탈로그 JSON을 교체했을 때 깨진 곳을 잡는 무결성 검사
import { describe, expect, it } from 'vitest'
import data from '../data/lvss-selection.json'
import { controlOptions, frameOf } from '../src/engine/select'
import type { LvssData } from '../src/engine/types'

const D = data as LvssData
const models = [...new Set(D.rows.flatMap((r) => [r.model.tc10, r.model.tc20, r.model.tc30]).filter(Boolean))] as string[]

describe('lvss-selection.json', () => {
  it('모든 모델이 프레임 하나에만 속한다', () => {
    for (const m of models) {
      const n = parseInt(m, 10)
      const hits = D.frames.filter((f) => n >= f.from && n <= f.to)
      expect(hits, m).toHaveLength(1)
      expect(frameOf(D, m)).toBeDefined()
    }
  })
  it('모든 행의 dutyGroup이 정의되어 있다', () => {
    for (const r of D.rows) expect(D.dutyGroups[String(r.dutyGroup)], String(r.motorFlcA)).toBeDefined()
  })
  it('전류는 양수이고 그룹 안에서 오름차순이다', () => {
    const byGroup = new Map<number, number[]>()
    for (const r of D.rows) {
      expect(r.motorFlcA).toBeGreaterThan(0)
      byGroup.set(r.dutyGroup, [...(byGroup.get(r.dutyGroup) ?? []), r.motorFlcA])
    }
    for (const list of byGroup.values()) expect(list).toEqual([...list].sort((a, b) => a - b))
  })
  it('제어 전원 표기는 "AC110V" 또는 "AC110V (-1)" 형식이다', () => {
    const known = ['DC24V', 'AC110V', 'AC220V']
    for (const f of D.frames) {
      for (const c of controlOptions(f)) expect(known, f.range).toContain(c.ctrl)
    }
  })
  it('카탈로그 쪽 번호가 숫자다', () => {
    for (const f of D.frames) expect(f.page).toMatch(/^\d+$/)
  })
})
