"use client";

/**
 * TO DO:
 * Images:
 * - Upload Images
 * - Make smaller so that when it zooms in to a letterit shows the full image not zoomed in
 * - Repeat images?
 *
 * Randomly change which image/letter is zoomed in on each scroll
 *
 * Right now it might be black when the image takes over, smooth that transition & figure out issue
 */

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [zoomComplete, setZoomComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

  // Sample images - replace with your own
  const images = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400&h=400&fit=crop",
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;

      // Zoom phase: 0 to 3 viewport heights (longer zoom duration)
      const zoomPhaseHeight = windowHeight * 3;

      if (scrollTop < zoomPhaseHeight) {
        // During zoom phase
        const progress = Math.min(scrollTop / zoomPhaseHeight, 1);
        setScrollProgress(progress);
        setZoomComplete(false);

        // Prevent default scroll during zoom phase
        if (containerRef.current) {
          containerRef.current.style.position = "fixed";
          containerRef.current.style.top = "0";
        }
      } else {
        // After zoom completes
        setScrollProgress(1);
        setZoomComplete(true);

        if (containerRef.current) {
          containerRef.current.style.position = "absolute";
          containerRef.current.style.top = "0";
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate zoom transformation
  // Pure zoom effect - we're diving INTO the name and into one of its images
  // Everything scales together at the same rate, creating a seamless zoom
  const zoomScale = 1 + scrollProgress * 50; // Zoom from 1x to 51x - much deeper zoom!

  // Keep the name visible throughout most of the zoom
  // It only fades at the very end when we're fully inside the image
  const nameOpacity =
    scrollProgress < 0.8
      ? 1
      : Math.max(0, 1 - ((scrollProgress - 0.8) / 0.2) * 1);

  return (
    <div className="relative">
      {/* Fixed container for zoom effect */}
      <div
        ref={containerRef}
        className="w-full h-screen overflow-hidden"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 10,
        }}
      >
        {/* Name with image-filled text - ZOOMING IN */}
        <div
          ref={nameRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            // Zoom IN to the name - the image cells naturally expand with it
            transform: `scale(${zoomScale})`,
            transformOrigin: "52% 48%", // Positioned roughly at the 'E' in MEREDITH
            transition: "none",
          }}
        >
          <div className="relative">
            <svg viewBox="0 0 1200 300" className="w-[90vw] max-w-6xl h-auto">
              <defs>
                {/* Create patterns for each image */}
                {images.map((img, idx) => (
                  <pattern
                    key={idx}
                    id={`img-pattern-${idx}`}
                    x="0"
                    y="0"
                    width="1"
                    height="1"
                  >
                    <image
                      href={img}
                      x="0"
                      y="0"
                      width="400"
                      height="300"
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </pattern>
                ))}

                {/* Clip path for text */}
                <clipPath id="text-clip">
                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    fontSize="120"
                    fontWeight="900"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    letterSpacing="-0.02em"
                  >
                    MEREDITH
                  </text>
                  <text
                    x="50%"
                    y="75%"
                    textAnchor="middle"
                    fontSize="120"
                    fontWeight="900"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    letterSpacing="-0.02em"
                  >
                    VON FELDT
                  </text>
                </clipPath>
              </defs>

              {/* Grid of images clipped to text */}
              <g clipPath="url(#text-clip)">
                {images.map((_, idx) => {
                  const cols = 4;
                  const rows = 3;
                  const col = idx % cols;
                  const row = Math.floor(idx / cols);
                  const cellWidth = 1200 / cols;
                  const cellHeight = 300 / rows;

                  return (
                    <rect
                      key={idx}
                      x={col * cellWidth}
                      y={row * cellHeight}
                      width={cellWidth}
                      height={cellHeight}
                      fill={`url(#img-pattern-${idx})`}
                    />
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Spacer to enable scrolling - matches zoom phase height */}
      <div style={{ height: "400vh" }} />

      {/* Below the fold content */}
      <div
        className="relative z-20 min-h-screen bg-gradient-to-b from-transparent to-background"
        style={{
          marginTop: "-100vh",
          paddingTop: "2rem",
        }}
      >
        {/* Overlay to blend from image to content */}
        <div
          className="absolute inset-x-0 top-0 h-screen bg-gradient-to-b from-black/60 to-background pointer-events-none"
          style={{
            opacity: zoomComplete ? 1 : 0,
          }}
        />

        <div className="relative container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            {/* Content section */}
            <section className="mb-20">
              <h2 className="text-5xl font-bold mb-8 text-foreground">
                Welcome to My World
              </h2>
              <p className="text-xl text-foreground/80 leading-relaxed mb-6">
                You've just experienced the journey through my name into the
                world I create. Each letter contains a universe of experiences,
                projects, and passions.
              </p>
              <p className="text-xl text-foreground/80 leading-relaxed">
                I'm Meredith Von Feldt, a creative developer who believes in
                making the web more beautiful, interactive, and memorable.
              </p>
            </section>

            {/* Projects preview */}
            <section className="mb-20">
              <h3 className="text-4xl font-bold mb-12 text-foreground">
                Featured Work
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-2xl aspect-square bg-foreground/5 hover:bg-foreground/10 transition-all duration-300"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-foreground/20 group-hover:text-foreground/40 transition-colors">
                          0{i}
                        </div>
                        <div className="text-lg text-foreground/60 mt-2">
                          Project {i}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* About section */}
            <section className="mb-20">
              <h3 className="text-4xl font-bold mb-8 text-foreground">
                About Me
              </h3>
              <div className="space-y-6 text-lg text-foreground/80">
                <p>
                  I specialize in creating immersive web experiences that blur
                  the line between technology and art. Every project is an
                  opportunity to push the boundaries of what's possible on the
                  web.
                </p>
                <p>
                  My approach combines cutting-edge web technologies with
                  thoughtful design to create experiences that are not just
                  functional, but unforgettable.
                </p>
              </div>
            </section>

            {/* Contact section */}
            <section className="mb-20">
              <h3 className="text-4xl font-bold mb-8 text-foreground">
                Let's Connect
              </h3>
              <p className="text-xl text-foreground/80 mb-8">
                Interested in working together or just want to say hi?
              </p>
              <div className="flex gap-6">
                <a
                  href="#"
                  className="px-8 py-4 bg-foreground text-background rounded-full font-semibold hover:opacity-80 transition-opacity"
                >
                  Get in Touch
                </a>
                <a
                  href="#"
                  className="px-8 py-4 border-2 border-foreground/20 text-foreground rounded-full font-semibold hover:border-foreground/40 transition-colors"
                >
                  View Resume
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      {scrollProgress < 0.1 && (
        <div
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 text-foreground/60 text-sm animate-bounce"
          style={{
            opacity: 1 - scrollProgress * 10,
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <span>Scroll to dive in</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
