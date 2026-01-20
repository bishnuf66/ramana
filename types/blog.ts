import { Tables } from "./database.types";

export interface Blog extends Tables<"blogs"> {
  author?: {
    name: string;
    email: string;
    avatar?: string;
  };
  readingTime?: number; // Computed field for display (maps to read_min)
}

export interface BlogFilters {
  published?: boolean;
  author?: string;
  tags?: string[];
  dateRange?: [string, string];
}

export interface BlogSort {
  field: "title" | "created_at" | "updated_at" | "read_min";
  direction: "asc" | "desc";
}

export interface BlogFormData {
  title: string;
  slug: string;
  content_md: string;
  excerpt?: string;
  cover_image_url?: string;
  published?: boolean;
  tags?: string[];
  read_min?: number;
}
