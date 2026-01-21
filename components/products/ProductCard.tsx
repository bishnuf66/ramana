"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Eye, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../../types/product";
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
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.discount_price || product.price,
      image: product.mainImage || product.image_url || "/placeholder.jpg",
      quantity: 1,
      rating: product.rating || 0,
    });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.mainImage || product.image_url || "/placeholder.jpg",
      rating: product.rating || 0,
      category: product.category?.name || "",
      addedAt: new Date().toISOString(),
    });
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();

    const message = `Hello! I'd like to order:
    
*${product.title}*
${product.shortDescription || product.description || ""}
${product.discount_price ? `\n*Discount Price:* NPR ${product.discount_price.toLocaleString()}` : `\n*Price:* NPR ${product.price.toLocaleString()}`}

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
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        <div className="flex">
          {/* Image */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <Image
              src={product.mainImage || product.image_url || "/placeholder.jpg"}
              alt={product.title}
              fill
              className="object-cover"
            />
            {discountPercentage > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                -{discountPercentage}%
              </div>
            )}
            {!(product.stock && product.stock > 0) && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-bold">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {product.category?.name || "Uncategorized"}
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.title}
                </h3>
              </div>
              <button
                onClick={handleFavorite}
                className={`p-2 transition-colors ${
                  isFavorite(product.id)
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-400 hover:text-red-500"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite(product.id) ? "fill-current" : ""}`}
                />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {product.shortDescription || product.description}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {(product.rating || 0).toFixed(1)} ({product.reviewCount || 0}{" "}
                reviews)
              </span>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {product.discount_price ? (
                  <>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      NPR {product.discount_price.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      NPR {product.price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    NPR {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWhatsAppOrder}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Order via WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </motion.button>
                <Link href={`/products/${product.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  disabled={!(product.stock && product.stock > 0)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square">
        <Image
          src={product.mainImage || product.image_url || "/placeholder.jpg"}
          alt={product.title}
          fill
          className="object-cover"
        />
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{discountPercentage}%
          </div>
        )}
        <button
          onClick={handleFavorite}
          className={`absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg transition-colors ${
            isFavorite(product.id)
              ? "text-red-500 hover:text-red-600"
              : "text-gray-400 hover:text-red-500"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${isFavorite(product.id) ? "fill-current" : ""}`}
          />
        </button>
        {!(product.stock && product.stock > 0) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
          {product.category?.name || "Uncategorized"}
        </span>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          {product.discount_price ? (
            <>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                NPR {product.discount_price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 line-through">
                NPR {product.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              NPR {product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWhatsAppOrder}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            title="Order via WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </motion.button>
          <Link href={`/products/${product.id}`} className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              View Details
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            disabled={!(product.stock && product.stock > 0)}
            className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
