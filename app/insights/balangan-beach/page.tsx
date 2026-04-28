import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Balangan Beach: One of the Most Beautiful Beaches Near Uluwatu Paradise — NGH Property Group',
  description: 'Discover Balangan Beach, one of Bali\'s most stunning coastlines and just minutes from Uluwatu Paradise. Crystal-clear waters, dramatic cliffs, and golden sand.',
}

export default function BalanganBeach() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#1F1F1F' }}>
      {/* Hero */}
      <div className="relative h-[60vh] md:h-[70vh]">
        <Image
          src="/images/content-08.jpg"
          alt="Balangan Beach Bali"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(31,31,31,0.3), rgba(31,31,31,0.8))' }} />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="max-w-4xl mx-auto">
            <span className="text-xs tracking-[0.2em] uppercase mb-4 block" style={{ color: '#C6A96C' }}>
              Lifestyle
            </span>
            <h1 className="text-3xl md:text-5xl font-light leading-tight mb-4" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>
              Balangan Beach: One of the Most Beautiful Beaches Near Uluwatu Paradise
            </h1>
            <span className="text-sm" style={{ color: '#8A8F83' }}>March 29, 2026</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="prose prose-invert prose-lg" style={{ color: '#D4D0C8' }}>

          <p className="text-xl font-light leading-relaxed mb-8" style={{ color: '#F5F3EE', fontFamily: 'var(--font-serif)' }}>
            Tucked along the limestone cliffs of Bali&apos;s Bukit Peninsula, Balangan Beach is one of those rare places that still feels untouched by mass tourism. Just minutes from Uluwatu Paradise, it&apos;s the kind of beach that reminds you why you fell in love with Bali in the first place.
          </p>

          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>A Hidden Gem on the Bukit Peninsula</h2>
          <p className="mb-6 leading-relaxed">
            Balangan Beach sits on the southwestern coast of the Bukit Peninsula, accessible via a winding road that leads down through dramatic cliff faces. The beach stretches roughly 500 meters of golden sand, backed by limestone cliffs covered in tropical greenery.
          </p>
          <p className="mb-6 leading-relaxed">
            Unlike the more commercialized beaches of Seminyak or Kuta, Balangan has maintained a quieter, more authentic character. The beach is popular with surfers who come for the consistent left-hand reef break, but it&apos;s equally loved by those who simply want to watch the sunset with a fresh coconut in hand.
          </p>

          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>What Makes Balangan Special</h2>
          <p className="mb-6 leading-relaxed">
            Balangan is often described as one of the most photogenic beaches in Bali, and it&apos;s easy to see why. The combination of turquoise water, white-gold sand, and towering cliffs creates a landscape that feels almost cinematic.
          </p>
          <ul className="space-y-3 mb-8">
            <li><strong style={{ color: '#F5F3EE' }}>Surfing:</strong> A well-known left-hand reef break that works best at mid to high tide. Suitable for intermediate to advanced surfers.</li>
            <li><strong style={{ color: '#F5F3EE' }}>Swimming:</strong> The eastern end of the beach offers calmer waters, ideal for swimming during low to mid tide.</li>
            <li><strong style={{ color: '#F5F3EE' }}>Sunsets:</strong> West-facing orientation means spectacular sunset views every evening, unobstructed by islands or headlands.</li>
            <li><strong style={{ color: '#F5F3EE' }}>Local warungs:</strong> Simple beachside restaurants serving fresh seafood, Nasi Goreng, and cold Bintangs at local prices.</li>
            <li><strong style={{ color: '#F5F3EE' }}>Cliff viewpoints:</strong> Several elevated spots along the cliff path offer panoramic views of the entire coastline.</li>
          </ul>

          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Getting There from Uluwatu Paradise</h2>
          <p className="mb-6 leading-relaxed">
            Balangan Beach is located along Jl. Pantai Balangan — the same road where Uluwatu Paradise is situated. Residents can reach the beach in just a few minutes by motorbike or car, making it the ultimate doorstep beach.
          </p>
          <p className="mb-6 leading-relaxed">
            The proximity to Balangan is one of the key lifestyle advantages of living at Uluwatu Paradise. Morning surf sessions, afternoon swims, or evening sunset walks are all part of daily life here.
          </p>

          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Nearby Beaches Worth Exploring</h2>
          <p className="mb-6 leading-relaxed">
            The Bukit Peninsula is home to some of Bali&apos;s finest beaches, all within a short drive from Uluwatu Paradise:
          </p>
          <ul className="space-y-3 mb-8">
            <li><strong style={{ color: '#F5F3EE' }}>Bingin Beach:</strong> A compact, cliff-backed beach popular with surfers and yogis. Known for its bohemian atmosphere and dramatic access stairway.</li>
            <li><strong style={{ color: '#F5F3EE' }}>Padang Padang:</strong> A small but stunning cove made famous by the film &quot;Eat Pray Love.&quot; Crystal-clear water and unique rock formations.</li>
            <li><strong style={{ color: '#F5F3EE' }}>Dreamland Beach:</strong> A wide, white-sand beach with powerful waves and a more resort-oriented atmosphere.</li>
            <li><strong style={{ color: '#F5F3EE' }}>Melasti Beach:</strong> One of the newest and most photogenic beach access points, featuring dramatic cliff roads and pristine white sand.</li>
            <li><strong style={{ color: '#F5F3EE' }}>Nyang Nyang Beach:</strong> One of Bali&apos;s most secluded beaches, reached via a steep hike. Virtually empty and stunningly beautiful.</li>
          </ul>

          <h2 className="text-2xl font-light mt-12 mb-6" style={{ fontFamily: 'var(--font-serif)', color: '#F5F3EE' }}>Why Location Matters for Investors</h2>
          <p className="mb-6 leading-relaxed">
            For property investors, beach proximity is one of the strongest drivers of rental demand. Guests consistently rank &quot;distance to beach&quot; as a top factor when choosing accommodation in Bali. Properties within walking or short driving distance of premium beaches like Balangan command higher nightly rates and achieve better occupancy.
          </p>
          <p className="mb-6 leading-relaxed">
            Uluwatu Paradise&apos;s position on Jl. Pantai Balangan places it in the heart of this demand zone — close enough to enjoy the beach lifestyle daily, while being set back enough to offer peace and privacy.
          </p>

          <div className="mt-16 pt-8 border-t" style={{ borderColor: 'rgba(198,169,108,0.2)' }}>
            <p className="text-sm mb-4" style={{ color: '#8A8F83' }}>
              Want to live minutes from Balangan Beach? Explore Uluwatu Paradise.
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
