import { Tables } from "./database.types";

export interface Category extends Tables<"categories"> {
  productCount?: number;
}

export interface Product extends Tables<"products"> {
  category?: Category;
  galleryImages?: string[];
  mainImage?: string;
  shortDescription?: string;
  tags?: string[];
  features?: string[];
  dimensions?: string;
  weight?: string;
  careInstructions?: string;
  reviewCount?: number;
  quantity?: number;
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface ProductFilters {
  category_id?: string;
  priceRange?: [number, number];
  inStock?: boolean;
  rating?: number;
  tags?: string[];
}

export interface ProductSort {
  field: "name" | "price" | "rating" | "createdAt";
  direction: "asc" | "desc";
}
