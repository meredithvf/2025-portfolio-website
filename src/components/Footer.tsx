"use client";

import { useEffect, useRef, useState } from "react";

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
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleResumeDownload = () => {
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "meredith-von-feldt-resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      className="relative w-full py-20 px-6 md:px-12 border-t border-foreground/10"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto">
        <div
          className={`
            transition-all duration-1000 ease-out
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          {/* Main CTA */}
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] text-foreground/50 mb-4">
              Let's connect
            </p>
            <a
              href="mailto:meredithvf@gmail.com"
              className="display-heading text-4xl md:text-5xl lg:text-6xl link-underline hover:text-foreground/70 transition-colors duration-300"
              aria-label="Send email to meredithvf@gmail.com"
            >
              meredithvf@gmail.com
            </a>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-foreground/10">
            <p className="text-sm text-foreground/40">
              © {currentYear} Meredith Von Feldt
            </p>
            
            <div className="flex items-center gap-8">
              <button
                onClick={handleResumeDownload}
                className="text-sm text-foreground/60 hover:text-foreground transition-colors duration-300 link-underline"
                aria-label="Download resume as PDF"
              >
                Download Resume
              </button>
              
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-sm text-foreground/60 hover:text-foreground transition-colors duration-300"
                aria-label="Scroll back to top"
              >
                Back to top ↑
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
