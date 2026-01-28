"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  MapPin,
  Package,
  CreditCard,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  User,
  Phone,
  Mail,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Database } from "@/types/database.types";
import { supabase } from "@/lib/supabase/client";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type UserPayment = Database["public"]["Tables"]["user_payments"]["Row"] & {
  payment_option?: {
    payment_type: string;
    payment_number: string;
  };
};

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  cover_image?: string;
  discount_price?: number;
  slug?: string;
}

interface OrderViewModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderViewModal({
  order,
  isOpen,
  onClose,
}: OrderViewModalProps) {
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && order.id) {
      fetchOrderPayments();
    }
  }, [isOpen, order.id]);

  const fetchOrderPayments = async () => {
    setLoadingPayments(true);
    setPaymentsError(null);
    try {
      const { data: payments, error } = await supabase
        .from("user_payments")
        .select(
          `
          *,
          payment_option:payment_options(
            payment_type,
            payment_number
          )
        `,
        )
        .eq("order_id", order.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setPayments(payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPaymentsError(
        error instanceof Error ? error.message : "Failed to fetch payments",
      );
    } finally {
      setLoadingPayments(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (isVerified: boolean) => {
    return isVerified
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toFixed(2)}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order Details
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Order #{order.id?.slice(0, 8) || "N/A"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    order.order_status || "pending",
                  )}`}
                >
                  {(order.order_status || "pending").toUpperCase()}
                </span>
                {order.remaining_amount && order.remaining_amount > 0 && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    Partial Payment
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Order Date
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Name:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {order.customer_name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Email:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {order.customer_email || "N/A"}
                  </span>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Phone:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {order.customer_phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Address:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {order.shipping_address || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Order Items
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                {Array.isArray(order.items) ? (
                  (order.items as unknown as OrderItem[]).map(
                    (item: OrderItem, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {item.cover_image && (
                            <img
                              src={item.cover_image}
                              alt={item.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <a
                              href={`/products/${item.slug || item.id}`}
                              className="font-medium text-green-600 hover:text-green-700 hover:underline"
                            >
                              {item.title}
                            </a>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantity: {item.quantity}
                            </p>
                            {item.discount_price && (
                              <p className="text-sm text-green-600">
                                Discount: Rs {item.price - item.discount_price}{" "}
                                off each
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(
                              (item.discount_price || item.price) *
                                item.quantity,
                            )}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(item.discount_price || item.price)}{" "}
                            each
                            {item.discount_price && (
                              <span className="line-through ml-1">
                                {formatCurrency(item.price)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    No items data available
                  </p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Order Summary
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                {order.subtotal_amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      Subtotal
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(order.subtotal_amount)}
                    </span>
                  </div>
                )}
                {order.discount_amount && order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                {order.delivery_charge && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      Delivery Charge
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(order.delivery_charge)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total Amount
                  </span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
                {order.remaining_amount && order.remaining_amount > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Remaining Amount</span>
                    <span className="font-medium">
                      {formatCurrency(order.remaining_amount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment History
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {loadingPayments ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      Loading payments...
                    </p>
                  </div>
                ) : paymentsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 dark:text-red-400">
                      {paymentsError}
                    </p>
                  </div>
                ) : payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                  payment.is_verified,
                                )}`}
                              >
                                {payment.is_verified ? "Verified" : "Pending"}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {payment.payment_type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(
                                payment.created_at,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(payment.paid_amount)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {payment.paid_amount_percentage}% of total
                            </p>
                          </div>
                        </div>
                        {payment.payment_screenshot && (
                          <div className="mt-3">
                            <a
                              href={payment.payment_screenshot}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                            >
                              <ImageIcon className="w-4 h-4" />
                              View Payment Screenshot
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 dark:text-gray-400 py-4">
                    No payment records found
                  </p>
                )}
              </div>
            </div>

            {/* Cancellation Information */}
            {order.cancellation_request && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Cancellation Information
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800 dark:text-red-200">
                        Cancellation Requested
                      </span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <strong>Reason:</strong> {order.cancellation_reason}
                    </p>
                    {order.cancellation_requested_at && (
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Requested:</strong>{" "}
                        {new Date(
                          order.cancellation_requested_at,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Return Information */}
            {order.return_request && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Return Information
                </h3>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-orange-800 dark:text-orange-200">
                        Return Requested
                      </span>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      <strong>Reason:</strong> {order.return_reason}
                    </p>
                    {order.return_requested_at && (
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        <strong>Requested:</strong>{" "}
                        {new Date(
                          order.return_requested_at,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Notes */}
            {order.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Order Notes
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {order.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Coupon Information */}
            {order.coupon_code && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Coupon Applied
                </h3>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>Coupon Code:</strong> {order.coupon_code}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
