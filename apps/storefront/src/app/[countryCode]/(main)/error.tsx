"use client"

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="content-container text-center py-24 min-h-[60vh] space-y-6">
    <p className="text-xs uppercase tracking-widest text-accent">NAQSH</p>
    <h1 className="font-serif text-3xl">We could not load this page</h1>
    <p className="text-stone-500">Please try again. Your shopping bag is saved.</p>
    <button onClick={reset} className="bg-brand px-8 py-3 text-white">Try again</button>
  </div>
}
