import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ProductsPageClient from "@/components/products/ProductsPageClient";

export const metadata: Metadata = {
  title: "Products - Premium Handmade Bouquets | Ramana",
  description:
    "Discover our beautiful collection of handmade bouquets and floral arrangements. Fresh flowers crafted with love in Kathmandu Valley, Nepal.",
  keywords: [
    "handmade bouquets",
    "flowers Kathmandu",
    "Nepal flowers",
    "custom bouquets",
    "floral arrangements",
    "flower delivery",
    "gift flowers",
  ],
  openGraph: {
    title: "Premium Handmade Bouquets & Flowers | Ramana",
    description:
      "Beautiful handcrafted bouquets and floral arrangements from Ramana",
    url: "https://ramana.com.np/products",
    siteName: "Ramana Handmade Bouquets",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://ramana.com.np/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ramana Handmade Bouquets Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Handmade Bouquets",
    description: "Premium flowers and custom arrangements from Ramana",
    creator: "@ramana_handmade",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://ramana.com.np/products",
  },
};

// Revalidate every 30 minutes
export const revalidate = 1800;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function fetchProductsData() {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return { products: products || [], categories: categories || [] };
}

export default async function ProductsPage() {
  const { products, categories } = await fetchProductsData();

  // Structured data for product collection
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ramana Handmade Bouquets - Products",
    description: "Beautiful handmade bouquets and floral arrangements",
    url: "https://ramana.com.np/products",
    image: "https://ramana.com.np/og-image.jpg",
    publisher: {
      "@type": "Organization",
      name: "Ramana Handmade Collection",
      url: "https://ramana.com.np",
      logo: "https://ramana.com.np/logo.png",
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <ProductsPageClient initialProducts={products} categories={categories} />
    </>
  );
}
