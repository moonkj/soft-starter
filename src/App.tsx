import { useMemo, useState } from 'react'
import data from '../data/lvss-selection.json'
import { ConditionPanel } from './components/ConditionPanel'
import { Results } from './components/Results'
import { Summary } from './components/Summary'
import { buildCards, calcCurrent, INIT_INPUTS, maxCurrent } from './engine/select'
import type { Inputs, LvssData } from './engine/types'
import { T } from './strings'

const DATA = data as LvssData
const MAX_A = maxCurrent(DATA)

/** 목록 보기 상태: 한 단계 위 이동(offset), 더 보기(more), 상세 조건 펼침(open) */
interface View {
  open: boolean
  offset: number
  more: boolean
}
const INIT_VIEW: View = { open: false, offset: 0, more: false }

export default function App() {
  const [s, setS] = useState<Inputs>(INIT_INPUTS)
  const [view, setView] = useState<View>(INIT_VIEW)

  const I = useMemo(() => calcCurrent(s), [s])
  const cards = useMemo(() => buildCards(DATA, s, I), [s, I])

  // 조건이 바뀌면 "한 단계 위"와 "더 보기"를 초기화한다(펼침 상태는 유지).
  const setInputs = (patch: Partial<Inputs>) => {
    setS((prev) => ({ ...prev, ...patch }))
    setView((v) => ({ ...v, offset: 0, more: false }))
  }

  return (
    <>
      <header>
        <div className="wrap">
          <h1>{T.title}</h1>
          <span className="help">{T.headerNote}</span>
        </div>
      </header>
      <div className="body">
        <ConditionPanel
          s={s}
          open={view.open}
          onSet={setInputs}
          onReset={() => {
            setS(INIT_INPUTS)
            setView(INIT_VIEW)
          }}
          onToggle={() => setView((v) => ({ ...v, open: !v.open }))}
        />
        <main id="main">
          <Summary s={s} I={I} />
          <Results
            valid={I > 0}
            cards={cards}
            tc={s.tc}
            offset={view.offset}
            more={view.more}
            maxA={MAX_A}
            onUp={(offset) => setView((v) => ({ ...v, offset }))}
            onFirst={() => setView((v) => ({ ...v, offset: 0 }))}
            onMore={() => setView((v) => ({ ...v, more: true }))}
          />
        </main>
      </div>
    </>
  )
}
