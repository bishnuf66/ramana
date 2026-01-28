"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, CreditCard, Upload, X, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { Tables, Database } from "@/types/database.types";

type CartItem = {
  id: string;
  product_id: string;
  title: string;
  price: number;
  discount_price?: number;
  cover_image: string;
  quantity: number;
  slug: string;
  products?: {
    id: string;
    title: string;
    price: number;
    discount_price?: number;
    cover_image: string;
    slug: string;
  };
};

type Order = Tables<"orders"> & {
  payment_method?: string;
};

type OrderFormData = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: string;
  notes: string;
  items?: any;
  total_amount?: number;
  user_id?: string;
  order_status?: string;
  payment_status?: string;
};

const PAYMENT_METHODS = [
  {
    id: "esewa",
    name: "eSewa",
    displayName: "eSewa",
    description: "Pay via eSewa wallet",
    requiresScreenshot: false,
  },
  {
    id: "khalti",
    name: "Khalti",
    displayName: "Khalti",
    description: "Pay via Khalti wallet",
    requiresScreenshot: false,
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    displayName: "Bank Transfer",
    description: "Direct bank transfer",
    requiresScreenshot: true,
  },
] as const;

interface CheckoutProps {
  selectedItems: string[];
  onCheckoutComplete: (order: Order) => void;
  onCancel: () => void;
}

export default function Checkout({
  selectedItems,
  onCheckoutComplete,
  onCancel,
}: CheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");

  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    payment_method: "cod",
    notes: "",
  });

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchUserAndCartItems();
  }, [selectedItems]);

  const fetchUserAndCartItems = async () => {
    try {
      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser);

      // Get cart items
      let query = supabase.from("cart_items").select(`
        *,
        products (*)
      `);

      if (authUser) {
        query = query.eq("user_id", authUser.id);
      } else {
        // For guest users, you might want to use session_id or another identifier
        // For now, we'll skip guest cart functionality
        toast.error("Please log in to checkout");
        onCancel();
        return;
      }

      const { data: items, error } = await query.in(
        "product_id",
        selectedItems,
      );

      if (error) throw error;

      // Filter only selected items
      const selectedCartItems =
        items?.filter((item) => selectedItems.includes(item.product_id)) || [];
      setCartItems(selectedCartItems);

      // Calculate total
      const total = selectedCartItems.reduce((sum, item) => {
        const price = item.products?.price || 0;
        return sum + price * item.quantity;
      }, 0);
      setTotalAmount(total);

      // Pre-fill form data if user is logged in
      if (authUser?.user_metadata) {
        setFormData((prev) => ({
          ...prev,
          customer_name: authUser.user_metadata.full_name || "",
          customer_email: authUser.email || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast.error("Failed to load cart items");
    }
  };

  const handlePaymentScreenshotChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Screenshot must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      setPaymentScreenshot(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let screenshotUrl = "";

      // Upload payment screenshot if required
      if (
        PAYMENT_METHODS.find((m) => m.id === formData.payment_method)
          ?.requiresScreenshot
      ) {
        if (!paymentScreenshot) {
          toast.error("Please upload payment screenshot");
          setLoading(false);
          return;
        }

        const fileName = `payment-screenshots/${Date.now()}-${paymentScreenshot.name}`;
        const { error: uploadError } = await supabase.storage
          .from("payment-screenshots")
          .upload(fileName, paymentScreenshot);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("payment-screenshots").getPublicUrl(fileName);

        screenshotUrl = publicUrl;
      }

      // Prepare order items
      const orderItems = cartItems.map((item) => ({
        id: item.product_id,
        title: item.products?.title || "",
        price: item.products?.price || 0,
        quantity: item.quantity,
        cover_image: item.products?.cover_image || "",
      }));

      // Create order
      const orderData = {
        user_id: user?.id,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
        total_amount: totalAmount,
        status: "pending",
        payment_method: formData.payment_method,
        payment_status:
          formData.payment_method === "cod" ? "pending" : "pending",
        payment_screenshot: screenshotUrl || null,
        items: orderItems,
        cart_items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        notes: formData.notes,
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Clear cart items for this order
      if (user) {
        await supabase
          .from("cart_items")
          .delete()
          .in("product_id", selectedItems)
          .eq("user_id", user.id);
      }

      toast.success("Order placed successfully!");
      onCheckoutComplete(order);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const selectedPaymentMethod = PAYMENT_METHODS.find(
    (m) => m.id === formData.payment_method,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Checkout
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Order Summary
            </h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {item.products?.title} x {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    NPR {(item.products?.price || 0) * item.quantity}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>NPR {totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customer_name: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.customer_email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customer_email: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customer_phone: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shipping Address *
              </label>
              <input
                type="text"
                required
                value={formData.shipping_address}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shipping_address: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.payment_method === method.id
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.id}
                    checked={formData.payment_method === method.id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        payment_method: e.target.value as any,
                      }))
                    }
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {method.displayName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {method.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Screenshot Upload */}
          {selectedPaymentMethod?.requiresScreenshot && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Screenshot *
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                {screenshotPreview ? (
                  <div className="relative">
                    <img
                      src={screenshotPreview}
                      alt="Payment screenshot"
                      className="w-full h-48 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentScreenshot(null);
                        setScreenshotPreview("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload payment screenshot
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePaymentScreenshotChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Any special instructions for your order..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : `Place Order - NPR ${totalAmount}`}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
