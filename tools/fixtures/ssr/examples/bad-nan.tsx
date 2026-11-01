export const meta = { title: "NaN" }

export default function Example() {
  const ratio = 0 / 0
  return (
    <svg data-ink="icon" aria-hidden="true" focusable="false" viewBox="0 0 10 10">
      <path d={`M 0 0 L ${ratio} 10`} />
    </svg>
  )
}
