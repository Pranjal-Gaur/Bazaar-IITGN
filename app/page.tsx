import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import CategoryGrid from '@/components/CategoryGrid';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';
import { Listing } from '@/types';

// Mock listings for CP1 — replace with DB fetch in CP2
const MOCK_LISTINGS: Listing[] = [
  {
    _id: '1',
    title: 'Dell Inspiron 15 Laptop — Excellent Condition',
    description: 'Used for 1 year, runs perfectly. Intel i5 11th gen, 8GB RAM, 512GB SSD.',
    price: 28000,
    originalPrice: 52000,
    category: 'Electronics',
    condition: 'Like New',
    images: [],
    seller: { name: 'Arjun Sharma', email: 'arjun@iitgn.ac.in', hostel: 'Chimair' },
    hostel: 'Chimair',
    status: 'Available',
    isUrgent: false,
    tags: ['laptop', 'dell', 'computer'],
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    _id: '2',
    title: 'MTB Cycle — Trending! Urgent Sale',
    description: '21-speed mountain bike, well maintained. Perfect for campus commute.',
    price: 4500,
    originalPrice: 8000,
    category: 'Cycles',
    condition: 'Good',
    images: [],
    seller: { name: 'Meera Patel', email: 'meera@iitgn.ac.in', hostel: 'Beauki' },
    hostel: 'Beauki',
    status: 'Available',
    isUrgent: true,
    tags: ['cycle', 'mtb', 'bicycle'],
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    _id: '3',
    title: 'Engineering Maths Bundle (4 Books)',
    description: 'Kreyszig, Arfken, Riley — full set. Great condition, lightly annotated.',
    price: 800,
    originalPrice: 2400,
    category: 'Books',
    condition: 'Good',
    images: [],
    seller: { name: 'Rohit Singh', email: 'rohit@iitgn.ac.in', hostel: 'Aibaan' },
    hostel: 'Aibaan',
    status: 'Available',
    isUrgent: false,
    tags: ['maths', 'engineering', 'textbooks'],
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    _id: '4',
    title: 'Symphony Cooler — Works Great',
    description: 'Used for one summer. Cleaned and serviced. Ready for the next season.',
    price: 2200,
    originalPrice: 5500,
    category: 'Hostel Gear',
    condition: 'Good',
    images: [],
    seller: { name: 'Priya Nair', email: 'priya@iitgn.ac.in', hostel: 'Emiet' },
    hostel: 'Emiet',
    status: 'Available',
    isUrgent: true,
    tags: ['cooler', 'symphony', 'hostel'],
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    _id: '5',
    title: 'JBL Flip 5 Bluetooth Speaker',
    description: 'Minor scratch on the side, fully functional. Amazing sound quality.',
    price: 3500,
    originalPrice: 7000,
    category: 'Electronics',
    condition: 'Like New',
    images: [],
    seller: { name: 'Karan Mehta', email: 'karan@iitgn.ac.in', hostel: 'Duven' },
    hostel: 'Duven',
    status: 'Available',
    isUrgent: false,
    tags: ['jbl', 'speaker', 'bluetooth', 'audio'],
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    _id: '6',
    title: 'Badminton Racket Pair — Yonex',
    description: 'Set of 2 Yonex rackets with shuttle. Light use, strings in good shape.',
    price: 700,
    originalPrice: 1800,
    category: 'Sports',
    condition: 'Good',
    images: [],
    seller: { name: 'Ananya Gupta', email: 'ananya@iitgn.ac.in', hostel: 'Firaki' },
    hostel: 'Firaki',
    status: 'Available',
    isUrgent: false,
    tags: ['badminton', 'yonex', 'sports'],
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
];

export default function Home() {
  const urgentListings = MOCK_LISTINGS.filter((l) => l.isUrgent);
  const recentListings = MOCK_LISTINGS.filter((l) => !l.isUrgent);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <CategoryGrid />

        {/* Urgent Listings */}
        {urgentListings.length > 0 && (
          <section className="py-10" style={{ backgroundColor: '#fff8f0' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <h2 className="text-2xl font-bold" style={{ color: '#163850' }}>Urgent Sales</h2>
                  <span className="badge ml-2 text-white" style={{ backgroundColor: '#dc2626' }}>
                    Graduating students
                  </span>
                </div>
                <Link href="/listings?urgent=true" className="text-sm font-semibold" style={{ color: '#079BD8' }}>
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {urgentListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent Listings */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#163850' }}>Recent Listings</h2>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Freshly posted by your campus peers</p>
              </div>
              <Link href="/listings" className="text-sm font-semibold hidden sm:block" style={{ color: '#079BD8' }}>
                View all listings →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {recentListings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/listings" className="btn-navy px-8 py-3 text-sm">
                View All Listings
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section
          className="py-16"
          style={{ background: 'linear-gradient(135deg, #163850 0%, #079BD8 100%)' }}
        >
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Have something to sell?
            </h2>
            <p className="text-lg mb-8" style={{ color: '#B3EAF9' }}>
              Post your listing in under 2 minutes and reach 1,800+ IITGN students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/listings/new" className="btn-primary px-8 py-3 text-base">
                Post a Listing
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
              <Link
                href="/auth/signin"
                className="px-8 py-3 text-base rounded-lg font-semibold border-2 text-white transition-colors"
                style={{ borderColor: 'rgba(179,234,249,0.6)' }}
              >
                Sign in with IITGN
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-14 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center mb-10" style={{ color: '#163850' }}>How Bazaar Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  icon: '🔐',
                  title: 'Sign In Securely',
                  desc: 'Login with your @iitgn.ac.in Google account. Verified students only.',
                },
                {
                  step: '2',
                  icon: '📸',
                  title: 'Post or Browse',
                  desc: 'List your item with photos, or search by category, hostel, and price.',
                },
                {
                  step: '3',
                  icon: '🤝',
                  title: 'Negotiate & Trade',
                  desc: 'Chat in-app, make offers, and confirm the handshake to complete the trade.',
                },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                    style={{ backgroundColor: '#e8f4fd' }}
                  >
                    {icon}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#079BD8' }}>
                    Step {step}
                  </div>
                  <h3 className="font-bold mb-2" style={{ color: '#163850' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
