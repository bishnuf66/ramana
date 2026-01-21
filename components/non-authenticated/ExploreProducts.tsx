"use client";

import React, { useState, useEffect } from "react";
import PremiumProductCard from "./PremiumProductCard";
import { supabase } from "@/lib/supabase/client";

import { Product } from "../../types/product";

const ExploreProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true) // Only fetch featured products
        .order("created_at", { ascending: false })
        .limit(8); // Limit to 8 featured products for the homepage

      if (error) throw error;

      // Transform data to match Product interface
      const transformedProducts = (data || []).map((product: any) => ({
        ...product,
        mainImage: product.cover_image || product.image_url,
        galleryImages: Array.isArray(product.gallery_images)
          ? product.gallery_images.map((img: any) =>
              typeof img === "string" ? img : img.url,
            )
          : [],
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
      // Fallback to empty array on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex flex-row justify-between mb-4">
          <div className="font-bold text-2xl">Featured Products</div>
          <div className="primary-red underline">View more</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded"></div>
              <div className="bg-gray-200 h-4 rounded mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product, index) => (
            <PremiumProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12">
            <p className="text-lg">No products available at the moment.</p>
            <p className="text-sm mt-2">
              Check back soon for our latest arrangements!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreProducts;
