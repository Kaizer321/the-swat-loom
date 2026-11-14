export interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  isNewArrival?: boolean;
  stock?: number;
  description: string;
  longDescription: string;
  material: string;
  category: string;
  gender?: 'men' | 'women' | 'unisex';
  image: string;
  images?: string[]; // Gallery images
  tags: string[];
  colors: string[];
  createdAt?: string; // ISO timestamp
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  originalPrice?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface StylistState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface OrderArtisan {
  name: string;
  village: string;
  experienceYears: number;
  loomId: string;
  technique: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone?: string;
  city?: string;
  address: string;
  items: CartItem[];
  total: number;
  currency?: 'PKR';
  paymentMethod?: 'COD';
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  status: OrderStatus;
  date: string; // ISO string
  artisan?: OrderArtisan;
  trackingCode?: string;
  estimatedDelivery?: string;
}