"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, X, Tag, User, CreditCard, MapPin, QrCode } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import {
  createOrder,
  validateCouponCode,
  calculateOrderTotal,
  calculateDeliveryCharge,
  getWelcomeMessage,
  checkFirstTimeDiscount,
  OrderData,
  CouponValidationResult,
} from "@/lib/orders";
import { Tables } from "@/types/database.types";

type PaymentOption = Tables<"payment_options">;

interface PaymentOrderFormProps {
  items: any[];
  totalAmount: number;
  onOrderComplete: (order: any) => void;
  onCancel: () => void;
  isModal?: boolean;
}

export default function PaymentOrderForm({
  items,
  totalAmount,
  onOrderComplete,
  onCancel,
  isModal = true,
}: PaymentOrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] =
    useState<CouponValidationResult | null>(null);
  const [showCouponInput, setShowCouponInput] = useState(true);
  const [deliveryLocation, setDeliveryLocation] = useState<
    "inside_kathmandu" | "outside_kathmandu"
  >("inside_kathmandu");
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [partialPaymentPercentage, setPartialPaymentPercentage] = useState(50);

  const [formData, setFormData] = useState<OrderData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    items: items,
    total_amount: totalAmount,
    payment_method: "esewa",
    payment_type: "full",
    partial_payment_percentage: 50,
    notes: "",
    delivery_location: "inside_kathmandu",
    delivery_charge: 100,
  });

  const [discountCalculation, setDiscountCalculation] = useState({
    discountAmount: 0,
    finalAmount: totalAmount,
    couponDiscountPercentage: 0,
  });

  const [orderTotals, setOrderTotals] = useState({
    subtotal: totalAmount,
    discountAmount: 0,
    deliveryCharge: 100,
    totalAmount: totalAmount + 100,
    partialPaymentAmount: 0,
    remainingAmount: 0,
  });

  useEffect(() => {
    fetchUser();
    fetchPaymentOptions();
    updateOrderTotals();
  }, [
    totalAmount,
    discountCalculation.discountAmount,
    deliveryLocation,
    paymentType,
    partialPaymentPercentage,
  ]);

  const fetchPaymentOptions = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_options")
        .select("*")
        .eq("status", "active");

      if (error) throw error;

      setPaymentOptions(data || []);

      // Set default payment method to first available option
      if (data && data.length > 0) {
        setPaymentMethod(data[0].payment_number);
        setFormData((prev) => ({
          ...prev,
          payment_method: data[0].payment_number,
        }));
      }
    } catch (error) {
      console.error("Error fetching payment options:", error);
      toast.error("Failed to load payment options");
    }
  };

  const fetchUser = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    setUser(authUser);

    if (authUser?.user_metadata) {
      setFormData((prev) => ({
        ...prev,
        customer_name:
          authUser.user_metadata.full_name ||
          authUser.user_metadata.display_name ||
          "",
        customer_email: authUser.email || "",
        customer_phone: authUser.user_metadata.phone || "",
        shipping_address: authUser.user_metadata.address || "",
      }));
    }
  };

  const updateOrderTotals = () => {
    const deliveryCharge = calculateDeliveryCharge(deliveryLocation);
    const totals = calculateOrderTotal(
      totalAmount,
      discountCalculation.discountAmount,
      deliveryCharge,
      paymentType === "partial" ? partialPaymentPercentage : undefined,
    );

    setOrderTotals({
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      deliveryCharge: totals.deliveryCharge,
      totalAmount: totals.totalAmount,
      partialPaymentAmount: totals.partialPaymentAmount || 0,
      remainingAmount: totals.remainingAmount || 0,
    });
    setFormData((prev) => ({
      ...prev,
      delivery_charge: deliveryCharge,
      delivery_location: deliveryLocation,
      payment_method: paymentMethod,
      payment_type: paymentType,
      partial_payment_percentage: partialPaymentPercentage,
    }));
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
      items.map((item: any) => item.product_id) || [],
    );
    if (couponValidation && couponValidation.valid) {
      setAppliedCoupon(couponValidation);
      const calculation = calculateOrderTotal(
        totalAmount,
        couponValidation.discount_amount,
        formData.delivery_charge,
        paymentType === "partial" ? partialPaymentPercentage : undefined,
      );

      setDiscountCalculation({
        discountAmount: couponValidation.discount_amount,
        finalAmount: calculation.totalAmount,
        couponDiscountPercentage: Math.round(
          (couponValidation.discount_amount / totalAmount) * 100,
        ),
      });

      updateOrderTotals();
      toast.success(
        `Coupon applied! You saved NPR ${couponValidation.discount_amount}`,
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
    updateOrderTotals();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user is authenticated
      if (!user) {
        toast.error("Please login to place an order");
        setLoading(false);
        return;
      }

      // All payment methods from database require screenshots
      if (!paymentScreenshot) {
        toast.error("Please upload payment screenshot");
        setLoading(false);
        return;
      }

      const orderData: OrderData = {
        ...formData,
        payment_screenshot: paymentScreenshot || undefined,
        coupon_code: appliedCoupon ? couponCode : undefined,
      };

      const order = await createOrder(orderData);
      toast.success("Order placed successfully!");

      // Redirect to success page with order ID and items
      const itemsData = encodeURIComponent(JSON.stringify(items));
      window.location.href = `/order-success?orderId=${order.id}&items=${itemsData}`;
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
      // Stay on the same page so user can retry
    } finally {
      setLoading(false);
    }
  };

  const getQRCodeUrl = (paymentType: string) => {
    // Return QR code URL from payment_options table
    const payment = paymentOptions.find(
      (p) => p.payment_number === paymentType,
    );
    return payment?.qr_image_url || "";
  };

  const formContent = (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Complete Your Order
        </h2>
        {isModal && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

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
            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  Subtotal
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  NPR {orderTotals.subtotal}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    Discount ({discountCalculation.couponDiscountPercentage}%)
                  </span>
                  <span>-NPR {orderTotals.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  Delivery Charge
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  NPR {orderTotals.deliveryCharge}
                </span>
              </div>
              {orderTotals.partialPaymentAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>Partial Payment ({partialPaymentPercentage}%)</span>
                    <span>NPR {orderTotals.partialPaymentAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Remaining Amount</span>
                    <span>NPR {orderTotals.remainingAmount}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white">
                <span>Total</span>
                <span>NPR {orderTotals.totalAmount}</span>
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

        {/* Delivery Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Delivery Location *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                deliveryLocation === "inside_kathmandu"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <input
                type="radio"
                name="delivery_location"
                value="inside_kathmandu"
                checked={deliveryLocation === "inside_kathmandu"}
                onChange={(e) => {
                  setDeliveryLocation(e.target.value as any);
                  updateOrderTotals();
                }}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Inside Kathmandu Valley
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Delivery Charge: NPR 100
                </div>
              </div>
            </label>
            <label
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                deliveryLocation === "outside_kathmandu"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <input
                type="radio"
                name="delivery_location"
                value="outside_kathmandu"
                checked={deliveryLocation === "outside_kathmandu"}
                onChange={(e) => {
                  setDeliveryLocation(e.target.value as any);
                  updateOrderTotals();
                }}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Outside Kathmandu Valley
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Delivery Charge: NPR 200
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <CreditCard className="inline w-4 h-4 mr-1" />
            Payment Method *
          </label>
          <div className="grid grid-cols-1 gap-3">
            {paymentOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === option.payment_number
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={option.payment_number}
                  checked={paymentMethod === option.payment_number}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      payment_method: e.target.value,
                    }));
                  }}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {option.payment_type.charAt(0).toUpperCase() +
                      option.payment_type.slice(1)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Pay via{" "}
                    {option.payment_type.charAt(0).toUpperCase() +
                      option.payment_type.slice(1)}{" "}
                    to {option.payment_number}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Tag className="inline w-4 h-4 mr-1" />
            Payment Type *
          </label>
          <div className="grid grid-cols-1 gap-3">
            <label
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentType === "full"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <input
                type="radio"
                name="payment_type"
                value="full"
                checked={paymentType === "full"}
                onChange={(e) => {
                  setPaymentType("full");
                  setFormData((prev) => ({
                    ...prev,
                    payment_type: "full",
                  }));
                }}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  Full Payment
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Pay the complete amount now
                </div>
              </div>
            </label>

            <label
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentType === "partial"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <input
                type="radio"
                name="payment_type"
                value="partial"
                checked={paymentType === "partial"}
                onChange={(e) => {
                  setPaymentType("partial");
                  setFormData((prev) => ({
                    ...prev,
                    payment_type: "partial",
                  }));
                }}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  Partial Payment
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Pay {partialPaymentPercentage}% now, rest on delivery
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Partial Payment Percentage */}
        {paymentType === "partial" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Partial Payment Percentage *
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="90"
                step="10"
                value={partialPaymentPercentage}
                onChange={(e) => {
                  setPartialPaymentPercentage(parseInt(e.target.value));
                  setFormData((prev) => ({
                    ...prev,
                    partial_payment_percentage: parseInt(e.target.value),
                  }));
                  updateOrderTotals();
                }}
                className="flex-1"
              />
              <span className="font-medium text-gray-900 dark:text-white min-w-[60px]">
                {partialPaymentPercentage}%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              You'll pay NPR {orderTotals.partialPaymentAmount} now and NPR{" "}
              {orderTotals.remainingAmount} on delivery
            </p>
          </div>
        )}

        {/* QR Code Display */}
        {(() => {
          const selectedPayment = paymentOptions.find(
            (option) => option.payment_number === paymentMethod,
          );
          return selectedPayment?.qr_image_url ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                  Scan QR Code to Pay
                </h4>
              </div>
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300">
                  <img
                    src={selectedPayment.qr_image_url || ""}
                    alt={`${selectedPayment.payment_type} QR Code`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 text-center mt-3">
                Scan with your{" "}
                {selectedPayment.payment_type.charAt(0).toUpperCase() +
                  selectedPayment.payment_type.slice(1)}{" "}
                app and upload screenshot below
              </p>
            </div>
          ) : null;
        })()}

        {/* Coupon Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Tag className="inline w-4 h-4 mr-1" />
            Coupon Code (Optional)
          </label>

          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {couponCode} - {discountCalculation.couponDiscountPercentage}%
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
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
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
          )}
        </div>

        {/* Payment Screenshot Upload */}
        {paymentOptions.find(
          (option) => option.payment_number === paymentMethod,
        ) && (
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
              : `Pay NPR ${orderTotals.partialPaymentAmount || orderTotals.totalAmount}`}
          </button>
        </div>
      </form>
    </>
  );

  if (isModal) {
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
          {formContent}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      {formContent}
    </motion.div>
  );
}
