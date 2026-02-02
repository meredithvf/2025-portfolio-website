"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Intro from "@/components/Intro";
import WorkShowcase from "@/components/WorkShowcase";
import Footer from "@/components/Footer";
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
  const MAX_ZOOM = 35;
  const TARGETS = {
    M: {
      x: 16.765,
      y: 6.93,
      caption:
        "City fountain in Taroudant, Morocco. I spent a month living with a family there, teaching college students, and fasting Ramadan.",
    },
    E1: {
      x: 24.12,
      y: 9,
      caption:
        "Cows ready for milking at Abbaye des Dombes, France. I lived at the Abbey for a short time, working on the dairy farm and participating in daily rituals.",
    },
    R: {
      x: 33.45,
      y: 4.7,
      caption:
        "Hundreds of young adults celebrate Easter at Hautecombe Abbey, France. I lived at the Abbey for several months, participating in daily life with the nuns and monks.",
    },
    E2: {
      x: 48,
      y: 9,
      caption:
        "A meditation room at Zen Mountain Monastery, Mt. Tremper, New York. I lived at the monastery for a month, meditating and working alongside the nuns and monks.",
    },
    D: {
      x: 55.8,
      y: 7,
      caption:
        'the "Zendo", or meditation hall, at Bodhi Mandala Zen Center, Jemez Springs, New Mexico. I lived at the monastery meditating, carrying out daily work, and assisting with retreats.',
    },
    I: {
      x: 68.3,
      y: 9.9,
      caption:
        "Statue of Mary on the terrace at Hautecombe Abbey, France. I lived at the Abbey for several months, participating in daily life with the nuns and monks.",
    },
    T: {
      x: 77.14,
      y: 8.4,
      caption:
        "Sheep graze behind the cathedral and cemetery at Abbaye des Dombes, France. I lived at the Abbey for a short time, working on the dairy farm and participating in daily rituals.",
    },
    H: {
      x: 89,
      y: 8.8,
      caption:
        "Women walking through the market in Taroudant, Morocco. I spent a month living with a family there, teaching college students, and fasting Ramadan.",
    },
  };

  // Randomly select a target letter - changes when user zooms all the way out
  const [randomTarget, setRandomTarget] = useState(() => {
    const targetKeys = Object.keys(TARGETS) as (keyof typeof TARGETS)[];
    const randomKey = targetKeys[Math.floor(Math.random() * targetKeys.length)];
    return TARGETS[randomKey];
  });
  const wasZoomedInRef = useRef(false);
  const homeCenterRef = useRef<{ x: number; y: number } | null>(null);

  // Pick a new random target when user zooms all the way back out
  const pickNewRandomTarget = () => {
    const targetKeys = Object.keys(TARGETS) as (keyof typeof TARGETS)[];
    const randomKey = targetKeys[Math.floor(Math.random() * targetKeys.length)];
    setRandomTarget(TARGETS[randomKey]);
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

        const dziUrl = "/images/meredith_collage.dzi";

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

          // Wait a frame for home to complete, then capture home center
          requestAnimationFrame(() => {
            // Store the home center for interpolation during zoom
            const homeCenter = viewer.viewport.getCenter();
            homeCenterRef.current = { x: homeCenter.x, y: homeCenter.y };

            // Start at home position with MIN_ZOOM
            viewer.viewport.zoomTo(MIN_ZOOM, homeCenter, true);

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
  }, [skipIntro, randomTarget]);

  // If we land on the page with a section hash, skip the zoom intro
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;

    const targetId = hash.replace("#", "");
    const validTargets = new Set(["work"]);
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

  // Calculate zoom based on scroll progress (exponential for perceptually linear feel)
  const zoomScale = useMemo(() => {
    // Exponential interpolation: makes zoom feel linear and match the linear pan
    // At progress 0: MIN_ZOOM, at progress 0.5: ~6x, at progress 1: MAX_ZOOM
    return MIN_ZOOM * Math.pow(MAX_ZOOM / MIN_ZOOM, scrollProgress);
  }, [scrollProgress]);

  // Update OpenSeadragon zoom and pan based on scroll
  useEffect(() => {
    const viewer = viewerInstanceRef.current;
    if (!viewer || !imageLoaded || typeof window === "undefined") {
      return;
    }

    import("openseadragon").then((OpenSeadragon) => {
      const homeCenter = homeCenterRef.current || { x: 0.5, y: 0.05 };
      const targetCenter = {
        x: randomTarget.x / 100,
        y: randomTarget.y / 100,
      };

      // Ease-out for pan: fast at start, slow at end
      // This makes the camera pan toward target early while zoom builds gradually
      const panProgress = 1 - Math.pow(1 - scrollProgress, 2.5);

      // Interpolate between home center and target center using eased progress
      const interpolatedX =
        homeCenter.x + panProgress * (targetCenter.x - homeCenter.x);
      const interpolatedY =
        homeCenter.y + panProgress * (targetCenter.y - homeCenter.y);

      const interpolatedCenter = new OpenSeadragon.default.Point(
        interpolatedX,
        interpolatedY
      );

      // Pan to interpolated center and zoom simultaneously
      viewer.viewport.panTo(interpolatedCenter, true);
      viewer.viewport.zoomTo(zoomScale, interpolatedCenter, true);
    });
  }, [zoomScale, scrollProgress, imageLoaded, randomTarget]);

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

          // Track if user has zoomed in, and pick new target when they zoom back out
          if (newProgress > 0.2) {
            wasZoomedInRef.current = true;
          } else if (newProgress < 0.05 && wasZoomedInRef.current) {
            wasZoomedInRef.current = false;
            pickNewRandomTarget();
          }

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
              backgroundColor: "#1a1a18",
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
                {randomTarget.caption}
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

      {/* Main Content */}
      <main className="relative bg-background" style={{ zIndex: 1 }}>
        <Intro />
        <WorkShowcase projects={projects} />
        <Footer />
      </main>
    </div>
  );
}
