import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { Tables } from "@/types/database.types";
import { createClient } from "@supabase/supabase-js";
import ProductPageClient from "@/components/products/ProductPageClient";

type Product = Tables<"products">;

// Create Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ============ METADATA & ISR FUNCTIONS ============

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;

  // Fetch product data
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !product) {
    return {
      title: "Product Not Found",
      description: "The product you're looking for doesn't exist.",
    };
  }

  const baseUrl = "https://ramana.com.np";
  const productUrl = `${baseUrl}/products/${slug}`;
  const price = product.discount_price || product.price;
  const discountPercentage = product.discount_price
    ? Math.round(
        ((product.price - product.discount_price) / product.price) * 100,
      )
    : 0;

  return {
    title: `${product.title} | Premium Handmade Bouquets - Ramana`,
    description:
      product.description?.substring(0, 160) ||
      `Discover ${product.title} - Beautiful handmade bouquets from Ramana. Fresh flowers crafted with love in Kathmandu Valley, Nepal.`,
    keywords: [
      product.title,
      "handmade bouquet",
      "flowers Kathmandu",
      "Nepal flowers",
      "custom bouquets",
      "fresh flowers",
    ],
    authors: [{ name: "Ramana Handmade Collection" }],
    creator: "Ramana Handmade Collection",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      title: `${product.title} - Handmade Bouquets by Ramana`,
      description:
        product.description?.substring(0, 160) ||
        `Premium handmade bouquet: ${product.title}`,
      url: productUrl,
      siteName: "Ramana Handmade Bouquets",
      type: "website",
      locale: "en_US",
      images: product.cover_image
        ? [
            {
              url: product.cover_image,
              width: 800,
              height: 800,
              alt: product.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} - Ramana Handmade`,
      description:
        product.description?.substring(0, 160) ||
        `Beautiful handmade: ${product.title}`,
      images: product.cover_image ? [product.cover_image] : [],
      creator: "@ramana_handmade",
    },
    alternates: {
      canonical: productUrl,
    },
    other: {
      "product:price:amount": price.toString(),
      "product:price:currency": "NPR",
      "product:availability":
        product.stock && product.stock > 0 ? "in stock" : "out of stock",
    },
  };
}

// Generate static params for ISR
export async function generateStaticParams() {
  const { data: products } = await supabase
    .from("products")
    .select("slug")
    .order("created_at", { ascending: false })
    .limit(50); // Pre-render top 50 products

  if (!products) {
    return [];
  }

  return products.map((product: any) => ({
    slug: product.slug,
  }));
}

// Revalidate every 1 hour (3600 seconds) for ISR
export const revalidate = 3600;

// Server component - fetch all data server-side
async function fetchProductData(slug: string) {
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !product) {
    return null;
  }

  // Fetch category data if category_id exists
  let category = null;
  if (product.category_id) {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("*")
      .eq("id", product.category_id)
      .single();
    category = categoryData;
  }

  // Fetch similar products (same category)
  let similarProducts: Product[] = [];
  if (product.category_id) {
    const { data: similarData } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .limit(4);
    similarProducts = similarData || [];
  }

  return { product, category, similarProducts };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const productData = await fetchProductData(slug);

  if (!productData) {
    notFound();
  }

  const { product, category, similarProducts } = productData;

  // Prepare structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || "Handmade bouquet by Ramana",
    image: product.cover_image || "https://ramana.com.np/placeholder.jpg",
    url: `https://ramana.com.np/products/${slug}`,
    brand: {
      "@type": "Brand",
      name: "Ramana Handmade Collection",
    },
    offers: {
      "@type": "Offer",
      price: product.discount_price || product.price,
      priceCurrency: "NPR",
      availability:
        product.stock && product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Ramana Handmade Collection",
        url: "https://ramana.com.np",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "100+",
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Client-side product page with ISR data */}
      <ProductPageClient
        initialProduct={product}
        category={category}
        similarProducts={similarProducts}
        slug={slug}
      />
    </>
  );
}
