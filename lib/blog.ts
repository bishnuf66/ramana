import { supabase } from "@/lib/supabase/client";
import { Blog, BlogFilters, BlogSort } from "@/types/blog";
import { Tables } from "@/types/database.types";

// Database Blog interface matching the exact database schema
interface DbBlog {
  content_md: string;
  cover_image_url: string | null;
  created_at: string;
  created_by: string | null;
  excerpt: string | null;
  id: string;
  published: boolean;
  read_min: number | null;
  slug: string;
  tags: string[] | null;
  title: string;
  updated_at: string;
  author?: {
    email: string;
    raw_user_meta_data?: {
      full_name?: string;
      display_name?: string;
      avatar_url?: string;
    };
  };
}

// Convert database blog to frontend blog format
const convertDbBlog = (dbBlog: DbBlog): Blog => {
  const blog: Blog = {
    id: dbBlog.id,
    title: dbBlog.title,
    slug: dbBlog.slug,
    content_md: dbBlog.content_md,
    excerpt: dbBlog.excerpt,
    cover_image_url: dbBlog.cover_image_url,
    published: dbBlog.published,
    created_at: dbBlog.created_at,
    updated_at: dbBlog.updated_at,
    created_by: dbBlog.created_by,
    read_min: dbBlog.read_min,
    tags: dbBlog.tags || [],
    readingTime: dbBlog.read_min || undefined,
  };

  // Add author information if available
  if (dbBlog.author) {
    blog.author = {
      name:
        dbBlog.author.raw_user_meta_data?.full_name ||
        dbBlog.author.raw_user_meta_data?.display_name ||
        dbBlog.author.email?.split("@")[0] ||
        "Unknown",
      email: dbBlog.author.email,
      avatar: dbBlog.author.raw_user_meta_data?.avatar_url,
    };
  }

  // Calculate reading time if not in database
  if (!dbBlog.read_min && dbBlog.content_md) {
    const wordCount = dbBlog.content_md.split(/\s+/).length;
    blog.readingTime = Math.ceil(wordCount / 200);
  }

  return blog;
};

export async function getBlogs(
  filters?: BlogFilters,
  sort?: BlogSort,
): Promise<Blog[]> {
  try {
    let query = supabase.from("blogs").select("*").eq("published", true);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching blogs:", error);
      throw new Error("Failed to fetch blogs");
    }

    // Convert to DbBlog format and then to Blog
    const dbBlogs: DbBlog[] = (data || []).map((item) => ({
      ...item,
      author: undefined, // Will be populated in a separate query if needed
    }));

    return dbBlogs.map(convertDbBlog);
  } catch (error) {
    console.error("Error in getBlogs:", error);
    throw new Error("Failed to fetch blogs");
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error) {
      console.error("Error fetching blog by slug:", error);
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw new Error("Failed to fetch blog");
    }

    const dbBlog: DbBlog = {
      ...data,
      author: undefined, // Will be populated in a separate query if needed
    };

    return convertDbBlog(dbBlog);
  } catch (error) {
    console.error("Error in getBlogBySlug:", error);
    throw new Error("Failed to fetch blog");
  }
}

export async function getBlogSlugs(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("slug")
      .eq("published", true);

    if (error) {
      console.error("Error fetching blog slugs:", error);
      throw new Error("Failed to fetch blog slugs");
    }

    return (data || []).map((blog) => blog.slug);
  } catch (error) {
    console.error("Error in getBlogSlugs:", error);
    throw new Error("Failed to fetch blog slugs");
  }
}
