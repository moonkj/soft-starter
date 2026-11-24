import type { Card, TripClass } from '../engine/types'
import { T } from '../strings'
import { ModelCard } from './ModelCard'

/** 처음에 보여 줄 카드 수 */
const FIRST_VISIBLE = 4

interface Props {
  valid: boolean
  cards: Card[]
  tc: TripClass
  offset: number
  more: boolean
  maxA: number
  onUp: (index: number) => void
  onFirst: () => void
  onMore: () => void
}

export function Results({ valid, cards, tc, offset, more, maxA, onUp, onFirst, onMore }: Props) {
  const rest = cards.slice(offset)
  const visible = more ? rest : rest.slice(0, FIRST_VISIBLE)
  return (
    <>
      <div className="results-head">
        <h2>
          {T.recommended} <span className="count">{cards.length}건</span>
        </h2>
        <span className="help">{T.sortNote}</span>
      </div>

      {offset > 0 && (
        <div className="shift">
          <span>{T.shifted}</span>
          <button type="button" className="btn-ghost" onClick={onFirst}>
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
          <div className="cards">
            {visible.map((it) => (
              <ModelCard key={it.model} it={it} tc={tc} onUp={onUp} />
            ))}
          </div>
          {!more && rest.length > FIRST_VISIBLE && (
            <button type="button" className="btn-ghost more" onClick={onMore}>
              {T.more(rest.length - FIRST_VISIBLE)}
            </button>
          )}
        </>
      )}
    </>
  )
}
