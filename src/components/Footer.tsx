"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ResumeLink from "@/components/ResumeLink";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.2,
      },
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      className="relative w-full min-h-screen py-12 px-6 md:px-12 border-t border-foreground/10 bg-background flex flex-col"
      style={{ zIndex: 10 }}
      role="contentinfo"
    >
      {/* Main CTA - centered in the middle */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className={`
            text-center transition-all duration-1000 ease-out
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          <p className="text-sm uppercase tracking-[0.16em] font-medium text-foreground/[0.66] mb-4">
            Let&apos;s connect
          </p>
          <a
            href="mailto:meredithvf@gmail.com"
            className="display-heading text-4xl md:text-5xl lg:text-6xl link-underline hover:text-foreground/70 transition-colors duration-300"
            aria-label="Send email to meredithvf@gmail.com"
          >
            meredithvf@gmail.com
          </a>
        </div>
      </div>

      {/* Bottom Row - pinned to bottom */}
      <div
        className={`
          max-w-6xl mx-auto w-full transition-all duration-1000 ease-out delay-200
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
        `}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-foreground/10">
          <p className="text-sm text-foreground/[0.66]">
            © {currentYear} Meredith Sunshine Von Feldt
          </p>

          <div className="flex items-center gap-8">
            <ResumeLink
              className="text-sm text-foreground/[0.66] hover:text-foreground transition-colors duration-300 link-underline"
              aria-label="Download resume as PDF"
            >
              Download Resume
            </ResumeLink>

            <Link
              href="/#intro"
              className="text-sm text-foreground/[0.66] hover:text-foreground transition-colors duration-300"
              aria-label="Scroll back to top"
            >
              Back to top ↑
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
