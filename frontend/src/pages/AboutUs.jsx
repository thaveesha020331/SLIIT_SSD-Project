import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Handshake, Recycle, ShieldCheck, Truck } from 'lucide-react'
import hero from '@/assets/AboutHero.png'
import mission from '@/assets/Mission.png'
import choose from '@/assets/Choose.png'
import vision from '@/assets/Vision.png'
import know from '@/assets/KnowAbout.png'

const JourneyStats = ({ destinationsSearched = '34K', successfulTrips = 400, travelExperts = 50 }) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
			<div className="rounded-2xl bg-white/10 p-4 md:p-5 backdrop-blur-sm border border-white/10">
				<p className="text-3xl md:text-4xl font-inter font-semibold text-white mb-1">{destinationsSearched}+</p>
				<p className="text-white/70 text-sm font-inter">Eco Products Searched</p>
			</div>
			<div className="rounded-2xl bg-white/10 p-4 md:p-5 backdrop-blur-sm border border-white/10">
				<p className="text-3xl md:text-4xl font-inter font-semibold text-white mb-1">{successfulTrips}+</p>
				<p className="text-white/70 text-sm font-inter">Successful Orders</p>
			</div>
			<div className="rounded-2xl bg-white/10 p-4 md:p-5 backdrop-blur-sm border border-white/10">
				<p className="text-3xl md:text-4xl font-inter font-semibold text-white mb-1">{travelExperts}+</p>
				<p className="text-white/70 text-sm font-inter">Local Vendors</p>
			</div>
		</div>
	)
}

const featureItems = [
	{
		icon: ShieldCheck,
		title: 'Trusted Green Standards',
		description: 'Every listed item is reviewed for sourcing transparency, practical quality, and better everyday use.',
	},
	{
		icon: Truck,
		title: 'Fast Local Delivery',
		description: 'Eco Mart prioritizes nearby suppliers to reduce travel emissions while getting products to customers faster.',
	},
	{
		icon: Recycle,
		title: 'Low-Waste Packaging',
		description: 'We encourage reusable, recyclable, and biodegradable packaging choices across our marketplace partners.',
	},
	{
		icon: Handshake,
		title: 'Support Local Communities',
		description: 'Every purchase helps local producers and sustainable small businesses grow with stronger demand.',
	},
]

