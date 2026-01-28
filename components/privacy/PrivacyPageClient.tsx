"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Lock, Eye, Database } from "lucide-react";

export default function PrivacyPageClient() {
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
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your information.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {/* Information We Collect */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Information We Collect
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                    Personal Information
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Name and contact details when you place orders</li>
                    <li>
                      • Email address for account creation and communication
                    </li>
                    <li>• Phone number for delivery coordination</li>
                    <li>• Shipping and billing addresses</li>
                    <li>
                      • Payment information (processed securely by third-party
                      providers)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                    Technical Information
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• IP address and device information</li>
                    <li>• Browser type and operating system</li>
                    <li>• Pages visited and time spent on our site</li>
                    <li>• Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* How We Use Your Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  How We Use Your Information
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                      Service Delivery
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>• Process and fulfill your orders</li>
                      <li>• Send order confirmations and updates</li>
                      <li>• Coordinate delivery arrangements</li>
                      <li>• Provide customer support</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                      Communication & Marketing
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>• Send promotional emails (with consent)</li>
                      <li>• Personalize your shopping experience</li>
                      <li>• Improve our website and services</li>
                      <li>• Analyze usage patterns</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Data Protection */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Data Protection & Security
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                    Security Measures
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• SSL encryption for all data transmissions</li>
                    <li>
                      • Secure payment processing through trusted providers
                    </li>
                    <li>• Regular security audits and updates</li>
                    <li>• Limited employee access to personal data</li>
                    <li>• Secure data storage and backup systems</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                    Data Retention
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We retain your personal information only as long as
                    necessary to provide our services and comply with legal
                    obligations. You can request deletion of your account and
                    associated data at any time.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Your Rights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Privacy Rights
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                      Access & Correction
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>• Request access to your personal data</li>
                      <li>• Correct inaccurate information</li>
                      <li>• Update your account details</li>
                      <li>• Download your data (portability)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                      Control & Deletion
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>• Opt out of marketing communications</li>
                      <li>• Request data deletion</li>
                      <li>• Close your account</li>
                      <li>• Object to data processing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact for Privacy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 rounded-xl p-8 text-center"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Privacy Questions?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                If you have questions about this privacy policy or how we handle
                your data, please don&apos;t hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="mailto:ramanatheeng65@gmail.com"
                  className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
                >
                  Email Privacy Team
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
            This privacy policy may be updated from time to time. Please review
            it periodically.
          </p>
        </div>
      </section>
    </div>
  );
}
