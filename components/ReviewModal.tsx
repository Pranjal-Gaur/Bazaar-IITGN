'use client';

import { useState } from 'react';

interface Props {
  offerId: string;
  revieweeName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ offerId, revieweeName, onClose, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!rating) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  }

  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: '#163850' }}>Rate {revieweeName}</h2>
          <button onClick={onClose}><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              className="text-3xl transition-transform hover:scale-110"
            >
              <span style={{ color: s <= (hovered || rating) ? '#f59e0b' : '#e5e7eb' }}>★</span>
            </button>
          ))}
        </div>
        {(hovered || rating) > 0 && (
          <p className="text-center text-sm font-medium mb-4" style={{ color: '#f59e0b' }}>
            {labels[hovered || rating]}
          </p>
        )}

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          rows={3}
          className="w-full px-3 py-2 rounded-lg border text-sm resize-none outline-none mb-4"
          style={{ borderColor: '#e2e8f0', color: '#163850' }}
          maxLength={300}
        />

        {error && <p className="text-xs mb-3" style={{ color: '#dc2626' }}>{error}</p>}

        <button
          onClick={submit}
          disabled={loading || !rating}
          className="btn-primary w-full justify-center py-2.5"
        >
          {loading ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}
