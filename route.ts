import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ramana.com.np";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // Add these important pages
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, updated_at, slug, name") // Add slug and name for better data
      .eq("is_active", true)
      .eq("published", true) // Add published check
      .order("updated_at", { ascending: false })
      .limit(1000); // Limit to prevent memory issues

    if (error) throw error;

    if (products && products.length > 0) {
      productPages = products.map((product) => ({
        url: `${baseUrl}/products/${product.slug || product.id}`,
        lastModified: new Date(product.updated_at).toISOString(),
        changeFrequency: "weekly",
        priority: 0.7, // Lower than main pages but higher than blog
      }));
    }
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
    // Don't fail the entire sitemap if products fail
  }

  // Dynamic category pages
  let categoryPages: MetadataRoute.Sitemap = [];

  try {
    const { data: categories, error } = await supabase
      .from("categories") // Assuming you have a categories table
      .select("id, slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (!error && categories && categories.length > 0) {
      categoryPages = categories.map((category) => ({
        url: `${baseUrl}/categories/${category.slug || category.id}`,
        lastModified: new Date(category.updated_at).toISOString(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
  }

  // Dynamic blog pages (optional - check if blog exists)
  let blogPages: MetadataRoute.Sitemap = [];

  try {
    // Check if blog_posts table exists by attempting to fetch count
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, title")
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(100); // Reasonable limit for blog posts

    if (!error && posts && posts.length > 0) {
      blogPages = [
        // Blog index page
        {
          url: `${baseUrl}/blog`,
          lastModified: new Date().toISOString(),
          changeFrequency: "weekly",
          priority: 0.7,
        },
        // Individual posts
        ...posts.map((post) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at).toISOString(),
          changeFrequency: "monthly" as "monthly",
          priority: 0.6,
        })),
      ];
    }
  } catch (error) {
    // Silently fail if blog table doesn't exist
    console.warn("Blog feature not enabled or table doesn't exist");
  }

  // Special occasion/collection pages (if you have them)
  const occasionPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/occasions/valentines`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/occasions/wedding`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/occasions/birthday`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/occasions/anniversary`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Combine all pages
  return [
    ...staticPages,
    ...categoryPages,
    ...occasionPages,
    ...productPages,
    ...blogPages,
  ];
}
