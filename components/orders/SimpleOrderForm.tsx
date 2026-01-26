"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, X, Tag, User, CreditCard, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import {
  createOrder,
  validateCouponCode,
  calculateDiscount,
  getWelcomeMessage,
  checkFirstTimeDiscount,
  OrderData,
  CouponValidationResult,
} from "@/lib/orders";

interface SimpleOrderFormProps {
  items: any[];
  totalAmount: number;
  onOrderComplete: (order: any) => void;
  onCancel: () => void;
}

export default function SimpleOrderForm({
  items,
  totalAmount,
  onOrderComplete,
  onCancel,
}: SimpleOrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] =
    useState<CouponValidationResult | null>(null);
  const [showCouponInput, setShowCouponInput] = useState(false);

  const [formData, setFormData] = useState<OrderData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    items: items,
    total_amount: totalAmount,
    payment_method: "cod",
    notes: "",
  });

  const [discountCalculation, setDiscountCalculation] = useState({
    discountAmount: 0,
    finalAmount: totalAmount,
    couponDiscountPercentage: 0,
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    setUser(authUser);

    // Pre-fill form data if user is logged in
    if (authUser?.user_metadata) {
      setFormData((prev) => ({
        ...prev,
        customer_name: authUser.user_metadata.full_name || "",
        customer_email: authUser.email || "",
      }));
    }
  };

  const handlePaymentScreenshotChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Screenshot must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      setPaymentScreenshot(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    const couponValidation = await validateCouponCode(
      couponCode,
      formData.customer_email,
      totalAmount,
    );
    if (couponValidation && couponValidation.valid) {
      setAppliedCoupon(couponValidation);
      const calculation = calculateDiscount(
        totalAmount,
        couponValidation.discount_amount,
      );
      setDiscountCalculation({
        discountAmount: calculation.discountAmount,
        finalAmount: calculation.finalAmount,
        couponDiscountPercentage: Math.round(
          (couponValidation.discount_amount / totalAmount) * 100,
        ),
      });
      toast.success(
        `Coupon applied! You saved NPR ${calculation.discountAmount}`,
      );
    } else {
      toast.error("Invalid or expired coupon code");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setDiscountCalculation({
      discountAmount: 0,
      finalAmount: totalAmount,
      couponDiscountPercentage: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData: OrderData = {
        ...formData,
        payment_screenshot: paymentScreenshot || undefined,
        coupon_code: appliedCoupon?.code,
      };

      const order = await createOrder(orderData);
      toast.success("Order placed successfully!");
      onOrderComplete(order);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: "cod", name: "Cash on Delivery", requiresScreenshot: false },
    { id: "khalti", name: "Khalti", requiresScreenshot: true },
    { id: "esewa", name: "eSewa", requiresScreenshot: true },
    { id: "bank_transfer", name: "Bank Transfer", requiresScreenshot: true },
  ];

  const selectedPaymentMethod = paymentMethods.find(
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
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Complete Your Order
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Welcome message for non-logged users */}
        {!user && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {getWelcomeMessage()}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Create an account to unlock exclusive discounts!
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Order Summary
            </h3>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {item.title} x {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    NPR {item.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    Subtotal
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    NPR {totalAmount}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedCoupon.discount_percentage}%)</span>
                    <span>-NPR {discountCalculation.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>NPR {discountCalculation.finalAmount}</span>
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

          {/* Coupon Code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Coupon Code
              </label>
              {!appliedCoupon && (
                <button
                  type="button"
                  onClick={() => setShowCouponInput(!showCouponInput)}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  {showCouponInput ? "Hide" : "Have a coupon?"}
                </button>
              )}
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    {appliedCoupon.code} - {appliedCoupon.discount_percentage}%
                    OFF
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              showCouponInput && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )
            )}

            {/* Available Coupons */}
            {showCouponInput && availableCoupons.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Available coupons:
                </p>
                <div className="space-y-1">
                  {availableCoupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="text-xs text-gray-600 dark:text-gray-400"
                    >
                      • {coupon.code} - {coupon.discount_percentage}% OFF
                      {coupon.min_amount && ` (Min: NPR ${coupon.min_amount})`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
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
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {method.name}
                    </span>
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
              {loading
                ? "Processing..."
                : `Place Order - NPR ${discountCalculation.finalAmount}`}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
