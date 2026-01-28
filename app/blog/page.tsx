import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Blog } from "@/types/blog";
import { getBlogs } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog - Flower Tips & Floral Inspiration | Ramana Handmade Bouquets",
  description:
    "Discover tips, inspiration, and stories about flowers, bouquets, and floral arrangements. Learn flower care and arrangement ideas from Ramana Handmade Collection.",
  keywords: [
    "flower blog",
    "floral tips",
    "flower care",
    "bouquet ideas",
    "flower arrangements",
    "flower inspiration",
  ],
  openGraph: {
    title: "Blog - Flower Tips & Inspiration | Ramana",
    description:
      "Discover flower tips, care guides, and floral inspiration on Ramana's blog.",
    url: "https://ramana.com.np/blog",
    siteName: "Ramana Handmade Bouquets",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://ramana.com.np/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ramana Handmade Bouquets Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flower Blog & Tips",
    description: "Flower care tips, arrangement ideas, and floral inspiration",
    creator: "@ramana_handmade",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://ramana.com.np/blog",
  },
};

// Revalidate every 24 hours
export const revalidate = 86400;

export default async function BlogPage() {
  const blogs = await getBlogs();

  // Structured data for blog collection
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ramana Handmade Bouquets Blog",
    description:
      "Flower tips, care guides, and floral inspiration from Ramana Handmade Collection",
    url: "https://ramana.com.np/blog",
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover tips, inspiration, and stories about flowers and
              arrangements
            </p>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Cover Image */}
                {blog.cover_image_url && (
                  <div className="relative h-48">
                    <Image
                      src={blog.cover_image_url}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {blog.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="hover:text-pink-600 transition-colors"
                    >
                      {blog.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <time dateTime={blog.created_at}>
                        {new Date(blog.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      {blog.readingTime && (
                        <span>{blog.readingTime} min read</span>
                      )}
                    </div>
                  </div>

                  {/* Read More */}
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="inline-flex items-center mt-4 text-pink-600 font-medium hover:text-pink-700 transition-colors"
                  >
                    Read More
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {blogs.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No blog posts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back soon for new articles!
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
