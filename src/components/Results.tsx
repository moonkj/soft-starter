import { useEffect, useRef } from 'react'
import type { Card, TripClass } from '../engine/types'
import { T } from '../strings'
import { ModelCard } from './ModelCard'

/** 처음에 보여 줄 카드 수 */
export const FIRST_VISIBLE = 4

interface Props {
  valid: boolean
  current: number
  cards: Card[]
  tc: TripClass
  offset: number
  more: boolean
  maxA: number
  onUp: (index: number) => void
  onFirst: () => void
  onMore: () => void
}

export function Results({ valid, current, cards, tc, offset, more, maxA, onUp, onFirst, onMore }: Props) {
  const rest = cards.slice(offset)
  const visible = more ? rest : rest.slice(0, FIRST_VISIBLE)
  const headRef = useRef<HTMLHeadingElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const pending = useRef<'head' | 'more' | null>(null)

  // 누른 버튼이 사라지는 동작 뒤에 포커스를 잃지 않게 옮긴다(키보드·스크린리더 사용자).
  useEffect(() => {
    if (pending.current === 'head') headRef.current?.focus()
    if (pending.current === 'more') (listRef.current?.children[FIRST_VISIBLE] as HTMLElement | undefined)?.focus()
    pending.current = null
  })

  const status = valid ? T.liveStatus(Math.round(current), cards.length) : ''

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
      <div className="results-head">
        <h2 ref={headRef} tabIndex={-1}>
          {T.recommended} <span className="count">{T.countUnit(cards.length)}</span>
        </h2>
        <span className="help">{T.sortNote}</span>
      </div>

      {offset > 0 && (
        <div className="shift">
          <span>{T.shifted}</span>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              pending.current = 'head'
              onFirst()
            }}
          >
            {T.backToFirst}
          </button>
        </div>
      )}

      {!valid ? (
        <div className="empty">{T.emptyInput}</div>
      ) : cards.length === 0 ? (
        <div className="empty">
          <strong>{T.noResultTitle}</strong>
          <br />
          {T.noResultBody(maxA)}
        </div>
      ) : (
        <>
          <div className="cards" ref={listRef}>
            {visible.map((it) => (
              <ModelCard
                key={it.model}
                it={it}
                tc={tc}
                onUp={(i) => {
                  pending.current = 'head'
                  onUp(i)
                }}
              />
            ))}
          </div>
          {!more && rest.length > FIRST_VISIBLE && (
            <button
              type="button"
              className="btn-ghost more"
              onClick={() => {
                pending.current = 'more'
                onMore()
              }}
            >
              {T.more(rest.length - FIRST_VISIBLE)}
            </button>
          )}
        </>
      )}
    </>
  )
}
