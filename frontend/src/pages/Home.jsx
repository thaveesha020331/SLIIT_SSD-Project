import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, ShieldCheck, Truck, Recycle, Handshake, Sparkles, Star, ArrowUp, ArrowDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { authAPI, authHelpers } from '../services/Tudakshana/authService';
import Hero1 from "@/assets/Hero1.png";
import Hero2 from "@/assets/Hero2.png";
import Hero3 from "@/assets/Hero3.png";
import Hero4 from "@/assets/Hero4.png";
import Hero5 from "@/assets/Hero5.png";
import Hero6 from "@/assets/Hero6.png";
import HeroAbout from "@/assets/HeroAbout.png";
import Ellipse1 from "@/assets/Ellipse 1.png";
import Ellipse2 from "@/assets/Ellipse 2.png";
import Ellipse3 from "@/assets/Ellipse 3.png";
import Ellipse4 from "@/assets/Ellipse 4.png";

const CAROUSEL_IMAGES = [
  Hero1,
  Hero2,
  Hero3,
  Hero4,
  Hero5,
  Hero6
]

const WHY_CHOOSE_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Trusted Green Standards',
    description: 'Every listed item is reviewed for eco-certification, sourcing transparency, and safer production practices.',
  },
  {
    icon: Truck,
    title: 'Fast Local Delivery',
    description: 'EcoMart prioritizes nearby suppliers to reduce travel emissions while getting fresh products to your door faster.',
  },
  {
    icon: Recycle,
    title: 'Low-Waste Packaging',
    description: 'We encourage reusable, recyclable, and biodegradable packaging choices across our marketplace partners.',
  },
  {
    icon: Handshake,
    title: 'Support Local Communities',
    description: 'Your purchases directly empower small local producers and sustainable businesses in your region.',
  },
]

const PRODUCT_CATEGORIES = [
  {
    title: 'Kitchen',
    subtitle: 'Eco-friendly cooking and dining essentials',
    icon: Sparkles,
    image: Hero1,
  },
  {
    title: 'Personal Care',
    subtitle: 'Daily care products with cleaner ingredients',
    icon: Leaf,
    image: Hero2,
  },
  {
    title: 'Bags & School Items',
    subtitle: 'Reusable carry options and student needs',
    icon: Recycle,
    image: Hero5,
  },
  {
    title: 'Home & Living',
    subtitle: 'Greener choices for a healthier home',
    icon: Handshake,
    image: Hero3,
  },
  {
    title: 'Gifts',
    subtitle: 'Meaningful sustainable gift picks',
    icon: Truck,
    image: Hero6,
  },
]

const FAQ_ITEMS = [
  {
    question: 'How do I know if a product is truly eco-friendly?',
    answer: 'Every product on EcoMart is verified for eco-certification, sustainable sourcing practices, and production transparency. We work directly with vendors to ensure their items meet our strict environmental standards.',
  },
  {
    question: 'What are your delivery times and shipping options?',
    answer: 'We prioritize local deliveries to reduce carbon emissions. Most deliveries within Colombo take 2-3 business days. We also offer nationwide shipping with delivery within 5-7 business days.',
  },
  {
    question: 'Can I return or exchange products?',
    answer: 'Yes, we offer a 14-day return and exchange policy for most items. Products must be unused and in original packaging. Simply contact our support team to initiate the process.',
  },
  {
    question: 'Do you offer bulk orders for businesses?',
    answer: 'Absolutely! We welcome B2B partnerships and bulk orders. Contact our business team at partnerships@ecomart.lk for wholesale pricing and custom solutions.',
  },
  {
    question: 'Is my payment information secure?',
    answer: 'We use industry-standard SSL encryption and secure payment gateways. Your payment data is never stored on our servers and is processed through trusted payment providers.',
  },
]

const CUSTOMER_TESTIMONIALS = [
  {
    id: 1,
    name: 'Nimali Perera',
    location: 'Colombo',
    rating: 4,
    text: 'EcoMart helped me switch to sustainable products without giving up quality. Delivery is always quick and reliable.',
    image: Ellipse1,
  },
  {
    id: 2,
    name: 'Kasun Wijesinghe',
    location: 'Kandy',
    rating: 5,
    text: 'I love that most products come from local vendors. It feels good to support small businesses while shopping responsibly.',
    image: Ellipse2,
  },
  {
    id: 3,
    name: 'Hiruni Fernando',
    location: 'Galle',
    rating: 5,
    text: 'The category filters make it super easy to find what I need. My whole family now prefers eco-friendly alternatives.',
    image: Ellipse3,
  },
  {
    id: 4,
    name: 'Dineth Alwis',
    location: 'Matara',
    rating: 4,
    text: 'Great selection and smooth ordering experience. It is now my first choice whenever I want ethical and local products.',
    image: Ellipse4,
  },
]

