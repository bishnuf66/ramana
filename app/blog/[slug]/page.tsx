import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Tables } from "@/types/database.types";
import { getBlogBySlug, getBlogs } from "@/lib/blog";

type Blog = Tables<"blogs">;

// Generate metadata for the blog post
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found - Ramana",
      description: "The blog post you're looking for doesn't exist.",
    };
  }

  const baseUrl = "https://ramana.com.np";
  const postUrl = `${baseUrl}/blog/${slug}`;

  return {
    title: `${blog.title} | Ramana Handmade Bouquets Blog`,
    description:
      blog.excerpt ||
      `Read about ${blog.title} on Ramana's blog. Tips, inspiration, and stories about flowers and floral arrangements.`,
    keywords: [
      blog.title,
      "flowers",
      "bouquets",
      "floral tips",
      "flower care",
      ...(blog.tags || []),
    ],
    authors: [{ name: "Ramana Handmade Collection" }],
    creator: "Ramana Handmade Collection",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt || "Read on Ramana's blog",
      url: postUrl,
      siteName: "Ramana Handmade Bouquets",
      type: "article",
      locale: "en_US",
      publishedTime: blog.created_at,
      modifiedTime: blog.updated_at,
      images: blog.cover_image_url
        ? [
            {
              url: blog.cover_image_url,
              width: 1200,
              height: 630,
              alt: blog.title,
            },
          ]
        : [],
      authors: ["Ramana Handmade Collection"],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt || "New blog post from Ramana",
      images: blog.cover_image_url ? [blog.cover_image_url] : [],
      creator: "@ramana_handmade",
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

// Generate static params for ISR
export async function generateStaticParams() {
  const blogsData = await getBlogs();
  return blogsData?.blogs?.map((blog: Blog) => ({
    slug: blog.slug,
  }));
}

// Revalidate every 24 hours for blog posts
export const revalidate = 86400;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  // Structured data for blog post
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt || blog.title,
    image: blog.cover_image_url || "https://ramana.com.np/logo.png",
    datePublished: blog.created_at,
    dateModified: blog.updated_at,
    author: {
      "@type": "Organization",
      name: "Ramana Handmade Collection",
      url: "https://ramana.com.np",
    },
    publisher: {
      "@type": "Organization",
      name: "Ramana Handmade Collection",
      logo: {
        "@type": "ImageObject",
        url: "https://ramana.com.np/logo.png",
      },
    },
  };

  // Simple markdown to HTML converter (in production, use a proper library like react-markdown)
  const formatMarkdown = (content: string): string => {
    return content
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">$1</h3>',
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">$1</h2>',
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-3xl font-bold mt-8 mb-6 text-gray-900 dark:text-white">$1</h1>',
      )
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-2">• $1</li>')
      .replace(
        /\n\n/gim,
        '</p><p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">',
      )
      .replace(
        /^/,
        '<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">',
      )
      .replace(/$/, "</p>");
  };

  return (
    <>
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section with Cover Image */}
        {blog.cover_image_url && (
          <div className="relative h-96 w-full">
            <Image
              src={blog.cover_image_url}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {blog.title}
                </h1>
                {blog.excerpt && (
                  <p className="text-xl text-gray-200 max-w-2xl">
                    {blog.excerpt}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!blog.cover_image_url && (
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 h-96 flex items-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {blog.title}
              </h1>
              {blog.excerpt && (
                <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                  {blog.excerpt}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Blog
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li className="text-gray-900 font-medium">{blog.title}</li>
            </ol>
          </nav>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Meta Information */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <time dateTime={blog.created_at} className="text-gray-600">
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {blog.read_min && (
                <span className="text-gray-600">
                  • {blog.read_min} min read
                </span>
              )}
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-pink-100 text-pink-800 text-sm font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Blog Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: formatMarkdown(blog.content_md),
            }}
          />

          {/* Back to Blog Button */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/blog"
              className="inline-flex items-center text-pink-600 font-medium hover:text-pink-700 transition-colors"
            >
              <svg
                className="mr-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Blog
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
