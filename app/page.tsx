"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import PremiumHero from "@/components/non-authenticated/PremiumHero";
import ExploreProducts from "@/components/non-authenticated/ExploreProducts";
import PremiumTestimonials from "@/components/non-authenticated/PremiumTestimonials";
import PremiumFeatures from "@/components/non-authenticated/PremiumFeatures";
import PremiumCTA from "@/components/non-authenticated/PremiumCTA";

// Custom hook for scroll animations
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    const currentRef = ref.current;
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return { ref, isVisible };
}

function AnimatedSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
      transition={{ duration: 0.8, delay }}
      className="mb-12"
    >
      {children}
    </motion.div>
  );
}

export default function Page() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <PremiumHero />

      {/* Features Section */}
      <AnimatedSection delay={0.2}>
        <PremiumFeatures />
      </AnimatedSection>

      {/* Products Section */}
      <section
        id="products"
        className="py-20 bg-gradient-to-b from-white to-green-50/30 dark:from-gray-900 dark:to-green-900/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our <span className="text-gradient">Featured Collection</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Handpicked arrangements crafted with love and attention to detail
            </p>
          </motion.div>
          <ExploreProducts />
        </div>
      </section>

      {/* Testimonials */}
      <AnimatedSection delay={0.3}>
        <PremiumTestimonials />
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection delay={0.4}>
        <PremiumCTA />
      </AnimatedSection>
    </div>
  );
}
