import Link from "next/link"

export function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-gray-900">JobAgent</Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
        <p className="text-xs text-gray-400 mt-2">Last updated: {updated}</p>
        <div className="mt-8 space-y-8">{children}</div>
      </main>

      <footer className="border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap gap-x-4 gap-y-2 items-center justify-between text-xs text-gray-400">
          <span>© {new Date().getFullYear()} JobAgent</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
            <Link href="/pricing" className="hover:text-gray-700 transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h2 className="text-sm font-semibold text-gray-900">{heading}</h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2.5">{children}</div>
    </section>
  )
}
