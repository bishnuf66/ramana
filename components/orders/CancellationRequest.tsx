"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { 
  requestOrderCancellation, 
  withdrawCancellationRequest 
} from "@/lib/orders";

interface CancellationRequestProps {
  orderId: string;
  orderDate: string;
  orderStatus: string;
  hasCancellationRequest: boolean;
  userId: string;
  onRequestUpdate: () => void;
}

const CANCELLATION_REASONS = [
  "No longer needed",
  "Found better price elsewhere", 
  "Delivery time too long",
  "Ordered wrong item",
  "Financial constraints",
  "Other"
];

export default function CancellationRequest({
  orderId,
  orderDate,
  orderStatus,
  hasCancellationRequest,
  userId,
  onRequestUpdate,
}: CancellationRequestProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");

  const calculateTimeRemaining = () => {
    const now = new Date();
    const order = new Date(orderDate);
    const hoursSinceOrder = (now.getTime() - order.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 24 - hoursSinceOrder);
  };

  const timeRemaining = calculateTimeRemaining();
  const canCancel = timeRemaining > 0 && 
    orderStatus !== "cancelled" && 
    orderStatus !== "shipped" && 
    orderStatus !== "delivered";

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error("Please select a cancellation reason");
      return;
    }

    setLoading(true);

    try {
      const result = await requestOrderCancellation(orderId, reason, userId);

      if (result.success) {
        toast.success(result.message);
        setShowForm(false);
        setReason("");
        onRequestUpdate();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error requesting cancellation:", error);
      toast.error("Failed to submit cancellation request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawRequest = async () => {
    setLoading(true);

    try {
      const result = await withdrawCancellationRequest(orderId, userId);

      if (result.success) {
        toast.success(result.message);
        onRequestUpdate();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error withdrawing cancellation request:", error);
      toast.error("Failed to withdraw cancellation request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (hours: number): string => {
    if (hours <= 0) return "Expired";
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (!canCancel) {
    return null;
  }

  return (
    <>
      {/* Cancellation Status Display */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        {hasCancellationRequest ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                Cancellation request submitted - Awaiting admin approval
              </span>
            </div>
            <button
              onClick={handleWithdrawRequest}
              disabled={loading}
              className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
            >
              {loading ? "Withdrawing..." : "Withdraw Request"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                Can cancel within {formatTimeRemaining(timeRemaining)}
              </span>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              Request Cancellation
            </button>
          </div>
        )}
      </div>

      {/* Cancellation Request Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Request Order Cancellation
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setReason("");
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>
                    Your cancellation request will be reviewed by our team within 24 hours.
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cancellation Reason *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select a reason</option>
                    {CANCELLATION_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="text-xs text-amber-700 dark:text-amber-300">
                    <div>• Request will be reviewed within 24 hours</div>
                    <div>• Refund will be processed if approved</div>
                    <div>• You can withdraw this request anytime</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setReason("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
