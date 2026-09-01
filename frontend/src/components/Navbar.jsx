import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, X, User } from 'lucide-react'
import { EcoMartLogo } from './EcoMartLogo'
import { EcoMartWordmark } from './EcoMartWordmark'
import { authHelpers } from '../services/Tudakshana/authService'
import { cartAPI } from '../services/Thaveesha'

function linkIsActive(pathname, href) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticated = authHelpers.isAuthenticated()
        setIsAuthenticated(authenticated)
        if (authenticated) {
          const user = authHelpers.getUser()
          setUserName(user?.name || 'User')
        } else {
          setUserName('')
          setCartCount(0)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
        setUserName('')
        setCartCount(0)
      }
    }

    checkAuth()
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [location.pathname])

  useEffect(() => {
    if (!isAuthenticated) return
    cartAPI.getCart()
      .then(({ totalItems, items }) => {
        setCartCount(totalItems ?? (items || []).reduce((sum, i) => sum + (i.quantity || 1), 0))
      })
      .catch(() => setCartCount(0))
  }, [isAuthenticated, location.pathname])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    try {
      authHelpers.clearAuth()
      setIsAuthenticated(false)
      setUserName('')
      navigate('/')
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about-us' },
    { name: 'Products', href: '/products' },
    { name: 'Orders', href: '/my-orders' },
    { name: 'Reviews', href: '/my-reviews' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header className="sticky top-0 left-0 w-full z-50">
      {/* glass bar */}
      <nav className="border-b border-gray-200/80 bg-white/75 backdrop-blur-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] supports-[backdrop-filter]:bg-white/65">
        <div className="flex items-center justify-between max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-transparent border-none cursor-pointer group"
            >
              <EcoMartLogo
                size={34}
                className="inline-flex transition-transform group-hover:scale-105"
              />
              <EcoMartWordmark variant="onLight" />
            </button>
          </div>

          {/* Desktop nav — pill cluster */}
          <div className="hidden lg:flex items-center p-1 rounded-full bg-gray-100/90 ring-1 ring-gray-200/60">
            {navLinks.map((link) => {
              const active = linkIsActive(location.pathname, link.href)
              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => navigate(link.href)}
                  className={[
                    'px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-200',
                    active
                      ? 'bg-white text-lime-800 shadow-sm ring-1 ring-lime-200/80'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60',
                  ].join(' ')}
                >
                  {link.name}
                </button>
              )
            })}
          </div>

          {/* Tablet: compact links */}
          <div className="hidden md:flex lg:hidden items-center gap-1">
            {navLinks.slice(0, 4).map((link) => {
              const active = linkIsActive(location.pathname, link.href)
              return (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => navigate(link.href)}
                  className={[
                    'px-2.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide transition-colors',
                    active ? 'text-lime-800 bg-lime-50' : 'text-gray-600 hover:text-lime-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {link.name}
                </button>
              )
            })}
          </div>

          {/* Right actions — desktop */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-all hover:bg-lime-50 hover:text-lime-800 ring-1 ring-transparent hover:ring-lime-200/80"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={20} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-lime-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-colors hover:bg-gray-100"
                  aria-label="Profile"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                    <User size={15} strokeWidth={2} />
                  </span>
                  <span className="text-xs font-semibold text-gray-800 max-w-[100px] truncate hidden xl:inline">
                    {userName}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 text-[11px] font-bold tracking-wider uppercase rounded-full border border-gray-300 text-gray-800 transition-all hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-[11px] font-bold tracking-wider uppercase rounded-full border border-gray-300 text-gray-800 transition-all hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 text-[11px] font-bold tracking-wider uppercase rounded-full bg-[#0D0D0D] text-white shadow-md transition-all hover:bg-gray-800 hover:shadow-lg"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile: cart + menu */}
          <div className="flex md:hidden items-center gap-1">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-800 hover:bg-lime-50"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={21} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-lime-500 text-[9px] font-bold text-white px-0.5">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-800 hover:bg-gray-100 transition-colors"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile panel */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 sm:top-16 bottom-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
          <div
            className="absolute right-4 left-4 top-2 rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 max-h-[min(70vh,480px)] overflow-y-auto">
              {navLinks.map((link) => {
                const active = linkIsActive(location.pathname, link.href)
                return (
                  <button
                    key={link.name}
                    type="button"
                    onClick={() => { navigate(link.href); setIsMenuOpen(false) }}
                    className={[
                      'w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                      active ? 'bg-lime-50 text-lime-900' : 'text-gray-800 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {link.name}
                  </button>
                )
              })}
              <div className="my-2 border-t border-gray-100" />
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => { navigate('/profile'); setIsMenuOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white">
                      <User size={16} />
                    </span>
                    {userName}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full mt-1 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-gray-300 text-gray-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => { navigate('/login'); setIsMenuOpen(false) }}
                    className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-gray-300 text-gray-800"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { navigate('/signup'); setIsMenuOpen(false) }}
                    className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#0D0D0D] text-white"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
