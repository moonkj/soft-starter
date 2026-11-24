import { CATALOG_PDF_URL } from '../config'
import type { Card, TripClass } from '../engine/types'
import { ctrlText, dutyText, T } from '../strings'

interface Props {
  it: Card
  tc: TripClass
  onUp: (index: number) => void
}

export function ModelCard({ it, tc, onUp }: Props) {
  const f = it.frame
  const page = f.page
  return (
    <article className={'card' + (it.best ? ' best' : '') + (it.low ? ' low' : '')} data-testid="card">
      <div className="top">
        <div className="img" aria-hidden="true">
          {T.imgPlaceholder[0]}
          <br />
          {T.imgPlaceholder[1]}
        </div>
        <div className="info">
          <div className="tags">
            {it.best && <span className="tag best">{T.bestTag}</span>}
            <span className="tag bp">{f.bypass}</span>
            <span className="tag">{f.ip}</span>
          </div>
          <span className="help meta">
            LVSS 시리즈 · {f.size} · {f.amp}
          </span>
          <span className="mono code" data-testid="code">
            {it.code}
          </span>
          {it.incomplete && (
            <p className="help incomplete">
              {T.incomplete[0]}
              <strong>{T.incomplete[1]}</strong>
              {T.incomplete[2]}
            </p>
          )}
          <span className="help meta">
            외형 {f.dim} mm · {f.term}
          </span>
        </div>
      </div>

      <div className="sep amps">
        <div className="line">
          <span>
            필요 <b className="mono">{it.needA} A</b> / 적용 <b className="mono">{it.appliedA} A</b>
          </span>
          <span>
            정격 여유 <b className={it.low ? 'margin-low' : 'margin-ok'}>+{it.marginPct}%</b>
          </span>
        </div>
        <div className="bar" role="presentation">
          <i style={{ width: it.loadPct + '%' }} />
        </div>
        <span className="help meta">
          Trip Class {tc} · {dutyText(it.duty)}
        </span>
      </div>

      {it.next && (
        <div className="next">
          <span>
            {T.nextLabel}
            <b className="mono">{it.next.code}</b> ({it.next.amp} A)
          </span>
          <button type="button" className="link" onClick={() => onUp(it.index + 1)}>
            {T.shiftUp}
          </button>
        </div>
      )}

      {it.low && it.next && (
        <div className="warn" role="note">
          <strong>{T.warnTitle}</strong>
          {T.warnBody(it.next.code)}
        </div>
      )}

      <div className="sep foot">
        <span>{ctrlText(f)}</span>
        {CATALOG_PDF_URL ? (
          <a href={`${CATALOG_PDF_URL}#page=${page}`} target="_blank" rel="noopener noreferrer">
            {T.catalogPage(page)}
          </a>
        ) : (
          // TODO: 카탈로그 PDF가 정해지면 src/config.ts에 주소를 넣는다.
          <a href="#" onClick={(e) => e.preventDefault()}>
            {T.catalogPage(page)}
          </a>
        )}
      </div>
    </article>
  )
}
