export type Category = 'Electronics' | 'Books' | 'Cycles' | 'Hostel Gear' | 'Sports' | 'Clothing' | 'Others';
export type Condition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
export type ListingStatus = 'Available' | 'Reserved' | 'Sold';

export const HOSTELS = [
  'Aibaan', 'Beauki', 'Chimair', 'Duven', 'Emiet',
  'Firaki', 'Gokul', 'Hoaki', 'Faculty Housing', 'Other'
] as const;

export type Hostel = typeof HOSTELS[number];

export interface SellerInfo {
  name: string;
  email: string;
  hostel: Hostel | string;
  karmaScore?: number;
}

export interface Listing {
  _id?: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  condition: Condition;
  images: string[];
  seller: SellerInfo;
  hostel: string;
  wing?: string;
  preferredPickup?: string;
  status: ListingStatus;
  isUrgent: boolean;
  tags: string[];
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}
