import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cafes and Restaurants Near Uluwatu Paradise — NGH Property Group',
  description: 'Discover the best cafes, restaurants, beach clubs, and wellness spots near Uluwatu Paradise. From specialty coffee to clifftop dining, explore the Uluwatu lifestyle.',
}

export default function CafesRestaurantsUluwatu() {
  const cafes = [
    { name: 'Ula Cafe', time: '1 min', desc: 'A stylish cafe known for its modern design and relaxed tropical atmosphere. Specialty coffee, brunch dishes, and light meals.', best: 'Brunch, remote work, casual meetings' },
    { name: 'Tarabelle', time: '3 mins', desc: 'Stylish and modern cafe with a relaxed atmosphere, known for its aesthetic design and quality brunch menu. Features a small playground for kids and allows dogs in the outdoor area.', best: 'Brunch, couples, families, pet-friendly' },
    { name: 'Artisan Ungasan', time: '3 mins', desc: 'A cafe known for its artisanal coffee and freshly prepared brunch dishes. Relaxed and welcoming atmosphere.', best: 'Coffee, brunch, casual meetings' },
    { name: 'Milk & Madu Uluwatu', time: '15 mins', desc: 'A lively cafe known for its relaxed brunch atmosphere and international menu. Popular with families, surfers, and remote workers.', best: 'Families, brunch, casual meetups' },
    { name: 'The LOFT', time: '17 mins', desc: 'Well-known for reliable breakfast and a comfortable working environment.', best: 'Remote work, breakfast, brunch' },
    { name: 'Drifter Cafe', time: '17 mins', desc: 'Laid-back, surf-inspired environment. Suitable for longer stays with specialty coffee and healthy food.', best: 'Surfers, remote work, long stays' },
  ]

  const restaurants = [
    { name: 'Gooseberry', time: '15 mins', desc: 'A refined French restaurant set in a stylish tropical garden, offering an upscale and intimate dining experience. Known for elegant atmosphere and quality cuisine.', best: 'Couples, date nights, quiet dinners' },
    { name: 'Ours Bali', time: '18 mins', desc: 'Strong design and consistent menu. Works for both casual lunches and dinners.', best: 'Casual dining, social gatherings' },
  ]

  const beachClubs = [
    { name: 'Savaya', desc: 'High-end cliffside venue known for large-scale events, ocean views, and an exclusive atmosphere.', url: 'savaya.com' },
    { name: 'White Rock Beach Club', desc: 'Modern beach club with a focus on music, poolside lounging, and a younger, energetic crowd.', url: 'whiterockbali.com' },
    { name: 'Tropical Temptation', desc: 'Design-forward beach club combining lifestyle, dining, and relaxed day-to-night transitions on Melasti Beach.', url: 'ttbeach.club' },
    { name: 'El Kabron', desc: 'Spanish-inspired cliff club offering sunset views, seafood, and a more intimate, lounge-style setting.', url: 'elkabron.com' },
    { name: 'Single Fin', desc: 'Legendary surf bar perched on the cliffs of Uluwatu. Famous for its Sunday sessions and panoramic ocean views.', url: 'singlefinbali.com' },
    { name: 'Palmilla Bali', desc: 'Bohemian-style beach experience on Melasti Beach with a relaxed, social atmosphere.', url: '' },
  ]

  const spas = [
    { name: 'Massage Ungasan', time: '3 mins', services: 'Body massage, waxing, facials, nails' },
    { name: 'LOA Spa', time: '3 mins', services: 'Balinese massage, flower bath' },
    { name: 'Laia Cafe & Spa', time: '3 mins', services: 'Balinese massage, deep tissue, shiatsu, facials, hot stone, aromatherapy' },
    { name: 'SEAN Spa Ungasan', time: '3 mins', services: '#1 Spa in Ungasan-Jimbaran-Balangan. Massage, spa, nail studio' },
    { name: 'Spring Spa Uluwatu', time: '25 mins', services: 'Massage, facial, spa, nails, hair, brow & lashes' },
    { name: 'The Istana Wellness', time: '30 mins', services: 'Hyperbaric chambers, cryotherapy, ice baths, sauna, breathwork, yoga, restaurant' },
  ]

  const attractions = [
    { name: 'Garuda Wisnu Kencana (GWK) Cultural Park', desc: 'Iconic cultural park featuring the massive GWK statue, Balinese dance performances, shopping, and restaurants.' },
    { name: 'Uluwatu Kecak Dance', desc: 'Experience the mesmerizing traditional Kecak dance performance at the stunning Uluwatu Temple, set against the backdrop of a cliff-top sunset.' },
    { name: 'Tanjung Benoa Watersports', desc: 'Bali\'s top water sports destination: banana boat, jet ski, parasailing, scuba diving, snorkeling, and boat rides to Turtle Island.' },
    { name: 'Water Blow Nusa Dua', desc: 'A natural phenomenon where waves crash into the reef at high tide, creating spectacular splashes reaching several meters high.' },
  ]

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#1F1F1F' }}>
      {/* Hero */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <Image
          src="/images/content-09.jpg"
          alt="Cafes and Restaurants near Uluwatu Paradise"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(31,31,31,0.3), rgba(31,31,31,0.8))' }} />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-4xl mx-auto">
            <span className="text-xs tracking-[0.2em] uppercase mb-4 block" style={{ color: '#C6A96C' }}>
              Area Guide
            </span>
            <h1 className="text-3xl md:text-5xl font-light leading-tight mb-4" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>
              Cafes and Restaurants Near Uluwatu Paradise
            </h1>
            <span className="text-sm" style={{ color: '#8A8F83' }}>March 23, 2026</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="prose prose-invert prose-lg" style={{ color: '#D4D0C8' }}>

          <p className="text-xl font-light leading-relaxed mb-8" style={{ color: '#F5F3EE', fontFamily: 'var(--font-serif)' }}>
            One of the best things about living near Uluwatu is the incredible dining scene at your doorstep. From artisanal coffee shops to clifftop beach clubs, here&apos;s your complete guide to the best spots near Uluwatu Paradise.
          </p>

          {/* Cafes */}
          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Cafes</h2>
          <p className="mb-6 leading-relaxed">
            The Uluwatu-Ungasan area has seen a surge of quality cafes in recent years, catering to the growing community of remote workers, families, and lifestyle seekers.
          </p>
          <div className="space-y-6 mb-12">
            {cafes.map((cafe) => (
              <div key={cafe.name} className="rounded-xl p-6" style={{ backgroundColor: 'rgba(198,169,108,0.05)', border: '1px solid rgba(198,169,108,0.15)' }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-light" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>{cafe.name}</h3>
                  <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(198,169,108,0.15)', color: '#C6A96C' }}>{cafe.time}</span>
                </div>
                <p className="text-sm mb-2 leading-relaxed">{cafe.desc}</p>
                <p className="text-xs" style={{ color: '#8A8F83' }}>Best for: {cafe.best}</p>
              </div>
            ))}
          </div>

          {/* Restaurants */}
          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Restaurants</h2>
          <div className="space-y-6 mb-12">
            {restaurants.map((rest) => (
              <div key={rest.name} className="rounded-xl p-6" style={{ backgroundColor: 'rgba(198,169,108,0.05)', border: '1px solid rgba(198,169,108,0.15)' }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-light" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>{rest.name}</h3>
                  <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(198,169,108,0.15)', color: '#C6A96C' }}>{rest.time}</span>
                </div>
                <p className="text-sm mb-2 leading-relaxed">{rest.desc}</p>
                <p className="text-xs" style={{ color: '#8A8F83' }}>Best for: {rest.best}</p>
              </div>
            ))}
          </div>

          {/* Beach Clubs */}
          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Beach Clubs</h2>
          <p className="mb-6 leading-relaxed">
            The Uluwatu coastline is home to some of Bali&apos;s most iconic beach clubs, from high-energy party venues to laid-back sunset spots.
          </p>
          <div className="space-y-6 mb-12">
            {beachClubs.map((club) => (
              <div key={club.name} className="rounded-xl p-6" style={{ backgroundColor: 'rgba(198,169,108,0.05)', border: '1px solid rgba(198,169,108,0.15)' }}>
                <h3 className="text-lg font-light mb-2" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>{club.name}</h3>
                <p className="text-sm mb-2 leading-relaxed">{club.desc}</p>
                {club.url && <p className="text-xs" style={{ color: '#C6A96C' }}>{club.url}</p>}
              </div>
            ))}
          </div>

          {/* Spas & Wellness */}
          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Spas &amp; Wellness</h2>
          <p className="mb-6 leading-relaxed">
            Wellness is central to the Bali lifestyle. From traditional Balinese massage to advanced cryotherapy, the Ungasan-Uluwatu area offers a range of options.
          </p>
          <div className="space-y-6 mb-12">
            {spas.map((spa) => (
              <div key={spa.name} className="rounded-xl p-6" style={{ backgroundColor: 'rgba(198,169,108,0.05)', border: '1px solid rgba(198,169,108,0.15)' }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-light" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>{spa.name}</h3>
                  <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(198,169,108,0.15)', color: '#C6A96C' }}>{spa.time}</span>
                </div>
                <p className="text-xs" style={{ color: '#8A8F83' }}>Services: {spa.services}</p>
              </div>
            ))}
          </div>

          {/* Tourist Attractions */}
          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Nearby Attractions</h2>
          <div className="space-y-6 mb-12">
            {attractions.map((att) => (
              <div key={att.name} className="rounded-xl p-6" style={{ backgroundColor: 'rgba(198,169,108,0.05)', border: '1px solid rgba(198,169,108,0.15)' }}>
                <h3 className="text-lg font-light mb-2" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>{att.name}</h3>
                <p className="text-sm leading-relaxed">{att.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t" style={{ borderColor: 'rgba(198,169,108,0.2)' }}>
            <p className="text-sm mb-4" style={{ color: '#8A8F83' }}>
              Want to live in the heart of Uluwatu&apos;s lifestyle scene? Explore Uluwatu Paradise.
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
