import Link from 'next/link';
import { Listing } from '@/types';

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Electronics: { bg: '#dbeafe', text: '#1d4ed8' },
  Books: { bg: '#dcfce7', text: '#15803d' },
  Cycles: { bg: '#fef9c3', text: '#a16207' },
  'Hostel Gear': { bg: '#fce7f3', text: '#be185d' },
  Sports: { bg: '#ffedd5', text: '#c2410c' },
  Clothing: { bg: '#f3e8ff', text: '#7c3aed' },
  Others: { bg: '#f1f5f9', text: '#475569' },
};

const CONDITION_COLORS: Record<string, { bg: string; text: string }> = {
  New: { bg: '#dcfce7', text: '#15803d' },
  'Like New': { bg: '#d1fae5', text: '#065f46' },
  Good: { bg: '#fef9c3', text: '#a16207' },
  Fair: { bg: '#ffedd5', text: '#c2410c' },
  Poor: { bg: '#fee2e2', text: '#b91c1c' },
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const catColor = CATEGORY_COLORS[listing.category] ?? CATEGORY_COLORS.Others;
  const condColor = CONDITION_COLORS[listing.condition] ?? CONDITION_COLORS.Good;
  const discount = listing.originalPrice
    ? Math.round((1 - listing.price / listing.originalPrice) * 100)
    : null;

  return (
    <Link href={`/listings/${listing._id}`} className="block">
      <div className="rounded-xl overflow-hidden card-hover border h-full flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        {/* Image */}
        <div className="relative bg-gray-100 h-44 overflow-hidden">
          {listing.images && listing.images[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8f4fd 0%, #b3eaf9 100%)' }}>
              <CategoryIcon category={listing.category} />
            </div>
          )}

          {/* Urgent badge */}
          {listing.isUrgent && (
            <div className="absolute top-2 left-2 badge text-white text-xs" style={{ backgroundColor: '#dc2626' }}>
              🔥 Urgent
            </div>
          )}

          {/* Discount badge */}
          {discount && discount > 0 && (
            <div className="absolute top-2 right-2 badge text-white" style={{ backgroundColor: '#16a34a' }}>
              -{discount}%
            </div>
          )}

          {/* Status overlay */}
          {listing.status !== 'Available' && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(22,56,80,0.6)' }}>
              <span className="text-white font-bold text-lg uppercase tracking-widest">
                {listing.status}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          {/* Category + Condition */}
          <div className="flex items-center gap-2">
            <span className="badge" style={{ backgroundColor: catColor.bg, color: catColor.text }}>
              {listing.category}
            </span>
            <span className="badge" style={{ backgroundColor: condColor.bg, color: condColor.text }}>
              {listing.condition}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            {listing.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-xl font-bold" style={{ color: '#079BD8' }}>
              ₹{listing.price.toLocaleString()}
            </span>
            {listing.originalPrice && (
              <span className="text-sm line-through" style={{ color: '#9ca3af' }}>
                ₹{listing.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{listing.hostel}</span>
            </div>
            <span>{listing.createdAt ? timeAgo(listing.createdAt) : 'Recently'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, string> = {
    Electronics: '💻',
    Books: '📚',
    Cycles: '🚲',
    'Hostel Gear': '🏠',
    Sports: '⚽',
    Clothing: '👕',
    Others: '📦',
  };
  return (
    <span className="text-5xl opacity-50">{icons[category] ?? '📦'}</span>
  );
}
