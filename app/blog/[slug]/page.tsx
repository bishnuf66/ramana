import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/types/blog";
import { getBlogBySlug } from "@/lib/blog";

// Generate metadata for the blog post
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const blog = await getBlogBySlug(params.slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: `${blog.title} - Flower Shop Blog`,
    description: blog.excerpt || undefined,
    openGraph: {
      title: blog.title,
      description: blog.excerpt || undefined,
      images: blog.cover_image_url ? [blog.cover_image_url] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const blog = await getBlogBySlug(params.slug);

  if (!blog) {
    notFound();
  }

  // Simple markdown to HTML converter (in production, use a proper library like react-markdown)
  const formatMarkdown = (content: string): string => {
    return content
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-900">$1</h3>',
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">$1</h2>',
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-3xl font-bold mt-8 mb-6 text-gray-900">$1</h1>',
      )
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-2">• $1</li>')
      .replace(/\n\n/gim, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
      .replace(/^/, '<p class="mb-4 text-gray-700 leading-relaxed">')
      .replace(/$/, "</p>");
  };

  return (
    <div className="min-h-screen bg-white">
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
              <Link href="/blog" className="text-gray-500 hover:text-gray-700">
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
            {blog.readingTime && (
              <span className="text-gray-600">
                • {blog.readingTime} min read
              </span>
            )}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
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
          dangerouslySetInnerHTML={{ __html: formatMarkdown(blog.content_md) }}
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
  );
}
