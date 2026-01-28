"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/components/context/CartContext";
import { useCheckout } from "@/components/context/CheckoutContext";
import { useAuthModal } from "@/components/context/AuthModalContext";
import PaymentOrderForm from "@/components/orders/PaymentOrderForm";

export default function CheckoutPage() {
  const router = useRouter();
  const { openLoginModal } = useAuthModal();
  const { cart, getTotalPrice, removeFromCart } = useCart();
  const { selectedItems, getCheckoutTotal, clearSelectedItems } = useCheckout();

  const [showPaymentForm, setShowPaymentForm] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Calculate total from selected items
  const total = useMemo(() => {
    return getCheckoutTotal();
  }, [selectedItems, getCheckoutTotal]);

  // Convert selected items to the format expected by PaymentOrderForm
  const orderItems = selectedItems.map((item) => ({
    id: item.id,
    title: item.title || "Product",
    price: item.price,
    quantity: item.quantity,
    slug: item.slug, // Include slug for product links
    cover_image: item.cover_image, // Include cover image
    discount_price: item.discount_price, // Include discount price
  }));

  useEffect(() => {
    console.log("Checkout page - Selected items:", selectedItems);
    console.log("Checkout page - Selected items length:", selectedItems.length);

    if (selectedItems.length === 0) {
      console.log("No selected items found, redirecting to cart");
      router.push("/cart");
    }
  }, [selectedItems.length, router]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProfile(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserId(user?.id ?? null);
      } catch (e) {
        console.error("Authentication error:", e);
      } finally {
        setLoadingProfile(false);
      }
    };

    load();
  }, []);

  const handleOrderComplete = (order: any) => {
    console.log("Order created successfully:", order);

    // Remove only the items that were checked out from cart
    selectedItems.forEach((item) => {
      removeFromCart(item.id);
    });

    // Clear checkout context
    clearSelectedItems();

    // Redirect to success page with order ID
    router.push(`/order-success?orderId=${order.id}`);
  };

  const handleCancel = () => {
    router.push("/cart");
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Login Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login to access the checkout page
          </p>
          <button
            onClick={() => router.push("/cart")}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mr-4"
          >
            Back to Cart
          </button>
          <button
            onClick={openLoginModal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
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

        {/* Payment Form */}
        <PaymentOrderForm
          items={orderItems}
          totalAmount={total}
          onOrderComplete={handleOrderComplete}
          onCancel={handleCancel}
          isModal={false}
        />
      </div>
    </div>
  );
}
