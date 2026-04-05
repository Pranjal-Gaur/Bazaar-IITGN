'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWindow from '@/components/ChatWindow';
import OfferModal from '@/components/OfferModal';
import ReviewModal from '@/components/ReviewModal';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';
import { Listing } from '@/types';

const CONDITION_COLORS: Record<string, { bg: string; text: string }> = {
  New: { bg: '#dcfce7', text: '#15803d' },
  'Like New': { bg: '#d1fae5', text: '#065f46' },
  Good: { bg: '#fef9c3', text: '#a16207' },
  Fair: { bg: '#ffedd5', text: '#c2410c' },
  Poor: { bg: '#fee2e2', text: '#b91c1c' },
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [related, setRelated] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);
  const [existingOffer, setExistingOffer] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [sellerProfile, setSellerProfile] = useState<{ phone?: string; bio?: string; contactPreferences?: { showPhone: boolean; showEmail: boolean } } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) { router.push('/listings'); return; }
        const data = await res.json();
        setListing(data);
        // Load related + seller profile in parallel
        const [rel, profileRes] = await Promise.all([
          fetch(`/api/listings?category=${data.category}&limit=4`),
          fetch(`/api/users/${encodeURIComponent(data.seller.email)}`),
        ]);
        const relData = await rel.json();
        setRelated((relData.listings ?? []).filter((l: Listing) => l._id !== id));
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setSellerProfile(profileData.user);
        }

        // Check if user has an offer
        if (session?.user?.id) {
          const userIds = [session.user.id, data.seller.email].sort().join('-');
          const rid = `${id}-${userIds}`;
          setRoomId(rid);

          const offerRes = await fetch(`/api/offers?listingId=${id}&as=buyer`);
          const offerData = await offerRes.json();
          if (offerData.offers?.length) setExistingOffer(offerData.offers[0]);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, session, router]);

  async function toggleWatchlist() {
    if (!session) { signIn(); return; }
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: id }),
    });
    const data = await res.json();
    setWatchlisted(data.watchlisted);
  }

  async function markUrgent() {
    await fetch(`/api/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isUrgent: !listing?.isUrgent }),
    });
    setListing((prev) => prev ? { ...prev, isUrgent: !prev.isUrgent } : prev);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 rounded-full animate-spin" style={{ borderColor: '#079BD8', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!listing) return null;

  const isSeller = session?.user?.email === listing.seller.email;
  const condColor = CONDITION_COLORS[listing.condition] ?? CONDITION_COLORS.Good;
  const discount = listing.originalPrice
    ? Math.round((1 - listing.price / listing.originalPrice) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: '#6b7280' }}>
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/listings" className="hover:underline">Listings</Link>
            <span>/</span>
            <Link href={`/listings?category=${listing.category}`} className="hover:underline">{listing.category}</Link>
            <span>/</span>
            <span className="truncate max-w-xs" style={{ color: '#163850' }}>{listing.title}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Images + Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image gallery */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="relative aspect-video bg-gray-100">
                  {listing.images?.length > 0 ? (
                    <img
                      src={listing.images[activeImg]}
                      alt={listing.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl" style={{ background: 'linear-gradient(135deg, #e8f4fd, #b3eaf9)' }}>
                      {listing.category === 'Electronics' ? '💻' : listing.category === 'Books' ? '📚' : listing.category === 'Cycles' ? '🚲' : listing.category === 'Hostel Gear' ? '🏠' : listing.category === 'Sports' ? '⚽' : '📦'}
                    </div>
                  )}
                  {listing.isUrgent && (
                    <div className="absolute top-3 left-3 badge text-white" style={{ backgroundColor: '#dc2626' }}>🔥 Urgent Sale</div>
                  )}
                  {listing.status !== 'Available' && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(22,56,80,0.6)' }}>
                      <span className="text-white font-bold text-3xl uppercase tracking-widest">{listing.status}</span>
                    </div>
                  )}
                </div>
                {listing.images?.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {listing.images.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors"
                        style={{ borderColor: i === activeImg ? '#079BD8' : 'transparent' }}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Listing info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="badge" style={{ backgroundColor: '#e8f4fd', color: '#045F82' }}>{listing.category}</span>
                  <span className="badge" style={{ backgroundColor: condColor.bg, color: condColor.text }}>{listing.condition}</span>
                  {listing.hostel && <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>📍 {listing.hostel}</span>}
                  {listing.views !== undefined && (
                    <span className="text-xs ml-auto" style={{ color: '#9ca3af' }}>{listing.views} views</span>
                  )}
                </div>

                <h1 className="text-2xl font-bold" style={{ color: '#163850' }}>{listing.title}</h1>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold" style={{ color: '#079BD8' }}>₹{listing.price.toLocaleString()}</span>
                  {listing.originalPrice && (
                    <>
                      <span className="text-lg line-through" style={{ color: '#9ca3af' }}>₹{listing.originalPrice.toLocaleString()}</span>
                      {discount > 0 && <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>{discount}% off</span>}
                    </>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2" style={{ color: '#163850' }}>Description</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#4b5563' }}>{listing.description}</p>
                </div>

                {listing.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-lg text-xs" style={{ backgroundColor: '#f1f5f9', color: '#6b7280' }}>#{tag}</span>
                    ))}
                  </div>
                )}

                {listing.preferredPickup && (
                  <div className="flex items-center gap-2 text-sm p-3 rounded-lg" style={{ backgroundColor: '#e8f4fd' }}>
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#079BD8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span style={{ color: '#045F82' }}>Preferred pickup: <strong>{listing.preferredPickup}</strong></span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs" style={{ color: '#9ca3af' }}>
                  <span>Posted {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}</span>
                </div>
              </div>

              {/* Seller actions (only for own listing) */}
              {isSeller && (
                <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap gap-3">
                  <Link href={`/listings/${id}/edit`} className="btn-navy text-sm">
                    ✏️ Edit Listing
                  </Link>
                  <button onClick={markUrgent} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors" style={{ borderColor: '#dc2626', color: '#dc2626' }}>
                    {listing.isUrgent ? '🔥 Remove Urgent' : '🔥 Mark as Urgent'}
                  </button>
                  <button
                    onClick={async () => {
                      await fetch(`/api/listings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: listing.status === 'Available' ? 'Sold' : 'Available' }) });
                      setListing((prev) => prev ? { ...prev, status: prev.status === 'Available' ? 'Sold' : 'Available' } : prev);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border"
                    style={{ borderColor: '#e2e8f0', color: '#4b5563' }}
                  >
                    Mark as {listing.status === 'Available' ? 'Sold' : 'Available'}
                  </button>
                </div>
              )}

              {/* Chat section */}
              {!isSeller && (
                <div>
                  <button
                    onClick={() => { if (!session) { signIn(); return; } setShowChat(!showChat); }}
                    className="flex items-center gap-2 text-sm font-semibold mb-3"
                    style={{ color: '#079BD8' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {showChat ? 'Hide Chat' : 'Chat with Seller'}
                  </button>
                  {showChat && roomId && (
                    <ChatWindow
                      listingId={id}
                      roomId={roomId}
                      otherPartyName={listing.seller.name}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Right: Seller info + Actions */}
            <div className="space-y-4">
              {/* Action card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3 sticky top-24">
                <div className="text-2xl font-bold" style={{ color: '#079BD8' }}>₹{listing.price.toLocaleString()}</div>

                {!isSeller && listing.status === 'Available' && (
                  <>
                    <button
                      onClick={() => { if (!session) { signIn(); return; } setShowOffer(true); }}
                      className="btn-primary w-full justify-center py-3 text-base"
                    >
                      {existingOffer ? '📋 View My Offer' : '💰 Make an Offer'}
                    </button>
                    <button
                      onClick={() => { if (!session) { signIn(); return; } setShowChat(true); }}
                      className="w-full py-3 rounded-lg font-semibold text-sm border-2 transition-colors"
                      style={{ borderColor: '#163850', color: '#163850' }}
                    >
                      💬 Message Seller
                    </button>
                    <button
                      onClick={toggleWatchlist}
                      className="w-full py-2.5 rounded-lg font-semibold text-sm border transition-colors"
                      style={{
                        borderColor: watchlisted ? '#f59e0b' : '#e2e8f0',
                        color: watchlisted ? '#f59e0b' : '#6b7280',
                        backgroundColor: watchlisted ? '#fffbeb' : 'transparent',
                      }}
                    >
                      {watchlisted ? '⭐ Saved to Watchlist' : '☆ Add to Watchlist'}
                    </button>
                  </>
                )}

                {listing.status !== 'Available' && (
                  <div className="py-3 text-center rounded-xl font-semibold text-sm" style={{ backgroundColor: '#f1f5f9', color: '#6b7280' }}>
                    This item is {listing.status}
                  </div>
                )}

                {/* Seller info */}
                <div className="border-t pt-4">
                  <Link href={`/profile/${listing.seller.email}`}>
                    <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: '#163850' }}>
                        {listing.seller.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: '#163850' }}>{listing.seller.name}</div>
                        <div className="text-xs" style={{ color: '#9ca3af' }}>{listing.seller.hostel} · IITGN</div>
                      </div>
                    </div>
                  </Link>

                  {/* Karma */}
                  {listing.seller.karmaScore !== undefined && (
                    <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: '#e8f4fd' }}>
                      <span className="text-sm">⭐</span>
                      <span className="text-sm font-semibold" style={{ color: '#045F82' }}>
                        {listing.seller.karmaScore} Karma
                      </span>
                      <span className="text-xs ml-auto" style={{ color: '#6b7280' }}>Trusted seller</span>
                    </div>
                  )}

                  {/* Seller bio */}
                  {sellerProfile?.bio && (
                    <p className="mt-2 text-xs italic" style={{ color: '#6b7280' }}>"{sellerProfile.bio}"</p>
                  )}

                  {/* Contact details */}
                  {!isSeller && (
                    <div className="mt-3 space-y-2">
                      {sellerProfile?.contactPreferences?.showPhone && sellerProfile?.phone && (
                        <a
                          href={`tel:${sellerProfile.phone}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold w-full"
                          style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call {sellerProfile.phone}
                        </a>
                      )}
                      {sellerProfile?.contactPreferences?.showEmail && (
                        <a
                          href={`mailto:${listing.seller.email}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold w-full"
                          style={{ backgroundColor: '#e8f4fd', color: '#045F82' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {listing.seller.email}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Safety tips */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h4 className="font-semibold text-sm mb-3" style={{ color: '#163850' }}>Safety Tips</h4>
                <ul className="space-y-1.5 text-xs" style={{ color: '#6b7280' }}>
                  <li>✅ Meet at a public spot (Mess, Library)</li>
                  <li>✅ Check item condition before paying</li>
                  <li>✅ Use the in-app offer system</li>
                  <li>✅ Confirm the handshake in-app after trade</li>
                  <li>🚫 Never share your passwords or OTPs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related listings */}
          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-5" style={{ color: '#163850' }}>More in {listing.category}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {related.map((l) => <ListingCard key={l._id} listing={l} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Offer Modal */}
      {showOffer && (
        <OfferModal
          listingId={id}
          listingTitle={listing.title}
          listingPrice={listing.price}
          sellerEmail={listing.seller.email}
          sellerName={listing.seller.name}
          onClose={() => setShowOffer(false)}
          existingOffer={existingOffer}
        />
      )}

      {/* Review Modal */}
      {showReview && (
        <ReviewModal
          offerId={existingOffer ? (existingOffer as { _id: string })._id : ''}
          revieweeName={listing.seller.name}
          onClose={() => setShowReview(false)}
          onSuccess={() => setShowReview(false)}
        />
      )}

      <Footer />
    </div>
  );
}
