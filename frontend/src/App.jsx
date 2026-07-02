import React, { useState, useEffect } from 'react'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth
} from '@clerk/clerk-react'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Mock promotions data
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
  
  // Dedicated Medicine Detail View State
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loadingRelated, setLoadingRelated] = useState(false)

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

  // Fetch medicines catalog list
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true)
      setError('')
      try {
        let url = `http://127.0.0.1:8000/api/medicines?page=${page}&page_size=${pageSize}`
        
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

  // Fetch related products when a medicine is selected
  useEffect(() => {
    if (!selectedMedicine) return
    const fetchRelated = async () => {
      setLoadingRelated(true)
      try {
        // Query database for medicines sharing the same formulation category
        const url = `http://127.0.0.1:8000/api/medicines?page=1&page_size=4&search=${encodeURIComponent(selectedMedicine.formulation)}`
        const token = isSignedIn ? await getToken() : null
        
        const response = await fetch(url, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : 'Bearer mock-token-for-local-dev'
          }
        })

        if (response.ok) {
          const data = await response.json()
          // Exclude currently viewed item from related list
          const filtered = (data.data || []).filter(item => item.id !== selectedMedicine.id)
          setRelatedProducts(filtered.slice(0, 3))
        }
      } catch (err) {
        console.error('Failed to load related products:', err)
      } finally {
        setLoadingRelated(false)
      }
    }

    fetchRelated()
  }, [selectedMedicine, isSignedIn])

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
    setSelectedMedicine(null) // Return to catalog view
    setPage(1)
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleAddToCart = (e, count = 1) => {
    e?.stopPropagation()
    setCartCount(prev => prev + count)
  }

  const handleOpenMedicineDetails = (med) => {
    setSelectedMedicine(med)
    setOrderQuantity(med.min_order_quantity || 10)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToCatalog = () => {
    setSelectedMedicine(null)
  }

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
          {/* Logo / Catalog Reset Trigger */}
          <div onClick={handleBackToCatalog} className="flex items-center gap-3 cursor-pointer">
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
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl h-10 w-10 border-neutral-200 dark:border-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828 0l-.707-.707m12.02-12.02l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </Button>

            {/* Shopping Cart Indicator */}
            <div className="relative cursor-pointer p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
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
                  <Button variant="ghost" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer font-semibold text-sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="cursor-pointer rounded-xl bg-brand-green hover:bg-brand-green-hover text-white shadow-lg shadow-brand-green/20 font-semibold text-sm">
                    Register
                  </Button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <span className="hidden md:inline-block text-[10px] uppercase tracking-wider font-extrabold text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-1.5 rounded-lg mr-2">
                  Verified Pharmacist
                </span>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Conditional Page Rendering */}
      {!selectedMedicine ? (
        /* ================= CATALOGUE PAGE VIEW ================= */
        <>
          {/* Promos / Deals Slider */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className={`relative overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-r ${PROMOTIONS[activeBanner].bgClass} p-8 sm:p-10 transition-all duration-500`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Promo Info */}
                <div className="relative z-10 max-w-lg">
                  <Badge className="bg-brand-green/20 text-brand-green hover:bg-brand-green/20 border border-brand-green/20 px-3 py-1 font-bold text-xs uppercase tracking-wider">
                    {PROMOTIONS[activeBanner].badge}
                  </Badge>
                  <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                    {PROMOTIONS[activeBanner].title}
                  </h2>
                  <p className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm sm:text-base">
                    {PROMOTIONS[activeBanner].description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <Button 
                      onClick={() => handleCategorySelect(PROMOTIONS[activeBanner].id === 1 ? "Capsules" : "Ortho Support")}
                      className="cursor-pointer rounded-xl bg-brand-green text-white hover:bg-brand-green-hover font-bold text-xs px-5 py-6 shadow-lg shadow-brand-green/20"
                    >
                      {PROMOTIONS[activeBanner].cta}
                    </Button>
                    <Button variant="outline" className="rounded-xl border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/20 backdrop-blur-xs font-bold text-xs px-5 py-6">
                      View Catalog Sheet
                    </Button>
                  </div>
                </div>

                {/* Promo Product Image */}
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

          {/* Catalog Listing */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            {/* Search & Category Selector Bar */}
            <div className="flex flex-col gap-6 bg-white dark:bg-neutral-900/10 border border-neutral-200 dark:border-neutral-900 p-6 rounded-2xl mb-12 shadow-xs transition-colors">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="w-full lg:max-w-md">
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Wholesale Catalog</h1>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Browse formulations, search active salts, and manage bulk purchases.</p>
                </div>
                
                {/* Search form */}
                <form onSubmit={handleSearchSubmit} className="w-full lg:max-w-lg flex gap-2">
                  <div className="relative flex-grow flex items-center border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-1 rounded-xl focus-within:border-brand-green/50 transition">
                    <svg className="w-5 h-5 text-neutral-400 ml-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <Input
                      type="text"
                      placeholder="Search brand name, active composition, salt..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-sm text-neutral-800 dark:text-neutral-200"
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
                  <Button
                    type="submit"
                    className="cursor-pointer rounded-xl bg-brand-green text-white hover:bg-brand-green-hover font-bold text-xs px-6 py-5.5"
                  >
                    Search
                  </Button>
                </form>
              </div>

              {/* Categories tabs */}
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
                <Badge className="bg-brand-green/15 text-brand-green hover:bg-brand-green/20 border border-brand-green/20 px-2 py-1 flex items-center gap-1">
                  Keyword: "{searchQuery}"
                  <button onClick={handleClearSearch} className="font-bold hover:text-brand-green ml-1 cursor-pointer">
                    &times;
                  </button>
                </Badge>
              )}
            </div>

            {/* Error state */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center max-w-xl mx-auto my-12">
                <p className="text-red-600 dark:text-red-450 font-medium">{error}</p>
                <Button
                  onClick={() => setPage(page)}
                  variant="outline"
                  className="mt-4 border-red-500/30 text-red-500 hover:bg-red-500/10"
                >
                  Retry Connection
                </Button>
              </div>
            )}

            {/* Catalog Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
                <p className="text-xs text-neutral-505 mt-4">Syncing wholesale pricing...</p>
              </div>
            ) : medicines.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/20 p-16 text-center max-w-md mx-auto my-12 shadow-xs">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No formulations in category</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  We couldn't find any products in "{selectedCategory}" matching your search settings.
                </p>
                <Button
                  onClick={handleClearSearch}
                  variant="secondary"
                  className="mt-6 rounded-xl"
                >
                  Reset Search filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {medicines.map((med) => (
                    <Card
                      key={med.id}
                      onClick={() => handleOpenMedicineDetails(med)}
                      className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/20 p-4 hover:shadow-lg dark:hover:bg-neutral-900/40 hover:border-neutral-350 dark:hover:border-neutral-800 transition-all duration-300 cursor-pointer"
                    >
                      <CardHeader className="p-0">
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
                          <Badge className="absolute top-2 right-2 rounded-lg bg-white/90 dark:bg-neutral-950/80 px-2 py-0.5 text-[9px] font-extrabold text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800/80 uppercase tracking-wider backdrop-blur-xs shadow-xs hover:bg-white/90 dark:hover:bg-neutral-950/80">
                            {med.formulation}
                          </Badge>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-base text-neutral-900 dark:text-white group-hover:text-brand-green transition-colors duration-200 line-clamp-1">
                            {med.name}
                          </h3>
                        </div>
                        <div className="mt-1 text-xs font-semibold text-brand-green tracking-wider line-clamp-1">
                          {med.salt_name}
                        </div>
                      </CardHeader>

                      <CardContent className="p-0 mt-3">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 min-h-[2rem]">
                          {med.composition}
                        </p>
                        <div className="mt-4 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[10px] text-amber-600 dark:text-amber-500 font-semibold uppercase tracking-wide">
                            {med.status}
                          </span>
                        </div>
                      </CardContent>

                      <CardFooter className="p-0 flex flex-col mt-5">
                        <div className="w-full pt-4 border-t border-neutral-100 dark:border-neutral-900/80 flex items-center justify-between">
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

                        <Button
                          onClick={(e) => handleAddToCart(e, 1)}
                          className="mt-4 w-full cursor-pointer rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-850 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 py-2 text-xs font-bold dark:text-neutral-300 dark:hover:bg-brand-green dark:hover:text-white dark:hover:border-brand-green transition-all duration-200 shadow-none"
                        >
                          Add to wholesale order
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <footer className="mt-16 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-900 pt-6">
                    <Button
                      disabled={page === 1}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      variant="outline"
                      className="rounded-xl border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-950 px-4 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 cursor-pointer"
                    >
                      Previous
                    </Button>

                    <div className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                      <span>Page</span>
                      <span className="font-semibold text-neutral-800 dark:text-white">{page}</span>
                      <span>of</span>
                      <span className="font-semibold text-neutral-800 dark:text-white">{pages}</span>
                    </div>

                    <Button
                      disabled={page === pages}
                      onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                      variant="outline"
                      className="rounded-xl border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-950 px-4 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 cursor-pointer"
                    >
                      Next
                    </Button>
                  </footer>
                )}
              </>
            )}
          </main>
        </>
      ) : (
        /* ================= MEDICINE DEDICATED DETAIL PAGE VIEW ================= */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          
          {/* Breadcrumb Header navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-900">
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span onClick={handleBackToCatalog} className="hover:text-brand-green cursor-pointer transition">Catalog</span>
              <span>/</span>
              <span onClick={() => handleCategorySelect(selectedMedicine.formulation)} className="hover:text-brand-green cursor-pointer capitalize transition">
                {selectedMedicine.formulation.toLowerCase()}
              </span>
              <span>/</span>
              <span className="text-neutral-800 dark:text-white font-bold line-clamp-1">{selectedMedicine.name}</span>
            </div>
            
            <Button
              variant="outline"
              onClick={handleBackToCatalog}
              className="rounded-xl border-neutral-250 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer self-start sm:self-auto text-xs flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Catalog
            </Button>
          </div>

          {/* Product layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Media Showcase & Wholesale Specs (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Product Card Image */}
              <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-6 flex items-center justify-center overflow-hidden h-[360px] relative">
                {selectedMedicine.image_url ? (
                  <img
                    src={selectedMedicine.image_url}
                    alt={selectedMedicine.name}
                    className="max-h-full max-w-full object-contain transform hover:scale-[1.03] transition-all duration-300"
                  />
                ) : (
                  <div className="text-neutral-400 dark:text-neutral-600 text-sm font-mono">No Image Available</div>
                )}
                
                {/* Floating tags */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge className="bg-brand-green/20 text-brand-green border border-brand-green/25 font-bold uppercase text-[9px] hover:bg-brand-green/20">
                    {selectedMedicine.formulation}
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 dark:bg-neutral-950/80 border-amber-500/30 text-amber-600 dark:text-amber-500 font-bold uppercase text-[9px]">
                    {selectedMedicine.status}
                  </Badge>
                </div>
              </Card>

              {/* Wholesale Pricing Panel */}
              <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-6">
                <div className="flex items-end justify-between border-b border-neutral-200 dark:border-neutral-900/80 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">Wholesale Price</span>
                    <span className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1 block">
                      ${selectedMedicine.price.toFixed(2)}
                      <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500 ml-1">/ unit</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider block">Availability</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {selectedMedicine.stock} units in stock
                    </span>
                  </div>
                </div>

                {/* Bulk order quantity controls */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-900">
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 pl-2">Quantity</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-900"
                        onClick={() => setOrderQuantity(prev => Math.max(selectedMedicine.min_order_quantity || 10, prev - 10))}
                      >
                        -
                      </Button>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white w-12 text-center">{orderQuantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-900"
                        onClick={() => setOrderQuantity(prev => Math.min(selectedMedicine.stock || 9999, prev + 10))}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500 italic pl-1 flex items-center justify-between">
                    <span>* Minimum Order Quantity: {selectedMedicine.min_order_quantity || 10} units</span>
                    <span>Total: ${(selectedMedicine.price * orderQuantity).toFixed(2)}</span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button
                      onClick={(e) => handleAddToCart(e, orderQuantity)}
                      className="cursor-pointer rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs py-6 flex-grow shadow-lg shadow-brand-green/20"
                    >
                      Add to wholesale order
                    </Button>
                    <Button 
                      variant="outline"
                      className="rounded-xl border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 font-bold text-xs py-6"
                    >
                      Request Quote
                    </Button>
                  </div>
                </div>
              </Card>

            </div>

            {/* RIGHT COLUMN: Medical Profiles & Monographs (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Product Name Header */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{selectedMedicine.name}</h1>
                <p className="text-sm font-bold text-brand-green uppercase tracking-wider mt-2">{selectedMedicine.salt_name}</p>
              </div>

              {/* Formulation profile */}
              <div className="bg-white dark:bg-neutral-900/10 border border-neutral-200 dark:border-neutral-900 rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-neutral-950 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2 mb-3">
                    Active Composition
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-100/50 dark:bg-neutral-950/40 p-4 rounded-xl border border-neutral-200 dark:border-neutral-900">
                    {selectedMedicine.composition}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-950 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2 mb-3">
                    Product Monograph / Description
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {selectedMedicine.description || "Detailed clinical description is currently undergoing revision. Please contact our laboratory support desk for specific certificate of analysis (COA) records."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Side Effects profile */}
                  <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl">
                    <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      Side Effects profile
                    </h4>
                    <p className="text-xs text-red-500/80 dark:text-red-400/80 leading-relaxed">
                      {selectedMedicine.side_effects || "No adverse events reported for the general formulation in compliance trials."}
                    </p>
                  </div>

                  {/* Dosage monograph */}
                  <div className="bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-5 rounded-2xl">
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-white uppercase tracking-wider mb-2">
                      Dosage & Administration
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {selectedMedicine.dosage || "Standardized formulation. Administer in clinical environments strictly under medical supervision."}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-950 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2 mb-3">
                    Regulatory Compliance & Batch Details
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="bg-neutral-100/50 dark:bg-neutral-950/20 p-3 rounded-lg text-center">
                      <span className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-semibold">Origin</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200 block mt-1">Batch Certified</span>
                    </div>
                    <div className="bg-neutral-100/50 dark:bg-neutral-950/20 p-3 rounded-lg text-center">
                      <span className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-semibold">Storage</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200 block mt-1">Below 25°C</span>
                    </div>
                    <div className="bg-neutral-100/50 dark:bg-neutral-950/20 p-3 rounded-lg text-center">
                      <span className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-semibold">Standard</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200 block mt-1">GMP Compliant</span>
                    </div>
                    <div className="bg-neutral-100/50 dark:bg-neutral-950/20 p-3 rounded-lg text-center">
                      <span className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-semibold">Scheduler</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200 block mt-1">Schedule H1</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Related products recommendation layer */}
          <section className="mt-20 border-t border-neutral-200 dark:border-neutral-900 pt-12">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-8">Related Formulations in Category</h3>
            
            {loadingRelated ? (
              <div className="flex items-center gap-2 justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-green/20 border-t-brand-green" />
                <span className="text-xs text-neutral-500">Finding related stocks...</span>
              </div>
            ) : relatedProducts.length === 0 ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-600">No other formulations found in this category.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((relatedMed) => (
                  <Card
                    key={relatedMed.id}
                    onClick={() => handleOpenMedicineDetails(relatedMed)}
                    className="group relative flex flex-col justify-between rounded-2xl border border-neutral-250 dark:border-neutral-900 bg-white/40 dark:bg-neutral-900/10 p-4 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-800 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex gap-4">
                      {/* Image Thumbnail */}
                      <div className="h-20 w-20 shrink-0 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 flex items-center justify-center p-2 overflow-hidden">
                        {relatedMed.image_url ? (
                          <img
                            src={relatedMed.image_url}
                            alt={relatedMed.name}
                            className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-[9px] text-neutral-500 font-mono">No Image</div>
                        )}
                      </div>
                      
                      {/* Specs */}
                      <div className="flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-brand-green transition-colors line-clamp-1">
                            {relatedMed.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-brand-green tracking-wide block mt-0.5 uppercase line-clamp-1">
                            {relatedMed.salt_name}
                          </span>
                        </div>
                        <div className="text-sm font-extrabold text-neutral-900 dark:text-white">
                          ${relatedMed.price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900/60 flex items-center justify-between text-[10px] text-neutral-500">
                      <span>MOQ: {relatedMed.min_order_quantity || 10}</span>
                      <span className="font-bold text-emerald-500">{relatedMed.stock} in stock</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

        </main>
      )}
    </div>
  )
}
