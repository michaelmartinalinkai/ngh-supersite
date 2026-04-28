import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Uluwatu Paradise: A Thoughtfully Designed Development in South Bali — NGH Property Group',
  description: '24 full-service apartments featuring a private gym, sauna, co-working space, and shared rooftop with ocean views. Built on Dutch construction standards in Bali\'s most desirable location.',
}

export default function UluwatuParadiseDevelopment() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#1F1F1F' }}>
      {/* Hero */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <Image
          src="/images/content-07.jpg"
          alt="Uluwatu Paradise Development"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(31,31,31,0.3), rgba(31,31,31,0.8))' }} />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-4xl mx-auto">
            <span className="text-xs tracking-[0.2em] uppercase mb-4 block" style={{ color: '#C6A96C' }}>
              Development
            </span>
            <h1 className="text-3xl md:text-5xl font-light leading-tight mb-4" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>
              Uluwatu Paradise: A Thoughtfully Designed Development in South Bali
            </h1>
            <span className="text-sm" style={{ color: '#8A8F83' }}>April 1, 2026</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="prose prose-invert prose-lg" style={{ color: '#D4D0C8' }}>

          <p className="text-xl font-light leading-relaxed mb-8" style={{ color: '#F5F3EE', fontFamily: 'var(--font-serif)' }}>
            Uluwatu Paradise is created for those who see Bali not as a destination, but as a place to build a lifestyle. Set in one of the island&apos;s most desirable locations, this project blends contemporary design with the calm rhythm of island living.
          </p>

          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>The Vision</h2>
          <p className="mb-6 leading-relaxed">
            24 full-service apartments featuring a private gym, sauna, co-working space, and a shared rooftop with ocean views — designed for a seamless balance between productivity, relaxation, and the Bali lifestyle.
          </p>
          <p className="mb-6 leading-relaxed">
            Rooted in Dutch development standards and executed with deep local expertise, Uluwatu Paradise reflects a clear vision: quality over shortcuts, structure over trends, and homes designed to last. It is a place where modern comfort meets the spirit of the island.
          </p>

          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Prime Location</h2>
          <p className="mb-6 leading-relaxed">
            Centrally located along the road to Balangan Beach, Uluwatu Paradise makes all of southern Bali&apos;s beautiful beaches accessible. With stunning ocean views and modern design, it&apos;s the perfect base to enjoy everything Bali has to offer.
          </p>
          <p className="mb-6 leading-relaxed">
            Uluwatu is a coastal area in South Bali known for its dramatic cliffs, panoramic ocean views, and growing international appeal. The area attracts a mix of surfers, remote professionals, and lifestyle-oriented residents, making it one of the most structured and consistently in-demand regions on the island.
          </p>
          <p className="mb-6 leading-relaxed">
            The location is exceptionally convenient, with easy access to Jimbaran Bay (famous for its seafood), Nusa Dua, and Seminyak. Ngurah Rai International Airport is just 20&ndash;30 minutes away.
          </p>

          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Design Philosophy</h2>
          <p className="mb-6 leading-relaxed">
            Step into your private paradise in Uluwatu, where modern comfort meets traditional Balinese charm. Every apartment is designed with warm, earthy tones that create a welcoming, relaxing atmosphere.
          </p>
          <p className="mb-6 leading-relaxed">
            The interior features natural textures that create a soothing atmosphere. With its cozy, comfortable design, it&apos;s the ideal space to unwind after a day of exploring. Large windows frame breathtaking views of Bali&apos;s lush landscapes, allowing you to enjoy the serenity of the island from the comfort of your own home.
          </p>

          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Unit Types</h2>

          <div className="rounded-xl p-8 mb-8" style={{ backgroundColor: 'rgba(198,169,108,0.1)', border: '1px solid rgba(198,169,108,0.2)' }}>
            <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'var(--font-serif)', color: '#C6A96C' }}>1 Bedroom Apartment — &euro;112,500</h3>
            <p className="mb-4 leading-relaxed">The one-bedroom unit offers a clear separation between living and sleeping areas, providing more comfort and privacy. At 45m&sup2;, it&apos;s ideal for longer stays or residents who value additional comfort, such as remote workers or couples.</p>
            <ul className="space-y-2 text-sm">
              <li>Separate bedroom &amp; dedicated living area</li>
              <li>Full kitchen &amp; luxury bathroom</li>
              <li>Marble flooring &amp; balcony</li>
              <li>Sauna, co-working, gym &amp; pool access</li>
              <li>28 years leasehold &bull; 15% expected ROI</li>
            </ul>
          </div>

          <div className="rounded-xl p-8 mb-8" style={{ backgroundColor: 'rgba(198,169,108,0.1)', border: '1px solid rgba(198,169,108,0.2)' }}>
            <h3 className="text-xl font-light mb-4" style={{ fontFamily: 'var(--font-serif)', color: '#C6A96C' }}>2 Bedroom Apartment — &euro;265,000</h3>
            <p className="mb-4 leading-relaxed">The most spacious option within the project at 100m&sup2;, designed for shared living or family use while maintaining privacy.</p>
            <ul className="space-y-2 text-sm">
              <li>Two separate bedrooms &amp; spacious living area</li>
              <li>Full kitchen &amp; two luxury bathrooms</li>
              <li>Marble flooring &amp; balcony with sea view</li>
              <li>High ceilings &amp; premium finishes</li>
              <li>28 years leasehold &bull; 15% expected ROI</li>
            </ul>
          </div>

          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Shared Amenities</h2>
          <p className="mb-6 leading-relaxed">
            Every resident enjoys access to premium shared facilities designed to enhance daily life:
          </p>
          <ul className="space-y-3 mb-8">
            <li>Fitness suite with modern equipment</li>
            <li>Private sauna for relaxation and recovery</li>
            <li>Swimming pool &amp; jacuzzi</li>
            <li>Rooftop terrace with panoramic ocean views</li>
            <li>Co-working space for remote professionals</li>
          </ul>

          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Investment Details</h2>
          <p className="mb-6 leading-relaxed">
            Based on 85% occupancy at &euro;120/night in high season and &euro;80/night in low season, the projected net monthly income for a 1-bedroom apartment is &euro;1,530 after management fees and taxes — translating to &euro;18,360 annually and a payback period of 6&ndash;7 years.
          </p>

          <div className="rounded-xl p-8 mb-8" style={{ backgroundColor: 'rgba(198,169,108,0.1)', border: '1px solid rgba(198,169,108,0.2)' }}>
            <h3 className="text-lg font-light mb-4" style={{ color: '#C6A96C' }}>Payment Structure</h3>
            <ul className="space-y-2 text-sm">
              <li>30% initial payment upon contract signing</li>
              <li>30% due three months after signing</li>
              <li>40% at delivery</li>
              <li>2% discount for full upfront payment</li>
              <li>Reservation fee: &euro;1,500 (14-day fully refundable cooling-off period)</li>
              <li>10-year structural warranty</li>
            </ul>
          </div>

          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>About NGH Property Group</h2>
          <p className="mb-6 leading-relaxed">
            At NGH Property Group, we bring over 10 years of experience in real estate, investment, and construction to Bali&apos;s growing property market. Our mission is simple: to create high-quality, beautifully designed properties that are accessible to all types of investors.
          </p>
          <p className="mb-6 leading-relaxed">
            What makes us different is our mix of European expertise and strong local connections. We understand what international investors need and know how to navigate Bali&apos;s property market with ease. What we quote is what you pay. What we promise is what we deliver.
          </p>

          <div className="mt-16 pt-8 border-t" style={{ borderColor: 'rgba(198,169,108,0.2)' }}>
            <p className="text-sm mb-4" style={{ color: '#8A8F83' }}>
              Interested in Uluwatu Paradise? Book a consultation with our team.
            </p>
            <a
              href="https://calendly.com/nghpropertygroup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 rounded-full text-sm tracking-wider uppercase transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: '#C6A96C', color: '#1F1F1F' }}
            >
              Book a Consultation
            </a>
          </div>
        </div>

        <div className="mt-16">
          <Link href="/#insights" className="text-sm transition-colors duration-300 hover:opacity-80" style={{ color: '#C6A96C' }}>
            &larr; Back to Insights
          </Link>
        </div>
      </article>
    </main>
  )
}
