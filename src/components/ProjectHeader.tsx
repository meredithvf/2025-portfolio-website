"use client";

import Link from "next/link";
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
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = rect.height;

      // Keep title at minimum scale until the section starts scrolling past
      // the top of the viewport, then scale up with scroll progress.
      const scrollProgress = Math.max(
        0,
        Math.min(1, -rect.top / sectionHeight),
      );

      // Keep title scaling consistent across breakpoints.
      // Use easing for smoother animation
      const easedProgress = scrollProgress * scrollProgress; // Ease out
      const newScale = 0.3 + easedProgress * 0.85;
      setScale(newScale);
    };

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
      className="relative h-[65vh] md:h-[85vh] flex items-center justify-center mx-4 md:mx-12 lg:mx-20 my-6 md:my-10 bg-foreground rounded-sm overflow-hidden"
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
      <Link
        href={backHref}
        className="absolute top-6 left-6 md:top-8 md:left-8 text-background/60 hover:text-background transition-all duration-500 flex items-center gap-5 text-sm opacity-100 translate-y-0"
      >
        <span className="hover:-translate-x-1 transition-transform duration-300">
          ←
        </span>
        <span>Back</span>
      </Link>

      {/* Quick actions */}
      <nav
        aria-label="Project quick actions"
        className="absolute bottom-4 left-4 right-4 md:hidden"
      >
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-s tracking-wider uppercase text-background/55">
          <a
            href="/resume.pdf"
            download="meredith-von-feldt-resume.pdf"
            className="hover:text-background transition-colors duration-300"
          >
            Resume
          </a>
          <a
            href="mailto:meredithvf@gmail.com"
            className="hover:text-background transition-colors duration-300"
          >
            Email
          </a>
          <Link
            href="/#intro"
            className="hover:text-background transition-colors duration-300"
          >
            Home
          </Link>
          <Link
            href="/#work"
            className="hover:text-background transition-colors duration-300"
          >
            Work
          </Link>
        </div>
      </nav>

      {/* Title */}
      <h1
        className="display-heading text-center will-change-transform px-6"
        style={{
          fontSize: "10rem",
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
