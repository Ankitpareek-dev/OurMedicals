import React, { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate
} from 'react-router-dom'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
  useUser
} from '@clerk/clerk-react'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Helper to convert brand names to URL-safe slugs
const slugify = (text) => {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .trim()                         // Trim leading/trailing spaces
}

// Categories list
const CATEGORIES = [
  { name: "All Products", count: 1958, filter: "" },
  { name: "Tablets", count: 840, filter: "TABLETS" },
  { name: "Capsules", count: 520, filter: "CAPSULES" },
  { name: "Topicals", count: 210, filter: "TOPICALS" },
  { name: "Ortho Support", count: 180, filter: "ORTHO SUPPORT" },
  { name: "Surgicals", count: 208, filter: "SURGICALS" }
]

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

/* ================= HEADER COMPONENT ================= */
function Header({ theme, toggleTheme, cart }) {
  const { isSignedIn, user } = useUser()
  const isAdmin = isSignedIn && user?.publicMetadata?.role === 'admin'
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="h-8 w-8 rounded-lg bg-brand-green flex items-center justify-center font-bold text-white shadow-lg shadow-brand-green/30">
              M
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-neutral-950 to-neutral-600 dark:from-white dark:via-neutral-200 dark:to-neutral-500 bg-clip-text text-transparent">
              Our Medicals
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-4 border-l border-neutral-200 dark:border-neutral-900 pl-6 text-xs font-semibold">
            <Link to="/" className="text-neutral-500 dark:text-neutral-400 hover:text-brand-green transition-colors">
              Wholesale Store
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-neutral-505 hover:text-brand-green transition-colors">
                Admin Portal
              </Link>
            )}
          </div>
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

          {/* Shopping Cart Link */}
          <Link to="/cart" className="relative cursor-pointer p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-brand-green text-[10px] font-bold text-white flex items-center justify-center border border-white dark:border-neutral-950 animate-bounce">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Auth status buttons */}
          <div className="flex items-center gap-2 border-l border-neutral-200 dark:border-neutral-800 pl-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer font-semibold text-sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignUpButton mode="modal">
              <SignedOut>
                <Button className="cursor-pointer rounded-xl bg-brand-green hover:bg-brand-green-hover text-white shadow-lg shadow-brand-green/20 font-semibold text-sm">
                  Register
                </Button>
              </SignedOut>
            </SignUpButton>
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
  )
}

