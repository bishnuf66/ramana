"use client";

import { useState, useEffect } from "react";
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
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { useCart } from "../../../components/context/CartContext";
import ProductCard from "../../../components/products/ProductCard";
import ProductReviews from "../../../components/products/ProductReviews";
import { Tables } from "@/types/database.types";
// Use the generated Supabase type
type Product = Tables<"products">;

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Tables<"categories"> | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch product by slug (using ID as slug for now)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // For now, we'll use the slug as the product ID
        // In a real app, you might want to add a slug field to the database
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("slug", params.slug as string)
          .single();

        if (error || !data) {
          console.error("Error fetching product:", error);
          return;
        }

        const imageArray = Array.isArray(data.gallery_images)
          ? data.gallery_images.map((img: any) =>
              typeof img === "string" ? img : img.url,
            )
          : [];

        // Transform to Product interface
        const transformedProduct: Product = {
          ...data,
          mainImage: data.cover_image || data.image_url || undefined,
          shortDescription: data.description || undefined,
        };

        setProduct(transformedProduct);

        // Fetch category data if category_id exists
        if (data.category_id) {
          const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .select("*")
            .eq("id", data.category_id)
            .single();

          if (!categoryError && categoryData) {
            setCategory(categoryData);
          }
        }

        // Fetch similar products (same category)
        const { data: similarData, error: similarError } = await supabase
          .from("products")
          .select("*")
          .eq("category_id", data.category_id)
          .neq("id", data.id)
          .limit(4);

        if (!similarError && similarData) {
          const transformedSimilar = similarData.map((item: any) => ({
            ...item,
          }));
          setSimilarProducts(transformedSimilar);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product Not Found
          </h1>
          <Link
            href="/products"
            className="text-green-500 hover:text-green-600"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.discount_price
    ? Math.round(
        ((product.price - product.discount_price) / product.price) * 100,
      )
    : 0;

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
      price: product.discount_price || product.price,
    });
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
              <Link
                href={`/products?category_id=${product.category_id}`}
                className="text-green-600 dark:text-green-400 font-medium hover:underline"
              >
                {category?.name || "Uncategorized"}
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
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
                      i < 0
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                0.0 (0 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              {product.discount_price ? (
                <>
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
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
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  NPR {product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h3>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
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

              <div className="flex gap-4">
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
                  className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>
            </div>

            {/* Product Details */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Product Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Combined Dimensions */}
              {product.height_cm && product.width_cm && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dimensions:
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {product.height_cm} cm (H) × {product.width_cm} cm (W)
                    {product.length_cm ? ` × ${product.length_cm} cm (L)` : ""}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Service Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Similar Products
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : similarProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((similarProduct) => (
                <ProductCard key={similarProduct.id} product={similarProduct} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No similar products found in this category.
              </p>
            </div>
          )}
        </motion.div>

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
