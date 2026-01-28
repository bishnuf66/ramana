"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  ShoppingCart,
  Package,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function TermsPageClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 dark:from-gray-900 dark:to-green-900/20">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Terms & Conditions
            </h1>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">
              Please read these terms carefully before using Ramana Handmade
              Collection services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {/* Agreement to Terms */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Agreement to Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  By accessing and using Ramana Handmade Collection&apos;s
                  website and services, you accept and agree to be bound by
                  these Terms &amp; Conditions. If you do not agree to these
                  terms, please do not use our services. These terms apply to
                  all visitors, users, and others who access or use the service.
                </p>
              </div>
            </motion.div>

            {/* Products & Services */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Products & Services
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                    Product Descriptions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We strive to be as accurate as possible in the descriptions
                    of our products. However, we do not warrant that product
                    descriptions, colors, or other content are accurate,
                    complete, reliable, current, or error-free. All products are
                    handmade and may have slight variations.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                    Pricing & Availability
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Prices are subject to change without notice</li>
                    <li>• All prices are in Nepalese Rupees (NPR)</li>
                    <li>• Product availability is not guaranteed</li>
                    <li>• We reserve the right to discontinue any product</li>
                    <li>• Seasonal variations may affect availability</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Orders & Payment */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Orders & Payment
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                      Order Process
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>• Orders are subject to acceptance by Ramana</li>
                      <li>• We may refuse or cancel orders for any reason</li>
                      <li>• Order confirmation will be sent via email</li>
                      <li>• Delivery timeframes are estimates only</li>
                      <li>• Custom orders require advance notice</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                      Payment Terms
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>
                        • Payment must be received before order processing
                      </li>
                      <li>
                        • We accept cash, digital payments, and bank transfers
                      </li>
                      <li>• All prices include applicable taxes</li>
                      <li>• Additional delivery charges may apply</li>
                      <li>• Payment processing is secure and encrypted</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Delivery & Shipping */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                  Delivery Policy
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li>• Delivery is available within Kathmandu valley</li>
                  <li>• Same-day delivery for orders placed before 12 PM</li>
                  <li>• Next-day delivery for orders placed after 12 PM</li>
                  <li>• Delivery charges apply based on location</li>
                  <li>• Recipient must be available at delivery time</li>
                  <li>• We are not responsible for unattended deliveries</li>
                  <li>• Delivery times may vary during peak seasons</li>
                </ul>
              </div>
            </motion.div>

            {/* Returns & Refunds */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Returns & Refunds
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                    Return Policy
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Due to the perishable nature of our products, we generally
                    do not accept returns. However, customer satisfaction is our
                    priority.
                  </p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>
                      • Notify us within 24 hours of delivery for any issues
                    </li>
                    <li>• Photos of damaged products may be required</li>
                    <li>
                      • Refunds or replacements will be assessed case-by-case
                    </li>
                    <li>• Custom orders are non-refundable</li>
                    <li>• Delivery charges are non-refundable</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Intellectual Property */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                  Intellectual Property
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  All content on this website, including but not limited to
                  text, graphics, logos, images, and software, is the property
                  of Ramana Handmade Collection and is protected by copyright
                  and other intellectual property laws.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    • You may not copy, reproduce, or distribute our content
                  </li>
                  <li>• All designs and arrangements are original creations</li>
                  <li>• Unauthorized use is strictly prohibited</li>
                  <li>• Violators may face legal action</li>
                </ul>
              </div>
            </motion.div>

            {/* Limitation of Liability */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-12"
            >
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                  Limitation of Liability
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  In no event shall Ramana Handmade Collection, its directors,
                  employees, or agents be liable for any indirect, incidental,
                  special, or consequential damages arising out of or in
                  connection with your use of our services.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Maximum liability is limited to the purchase price</li>
                  <li>• We are not liable for delivery delays</li>
                  <li>• We are not liable for product variations</li>
                  <li>• We are not liable for third-party service failures</li>
                </ul>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 rounded-xl p-8 text-center"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Questions About These Terms?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                If you have any questions about these Terms & Conditions, please
                contact us:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="mailto:ramanatheeng65@gmail.com"
                  className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
                >
                  Email Us
                </Link>
                <Link
                  href="/contact"
                  className="bg-white dark:bg-gray-800 text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  Contact Form
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-gray-100 dark:bg-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            These terms may be updated from time to time. Please review them
            periodically.
          </p>
        </div>
      </section>
    </div>
  );
}
