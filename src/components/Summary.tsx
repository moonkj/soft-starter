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
        <div className="lead-value" aria-live="polite">
          <span className="big mono" data-testid="current">
            {valid ? r : '—'}
          </span>
          <span className="big-unit">A</span>
        </div>
      </div>
      <div className="detail">
        <div className="chips">
          <Chip on label={`${s.v} V · ${s.hz}Hz`} />
          <Chip on label={s.mode === 'kW' ? `${s.kw || '-'} kW (계산)` : `${s.amp || '-'} A (명판)`} />
          <Chip on label={`Trip Class ${s.tc}`} />
          <Chip on={s.amb !== null} label={'주위 ' + (s.amb ? `${s.amb}℃ 이하` : '-')} />
          <Chip on={s.starts !== null} label={'기동 ' + (s.starts ? `${s.starts}회/h` : '-')} />
          <Chip on={s.ctrl !== null} label={'제어전원 ' + (s.ctrl ?? '-')} />
          <Chip on label="결선 In Line" />
        </div>
        <div className="formula mono">
          {s.mode === 'kW' ? (
            <>
              I = P / (√3 · V · η·cosφ) = {s.kw || 0}kW / (√3 · {s.v}V · {s.pf}) ≈ {r} A
              <br />
              <span className="sub">{T.approx}</span>
            </>
          ) : (
            <>
              명판 정격전류 {s.amp || 0} A 그대로 선정에 써요.
              <br />
              <span className="sub">{T.catalogBasis}</span>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
