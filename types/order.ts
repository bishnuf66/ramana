// Updated types for orders with payment integration

export interface CartItem {
  id: string;
  user_id?: string;
  product_id: string;
  quantity: number;
  added_at?: string;
  products?: {
    id: string;
    title: string;
    price: number;
    cover_image?: string;
  };
}

export interface CheckoutSession {
  id: string;
  user_id?: string;
  selected_items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  expires_at: string;
  created_at?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_method: "cod" | "khalti" | "esewa" | "bank_transfer";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_screenshot?: string;
  items: any[]; // JSONB array of order items
  cart_items?: any[]; // JSONB array of cart items used for checkout
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderFormData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  payment_method: "cod" | "khalti" | "esewa" | "bank_transfer";
  payment_screenshot?: File;
  notes?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  displayName: string;
  requiresScreenshot: boolean;
  description: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cod",
    name: "cod",
    displayName: "Cash on Delivery",
    requiresScreenshot: false,
    description: "Pay when you receive your order",
  },
  {
    id: "khalti",
    name: "khalti",
    displayName: "Khalti",
    requiresScreenshot: true,
    description: "Pay via Khalti and upload screenshot",
  },
  {
    id: "esewa",
    name: "esewa",
    displayName: "eSewa",
    requiresScreenshot: true,
    description: "Pay via eSewa and upload screenshot",
  },
  {
    id: "bank_transfer",
    name: "bank_transfer",
    displayName: "Bank Transfer",
    requiresScreenshot: true,
    description: "Transfer to bank account and upload receipt",
  },
];
