import { describe, expect, it } from 'vitest'
import data from '../data/lvss-selection.json'
import { buildCards, calcCurrent, findCandidates, INIT_INPUTS } from '../src/engine/select'
import type { Inputs, LvssData } from '../src/engine/types'

const D = data as LvssData
const inp = (o: Partial<Inputs>): Inputs => ({ ...INIT_INPUTS, ...o })
const cardsOf = (o: Partial<Inputs>) => {
  const s = inp(o)
  return buildCards(D, s, calcCurrent(s))
}
const codes = (o: Partial<Inputs>) => cardsOf(o).map((c) => c.code)

// docs/design/README.md "테스트 케이스" 7건
describe('README 테스트 케이스', () => {
  it('T1 380V, kW 55, 0.80, Class 10 → I≈104, 1순위 201(132A, +26%), 13건', () => {
    const s = inp({ v: '380', mode: 'kW', kw: '55', pf: '0.80', tc: 10 })
    const I = calcCurrent(s)
    expect(I).toBeCloseTo(104.45, 1)
    expect(Math.round(I)).toBe(104)
    const cards = buildCards(D, s, I)
    expect(cards).toHaveLength(13)
    expect(cards[0]).toMatchObject({ code: 'LS-LVSS-201', appliedA: 132, marginPct: 26, needA: 104, best: true })
  })

  it('T2 A 128, Class 30, DC24V → 205(+3%, 경고), 301, 303, 305', () => {
    const cards = cardsOf({ mode: 'A', amp: '128', tc: 30, ctrl: 'DC24V' })
    expect(cards.map((c) => c.code)).toEqual(['LS-LVSS-205', 'LS-LVSS-301', 'LS-LVSS-303', 'LS-LVSS-305'])
    expect(cards[0]).toMatchObject({ appliedA: 132, marginPct: 3, low: true })
    expect(cards[0].next).toEqual({ code: 'LS-LVSS-301', amp: 160 })
  })

  it('T3 A 700, Class 10, 제어 미선택 → 403-?, 501-?, 503-?, 505-?', () => {
    const cards = cardsOf({ mode: 'A', amp: '700', tc: 10 })
    expect(cards.map((c) => c.code)).toEqual(['LS-LVSS-403-?', 'LS-LVSS-501-?', 'LS-LVSS-503-?', 'LS-LVSS-505-?'])
    expect(cards[0]).toMatchObject({ appliedA: 722, incomplete: true })
  })

  it('T4 A 700, Class 10, AC110V → 403-1', () => {
    const cards = cardsOf({ mode: 'A', amp: '700', tc: 10, ctrl: 'AC110V' })
    expect(cards[0]).toMatchObject({ code: 'LS-LVSS-403-1', incomplete: false })
  })

  it('T5 A 400, Class 10, 주위 50℃ → 그룹 3 제외, 1순위 307-?(430A)', () => {
    const cards = cardsOf({ mode: 'A', amp: '400', tc: 10, amb: 50 })
    expect(cards.map((c) => c.code)).toEqual(['LS-LVSS-307-?', 'LS-LVSS-309-?'])
    expect(cards[0].appliedA).toBe(430)
  })

  it('T6 A 50, Class 10, 기동 5회 → 그룹 1만: 111 … 205', () => {
    expect(codes({ mode: 'A', amp: '50', tc: 10, starts: 5 })).toEqual(
      ['111', '113', '115', '117', '201', '203', '205'].map((m) => 'LS-LVSS-' + m),
    )
  })

  it('T7 A 1200 → 결과 없음', () => {
    expect(cardsOf({ mode: 'A', amp: '1200' })).toEqual([])
  })
})

