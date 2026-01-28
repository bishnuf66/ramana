import { Metadata } from "next";
import TermsPageClient from "@/components/terms/TermsPageClient";

export const metadata: Metadata = {
  title: "Terms & Conditions | Ramana Handmade Bouquets",
  description:
    "Read Ramana's terms and conditions covering purchases, delivery, returns, and our policies.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://ramana.com.np/terms" },
};

export const revalidate = 604800;

export default function TermsPage() {
  return <TermsPageClient />;
}
