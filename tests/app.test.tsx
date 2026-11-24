// 화면 수준 시나리오 테스트 (docs/design/README.md, docs/design/prototype.html 기준)
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../src/App'

afterEach(() => cleanup())

// ---- 도우미 ----
const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const queryBtn = (name: string | RegExp) => screen.queryByRole('button', { name })
const current = () => screen.getByTestId('current').textContent
const cards = () => screen.queryAllByTestId('card')
const codes = () => screen.queryAllByTestId('code').map((e) => e.textContent)
const motor = () => screen.getByLabelText('모터 전류 또는 용량') as HTMLInputElement
const setMotor = (v: string) => fireEvent.change(motor(), { target: { value: v } })
const count = () => document.querySelector('.results-head .count')?.textContent
const shiftBand = () => screen.queryByText('한 단계 위 모델부터 보고 있어요.')
const detailsToggle = () => btn(/상세 조건/)
const chips = () => Array.from(document.querySelectorAll('.chips .chip')) as HTMLElement[]
const chip = (text: string) => chips().find((c) => c.textContent === text)
const formula = () => document.querySelector('.formula')?.textContent ?? ''

/** A 128, Class 30, DC24V (README T2) */
function setupT2() {
  fireEvent.click(btn('명판 전류(A)'))
  setMotor('128')
  fireEvent.click(btn('Class 30'))
  fireEvent.click(detailsToggle())
  fireEvent.click(btn('DC24V'))
}

describe('첫 화면', () => {
  it('기준 전류 104, 추천 13건, 카드 4개, 더 보기 9건', () => {
    render(<App />)
    expect(current()).toBe('104')
    expect(count()).toBe('13건')
    expect(cards()).toHaveLength(4)
    expect(codes()[0]).toBe('LS-LVSS-201')
    // 1순위 카드만 "정격 여유 최소" 태그
    expect(within(cards()[0]).queryByText('정격 여유 최소')).not.toBeNull()
    expect(within(cards()[1]).queryByText('정격 여유 최소')).toBeNull()
    expect(shiftBand()).toBeNull()
    expect(detailsToggle().getAttribute('aria-expanded')).toBe('false')
  })

  it('"추천 모델 9건 더 보기"를 누르면 13개가 모두 나오고 버튼이 사라진다', () => {
    render(<App />)
    fireEvent.click(btn('추천 모델 9건 더 보기'))
    expect(cards()).toHaveLength(13)
    expect(queryBtn(/더 보기/)).toBeNull()
  })
})

describe('명판 전류 128A, Class 30, DC24V (README T2)', () => {
  it('카드 4개, 첫 카드 205 + 경고 박스', () => {
    render(<App />)
    setupT2()
    expect(current()).toBe('128')
    expect(codes()).toEqual(['LS-LVSS-205', 'LS-LVSS-301', 'LS-LVSS-303', 'LS-LVSS-305'])
    expect(queryBtn(/더 보기/)).toBeNull()

    const first = cards()[0]
    const warn = first.querySelector('.warn')
    expect(warn).not.toBeNull()
    expect(warn!.textContent).toContain('정격 여유가 5% 미만')
    expect(warn!.textContent).toContain('LS-LVSS-301')
    expect(first.textContent).toContain('+3%')
    expect(first.className).toContain('low')
    // 나머지 카드는 경고 없음
    for (const c of cards().slice(1)) expect(c.querySelector('.warn')).toBeNull()
  })

  it('A 모드 도움말·계산식 줄과 칩', () => {
    render(<App />)
    setupT2()
    expect(screen.queryByText(/모터 명판에 적힌 정격전류\(FLC\)/)).not.toBeNull()
    expect(formula()).toContain('명판 정격전류 128 A 그대로 선정에 써요.')
    expect(formula()).toContain('카탈로그 선정 가이드(In Line 결선) 기준이에요.')
    expect(chip('128 A (명판)')).toBeDefined()
    expect(chip('Trip Class 30')).toBeDefined()
    expect(chip('제어전원 DC24V')!.className).toContain('on')
    expect(screen.queryByText(/관성이 커서 오래 걸려 기동하는 부하/)).not.toBeNull()
  })
})