export function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)
  const [isTestimonialTransitioning, setIsTestimonialTransitioning] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [themePreference, setThemePreference] = useState(localStorage.getItem('userTheme') || 'light')
  const navigate = useNavigate()
  const currentTestimonial = CUSTOMER_TESTIMONIALS[currentTestimonialIndex]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!authHelpers.isAuthenticated()) return;
    authAPI.getProfile()
      .then((res) => {
        const theme = res?.data?.user?.themePreference || 'light';
        setThemePreference(theme);
        localStorage.setItem('userTheme', theme);
      })
      .catch(() => {});
  }, []);

  const rootThemeClass = themePreference === 'dark'
    ? 'bg-slate-950 text-slate-100'
    : themePreference === 'green'
      ? 'bg-lime-50 text-lime-950'
      : 'bg-white text-gray-900';

  const handlePrevTestimonial = () => {
    if (isTestimonialTransitioning) return
    setIsTestimonialTransitioning(true)
    setCurrentTestimonialIndex((prev) => (prev === 0 ? CUSTOMER_TESTIMONIALS.length - 1 : prev - 1))
    setTimeout(() => setIsTestimonialTransitioning(false), 500)
  }

  const handleNextTestimonial = () => {
    if (isTestimonialTransitioning) return
    setIsTestimonialTransitioning(true)
    setCurrentTestimonialIndex((prev) => (prev === CUSTOMER_TESTIMONIALS.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsTestimonialTransitioning(false), 500)
  }

  return (
    <div className={`min-h-screen ${rootThemeClass}`}>
      <main className="mb-0">
        {/* Hero */}
        <section className="px-4 md:px-6 lg:px-8 pt-4 pb-12 max-w-8xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative h-[95vh] min-h-[500px] overflow-hidden rounded-xl md:rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-lime-100 via-lime-200 to-lime-400" />
            <div className="relative h-full flex items-center justify-center px-4 text-center">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-2/3 h-full bg-white/10 rounded-l-full blur-3xl transform translate-x-1/4 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-lime-300/20 blur-3xl rounded-full pointer-events-none" />
              <div className="flex flex-col lg:flex-row items-center">
                {/* Left Content */}
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="w-full lg:w-[45%] text-center lg:text-left mb-16 lg:mb-0 relative z-10 lg:mr-12"
                >
                  <span className="inline-block text-lime-800 font-bold tracking-widest text-xs md:text-sm mb-4 uppercase">
                    ECO FRIENDLY LOCAL PRODUCTS
                  </span>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                    LOVE FOR NATURE
                    <br />
                    LOVE LOCAL
                  </h1>

                  <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-10">
                    Discover the best of local, sustainable products that nourish you and the planet. From farm-fresh produce to eco-friendly essentials, we bring you a curated selection of goods that support local communities and promote a greener lifestyle. Join us in making conscious choices for a healthier you and a happier Earth.
                  </p>

                  {/* Explore More Button */}
                  <button
                    onClick={() => navigate('/products')}
                    className="bg-[#0D0D0D] text-white px-8 py-4 rounded-full text-sm font-bold tracking-wider hover:bg-gray-800 transition-colors uppercase shadow-lg"
                  >
                    Explore More
                  </button>
                </motion.div>

                {/* Right Image Content */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="w-full lg:w-[55%] relative flex justify-center lg:justify-end"
                >
                  <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[460px] lg:h-[460px]">
                    {/* Main Bowl Image Container with Float Animation */}
                    <div className="w-full h-full relative z-10 animate-float -mt-12">
                      <div className="w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-white/20 relative">
                        {CAROUSEL_IMAGES.map((src, index) => (
                          <img
                            key={src}
                            src={src}
                            alt={`Healthy food ${index + 1}`}
                            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100 animate-ken-burns' : 'opacity-0'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Carousel Indicators */}
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                      {CAROUSEL_IMAGES.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'bg-lime-600 scale-125' : 'bg-lime-300 hover:bg-lime-400'}`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>

                    {/* Decorative Elements */}
                    {/* Top Right Leaf */}
                    <div
                      className="absolute -top-4 -right-4 md:top-0 md:right-0 text-lime-700 animate-float"
                      style={{
                        animationDelay: '1s',
                      }}
                    >
                      <Leaf size={32} className="rotate-45" fill="currentColor" />
                    </div>

                    {/* Bottom Left Leaf */}
                    <div
                      className="absolute bottom-10 -left-4 md:bottom-20 md:left-0 text-lime-600 animate-float"
                      style={{
                        animationDelay: '2s',
                      }}
                    >
                      <Leaf size={24} className="-rotate-12" fill="currentColor" />
                    </div>

                    {/* Small circles/dots for organic feel */}
                    <div className="absolute top-1/4 -left-8 w-3 h-3 bg-red-500 rounded-full opacity-80 animate-pulse" />
                    <div className="absolute bottom-1/3 -right-6 w-2 h-2 bg-lime-600 rounded-full opacity-60" />
                    <div className="absolute top-10 right-10 w-4 h-4 bg-yellow-400 rounded-full opacity-80 blur-[1px]" />

                    {/* Spices/Small Bowl (Simulated with CSS) */}
                    <div
                      className="absolute top-0 left-0 md:top-10 md:left-10 w-16 h-16 md:w-24 md:h-24 bg-amber-900/80 rounded-full shadow-lg border-2 border-white/30 flex items-center justify-center animate-float"
                      style={{
                        animationDelay: '1.5s',
                      }}
                    >
                      <div className="w-3/4 h-3/4 bg-black/40 rounded-full flex items-center justify-center">
                        <span className="text-3xl">🌿</span>
                      </div>
                    </div>

                    {/* Oil/Sauce Bottle (Simulated) */}
                    <div
                      className="absolute -bottom-6 left-10 md:bottom-0 md:left-20 w-12 h-12 md:w-20 md:h-20 bg-amber-600/40 backdrop-blur-sm rounded-full shadow-lg border border-white/40 flex items-center justify-center animate-float"
                      style={{
                        animationDelay: '0.5s',
                      }}
                    >
                      <div className="w-1/2 h-1/2 bg-amber-700 rounded-full opacity-50"></div>
                    </div>

                    {/* Cutlery (Simulated) */}
                    <div className="absolute -bottom-10 right-0 md:-bottom-8 md:right-10 flex flex-col space-y-1 rotate-[-15deg] opacity-90">
                      <div className="w-32 h-3 bg-gray-800 rounded-full shadow-md flex items-center px-2">
                        <div className="w-1 h-1 bg-white rounded-full mx-0.5"></div>
                        <div className="w-1 h-1 bg-white rounded-full mx-0.5"></div>
                      </div>
                      <div className="w-32 h-3 bg-gray-800 rounded-full shadow-md flex items-center px-2 ml-4">
                        <div className="w-1 h-1 bg-white rounded-full mx-0.5"></div>
                        <div className="w-1 h-1 bg-white rounded-full mx-0.5"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Curve Separator at bottom */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
              <svg
                className="relative block w-full h-[100px] md:h-[150px]"
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
              >
                <path
                  d="M985.66,92.83C906.67,72,823.78,31,432.84,37.88a1231.53,1231.53,0,0,0-293.26,26.5C73.13,79.55,14.73,111,0,119.88V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                  className="fill-white opacity-30"
                ></path>
                <path
                  d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,2.92V0H0V25.61c61.27,1.14,124.1,11.81,186.29,21.86C231.86,55.61,276.62,58.42,321.39,56.44Z"
                  className="fill-transparent"
                ></path>
              </svg>
            </div>
          </motion.div>
        </section>

        {/* About Us */}
        <section className="px-4 md:px-6 lg:px-8 pb-16 md:pb-20 max-w-8xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="relative overflow-hidden"
          >

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left: Image */}
              <motion.div
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="order-2 lg:order-1 flex justify-center lg:justify-start"
              >
                <div className="relative w-full max-w-sm">
                  <div className="absolute inset-0" />
                  <div className="relative">
                    <img
                      src={HeroAbout}
                      alt="EcoMart - Sustainable Local Products"
                      className="w-full h-[300px] md:h-[360px] object-contain lg:scale-[1.3] lg:ml-20"
                    />
                    <div className="absolute inset-0" />
                  </div>
                </div>
              </motion.div>

              {/* Right: Content & Stats */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.08 }}
                className="order-1 lg:order-2 flex flex-col justify-center"
              >
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-lime-300 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-lime-800 backdrop-blur-sm">
                  <Leaf size={14} className="text-lime-700" />
                  About EcoMart
                </span>

                <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
                  Connecting You to a
                  <span className="block text-gray-900">Sustainable Future</span>
                </h2>

                <p className="mt-6 text-base md:text-lg leading-relaxed text-gray-600">
                  EcoMart is your trusted marketplace for eco-conscious living. We partner with local vendors who share our commitment to sustainability, quality, and community impact. Every product on our platform is carefully vetted to ensure it meets our rigorous environmental and ethical standards.
                </p>

                <p className="mt-4 text-base md:text-lg leading-relaxed text-gray-600">
                  Our mission is simple: make sustainable living accessible, affordable, and rewarding for everyone.
                </p>

                {/* Stats Grid */}
                <div className="mt-10 grid grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
                    className="relative overflow-hidden rounded-2xl border border-lime-300/50 bg-white/70 backdrop-blur-sm p-5 text-center shadow-[0_8px_20px_rgba(132,204,22,0.08)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(132,204,22,0.15)] hover:scale-105"
                  >
                    <div className="pointer-events-none absolute -top-8 right-0 h-20 w-20 rounded-full bg-lime-300/30 blur-2xl" />
                    <p className="relative z-10 text-2xl md:text-3xl font-bold text-lime-700">10K+</p>
                    <p className="relative z-10 mt-2 text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Happy Customers
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.55, ease: 'easeOut', delay: 0.14 }}
                    className="relative overflow-hidden rounded-2xl border border-lime-300/50 bg-white/70 backdrop-blur-sm p-5 text-center shadow-[0_8px_20px_rgba(132,204,22,0.08)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(132,204,22,0.15)] hover:scale-105"
                  >
                    <div className="pointer-events-none absolute -top-8 right-0 h-20 w-20 rounded-full bg-lime-300/30 blur-2xl" />
                    <p className="relative z-10 text-2xl md:text-3xl font-bold text-lime-700">500+</p>
                    <p className="relative z-10 mt-2 text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Eco Products
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.55, ease: 'easeOut', delay: 0.23 }}
                    className="relative overflow-hidden rounded-2xl border border-lime-300/50 bg-white/70 backdrop-blur-sm p-5 text-center shadow-[0_8px_20px_rgba(132,204,22,0.08)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(132,204,22,0.15)] hover:scale-105"
                  >
                    <div className="pointer-events-none absolute -top-8 right-0 h-20 w-20 rounded-full bg-lime-300/30 blur-2xl" />
                    <p className="relative z-10 text-2xl md:text-3xl font-bold text-lime-700">50+</p>
                    <p className="relative z-10 mt-2 text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Local Vendors
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Why Choose */}
        <section className="px-4 md:px-6 lg:px-8 pb-16 md:pb-20 max-w-8xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-3xl border border-lime-200/70 bg-gradient-to-br from-white via-lime-50 to-lime-100 p-6 md:p-8 lg:p-12 shadow-[0_25px_80px_rgba(132,204,22,0.14)]"
          >
            <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-lime-300/35 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-lime-400/25 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="mx-auto max-w-3xl text-center"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-lime-300 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-lime-800 backdrop-blur-sm">
                  <Sparkles size={14} className="text-lime-700" />
                  Why Choose EcoMart?
                </span>
                <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
                  A Smarter Way to Shop for a
                  <span className="block text-gray-900">Greener Tomorrow</span>
                </h2>
                <p className="mt-4 text-base md:text-lg leading-relaxed text-gray-600">
                  EcoMart blends sustainability, quality, and convenience in one beautifully curated marketplace designed for conscious living.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                {WHY_CHOOSE_ITEMS.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <motion.article
                      key={item.title}
                      initial={{ opacity: 0, y: 24, scale: 0.97 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.08 }}
                      className="group relative overflow-hidden rounded-2xl border border-lime-200/80 bg-white/85 p-5 md:p-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-lime-400 hover:shadow-[0_18px_40px_rgba(132,204,22,0.18)]"
                    >
                      <div className="absolute -top-10 -right-8 h-24 w-24 rounded-full bg-lime-300/20 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-70" />
                      <div className="relative z-10">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D0D0D] text-lime-300 shadow-lg ring-1 ring-black/10">
                          <Icon size={22} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
                      </div>
                    </motion.article>
                  )
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.65, ease: 'easeOut', delay: 0.18 }}
                className="relative rounded-2xl border border-lime-300/70 bg-[#0D0D0D] p-6 md:p-8 text-white shadow-2xl"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-lime-500/20 via-transparent to-lime-300/10" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">Join the movement</p>
                    <h3 className="mt-2 text-3xl md:text-4xl font-bold leading-tight">Choose products that care for people and planet.</h3>
                  </div>
                  <button
                    onClick={() => navigate('/products')}
                    className="inline-flex items-center justify-center rounded-full bg-lime-300 px-7 py-3 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-lime-200"
                  >
                    Start Shopping
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Filter By Category */}
        <section className="px-4 md:px-6 lg:px-8 pb-16 md:pb-20 max-w-8xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative overflow-hidden"
          >

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="relative z-10 text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-lime-300 bg-white/75 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-lime-800">
                <Sparkles size={14} className="text-lime-700" />
                Filter By Category
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Pick Your Shopping Focus
              </h2>
              <p className="mt-3 text-base md:text-lg text-gray-600 leading-relaxed">
                Open products with your selected category already checked in the sidebar.
              </p>
            </motion.div>

            <div className="relative z-10 mt-8 overflow-x-auto pb-2">
              <div className="flex flex-nowrap gap-12 md:gap-20 min-w-max md:justify-center md:flex-wrap md:min-w-0 ml-4 md:ml-0">
              {PRODUCT_CATEGORIES.map((category, index) => {
                const Icon = category.icon
                return (
                  <motion.article
                    key={category.title}
                    role="button"
                    tabIndex={0}
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.08 }}
                    onClick={() => navigate(`/products?productCategory=${encodeURIComponent(category.title)}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/products?productCategory=${encodeURIComponent(category.title)}`)
                      }
                    }}
                    className="group relative flex w-[168px] shrink-0 flex-col items-center text-center transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-lime-300/70"
                  >
                    <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-white shadow-[0_16px_45px_rgba(15,23,42,0.2)] ring-1 ring-lime-300/70 transition-transform duration-300 group-hover:scale-[1.05]">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/40 text-lime-200 backdrop-blur-sm">
                        <Icon size={18} />
                      </div>
                    </div>

                    <h3 className="mt-4 text-base font-bold leading-snug text-gray-900">{category.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">{category.subtitle}</p>
                  </motion.article>
                )
              })}
              </div>
            </div>
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="py-16 lg:py-20 -mt-6 bg-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-8xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-[2rem] border border-lime-300/30 px-6 py-8 md:px-10 md:py-12 bg-gradient-to-br from-white to-lime-50"
            >
              <div className="pointer-events-none absolute inset-0">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-100"
                  style={{
                    backgroundImage:
                      "url('https://plus.unsplash.com/premium_photo-1736505437503-67d15f26663d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/10 to-transparent" />
              </div>
              <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
              <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-lime-300/8 blur-3xl" />

              <div className="relative grid lg:grid-cols-2 gap-10 items-start">
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="lg:max-w-lg"
                >
                  <span className="text-sm font-semibold uppercase tracking-widest text-lime-700">FAQ</span>
                  <h2 className="mt-6 font-bold text-3xl md:text-5xl leading-tight text-gray-900">
                    Frequently Asked Questions
                  </h2>
                  <p className="mt-6 max-w-md text-sm md:text-base text-gray-700 leading-relaxed">
                    Everything you need to know about EcoMart—clear answers about our products, delivery, returns, and commitment to sustainability.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  {FAQ_ITEMS.map((q, i) => {
                    const isOpen = openFaq === i
                    return (
                      <button
                        key={i}
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className={`w-full text-left rounded-2xl border p-5 transition-all duration-300 ${
                          isOpen
                            ? 'bg-white border-lime-300/50 shadow-md'
                            : 'bg-white/75 border-gray-200 hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-base md:text-lg font-semibold text-gray-900 leading-snug">{q.question}</span>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex-shrink-0 mt-1"
                          >
                            <ArrowDown size={20} className="text-lime-700" />
                          </motion.div>
                        </div>

                        <motion.div
                          initial={false}
                          animate={{
                            height: isOpen ? 'auto' : 0,
                            opacity: isOpen ? 1 : 0,
                          }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="pt-4 text-sm md:text-base text-gray-700 leading-relaxed">
                            {q.answer}
                          </p>
                        </motion.div>
                      </button>
                    )
                  })}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What Our Customers Say */}
        <section className="w-full pb-4 md:pb-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="relative w-full overflow-hidden bg-gradient-to-br from-white via-lime-50 to-lime-100"
          >
            <div className="relative z-10 max-w-8xl mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-12 flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="relative w-full flex flex-row-reverse lg:block order-1 lg:order-2"
              >
                <div className="lg:absolute right-10 w-full h-[250px] lg:h-[24vw] xl:h-[21vw] overflow-hidden lg:translate-x-[2vw] lg:-translate-y-[2vw] ml-4 lg:ml-0">
                  <div className="relative w-full h-full">
                    {[Ellipse1, Ellipse2, Ellipse3, Ellipse4].map((img, index) => {
                      const sizes = [
                        'w-[34px] h-[34px] md:w-[44px] md:h-[44px] lg:w-[54px] lg:h-[54px]',
                        'w-[64px] h-[64px] md:w-[78px] md:h-[78px] lg:w-[94px] lg:h-[94px]',
                        'w-[54px] h-[54px] md:w-[66px] md:h-[66px] lg:w-[82px] lg:h-[82px]',
                        'w-[44px] h-[44px] md:w-[54px] md:h-[54px] lg:w-[66px] lg:h-[66px]',
                      ]
                      const positions = ['right-20', 'right-0', 'right-12', 'right-0']

                      return (
                        <div
                          key={img}
                          className={`absolute ${positions[index]} ${sizes[index]} rounded-full overflow-hidden border-2 border-white shadow-lg`}
                          style={{
                            animation: `floatUp 8s linear infinite ${index * 1.8}s`,
                            bottom: '-100px',
                            zIndex: 4 - index,
                            willChange: 'transform, opacity, bottom',
                            animationFillMode: 'both',
                          }}
                        >
                          <img
                            src={img}
                            alt={`Customer ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="relative z-10 max-w-xl lg:pr-12">
                  <h4 className="font-semibold text-base md:text-lg text-gray-900 mb-5">What others think</h4>
                  <h2 className="font-bold text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-tight">
                    What our customers are saying about us?
                  </h2>
                  <p className="mt-5 text-gray-600 text-base md:text-lg">
                    See what EcoMart shoppers say about their experience with our sustainable marketplace.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.08 }}
                className="relative max-w-2xl mx-auto lg:mx-0 flex items-start gap-5 order-2 lg:order-1 mt-4 lg:mt-0"
              >
                <div className="flex flex-col gap-4 mt-8">
                  <button
                    onClick={handlePrevTestimonial}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <ArrowUp className="w-5 h-5 text-black" />
                  </button>
                  <button
                    onClick={handleNextTestimonial}
                    className="w-10 h-10 rounded-full bg-black border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-800 transition-colors"
                    aria-label="Next testimonial"
                  >
                    <ArrowDown className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="bg-white rounded-2xl pt-6 px-6 md:px-8 pb-8 shadow-lg border border-gray-100 flex-1 min-w-0">
                  <div className={`flex flex-col items-start mb-4 -mt-12 transition-all duration-500 ${isTestimonialTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md mb-3">
                      <img
                        key={currentTestimonial.id}
                        src={currentTestimonial.image}
                        alt={currentTestimonial.name}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${isTestimonialTransitioning ? 'opacity-0' : 'opacity-100'}`}
                      />
                    </div>

                    <div className="w-full">
                      <h4 className="font-bold text-gray-900 text-left">{currentTestimonial.name}</h4>
                      <p className="text-xs uppercase tracking-[0.12em] text-lime-700 mt-0.5">{currentTestimonial.location}</p>
                      <div className="flex gap-1 justify-start mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < currentTestimonial.rating ? 'fill-[#F6973F] text-[#F6973F]' : 'fill-gray-300 text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className={`text-gray-600 text-sm md:text-base leading-relaxed transition-all duration-500 ${isTestimonialTransitioning ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                    &quot;{currentTestimonial.text}&quot;
                  </p>
                </div>
              </motion.div>
            </div>

            <style>{`
              @keyframes floatUp {
                0% {
                  transform: translateY(0) scale(0.95);
                  opacity: 0;
                  bottom: -100px;
                }
                5% {
                  opacity: 0.9;
                }
                10% {
                  opacity: 1;
                }
                80% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
                90% {
                  opacity: 0.8;
                  transform: translateY(-5px) scale(1.02);
                }
                100% {
                  transform: translateY(-10px) scale(1.05);
                  bottom: 100%;
                  opacity: 0;
                }
              }
            `}</style>
          </motion.div>
        </section>
      </main>
    </div>
  )
}