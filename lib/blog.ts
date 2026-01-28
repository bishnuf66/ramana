import { supabase } from "@/lib/supabase/client";
import { Tables } from "@/types/database.types";

// Use generated database type directly
type Blog = Tables<"blogs">;

// Local type definitions for filters and sorting
interface BlogFilters {
  tag?: string;
  author?: string;
  search?: string;
}

type BlogSort = "newest" | "oldest" | "title_asc" | "title_desc";

export async function getBlogs(
  filters?: BlogFilters,
  sort?: BlogSort,
  limit?: number,
  page: number = 1,
): Promise<{
  blogs: Blog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}> {
  try {
    const itemsPerPage = limit || 12;
    const offset = (page - 1) * itemsPerPage;

    let query = supabase
      .from("blogs")
      .select("*", { count: "exact" })
      .eq("published", true);

    // Apply filters
    if (filters?.tag) {
      query = query.contains("tags", [filters.tag]);
    }
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`,
      );
    }

    // Apply sorting
    switch (sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "title_asc":
        query = query.order("title", { ascending: true });
        break;
      case "title_desc":
        query = query.order("title", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + itemsPerPage - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error in getBlogs:", error);
      throw new Error("Failed to fetch blogs");
    }

    const totalPages = Math.ceil((count || 0) / itemsPerPage);

    return {
      blogs: data || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage,
      },
    };
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
      .maybeSingle();

    if (error) {
      console.error("Error fetching blog by slug:", error);
      throw new Error("Failed to fetch blog");
    }

    return data;
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