describe('한 단계 위로 바꿔 보기', () => {
  it('띠 표시, 첫 카드가 다음 모델 → "처음 추천으로" 복귀', () => {
    render(<App />)
    expect(codes()[0]).toBe('LS-LVSS-201')
    fireEvent.click(within(cards()[0]).getByRole('button', { name: '한 단계 위로 바꿔 보기' }))
    expect(shiftBand()).not.toBeNull()
    expect(codes()[0]).toBe('LS-LVSS-203')
    // 건수 표시는 전체 13건 그대로, 더 보기는 남은 12건 기준
    expect(count()).toBe('13건')
    expect(btn('추천 모델 8건 더 보기')).toBeDefined()

    // 두 번째로 올리면 그다음 모델
    fireEvent.click(within(cards()[0]).getByRole('button', { name: '한 단계 위로 바꿔 보기' }))
    expect(codes()[0]).toBe('LS-LVSS-205')

    fireEvent.click(btn('처음 추천으로'))
    expect(shiftBand()).toBeNull()
    expect(codes()[0]).toBe('LS-LVSS-201')
  })

  it('조건을 바꾸면 한 단계 위(offset)와 더 보기가 초기화된다', () => {
    render(<App />)
    fireEvent.click(btn('추천 모델 9건 더 보기'))
    fireEvent.click(within(cards()[0]).getByRole('button', { name: '한 단계 위로 바꿔 보기' }))
    expect(shiftBand()).not.toBeNull()
    expect(cards()).toHaveLength(12)

    fireEvent.click(btn('Class 20'))
    expect(shiftBand()).toBeNull()
    expect(cards()).toHaveLength(4)
    expect(queryBtn(/더 보기/)).not.toBeNull()
  })

  it('입력값을 바꿔도 초기화되고, 상세 조건 펼침은 유지된다', () => {
    render(<App />)
    fireEvent.click(detailsToggle())
    fireEvent.click(within(cards()[0]).getByRole('button', { name: '한 단계 위로 바꿔 보기' }))
    setMotor('60')
    expect(shiftBand()).toBeNull()
    expect(detailsToggle().getAttribute('aria-expanded')).toBe('true')
  })
})

describe('빈 입력과 결과 없음', () => {
  it('입력을 비우면 "—"와 빈 상태 문구', () => {
    render(<App />)
    setMotor('')
    expect(current()).toBe('—')
    expect(cards()).toHaveLength(0)
    expect(screen.queryByText('왼쪽에 모터 전류나 kW를 넣으면 추천 모델이 나와요.')).not.toBeNull()
    expect(chip('- kW (계산)')).toBeDefined()
  })

  it('A 모드 1200A → 결과 없음 문구(최대 1080A)', () => {
    render(<App />)
    fireEvent.click(btn('명판 전류(A)'))
    setMotor('1200')
    expect(current()).toBe('1200')
    expect(cards()).toHaveLength(0)
    expect(screen.queryByText('조건에 맞는 모델이 없어요')).not.toBeNull()
    const empty = document.querySelector('.empty')!
    expect(empty.textContent).toContain('카탈로그 선정 범위는 최대 1080A예요.')
    expect(empty.textContent).toContain('1544-2080')
    expect(count()).toBe('0건')
  })
})

describe('형명 접미사 (307 이상)', () => {
  it('제어 전원 미선택 → "-?"와 안내, AC110V → "-1"', () => {
    render(<App />)
    fireEvent.click(btn('명판 전류(A)'))
    setMotor('700')
    expect(codes()).toEqual(['LS-LVSS-403-?', 'LS-LVSS-501-?', 'LS-LVSS-503-?', 'LS-LVSS-505-?'])
    const first = cards()[0]
    expect(first.querySelector('.incomplete')?.textContent).toBe(
      '형명 끝자리는 제어전원으로 정해져요. 상세 조건에서 제어 전원을 고르면 형명이 완성돼요.',
    )
    expect(first.textContent).toContain('제어전원: -1 = AC110V, -2 = AC220V (DC24V 미지원)')

    fireEvent.click(detailsToggle())
    fireEvent.click(btn('AC110V'))
    expect(codes()[0]).toBe('LS-LVSS-403-1')
    expect(cards()[0].querySelector('.incomplete')).toBeNull()
  })

  it('307 미만 카드는 접미사 없이 공용 안내', () => {
    render(<App />)
    expect(cards()[0].textContent).toContain('제어전원: DC24V / AC110V / AC220V 공용')
    expect(cards()[0].querySelector('.incomplete')).toBeNull()
  })
})

