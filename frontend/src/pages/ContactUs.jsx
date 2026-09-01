import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, ChevronDown, Clock3, Leaf, Mail, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react'

const contactCards = [
	{
		title: 'Customer Care',
		text: 'Questions about products, orders, or delivery can be sent directly to our support team.',
		detail: 'hello@ecomart.lk',
		icon: Mail,
		delay: 0,
	},
	{
		title: 'Call Us',
		text: 'For urgent support, our team is available during business hours to help quickly.',
		detail: '+94 11 234 5678',
		icon: Phone,
		delay: 0.1,
	},
	{
		title: 'Office Hours',
		text: 'Visit or call us during our support window for faster assistance and direct guidance.',
		detail: 'Mon - Fri\n9:00 AM - 6:00 PM',
		icon: Clock3,
		delay: 0.15,
	},
	{
		title: 'Visit Our Office',
		text: 'We are based in Colombo and welcome business, vendor, and partnership inquiries.',
		detail: 'Colombo 03, Sri Lanka',
		icon: MapPin,
		delay: 0.2,
	},
]

const benefits = [
	'Fast responses for order and delivery questions',
	'Help with product recommendations and category guidance',
	'Vendor onboarding and partnership support',
	'Clear updates on returns, refunds, and service issues',
]

const formSubjects = [
	'General enquiry',
	'Order support',
	'Product question',
	'Vendor partnership',
	'Feedback',
]

const contactSectionText = {
	heading: 'We make it easy to reach Eco Mart',
	description:
		'Whether you are shopping for sustainable essentials or looking to partner with us, our team is ready to respond with practical support and clear answers.',
	whyReachOutTitle: 'Why people contact us',
}

const formFields = {
	name: 'Your name',
	email: 'Email address',
	subject: 'Select a subject',
	message: 'Write your message',
	submitButton: 'Send Message',
}

const mapSection = {
	title: 'Find Eco Mart',
	mapEmbedUrl:
		'https://www.google.com/maps?q=Colombo%2003%20Sri%20Lanka&output=embed',
}

const contactInfoTitle = 'Get in touch with Eco Mart'
const formTitle = 'Tell us what you need and we will point you in the right direction'