describe('기준 전류', () => {
  it('A 모드는 입력값 그대로', () => {
    expect(calcCurrent(inp({ mode: 'A', amp: '104' }))).toBe(104)
  })
  it('빈 값, 0, 음수, 문자는 0(무효)', () => {
    for (const amp of ['', '0', '-5', 'abc']) expect(calcCurrent(inp({ mode: 'A', amp }))).toBe(0)
    expect(calcCurrent(inp({ mode: 'kW', kw: '55', pf: '0' }))).toBe(0)
    expect(calcCurrent(inp({ mode: 'kW', kw: '55', pf: '' }))).toBe(0)
    expect(calcCurrent(inp({ mode: 'kW', kw: '-55' }))).toBe(0)
  })
  it('무효 전류에서는 후보가 없다', () => {
    expect(buildCards(D, INIT_INPUTS, 0)).toEqual([])
  })
})

describe('후보 규칙 경계', () => {
  it('정격과 같은 전류는 그 모델을 고른다(motorFlcA ≥ I), 여유 0%', () => {
    const cards = cardsOf({ mode: 'A', amp: '132', tc: 10 })
    expect(cards[0]).toMatchObject({ code: 'LS-LVSS-201', marginPct: 0, low: true, loadPct: 100 })
  })
  it('정격을 조금 넘으면 다음 모델', () => {
    expect(codes({ mode: 'A', amp: '132.1', tc: 10 })[0]).toBe('LS-LVSS-203')
  })
  it('최대 1080A는 505, 1080.1A는 결과 없음', () => {
    expect(codes({ mode: 'A', amp: '1080', tc: 10 })).toEqual(['LS-LVSS-505-?'])
    expect(codes({ mode: 'A', amp: '1080.1', tc: 10 })).toEqual([])
  })
  it('주위 40℃·기동 3회는 거르지 않는다', () => {
    const base = codes({ mode: 'A', amp: '400', tc: 10 })
    expect(codes({ mode: 'A', amp: '400', tc: 10, amb: 40 })).toEqual(base)
    expect(codes({ mode: 'A', amp: '400', tc: 10, starts: 3 })).toEqual(base)
  })
  it('AC220V는 -2 접미사, 307 미만은 접미사 없음', () => {
    expect(codes({ mode: 'A', amp: '300', tc: 10, ctrl: 'AC220V' })).toEqual(
      ['LS-LVSS-303', 'LS-LVSS-305', 'LS-LVSS-307-2', 'LS-LVSS-309-2', 'LS-LVSS-401-2', 'LS-LVSS-403-2', 'LS-LVSS-501-2', 'LS-LVSS-503-2', 'LS-LVSS-505-2'],
    )
  })
  it('같은 모델이 여러 행에 나오면 처음 행의 전류를 쓴다', () => {
    const c = findCandidates(D, inp({ tc: 30 }), 1)
    const models = c.map((x) => x.model)
    expect(new Set(models).size).toBe(models.length)
  })
  it('모델 번호 오름차순으로 정렬한다', () => {
    const nums = findCandidates(D, inp({ tc: 20 }), 1).map((x) => Number(x.model))
    expect(nums).toEqual([...nums].sort((a, b) => a - b))
  })
})

describe('카드 값', () => {
  it('5% 미만이고 다음 모델이 있어야 경고 대상(next 존재)', () => {
    const last = cardsOf({ mode: 'A', amp: '1070', tc: 10 })
    expect(last).toHaveLength(1)
    expect(last[0]).toMatchObject({ low: true, next: null })
  })
  it('막대 폭은 필요/적용 ×100 반올림, 최대 100', () => {
    const c = cardsOf({ mode: 'A', amp: '66', tc: 10 })[0]
    expect(c.loadPct).toBe(100)
    expect(cardsOf({ mode: 'A', amp: '50', tc: 10 })[0].loadPct).toBe(91)
  })
  it('프레임 정보와 기동 조건을 붙인다', () => {
    const c = cardsOf({ mode: 'A', amp: '104', tc: 10 })[0]
    expect(c.frame).toMatchObject({ size: 'Size 2', page: '8', dim: '143 × 318 × 232' })
    expect(c.duty).toMatchObject({ startsPerHour: 5, ratedAmbientC: 50 })
    expect(c.suffixed).toBe(false)
  })
})
