"use client";

import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import type { Project } from "@/types/project";
import { lightenColor } from "@/utils/colorUtils";
import {
  clamp,
  easeOutQuad,
  easeOutPow,
  easeInPow,
  normalizeProgress,
  calculateFadeOpacity,
} from "@/utils/animation";

interface ProjectSlideProps {
  project: Project;
  index: number;
  previousColor?: string;
  anchorId?: string;
  isLast?: boolean;
}

export default function ProjectSlide({
  project,
  index,
  previousColor,
  anchorId,
  isLast = false,
}: ProjectSlideProps) {
  const slideRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasMeasuredInitialProgressRef = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInitialStateReady, setIsInitialStateReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleProjectClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const isModifiedClick =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const isNonPrimaryButton = event.button !== 0;
    if (isModifiedClick || isNonPrimaryButton) return;

    event.preventDefault();

    const restoreUrl = `/?project=${project.slug}`;
    window.history.replaceState(window.history.state, "", restoreUrl);
    window.location.assign(`/work/${project.slug}`);
  };

  useLayoutEffect(() => {
    let ticking = false;
    let frameId = 0;

    const syncProgress = () => {
      if (!slideRef.current) return;

      const rect = slideRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const slideHeight = rect.height;
      setIsMobile(window.innerWidth < 768);

      const totalScrollDistance = slideHeight + windowHeight;
      const scrolled = windowHeight - rect.top;
      const progress = clamp(scrolled / totalScrollDistance, 0, 1);

      setScrollProgress(progress);
      if (!hasMeasuredInitialProgressRef.current) {
        hasMeasuredInitialProgressRef.current = true;
        setIsInitialStateReady(true);
      }

      if (videoRef.current) {
        if (progress > 0.15 && progress < 0.7) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      }
    };

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      frameId = requestAnimationFrame(() => {
        syncProgress();
        ticking = false;
      });
    };

    // Measure immediately before first paint to avoid one-frame jump.
    syncProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const media = project.showcaseMedia || {
    type: "image" as const,
    src: project.thumbnail,
  };
  const isVideo = media.type === "video";
  const isByuLogoImage = !isVideo && media.src.includes("byu-logo");

  // Colors
  const sunColor = project.sunColor || "#E8D5A3";
  const bgColor = previousColor || "#ece7c1";

  // Animation progress - delay expansion so circle stays small at first
  const expansionProgress = normalizeProgress(scrollProgress, 0.15, 0.7);
  const eased = easeOutQuad(expansionProgress);

  // Sun gradient intensity decreases as it expands (becomes more solid)
  const gradientIntensity = Math.max(0, 1 - eased);
  const sunCore = lightenColor(sunColor, 0.25 * gradientIntensity);
  const sunMid = lightenColor(sunColor, 0.1 * gradientIntensity);

  // Dramatic oval - starts as narrow 1/3 width, grows height first
  const heightEased = easeOutPow(eased, 1.5); // Height expands quickly
  const widthEased = easeInPow(eased, 1.3); // Width expands more slowly

  const circleWidth = 33 + widthEased * 467; // 33vw to 500vw
  const circleHeight = 60 + heightEased * 440; // 60vw to 500vw
  const circleTop = 45 - heightEased * 95; // Rises up as height grows

  // Content fade in/out
  const contentOpacity = calculateFadeOpacity(scrollProgress);
  const contentY = scrollProgress > 0.5 ? (scrollProgress - 0.5) * -100 : 0;

  return (
    <div
      ref={slideRef}
      className={`relative min-h-[95vh] ${isLast ? "md:min-h-[120vh]" : "md:min-h-[150vh]"} ${
        index > 0 ? "-mt-[18vh] md:-mt-[40vh]" : ""
      }`}
      style={{
        backgroundColor: bgColor,
        zIndex: index + 1,
      }}
    >
      {/* The Sun */}
      <div
        className="project-slide-sun absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          zIndex: 5,
          opacity: isInitialStateReady ? 1 : 0,
        }}
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
          const rx = circleWidth / 2;
          const ry = circleHeight / 2;
          const svgHeight = circleHeight * 0.5;

          // Mobile gets a flatter, more centered arc for larger text.
          const innerRx = rx * 0.98;
          const innerRy = ry * (isMobile ? 0.94 : 0.98);

          // Start and end angles for the arc (in radians)
          const startAngle = isMobile ? -2.05 : -2.15;
          const endAngle = isMobile ? -1.05 : -1.9;

          // Calculate start and end points on the inner ellipse
          const cx = rx;
          const cy = svgHeight;

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
                <path id={`sunCurve-${index}`} d={arcPath} fill="none" />
              </defs>
              <text
                className="text-[8px] md:text-[2px] tracking-[0.04em] md:tracking-[0.1em]"
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
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
        id={anchorId}
        className="project-slide-content relative z-10 min-h-[72vh] md:min-h-screen flex items-center justify-center py-8 md:py-20"
        style={{
          opacity: isInitialStateReady ? contentOpacity : 1,
          transform: isInitialStateReady ? `translateY(${contentY}px)` : "none",
        }}
      >
        <a
          href={`/work/${project.slug}`}
          onClick={handleProjectClick}
          className="group inline-flex flex-col items-center text-center"
        >
          {/* Media */}
          <div className="mb-6" aria-label={`View ${project.title} project`}>
            <div
              className={`relative overflow-hidden rounded-lg shadow-xl bg-black/10 ${
                isByuLogoImage
                  ? "w-64 md:w-72 aspect-square"
                  : "w-80 md:w-96 aspect-[16/10]"
              }`}
            >
              {isVideo ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src={media.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  src={media.src}
                  alt={project.title}
                  fill
                  sizes={isByuLogoImage ? "(max-width: 768px) 16rem, 18rem" : "(max-width: 768px) 20rem, 24rem"}
                  className={`
                    w-full h-full object-cover
                    transition-transform duration-500
                    group-hover:scale-105
                    ${isByuLogoImage ? "object-contain bg-white p-0 md:p-5" : ""}
                  `}
                  loading="lazy"
                />
              )}
            </div>
          </div>

          {/* Text Content */}
          <div className="flex flex-col items-center">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-700">
              {project.category}
            </p>

            <div className="mb-3">
              <h3 className="display-heading text-3xl md:text-4xl text-slate-800 transition-transform duration-300 group-hover:scale-110 origin-center">
                {project.title}
              </h3>
            </div>

            {project.description && (
              <div className="mb-6">
                <p className="text-slate-700 text-sm leading-relaxed max-w-sm">
                  {project.description}
                </p>
              </div>
            )}

            <div className="inline-flex items-center gap-3 text-xl text-slate-800 group-hover:scale-110 transition-colors link-underline">
              <span>See More</span>
              <span className="group-hover:translate-x-2 transition-transform">
                →
              </span>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
