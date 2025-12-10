"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Work from "@/components/Work";
import Resume from "@/components/Resume";
import Contact from "@/components/Contact";
import { projects } from "@/data/projects";

export default function Home() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [zoomComplete, setZoomComplete] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [captionRendered, setCaptionRendered] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);

  // --- CONFIG ------------------------------------------------------------
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 40;
  const CAPTION_TEXT = "Caption text here";
  const TARGETS = {
    E: { x: 56, y: 5 },
    D: { x: 56, y: 5 },
  };

  // -----------------------------------------------------------------------

  // Load OpenSeadragon CSS
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/openseadragon@4.1.0/build/openseadragon/openseadragon.min.css";
    document.head.appendChild(link);

    return () => {
      const existingLink = document.querySelector(
        'link[href*="openseadragon.min.css"]'
      );
      if (existingLink) {
        existingLink.remove();
      }
    };
  }, []);

  // Initialize OpenSeadragon with preloaded image
  useEffect(() => {
    if (!viewerRef.current || skipIntro || typeof window === "undefined") {
      return;
    }

    // Initialize OpenSeadragon with DZI format
    const initViewer = async () => {
      try {
        const OpenSeadragon = (await import("openseadragon")).default;

        if (!viewerRef.current) return;

        // Use DZI format - expects /images/32000w_mask.dzi or /images/32000w_mask_files/ structure
        // The .dzi file is an XML descriptor, and _files/ contains the tiles
        const dziUrl = "/images/32000w_mask.dzi";

        const viewer = OpenSeadragon({
          element: viewerRef.current,
          prefixUrl:
            "https://cdn.jsdelivr.net/npm/openseadragon@4.1.0/build/openseadragon/images/",
          tileSources: dziUrl,
          showNavigationControl: false,
          showSequenceControl: false,
          showFullPageControl: false,
          showZoomControl: false,
          showHomeControl: false,
          showRotationControl: false,
          gestureSettingsMouse: {
            clickToZoom: false,
            dblClickToZoom: false,
            pinchToZoom: false,
            flickEnabled: false,
            scrollToZoom: false,
          },
          gestureSettingsTouch: {
            clickToZoom: false,
            dblClickToZoom: false,
            pinchToZoom: false,
            flickEnabled: false,
          },
          maxZoomLevel: MAX_ZOOM,
          minZoomLevel: MIN_ZOOM,
          defaultZoomLevel: MIN_ZOOM,
          visibilityRatio: 1.0,
          constrainDuringPan: true,
          mouseNavEnabled: false,
          zoomPerScroll: 0,
          zoomPerClick: 0,
          animationTime: 0,
        });

        viewerInstanceRef.current = viewer;

        viewer.addHandler("open", () => {
          // First, ensure image is visible by going home (fits image to viewport)
          viewer.viewport.goHome();

          // Wait a frame for home to complete, then set initial zoom
          requestAnimationFrame(() => {
            const target = TARGETS.E;
            const targetPoint = new OpenSeadragon.Point(
              target.x / 100,
              target.y / 100
            );

            // Set initial zoom level centered on target
            viewer.viewport.zoomTo(MIN_ZOOM, targetPoint, true);

            setImageLoaded(true);
          });
        });

        viewer.addHandler("open-failed", (event) => {
          console.error("OpenSeadragon failed to open image:", event);
          setImageLoaded(true); // Show viewer anyway
        });

        // Handle tile load failures gracefully
        // Note: Some tile load failures are normal (e.g., levels beyond image resolution)
        viewer.addHandler("tile-load-failed", () => {
          // Silently ignore - OpenSeadragon will handle fallbacks automatically
        });

        // Fallback: show viewer after a delay even if events don't fire
        setTimeout(() => {
          if (viewer && !imageLoaded) {
            setImageLoaded(true);
          }
        }, 2000);
      } catch (error) {
        console.error("Failed to preload image:", error);
      }
    };

    initViewer();

    return () => {
      if (viewerInstanceRef.current) {
        viewerInstanceRef.current.destroy();
        viewerInstanceRef.current = null;
      }
    };
  }, [skipIntro]);

  // If we land on the page with a section hash, skip the zoom intro
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;

    const targetId = hash.replace("#", "");
    const validTargets = new Set(["work", "about", "resume", "contact"]);
    if (!validTargets.has(targetId)) return;

    setSkipIntro(true);
    document.documentElement.classList.add("show-scrollbar");
    document.body.classList.add("show-scrollbar");

    const scrollToTarget = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({
          behavior: "instant",
          block: "start",
        } as ScrollIntoViewOptions);
      }
    };

    const timeoutId = window.setTimeout(scrollToTarget, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  // Calculate zoom based on scroll progress
  const zoomScale = useMemo(() => {
    return MIN_ZOOM + scrollProgress * (MAX_ZOOM - MIN_ZOOM);
  }, [scrollProgress]);

  // Update OpenSeadragon zoom and pan based on scroll
  useEffect(() => {
    const viewer = viewerInstanceRef.current;
    if (!viewer || !imageLoaded || typeof window === "undefined") {
      return;
    }

    import("openseadragon").then((OpenSeadragon) => {
      const target = TARGETS.E;
      const targetPoint = new OpenSeadragon.default.Point(
        target.x / 100,
        target.y / 100
      );

      // Update zoom and pan based on scroll progress
      viewer.viewport.zoomTo(zoomScale, targetPoint, true);
    });
  }, [zoomScale, imageLoaded]);

  // Handle scroll events
  useEffect(() => {
    let ticking = false;
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const windowHeight = window.innerHeight;
          const zoomPhaseHeight = windowHeight * 3;

          let newProgress: number;
          let newZoomComplete: boolean;

          if (scrollTop < zoomPhaseHeight) {
            newProgress = Math.min(scrollTop / zoomPhaseHeight, 1);
            newZoomComplete = false;
          } else {
            newProgress = 1;
            newZoomComplete = true;
          }

          setScrollProgress(newProgress);

          const CAPTION_THRESHOLD = 0.85;
          if (newProgress >= CAPTION_THRESHOLD) {
            setShowCaption(true);
            setCaptionRendered(true);
          } else {
            setShowCaption(false);
          }

          setZoomComplete((prevZoomComplete) => {
            if (newZoomComplete && !prevZoomComplete) {
              return true;
            }
            if (!newZoomComplete && prevZoomComplete) {
              return false;
            }
            return prevZoomComplete;
          });

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
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      document.documentElement.classList.remove("show-scrollbar");
      document.body.classList.remove("show-scrollbar");
    };
  }, []);

  return (
    <div className="relative">
      {!skipIntro && (
        <>
          <div style={{ height: "300vh" }} />
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
              pointerEvents: zoomComplete ? "none" : "auto",
            }}
          >
            <div
              ref={viewerRef}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
                // Improve rendering quality
                imageRendering: "auto",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
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
        </>
      )}

      <div
        className="relative min-h-screen bg-gradient-to-b from-transparent to-background"
        style={{
          paddingTop: "2rem",
          zIndex: 1,
        }}
      >
        <section id="about" className="relative w-full py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              <div>
                <h2 className="text-4xl md:text-5xl font-light mb-4">
                  About Me
                </h2>
                <div className="w-24 h-px bg-foreground/20 mt-8 mb-8"></div>
                <div className="space-y-4 text-lg text-foreground/70 leading-relaxed">
                  <p>
                    My name is Meredith, obviously. You just saw a few photos
                    from the places I lived in 2025 - at Buddhist monastaries, a
                    French abbey, and the most beautiful Moroccan town. I care
                    deeply about spiritual matters and the art of living.
                  </p>
                  <p>
                    When I'm not at a monastery, I am a vivacious software
                    engineer. I find joy in creating beautiful, functional, and
                    accessible digital experiences.
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <nav className="space-y-1">
                  <a
                    href="#work"
                    className="block py-4 transition-colors duration-300 group"
                  >
                    <div className="flex items-center justify-start gap-4 bounce-item">
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
                    <div className="flex items-center justify-start gap-4 bounce-item">
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
                    <div className="flex items-center justify-start gap-4 bounce-item">
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
