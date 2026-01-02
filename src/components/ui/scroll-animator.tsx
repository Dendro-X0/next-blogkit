"use client";

import { useEffect, useRef, useState } from "react";

export function ScrollAnimator() {
  const [isClient, setIsClient] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side and after a small delay to prevent hydration issues
    if (!isClient) return;

    const timer = setTimeout(() => {
      // Create intersection observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
            }
          });
        },
        {
          threshold: 0.1, // Trigger when 10% of element is visible
          rootMargin: "0px 0px -50px 0px", // Start animation slightly before element comes into view
        }
      );

      // Observe all elements with scroll-animate class
      const animatedElements = document.querySelectorAll(".scroll-animate");
      animatedElements.forEach((el) => observerRef.current?.observe(el));
    }, 100); // Small delay to ensure hydration is complete

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isClient]);

  return null;
}