/* ================= CATALOG VIEW (HOMEPAGE) ================= */
function CatalogView({ onAddToCart, activeBanner, setActiveBanner, selectedCategory, setSelectedCategory }) {
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

  return (
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

      {/* Main Catalog listing */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Search & Category Selector Bar */}
        <div className="flex flex-col gap-6 bg-white dark:bg-neutral-900/10 border border-neutral-200 dark:border-neutral-900 p-6 rounded-2xl mb-12 shadow-xs transition-colors">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="w-full lg:max-w-md">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Wholesale Catalog</h1>
              <p className="text-xs text-neutral-505 dark:text-neutral-400 mt-1">Browse formulations, search active salts, and manage bulk purchases.</p>
            </div>
            
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
            {selectedCategory} <span className="text-xs font-normal text-neutral-505 ml-1">({loading ? '...' : total} results)</span>
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
            <p className="text-xs text-neutral-550 mt-4">Syncing wholesale pricing...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/20 p-16 text-center max-w-md mx-auto my-12 shadow-xs">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No formulations in category</h3>
            <p className="text-sm text-neutral-505 mt-2">
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
              {medicines.map((med) => {
                const categorySlug = slugify(med.formulation) || 'medicine'
                const nameSlug = slugify(med.name)
                
                return (
                  <Card 
                    key={med.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/20 p-4 hover:shadow-lg dark:hover:bg-neutral-900/40 hover:border-neutral-350 dark:hover:border-neutral-800 transition-all duration-300"
                  >
                    <Link to={`/${categorySlug}/${nameSlug}`} className="block">
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
                    </Link>

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
                        onClick={(e) => {
                          e.preventDefault();
                          onAddToCart(med, 1);
                        }}
                        className="mt-4 w-full cursor-pointer rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-850 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 py-2 text-xs font-bold dark:text-neutral-300 dark:hover:bg-brand-green dark:hover:text-white dark:hover:border-brand-green transition-all duration-200 shadow-none"
                      >
                        Add to wholesale order
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
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
  )
}

/* ================= MEDICINE DETAIL VIEW ================= */
function MedicineDetailView({ onAddToCart }) {
  const { category, slug } = useParams()
  const navigate = useNavigate()
  const { getToken, isSignedIn } = useAuth()
  
  const [medicine, setMedicine] = useState(null)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loadingRelated, setLoadingRelated] = useState(false)

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true)
      setError('')
      try {
        const searchQuery = slug.split('-').join(' ')
        const url = `http://127.0.0.1:8000/api/medicines?page=1&page_size=20&search=${encodeURIComponent(searchQuery)}`
        
        const token = isSignedIn ? await getToken() : null
        const response = await fetch(url, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : 'Bearer mock-token-for-local-dev'
          }
        })

        if (!response.ok) {
          throw new Error('API error fetching details')
        }

        const data = await response.json()
        const exactMatch = (data.data || []).find(item => slugify(item.name) === slug)
        
        if (exactMatch) {
          setMedicine(exactMatch)
          setOrderQuantity(exactMatch.min_order_quantity || 10)
        } else if (data.data && data.data.length > 0) {
          setMedicine(data.data[0])
          setOrderQuantity(data.data[0].min_order_quantity || 10)
        } else {
          setError('Medicine formulation not found in database.')
        }
      } catch (err) {
        console.error(err)
        setError('Failed to query database for this formulation.')
      } finally {
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [slug, isSignedIn])

  useEffect(() => {
    if (!medicine) return
    const fetchRelated = async () => {
      setLoadingRelated(true)
      try {
        const url = `http://127.0.0.1:8000/api/medicines?page=1&page_size=5&search=${encodeURIComponent(medicine.formulation)}`
        const token = isSignedIn ? await getToken() : null
        
        const response = await fetch(url, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : 'Bearer mock-token-for-local-dev'
          }
        })

        if (response.ok) {
          const data = await response.json()
          const filtered = (data.data || []).filter(item => item.id !== medicine.id)
          setRelatedProducts(filtered.slice(0, 3))
        }
      } catch (err) {
        console.error('Failed to load related formulations:', err)
      } finally {
        setLoadingRelated(false)
      }
    }

    fetchRelated()
  }, [medicine, isSignedIn])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 max-w-7xl mx-auto px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
        <p className="text-xs text-neutral-505 mt-4">Retrieving formulation record...</p>
      </div>
    )
  }

  if (error || !medicine) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 border border-neutral-200 dark:border-neutral-900 rounded-3xl text-center bg-white dark:bg-neutral-900/20 shadow-xs">
        <h2 className="text-xl font-bold text-red-500">{error || "Product Not Found"}</h2>
        <p className="text-sm text-neutral-550 mt-2">
          The requested medicine slug does not exist or has been removed from catalog listings.
        </p>
        <Button onClick={() => navigate('/')} className="mt-6 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white">
          Back to Catalog
        </Button>
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-900">
        <div className="flex items-center gap-2 text-xs text-neutral-550">
          <Link to="/" className="hover:text-brand-green transition">Catalog</Link>
          <span>/</span>
          <span className="capitalize">{category.replace(/-/g, ' ')}</span>
          <span>/</span>
          <span className="text-neutral-800 dark:text-white font-bold line-clamp-1">{medicine.name}</span>
        </div>
        
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="rounded-xl border-neutral-250 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer text-xs flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Catalog
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-6 flex items-center justify-center overflow-hidden h-[360px] relative">
            {medicine.image_url ? (
              <img
                src={medicine.image_url}
                alt={medicine.name}
                className="max-h-full max-w-full object-contain transform hover:scale-[1.03] transition-all duration-300"
              />
            ) : (
              <div className="text-neutral-400 dark:text-neutral-600 text-sm font-mono">No Image Available</div>
            )}
            
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge className="bg-brand-green/20 text-brand-green border border-brand-green/25 font-bold uppercase text-[9px] hover:bg-brand-green/20">
                {medicine.formulation}
              </Badge>
              <Badge variant="outline" className="bg-white/80 dark:bg-neutral-950/80 border-amber-500/30 text-amber-600 dark:text-amber-500 font-bold uppercase text-[9px]">
                {medicine.status}
              </Badge>
            </div>
          </Card>

          <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-6">
            <div className="flex items-end justify-between border-b border-neutral-200 dark:border-neutral-900/80 pb-4 mb-5">
              <div>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-505 font-bold uppercase tracking-wider block">Wholesale Price</span>
                <span className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-1 block">
                  ${medicine.price.toFixed(2)}
                  <span className="text-xs font-normal text-neutral-550 ml-1">/ unit</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 dark:text-neutral-505 font-bold uppercase tracking-wider block">Availability</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {medicine.stock} units in stock
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-900">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 pl-2">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-900"
                    onClick={() => setOrderQuantity(prev => Math.max(medicine.min_order_quantity || 10, prev - 10))}
                  >
                    -
                  </Button>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white w-12 text-center">{orderQuantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-900"
                    onClick={() => setOrderQuantity(prev => Math.min(medicine.stock || 9999, prev + 10))}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="text-[10px] text-neutral-400 dark:text-neutral-505 italic pl-1 flex items-center justify-between">
                <span>* Minimum Order Quantity: {medicine.min_order_quantity || 10} units</span>
                <span>Total: ${(medicine.price * orderQuantity).toFixed(2)}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button
                  onClick={() => onAddToCart(medicine, orderQuantity)}
                  className="cursor-pointer rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs py-6 flex-grow shadow-lg shadow-brand-green/20"
                >
                  Add to wholesale order
                </Button>
                <Button 
                  variant="outline"
                  className="rounded-xl border-neutral-300 dark:border-brand-green hover:bg-neutral-100 dark:hover:bg-neutral-900 font-bold text-xs py-6"
                >
                  Request Quote
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{medicine.name}</h1>
            <p className="text-sm font-bold text-brand-green uppercase tracking-wider mt-2">{medicine.salt_name}</p>
          </div>

          <div className="bg-white dark:bg-neutral-900/10 border border-neutral-200 dark:border-neutral-900 rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-955 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2 mb-3">
                Active Composition
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-100/50 dark:bg-neutral-950/40 p-4 rounded-xl border border-neutral-200 dark:border-neutral-900">
                {medicine.composition}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-neutral-955 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2 mb-3">
                Product Monograph / Description
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {medicine.description || "Detailed clinical description is currently undergoing revision. Please contact our laboratory support desk for specific certificate of analysis (COA) records."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-red-600 dark:text-red-450 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  Side Effects profile
                </h4>
                <p className="text-xs text-red-505 leading-relaxed">
                  {medicine.side_effects || "No adverse events reported for the general formulation in compliance trials."}
                </p>
              </div>

              <div className="bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-neutral-800 dark:text-white uppercase tracking-wider mb-2">
                  Dosage & Administration
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {medicine.dosage || "Standardized formulation. Administer in clinical environments strictly under medical supervision."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-neutral-955 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2 mb-3">
                Regulatory Compliance & Batch Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-neutral-100/50 dark:bg-neutral-950/20 p-3 rounded-lg text-center">
                  <span className="text-neutral-455 dark:text-neutral-500 text-[10px] uppercase font-semibold">Origin</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 block mt-1">Batch Certified</span>
                </div>
                <div className="bg-neutral-100/50 dark:bg-neutral-950/20 p-3 rounded-lg text-center">
                  <span className="text-neutral-455 dark:text-neutral-500 text-[10px] uppercase font-semibold">Storage</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 block mt-1">Below 25°C</span>
                </div>
                <div className="bg-neutral-100/50 dark:bg-neutral-950/20 p-3 rounded-lg text-center">
                  <span className="text-neutral-455 dark:text-neutral-500 text-[10px] uppercase font-semibold">Standard</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 block mt-1">GMP Compliant</span>
                </div>
                <div className="bg-neutral-100/50 dark:bg-neutral-950/20 p-3 rounded-lg text-center">
                  <span className="text-neutral-455 dark:text-neutral-500 text-[10px] uppercase font-semibold">Scheduler</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 block mt-1">Schedule H1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Related products */}
      <section className="mt-20 border-t border-neutral-200 dark:border-neutral-900 pt-12">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-8">Related Formulations in Category</h3>
        
        {loadingRelated ? (
          <div className="flex items-center gap-2 justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-green/20 border-t-brand-green" />
            <span className="text-xs text-neutral-555">Finding related stocks...</span>
          </div>
        ) : relatedProducts.length === 0 ? (
          <p className="text-xs text-neutral-555">No other formulations found in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relatedMed) => {
              const relatedCatSlug = slugify(relatedMed.formulation) || 'medicine'
              const relatedNameSlug = slugify(relatedMed.name)
              
              return (
                <Link
                  key={relatedMed.id}
                  to={`/${relatedCatSlug}/${relatedNameSlug}`}
                  className="block group"
                >
                  <Card className="h-full relative flex flex-col justify-between rounded-2xl border border-neutral-255 dark:border-neutral-900 bg-white/40 dark:bg-neutral-900/10 p-4 hover:shadow-md hover:border-neutral-350 dark:hover:border-neutral-800 transition-all duration-300 cursor-pointer">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 shrink-0 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 flex items-center justify-center p-2 overflow-hidden">
                        {relatedMed.image_url ? (
                          <img
                            src={relatedMed.image_url}
                            alt={relatedMed.name}
                            className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-[9px] text-neutral-555 font-mono">No Image</div>
                        )}
                      </div>
                      
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

                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900/60 flex items-center justify-between text-[10px] text-neutral-550">
                      <span>MOQ: {relatedMed.min_order_quantity || 10}</span>
                      <span className="font-bold text-emerald-500">{relatedMed.stock} in stock</span>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

/* ================= ADMIN VIEW PANEL (CRUD CAPABILITIES) ================= */
function AdminView() {
  const navigate = useNavigate()
  const { getToken, isSignedIn } = useAuth()
  const { isLoaded, user } = useUser()

  useEffect(() => {
    if (isLoaded) {
      const isAdmin = isSignedIn && user?.publicMetadata?.role === 'admin'
      if (!isAdmin) {
        navigate('/')
      }
    }
  }, [isLoaded, isSignedIn, user, navigate])

  if (!isLoaded || (isSignedIn && user?.publicMetadata?.role !== 'admin') || !isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-32 max-w-7xl mx-auto px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
        <p className="text-xs text-neutral-555 mt-4">Verifying admin credentials...</p>
      </div>
    )
  }
  
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [adminCategory, setAdminCategory] = useState("All Products")
  const [adminSearch, setAdminSearch] = useState("")
  const [adminSearchQuery, setAdminSearchQuery] = useState("")
  
  // Dashboard Metrics state
  const [metrics, setMetrics] = useState({
    totalCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    avgPrice: 0
  })

  // CRUD Form State
  const [isEditing, setIsEditing] = useState(false)
  const [formMedId, setFormMedId] = useState(null)
  const [formFields, setFormFields] = useState({
    name: '',
    salt_name: '',
    formulation: 'TABLETS',
    status: 'OTC PRODUCT',
    price: 9.99,
    stock: 100,
    min_order_quantity: 10,
    image_url: '',
    composition: '',
    description: '',
    side_effects: '',
    dosage: ''
  })

  // Fetch medicines for table filtered by category and search term
  const fetchAdminCatalog = async () => {
    setLoading(true)
    setError('')
    try {
      let url = `http://127.0.0.1:8000/api/medicines?page=1&page_size=100`
      
      let combinedSearch = adminSearchQuery
      const catObj = CATEGORIES.find(c => c.name === adminCategory)
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
        throw new Error('API error reading catalog')
      }

      const data = await response.json()
      const list = data.data || []
      setMedicines(list)
      
      // Calculate Metrics
      const total = data.total || list.length
      const lowStock = list.filter(item => item.stock > 0 && item.stock < 100).length
      const outOfStock = list.filter(item => item.stock <= 0).length
      const sumPrice = list.reduce((sum, item) => sum + item.price, 0)
      const avg = list.length > 0 ? (sumPrice / list.length) : 0

      setMetrics({
        totalCount: total,
        lowStockCount: lowStock,
        outOfStockCount: outOfStock,
        avgPrice: avg
      })
    } catch (err) {
      console.error(err)
      setError('Failed to sync admin catalog from backend API.')
    } finally {
      setLoading(false)
    }
  }

  // Refetch when category filter or search query updates
  useEffect(() => {
    fetchAdminCatalog()
  }, [isSignedIn, adminCategory, adminSearchQuery])

  const handleEditClick = (med) => {
    setIsEditing(true)
    setFormMedId(med.id)
    setFormFields({
      name: med.name,
      salt_name: med.salt_name,
      formulation: med.formulation || 'TABLETS',
      status: med.status || 'OTC PRODUCT',
      price: med.price,
      stock: med.stock,
      min_order_quantity: med.min_order_quantity || 10,
      image_url: med.image_url || '',
      composition: med.composition || '',
      description: med.description || '',
      side_effects: med.side_effects || '',
      dosage: med.dosage || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddNewClick = () => {
    setIsEditing(true)
    setFormMedId(null)
    setFormFields({
      name: '',
      salt_name: '',
      formulation: 'TABLETS',
      status: 'OTC PRODUCT',
      price: 9.99,
      stock: 100,
      min_order_quantity: 10,
      image_url: '',
      composition: '',
      description: '',
      side_effects: '',
      dosage: ''
    })
  }

  const handleCancelForm = () => {
    setIsEditing(false)
    setFormMedId(null)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormFields(prev => ({
      ...prev,
      [name]: (name === 'price' || name === 'stock' || name === 'min_order_quantity')
        ? Number(value)
        : value
    }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      const url = formMedId 
        ? `http://127.0.0.1:8000/api/medicines/${formMedId}`
        : `http://127.0.0.1:8000/api/medicines`
      
      const method = formMedId ? 'PUT' : 'POST'
      const token = isSignedIn ? await getToken() : null

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : 'Bearer mock-token-for-local-dev'
        },
        body: JSON.stringify(formFields)
      })

      if (!response.ok) {
        throw new Error('API save operation failed')
      }

      setSuccessMsg(formMedId ? 'Product record updated successfully!' : 'New product created successfully!')
      setIsEditing(false)
      setFormMedId(null)
      fetchAdminCatalog()
    } catch (err) {
      console.error(err)
      setError('Failed to submit product changes to database.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine? This action cannot be undone.")) return
    setError('')
    setSuccessMsg('')
    try {
      const url = `http://127.0.0.1:8000/api/medicines/${id}`
      const token = isSignedIn ? await getToken() : null

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : 'Bearer mock-token-for-local-dev'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete product record')
      }

      setSuccessMsg('Product deleted successfully from catalog database.')
      fetchAdminCatalog()
    } catch (err) {
      console.error(err)
      setError('Could not delete product record from backend.')
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-900">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Admin Management Portal</h1>
          <p className="text-xs text-neutral-500 mt-1.5">Create, edit, delete, and monitor medical inventory stocks.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/')} variant="outline" className="rounded-xl border-neutral-250 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900">
            View Storefront
          </Button>
          {!isEditing && (
            <Button onClick={handleAddNewClick} className="rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold">
              Add New Medicine
            </Button>
          )}
        </div>
      </div>

      {/* Success / Error notification */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-655 font-bold text-xs">
          {error}
        </div>
      )}

      {/* Admin CRUD edit form pane */}
      {isEditing && (
        <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-6 sm:p-8 mb-8 shadow-md">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
            {formMedId ? `Edit Medicine Detail (ID: ${formMedId})` : 'Create New Medicine Record'}
          </h2>
          
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500">Brand Name</label>
              <Input required name="name" value={formFields.name} onChange={handleFormChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500">Active Salt Name</label>
              <Input required name="salt_name" value={formFields.salt_name} onChange={handleFormChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500">Formulation Category</label>
              <select
                name="formulation"
                value={formFields.formulation}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-sm text-neutral-800 dark:text-neutral-200"
              >
                <option value="TABLETS">TABLETS</option>
                <option value="CAPSULES">CAPSULES</option>
                <option value="TOPICALS">TOPICALS</option>
                <option value="ORTHO SUPPORT">ORTHO SUPPORT</option>
                <option value="SURGICALS">SURGICALS</option>
                <option value="LIQUIDS">LIQUIDS</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500">Price ($)</label>
              <Input required type="number" step="0.01" min="0.01" name="price" value={formFields.price} onChange={handleFormChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500">Stock Count</label>
              <Input required type="number" min="0" name="stock" value={formFields.stock} onChange={handleFormChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500">Minimum Order Quantity (MOQ)</label>
              <Input required type="number" min="1" name="min_order_quantity" value={formFields.min_order_quantity} onChange={handleFormChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
            </div>

            <div className="flex flex-col gap-2 lg:col-span-3">
              <label className="text-xs font-bold text-neutral-500">Image URL</label>
              <Input name="image_url" value={formFields.image_url} onChange={handleFormChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
            </div>

            <div className="flex flex-col gap-2 lg:col-span-3">
              <label className="text-xs font-bold text-neutral-500">Chemical Composition Specification</label>
              <textarea
                name="composition"
                rows={2}
                value={formFields.composition}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 text-sm text-neutral-800 dark:text-neutral-200 outline-none focus:border-brand-green"
              />
            </div>

            <div className="flex flex-col gap-2 lg:col-span-3">
              <label className="text-xs font-bold text-neutral-500">Product Monograph (Description)</label>
              <textarea
                name="description"
                rows={3}
                value={formFields.description}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 text-sm text-neutral-800 dark:text-neutral-200 outline-none focus:border-brand-green"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500">Observed Side Effects</label>
              <Input name="side_effects" value={formFields.side_effects} onChange={handleFormChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500">Standard Dosage Instruction</label>
              <Input name="dosage" value={formFields.dosage} onChange={handleFormChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-neutral-500">Prescription Status Warning</label>
              <select
                name="status"
                value={formFields.status}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-2.5 text-sm text-neutral-800 dark:text-neutral-200"
              >
                <option value="OTC PRODUCT">OTC PRODUCT</option>
                <option value="PRESCRIPTION ONLY DRUG">PRESCRIPTION ONLY DRUG</option>
                <option value="SCHEDULE H1 WARNING">SCHEDULE H1 WARNING</option>
              </select>
            </div>

            <div className="flex gap-2 lg:col-span-3 justify-end mt-4">
              <Button type="button" variant="outline" onClick={handleCancelForm} className="rounded-xl cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={submitLoading} className="rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold cursor-pointer px-6">
                {submitLoading ? 'Saving...' : 'Save Product Record'}
              </Button>
            </div>

          </form>
        </Card>
      )}

      {/* Metrics overview card list */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <Card className="rounded-2xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-5">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Total Catalog</span>
          <span className="text-2xl font-extrabold text-neutral-900 dark:text-white block mt-1">{metrics.totalCount} items</span>
        </Card>
        <Card className="rounded-2xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-5">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Low Stock Alert</span>
          <span className="text-2xl font-extrabold text-amber-500 block mt-1">{metrics.lowStockCount} items</span>
        </Card>
        <Card className="rounded-2xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-5">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Out of Stock</span>
          <span className="text-2xl font-extrabold text-red-500 block mt-1">{metrics.outOfStockCount} items</span>
        </Card>
        <Card className="rounded-2xl border border-neutral-200 dark:border-neutral-905 bg-white dark:bg-neutral-900/10 p-5">
          <span className="text-[10px] uppercase font-bold text-neutral-400">Average Unit Price</span>
          <span className="text-2xl font-extrabold text-brand-green block mt-1">${metrics.avgPrice.toFixed(2)}</span>
        </Card>
      </section>

      {/* Catalog Table */}
      <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-6 overflow-hidden">
        
        {/* Table Filter / Controls bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-neutral-200 dark:border-neutral-900 pb-6 mb-6">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Product Inventory</h3>
            <span className="text-xs text-neutral-505 font-semibold bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-md">
              {medicines.length} in view
            </span>
          </div>

          {/* Admin Table Search Bar */}
          <div className="w-full md:w-72 flex gap-2">
            <div className="relative flex-grow flex items-center border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-2 py-1 rounded-xl focus-within:border-brand-green/50 transition">
              <input
                type="text"
                placeholder="Search brand matching..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 outline-none"
              />
              {adminSearch && (
                <button
                  type="button"
                  onClick={() => { setAdminSearch(""); setAdminSearchQuery(""); }}
                  className="text-neutral-400 hover:text-neutral-900 text-xs px-1 cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => setAdminSearchQuery(adminSearch)}
              className="bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Filter
            </Button>
          </div>
        </div>

        {/* Categories Pills Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setAdminCategory(cat.name)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                adminCategory === cat.name
                  ? 'bg-brand-green border-brand-green text-white shadow-xs'
                  : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
            <p className="text-xs text-neutral-500 mt-3">Loading master records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-900 text-neutral-455 uppercase font-bold">
                  <th className="py-3 px-4">Brand Name</th>
                  <th className="py-3 px-4">Active Salt</th>
                  <th className="py-3 px-4">Formulation</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900/80">
                {medicines.map((med) => (
                  <tr key={med.id} className="hover:bg-neutral-100/30 dark:hover:bg-neutral-900/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-neutral-900 dark:text-white">{med.name}</td>
                    <td className="py-4 px-4 text-neutral-500 font-semibold">{med.salt_name}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="border-neutral-200 text-neutral-600 dark:text-neutral-400 dark:border-neutral-800 uppercase font-bold text-[9px]">
                        {med.formulation}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-neutral-800 dark:text-neutral-200">${med.price.toFixed(2)}</td>
                    <td className={`py-4 px-4 text-right font-bold ${
                      med.stock <= 0 ? 'text-red-500' : med.stock < 100 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {med.stock}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(med)}
                          className="rounded-lg h-8 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-brand-green font-semibold text-neutral-500 dark:text-neutral-400"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(med.id)}
                          className="rounded-lg h-8 cursor-pointer hover:bg-red-500/10 text-red-500 font-semibold"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </main>
  )
}

/* ================= CART VIEW (REVIEW CART ITEMS) ================= */
function CartView({ cart, onUpdateQuantity, onRemoveFromCart, onClearCart }) {
  const navigate = useNavigate()
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const gstTax = subtotal * 0.18 // 18% GST for medical goods
  const shipping = subtotal > 250 || subtotal === 0 ? 0 : 15.00
  const grandTotal = subtotal + gstTax + shipping

  if (cart.length === 0) {
    return (
      <main className="max-w-xl mx-auto my-24 p-8 border border-neutral-200 dark:border-neutral-900 rounded-3xl text-center bg-white dark:bg-neutral-900/20 shadow-xs relative z-10">
        <div className="h-16 w-16 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Your Wholesale Cart is Empty</h2>
        <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
          Search the formulation catalog and add case packs of medicines to build your B2B purchase order.
        </p>
        <Button onClick={() => navigate('/')} className="mt-8 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold cursor-pointer px-6">
          Browse Formulations
        </Button>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Wholesale Cart</h1>
        <p className="text-xs text-neutral-500 mt-1.5">Review items and prepare purchase dispatch.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Item List (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {cart.map((item) => (
            <Card key={item.id} className="rounded-2xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Product thumbnail */}
                <div className="h-16 w-16 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 flex items-center justify-center p-2 shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[9px] font-mono text-neutral-400">No Image</span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1">{item.name}</h3>
                  <span className="text-[10px] text-brand-green font-semibold uppercase tracking-wider block mt-0.5">{item.salt_name}</span>
                  <span className="text-[10px] text-neutral-450 block mt-0.5">Category: {item.formulation}</span>
                </div>
              </div>

              {/* Price, Quantity, Subtotal controls */}
              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                
                {/* Unit Price */}
                <div className="text-left sm:text-right">
                  <span className="text-[9px] text-neutral-400 uppercase font-semibold block">Price</span>
                  <span className="font-bold text-sm">${item.price.toFixed(2)}</span>
                </div>

                {/* Quantity adjustments */}
                <div className="flex items-center gap-2 border border-neutral-200 dark:border-neutral-850 p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-950">
                  <button
                    onClick={() => onUpdateQuantity(item.id, Math.max(item.min_order_quantity || 10, item.quantity - 10))}
                    className="h-6 w-6 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-900 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold w-10 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, Math.min(item.stock || 999, item.quantity + 10))}
                    className="h-6 w-6 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-900 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Item Subtotal */}
                <div className="text-right">
                  <span className="text-[9px] text-neutral-400 uppercase font-semibold block">Subtotal</span>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => onRemoveFromCart(item.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                  aria-label="Remove item"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

              </div>
            </Card>
          ))}

          <div className="flex justify-between items-center mt-2 px-1">
            <Button variant="ghost" onClick={onClearCart} className="text-red-500 hover:bg-red-500/10 rounded-xl cursor-pointer text-xs font-bold">
              Empty Shopping Cart
            </Button>
            <Link to="/" className="text-xs font-bold text-brand-green hover:underline">
              &larr; Keep Adding Products
            </Link>
          </div>
        </div>

        {/* Pricing Summary Panel (4 Columns) */}
        <div className="lg:col-span-4">
          <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-6 shadow-sm">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-3 mb-4">
              Wholesale Order Summary
            </h2>
            
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Items Subtotal</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Estimated GST (18%)</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">${gstTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Shipping & Freight</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  {shipping === 0 ? <span className="text-emerald-500">FREE</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              
              {shipping > 0 && (
                <div className="text-[10px] text-neutral-400 bg-neutral-100 dark:bg-neutral-950 p-2 rounded-lg text-center mt-1 border border-neutral-200 dark:border-neutral-900">
                  Add <span className="font-bold text-brand-green">${(250 - subtotal).toFixed(2)}</span> more to qualify for Free Shipping!
                </div>
              )}

              <div className="border-t border-neutral-200 dark:border-neutral-900/80 pt-4 mt-2 flex justify-between text-sm">
                <span className="font-bold text-neutral-900 dark:text-white">Estimated Total</span>
                <span className="font-extrabold text-brand-green text-lg">${grandTotal.toFixed(2)}</span>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="mt-6 w-full cursor-pointer rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs py-6 shadow-lg shadow-brand-green/20"
              >
                Proceed to Checkout
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </main>
  )
}

/* ================= CHECKOUT VIEW ================= */
function CheckoutView({ cart, onClearCart }) {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn, user } = useUser()
  
  const [submitLoading, setSubmitLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("razorpay")
  const [formFields, setFormFields] = useState({
    pharmacyName: '',
    drugLicense: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  })

  // Autofill signed-in user name
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setFormFields(prev => ({
        ...prev,
        pharmacyName: user.fullName || ''
      }))
    }
  }, [isLoaded, isSignedIn, user])

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const gstTax = subtotal * 0.18
  const shipping = subtotal > 250 || subtotal === 0 ? 0 : 15.00
  const grandTotal = subtotal + gstTax + shipping

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 border border-neutral-200 dark:border-neutral-900 rounded-3xl text-center bg-white dark:bg-neutral-900/20 shadow-xs">
        <h2 className="text-xl font-bold">No items for checkout</h2>
        <Button onClick={() => navigate('/')} className="mt-6 rounded-xl bg-brand-green text-white">
          Return to Store
        </Button>
      </div>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormFields(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitLoading(true)

    // Simulate order placement database latency
    setTimeout(() => {
      setSubmitLoading(false)
      
      // Navigate to success page carrying state metadata
      navigate('/order-success', {
        state: {
          orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          pharmacyName: formFields.pharmacyName,
          drugLicense: formFields.drugLicense,
          paymentMethod: paymentMethod,
          grandTotal: grandTotal,
          itemsCount: cart.reduce((sum, item) => sum + item.quantity, 0)
        }
      })
      onClearCart()
    }, 1500)
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Wholesale Checkout</h1>
        <p className="text-xs text-neutral-505 mt-1.5">Verify license credentials and billing address details.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Checkout Form (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-6 sm:p-8">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-6 border-b border-neutral-200 dark:border-neutral-900/80 pb-3">
              1. B2B License Verification & Delivery Info
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-500">Pharmacy / Clinic Name</label>
                <Input required name="pharmacyName" value={formFields.pharmacyName} onChange={handleInputChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-500">Drug License Number (DL-20B/21B)</label>
                <Input required placeholder="DL-XX-XXXX-XXXX" name="drugLicense" value={formFields.drugLicense} onChange={handleInputChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-500">Contact Number</label>
                <Input required type="tel" name="phone" value={formFields.phone} onChange={handleInputChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="text-xs font-bold text-neutral-500">Delivery Address</label>
                <Input required name="address" value={formFields.address} onChange={handleInputChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-500">City</label>
                <Input required name="city" value={formFields.city} onChange={handleInputChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-500">State</label>
                <Input required name="state" value={formFields.state} onChange={handleInputChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-500">Postal ZIP Code</label>
                <Input required name="zip" value={formFields.zip} onChange={handleInputChange} className="rounded-xl bg-neutral-50 dark:bg-neutral-950" />
              </div>
            </div>
          </Card>

          {/* Payment Method card */}
          <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-6 sm:p-8">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-6 border-b border-neutral-200 dark:border-neutral-900/80 pb-3">
              2. Choose B2B Payment Option
            </h2>
            
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-neutral-200 dark:border-neutral-900 rounded-xl hover:bg-neutral-100/30 dark:hover:bg-neutral-900/30 transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="h-4 w-4 text-brand-green accent-brand-green cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-neutral-850 dark:text-white block">UPI / Cards / Indian NetBanking (via Razorpay)</span>
                  <span className="text-[10px] text-neutral-450 block mt-0.5">Pay instantly using corporate bank transfer, UPI, or credit cards.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 border border-neutral-200 dark:border-neutral-900 rounded-xl hover:bg-neutral-100/30 dark:hover:bg-neutral-900/30 transition">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="net30"
                  checked={paymentMethod === "net30"}
                  onChange={() => setPaymentMethod("net30")}
                  className="h-4 w-4 text-brand-green accent-brand-green cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-neutral-850 dark:text-white block">Wholesale Invoice Terms (Net-30 Days credit)</span>
                  <span className="text-[10px] text-neutral-450 block mt-0.5">Generate a digital invoice. Pay via Bank Wire Transfer within 30 days of shipment receipt.</span>
                </div>
              </label>
            </div>
          </Card>
        </div>

        {/* Order review sidebar (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-6">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-3 mb-4">
              Order Review
            </h2>
            
            <div className="flex flex-col gap-3 divide-y divide-neutral-100 dark:divide-neutral-900/60">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 first:pt-0">
                  <div className="max-w-[70%]">
                    <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200 block line-clamp-1">{item.name}</span>
                    <span className="text-[9px] text-neutral-450 mt-0.5 block">{item.quantity} units x ${item.price.toFixed(2)}</span>
                  </div>
                  <span className="font-bold text-xs text-neutral-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-900/80 pt-4 mt-4 flex flex-col gap-3 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>GST Tax (18%)</span>
                <span>${gstTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Shipping Freight</span>
                <span>{shipping === 0 ? <span className="text-emerald-500 font-bold">FREE</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-900/80 pt-4 mt-2 flex justify-between text-sm">
                <span className="font-bold text-neutral-900 dark:text-white">Grand Total</span>
                <span className="font-extrabold text-brand-green text-base">${grandTotal.toFixed(2)}</span>
              </div>

              <Button
                type="submit"
                disabled={submitLoading}
                className="mt-6 w-full cursor-pointer rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs py-6 shadow-lg shadow-brand-green/20"
              >
                {submitLoading ? "Processing dispatch order..." : "Place Bulk Purchase Order"}
              </Button>
            </div>
          </Card>
        </div>

      </form>
    </main>
  )
}

/* ================= ORDER CONFIRMATION / SUCCESS VIEW ================= */
function OrderSuccessView() {
  const { state } = useParams() // React Router holds state details in navigation payload
  const navigate = useNavigate()
  const location = window.history.state?.usr // Access values carried over by state redirection

  const orderId = location?.orderId || "ORD-739420"
  const pharmacyName = location?.pharmacyName || "Registered Pharmacist"
  const drugLicense = location?.drugLicense || "DL-XX-XXXX-XXXX"
  const grandTotal = location?.grandTotal || 0
  const paymentMethod = location?.paymentMethod === 'net30' ? "Net-30 Invoice" : "Online Razorpay"

  return (
    <main className="max-w-2xl mx-auto my-16 px-4 py-8 relative z-10 text-center">
      <Card className="rounded-3xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900/10 p-8 sm:p-12 shadow-md">
        
        {/* Success Icon */}
        <div className="h-16 w-16 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.6} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Wholesale Purchase Placed</h1>
        <p className="text-xs text-neutral-500 mt-2">Your B2B medicine order has been logged and queued for batch shipment.</p>

        {/* Order Details list */}
        <div className="mt-8 bg-neutral-100/50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 text-left text-xs flex flex-col gap-4">
          <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-900/60 pb-2">
            <span className="text-neutral-450 uppercase font-bold tracking-wider text-[10px]">Order ID Number</span>
            <span className="font-extrabold text-neutral-800 dark:text-white font-mono">{orderId}</span>
          </div>

          <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-900/60 pb-2">
            <span className="text-neutral-450 uppercase font-bold tracking-wider text-[10px]">Pharmacy Name</span>
            <span className="font-bold text-neutral-800 dark:text-white">{pharmacyName}</span>
          </div>

          <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-900/60 pb-2">
            <span className="text-neutral-450 uppercase font-bold tracking-wider text-[10px]">Drug License Number</span>
            <span className="font-bold text-neutral-800 dark:text-white">{drugLicense}</span>
          </div>

          <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-900/60 pb-2">
            <span className="text-neutral-450 uppercase font-bold tracking-wider text-[10px]">Invoice Settlement Mode</span>
            <span className="font-bold text-brand-green uppercase font-extrabold">{paymentMethod}</span>
          </div>

          <div className="flex justify-between pt-1 text-sm font-bold">
            <span className="text-neutral-900 dark:text-white">Amount Billed</span>
            <span className="text-brand-green font-extrabold text-base">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('/')} className="rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold cursor-pointer flex-grow sm:flex-grow-0 px-6 py-6">
            Continue Sourcing
          </Button>
          <Button variant="outline" className="rounded-xl border-neutral-250 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer flex-grow sm:flex-grow-0 px-6 py-6">
            Download Invoice PDF
          </Button>
        </div>

      </Card>
    </main>
  )
}

/* ================= MAIN APP ROUTER CONTAINER ================= */
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
  
  // Master Cart State Array
  const [cart, setCart] = useState([])
  const [activeBanner, setActiveBanner] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("All Products")

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Cart Helper functions
  const handleAddToCart = (med, quantityToPurchase = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === med.id)
      if (existing) {
        // Enforce stock limits
        const newQty = Math.min(med.stock, existing.quantity + quantityToPurchase)
        return prev.map((item) => (item.id === med.id ? { ...item, quantity: newQty } : item))
      } else {
        // Enforce minimum order quantity (MOQ)
        const initialQty = Math.max(med.min_order_quantity || 10, quantityToPurchase)
        return [...prev, { ...med, quantity: initialQty }]
      }
    })
  }

  const handleUpdateCartQuantity = (medId, newQuantity) => {
    setCart((prev) =>
      prev.map((item) => (item.id === medId ? { ...item, quantity: newQuantity } : item))
    )
  }

  const handleRemoveFromCart = (medId) => {
    setCart((prev) => prev.filter((item) => item.id !== medId))
  }

  const handleClearCart = () => {
    setCart([])
  }

  // Automatic Banner Carousel Switcher
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % PROMOTIONS.length)
    }, 8500)
    return () => clearInterval(timer)
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 font-sans selection:bg-brand-green selection:text-white transition-colors duration-300">
        <Header theme={theme} toggleTheme={toggleTheme} cart={cart} />
        
        <Routes>
          <Route
            path="/"
            element={
              <CatalogView
                onAddToCart={handleAddToCart}
                activeBanner={activeBanner}
                setActiveBanner={setActiveBanner}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            }
          />
          <Route
            path="/:category/:slug"
            element={<MedicineDetailView onAddToCart={handleAddToCart} />}
          />
          <Route
            path="/admin"
            element={<AdminView />}
          />
          <Route
            path="/cart"
            element={
              <CartView
                cart={cart}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutView
                cart={cart}
                onClearCart={handleClearCart}
              />
            }
          />
          <Route
            path="/order-success"
            element={<OrderSuccessView />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
