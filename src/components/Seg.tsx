// 세그먼트 버튼 묶음 (aria-pressed로 선택 상태 표시)
interface Props<V> {
  options: ReadonlyArray<readonly [V, string]>
  value: V
  onChange: (v: V) => void
  className?: string
  label?: string
}

export function Seg<V extends string | number | null>({ options, value, onChange, className, label }: Props<V>) {
  return (
    <div className={'seg ' + (className ?? '')} role="group" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={String(v)} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  )
}
