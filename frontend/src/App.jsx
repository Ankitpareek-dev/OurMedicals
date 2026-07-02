import React, { useState, useEffect } from 'react'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth
} from '@clerk/clerk-react'

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) return savedTheme
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      return systemPreference
    }
    return 'dark'
  })

  const [medicines, setMedicines] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { getToken, isSignedIn } = useAuth()
  const pageSize = 12

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true)
      setError('')
      try {
        let url = `http://127.0.0.1:8000/api/medicines?page=${page}&page_size=${pageSize}`
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`
        }

        // Fetch Clerk JWT token if user is signed in
        const token = isSignedIn ? await getToken() : null

        const response = await fetch(url, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : 'Bearer mock-token-for-local-dev'
          }
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setMedicines(data.data || [])
        setTotal(data.total || 0)
        setPages(data.pages || 1)
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Failed to load medicines from backend. Make sure the FastAPI server is running on port 8000.')
      } finally {
        setLoading(false)
      }
    }

    fetchMedicines()
  }, [page, searchQuery, isSignedIn])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    setSearchQuery(searchTerm)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setSearchQuery('')
    setPage(1)
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 font-sans selection:bg-brand-green selection:text-white transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-green/5 dark:bg-brand-green/5 blur-3xl" />
        <div className="absolute top-1/3 right-10 h-[600px] w-[600px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand-green flex items-center justify-center font-bold text-white shadow-lg shadow-brand-green/30">
              M
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-neutral-950 to-neutral-600 dark:from-white dark:via-neutral-200 dark:to-neutral-500 bg-clip-text text-transparent">
              Our Medicals
            </span>
            <span className="hidden sm:inline-block rounded-full bg-neutral-100 dark:bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Wholesale
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-850 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer"
              aria-label="Toggle light/dark mode"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.02-12.02l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Authentication Controls */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="cursor-pointer text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 px-2">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="cursor-pointer rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-green/20 hover:bg-brand-green-hover transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  Register
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <span className="hidden md:inline-block text-xs font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                Verified Buyer
              </span>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-green/30 bg-brand-green/10 px-3.5 py-1 text-xs font-medium text-brand-green mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" />
          Secure B2B Medical Distribution
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white max-w-3xl mx-auto leading-tight transition-colors">
          Next-Generation{' '}
          <span className="bg-gradient-to-r from-brand-green to-emerald-600 dark:from-brand-green dark:to-emerald-400 bg-clip-text text-transparent">
            Medical Wholesale
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Access high-quality pharmaceutical formulations, active chemical salts, and prescription drugs. Verified procurement with zero hassle.
        </p>

        {/* Global Catalog Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-10 max-w-xl mx-auto">
          <div className="relative flex items-center p-1.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/50 backdrop-blur-xl shadow-2xl focus-within:border-brand-green/50 focus-within:ring-2 focus-within:ring-brand-green/10 transition-all duration-200">
            <input
              type="text"
              placeholder="Search by medicine name, salt formulation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent px-4 py-3 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none text-base"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-sm cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-brand-green px-6 py-3 text-sm font-semibold text-white hover:bg-brand-green-hover transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </header>

      {/* Medicines Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-900 pb-5 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Product Catalog</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Showing {loading ? '...' : medicines.length} of {total} available formulations
            </p>
          </div>
          {searchQuery && (
            <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-brand-green/10 border border-brand-green/20 px-3 py-1.5 rounded-lg text-sm text-brand-green">
              Filtered by "{searchQuery}"
              <button
                onClick={handleClearSearch}
                className="font-bold hover:text-neutral-950 dark:hover:text-white ml-1 cursor-pointer"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Error handling */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center max-w-xl mx-auto my-12">
            <p className="text-red-600 dark:text-red-450 font-medium">{error}</p>
            <button
              onClick={() => setPage(page)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600/20 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-655/30 transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">Loading wholesale catalog...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/20 p-16 text-center max-w-md mx-auto my-12 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No medicines found</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              We couldn't find any formulation matching "{searchQuery}". Try searching for another keyword.
            </p>
            <button
              onClick={handleClearSearch}
              className="mt-6 rounded-xl bg-neutral-100 dark:bg-neutral-850 px-4 py-2.5 text-sm font-semibold text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            {/* Grid Catalog */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {medicines.map((med) => (
                <article
                  key={med.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/20 p-4 hover:shadow-lg dark:hover:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-800 transition-all duration-300"
                >
                  <div>
                    {/* Visual Product Image Container */}
                    <div className="relative w-full h-44 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 flex items-center justify-center overflow-hidden mb-4 p-4 transition-colors">
                      {med.image_url ? (
                        <img
                          src={med.image_url}
                          alt={med.name}
                          loading="lazy"
                          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/200x200/e5e5e5/171717?text=Medicine';
                          }}
                        />
                      ) : (
                        <div className="text-neutral-400 dark:text-neutral-600 text-xs font-mono">No Image</div>
                      )}
                      
                      {/* Floating Formulation Badge overlay */}
                      <span className="absolute top-2 right-2 rounded-lg bg-white/90 dark:bg-neutral-950/80 px-2 py-0.5 text-[9px] font-bold text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800/80 uppercase tracking-wider backdrop-blur-xs shadow-xs">
                        {med.formulation}
                      </span>
                    </div>

                    {/* Header: Name and Salt Info */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-neutral-900 dark:text-white group-hover:text-brand-green transition-colors duration-200 line-clamp-1">
                        {med.name}
                      </h3>
                    </div>

                    <div className="mt-1 text-xs font-semibold text-brand-green tracking-wider line-clamp-1">
                      {med.salt_name}
                    </div>

                    {/* Composition details */}
                    <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 min-h-[2rem]">
                      {med.composition}
                    </p>

                    {/* Expiry / Status Warnings */}
                    <div className="mt-4 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold uppercase tracking-wide">
                        {med.status}
                      </span>
                    </div>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div>
                    <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-900/80 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-wider">
                          Wholesale Price
                        </div>
                        <div className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                          ${med.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-wider">
                          Stock
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            med.stock > 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {med.stock} units
                        </span>
                      </div>
                    </div>

                    {/* Add to order quick button */}
                    <button className="mt-4 w-full cursor-pointer rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-850 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 py-2.5 text-xs font-bold dark:text-neutral-300 dark:hover:bg-brand-green dark:hover:text-white dark:hover:border-brand-green transition-all duration-200">
                      Add to wholesale order
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <footer className="mt-16 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-900 pt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="cursor-pointer flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>

                <div className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  <span>Page</span>
                  <span className="font-semibold text-neutral-800 dark:text-white">{page}</span>
                  <span>of</span>
                  <span className="font-semibold text-neutral-800 dark:text-white">{pages}</span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-600 ml-2">( {total} total items )</span>
                </div>

                <button
                  disabled={page === pages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                  className="cursor-pointer flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </footer>
            )}
          </>
        )}
      </main>
    </div>
  )
}
