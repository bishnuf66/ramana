import { Metadata } from "next";
import AboutPageClient from "@/components/about/AboutPageClient";

export const metadata: Metadata = {
  title: "About Ramana | Handmade Bouquets & Floral Artistry",
  description:
    "Learn about Ramana's journey creating beautiful handmade bouquets with passion and love in Kathmandu Valley, Nepal.",
  keywords: ["about Ramana", "handmade bouquets", "floral artistry"],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://ramana.com.np/about" },
};

export const revalidate = 86400;

export default function AboutPage() {
  return <AboutPageClient />;
}
