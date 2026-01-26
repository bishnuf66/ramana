"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/components/context/CartContext";
import PaymentOrderForm from "@/components/orders/PaymentOrderForm";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart } = useCart();

  // Get selected items from sessionStorage or fall back to full cart
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  useEffect(() => {
    // Try to get selected items from sessionStorage
    const storedItems = sessionStorage.getItem("selectedCheckoutItems");
    if (storedItems) {
      try {
        const parsed = JSON.parse(storedItems);
        setSelectedItems(parsed);
      } catch (error) {
        console.error("Error parsing selected items:", error);
        setSelectedItems(cart);
      }
    } else {
      setSelectedItems(cart);
    }
  }, [cart]);

  // Calculate total from selected items
  const total = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  }, [selectedItems]);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Convert selected items to the format expected by PaymentOrderForm
  const orderItems = selectedItems.map((item) => ({
    id: item.id,
    title: item.title || "Product",
    price: item.price,
    quantity: item.quantity,
  }));

  useEffect(() => {
    if (selectedItems.length === 0) {
      router.push("/cart");
    }
  }, [selectedItems.length, router]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProfile(true);
        await supabase.auth.getUser();
      } catch (e) {
        // no-op
      } finally {
        setLoadingProfile(false);
      }
    };

    load();
  }, []);

  const handleOrderComplete = (order: any) => {
    console.log("Order created successfully:", order);
    clearCart();

    // Redirect to success page with order ID
    router.push(`/order-success?orderId=${order.id}`);
  };

  const handleCancel = () => {
    setShowPaymentForm(false);
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No items selected for checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please select items from your cart to checkout
          </p>
          <button
            onClick={() => router.push("/cart")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Checkout
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Complete your order details and payment.
        </p>

        {/* Cart Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Order Summary
          </h2>
          <div className="space-y-3 mb-4">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    NPR {item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Total: NPR {total}
              </span>
            </div>

            <button
              onClick={() => setShowPaymentForm(true)}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Proceed to Payment
            </button>
          </div>
        </div>

        {/* Features Display */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
            Payment & Delivery Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-blue-700 dark:text-blue-300">
                Payment Methods
              </h3>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  eSewa - Full payment with QR code
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Khalti - Full payment with QR code
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Partial Payment - Pay 50% now, 50% on delivery
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-blue-700 dark:text-blue-300">
                Delivery Charges
              </h3>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Inside Kathmandu Valley: NPR 100
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Outside Kathmandu Valley: NPR 200
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Real-time calculation based on location
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Order Form Modal */}
        {showPaymentForm && (
          <PaymentOrderForm
            items={orderItems}
            totalAmount={total}
            onOrderComplete={handleOrderComplete}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
