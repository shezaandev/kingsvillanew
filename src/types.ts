export interface Amenity {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Bedroom {
  id: string;
  name: string;
  image: string;
  features: string[];
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface Attraction {
  name: string;
  distance: string;
}

export interface DistanceCallout {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Review {
  id: string;
  stars: number;
  text: string;
  author: string;
  location: string;
  avatar: string;
  visible?: boolean;
  pinned?: boolean;
  order?: number;
  createdAt?: any;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: "pool" | "bedroom" | "garden" | "exterior" | "living" | "dining" | "terrace" | "bonfire" | "other";
  order: number;
  isOgImage: boolean;
  villaAlbum?: string; // optional — existing docs without this field are treated as "All Photos"
}

export interface SiteSettings {
  brandName: string;
  ownerName: string;
  whatsappNumber: string;
  instagramHandle: string;
  instagramUrl: string;
  villaAddress: string;
  checkInTime: string;
  checkOutTime: string;
  tagline: string;
  bookingRules: string[];
}

export interface AddOnItem {
  id: string;
  name: string;
  price: number;
}

export interface SeasonalRateRange {
  label: string;
  startDate: string;
  endDate: string;
  price: number;
}

export interface PricingRates {
  weekdayRate: number;
  weekendRate: number;
  currency: string;
  maxGuests: number;
  addOns: AddOnItem[];
  seasonalRates: SeasonalRateRange[];
  notes: string;
}

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  guestName: string;
  guestPhone: string;
  bookingType: string;
  adults: number;
  children: number;
  checkIn: string;
  checkInTime: string;
  checkOut: string;
  checkOutTime: string;
  stayDuration: string;
  stayType: string;
  lineItems: LineItem[];
  advanceReceived: number;
  paymentMethod: string;
  upiId: string;
  fullyPaid: boolean;
  status: "PAID" | "PARTIAL";
  notes: string;
}

