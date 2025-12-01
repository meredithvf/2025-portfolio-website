"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface ProjectHeaderProps {
  title: string;
}

export default function ProjectHeader({ title }: ProjectHeaderProps) {
  const [scale, setScale] = useState(0.3);
  const [opacity, setOpacity] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;

      // Calculate scroll progress
      // When section top is at viewport top (rect.top = 0), we want small scale
      // As section scrolls up (rect.top becomes negative), scale grows
      // Use the section's position relative to viewport
      const scrollProgress = Math.max(
        0,
        Math.min(1, (windowHeight - rect.top) / (windowHeight + sectionHeight))
      );

      // Scale from 0.15 (very small) to 1.0 (full size) as you scroll
      // Use easing for smoother animation
      const easedProgress = scrollProgress * scrollProgress; // Ease out
      const newScale = 0.15 + easedProgress * 0.85;
      setScale(newScale);

      // Fade in as you scroll
      const newOpacity = Math.min(1, scrollProgress * 2);
      setOpacity(Math.max(0.2, newOpacity));
    };

    // Initial calculation
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[85vh] flex items-center justify-center mx-20 my-10 bg-foreground"
    >
      <h1
        className="text-center font-light will-change-transform"
        style={{
          fontSize: `clamp(2rem, 12vw, 12rem)`,
          opacity: opacity,
          color: "var(--inverted-text)",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {title}
      </h1>
    </section>
  );
}
