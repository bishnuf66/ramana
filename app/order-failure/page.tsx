"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  X,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import { Suspense } from "react";

function OrderFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const errorParam = searchParams?.get("error");
    setError(
      errorParam || "An unknown error occurred while placing your order.",
    );
  }, [searchParams]);

  const handleRetry = () => {
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center"
        >
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Order Failed
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We're sorry, but there was an issue processing your order. Please
            try again or contact our support team if the problem persists.
          </p>

          {/* Error Details */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-200 text-sm font-medium">
              Error Details:
            </p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">
              {error}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <Link
              href="/cart"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Cart
            </Link>
          </div>

          {/* Additional Options */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Still having trouble? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Continue Shopping
              </Link>

              <button
                onClick={() =>
                  (window.location.href = "mailto:support@ramana.com.np")
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Common Issues & Solutions
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Payment Issues
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Check your payment details and try again
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Network Problems
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Check your internet connection and retry
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Stock Availability
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Some items may have gone out of stock
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderFailurePage() {
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
      <OrderFailureContent />
    </Suspense>
  );
}
