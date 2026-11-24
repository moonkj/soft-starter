import type { Inputs } from '../engine/types'
import { T, TC_DESC, VOLTAGES } from '../strings'
import { Seg } from './Seg'

interface Props {
  s: Inputs
  open: boolean
  onSet: (patch: Partial<Inputs>) => void
  onReset: () => void
  onToggle: () => void
}

export function ConditionPanel({ s, open, onSet, onReset, onToggle }: Props) {
  const isKw = s.mode === 'kW'
  return (
    <aside id="panel">
      <div className="group panel-head">
        <div className="title">
          <h2>{T.panelTitle}</h2>
          <button type="button" className="btn-ghost" onClick={onReset}>
            {T.reset}
          </button>
        </div>
        <p className="help">{T.panelHelp}</p>
      </div>

      <div className="group">
        <label className="lbl" htmlFor="volt">
          {T.voltage}
          <span className="req">{T.required}</span>
        </label>
        <div className="row">
          <select id="volt" className="field grow" value={s.v} onChange={(e) => onSet({ v: e.target.value })}>
            {VOLTAGES.map((v) => (
              <option key={v} value={v}>
                {v} V
              </option>
            ))}
          </select>
          <div style={{ width: 120 }}>
            <Seg label="주파수" options={[[50, '50Hz'], [60, '60Hz']] as const} value={s.hz} onChange={(hz) => onSet({ hz })} />
          </div>
        </div>
      </div>

      <div className="group">
        <span className="lbl">
          {T.motor}
          <span className="req">{T.required}</span>
        </span>
        <Seg label="입력 방식" options={[['A', T.modeA], ['kW', 'kW']] as const} value={s.mode} onChange={(mode) => onSet({ mode })} />
        <div className="row">
          <input
            id="motor"
            className="field grow"
            style={{ fontSize: 17 }}
            type="number"
            inputMode="decimal"
            min={0}
            aria-label={T.motorAria}
            value={isKw ? s.kw : s.amp}
            onChange={(e) => onSet(isKw ? { kw: e.target.value } : { amp: e.target.value })}
          />
          <span className="unit">{isKw ? 'kW' : 'A'}</span>
        </div>
        <p className="help">{isKw ? T.helpKw : T.helpA}</p>
      </div>

      <div className="group">
        <span className="lbl">{T.tripClass}</span>
        <Seg label={T.tripClass} options={[[10, 'Class 10'], [20, 'Class 20'], [30, 'Class 30']] as const} value={s.tc} onChange={(tc) => onSet({ tc })} />
        <p className="note">{TC_DESC[s.tc]}</p>
      </div>

      <div className="details">
        <button type="button" aria-expanded={open} aria-controls="details-in" onClick={onToggle}>
          <span>{T.details}</span>
          <span className="sign" aria-hidden="true">
            {open ? '−' : '+'}
          </span>
        </button>
        {open && (
          <div className="in" id="details-in">
            <div className="group">
              <span className="lbl sm">{T.ctrl}</span>
              <Seg
                className="sm grid2"
                label={T.ctrl}
                options={[[null, T.none], ['DC24V', 'DC24V'], ['AC110V', 'AC110V'], ['AC220V', 'AC220V']] as const}
                value={s.ctrl}
                onChange={(ctrl) => onSet({ ctrl })}
              />
            </div>
            <div className="group">
              <span className="lbl sm">{T.amb}</span>
              <Seg className="sm" label={T.amb} options={[[null, T.any], [40, '40℃ 이하'], [50, '50℃ 이하']] as const} value={s.amb} onChange={(amb) => onSet({ amb })} />
            </div>
            <div className="group">
              <span className="lbl sm">{T.starts}</span>
              <Seg className="sm" label={T.starts} options={[[null, T.any], [3, '시간당 3회'], [5, '시간당 5회']] as const} value={s.starts} onChange={(starts) => onSet({ starts })} />
            </div>
            <div className="group">
              <label className="lbl sm" htmlFor="pf">
                {T.pf}
              </label>
              <input id="pf" className="field" type="number" step="0.01" min={0} value={s.pf} onChange={(e) => onSet({ pf: e.target.value })} />
            </div>
            <p className="help" style={{ fontSize: 12 }}>
              {T.connectionNote}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
