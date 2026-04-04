'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingCard from '@/components/ListingCard';
import OfferModal from '@/components/OfferModal';
import ReviewModal from '@/components/ReviewModal';
import Link from 'next/link';
import { Listing } from '@/types';

type Tab = 'listings' | 'offers' | 'watchlist';

interface Offer {
  _id: string;
  listing: { _id: string; title: string; price: number; images: string[] };
  buyer: { name: string; email: string; hostel: string };
  seller: { name: string; email: string };
  proposedPrice: number;
  counterPrice?: number;
  finalPrice?: number;
  status: string;
  message?: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef9c3', text: '#a16207' },
  countered: { bg: '#dbeafe', text: '#1d4ed8' },
  accepted: { bg: '#d1fae5', text: '#065f46' },
  rejected: { bg: '#fee2e2', text: '#b91c1c' },
  completed: { bg: '#d1fae5', text: '#065f46' },
  expired: { bg: '#f1f5f9', text: '#475569' },
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>('listings');
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [buyerOffers, setBuyerOffers] = useState<Offer[]>([]);
  const [sellerOffers, setSellerOffers] = useState<Offer[]>([]);
  const [watchlist, setWatchlist] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOffer, setActiveOffer] = useState<Offer | null>(null);
  const [showReview, setShowReview] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') { signIn(); return; }
    if (status !== 'authenticated') return;

    async function load() {
      const [listRes, buyRes, sellRes, wlRes] = await Promise.all([
        fetch(`/api/listings?status=all&q=seller:${session?.user?.email}`),
        fetch('/api/offers?as=buyer'),
        fetch('/api/offers?as=seller'),
        fetch('/api/watchlist'),
      ]);

      // Fetch my listings directly by seller email
      const listingsRes = await fetch(`/api/listings?status=all`);
      const listingsData = await listingsRes.json();
      // Filter client-side for own listings
      setMyListings((listingsData.listings ?? []).filter(
        (l: Listing) => l.seller?.email === session?.user?.email
      ));

      if (buyRes.ok) setBuyerOffers((await buyRes.json()).offers ?? []);
      if (sellRes.ok) setSellerOffers((await sellRes.json()).offers ?? []);
      if (wlRes.ok) setWatchlist((await wlRes.json()).listings ?? []);
      setLoading(false);
    }
    load();
  }, [status, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: '#079BD8', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'listings', label: 'My Listings', count: myListings.length },
    { key: 'offers', label: 'Offers', count: buyerOffers.length + sellerOffers.length },
    { key: 'watchlist', label: 'Watchlist', count: watchlist.length },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
        {/* Header */}
        <div className="py-8" style={{ backgroundColor: '#163850' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                style={{ backgroundColor: '#079BD8' }}
              >
                {session?.user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{session?.user?.name}</h1>
                <p className="text-sm" style={{ color: '#B3EAF9' }}>
                  {session?.user?.email} · {session?.user?.hostel ?? 'IITGN'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#079BD8', color: 'white' }}>
                    ⭐ {session?.user?.karmaScore ?? 10} Karma
                  </span>
                  <span className="text-xs" style={{ color: '#B3EAF9' }}>
                    {myListings.filter((l) => l.status === 'Sold').length} trades completed
                  </span>
                </div>
              </div>
              <Link href="/listings/new" className="btn-primary ml-auto text-sm hidden sm:flex">
                + Post Item
              </Link>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 mt-6">
              {TABS.map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: tab === key ? 'white' : 'transparent',
                    color: tab === key ? '#163850' : '#B3EAF9',
                  }}
                >
                  {label}
                  {count > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs" style={{ backgroundColor: tab === key ? '#163850' : 'rgba(179,234,249,0.3)', color: tab === key ? 'white' : '#B3EAF9' }}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* MY LISTINGS */}
          {tab === 'listings' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg" style={{ color: '#163850' }}>Items I'm Selling</h2>
                <Link href="/listings/new" className="btn-primary text-sm">+ New Listing</Link>
              </div>

              {myListings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <div className="text-5xl mb-4">📦</div>
                  <h3 className="font-bold mb-2" style={{ color: '#163850' }}>No listings yet</h3>
                  <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Start selling your items to the IITGN community</p>
                  <Link href="/listings/new" className="btn-primary">Post your first item</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myListings.map((l) => <ListingCard key={l._id} listing={l} />)}
                </div>
              )}
            </div>
          )}

          {/* OFFERS */}
          {tab === 'offers' && (
            <div className="space-y-8">
              {/* Offers on my listings */}
              {sellerOffers.length > 0 && (
                <div>
                  <h2 className="font-bold text-lg mb-4" style={{ color: '#163850' }}>Offers on My Items ({sellerOffers.length})</h2>
                  <div className="space-y-3">
                    {sellerOffers.map((offer) => (
                      <OfferRow key={offer._id} offer={offer} perspective="seller" onAction={() => setActiveOffer(offer)} />
                    ))}
                  </div>
                </div>
              )}

              {/* My offers as buyer */}
              {buyerOffers.length > 0 && (
                <div>
                  <h2 className="font-bold text-lg mb-4" style={{ color: '#163850' }}>My Offers ({buyerOffers.length})</h2>
                  <div className="space-y-3">
                    {buyerOffers.map((offer) => (
                      <OfferRow
                        key={offer._id}
                        offer={offer}
                        perspective="buyer"
                        onAction={() => setActiveOffer(offer)}
                        onReview={() => setShowReview(offer._id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {sellerOffers.length === 0 && buyerOffers.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <div className="text-5xl mb-4">🤝</div>
                  <h3 className="font-bold mb-2" style={{ color: '#163850' }}>No offers yet</h3>
                  <p className="text-sm" style={{ color: '#6b7280' }}>Make an offer on a listing or wait for buyers to offer on your items</p>
                </div>
              )}
            </div>
          )}

          {/* WATCHLIST */}
          {tab === 'watchlist' && (
            <div>
              <h2 className="font-bold text-lg mb-6" style={{ color: '#163850' }}>Saved Items</h2>
              {watchlist.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <div className="text-5xl mb-4">⭐</div>
                  <h3 className="font-bold mb-2" style={{ color: '#163850' }}>Watchlist is empty</h3>
                  <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Save listings you're interested in</p>
                  <Link href="/listings" className="btn-primary">Browse Listings</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {watchlist.map((l) => <ListingCard key={l._id} listing={l} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Offer action modal */}
      {activeOffer && (
        <OfferModal
          listingId={activeOffer.listing?._id ?? ''}
          listingTitle={activeOffer.listing?.title ?? ''}
          listingPrice={activeOffer.listing?.price ?? 0}
          sellerEmail={activeOffer.seller.email}
          sellerName={activeOffer.seller.name}
          onClose={() => setActiveOffer(null)}
          existingOffer={activeOffer as Parameters<typeof OfferModal>[0]['existingOffer']}
        />
      )}

      {/* Review modal */}
      {showReview && (
        <ReviewModal
          offerId={showReview}
          revieweeName="Seller"
          onClose={() => setShowReview(null)}
          onSuccess={() => setShowReview(null)}
        />
      )}

      <Footer />
    </div>
  );
}

function OfferRow({
  offer,
  perspective,
  onAction,
  onReview,
}: {
  offer: Offer;
  perspective: 'buyer' | 'seller';
  onAction: () => void;
  onReview?: () => void;
}) {
  const statusColor = STATUS_COLORS[offer.status] ?? STATUS_COLORS.pending;
  const price = offer.finalPrice ?? offer.counterPrice ?? offer.proposedPrice;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: '#163850' }}>
          {offer.listing?.title ?? 'Listing'}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="badge text-xs" style={{ backgroundColor: statusColor.bg, color: statusColor.text }}>
            {offer.status}
          </span>
          <span className="text-xs" style={{ color: '#6b7280' }}>
            {perspective === 'buyer' ? `to ${offer.seller.name}` : `from ${offer.buyer.name} · ${offer.buyer.hostel}`}
          </span>
        </div>
        {offer.message && (
          <p className="text-xs mt-1 italic truncate" style={{ color: '#9ca3af' }}>"{offer.message}"</p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <div className="font-bold" style={{ color: '#079BD8' }}>₹{price.toLocaleString()}</div>
        <div className="text-xs" style={{ color: '#9ca3af' }}>
          {new Date(offer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onAction} className="btn-navy text-xs py-1.5 px-3">
          {perspective === 'seller' && offer.status === 'pending' ? 'Respond' : 'View'}
        </button>
        {offer.status === 'completed' && onReview && (
          <button onClick={onReview} className="text-xs py-1.5 px-3 rounded-lg border font-semibold" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
            Review
          </button>
        )}
      </div>
    </div>
  );
}
