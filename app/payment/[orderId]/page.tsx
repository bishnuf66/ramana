"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const paymentType = searchParams?.get('type') || 'remaining';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [paymentOptions, setPaymentOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchOrderDetails();
    fetchPaymentOptions();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentOptions = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_options")
        .select("*")
        .eq("status", "active");

      if (error) throw error;
      setPaymentOptions(data || []);
      
      // Set default payment method
      if (data && data.length > 0) {
        setPaymentMethod(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching payment options:", error);
      toast.error("Failed to load payment options");
    }
  };

  const handlePaymentScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPaymentScreenshot = async (file: File): Promise<string> => {
    const fileName = `payment-${orderId}-${Date.now()}`;
    const { data, error } = await supabase.storage
      .from("payment-screenshots")
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("payment-screenshots")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!paymentScreenshot) {
      toast.error("Please upload a payment screenshot");
      return;
    }

    setProcessing(true);

    try {
      // Upload payment screenshot
      const screenshotUrl = await uploadPaymentScreenshot(paymentScreenshot);

      // Create payment record
      const { error: paymentError } = await supabase
        .from("user_payments")
        .insert({
          order_id: orderId,
          user_id: order.user_id,
          payment_option_id: paymentMethod,
          payment_type: "remaining",
          paid_amount: order.remaining_amount,
          remaining_amount: 0,
          paid_amount_percentage: 100,
          payment_screenshot: screenshotUrl,
          is_verified: false,
        });

      if (paymentError) throw paymentError;

      // Update order payment status
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          remaining_amount: 0,
        })
        .eq("id", orderId);

      if (orderError) throw orderError;

      toast.success("Payment submitted successfully! We'll verify it shortly.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Order not found</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Complete Payment
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Order #{orderId.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Order Summary
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Total Amount:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  Rs {order.total_amount?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Already Paid:
                </span>
                <span className="font-medium text-green-600">
                  Rs {(order.total_amount - (order.remaining_amount || 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="font-medium text-gray-900 dark:text-white">
                  Remaining Payment:
                </span>
                <span className="font-bold text-lg text-orange-600">
                  Rs {order.remaining_amount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmitPayment} className="space-y-6">
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
                      paymentMethod === option.id
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={option.id}
                      checked={paymentMethod === option.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
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

            {/* QR Code Display */}
            {(() => {
              const selectedPayment = paymentOptions.find(
                (option) => option.id === paymentMethod,
              );
              return selectedPayment?.qr_image_url ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                      Scan QR Code to Pay
                    </h4>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300">
                      <img
                        src={selectedPayment.qr_image_url}
                        alt={`${selectedPayment.payment_type} QR Code`}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Payment Screenshot Upload */}
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
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                    </div>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : `Pay Rs ${order.remaining_amount?.toFixed(2)}`}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