const AboutUsPage = () => {
	return (
		<div className="min-h-screen flex flex-col overflow-x-hidden bg-white font-sans selection:bg-lime-500 selection:text-white">
			{/* Hero Section */}
			<motion.section
				className="px-4 md:px-6 lg:px-8 pt-4 pb-12 bg-white"
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.25 }}
				transition={{ duration: 0.75, ease: 'easeOut' }}
			>
				<div className="max-w-8xl mx-auto">
					<motion.div
						className="rounded-[3rem] relative overflow-hidden h-[800px] md:h-[560px] 2xl:h-[500px] flex items-center justify-center text-center"
						initial={{ opacity: 0, scale: 0.97 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true, amount: 0.3 }}
						transition={{ duration: 0.8, ease: 'easeOut' }}
						style={{
							backgroundImage: `url(${hero})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
						}}
					>
						<div className="absolute inset-0 bg-[#0F1D14]/55"></div>
						<div className="relative z-10 max-w-4xl mx-auto text-white">
							<motion.h1
								className="text-3xl md:text-5xl lg:text-6xl font-inter font-bold mb-6"
								initial={{ opacity: 0, y: 24 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.4 }}
								transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
							>
								Where Smart Shopping Meets Sustainable Living
							</motion.h1>
							<motion.p
								className="text-md md:text-lg font-inter font-normal leading-relaxed text-white/80"
								initial={{ opacity: 0, y: 24 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.4 }}
								transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
							>
								Eco Mart is more than a marketplace. It is a practical way to discover products that are better for your home, your routine, and the planet. We bring together trusted local vendors, eco-conscious essentials, and reliable delivery in one simple experience so shopping feels easier and more intentional.
							</motion.p>
						</div>
					</motion.div>
				</div>
			</motion.section>

			{/* Know About Us Section */}
			<motion.section
				className="relative bg-white py-16 md:py-16 px-4 md:px-6 lg:px-8"
				initial={{ opacity: 0, y: 34 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.25 }}
				transition={{ duration: 0.75, ease: 'easeOut' }}
			>
				<div className="container mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<motion.div
							className="relative w-full max-w-xl mx-auto lg:mx-0 order-2 lg:order-1"
							initial={{ opacity: 0, x: -45, scale: 0.98 }}
							whileInView={{ opacity: 1, x: 0, scale: 1 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.8, ease: 'easeOut', delay: 0.06 }}
						>
							<img src={know} alt="Eco Mart sustainable products" className="w-full h-full rounded-none mt-10 2xl:mt-0" />
						</motion.div>

						<motion.div
							className="max-w-2xl mx-auto lg:mx-0 order-1 lg:order-2 lg:pl-12 -mt-12 2xl:mt-0"
							initial={{ opacity: 0, x: 45 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
						>
							<motion.div
								className="mb-6"
								initial={{ opacity: 0, y: 18 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.4 }}
								transition={{ duration: 0.55, ease: 'easeOut', delay: 0.18 }}
							>
								<div className="flex items-center gap-2">
									<div className="w-14 h-[2px] bg-lime-600"></div>
									<span className="text-black text-sm font-inter font-bold tracking-widest">KNOW ABOUT US</span>
								</div>
							</motion.div>
							<motion.h1
								className="text-4xl md:text-5xl font-inter font-bold text-black mb-8 leading-tight"
								initial={{ opacity: 0, y: 18 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.4 }}
								transition={{ duration: 0.6, ease: 'easeOut', delay: 0.24 }}
							>
								A Better Way to Shop for Daily Life
							</motion.h1>
							<motion.p
								className="text-black text-lg font-inter font-bold mb-6"
								initial={{ opacity: 0, y: 18 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.4 }}
								transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
							>
								Eco Mart helps customers find better products without sacrificing convenience. We bring together eco-friendly essentials, trusted local brands, and thoughtfully sourced items in one simple marketplace.
							</motion.p>
							<motion.p
								className="text-black/60 font-inter font-regular text-lg"
								initial={{ opacity: 0, y: 18 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.4 }}
								transition={{ duration: 0.6, ease: 'easeOut', delay: 0.36 }}
							>
								Our platform is built to make conscious shopping clear and accessible. Whether you are choosing reusable home goods, cleaner personal care items, or everyday products from responsible sellers, we keep the experience straightforward and dependable from start to finish.
							</motion.p>

							<motion.div
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, amount: 0.4 }}
								transition={{ duration: 0.55, ease: 'easeOut', delay: 0.42 }}
							>
								<Link to="/products" className="inline-block mt-6">
								<button className="bg-[#0D0D0D] text-white px-8 py-4 rounded-full text-sm font-bold tracking-wider hover:bg-gray-800 transition-colors uppercase shadow-lg">
									Explore More
								</button>
								</Link>
							</motion.div>
						</motion.div>
					</div>
				</div>
			</motion.section>

			{/* Vision Section */}
			<motion.section 
				className="relative bg-white py-16 md:py-16 px-4 md:px-6 lg:px-8"
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: false, margin: "-10% 0px" }}
				transition={{ duration: 0.8, ease: "easeOut" }}
			>
				<div className="container mx-auto">
					<div className="flex flex-col lg:flex-row-reverse gap-12 items-center">
						{/* Right Side - Image with overlap */}
						<motion.div 
							className="lg:w-2/3 -mt-12 2xl:mt-0 relative z-10"
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: false }}
							transition={{ duration: 0.8, delay: 0.1 }}
						>
							<div className="relative overflow-hidden rounded-3xl" style={{ maxHeight: '400px' }}>
								<img 
									src={vision} 
									alt="Our Vision"
									className="w-full h-full object-cover object-center"
									style={{ maxHeight: '100%', objectFit: 'cover', borderRadius: '1rem' }}
								/>
							</div>
						</motion.div>
						
						{/* Left Side - Content */}
						<motion.div 
							className="lg:w-1/2 lg:pr-16 2xl:-mt-24"
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: false }}
							transition={{ duration: 0.8, delay: 0.2 }}
						>
							<motion.div 
								className="mb-6"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false }}
								transition={{ duration: 0.6, delay: 0.3 }}
							>
								<div className="flex items-center">
									<span className="text-black text-sm font-inter font-bold tracking-widest">OUR VISION</span>
								</div>
							</motion.div>
							<motion.h2 
								className="text-3xl md:text-4xl font-inter font-bold text-black mb-6 leading-tight"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false }}
								transition={{ duration: 0.6, delay: 0.4 }}
							>
								To inspire meaningful eco-conscious shopping across the globe
							</motion.h2>
							<motion.p 
								className="text-black/70 font-inter italic text-lg mb-0"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false }}
								transition={{ duration: 0.6, delay: 0.5 }}
							>
								To become a trusted symbol of sustainable, affordable, and practical everyday shopping —
							</motion.p>
							<motion.p 
								className="text-black/70 font-inter italic text-lg mb-0"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false }}
								transition={{ duration: 0.6, delay: 0.6 }}
							>
								where every purchase supports a cleaner future and a better local economy.
							</motion.p>
						</motion.div>
					</div>
				</div>
			</motion.section>

			{/* Mission Section */}
			<motion.section 
				className="relative bg-white pt-0 pb-8 md:pt-0 md:pb-24 mt-0 2xl:-mt-28 px-4 md:px-6 lg:px-8"
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: false, margin: "-10% 0px" }}
				transition={{ duration: 0.8, ease: "easeOut" }}
			>
				<div className="container mx-auto">
					<div className="flex flex-col lg:flex-row gap-12 items-center">
						{/* Left Side - Image */}
						<motion.div 
							className="lg:w-2/3 relative z-10"
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: false }}
							transition={{ duration: 0.8, delay: 0.1 }}
						>
							<div className="relative overflow-hidden rounded-3xl" style={{ maxHeight: '400px' }}>
								<img 
									src={mission} 
									alt="Our Mission"
									className="w-full h-full object-cover object-center"
									style={{ maxHeight: '100%', objectFit: 'cover', borderRadius: '1rem' }}
								/>
								{/* Subtle overlay on image */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
							</div>
						</motion.div>
						
						{/* Right Side - Content */}
						<motion.div 
							className="lg:w-1/2 lg:pl-16 2xl:mt-12"
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: false }}
							transition={{ duration: 0.8, delay: 0.2 }}
						>
							<motion.div 
								className="mb-6"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false }}
								transition={{ duration: 0.6, delay: 0.3 }}
							>
								<div className="flex items-center">
									<span className="text-black text-sm font-inter font-bold tracking-widest">OUR MISSION</span>
								</div>
							</motion.div>
							<motion.h2 
								className="text-3xl md:text-4xl font-inter font-bold text-black mb-6 leading-tight"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false }}
								transition={{ duration: 0.6, delay: 0.4 }}
							>
								We make greener choices easy, affordable, and practical
							</motion.h2>
							<motion.p 
								className="text-black/70 font-inter italic text-lg mb-0"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false }}
								transition={{ duration: 0.6, delay: 0.5 }}
							>
								To connect shoppers with reliable eco-friendly products and local vendors they can trust —
							</motion.p>
							<motion.p 
								className="text-black/70 font-inter italic text-lg mb-0"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: false }}
								transition={{ duration: 0.6, delay: 0.6 }}
							>
								where conscious buying feels natural in everyday life, not complicated or exclusive.
							</motion.p>
						</motion.div>
					</div>
				</div>
			</motion.section>
			
			{/* Choose Eco Mart Section */}
			<motion.section 
				className="relative bg-white z-0 px-4 md:px-6 lg:px-8"
				initial={{ opacity: 0, x: -50 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: false, margin: '-100px' }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className="container mx-auto py-16 md:py-24 -mt-20">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 2xl:gap-32 items-center">
						{/* Left Content */}
						<div className="max-w-xl mx-auto lg:mx-0">
							<h2 className="text-3xl sm:text-4xl lg:text-5xl font-inter font-medium text-black leading-tight mb-6">
								Choose Eco Mart with Our Expert Services
							</h2>

							<p className="text-[#454545] text-lg mb-4 font-inter font-regular">
								Discover the benefits that set us apart and make your shopping experience smoother, cleaner, and more enjoyable.
							</p>

							<div className="space-y-4 mb-8">
								{featureItems.map((item) => (
									<div key={item.title} className="mb-6">
										<div className="flex items-start">
											<div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2F4734] flex items-center justify-center mt-1">
												<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
												</svg>
											</div>
											<p className="ml-3 text-black font-inter font-medium">{item.title}</p>
										</div>
										<p className="text-[#454545] text-sm mt-1 ml-9">{item.description}</p>
									</div>
								))}
							</div>

							<Link to="/products" className="inline-block">
								<button className="bg-[#0D0D0D] text-white px-8 py-4 rounded-full text-sm font-bold tracking-wider hover:bg-gray-800 transition-colors uppercase shadow-lg">
									Start Shopping Sustainably
								</button>
							</Link>
						</div>

						{/* Right Image */}
						<div className="relative w-full max-w-2xl mx-auto px-0 mt-10 2xl:mt-0">
							<img 
								src={choose}
								alt="Why choose Eco Mart"
								className="w-full h-auto rounded-none 2xl:scale-[1.1]"
							/>
						</div>
					</div>
				</div>
			</motion.section>

		</div>
	)
}

export default AboutUsPage
