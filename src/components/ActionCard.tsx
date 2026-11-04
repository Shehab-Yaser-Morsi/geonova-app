import type { ReactNode } from 'react'

export type HeroMode = 'data' | 'results'

type ActionCardProps = {
  mode: HeroMode
  active: boolean
  onSelect: (mode: HeroMode) => void
  arabicTitle: string
  englishTitle: string
  description: string
  icon: ReactNode
}

export function ActionCard({
  mode,
  active,
  onSelect,
  arabicTitle,
  englishTitle,
  description,
  icon,
}: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      aria-pressed={active}
      className={[
        'group relative w-full overflow-hidden rounded-3xl border p-5 text-right transition duration-300',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300',
        active
          ? 'border-teal-300/60 bg-white/10 shadow-[0_18px_50px_-20px_rgba(45,212,191,0.55)] ring-1 ring-teal-300/30'
          : 'border-white/10 bg-white/[0.03] opacity-80 hover:opacity-100 hover:-translate-y-1 hover:border-teal-200/30 hover:bg-white/10 hover:shadow-[0_22px_40px_-24px_rgba(8,15,30,0.9)]',
      ].join(' ')}
    >
      <div
        className={[
          'pointer-events-none absolute inset-0 opacity-0 transition duration-300',
          'bg-[radial-gradient(120%_80%_at_100%_0%,rgba(45,212,191,0.18),transparent_55%)]',
          active ? 'opacity-100' : 'group-hover:opacity-100',
        ].join(' ')}
      />
      <div className="relative flex items-start gap-4">
        <span
          className={[
            'grid h-14 w-14 shrink-0 place-items-center rounded-2xl border backdrop-blur-md transition',
            active
              ? 'border-teal-300/40 bg-teal-400/15 text-teal-200'
              : 'border-white/10 bg-slate-950/40 text-slate-200 group-hover:text-teal-200',
          ].join(' ')}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-cairo text-2xl font-extrabold leading-tight text-white">
            {arabicTitle}
          </span>
          <span className="mt-1 block font-manrope text-xs font-semibold tracking-[0.18em] text-teal-200/80 uppercase">
            {englishTitle}
          </span>
          <span className="mt-3 block text-sm leading-6 text-slate-300">
            {description}
          </span>
        </span>
      </div>
    </button>
  )
}
