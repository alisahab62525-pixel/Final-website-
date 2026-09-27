import {
  Category,
  Product,
  Order,
  Coupon,
  Review,
  StoreNotification,
  StoreSettings,
  Address,
  Profile,
} from '../types';
import {
  initialCategories,
  initialProducts,
  initialOrders,
  initialCoupons,
  initialReviews,
  initialStoreSettings,
} from '../lib/mockData';

// Initial demo profiles (never stored with passwords!)
const initialProfiles: Profile[] = [
  {
    id: 'admin-user-0',
    full_name: 'Ali Store Administrator',
    email: 'admin@alionlinestore.pk',
    phone: '+92 300 1234567',
    role: 'admin',
    avatar_url: '',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'demo-customer-1',
    full_name: 'Farhan Siddiqui',
    email: 'farhan.siddiqui@gmail.com',
    phone: '+92 321 8492019',
    role: 'customer',
    avatar_url: '',
    created_at: new Date('2026-01-10').toISOString(),
    updated_at: new Date('2026-01-10').toISOString(),
  },
];

const initialNotifications: StoreNotification[] = [
  {
    id: 'notif-1',
    user_id: undefined, // Admin notification
    type: 'new_order',
    title: 'New Order Received',
    message: 'Order #ALI-10025 placed by Farhan Siddiqui for Rs. 19,349.',
    order_id: 'ord-10025',
    is_read: false,
    created_at: new Date('2026-03-24T14:30:00Z').toISOString(),
  },
  {
    id: 'notif-2',
    user_id: undefined,
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Waffle Knit Cashmere Wool Cardigan has only 6 units remaining.',
    is_read: false,
    created_at: new Date('2026-03-25T08:00:00Z').toISOString(),
  },
];

const initialAddresses: Address[] = [
  {
    id: 'addr-1',
    user_id: 'demo-customer-1',
    full_name: 'Farhan Siddiqui',
    phone: '+92 321 8492019',
    address_line: 'House 42-B, Street 14, Phase 5 DHA',
    area: 'DHA Phase 5',
    city: 'Lahore',
    postal_code: '54792',
    is_default: true,
    created_at: new Date('2026-01-12').toISOString(),
    updated_at: new Date('2026-01-12').toISOString(),
  },
];

type Listener = () => void;

class InMemoryDatabase {
  categories: Category[] = [...initialCategories];
  products: Product[] = [...initialProducts];
  orders: Order[] = [...initialOrders];
  coupons: Coupon[] = [...initialCoupons];
  reviews: Review[] = [...initialReviews];
  notifications: StoreNotification[] = [...initialNotifications];
  settings: StoreSettings = { ...initialStoreSettings };
  addresses: Address[] = [...initialAddresses];
  profiles: Profile[] = [...initialProfiles];

  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Error in db listener', err);
      }
    });
  }
}

export const inMemoryDb = new InMemoryDatabase();
