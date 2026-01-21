"use client";

interface StructuredDataProps {
  type: "Organization" | "Product" | "WebPage" | "BreadcrumbList";
  data?: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case "Organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Ramana Handmade Collection",
          description:
            "Beautiful handmade bouquets crafted with love in Kathmandu Valley, Nepal",
          url: "https://ramana.com.np",
          logo: "https://ramana.com.np/logo.png",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+9779819274719",
            contactType: "customer service",
            availableLanguage: ["en", "ne"],
          },
          address: {
            "@type": "PostalAddress",
            addressLocality: "Kathmandu",
            addressCountry: "NP",
          },
          sameAs: [
            "https://www.facebook.com/profile.php?id=61587033144907",
            "https://www.instagram.com/_ramana_handmade_collection",
            "https://www.tiktok.com/@handmadebyramana",
          ],
          openingHours: "Mo-Fr 09:00-19:00, Sa 10:00-18:00",
          priceRange: "$$",
        };

      case "Product":
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          name: data?.title || "Handmade Bouquet",
          description:
            data?.description || "Beautiful handmade bouquet crafted with love",
          image: data?.image || "https://ramana.com.np/placeholder.jpg",
          brand: {
            "@type": "Brand",
            name: "Ramana Handmade Collection",
          },
          offers: {
            "@type": "Offer",
            price: data?.price || 0,
            priceCurrency: "NPR",
            availability:
              data?.stock > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: {
              "@type": "Organization",
              name: "Ramana Handmade Collection",
            },
          },
          aggregateRating: data?.rating
            ? {
                "@type": "AggregateRating",
                ratingValue: data.rating,
                reviewCount: data.reviewCount || 1,
              }
            : undefined,
          category: data?.category || "Flowers",
        };

      case "WebPage":
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: data?.title || "Ramana - Handmade Bouquets",
          description:
            data?.description ||
            "Beautiful handmade bouquets crafted with love by Ramana in Kathmandu Valley, Nepal",
          url: data?.url || "https://ramana.com.np",
          isPartOf: {
            "@type": "WebSite",
            name: "Ramana Handmade Collection",
            url: "https://ramana.com.np",
          },
          breadcrumb: data?.breadcrumb || undefined,
          mainEntity: data?.mainEntity || undefined,
        };

      case "BreadcrumbList":
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement:
            data?.breadcrumbs?.map((item: any, index: number) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              item: item.url,
            })) || [],
        };

      default:
        return {};
    }
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
