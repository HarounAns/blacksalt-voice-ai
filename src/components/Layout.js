'use client'

export default function Layout({ children, title, onMenuClick }) {
  return (
    <div className="grid grid-rows-[64px_1fr_20px] min-h-screen font-[family-name:var(--font-geist-sans)]">
      <header className="flex items-center justify-between px-4 border-b border-black/[.08] dark:border-white/[.145]">
        <h1 className="text-xl font-bold">{title}</h1>
        <button onClick={onMenuClick} className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      <main className="p-8">
        {children}
      </main>

      <footer className="flex gap-6 flex-wrap items-center justify-center text-sm text-gray-500 p-4">
        <p>BlackSalt Voice AI Restaurant Admin Dashboard</p>
      </footer>
    </div>
  );
} 