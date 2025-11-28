"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Work from "@/components/Work";
import Resume from "@/components/Resume";
import Contact from "@/components/Contact";
import { projects } from "@/data/projects";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const lowResImageRef = useRef<HTMLImageElement | null>(null);
  const highResImageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [zoomComplete, setZoomComplete] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [captionRendered, setCaptionRendered] = useState(false);

  // --- CONFIG ------------------------------------------------------------
  // Adjust to fit your exported PNG resolution
  const IMAGE_WIDTH = 8000;
  const IMAGE_HEIGHT = 3000;

  // Initial zoom (1.0 = fit screen)
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 40;

  // Caption text
  const CAPTION_TEXT = "Caption text here";

  // Target zoom hotspots (percent of image)
  const TARGETS = {
    E: { x: 56, y: 55 }, // adjust after testing
    D: { x: 56, y: 70 }, // adjust after testing
  };

  // Progressive image loading thresholds
  const HIGH_RES_ZOOM_THRESHOLD = 10; // Use high-res image when zoom > 10x

  // -----------------------------------------------------------------------

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    // Start with lower resolution for faster initial load
    img.src = "/images/large_1x_mask.png";

    img.onload = () => {
      imageRef.current = img;
      lowResImageRef.current = img;
      setImageLoaded(true);

      // Preload high-res image in background
      const highResImg = new Image();
      highResImg.crossOrigin = "anonymous";
      highResImg.src = "/images/32000w_mask.png";
      highResImg.onload = () => {
        highResImageRef.current = highResImg;
      };
    };

    img.onerror = () => {
      console.error("Failed to load image");
    };
  }, []);

  // Calculate zoom based on scroll progress
  const zoomScale = useMemo(() => {
    return MIN_ZOOM + scrollProgress * (MAX_ZOOM - MIN_ZOOM);
  }, [scrollProgress]);

  // Setup canvas and zoom handling
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imageLoaded || !imageRef.current) return;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true, // Better performance
      willReadFrequently: false,
    });

    if (!ctx) return;

    let target = TARGETS.E;
    let ticking = false;
    let animationFrameId: number | null = null;

    // Set canvas size to match viewport (always 100vw x 100vh)
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Draw image to canvas
    const draw = () => {
      if (!imageRef.current || !ctx) return;

      const img = imageRef.current;
      const canvasWidth = canvas.width / window.devicePixelRatio;
      const canvasHeight = canvas.height / window.devicePixelRatio;

      // Clear canvas with container's background color
      const computedStyle = window.getComputedStyle(container);
      const backgroundColor = computedStyle.backgroundColor || "#ece7c1";
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Calculate image dimensions to maintain aspect ratio
      const imageAspect = img.width / img.height;
      const canvasAspect = canvasWidth / canvasHeight;

      let drawWidth: number;
      let drawHeight: number;
      let offsetX = 0;
      let offsetY = 0;

      if (imageAspect > canvasAspect) {
        // Image is wider - fit to width
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imageAspect;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        // Image is taller - fit to height
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imageAspect;
        offsetX = (canvasWidth - drawWidth) / 2;
      }

      // Calculate zoom transform
      const scale = zoomScale;
      const centerX = (target.x / 100) * drawWidth + offsetX;
      const centerY = (target.y / 100) * drawHeight + offsetY;

      // Save context
      ctx.save();

      // Apply zoom transform
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);

      // Draw image with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // Restore context
      ctx.restore();
    };

    // Draw whenever zoom changes
    if (!ticking) {
      ticking = true;
      animationFrameId = requestAnimationFrame(() => {
        draw();
        ticking = false;
      });
    }

    // Switch to high-res image if zooming in past threshold
    if (
      zoomScale > HIGH_RES_ZOOM_THRESHOLD &&
      imageRef.current === lowResImageRef.current
    ) {
      if (highResImageRef.current) {
        imageRef.current = highResImageRef.current;
        draw();
      }
    }

    // Switch back to low-res if zooming out past threshold
    if (
      zoomScale <= HIGH_RES_ZOOM_THRESHOLD &&
      imageRef.current === highResImageRef.current
    ) {
      if (lowResImageRef.current) {
        imageRef.current = lowResImageRef.current;
        draw();
      }
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [imageLoaded, zoomScale]);

  // Handle scroll events
  useEffect(() => {
    let ticking = false;
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const windowHeight = window.innerHeight;

          // Zoom phase: 0 to 3 viewport heights (longer zoom duration)
          const zoomPhaseHeight = windowHeight * 3;

          let newProgress: number;
          let newZoomComplete: boolean;

          if (scrollTop < zoomPhaseHeight) {
            // During zoom phase
            newProgress = Math.min(scrollTop / zoomPhaseHeight, 1);
            newZoomComplete = false;
          } else {
            // After zoom completes
            newProgress = 1;
            newZoomComplete = true;
          }

          setScrollProgress(newProgress);

          // Show caption when zoom is almost complete (85% progress)
          const CAPTION_THRESHOLD = 0.85;
          if (newProgress >= CAPTION_THRESHOLD) {
            setShowCaption(true);
            setCaptionRendered(true); // Keep in DOM once shown
          } else {
            setShowCaption(false);
          }

          // Update zoom complete state
          setZoomComplete((prevZoomComplete) => {
            if (newZoomComplete && !prevZoomComplete) {
              return true;
            }
            if (!newZoomComplete && prevZoomComplete) {
              return false;
            }
            return prevZoomComplete;
          });

          // Show/hide scrollbar based on zoom state
          if (newZoomComplete) {
            document.documentElement.classList.add("show-scrollbar");
            document.body.classList.add("show-scrollbar");
          } else {
            document.documentElement.classList.remove("show-scrollbar");
            document.body.classList.remove("show-scrollbar");
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      // Clean up: remove scrollbar class on unmount
      document.documentElement.classList.remove("show-scrollbar");
      document.body.classList.remove("show-scrollbar");
    };
  }, []);

  return (
    <div className="relative">
      {/* Spacer to enable scrolling during zoom phase (3 viewport heights) */}
      <div style={{ height: "300vh" }} />

      {/* Photo container - fixed during zoom, relative after zoom (scrolls with page) */}
      <div
        ref={containerRef}
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          position: zoomComplete ? "relative" : "fixed",
          top: zoomComplete ? "auto" : 0,
          left: 0,
          zIndex: zoomComplete ? 1 : 10,
          backfaceVisibility: "hidden",
          transform: "translate3d(0, 0, 0)",
          opacity: imageLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            imageRendering: "auto",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
        {captionRendered && (
          <div
            className="caption"
            style={{
              position: "absolute",
              bottom: "2rem",
              right: "2rem",
              padding: "1rem 1.5rem",
              backgroundColor: "#1a1a18",
              color: "#ece7c1",
              borderRadius: "8px",
              maxWidth: "300px",
              fontSize: "0.9rem",
              lineHeight: "1.4",
              opacity: showCaption ? 1 : 0,
              transition: "opacity 0.6s ease-out",
              zIndex: 10,
              pointerEvents: showCaption ? "auto" : "none",
              backdropFilter: "blur(4px)",
            }}
          >
            {CAPTION_TEXT}
          </div>
        )}
        {!imageLoaded && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
            }}
          >
            Loading...
          </div>
        )}
      </div>

      {/* Below the fold content */}
      <div
        className="relative min-h-screen bg-gradient-to-b from-transparent to-background"
        style={{
          paddingTop: "2rem",
          zIndex: 1,
        }}
      >
        {/* About Me & Table of Contents Section */}
        <section className="relative w-full py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              {/* About Me - Left Side */}
              <div>
                <h2 className="text-4xl md:text-5xl font-light mb-4">
                  About Me
                </h2>
                <div className="w-24 h-px bg-foreground/20 mt-8 mb-8"></div>
                <div className="space-y-4 text-lg text-foreground/70 leading-relaxed">
                  <p>
                    Welcome to my portfolio. I'm a creative professional
                    passionate about building meaningful digital experiences
                    through thoughtful design and innovative development.
                  </p>
                  <p>
                    With a focus on user-centered design and clean, efficient
                    code, I bring ideas to life that are both beautiful and
                    functional. Explore my work below to see some of the
                    projects I've had the pleasure of working on.
                  </p>
                </div>
              </div>

              {/* Table of Contents - Right Side */}
              <div className="flex justify-center">
                <nav className="space-y-1">
                  <a
                    href="#work"
                    className="block py-4 transition-colors duration-300 group"
                  >
                    <div className="flex items-center justify-start gap-4 toc-item">
                      <span className="text-4xl md:text-5xl font-light group-hover:text-foreground transition-colors duration-300">
                        Work
                      </span>
                      <span className="text-4xl md:text-5xl text-foreground/30 group-hover:text-foreground/60 transition-colors duration-300">
                        →
                      </span>
                    </div>
                  </a>
                  <a
                    href="#resume"
                    className="block py-4 transition-colors duration-300 group"
                  >
                    <div className="flex items-center justify-start gap-4 toc-item">
                      <span className="text-4xl md:text-5xl font-light group-hover:text-foreground transition-colors duration-300">
                        Resume
                      </span>
                      <span className="text-4xl md:text-5xl text-foreground/30 group-hover:text-foreground/60 transition-colors duration-300">
                        →
                      </span>
                    </div>
                  </a>
                  <a
                    href="#contact"
                    className="block py-4 transition-colors duration-300 group"
                  >
                    <div className="flex items-center justify-start gap-4 toc-item">
                      <span className="text-4xl md:text-5xl font-light group-hover:text-foreground transition-colors duration-300">
                        Contact
                      </span>
                      <span className="text-4xl md:text-5xl text-foreground/30 group-hover:text-foreground/60 transition-colors duration-300">
                        →
                      </span>
                    </div>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </section>

        <Work projects={projects} />
        <Resume />
        <Contact />
      </div>
    </div>
  );
}
