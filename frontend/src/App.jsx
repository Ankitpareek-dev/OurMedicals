import React, { useState, useEffect } from 'react'

export default function App() {
  const [medicines, setMedicines] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('') // Triggers fetch on submit
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const pageSize = 12

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true)
      setError('')
      try {
        // Build API URL
        let url = `http://127.0.0.1:8000/api/medicines?page=${page}&page_size=${pageSize}`
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`
        }

        // Send fetch request with mock Auth token to satisfy backend middleware
        const response = await fetch(url, {
          headers: {
            'Authorization': 'Bearer mock-token-for-local-dev'
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
  }, [page, searchQuery])

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    setSearchQuery(searchTerm)
  }

  // Handle search reset
  const handleClearSearch = () => {
    setSearchTerm('')
    setSearchQuery('')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute top-1/3 right-10 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              M
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
              Our Medicals
            </span>
            <span className="hidden sm:inline-block rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              Wholesale
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-200">
              Help
            </button>
            <button className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              Client Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-400 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Secure B2B Medical Distribution
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Next-Generation{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            Medical Wholesale
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto">
          Access high-quality pharmaceutical formulations, active chemical salts, and prescription drugs. Verified procurement with zero hassle.
        </p>

        {/* Global Catalog Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-10 max-w-xl mx-auto">
          <div className="relative flex items-center p-1.5 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl shadow-2xl focus-within:border-indigo-500/50 transition-all duration-200">
            <input
              type="text"
              placeholder="Search by medicine name, salt formulation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent px-4 py-3 text-neutral-200 placeholder-neutral-500 outline-none text-base"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-2 text-neutral-400 hover:text-white text-sm"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </header>

      {/* Medicines Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-900 pb-5 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Product Catalog</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Showing {loading ? '...' : medicines.length} of {total} available formulations
            </p>
          </div>
          {searchQuery && (
            <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-sm text-indigo-300">
              Filtered by "{searchQuery}"
              <button
                onClick={handleClearSearch}
                className="font-bold hover:text-white ml-1 cursor-pointer"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Error handling */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center max-w-xl mx-auto my-12">
            <p className="text-red-400 font-medium">{error}</p>
            <button
              onClick={() => setPage(page)} // Retries fetch
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600/20 px-4 py-2 text-xs font-semibold text-red-400 border border-red-500/30 hover:bg-red-600/30 transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
            <p className="text-sm text-neutral-400 mt-4">Loading wholesale catalog...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/20 p-16 text-center max-w-md mx-auto my-12">
            <h3 className="text-lg font-bold text-white">No medicines found</h3>
            <p className="text-sm text-neutral-400 mt-2">
              We couldn't find any formulation matching "{searchQuery}". Try searching for another keyword.
            </p>
            <button
              onClick={handleClearSearch}
              className="mt-6 rounded-xl bg-neutral-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 transition"
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
                  className="group relative flex flex-col justify-between rounded-2xl border border-neutral-900 bg-neutral-900/30 p-5 hover:bg-neutral-900/50 hover:border-neutral-800 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/[0.02]"
                >
                  <div>
                    {/* Header: Name and Status badge */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors duration-200">
                        {med.name}
                      </h3>
                      <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-neutral-400 border border-neutral-800 uppercase tracking-wider shrink-0">
                        {med.formulation}
                      </span>
                    </div>

                    {/* Active Salt Info */}
                    <div className="mt-2 text-xs font-semibold text-indigo-400 tracking-wider">
                      {med.salt_name}
                    </div>

                    {/* Composition details */}
                    <p className="mt-3 text-xs text-neutral-400 line-clamp-2">
                      {med.composition}
                    </p>

                    {/* Expiry / Status Warnings */}
                    <div className="mt-4 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] text-amber-500 font-medium uppercase tracking-wide">
                        {med.status}
                      </span>
                    </div>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="mt-6 pt-4 border-t border-neutral-900/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                        Wholesale Price
                      </div>
                      <div className="text-xl font-bold text-white mt-0.5">
                        ${med.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                        Stock
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          med.stock > 100 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {med.stock} units
                      </span>
                    </div>
                  </div>

                  {/* Add to order quick button */}
                  <button className="mt-4 w-full cursor-pointer rounded-xl bg-neutral-900 border border-neutral-800 py-2.5 text-xs font-bold text-neutral-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200">
                    Add to wholesale order
                  </button>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <footer className="mt-16 flex items-center justify-between border-t border-neutral-900 pt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="cursor-pointer flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-400 hover:bg-neutral-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>

                <div className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-400">
                  <span>Page</span>
                  <span className="font-semibold text-white">{page}</span>
                  <span>of</span>
                  <span className="font-semibold text-white">{pages}</span>
                  <span className="text-xs text-neutral-600 ml-2">({total} total items)</span>
                </div>

                <button
                  disabled={page === pages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                  className="cursor-pointer flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-400 hover:bg-neutral-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
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
