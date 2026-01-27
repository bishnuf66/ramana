"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  MessageCircle,
  Sparkles,
  Gift,
  Plus,
  Minus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { Tables } from "../../types/database.types";

// Use the generated Supabase type
type Product = Tables<"products">;
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { SocialLink } from "../../utils/social-link";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export default function ProductCard({
  product,
  viewMode = "grid",
}: ProductCardProps) {
  const {
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    cart,
  } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isHovered, setIsHovered] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Debounce function for quantity updates
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if product is already in cart and get its quantity
  const cartItem = cart.find((item) => item.id === product.id);
  const isInCart = !!cartItem;
  const currentQuantity = cartItem?.quantity || 0;

  // Debounced function to update cart quantity
  const debouncedUpdateQuantity = useCallback(
    (newQuantity: number) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        updateQuantity(product.id, newQuantity);
      }, 300); // 300ms debounce delay
    },
    [product.id, updateQuantity],
  );

  const handleAddToCart = () => {
    // Always add to cart (simplified logic)
    addToCart({
      id: product.id,
      title: product.title,
      price: product.discount_price || product.price,
      cover_image: product.cover_image || "/placeholder.jpg",
      quantity: quantity,
    });

    // Reset local quantity to 1 after successful addition
    setQuantity(1);
  };

  const handleIncreaseQuantity = () => {
    // Only update local quantity selector, not cart
    setQuantity((prev) => Math.min(prev + 1, 99)); // Max 99 items
  };

  const handleDecreaseQuantity = () => {
    // Only update local quantity selector, not cart
    setQuantity((prev) => Math.max(prev - 1, 1)); // Min 1 item
  };

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(product);
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();

    const message = `Hello! I'd like to order:
    
*${product.title}*
${product.description || ""}
${product.discount_price ? `\n*Discount Price:* NPR ${product.discount_price.toLocaleString()}` : `\n*Price:* NPR ${product.price.toLocaleString()}`}

*View Product:* ${typeof window !== "undefined" ? window.location.origin : ""}/products/${product.slug}

Please let me know the availability and delivery details.
Thank you! 🌸`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `${SocialLink.whatsapp}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  const discountPercentage = product.discount_price
    ? Math.round(
        ((product.price - product.discount_price) / product.price) * 100,
      )
    : 0;

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          y: -3,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative bg-gradient-to-br from-white to-rose-50/30 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-rose-100/50 dark:border-gray-700/50 backdrop-blur-sm"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/20 to-pink-200/20 dark:from-rose-900/20 dark:to-pink-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-200/20 to-rose-200/20 dark:from-purple-900/20 dark:to-rose-900/20 rounded-full blur-3xl" />

        <div className="relative flex">
          {/* Image Section */}
          <div className="relative w-64 h-64 flex-shrink-0 overflow-hidden">
            <motion.div
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full h-full"
            >
              <Image
                src={product.cover_image || "/placeholder.jpg"}
                alt={product.title}
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Badges */}
            <AnimatePresence>
              {discountPercentage > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="absolute top-4 left-4 bg-gradient-to-br from-rose-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {discountPercentage}% OFF
                </motion.div>
              )}
            </AnimatePresence>

            {/* Handmade Badge */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 border border-rose-200 dark:border-rose-800"
            >
              <Gift className="w-3 h-3" />
              Handmade
            </motion.div>

            {!(product.stock && product.stock > 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="bg-white/95 dark:bg-gray-800/95 px-6 py-3 rounded-full">
                  <span className="text-gray-900 dark:text-white font-bold text-sm">
                    Out of Stock
                  </span>
                </div>
              </motion.div>
            )}

            {/* Floating Sparkles on Hover */}
            <AnimatePresence>
              {isHovered && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-1/4 right-4 text-yellow-400"
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: 0.1 }}
                    className="absolute top-1/2 right-8 text-pink-400"
                  >
                    <Sparkles className="w-3 h-3" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-1/3 right-12 text-rose-400"
                  >
                    <Sparkles className="w-3 h-3" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Content Section */}
          <div className="relative flex-1 p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-2.5 py-1 rounded-full">
                    {"Special Gift"}
                  </span>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-rose-800 dark:from-white dark:to-rose-300 bg-clip-text text-transparent mb-2">
                  {product.title}
                </h3>
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFavorite}
                className={`relative p-2.5 rounded-full transition-all ${
                  isFavorite(product.id)
                    ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                    : "bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite(product.id) ? "fill-current" : ""}`}
                />
                {isFavorite(product.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    className="absolute inset-0 bg-rose-400 rounded-full -z-10 blur-md"
                  />
                )}
              </motion.button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        i < 0
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                0.0 (0 reviews)
              </span>
            </div>

            {/* Price and Actions */}
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-1">
                {product.discount_price ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
                        NPR {product.discount_price.toLocaleString()}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        NPR {product.price.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      You save NPR{" "}
                      {(
                        product.price - product.discount_price
                      ).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    NPR {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDecreaseQuantity}
                    disabled={!isInCart && quantity <= 1}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </motion.button>

                  <div className="w-8 text-center">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {quantity}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleIncreaseQuantity}
                    disabled={isInCart && currentQuantity >= 99}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWhatsAppOrder}
                  className="group/btn relative p-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all overflow-hidden"
                  title="Order via WhatsApp"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                  <MessageCircle className="w-5 h-5 relative z-10" />
                </motion.button>

                <Link href={`/products/${product.slug}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:shadow-lg transition-all"
                  >
                    <Eye className="w-5 h-5" />
                  </motion.button>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  disabled={!(product.stock && product.stock > 0)}
                  className={`relative px-6 py-3 rounded-xl hover:shadow-lg disabled:cursor-not-allowed transition-all flex items-center gap-2 overflow-hidden group/cart bg-gradient-to-r from-rose-500 to-pink-600 hover:shadow-rose-500/50 text-white disabled:from-gray-400 disabled:to-gray-500`}
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-full group-hover/cart:translate-x-0 transition-transform duration-300" />
                  <ShoppingCart className="w-5 h-5 relative z-10" />
                  <span className="font-semibold relative z-10">
                    Add to Cart
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-gradient-to-br from-white to-rose-50/30 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-rose-100/50 dark:border-gray-700/50 transition-all duration-300"
    >
      {/* Decorative Gradient Orbs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-pink-200/30 dark:from-rose-900/20 dark:to-pink-900/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-purple-200/30 to-rose-200/30 dark:from-purple-900/20 dark:to-rose-900/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden">
        <motion.div
          animate={{ scale: isHovered ? 1.15 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full h-full"
        >
          <Image
            src={product.cover_image || "/placeholder.jpg"}
            alt={product.title}
            fill
            className="object-cover"
          />
        </motion.div>

        {/* Overlay Gradient on Hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
        />

        {/* Discount Badge */}
        <AnimatePresence>
          {discountPercentage > 0 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="absolute top-3 left-3 bg-gradient-to-br from-rose-500 to-pink-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              {discountPercentage}%
            </motion.div>
          )}
        </AnimatePresence>

        {/* Handmade Badge */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="absolute top-3 right-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1 border border-rose-200 dark:border-rose-800"
        >
          <Gift className="w-3 h-3" />
          <span className="hidden sm:inline">Handmade</span>
        </motion.div>

        {/* Favorite Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFavorite}
          className={`absolute bottom-3 right-3 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all ${
            isFavorite(product.id)
              ? "bg-rose-500 text-white"
              : "bg-white/95 dark:bg-gray-800/95 text-gray-400 hover:text-rose-500"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${isFavorite(product.id) ? "fill-current" : ""}`}
          />
        </motion.button>

        {/* Out of Stock Overlay */}
        {!(product.stock && product.stock > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="bg-white/95 dark:bg-gray-800/95 px-4 py-2 rounded-full">
              <span className="text-gray-900 dark:text-white font-bold text-sm">
                Out of Stock
              </span>
            </div>
          </motion.div>
        )}

        {/* Floating Sparkles on Hover */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0, y: 0 }}
                  animate={{
                    scale: 1,
                    opacity: [0, 1, 0],
                    y: -30,
                    x: [0, i % 2 === 0 ? 10 : -10],
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    delay: i * 0.1,
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                  className="absolute"
                  style={{
                    top: `${30 + i * 15}%`,
                    right: `${20 + i * 10}%`,
                  }}
                >
                  <Sparkles
                    className={`w-3 h-3 ${i % 3 === 0 ? "text-yellow-400" : i % 3 === 1 ? "text-pink-400" : "text-rose-400"}`}
                  />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Content Section */}
      <div className="relative p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">
            {"Special Gift"}
          </span>
        </div>

        <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-rose-800 dark:from-white dark:to-rose-300 bg-clip-text text-transparent mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    i < 0
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </motion.div>
            ))}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            (0)
          </span>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1 mb-4">
          {product.discount_price ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
                  NPR {product.discount_price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  NPR {product.price.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                Save NPR{" "}
                {(product.price - product.discount_price).toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              NPR {product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDecreaseQuantity}
              disabled={!isInCart && quantity <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </motion.button>

            <div className="flex-1 text-center">
              <span className="font-semibold text-gray-900 dark:text-white">
                {quantity}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleIncreaseQuantity}
              disabled={isInCart && currentQuantity >= 99}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleWhatsAppOrder}
              className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 font-semibold text-sm"
              title="Order via WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </motion.button>

            <Link href={`/products/${product.slug}`} className="flex-1">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:shadow-lg transition-all font-semibold text-sm"
              >
                View Details
              </motion.button>
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={!(product.stock && product.stock > 0)}
            className={`w-full py-2.5 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm relative overflow-hidden group/add bg-gradient-to-r from-rose-500 to-pink-600 hover:shadow-rose-500/30 text-white disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed`}
          >
            <div className="absolute inset-0 bg-white/20 translate-x-full group-hover/add:translate-x-0 transition-transform duration-300" />
            <ShoppingCart className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Add to Cart</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
