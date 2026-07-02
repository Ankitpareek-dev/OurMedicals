import React, { useState, useEffect } from 'react'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth
} from '@clerk/clerk-react'

// Mock promotions data for e-commerce banners
const PROMOTIONS = [
  {
    id: 1,
    title: "Monsoon Stock Up Sale",
    badge: "Limited Time",
    description: "Get an extra 10% off on all critical care formulations. Use code BULKMD10 at checkout.",
    bgClass: "from-brand-green/20 via-emerald-600/10 to-transparent",
    image: "https://www.leeford.in/images/ProductImages/medium/6904885b822d6-1761904731.png",
    cta: "Shop Critical Care"
  },
  {
    id: 2,
    title: "Premium Ortho Support Deals",
    badge: "Best Seller",
    description: "Save up to 15% on bulk case packs of Abdominal Belts, Lumbar Supports, and Knee Braces.",
    bgClass: "from-emerald-500/20 via-teal-600/10 to-transparent",
    image: "https://www.leeford.in/images/ProductImages/medium/690adbdb558cb-1762319323.png",
    cta: "Browse Ortho Gear"
  }
]

// E-commerce Categories
const CATEGORIES = [
  { name: "All Products", count: 1958, filter: "" },
  { name: "Tablets", count: 840, filter: "TABLETS" },
  { name: "Capsules", count: 520, filter: "CAPSULES" },
  { name: "Topicals", count: 210, filter: "TOPICALS" },
  { name: "Ortho Support", count: 180, filter: "ORTHO SUPPORT" },
  { name: "Surgicals", count: 208, filter: "SURGICALS" }
]

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
  const [selectedCategory, setSelectedCategory] = useState("All Products")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeBanner, setActiveBanner] = useState(0)
  const [cartCount, setCartCount] = useState(0)

  const { getToken, isSignedIn } = useAuth()
  const pageSize = 12

  // Sync theme
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Fetch medicines combining search + category filters (mapped to search backend query)
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true)
      setError('')
      try {
        let url = `http://127.0.0.1:8000/api/medicines?page=${page}&page_size=${pageSize}`
        
        // Assemble search query combining search text and category filter
        let combinedSearch = searchQuery
        const catObj = CATEGORIES.find(c => c.name === selectedCategory)
        if (catObj && catObj.filter) {
          combinedSearch = combinedSearch ? `${combinedSearch} ${catObj.filter}` : catObj.filter
        }

        if (combinedSearch) {
          url += `&search=${encodeURIComponent(combinedSearch)}`
        }

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
        setError('Failed to load catalog from backend. Make sure the FastAPI server is running on port 8000.')
      } finally {
        setLoading(false)
      }
    }

    fetchMedicines()
  }, [page, searchQuery, selectedCategory, isSignedIn])

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

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName)
    setPage(1)
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleAddToCart = () => {
    setCartCount(prev => prev + 1)
  }

  // Automatic Banner Carousel Switcher
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % PROMOTIONS.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

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
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-brand-green flex items-center justify-center font-bold text-white shadow-lg shadow-brand-green/30">
              M
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-neutral-950 to-neutral-600 dark:from-white dark:via-neutral-200 dark:to-neutral-500 bg-clip-text text-transparent">
              Our Medicals
            </span>
            <span className="hidden sm:inline-block rounded-full bg-neutral-100 dark:bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Wholesale Store
            </span>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-850 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer"
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

            {/* Shopping Cart Indicator */}
            <div className="relative cursor-pointer p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-brand-green text-[10px] font-bold text-white flex items-center justify-center border border-white dark:border-neutral-950 animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>

            {/* Auth status buttons */}
            <div className="flex items-center gap-2 border-l border-neutral-200 dark:border-neutral-800 pl-4">
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
                <span className="hidden md:inline-block text-[10px] uppercase tracking-wider font-extrabold text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-1 rounded-lg mr-2">
                  Verified Pharmacist
                </span>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Promos / Deals Slider (E-commerce Banner) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className={`relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-r ${PROMOTIONS[activeBanner].bgClass} p-8 sm:p-10 transition-all duration-500`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Promo Info */}
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex items-center rounded-full bg-brand-green/10 px-3 py-1 text-xs font-bold text-brand-green border border-brand-green/20">
                {PROMOTIONS[activeBanner].badge}
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {PROMOTIONS[activeBanner].title}
              </h2>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm sm:text-base">
                {PROMOTIONS[activeBanner].description}
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <button 
                  onClick={() => handleCategorySelect(PROMOTIONS[activeBanner].id === 1 ? "Capsules" : "Ortho Support")}
                  className="cursor-pointer rounded-xl bg-brand-green px-5 py-3 text-xs font-bold text-white shadow-lg shadow-brand-green/20 hover:bg-brand-green-hover transition-colors"
                >
                  {PROMOTIONS[activeBanner].cta}
                </button>
                <button className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/20 backdrop-blur-xs px-5 py-3 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                  View Catalog Sheet
                </button>
              </div>
            </div>

            {/* Promo Product Image (E-commerce Product Showcase) */}
            <div className="hidden md:flex justify-center relative">
              <div className="absolute inset-0 bg-brand-green/10 dark:bg-brand-green/5 blur-3xl rounded-full" />
              <img
                src={PROMOTIONS[activeBanner].image}
                alt="Promo formulation"
                className="h-56 w-auto object-contain transform hover:rotate-6 hover:scale-105 transition-all duration-300 relative z-10"
              />
            </div>
          </div>

          {/* Slider Indicators */}
          <div className="absolute bottom-4 left-8 flex gap-2">
            {PROMOTIONS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBanner(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeBanner === idx ? 'w-6 bg-brand-green' : 'w-2 bg-neutral-300 dark:bg-neutral-800'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Search & Category Selector Bar */}
        <div className="flex flex-col gap-6 bg-white dark:bg-neutral-900/10 border border-neutral-200 dark:border-neutral-900 p-6 rounded-2xl mb-12 shadow-xs transition-colors">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="w-full lg:max-w-md">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Wholesale Catalog</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Browse formulations, search active salts, and manage bulk purchases.</p>
            </div>
            
            {/* E-commerce Search Input */}
            <form onSubmit={handleSearchSubmit} className="w-full lg:max-w-lg flex gap-2">
              <div className="relative flex-grow flex items-center border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-1.5 rounded-xl focus-within:border-brand-green/50 transition">
                <svg className="w-5 h-5 text-neutral-400 ml-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search brand name, active composition, salt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="cursor-pointer rounded-xl bg-brand-green px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-green-hover transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Categories Quick Filter tabs */}
          <div className="border-t border-neutral-200 dark:border-neutral-900/60 pt-5 mt-2">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-3">Categories</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-semibold border transition ${
                    selectedCategory === cat.name
                      ? 'bg-brand-green border-brand-green text-white shadow-md shadow-brand-green/10'
                      : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Catalog Items Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-900">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {selectedCategory} <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400 ml-1">({loading ? '...' : total} results)</span>
          </h2>
          {searchQuery && (
            <div className="flex items-center gap-1.5 bg-brand-green/10 border border-brand-green/20 px-2.5 py-1 rounded-lg text-xs text-brand-green">
              Keyword: "{searchQuery}"
              <button onClick={handleClearSearch} className="font-bold hover:text-neutral-950 dark:hover:text-white ml-1 cursor-pointer">
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center max-w-xl mx-auto my-12">
            <p className="text-red-600 dark:text-red-450 font-medium">{error}</p>
            <button
              onClick={() => setPage(page)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600/20 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-650/30 transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">Syncing wholesale pricing...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/20 p-16 text-center max-w-md mx-auto my-12 shadow-xs">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No formulations in category</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              We couldn't find any products in "{selectedCategory}" matching your search settings.
            </p>
            <button
              onClick={handleClearSearch}
              className="mt-6 rounded-xl bg-neutral-100 dark:bg-neutral-850 px-4 py-2.5 text-xs font-semibold text-neutral-800 dark:text-white hover:bg-neutral-205 dark:hover:bg-neutral-800 transition"
            >
              Reset Search filters
            </button>
          </div>
        ) : (
          <>
            {/* Grid Catalog */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {medicines.map((med) => (
                <article
                  key={med.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/20 p-4 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-800 transition-all duration-300"
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
                    <button
                      onClick={handleAddToCart}
                      className="mt-4 w-full cursor-pointer rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-850 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 py-2.5 text-xs font-bold dark:text-neutral-300 dark:hover:bg-brand-green dark:hover:text-white dark:hover:border-brand-green transition-all duration-200"
                    >
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
