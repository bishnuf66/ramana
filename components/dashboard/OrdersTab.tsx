"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  XCircle,
  CreditCard,
  RotateCcw,
  Package,
  Calendar,
  MapPin,
  Eye,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import OrderViewModal from "./OrderViewModal";

interface UserOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: any;
  created_at: string;
  cancellation_request?: boolean;
  cancellation_reason?: string;
  cancellation_requested_at?: string;
  payment_status?: string;
  remaining_amount?: number;
  return_request?: any;
  return_reason?: string;
  return_requested_at?: string;
}

interface OrdersTabProps {
  orders: UserOrder[];
  canCancelOrder: (order: UserOrder) => boolean;
  openCancellationModal: (orderId: string) => void;
  handleWithdrawCancellation: (orderId: string) => void;
}

export default function OrdersTab({
  orders,
  canCancelOrder,
  openCancellationModal,
  handleWithdrawCancellation,
}: OrdersTabProps) {
  const router = useRouter();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePayRemaining = (orderId: string) => {
    // Navigate to payment page for remaining amount
    router.push(`/payment/${orderId}?type=remaining`);
  };

  const handleReturnRequest = (orderId: string) => {
    // Open return request modal or navigate to return page
    router.push(`/return/${orderId}`);
  };

  const handleViewDetails = (order: UserOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Orders Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Start shopping to see your orders here
        </p>
        <button
          onClick={() => router.push("/products")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {/* Order Header */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Order #{order.id.slice(0, 8)}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Rs {order.total_amount.toFixed(2)}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                    {order.payment_status && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(
                          order.payment_status,
                        )}`}
                      >
                        {order.payment_status.replace("_", " ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <p>
                    <strong>Shipping Address:</strong> {order.shipping_address}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <p>
                    <strong>Items:</strong>{" "}
                    {Array.isArray(order.items) ? order.items.length : 0} items
                  </p>
                  <button
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    {expandedOrder === order.id ? "Hide" : "View"} Items
                  </button>
                </div>
              </div>

              {/* Expanded Items View */}
              {expandedOrder === order.id && Array.isArray(order.items) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    Order Items
                  </h5>
                  <div className="space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {item.cover_image && (
                            <img
                              src={item.cover_image}
                              alt={item.title}
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                          <div className="flex flex-col">
                            <a
                              href={`/products/${item.slug || item.id}`}
                              className="text-green-600 hover:text-green-700 hover:underline font-medium"
                            >
                              {item.title || `Item ${index + 1}`}
                            </a>
                            <span className="text-gray-500 text-xs">
                              View Product →
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-900 dark:text-white">
                            Rs{" "}
                            {(item.discount_price || item.price) *
                              item.quantity}
                          </span>
                          <span className="text-gray-500 text-xs ml-2">
                            x{item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Remaining Amount Display */}
              {order.remaining_amount && order.remaining_amount > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Remaining Payment
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Amount due on delivery
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-800 dark:text-yellow-200">
                        Rs {order.remaining_amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handlePayRemaining(order.id)}
                        className="mt-1 px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Status */}
              {order.cancellation_request && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Cancellation Requested
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        Reason: {order.cancellation_reason}
                      </p>
                      {order.cancellation_requested_at && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          Requested:{" "}
                          {new Date(
                            order.cancellation_requested_at,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleWithdrawCancellation(order.id)}
                      className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    >
                      Withdraw Request
                    </button>
                  </div>
                </div>
              )}

              {/* Return Status */}
              {order.return_request && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Return Requested
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Reason: {order.return_reason}
                      </p>
                      {order.return_requested_at && (
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          Requested:{" "}
                          {new Date(
                            order.return_requested_at,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {/* View Details Button */}
                <button
                  onClick={() => handleViewDetails(order)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Details
                </button>

                {/* Cancellation Button */}
                {canCancelOrder(order) && (
                  <button
                    onClick={() => openCancellationModal(order.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Request Cancellation
                  </button>
                )}

                {/* Pay Remaining Button */}
                {order.remaining_amount && order.remaining_amount > 0 && (
                  <button
                    onClick={() => handlePayRemaining(order.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Remaining
                  </button>
                )}

                {/* Return Button */}
                {order.status === "delivered" && !order.return_request && (
                  <button
                    onClick={() => handleReturnRequest(order.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Request Return
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order View Modal */}
      {selectedOrder && (
        <OrderViewModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
