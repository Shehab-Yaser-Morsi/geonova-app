import { useState } from 'react'
import { ActionCard, type HeroMode } from './ActionCard'
import { GeoMap } from './GeoMap'

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
      <path
        d="M12 4.5 3.8 8.4 12 12.3l8.2-3.9L12 4.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m4.4 12.2 7.6 3.6 7.6-3.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m4.4 15.8 7.6 3.6 7.6-3.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ResultsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
      <path
        d="M5 19V9.5M12 19V5M19 19v-6.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 19h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HeroSection() {
  const [mode, setMode] = useState<HeroMode>('data')

  return (
    <section className="relative isolate overflow-hidden px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 start-[-8%] h-80 w-80 rounded-full bg-teal-400/12 blur-3xl" />
        <div className="absolute top-24 end-[-6%] h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,20,0.2),rgba(7,11,20,0.88))]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_left,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <header className="mb-8 sm:mb-10">
          <div>
            <p className="font-manrope text-[11px] font-semibold tracking-[0.28em] text-teal-200/80 uppercase">
              GIS Graduation Platform
            </p>
            <h1 className="mt-2 font-cairo text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              GEONOVA
              <span className="mt-1 block text-2xl font-bold text-slate-200 sm:text-3xl">
                جيونوفا
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              منصة مشاريع التخرج لكلية الآداب — جامعة سوهاج. نعرض الخرائط
              المكانية، البيانات الجغرافية، ونتائج التحليل المكاني في واجهة واحدة.
            </p>
            <p className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-md">
              كلية الآداب · جامعة سوهاج
            </p>
          </div>
        </header>

        <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(280px,0.92fr)_minmax(0,1.35fr)] lg:gap-6">
          <div className="flex flex-col justify-center gap-4">
            <ActionCard
              mode="data"
              active={mode === 'data'}
              onSelect={setMode}
              arabicTitle="البيانات"
              englishTitle="Geographic Data"
              description="استعرض طبقات البيانات المكانية، نقاط الرصد الميداني، والحدود الإدارية داخل محافظة سوهاج."
              icon={<LayersIcon />}
            />
            <ActionCard
              mode="results"
              active={mode === 'results'}
              onSelect={setMode}
              arabicTitle="النتائج"
              englishTitle="Project Results"
              description="انتقل إلى مخرجات التحليل المكاني ونتائج مشاريع التخرج على الخريطة التفاعلية."
              icon={<ResultsIcon />}
            />
          </div>

          <div className="relative min-h-[22rem] overflow-hidden rounded-3xl border border-white/10 bg-panel shadow-[0_30px_80px_-32px_rgba(0,0,0,0.85)] sm:min-h-[28rem] lg:min-h-[36rem]">
            <div className="absolute inset-0" dir="ltr">
              <GeoMap key={mode} mode={mode} />
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 z-[400] flex items-start justify-between p-4">
              <span className="pointer-events-auto rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-md">
                {mode === 'data' ? 'طبقة البيانات الجغرافية' : 'طبقة نتائج المشاريع'}
              </span>
              <span className="rounded-full border border-teal-300/20 bg-teal-400/10 px-3 py-1.5 font-manrope text-[11px] font-semibold tracking-wide text-teal-100 uppercase">
                Leaflet Map
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
