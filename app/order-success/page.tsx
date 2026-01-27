"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ShoppingBag,
  Package,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  cover_image?: string;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const itemsParam = searchParams.get("items");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (itemsParam) {
      try {
        const decodedItems = JSON.parse(decodeURIComponent(itemsParam));
        setItems(decodedItems);

        // Calculate total amount
        const total = decodedItems.reduce(
          (sum: number, item: OrderItem) => sum + item.price * item.quantity,
          0,
        );
        setTotalAmount(total);
      } catch (error) {
        console.error("Error parsing items:", error);
      }
    }
  }, [itemsParam]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center"
        >
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Order Placed Successfully! 🌸
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you for your order! We&apos;ve received your request and will
            start preparing your beautiful handmade bouquets.
          </p>

          {orderId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  Order Confirmation Number
                </p>
                <p className="font-mono text-lg text-green-900 dark:text-green-100 break-all">
                  {orderId}
                </p>
                <p className="text-xs text-green-600 dark:text-green-300 mt-2">
                  Please save this number for your records
                </p>
              </div>
            </motion.div>
          )}

          {/* Ordered Items Section */}
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ordered Items
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {item.cover_image ? (
                          <img
                            src={item.cover_image}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="text-left">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          NPR {item.price * item.quantity}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          NPR {item.price} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Amount */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total Amount:
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      NPR {totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              What happens next?
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>• We&apos;ll prepare your order with care</p>
              <p>• You&apos;ll receive a confirmation email shortly</p>
              <p>• We&apos;ll contact you for delivery details</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Package className="w-5 h-5" />
              View Orders
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Questions about your order?
              <button
                onClick={() =>
                  (window.location.href = "mailto:support@ramana.com.np")
                }
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium ml-1"
              >
                Contact our support team
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
