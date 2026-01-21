"use client";

import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Heart,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";
import { SocialLink } from "../../utils/social-link";

export default function PremiumFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "Our Story", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
    shop: [
      { name: "All Products", href: "/products" },
      { name: "Flowers", href: "#flowers" },
      { name: "Accessories", href: "#accessories" },
      { name: "Gift Sets", href: "#gifts" },
    ],
    support: [
      { name: "FAQ", href: "#faq" },
      { name: "Shipping", href: "#shipping" },
      { name: "Returns", href: "#returns" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms & Conditions", href: "/terms" },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-white relative overflow-hidden transition-colors">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-rose-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-green-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Logo
                width={56}
                height={56}
                className="h-14 w-14 rounded-full ring-2 ring-green-500"
              />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  Ramana
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Handmade Bouquets
                </div>
              </div>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Creating beautiful moments with handcrafted bouquets by Ramana.
              Every bloom tells a story, every arrangement speaks from the
              heart. Serving Kathmandu Valley with love and passion.
            </p>
            <div className="flex gap-4">
              <motion.a
                href={SocialLink.facebook}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-gray-200/50 dark:bg-white/10 hover:bg-blue-600 rounded-full transition-colors backdrop-blur-sm"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                href={SocialLink.instagram}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-gray-200/50 dark:bg-white/10 hover:bg-pink-600 rounded-full transition-colors backdrop-blur-sm"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href={SocialLink.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-gray-200/50 dark:bg-white/10 hover:bg-black rounded-full transition-colors backdrop-blur-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Shop
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-300 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Copyright © {currentYear} Ramana Handmade Bouquets. All rights
            reserved.
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-rose-500 fill-current" />{" "}
            for bouquet lovers
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
