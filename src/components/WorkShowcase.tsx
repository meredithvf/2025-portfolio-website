"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  slug: string;
  description?: string;
  showcaseMedia?: {
    type: "image" | "video";
    src: string;
  };
  sunColor?: string;
}

interface WorkShowcaseProps {
  projects: Project[];
}

// Helper to lighten a hex color
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(
    255,
    Math.floor((num >> 16) + (255 - (num >> 16)) * percent)
  );
  const g = Math.min(
    255,
    Math.floor(((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * percent)
  );
  const b = Math.min(
    255,
    Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * percent)
  );
  return `rgb(${r}, ${g}, ${b})`;
}

function ProjectSlide({
  project,
  index,
  totalProjects,
  previousColor,
}: {
  project: Project;
  index: number;
  totalProjects: number;
  previousColor?: string;
}) {
  const slideRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!slideRef.current) return;

      const rect = slideRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const slideHeight = rect.height;

      const totalScrollDistance = slideHeight + windowHeight;
      const scrolled = windowHeight - rect.top;
      const progress = scrolled / totalScrollDistance;
      const clamped = Math.max(0, Math.min(1, progress));

      setScrollProgress(clamped);

      if (videoRef.current) {
        if (clamped > 0.15 && clamped < 0.7) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const media = project.showcaseMedia || {
    type: "image" as const,
    src: project.thumbnail,
  };
  const isVideo = media.type === "video";

  // Colors
  const sunColor = project.sunColor || "#E8D5A3";
  const bgColor = previousColor || "#ece7c1";

  // Animation progress - delay expansion so circle stays small at first
  const expansionProgress = Math.max(
    0,
    Math.min(1, (scrollProgress - 0.15) / 0.7)
  );
  const eased = 1 - Math.pow(1 - expansionProgress, 2);

  // Sun gradient intensity decreases as it expands (becomes more solid)
  // When fully expanded, sun is solid color matching next section's background
  const gradientIntensity = Math.max(0, 1 - eased);
  const sunCore = lightenColor(sunColor, 0.25 * gradientIntensity);
  const sunMid = lightenColor(sunColor, 0.1 * gradientIntensity);

  // Dramatic oval like ChungiYoo - starts as narrow 1/3 width, grows height first
  // Width starts at ~33vw (1/3 of page), expands slowly at first
  // Height grows faster initially, creating tall rising shape
  
  // Height expands quickly (eased more aggressively)
  const heightEased = 1 - Math.pow(1 - eased, 1.5); // Faster easing for height
  // Width expands more slowly (delayed easing)
  const widthEased = Math.pow(eased, 1.3); // Slower easing for width
  
  const circleWidth = 33 + widthEased * 467; // 33vw (1/3) to 500vw
  const circleHeight = 60 + heightEased * 440; // 60vw to 500vw - starts taller, grows faster
  const circleTop = 45 - heightEased * 95; // Rises up as height grows

  // Content fade
  let contentOpacity = 0;
  if (scrollProgress < 0.1) {
    contentOpacity = 0;
  } else if (scrollProgress < 0.3) {
    contentOpacity = (scrollProgress - 0.1) / 0.2;
  } else if (scrollProgress < 0.6) {
    contentOpacity = 1;
  } else if (scrollProgress < 0.85) {
    contentOpacity = 1 - (scrollProgress - 0.6) / 0.25;
  } else {
    contentOpacity = 0;
  }

  const contentY = scrollProgress > 0.5 ? (scrollProgress - 0.5) * -100 : 0;

  // Rays opacity - visible when sun is partially risen
  const raysOpacity =
    Math.max(0, Math.min(1, expansionProgress * 2)) *
    (1 - Math.max(0, (expansionProgress - 0.7) * 3.33));

  return (
    <div
      ref={slideRef}
      className="relative"
      style={{
        minHeight: "150vh",
        backgroundColor: bgColor,
        marginTop: index > 0 ? "-20vh" : 0, // Overlap with previous slide
        zIndex: index + 1, // Each slide stacks above the previous
      }}
    >
      {/* The Sun - with radial gradient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 5 }}
      >
        {/* Outer glow */}
        <div
          className="sun-pulse"
          style={{
            position: "absolute",
            left: "50%",
            top: `${circleTop}%`,
            width: `${circleWidth * 1.2}vw`,
            height: `${circleHeight * 1.2}vw`,
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background: `radial-gradient(ellipse at 50% 50%,
              ${sunColor}40 0%,
              ${sunColor}20 40%,
              ${sunColor}08 60%,
              transparent 75%
            )`,
          }}
        />

        {/* Main sun body with gradient */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: `${circleTop}%`,
            width: `${circleWidth}vw`,
            height: `${circleHeight}vw`,
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background: `radial-gradient(ellipse at 50% 35%,
              ${sunCore} 0%,
              ${sunMid} 25%,
              ${sunColor} 50%,
              ${sunColor} 100%
            )`,
          }}
        />

        {/* Light rays */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: `${circleTop + circleHeight * 0.25}%`,
            width: `${circleWidth * 2}vw`,
            height: `${circleHeight}vw`,
            transform: "translateX(-50%)",
            opacity: raysOpacity * 0.15,
            background: `
              conic-gradient(
                from 180deg at 50% 100%,
                transparent 0deg,
                ${sunCore} 5deg,
                transparent 10deg,
                transparent 20deg,
                ${sunCore} 25deg,
                transparent 30deg,
                transparent 40deg,
                ${sunCore} 45deg,
                transparent 50deg,
                transparent 60deg,
                ${sunCore} 65deg,
                transparent 70deg,
                transparent 80deg,
                ${sunCore} 85deg,
                transparent 90deg,
                transparent 100deg,
                ${sunCore} 105deg,
                transparent 110deg,
                transparent 120deg,
                ${sunCore} 125deg,
                transparent 130deg,
                transparent 140deg,
                ${sunCore} 145deg,
                transparent 150deg,
                transparent 160deg,
                ${sunCore} 165deg,
                transparent 170deg,
                transparent 180deg
              )
            `,
            filter: "blur(8px)",
          }}
        />

        {/* Lens flare / bright spot at top of sun */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: `${circleTop + circleHeight * 0.15}%`,
            width: `${circleWidth * 0.15}vw`,
            height: `${circleHeight * 0.08}vw`,
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background: `radial-gradient(ellipse at 50% 50%,
              rgba(255,255,255,0.6) 0%,
              rgba(255,255,255,0.2) 40%,
              transparent 70%
            )`,
            opacity: raysOpacity * 0.8,
            filter: "blur(4px)",
          }}
        />

        {/* "Sunshine" easter egg - very subtle, visible when sun is prominent */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: `${circleTop + circleHeight * 0.4}%`,
            transform: "translateX(-50%)",
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: `${circleWidth * 0.03}vw`,
            letterSpacing: "0.3em",
            color: `rgba(255,255,255,${raysOpacity * 0.12})`,
            textTransform: "lowercase",
            fontStyle: "italic",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          meredith sunshine
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center py-20">
        <Link
          href={`/work/${project.slug}`}
          className="group block w-full"
          aria-label={`View ${project.title} project`}
          style={{
            opacity: contentOpacity,
            transform: `translateY(${contentY}px)`,
          }}
        >
          <div className="max-w-2xl mx-auto px-6 md:px-12 text-center">
            {/* Number */}
            <span
              className="display-heading text-7xl md:text-8xl leading-none block mb-4"
              style={{ color: "rgba(255,255,255,0.15)" }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Media */}
            <div className="mb-6">
              <div className="relative overflow-hidden rounded-lg aspect-[16/10] shadow-xl bg-black/10 max-w-sm mx-auto">
                {isVideo ? (
                  <video
                    ref={videoRef}
                    src={media.src}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={media.src}
                    alt={project.title}
                    className={`
                      w-full h-full object-cover
                      transition-transform duration-500
                      group-hover:scale-105
                      ${
                        media.src.includes("byu-logo")
                          ? "object-contain bg-white p-8"
                          : ""
                      }
                    `}
                    loading="lazy"
                  />
                )}
              </div>
            </div>

            {/* Text Content */}
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/70 mb-2">
                {project.category}
              </p>

              <h3 className="display-heading text-3xl md:text-4xl text-white mb-3 group-hover:opacity-80 transition-opacity">
                {project.title}
              </h3>

              {project.description && (
                <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-md mx-auto">
                  {project.description}
                </p>
              )}

              <span className="inline-flex items-center gap-3 text-sm text-white/60 group-hover:text-white transition-colors">
                <span>View Project</span>
                <span className="group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </span>

              <div className="mt-6 text-xs text-white/40 font-mono">
                {index + 1} / {totalProjects}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function WorkShowcase({ projects }: WorkShowcaseProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setHeaderVisible(true);
        });
      },
      { threshold: 0.2 }
    );

    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!projects || projects.length === 0) return null;

  return (
    <section
      id="work"
      className="relative w-full"
      aria-labelledby="work-heading"
    >
      {/* Header */}
      <div ref={headerRef} className="max-w-6xl mx-auto px-6 md:px-12 py-24">
        <div
          className={`transition-all duration-1000 ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <p className="text-sm uppercase tracking-[0.2em] text-foreground/50 mb-4">
            Selected Work
          </p>
          <h2
            id="work-heading"
            className="display-heading text-5xl md:text-6xl lg:text-7xl"
          >
            Projects
          </h2>
        </div>
      </div>

      {/* Projects */}
      {projects.map((project, index) => (
        <ProjectSlide
          key={project.id}
          project={project}
          index={index}
          totalProjects={projects.length}
          previousColor={index > 0 ? projects[index - 1].sunColor : "#ece7c1"}
        />
      ))}
    </section>
  );
}
