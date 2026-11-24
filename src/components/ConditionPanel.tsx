import type { Inputs, TripClass } from '../engine/types'
import { T, TC_DESC, VOLTAGES } from '../strings'
import { Seg } from './Seg'

interface Props {
  s: Inputs
  open: boolean
  onSet: (patch: Partial<Inputs>) => void
  onReset: () => void
  onToggle: () => void
}

const TCS: TripClass[] = [10, 20, 30]

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
          <div className="hz">
            <Seg label={T.hzAria} options={[[50, '50Hz'], [60, '60Hz']] as const} value={s.hz} onChange={(hz) => onSet({ hz })} />
          </div>
        </div>
      </div>

      <div className="group">
        <span className="lbl">
          {T.motor}
          <span className="req">{T.required}</span>
        </span>
        <Seg label={T.modeAria} options={[['A', T.modeA], ['kW', T.modeKw]] as const} value={s.mode} onChange={(mode) => onSet({ mode })} />
        <div className="row">
          <input
            id="motor"
            className="field grow motor"
            type="number"
            inputMode="decimal"
            min={0}
            aria-label={T.motorAria}
            value={isKw ? s.kw : s.amp}
            onChange={(e) => onSet(isKw ? { kw: e.target.value } : { amp: e.target.value })}
          />
          <span className="unit">{isKw ? T.modeKw : 'A'}</span>
        </div>
        <p className="help">{isKw ? T.helpKw : T.helpA}</p>
      </div>

      <div className="group">
        <span className="lbl">{T.tripClass}</span>
        <Seg label={T.tripClass} options={TCS.map((tc) => [tc, T.tcOption(tc)] as const)} value={s.tc} onChange={(tc) => onSet({ tc })} />
        <p className="note">{TC_DESC[s.tc]}</p>
      </div>

      <div className="details">
        <button type="button" aria-expanded={open} aria-controls={open ? 'details-in' : undefined} onClick={onToggle}>
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
              <Seg className="sm" label={T.amb} options={[[null, T.any], [40, T.ambOption(40)], [50, T.ambOption(50)]] as const} value={s.amb} onChange={(amb) => onSet({ amb })} />
            </div>
            <div className="group">
              <span className="lbl sm">{T.starts}</span>
              <Seg className="sm" label={T.starts} options={[[null, T.any], [3, T.startsOption(3)], [5, T.startsOption(5)]] as const} value={s.starts} onChange={(starts) => onSet({ starts })} />
            </div>
            <div className="group">
              <label className="lbl sm" htmlFor="pf">
                {T.pf}
              </label>
              <input id="pf" className="field" type="number" step="0.01" min={0} value={s.pf} onChange={(e) => onSet({ pf: e.target.value })} />
            </div>
            <p className="help small">{T.connectionNote}</p>
          </div>
        )}
      </div>
    </aside>
  )
}
