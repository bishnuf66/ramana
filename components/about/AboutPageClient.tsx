"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Flower, Mail, Phone, MapPin } from "lucide-react";

export default function AboutPageClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 dark:from-gray-900 dark:to-green-900/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About <span className="text-yellow-300">Ramana</span>
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-8">
              Handcrafted Bouquets with Love & Passion
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/products"
                className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors"
              >
                Explore Our Collection
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 opacity-20">
          <Flower className="w-20 h-20 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <Flower className="w-16 h-16 text-white" />
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="prose prose-lg text-gray-600 dark:text-gray-300 space-y-4">
                <p>
                  Welcome to{" "}
                  <span className="font-semibold text-green-600">
                    Ramana Handmade Collection
                  </span>
                  , where every bouquet tells a story of love, care, and
                  artistic expression. Founded with a passion for bringing joy
                  through beautiful floral arrangements, we&apos;ve been
                  crafting stunning bouquets that capture emotions and create
                  lasting memories.
                </p>
                <p>
                  What started as a small hobby in our home has blossomed into a
                  beloved local business, serving the Kathmandu community with
                  handcrafted arrangements for every occasion. Each bouquet is
                  carefully designed by our skilled artisans who understand the
                  language of flowers.
                </p>
                <p>
                  We believe that flowers are more than just plants – they're
                  messengers of love, celebration, sympathy, and joy. That's why
                  we pour our hearts into every creation, ensuring that each
                  arrangement that leaves our studio is perfect in every way.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-green-100 to-rose-100 rounded-3xl p-8 shadow-xl">
                <div className="aspect-square bg-white rounded-2xl flex items-center justify-center">
                  <Heart className="w-24 h-24 text-green-500" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Handcrafted with Love",
                description:
                  "Every bouquet is carefully handcrafted by our skilled artisans, ensuring unique and personal touches in every arrangement.",
              },
              {
                icon: Flower,
                title: "Fresh & Quality",
                description:
                  "We source only the freshest flowers and materials, creating arrangements that last longer and look more beautiful.",
              },
              {
                icon: MapPin,
                title: "Local & Personal",
                description:
                  "As a local Kathmandu business, we provide personalized service and understand our community's needs.",
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center p-6 bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Get in Touch
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <Phone className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="text-green-100">+977 9819274719</p>
              </div>
              <div className="text-center">
                <Mail className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-green-100">ramanatheeng65@gmail.com</p>
              </div>
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-green-100">Kathmandu, Nepal</p>
              </div>
            </div>

            <div className="mt-12">
              <Link
                href="/contact"
                className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors inline-block"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
