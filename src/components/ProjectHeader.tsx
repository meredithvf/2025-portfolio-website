"use client";

import { useEffect, useState, useRef } from "react";

interface ProjectHeaderProps {
  title: string;
  backHref?: string;
}

export default function ProjectHeader({
  title,
  backHref = "/#work",
}: ProjectHeaderProps) {
  const [scale, setScale] = useState(0.3);
  const [opacity, setOpacity] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger initial animation after mount
    const timer = setTimeout(() => setLoaded(true), 100);

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
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[85vh] flex items-center justify-center mx-4 md:mx-12 lg:mx-20 my-6 md:my-10 bg-foreground rounded-sm overflow-hidden"
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(236, 231, 193, 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Back link */}
      <a
        href={backHref}
        className={`absolute top-6 left-6 md:top-8 md:left-8 text-background/60 hover:text-background transition-all duration-500 flex items-center gap-2 text-sm ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
        style={{ transitionDelay: "400ms" }}
      >
        <span className="hover:-translate-x-1 transition-transform duration-300">
          ←
        </span>
        <span>Back</span>
      </a>

      {/* Title */}
      <h1
        className="display-heading text-center will-change-transform px-6"
        style={{
          fontSize: `clamp(2rem, 10vw, 10rem)`,
          opacity: opacity,
          color: "var(--background)",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {title}
      </h1>

      <style jsx>{`
        @keyframes scroll-indicator {
          0% {
            transform: translateY(-100%);
          }
          50% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(-100%);
          }
        }
      `}</style>
    </section>
  );
}
