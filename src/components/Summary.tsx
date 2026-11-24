import type { Inputs } from '../engine/types'
import { T } from '../strings'

function Chip({ label, on }: { label: string; on: boolean }) {
  return <span className={'chip' + (on ? ' on' : '')}>{label}</span>
}

export function Summary({ s, I }: { s: Inputs; I: number }) {
  const valid = I > 0
  const r = Math.round(I)
  return (
    <section className="summary" aria-label={T.summaryAria}>
      <div className="lead">
        <span className="lead-label">{T.leadLabel}</span>
        <div className="lead-value">
          <span className="big mono" data-testid="current">
            {valid ? r : '—'}
          </span>
          <span className="big-unit">A</span>
        </div>
      </div>
      <div className="detail">
        <div className="chips">
          <Chip on label={T.chipVoltage(s.v, s.hz)} />
          <Chip on label={s.mode === 'kW' ? T.chipKw(s.kw) : T.chipA(s.amp)} />
          <Chip on label={T.chipTc(s.tc)} />
          <Chip on={s.amb !== null} label={T.chipAmb(s.amb)} />
          <Chip on={s.starts !== null} label={T.chipStarts(s.starts)} />
          <Chip on={s.ctrl !== null} label={T.chipCtrl(s.ctrl)} />
          <Chip on label={T.chipConnection} />
        </div>
        <div className="formula mono">
          {s.mode === 'kW' ? T.formulaKw(s.kw, s.v, s.pf, r) : T.formulaA(s.amp)}
          <br />
          <span className="sub">{s.mode === 'kW' ? T.approx : T.catalogBasis}</span>
        </div>
      </div>
    </section>
  )
}
