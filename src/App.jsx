import React, { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-radial from-neutral-900 to-neutral-950 p-6 text-center select-none">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 max-w-md w-full rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-neutral-700/80">
        {/* Header Section */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            React + Tailwind v4
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Minimal Workspace
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            A premium starting point with zero boilerplate.
          </p>
        </header>

        {/* Action / Interactive Section */}
        <section className="flex flex-col items-center gap-4">
          <div className="text-5xl font-mono font-bold text-white tracking-widest transition-transform duration-200 active:scale-95">
            {count}
          </div>
          <button
            id="increment-btn"
            onClick={() => setCount((prev) => prev + 1)}
            className="w-full cursor-pointer rounded-xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950 transition-all duration-200 hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-white/5"
          >
            Increment Counter
          </button>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-neutral-800 pt-6 text-xs text-neutral-500">
          Tailwind CSS v4 &bull; Vite &bull; React
        </footer>
      </main>
    </div>
  )
}
