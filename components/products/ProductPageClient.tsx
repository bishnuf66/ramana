"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { SocialLink } from "@/utils/social-link";
import ProductCard from "./ProductCard";
import ProductReviews from "./ProductReviews";
import { Tables } from "@/types/database.types";

type Product = Tables<"products">;
type Category = Tables<"categories">;

interface ProductPageClientProps {
  initialProduct: Product;
  category: Category | null;
  similarProducts: Product[];
  slug: string;
}

export default function ProductPageClient({
  initialProduct,
  category,
  similarProducts,
  slug,
}: ProductPageClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const product = initialProduct;

  const discountPercentage = product.discount_price
    ? Math.round(
        ((product.price - product.discount_price) / product.price) * 100,
      )
    : 0;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.discount_price || product.price,
      cover_image: product.cover_image || "/placeholder.jpg",
      quantity: quantity,
      slug: product.slug,
      discount_price: product.discount_price,
    });

    toast.success(`${product.title} added to cart!`);
    setQuantity(1);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product);
    toast.success(
      isFavorite(product.id) ? "Removed from favorites" : "Added to favorites",
    );
  };

  const handleWhatsAppOrder = () => {
    const message = `Hello! I'd like to order:
    
*${product.title}*
${product.description || ""}
${product.discount_price ? `\n*Discount Price:* NPR ${product.discount_price.toLocaleString()}` : `\n*Price:* NPR ${product.price.toLocaleString()}`}

*View Product:* ${typeof window !== "undefined" ? window.location.href : ""}

Please let me know the availability and delivery details.
Thank you! 🌸`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`${SocialLink.whatsapp}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white dark:bg-gray-800">
              <Image
                src={
                  selectedImageIndex === 0
                    ? product.cover_image || "/placeholder.jpg"
                    : (product.gallery_images as any[])?.[
                          selectedImageIndex - 1
                        ]
                      ? typeof (product.gallery_images as any[])[
                          selectedImageIndex - 1
                        ] === "string"
                        ? (product.gallery_images as any[])[
                            selectedImageIndex - 1
                          ]
                        : (product.gallery_images as any[])[
                            selectedImageIndex - 1
                          ].url
                      : "/placeholder.jpg"
                }
                alt={product.title}
                priority
                fill
                className="object-cover"
              />
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discountPercentage}% OFF
                </div>
              )}
              {!(product.stock && product.stock > 0) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2 overflow-x-auto">
              {product.cover_image && (
                <button
                  onClick={() => setSelectedImageIndex(0)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImageIndex === 0
                      ? "border-green-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Image
                    src={product.cover_image}
                    alt={`${product.title} cover`}
                    fill
                    className="object-cover"
                  />
                </button>
              )}
              {(product.gallery_images as any[])?.map(
                (image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index + 1)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImageIndex === index + 1
                        ? "border-green-500"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Image
                      src={typeof image === "string" ? image : image.url}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ),
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category & Title */}
            <div>
              {category && (
                <Link
                  href={`/products?category_id=${product.category_id}`}
                  className="text-green-600 dark:text-green-400 font-medium hover:underline"
                >
                  {category.name}
                </Link>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2">
                {product.title}
              </h1>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < 4
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                4.8 (100+ reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 flex-wrap">
              {product.discount_price ? (
                <>
                  <span className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">
                    NPR {product.discount_price.toLocaleString()}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    NPR {product.price.toLocaleString()}
                  </span>
                  <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-sm font-medium">
                    Save NPR{" "}
                    {(product.price - product.discount_price).toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  NPR {product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h3>
              <div
                className="text-gray-600 dark:text-gray-400 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: product.description || "No description available.",
                }}
              />
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-600">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {product.stock || 0} available
                </span>
              </div>

              <div className="flex gap-3 flex-col sm:flex-row">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!(product.stock && product.stock > 0)}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsAppOrder}
                  className="flex-1 py-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleToggleFavorite}
                  className={`p-3 border rounded-lg transition-colors ${
                    isFavorite(product.id)
                      ? "border-rose-300 bg-rose-50 dark:border-rose-600 dark:bg-rose-900/30"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  title={
                    isFavorite(product.id)
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite(product.id)
                        ? "text-rose-600 dark:text-rose-400 fill-current"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  />
                </motion.button>
              </div>
            </div>

            {/* Product Details */}
            {(product.height_cm || product.width_cm || product.weight_gram) && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Product Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {product.height_cm && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Height:
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.height_cm} cm
                      </p>
                    </div>
                  )}
                  {product.width_cm && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Width:
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.width_cm} cm
                      </p>
                    </div>
                  )}
                  {product.weight_gram && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Weight:
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.weight_gram} g
                      </p>
                    </div>
                  )}
                </div>

                {product.height_cm && product.width_cm && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dimensions:
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {product.height_cm} cm (H) × {product.width_cm} cm (W)
                      {product.length_cm
                        ? ` × ${product.length_cm} cm (L)`
                        : ""}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Service Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {[
            {
              icon: Truck,
              title: "Free Delivery",
              desc: "Orders above NPR 2000",
            },
            {
              icon: Shield,
              title: "Quality Guarantee",
              desc: "Fresh flowers guaranteed",
            },
            {
              icon: RefreshCw,
              title: "Easy Returns",
              desc: "7-day return policy",
            },
            {
              icon: MessageCircle,
              title: "24/7 Support",
              desc: "WhatsApp & Viber support",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
            >
              <feature.icon className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Similar Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <ProductCard key={similarProduct.id} product={similarProduct} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Product Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ProductReviews
            productId={product.id.toString()}
            productName={product.title}
          />
        </motion.div>
      </div>
    </div>
  );
}
