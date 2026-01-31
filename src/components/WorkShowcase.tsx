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
    let ticking = false;
    
    const handleScroll = () => {
      if (ticking) return;
      
      ticking = true;
      requestAnimationFrame(() => {
        if (!slideRef.current) {
          ticking = false;
          return;
        }

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
        
        ticking = false;
      });
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
        marginTop: index > 0 ? "-20vh" : 0,
        zIndex: index + 1,
      }}
    >
      {/* The Sun - simplified for performance */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 5 }}
      >
        {/* Main sun body */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: `${circleTop}%`,
            width: `${circleWidth}vw`,
            height: `${circleHeight}vw`,
            transform: "translateX(-50%) translateZ(0)",
            borderRadius: "50%",
            background: `radial-gradient(ellipse at 50% 35%,
              ${sunCore} 0%,
              ${sunMid} 25%,
              ${sunColor} 50%,
              ${sunColor} 100%
            )`,
          }}
        />

        {/* "Sunshine" easter egg - positioned relative to the sun */}
        {(() => {
          // Calculate ellipse parameters
          const rx = circleWidth / 2; // horizontal radius in vw
          const ry = circleHeight / 2; // vertical radius in vw
          const svgHeight = circleHeight * 0.5; // top half only
          
          // Arc just inside the top edge (offset by 2% of radius)
          const innerRx = rx * 0.98;
          const innerRy = ry * 0.98;
          
          // Start and end angles for the arc (in radians, from top)
          // Left side: around -123 to -109 degrees from horizontal
          const startAngle = -2.15; // about -123 degrees
          const endAngle = -1.9; // about -109 degrees
          
          // Calculate start and end points on the inner ellipse
          const cx = rx; // center x
          const cy = svgHeight; // center y (bottom of SVG)
          
          const x1 = cx + innerRx * Math.cos(startAngle);
          const y1 = cy + innerRy * Math.sin(startAngle);
          const x2 = cx + innerRx * Math.cos(endAngle);
          const y2 = cy + innerRy * Math.sin(endAngle);
          
          const arcPath = `M ${x1},${y1} A ${innerRx},${innerRy} 0 0 1 ${x2},${y2}`;
          
          return (
            <svg
              style={{
                position: "absolute",
                left: "50%",
                top: `${circleTop}%`,
                width: `${circleWidth}vw`,
                height: `${svgHeight}vw`,
                transform: "translateX(-50%)",
                overflow: "visible",
                pointerEvents: "none",
              }}
              viewBox={`0 0 ${circleWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <path
                  id={`sunCurve-${index}`}
                  d={arcPath}
                  fill="none"
                />
              </defs>
              <text
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontSize: "2px",
                  letterSpacing: "0.1em",
                  fill: "rgba(255,255,255,0.35)",
                  fontStyle: "italic",
                }}
              >
                <textPath
                  href={`#sunCurve-${index}`}
                  startOffset="50%"
                  textAnchor="middle"
                >
                  meredith sunshine
                </textPath>
              </text>
            </svg>
          );
        })()}
      </div>

      {/* Content */}
      <div
        className="relative z-10 min-h-screen flex items-center justify-center py-20"
        style={{
          opacity: contentOpacity,
          transform: `translateY(${contentY}px)`,
        }}
      >
        <div className="group inline-flex flex-col items-center text-center">
          {/* Media */}
          <Link
            href={`/work/${project.slug}`}
            className="mb-6"
            aria-label={`View ${project.title} project`}
          >
            <div className="relative overflow-hidden rounded-lg aspect-[16/10] shadow-xl bg-black/10 w-80 md:w-96">
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={media.src}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          </Link>

          {/* Text Content */}
          <div className="flex flex-col items-center">
            <Link
              href={`/work/${project.slug}`}
              className="mb-2"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-slate-600">
                {project.category}
              </p>
            </Link>

            <Link
              href={`/work/${project.slug}`}
              className="mb-3"
            >
              <h3 className="display-heading text-3xl md:text-4xl text-slate-800 transition-transform duration-300 group-hover:scale-110 origin-center">
                {project.title}
              </h3>
            </Link>

            {project.description && (
              <Link
                href={`/work/${project.slug}`}
                className="mb-6"
              >
                <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                  {project.description}
                </p>
              </Link>
            )}

            <Link
              href={`/work/${project.slug}`}
              className="inline-flex items-center gap-3 text-xl text-slate-800 group-hover:scale-110 transition-colors"
            >
              <span>View Project</span>
              <span className="group-hover:translate-x-2 transition-transform">
                →
              </span>
            </Link>

          </div>
        </div>
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
      className="relative w-full overflow-hidden"
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