describe('조건 초기화', () => {
  it('바꾼 조건과 펼침 상태가 모두 첫 상태로 돌아간다', () => {
    render(<App />)
    setupT2()
    fireEvent.click(within(cards()[0]).getByRole('button', { name: '한 단계 위로 바꿔 보기' }))
    expect(detailsToggle().getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(btn('조건 초기화'))
    expect(current()).toBe('104')
    expect(count()).toBe('13건')
    expect(cards()).toHaveLength(4)
    expect(codes()[0]).toBe('LS-LVSS-201')
    expect(shiftBand()).toBeNull()
    expect(detailsToggle().getAttribute('aria-expanded')).toBe('false')
    expect(queryBtn('DC24V')).toBeNull()
    expect(btn('kW').getAttribute('aria-pressed')).toBe('true')
    expect(btn('Class 10').getAttribute('aria-pressed')).toBe('true')
    expect(motor().value).toBe('55')
  })
})

describe('요약 칩과 계산식', () => {
  it('첫 상태 칩: 켜진 칩과 점선(꺼진) 칩', () => {
    render(<App />)
    expect(chips().map((c) => c.textContent)).toEqual([
      '380 V · 60Hz',
      '55 kW (계산)',
      'Trip Class 10',
      '주위 -',
      '기동 -',
      '제어전원 -',
      '결선 In Line',
    ])
    for (const t of ['380 V · 60Hz', '55 kW (계산)', 'Trip Class 10', '결선 In Line']) {
      expect(chip(t)!.classList.contains('on')).toBe(true)
    }
    for (const t of ['주위 -', '기동 -', '제어전원 -']) {
      expect(chip(t)!.classList.contains('on')).toBe(false)
    }
  })

  it('kW 계산식 줄과 근삿값 안내', () => {
    render(<App />)
    expect(formula()).toContain('I = P / (√3 · V · η·cosφ) = 55kW / (√3 · 380V · 0.80) ≈ 104 A')
    expect(formula()).toContain('근삿값이에요. 명판 전류를 확인하면 더 정확해요.')
  })

  it('상세 조건 선택이 칩에 반영된다', () => {
    render(<App />)
    fireEvent.click(detailsToggle())
    fireEvent.click(btn('50℃ 이하'))
    fireEvent.click(btn('시간당 5회'))
    fireEvent.click(btn('AC220V'))
    fireEvent.click(btn('50Hz'))
    expect(chip('380 V · 50Hz')).toBeDefined()
    expect(chip('주위 50℃ 이하')!.classList.contains('on')).toBe(true)
    expect(chip('기동 5회/h')!.classList.contains('on')).toBe(true)
    expect(chip('제어전원 AC220V')!.classList.contains('on')).toBe(true)
  })

  it('전압을 바꾸면 계산식과 기준 전류가 바뀐다', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText(/전원 전압/), { target: { value: '440' } })
    // 55kW / (√3·440·0.8) = 90.2
    expect(current()).toBe('90')
    expect(formula()).toContain('(√3 · 440V · 0.80) ≈ 90 A')
    expect(chip('440 V · 60Hz')).toBeDefined()
  })
})

describe('개선 R2: 포커스와 화면 읽기', () => {
  it('한 단계 위로 바꾸면 결과 제목으로 포커스가 간다', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: '한 단계 위로 바꿔 보기' })[0])
    expect(document.activeElement?.tagName).toBe('H2')
    fireEvent.click(btn('처음 추천으로'))
    expect(document.activeElement?.tagName).toBe('H2')
  })
  it('더 보기를 누르면 새로 보인 첫 카드(5번째)로 포커스가 간다', () => {
    render(<App />)
    fireEvent.click(btn(/더 보기/))
    expect(document.activeElement).toBe(cards()[4])
  })
  it('결과 요약을 aria-live로 알린다', () => {
    render(<App />)
    const live = document.querySelector('[aria-live="polite"]')
    expect(live?.textContent).toBe('선정 기준 전류 104 A, 추천 모델 13건')
    setMotor('')
    expect(live?.textContent).toBe('')
  })
  it('상세 조건이 닫혀 있으면 aria-controls가 없다', () => {
    render(<App />)
    expect(detailsToggle().getAttribute('aria-controls')).toBeNull()
    fireEvent.click(detailsToggle())
    expect(detailsToggle().getAttribute('aria-controls')).toBe('details-in')
    expect(document.getElementById('details-in')).not.toBeNull()
  })
})
