import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, MapPin, Mail, Phone, ArrowRight, Instagram, Twitter, Facebook } from 'lucide-react'
import { EcoMartLogo } from './EcoMartLogo'
import { EcoMartWordmark } from './EcoMartWordmark'

const NAV_LINKS = [
  { name: 'Home',       href: '/' },
  { name: 'About Us',   href: '/about-us' },
  { name: 'Products',   href: '/products' },
  { name: 'My Orders',  href: '/my-orders' },
  { name: 'My Reviews', href: '/my-reviews' },
  { name: 'Contact',    href: '/contact' },
]

const CATEGORIES = [
  { name: 'Kitchen',       href: '/products?productCategory=Kitchen' },
  { name: 'Personal Care', href: '/products?productCategory=Personal+Care' },
  { name: 'Home & Living', href: '/products?productCategory=Home+%26+Living' },
  { name: 'Bags & School', href: '/products?productCategory=Bags+%26+School+Items' },
  { name: 'Gifts',         href: '/products?productCategory=Gifts' },
]

const SOCIALS = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter,   label: 'Twitter',   href: '#' },
  { icon: Facebook,  label: 'Facebook',  href: '#' },
]

export function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-[#0D0D0D] relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/3 h-72 w-72 rounded-full bg-lime-500/5 blur-[80px]" />

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="relative z-10 border-b border-white/8">
        <div className="px-4 md:px-8 lg:px-12 max-w-8xl mx-auto py-10">
          <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-8">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer mb-3"
              >
                <EcoMartLogo size={34} className="drop-shadow-[0_2px_12px_rgba(234,179,8,0.35)]" />
                <EcoMartWordmark variant="onDark" />
              </button>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 max-w-[220px]">
                Your trusted marketplace for eco-conscious living — partnering with local sustainable vendors.
              </p>
              {/* Socials */}
              <div className="flex items-center gap-2">
                {SOCIALS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-gray-500 transition-all hover:border-lime-400/40 hover:text-lime-300"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigate */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3">Navigate</p>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-xs text-gray-500 hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shop by */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3">Shop by</p>
              <ul className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat.name}>
                    <Link
                      to={cat.href}
                      className="text-xs text-gray-500 hover:text-white transition-colors hover:translate-x-0.5 inline-block"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3">Contact</p>
              <ul className="space-y-2.5">
                {[
                  { icon: MapPin, text: 'Colombo 03, Sri Lanka' },
                  { icon: Phone,  text: '+94 11 234 5678',     href: 'tel:+94112345678' },
                  { icon: Mail,   text: 'hello@ecomart.lk',    href: 'mailto:hello@ecomart.lk' },
                ].map(({ icon: Icon, text, href }) => (
                  <li key={text} className="flex items-center gap-2">
                    <Icon size={12} className="text-lime-400 shrink-0" />
                    {href
                      ? <a href={href} className="text-xs text-gray-500 hover:text-white transition-colors">{text}</a>
                      : <span className="text-xs text-gray-500">{text}</span>
                    }
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/products')}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-lime-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-lime-200"
              >
                Shop now <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────── */}
      <div className="relative z-10 px-4 md:px-8 lg:px-12 max-w-8xl mx-auto py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-gray-600">
          © {new Date().getFullYear()} EcoMart · All rights reserved.
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/20 bg-lime-400/5 px-3 py-1 text-[11px] font-semibold text-lime-500">
          <Leaf size={10} fill="currentColor" />
          Eco-friendly marketplace
        </span>
      </div>
    </footer>
  )
}

export default Footer
