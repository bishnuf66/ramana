"use client";

import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { products } from "@/utils/dummyProducts";

const ExploreProducts: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex flex-row justify-between ">
        <div className="font-bold text-2xl">Explore Products</div>
        <div className="primary-red underline">View more</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ExploreProducts;



