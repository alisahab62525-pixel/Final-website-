import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { inMemoryDb } from './dbStore';
import { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus, CartItem } from '../types';
import { notificationService } from './notificationService';
import { couponService } from './couponService';

export interface PlaceOrderInput {
  customerId: string;
  items: CartItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    addressLine: string;
    area: string;
    city: string;
    postalCode: string;
  };
  paymentMethod: PaymentMethod;
  couponCode?: string;
  customerNotes?: string;
}

export const orderService = {
  // Generate unique order number (e.g. ALI-10026)
  generateOrderNumber(): string {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `ALI-${randomSuffix}`;
  },

  // Place Order with complete server/service validation
  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    if (!input.customerId) {
      throw new Error('Authentication required: You must be logged in to place an order.');
    }
    if (!input.items || input.items.length === 0) {
      throw new Error('Your cart is empty.');
    }
    if (!input.shippingAddress.fullName || !input.shippingAddress.phone || !input.shippingAddress.addressLine || !input.shippingAddress.city) {
      throw new Error('Please fill in all mandatory shipping address fields.');
    }

    const settings = inMemoryDb.settings;

    // 1. Validate Product Availability & calculate exact server-side subtotal
    let subtotal = 0;
    const validatedOrderItems: Array<{
      productId: string;
      productName: string;
      productImage: string;
      quantity: number;
      unitPrice: number;
      variant?: string;
    }> = [];

    for (const item of input.items) {
      const prod = inMemoryDb.products.find(p => p.id === item.product.id);
      if (!prod || !prod.is_active) {
        throw new Error(`Product "${item.product.name}" is no longer available.`);
      }
      if (prod.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.name}". Only ${prod.stock_quantity} left.`);
      }

      const activeUnitPrice = prod.discount_price ?? prod.price;
      subtotal += activeUnitPrice * item.quantity;

      validatedOrderItems.push({
        productId: prod.id,
        productName: prod.name,
        productImage: (prod.images && prod.images[0]?.image_url) || '/src/assets/images/hero_ali_store_showcase_1790526590148.jpg',
        quantity: item.quantity,
        unitPrice: activeUnitPrice,
        variant: item.variant,
      });
    }

    // 2. Validate Coupon securely
    let discount = 0;
    if (input.couponCode) {
      const couponCheck = await couponService.validateCoupon(input.couponCode, subtotal);
      if (couponCheck.isValid && couponCheck.coupon) {
        discount = couponCheck.calculatedDiscount;
        // Increment coupon used_count
        const coup = inMemoryDb.coupons.find(c => c.id === couponCheck.coupon!.id);
        if (coup) {
          coup.used_count += 1;
        }
      }
    }

    // 3. Calculate Delivery Fee
    const deliveryFee = subtotal >= settings.free_delivery_threshold ? 0 : settings.delivery_fee;
    const grandTotal = Math.max(0, subtotal - discount + deliveryFee);
    const orderNumber = this.generateOrderNumber();
    const orderId = 'ord-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const orderData: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: input.customerId,
      subtotal,
      discount,
      delivery_fee: deliveryFee,
      total: grandTotal,
      payment_method: input.paymentMethod,
      payment_status: input.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
      status: 'pending',
      shipping_full_name: input.shippingAddress.fullName,
      shipping_phone: input.shippingAddress.phone,
      shipping_email: input.shippingAddress.email,
      shipping_address: input.shippingAddress.addressLine,
      shipping_area: input.shippingAddress.area,
      shipping_city: input.shippingAddress.city,
      shipping_postal_code: input.shippingAddress.postalCode,
      customer_notes: input.customerNotes,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      // Supabase transaction
      const { data: createdOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          ...orderData,
        })
        .select()
        .single();

      if (orderErr || !createdOrder) throw new Error(orderErr?.message || 'Failed to place order in database');

      const itemsToInsert = validatedOrderItems.map(item => ({
        order_id: createdOrder.id,
        product_id: item.productId,
        product_name: item.productName,
        product_image: item.productImage,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        variant: item.variant || '',
      }));

      await supabase.from('order_items').insert(itemsToInsert);

      // Decrement inventory
      for (const item of validatedOrderItems) {
        const { data: p } = await supabase.from('products').select('stock_quantity').eq('id', item.productId).single();
        if (p) {
          await supabase
            .from('products')
            .update({ stock_quantity: Math.max(0, p.stock_quantity - item.quantity) })
            .eq('id', item.productId);
        }
      }

      orderData.id = createdOrder.id;
    } else {
      // In-memory insertion
      const finalItems: OrderItem[] = validatedOrderItems.map(item => ({
        id: 'oi-' + Math.random().toString(36).substring(2, 9),
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        product_image: item.productImage,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        variant: item.variant,
        created_at: now,
      }));

      orderData.items = finalItems;
      inMemoryDb.orders.unshift(orderData);

      // Decrement inventory
      for (const item of validatedOrderItems) {
        const prod = inMemoryDb.products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
          if (prod.stock_quantity <= prod.low_stock_threshold) {
            // Trigger low stock notification for admin
            notificationService.createNotification({
              type: 'low_stock',
              title: 'Low Stock Alert',
              message: `Inventory for "${prod.name}" dropped to ${prod.stock_quantity} units remaining.`,
              order_id: orderData.id,
            });
          }
        }
      }

      inMemoryDb.notify();
    }

    // Dispatch Admin Notification
    await notificationService.createNotification({
      type: 'new_order',
      title: 'New Order Received',
      message: `Order #${orderNumber} placed by ${input.shippingAddress.fullName} for Rs. ${grandTotal.toLocaleString()}`,
      order_id: orderData.id,
    });

    // Dispatch Customer Notification
    await notificationService.createNotification({
      user_id: input.customerId,
      type: 'order_placed',
      title: 'Order Confirmed',
      message: `Your order #${orderNumber} has been received and is pending confirmation.`,
      order_id: orderData.id,
    });

    return orderData;
  },

  // Get orders for customer
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []).map((o: any) => ({
        ...o,
        items: o.order_items,
      }));
    } else {
      return inMemoryDb.orders
        .filter(o => o.customer_id === customerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  // Get single order by ID or order_number
  async getOrder(orderIdOrNumber: string): Promise<Order | null> {
    if (isSupabaseConfigured()) {
      const isUuid = orderIdOrNumber.includes('-');
      const query = supabase.from('orders').select('*, order_items(*)');
      const { data, error } = await (isUuid ? query.eq('id', orderIdOrNumber) : query.eq('order_number', orderIdOrNumber)).single();

      if (error || !data) return null;
      return {
        ...data,
        items: (data as any).order_items,
      };
    } else {
      const found = inMemoryDb.orders.find(o => o.id === orderIdOrNumber || o.order_number === orderIdOrNumber);
      return found ? { ...found } : null;
    }
  },

  // Admin: Get all orders with filter
  async getAllOrders(statusFilter?: OrderStatus | 'all', search?: string): Promise<Order[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (search) {
        query = query.or(`order_number.ilike.%${search}%,shipping_full_name.ilike.%${search}%,shipping_phone.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data || []).map((o: any) => ({
        ...o,
        items: o.order_items,
      }));
    } else {
      let list = [...inMemoryDb.orders];
      if (statusFilter && statusFilter !== 'all') {
        list = list.filter(o => o.status === statusFilter);
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(o =>
          o.order_number.toLowerCase().includes(q) ||
          o.shipping_full_name.toLowerCase().includes(q) ||
          o.shipping_phone.toLowerCase().includes(q) ||
          o.shipping_city.toLowerCase().includes(q)
        );
      }
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  // Admin: Update order status & courier details
  async updateOrderStatus(
    orderId: string,
    updates: {
      status?: OrderStatus;
      payment_status?: PaymentStatus;
      courier?: string;
      tracking_number?: string;
      admin_notes?: string;
    }
  ): Promise<Order> {
    const now = new Date().toISOString();

    let updatedOrder: Order;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: now,
        })
        .eq('id', orderId)
        .select('*, order_items(*)')
        .single();

      if (error || !data) throw new Error(error?.message || 'Failed to update order');
      updatedOrder = { ...data, items: (data as any).order_items };
    } else {
      const index = inMemoryDb.orders.findIndex(o => o.id === orderId);
      if (index === -1) throw new Error('Order not found');

      inMemoryDb.orders[index] = {
        ...inMemoryDb.orders[index],
        ...updates,
        updated_at: now,
      };
      updatedOrder = inMemoryDb.orders[index];
      inMemoryDb.notify();
    }

    // Send customer notification on status change
    if (updates.status) {
      const statusTitleMap: Record<OrderStatus, string> = {
        pending: 'Order Pending',
        confirmed: 'Order Confirmed',
        processing: 'Order in Processing',
        shipped: 'Order Shipped with Tracking',
        delivered: 'Order Delivered Successfully',
        cancelled: 'Order Cancelled',
      };

      const courierInfo = updates.courier && updates.tracking_number
        ? ` via ${updates.courier} (Tracking: ${updates.tracking_number})`
        : '';

      await notificationService.createNotification({
        user_id: updatedOrder.customer_id,
        type: `order_${updates.status}` as any,
        title: statusTitleMap[updates.status] || 'Order Status Updated',
        message: `Your order #${updatedOrder.order_number} status is now ${updates.status.toUpperCase()}${courierInfo}.`,
        order_id: updatedOrder.id,
      });
    }

    return updatedOrder;
  },
};