export default function ContactPage() {
	return (
		<div className="min-h-screen bg-[#F6F7F2] selection:bg-lime-500 selection:text-white">
			<main className="mb-0">
				<section className="px-4 md:px-6 lg:px-8 pt-4 pb-12 max-w-8xl mx-auto">
					<div className="relative h-[72vh] min-h-[540px] overflow-hidden rounded-[2rem] border border-white/60 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
						<div
							className="absolute inset-0 bg-cover bg-center"
							style={{
								backgroundImage:
									"url('https://images.unsplash.com/photo-1758272133604-f19405bdf108?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
							}}
						/>
						<div className="absolute inset-0 bg-gradient-to-br from-[#0B120E]/80 via-[#0B120E]/55 to-[#0B120E]/75" />
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.16),transparent_30%)]" />

						<div className="relative h-full flex items-center">
							<div className="max-w-4xl px-6 sm:px-10 lg:px-14">
								<motion.div
									initial={{ opacity: 0, y: 36 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, ease: 'easeOut' }}
									className="max-w-3xl"
								>
									<h1 className="mt-6 text-3xl md:text-5xl lg:text-7xl font-inter font-bold tracking-tight text-white leading-none">
										Get in touch
										<span className="block mt-2 text-lime-300">with Eco Mart</span>
									</h1>
									<p className="mt-6 max-w-2xl text-base md:text-lg text-white/80 leading-relaxed">
										Reach our team for product help, delivery questions, vendor partnerships, or anything related to your sustainable shopping experience.
									</p>
									<div className="mt-8 flex flex-wrap gap-3">
										<a href="mailto:hello@ecomart.lk" className="inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] text-white px-6 py-3 text-sm font-inter font-bold uppercase tracking-wider transition-colors hover:bg-gray-800">
											<Mail size={16} /> Email support
										</a>
										<a href="tel:+94112345678" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-inter font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-white/10">
											<Phone size={16} /> Call now
										</a>
									</div>
								</motion.div>
							</div>
						</div>
					</div>
				</section>

				<section className="py-8 md:py-16 px-4 md:px-6 lg:px-8">
					<div className="container mx-auto">
						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="text-3xl md:text-5xl font-bold text-[#1E1E1E] text-center mb-12"
						>
							{contactInfoTitle}
						</motion.h2>

						<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
							{contactCards.map((card) => (
								<motion.div
									key={card.title}
									initial={{ opacity: 0, y: 24 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: card.delay, duration: 0.5 }}
									whileHover={{ y: -4 }}
									className="rounded-[1.75rem] bg-[#111311] p-8 text-white shadow-[0_18px_45px_-24px_rgba(0,0,0,0.55)]"
								>
									<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-300 ring-1 ring-lime-400/20">
										<card.icon size={22} />
									</div>
									<h3 className="mt-5 text-xl font-semibold">{card.title}</h3>
									<p className="mt-3 text-sm leading-7 text-white/72">{card.text}</p>
									<div className="mt-8 text-sm font-medium text-lime-200 whitespace-pre-line">{card.detail}</div>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				<section className="px-4 md:px-6 lg:px-8 py-10 md:py-16 overflow-hidden">
					<div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-14 items-start">
						<motion.div
							className="lg:col-span-2 relative min-h-[560px] overflow-hidden rounded-[2rem] shadow-[0_25px_60px_-35px_rgba(0,0,0,0.45)]"
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true, amount: 0.2 }}
							transition={{ duration: 0.7 }}
						>
							<div
								className="absolute inset-0 bg-cover bg-center"
								style={{
									backgroundImage:
										"url('https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1400&auto=format&fit=crop')",
								}}
							/>
							<div className="absolute inset-0 bg-gradient-to-br from-[#0C120E]/75 via-[#0C120E]/45 to-[#0C120E]/70" />
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.26),transparent_40%)]" />

							<div className="relative z-10 p-6 md:p-8 lg:p-10 h-full flex flex-col justify-between">
								<div>
									<h3 className="text-2xl md:text-3xl font-semibold text-white leading-tight">{formTitle}</h3>
									<p className="mt-3 max-w-lg text-white/80 leading-relaxed">
										Share a few details and we will direct your message to the right Eco Mart team member.
									</p>
								</div>

								<div className="mt-8 rounded-[1.75rem] border border-white/15 bg-white/10 backdrop-blur-md p-5 md:p-6">
									<form className="space-y-5">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<input
												type="text"
												placeholder={formFields.name}
												className="w-full rounded-full border border-white/20 bg-white/15 px-5 py-3 text-white placeholder:text-white/65 outline-none transition focus:border-lime-300/60"
											/>
											<input
												type="email"
												placeholder={formFields.email}
												className="w-full rounded-full border border-white/20 bg-white/15 px-5 py-3 text-white placeholder:text-white/65 outline-none transition focus:border-lime-300/60"
											/>
										</div>

										<div className="relative">
											<select className="w-full appearance-none rounded-full border border-white/20 bg-white/15 px-5 py-3 pr-12 text-white outline-none transition focus:border-lime-300/60">
												<option className="text-gray-800">{formFields.subject}</option>
												{formSubjects.map((subject) => (
													<option key={subject} className="text-gray-800">
														{subject}
													</option>
												))}
											</select>
											<ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/80" />
										</div>

										<textarea
											rows={5}
											placeholder={formFields.message}
											className="w-full rounded-[1.5rem] border border-white/20 bg-white/15 px-5 py-4 text-white placeholder:text-white/65 outline-none transition focus:border-lime-300/60 resize-none"
										/>

										<button
											type="button"
											className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-4 font-bold uppercase tracking-wider text-black transition-colors hover:bg-lime-300"
										>
											{formFields.submitButton}
										</button>
									</form>
								</div>
							</div>
						</motion.div>

						<motion.div
							className="lg:col-span-2 space-y-8"
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true, amount: 0.2 }}
							transition={{ duration: 0.7 }}
						>
							<div>
								<h2 className="text-3xl md:text-5xl font-bold text-[#1E1E1E] leading-tight">{contactSectionText.heading}</h2>
								<p className="mt-5 text-lg leading-8 text-[#5C5F58]">{contactSectionText.description}</p>
							</div>

							<div className="space-y-6">
								<h3 className="text-2xl font-semibold text-[#1E1E1E]">{contactSectionText.whyReachOutTitle}</h3>
								<ul className="space-y-4">
									{benefits.map((item) => (
										<li key={item} className="flex items-start gap-3 rounded-2xl bg-white p-4 border border-[#E5E8DE]">
											<CheckCircle className="mt-0.5 h-6 w-6 text-lime-600 shrink-0" />
											<span className="text-[#23261F] leading-7">{item}</span>
										</li>
									))}
								</ul>
							</div>
						</motion.div>
					</div>
				</section>

				<section className="px-4 md:px-6 lg:px-8 pt-8 pb-4 md:pb-10">
					<div className="container mx-auto">
						<motion.h2
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="text-3xl md:text-5xl font-bold text-[#1E1E1E] text-center mb-10"
						>
							{mapSection.title}
						</motion.h2>
						<motion.div
							initial={{ opacity: 0, scale: 0.96 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.75 }}
							className="w-full h-[420px] overflow-hidden rounded-[2rem] border border-[#E4E8DC] shadow-[0_25px_60px_-38px_rgba(0,0,0,0.45)]"
						>
							<iframe
								title="Eco Mart location"
								src={mapSection.mapEmbedUrl}
								width="100%"
								height="100%"
								style={{ border: 0 }}
								allowFullScreen
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
							/>
						</motion.div>
					</div>
				</section>
			</main>
		</div>
	)
}
