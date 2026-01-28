import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    const supabase = await createClient();

    // Search products by title and description
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Product search error:", error);
      return NextResponse.json(
        { error: "Failed to search products" },
        { status: 500 },
      );
    }

    // Transform products to match frontend format
    const transformedProducts =
      products?.map((product: any) => ({
        ...product,
        price: product.discount_price || product.price,
        originalPrice: product.price,
        category: "Bouquet", // Default category since we removed the join
        image: product.cover_image || product.image_url || "/placeholder.jpg",
        isFeatured: product.is_featured,
      })) || [];

    return NextResponse.json({
      products: transformedProducts,
      query,
      count: transformedProducts.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
