'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Offer {
  _id: string;
  proposedPrice: number;
  counterPrice?: number;
  finalPrice?: number;
  status: string;
  message?: string;
  counterMessage?: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  buyer: { name: string; email: string };
  seller: { name: string; email: string };
}

interface Props {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  sellerEmail: string;
  sellerName: string;
  onClose: () => void;
  existingOffer?: Offer | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#92400e', bg: '#fef3c7' },
  countered: { label: 'Countered', color: '#1e40af', bg: '#dbeafe' },
  accepted: { label: 'Accepted', color: '#065f46', bg: '#d1fae5' },
  rejected: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2' },
  completed: { label: 'Completed', color: '#065f46', bg: '#d1fae5' },
};

export default function OfferModal({
  listingId,
  listingTitle,
  listingPrice,
  sellerEmail,
  sellerName,
  onClose,
  existingOffer,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [price, setPrice] = useState(existingOffer?.proposedPrice?.toString() ?? '');
  const [message, setMessage] = useState('');
  const [counterPrice, setCounterPrice] = useState(existingOffer?.counterPrice?.toString() ?? '');
  const [loading, setLoading] = useState(false);
  const [offer, setOffer] = useState<Offer | null>(existingOffer ?? null);
  const [error, setError] = useState('');

  const isBuyer = session?.user?.email === offer?.buyer?.email;
  const isSeller = session?.user?.email === sellerEmail;

  async function placeOffer() {
    if (!price) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, proposedPrice: Number(price), message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOffer(data);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to place offer');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: string, extra: Record<string, unknown> = {}) {
    if (!offer) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/offers/${offer._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOffer(data);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  const offerAmt = Number(price) || 0;
  const savings = listingPrice - offerAmt;
  const discount = listingPrice > 0 ? Math.round((savings / listingPrice) * 100) : 0;

  const statusInfo = offer ? STATUS_LABELS[offer.status] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-lg" style={{ color: '#163850' }}>
            {offer ? 'Offer Details' : 'Make an Offer'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Listing info */}
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
            <p className="font-semibold text-sm line-clamp-1" style={{ color: '#163850' }}>{listingTitle}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm" style={{ color: '#6b7280' }}>Listed at</span>
              <span className="font-bold" style={{ color: '#079BD8' }}>₹{listingPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
              {error}
            </div>
          )}

          {/* No existing offer — place one */}
          {!offer && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>
                  Your Offer Price (₹)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={`Max ₹${listingPrice.toLocaleString()}`}
                  className="w-full px-4 py-2.5 rounded-lg border text-lg font-bold outline-none focus:ring-2"
                  style={{ borderColor: '#e2e8f0', color: '#163850' }}
                />
                {price && offerAmt > 0 && (
                  <p className="text-xs mt-1" style={{ color: savings > 0 ? '#15803d' : savings < 0 ? '#dc2626' : '#6b7280' }}>
                    {savings > 0
                      ? `${discount}% below listed price — seller saves you ₹${savings.toLocaleString()}`
                      : savings < 0
                      ? `₹${Math.abs(savings).toLocaleString()} above listed price`
                      : 'At the listed price'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi ${sellerName}, I'm interested in…`}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border text-sm resize-none outline-none"
                  style={{ borderColor: '#e2e8f0', color: '#163850' }}
                  maxLength={300}
                />
              </div>

              <button
                onClick={placeOffer}
                disabled={loading || !price}
                className="btn-primary w-full justify-center py-3 text-base"
              >
                {loading ? 'Placing offer…' : `Offer ₹${Number(price || 0).toLocaleString()}`}
              </button>
            </>
          )}

          {/* Existing offer */}
          {offer && statusInfo && (
            <>
              <div className="flex items-center gap-2">
                <span className="badge" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: '#6b7280' }}>Proposed by {offer.buyer.name}</span>
                  <span className="font-bold" style={{ color: '#163850' }}>₹{offer.proposedPrice.toLocaleString()}</span>
                </div>
                {offer.message && (
                  <p className="px-3 py-2 rounded-lg italic text-sm" style={{ backgroundColor: '#f8fafc', color: '#4b5563' }}>
                    "{offer.message}"
                  </p>
                )}
                {offer.counterPrice && (
                  <div className="flex justify-between">
                    <span style={{ color: '#6b7280' }}>Counter by {offer.seller.name}</span>
                    <span className="font-bold" style={{ color: '#079BD8' }}>₹{offer.counterPrice.toLocaleString()}</span>
                  </div>
                )}
                {offer.finalPrice && (
                  <div className="flex justify-between font-bold">
                    <span style={{ color: '#065f46' }}>Final price</span>
                    <span style={{ color: '#065f46' }}>₹{offer.finalPrice.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Seller actions */}
              {isSeller && offer.status === 'pending' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6b7280' }}>
                      Counter Price (₹)
                    </label>
                    <input
                      type="number"
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ borderColor: '#e2e8f0', color: '#163850' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction('accept')}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors"
                      style={{ backgroundColor: '#16a34a' }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction('counter', { counterPrice: Number(counterPrice), counterMessage: message })}
                      disabled={loading || !counterPrice}
                      className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors"
                      style={{ backgroundColor: '#079BD8' }}
                    >
                      Counter
                    </button>
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors"
                      style={{ backgroundColor: '#dc2626' }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {/* Buyer accepts counter */}
              {isBuyer && offer.status === 'countered' && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleAction('accept')}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    Accept Counter ₹{offer.counterPrice?.toLocaleString()}
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white"
                    style={{ backgroundColor: '#dc2626' }}
                  >
                    Decline
                  </button>
                </div>
              )}

              {/* Verified handshake */}
              {offer.status === 'accepted' && (
                <div className="pt-2">
                  <div className="p-3 rounded-xl mb-3" style={{ backgroundColor: '#d1fae5' }}>
                    <p className="text-sm font-semibold" style={{ color: '#065f46' }}>
                      🤝 Deal agreed! Meet up and confirm the handshake.
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#047857' }}>
                      Both parties must confirm after the physical exchange.
                    </p>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span>{offer.buyerConfirmed ? '✅' : '⏳'} Buyer</span>
                      <span>{offer.sellerConfirmed ? '✅' : '⏳'} Seller</span>
                    </div>
                  </div>
                  {((isBuyer && !offer.buyerConfirmed) || (isSeller && !offer.sellerConfirmed)) && (
                    <button
                      onClick={() => handleAction('confirm-handshake')}
                      disabled={loading}
                      className="w-full py-2.5 rounded-lg font-semibold text-sm text-white"
                      style={{ backgroundColor: '#163850' }}
                    >
                      ✅ I Confirm the Handshake
                    </button>
                  )}
                </div>
              )}

              {offer.status === 'completed' && (
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: '#d1fae5' }}>
                  <p className="font-bold text-sm" style={{ color: '#065f46' }}>Trade completed! 🎉</p>
                  <p className="text-xs mt-1" style={{ color: '#047857' }}>You can now leave a review.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
