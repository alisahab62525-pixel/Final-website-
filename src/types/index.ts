export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  sku: string;
  brand: string;
  price: number;
  discount_price?: number;
  category_id: string;
  category?: Category;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  rating: number;
  review_count: number;
  images?: ProductImage[];
  variants?: string[]; // e.g. ["Black", "White", "Silver"] or sizes ["M", "L", "XL"]
  specifications?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line: string;
  area: string;
  city: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash_on_delivery' | 'bank_transfer' | 'easypaisa' | 'jazzcash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  variant?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_address: string;
  shipping_area: string;
  shipping_city: string;
  shipping_postal_code: string;
  customer_notes?: string;
  admin_notes?: string;
  courier?: string;
  tracking_number?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount?: number;
  usage_limit: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  customer_name?: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'new_order'
  | 'low_stock'
  | 'customer_review'
  | 'order_placed'
  | 'order_confirmed'
  | 'order_processing'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled';

export interface StoreNotification {
  id: string;
  user_id?: string; // null means global/admin
  type: NotificationType;
  title: string;
  message: string;
  order_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  logo_url?: string;
  description: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  business_hours: string;
  currency: string;
  currency_symbol: string;
  delivery_fee: number;
  free_delivery_threshold: number;
  social_links: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  payment_instructions: {
    bank_transfer?: string;
    easypaisa?: string;
    jazzcash?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}
