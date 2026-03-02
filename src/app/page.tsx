"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Intro from "@/components/Intro";
import WorkShowcase from "@/components/WorkShowcase";
import Footer from "@/components/Footer";
import { projects } from "@/data/projects";

type ViewerRuntime = {
  viewport: {
    panTo: (center: { x: number; y: number }, immediately?: boolean) => void;
    zoomTo: (
      zoom: number,
      refPoint?: { x: number; y: number },
      immediately?: boolean,
    ) => void;
    goHome: () => void;
    getCenter: () => { x: number; y: number };
  };
  addHandler: (eventName: string, handler: (event?: unknown) => void) => void;
};

type ViewerDestroyable = {
  destroy: () => void;
};

export default function Home() {
  const viewerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollHintButtonRef = useRef<HTMLButtonElement>(null);
  const viewerInstanceRef = useRef<ViewerDestroyable | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [zoomComplete, setZoomComplete] = useState(false);
  const [isZoomingOut, setIsZoomingOut] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [captionRendered, setCaptionRendered] = useState(false);
  const [isProjectRestoreActive, setIsProjectRestoreActive] = useState(false);
  const initialHashTargetRef = useRef<string | null>(null);
  const previousProgressRef = useRef(0);
  const touchLastYRef = useRef<number | null>(null);
  const touchLastTimeRef = useRef<number | null>(null);
  const touchVelocityRef = useRef(0);
  const touchInertiaRafRef = useRef<number | null>(null);
  const touchManualScrollActiveRef = useRef(false);
  const cancelTouchMotionRef = useRef<() => void>(() => {});
  const previousScrollTopRef = useRef(0);
  const autoZoomSnapLockRef = useRef(false);
  const stableViewportHeightRef = useRef(0);
  const [viewportHeightPx, setViewportHeightPx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showScrollHintNudge, setShowScrollHintNudge] = useState(false);
  const hasShownInitialScrollHintNudgeRef = useRef(false);
  const hasShownZoomedScrollHintNudgeRef = useRef(false);
  const scrollHintNudgeTimeoutRef = useRef<number | null>(null);

  // --- CONFIG ------------------------------------------------------------
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 35;
  const FULL_AUTO_ZOOM_INPUT_PX = 28;
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
        "A meditation room at Zen Mountain Monastery, Mt. Tremper, New York. I stayed at the monastery for a month, meditating and working alongside the nuns and monks.",
    },
    D: {
      x: 55.8,
      y: 7,
      caption:
        'The "Zendo", or meditation hall, at Bodhi Mandala Zen Center, Jemez Springs, New Mexico. I lived at the monastery meditating, carrying out daily work, and assisting with retreats.',
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
        "Sheep graze behind the cathedral and cemetery at Abbaye des Dombes, France. I stayed at the Abbey for a short time, working on the dairy farm and participating in daily rituals.",
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
  const randomTargetRef = useRef(randomTarget);
  const wasZoomedInRef = useRef(false);
  const homeCenterRef = useRef<{ x: number; y: number } | null>(null);
  const scrollHintText = zoomComplete
    ? isMobile
      ? "Swipe to content"
      : "Scroll to content"
    : isMobile
      ? "Swipe to zoom in or out"
      : "Scroll to zoom in or out";
  const getMeasuredViewportHeight = () => {
    if (typeof window === "undefined") return 0;
    // Use innerHeight so stable sizing isn't driven by dynamic browser chrome UI.
    return Math.round(Math.max(1, window.innerHeight));
  };
  const getStableViewportHeight = () =>
    stableViewportHeightRef.current || getMeasuredViewportHeight();
  const getZoomPhaseHeight = () => getStableViewportHeight() * 3;
  const isTouchDevice = () =>
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const triggerScrollHintNudge = (stopOnFirstScroll = false) => {
    if (typeof window === "undefined" || prefersReducedMotion) return;

    if (scrollHintNudgeTimeoutRef.current !== null) {
      window.clearTimeout(scrollHintNudgeTimeoutRef.current);
      scrollHintNudgeTimeoutRef.current = null;
    }

    // Toggle off before re-enabling so animation can retrigger cleanly.
    setShowScrollHintNudge(false);
    requestAnimationFrame(() => {
      setShowScrollHintNudge(true);
    });

    scrollHintNudgeTimeoutRef.current = window.setTimeout(() => {
      setShowScrollHintNudge(false);
      scrollHintNudgeTimeoutRef.current = null;
    }, 2000);

    if (stopOnFirstScroll) {
      const stopNudgeOnScroll = () => {
        setShowScrollHintNudge(false);
        if (scrollHintNudgeTimeoutRef.current !== null) {
          window.clearTimeout(scrollHintNudgeTimeoutRef.current);
          scrollHintNudgeTimeoutRef.current = null;
        }
      };
      window.addEventListener("scroll", stopNudgeOnScroll, {
        passive: true,
        once: true,
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    syncIsMobile();
    window.addEventListener("resize", syncIsMobile, { passive: true });
    window.addEventListener("orientationchange", syncIsMobile);

    return () => {
      window.removeEventListener("resize", syncIsMobile);
      window.removeEventListener("orientationchange", syncIsMobile);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    syncReducedMotion();
    mediaQuery.addEventListener("change", syncReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", syncReducedMotion);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      !imageLoaded ||
      zoomComplete ||
      hasShownInitialScrollHintNudgeRef.current
    )
      return;

    hasShownInitialScrollHintNudgeRef.current = true;
    triggerScrollHintNudge(true);
  }, [imageLoaded, zoomComplete, prefersReducedMotion]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      !imageLoaded ||
      !zoomComplete ||
      hasShownZoomedScrollHintNudgeRef.current
    )
      return;

    hasShownZoomedScrollHintNudgeRef.current = true;
    triggerScrollHintNudge();
  }, [imageLoaded, zoomComplete, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (scrollHintNudgeTimeoutRef.current !== null) {
        window.clearTimeout(scrollHintNudgeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyViewportHeight = (nextHeight: number) => {
      stableViewportHeightRef.current = nextHeight;
      setViewportHeightPx(nextHeight);
    };

    applyViewportHeight(getMeasuredViewportHeight());

    const handleOrientationChange = () => {
      // Keep height locked during regular scrolling to avoid browser chrome
      // show/hide changing the zoom math mid-gesture.
      window.setTimeout(() => {
        applyViewportHeight(getMeasuredViewportHeight());
      }, 200);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  // Prevent native back/forward scroll restoration from briefly jumping to a
  // stale position before our custom project/hash restore alignment runs.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    randomTargetRef.current = randomTarget;
  }, [randomTarget]);

  // Pick a new random target when user zooms all the way back out
  const pickNewRandomTarget = () => {
    const targetKeys = Object.keys(TARGETS) as (keyof typeof TARGETS)[];
    const randomKey = targetKeys[Math.floor(Math.random() * targetKeys.length)];
    const nextTarget = TARGETS[randomKey];
    randomTargetRef.current = nextTarget;
    setRandomTarget(nextTarget);
  };

  const jumpToZoomedPhoto = () => {
    if (typeof window === "undefined") return;
    if (zoomComplete) {
      const introSection = document.getElementById("intro");
      if (introSection) {
        window.history.pushState(null, "", "#intro");
        introSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      return;
    }

    const zoomPhaseHeight = getZoomPhaseHeight();
    window.scrollTo({
      top: zoomPhaseHeight,
      behavior: "smooth",
    });
  };

  const handleScrollHintKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (!zoomComplete) return;
    if (!(event.key === "Tab" && event.shiftKey)) return;

    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleWorkReverseTab = (
    event: ReactKeyboardEvent<HTMLAnchorElement>,
  ) => {
    if (!(event.key === "Tab" && event.shiftKey)) return;
    if (typeof window === "undefined") return;

    event.preventDefault();
    const zoomPhaseHeight = getZoomPhaseHeight();
    window.scrollTo({
      top: zoomPhaseHeight,
      behavior: "auto",
    });

    requestAnimationFrame(() => {
      window.scrollTo({
        top: zoomPhaseHeight,
        behavior: "auto",
      });
      scrollHintButtonRef.current?.focus();
    });
  };

  const applyViewerFromProgress = (progress: number) => {
    const viewer = viewerInstanceRef.current as ViewerRuntime | null;
    const homeCenter = homeCenterRef.current;
    if (!viewer || !homeCenter) return;

    const targetCenter = {
      x: randomTargetRef.current.x / 100,
      y: randomTargetRef.current.y / 100,
    };

    const zoomScale = MIN_ZOOM * Math.pow(MAX_ZOOM / MIN_ZOOM, progress);
    const panProgress = 1 - Math.pow(1 - progress, 2.5);

    const interpolatedCenter = {
      x: homeCenter.x + panProgress * (targetCenter.x - homeCenter.x),
      y: homeCenter.y + panProgress * (targetCenter.y - homeCenter.y),
    };

    viewer.viewport.panTo(interpolatedCenter, true);
    viewer.viewport.zoomTo(zoomScale, interpolatedCenter, true);
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
        'link[href*="openseadragon.min.css"]',
      );
      if (existingLink) {
        existingLink.remove();
      }
    };
  }, []);

  // Initialize OpenSeadragon with preloaded image
  useEffect(() => {
    if (!viewerRef.current || typeof window === "undefined") {
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
            dragToPan: false,
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

            // Initialize from current scroll position so hash navigations
            // (e.g. /#work) and route restores don't briefly show a stale
            // fully zoomed-out frame before scroll handlers run.
            const scrollTop = window.scrollY;
            const zoomPhaseHeight = getZoomPhaseHeight();
            const initialProgress = Math.min(scrollTop / zoomPhaseHeight, 1);
            const initialZoom =
              MIN_ZOOM * Math.pow(MAX_ZOOM / MIN_ZOOM, initialProgress);
            const currentTarget = randomTargetRef.current;
            const targetCenter = {
              x: currentTarget.x / 100,
              y: currentTarget.y / 100,
            };
            const panProgress = 1 - Math.pow(1 - initialProgress, 2.5);
            const initialCenter = new OpenSeadragon.Point(
              homeCenter.x + panProgress * (targetCenter.x - homeCenter.x),
              homeCenter.y + panProgress * (targetCenter.y - homeCenter.y),
            );

            viewer.viewport.panTo(initialCenter, true);
            viewer.viewport.zoomTo(initialZoom, initialCenter, true);

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
  }, []);

  // Handle controlled project restores via query token (/?project=<slug>)
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const projectSlug = params.get("project");
    if (!projectSlug) return;

    const targetId = `project-${projectSlug}`;
    initialHashTargetRef.current = targetId;
    setIsProjectRestoreActive(true);

    document.documentElement.classList.add("show-scrollbar");
    document.body.classList.add("show-scrollbar");
    document.body.classList.add("skip-intro-animations");
    document.body.classList.add("suppress-project-slide-sun");

    const releaseProjectSunSuppression = () => {
      document.body.classList.remove("suppress-project-slide-sun");
    };

    const clearProjectQueryToken = () => {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("project");
      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      window.history.replaceState(window.history.state, "", nextPath || "/");
    };

    const alignToTarget = () => {
      const el = document.getElementById(targetId);
      if (!el) return;
      el.scrollIntoView({
        behavior: "instant",
        block: "center",
      } as ScrollIntoViewOptions);
    };
    const pendingRestoreTimeouts: number[] = [];

    const scrollToTarget = () => {
      // Enter the same layout phase users naturally reach after scrolling down.
      // This preserves the "fully zoomed image appears first" behavior on upward scroll.
      cancelTouchMotionRef.current();
      setZoomComplete(true);
      setScrollProgress(1);
      setShowCaption(true);
      setCaptionRendered(true);
      wasZoomedInRef.current = true;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Ensure we are in the content phase before aligning to the target
          // so mobile back restores don't visibly animate from the top.
          window.scrollTo({
            top: getZoomPhaseHeight(),
            behavior: "instant",
          } as ScrollToOptions);
          alignToTarget();
          requestAnimationFrame(() => {
            alignToTarget();
            if (isTouchDevice()) {
              pendingRestoreTimeouts.push(
                window.setTimeout(() => {
                  alignToTarget();
                }, 120),
              );
              pendingRestoreTimeouts.push(
                window.setTimeout(() => {
                  alignToTarget();
                  releaseProjectSunSuppression();
                  initialHashTargetRef.current = null;
                  clearProjectQueryToken();
                  setIsProjectRestoreActive(false);
                }, 320),
              );
            } else {
              releaseProjectSunSuppression();
              initialHashTargetRef.current = null;
              clearProjectQueryToken();
              setIsProjectRestoreActive(false);
            }
          });
        });
      });
    };

    const timeoutId = window.setTimeout(scrollToTarget, 0);
    return () => {
      window.clearTimeout(timeoutId);
      pendingRestoreTimeouts.forEach((id) => window.clearTimeout(id));
      releaseProjectSunSuppression();
      setIsProjectRestoreActive(false);
    };
  }, []);

  // If we land on the page with a section hash, handle navigation
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;

    const targetId = hash.replace("#", "");
    const isProjectTarget = targetId.startsWith("project-");
    if (targetId !== "work" && targetId !== "intro" && !isProjectTarget) return;
    setIsProjectRestoreActive(true);

    // Store the hash target so scroll handler knows not to hide scrollbar
    initialHashTargetRef.current = targetId;

    document.documentElement.classList.add("show-scrollbar");
    document.body.classList.add("show-scrollbar");

    // Skip animations for content when navigating via hash
    document.body.classList.add("skip-intro-animations");
    const shouldSuppressProjectSun = isProjectTarget;
    const releaseProjectSunSuppression = () => {
      document.body.classList.remove("suppress-project-slide-sun");
    };
    if (shouldSuppressProjectSun) {
      document.body.classList.add("suppress-project-slide-sun");
    }

    const scrollToTarget = () => {
      // Enter the same layout phase users naturally reach after scrolling down.
      // This preserves the "fully zoomed image appears first" behavior on upward scroll.
      setZoomComplete(true);
      setScrollProgress(1);
      setShowCaption(true);
      setCaptionRendered(true);
      wasZoomedInRef.current = true;

      // Wait for layout to settle, then align to the requested anchor.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Ensure we are in the content phase before aligning to the target
          // so hash restores don't visibly animate from the top.
          window.scrollTo({
            top: getZoomPhaseHeight(),
            behavior: "instant",
          } as ScrollToOptions);
          const alignToTarget = () => {
            const el = document.getElementById(targetId);
            if (el) {
              el.scrollIntoView({
                behavior: "instant",
                // Keep project hash restores in visual context so the section
                // header and preceding cards are not pushed completely offscreen.
                block: isProjectTarget ? "center" : "start",
              } as ScrollIntoViewOptions);
            }
          };

          alignToTarget();

          // Run a second pass after one more frame to absorb late layout shifts.
          requestAnimationFrame(() => {
            alignToTarget();
            releaseProjectSunSuppression();
            initialHashTargetRef.current = null;
            setIsProjectRestoreActive(false);
          });
        });
      });
    };

    // Delay to ensure layout is ready (OpenSeadragon container needs time to initialize)
    const timeoutId = window.setTimeout(scrollToTarget, 0);
    return () => {
      window.clearTimeout(timeoutId);
      releaseProjectSunSuppression();
      setIsProjectRestoreActive(false);
    };
  }, []);

  // Handle scroll events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const normalizeWheelDeltaPx = (event: WheelEvent) => {
      if (event.deltaMode === 1) return event.deltaY * 16;
      if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
      return event.deltaY;
    };

    const handleWheel = (event: WheelEvent) => {
      const deltaPx = normalizeWheelDeltaPx(event);
      const scrollTop = window.scrollY;
      const zoomPhaseHeight = getZoomPhaseHeight();
      const scrollingDown = deltaPx > 0;

      if (
        !autoZoomSnapLockRef.current &&
        scrollingDown &&
        deltaPx >= FULL_AUTO_ZOOM_INPUT_PX &&
        scrollTop > 0 &&
        scrollTop < zoomPhaseHeight
      ) {
        autoZoomSnapLockRef.current = true;
        cancelTouchMotionRef.current();
        window.scrollTo({
          top: zoomPhaseHeight,
          behavior: "smooth",
        });
        window.setTimeout(() => {
          autoZoomSnapLockRef.current = false;
        }, 700);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    const syncFromScrollPosition = () => {
      const scrollTop = window.scrollY;
      const zoomPhaseHeight = getZoomPhaseHeight();
      const previousScrollTop = previousScrollTopRef.current;
      const scrollDelta = scrollTop - previousScrollTop;
      const scrollingDown = scrollTop > previousScrollTop + 1;
      previousScrollTopRef.current = scrollTop;

      let newProgress: number;
      let newZoomComplete: boolean;

      if (scrollTop < zoomPhaseHeight) {
        newProgress = Math.min(scrollTop / zoomPhaseHeight, 1);
        newZoomComplete = false;
      } else {
        newProgress = 1;
        newZoomComplete = true;
      }

      const previousProgress = previousProgressRef.current;
      const DIRECTION_EPSILON = 0.001;
      setIsZoomingOut((prevIsZoomingOut) => {
        if (newProgress < previousProgress - DIRECTION_EPSILON) {
          return true;
        }
        if (newProgress > previousProgress + DIRECTION_EPSILON) {
          return false;
        }
        // Keep previous direction during brief pauses or tiny jitter.
        return prevIsZoomingOut;
      });
      previousProgressRef.current = newProgress;

      setScrollProgress(newProgress);
      applyViewerFromProgress(newProgress);

      // Track if user has zoomed in, and pick new target when they zoom back out
      if (newProgress > 0.2) {
        wasZoomedInRef.current = true;
      } else if (newProgress <= 0.001 && wasZoomedInRef.current) {
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

      // Don't hide scrollbar during initial hash navigation
      if (newZoomComplete || initialHashTargetRef.current) {
        document.documentElement.classList.add("show-scrollbar");
        document.body.classList.add("show-scrollbar");
      } else {
        document.documentElement.classList.remove("show-scrollbar");
        document.body.classList.remove("show-scrollbar");
      }
    };

    const handleScroll = () => {
      syncFromScrollPosition();
    };

    const forceResyncAfterHistoryRestore = () => {
      // Browser back/forward can restore a cached Home snapshot where the
      // initial `/?project=<slug>` layout effect does not rerun. Re-apply the
      // same project restore alignment here so native back matches header "Back".
      if (!initialHashTargetRef.current) {
        const params = new URLSearchParams(window.location.search);
        const projectSlug = params.get("project");

        if (projectSlug) {
          const targetId = `project-${projectSlug}`;
          const targetEl = document.getElementById(targetId);

          if (targetEl) {
            initialHashTargetRef.current = targetId;
            setIsProjectRestoreActive(true);
            document.documentElement.classList.add("show-scrollbar");
            document.body.classList.add("show-scrollbar");
            document.body.classList.add("skip-intro-animations");
            document.body.classList.add("suppress-project-slide-sun");

            cancelTouchMotionRef.current();
            setZoomComplete(true);
            setScrollProgress(1);
            setShowCaption(true);
            setCaptionRendered(true);
            wasZoomedInRef.current = true;

            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                window.scrollTo({
                  top: getZoomPhaseHeight(),
                  behavior: "instant",
                } as ScrollToOptions);
                targetEl.scrollIntoView({
                  behavior: "instant",
                  block: "center",
                } as ScrollIntoViewOptions);
                const finishProjectRestore = () => {
                  document.body.classList.remove("suppress-project-slide-sun");
                  initialHashTargetRef.current = null;
                  setIsProjectRestoreActive(false);

                  const nextUrl = new URL(window.location.href);
                  nextUrl.searchParams.delete("project");
                  const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
                  window.history.replaceState(
                    window.history.state,
                    "",
                    nextPath || "/",
                  );

                  syncFromScrollPosition();
                };

                if (isTouchDevice()) {
                  window.setTimeout(() => {
                    targetEl.scrollIntoView({
                      behavior: "instant",
                      block: "center",
                    } as ScrollIntoViewOptions);
                  }, 120);
                  window.setTimeout(() => {
                    targetEl.scrollIntoView({
                      behavior: "instant",
                      block: "center",
                    } as ScrollIntoViewOptions);
                    finishProjectRestore();
                  }, 320);
                } else {
                  finishProjectRestore();
                }
              });
            });

            return;
          }
        }
      }

      syncFromScrollPosition();
    };

    const handlePageShow = (_event: PageTransitionEvent) => {
      forceResyncAfterHistoryRestore();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        forceResyncAfterHistoryRestore();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", forceResyncAfterHistoryRestore);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Only run initial handleScroll if not doing hash navigation
    // (hash navigation will trigger a scroll event which will call handleScroll)
    if (!initialHashTargetRef.current) {
      forceResyncAfterHistoryRestore();
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", forceResyncAfterHistoryRestore);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.documentElement.classList.remove("show-scrollbar");
      document.body.classList.remove("show-scrollbar");
    };
  }, []);

  // Mobile fallback: if a library blocks native touch scroll during zoom phase,
  // map vertical swipes to window scroll so zoom-in/out stays usable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("ontouchstart" in window)) return;

    const cancelInertia = () => {
      if (touchInertiaRafRef.current !== null) {
        window.cancelAnimationFrame(touchInertiaRafRef.current);
        touchInertiaRafRef.current = null;
      }
    };
    const cancelTouchMotion = () => {
      cancelInertia();
      touchVelocityRef.current = 0;
      touchManualScrollActiveRef.current = false;
      touchLastYRef.current = null;
      touchLastTimeRef.current = null;
    };
    cancelTouchMotionRef.current = cancelTouchMotion;

    const startInertia = () => {
      cancelInertia();

      let velocity = touchVelocityRef.current;
      if (Math.abs(velocity) < 0.06) return;

      let previousTime = performance.now();
      const DECAY = 0.92;
      const STOP_VELOCITY = 0.02;

      const step = (now: number) => {
        const dt = now - previousTime;
        previousTime = now;

        window.scrollBy({ top: velocity * dt, behavior: "auto" });
        velocity *= Math.pow(DECAY, dt / 16.67);

        if (Math.abs(velocity) <= STOP_VELOCITY) {
          touchInertiaRafRef.current = null;
          touchVelocityRef.current = 0;
          return;
        }

        touchInertiaRafRef.current = window.requestAnimationFrame(step);
      };

      touchInertiaRafRef.current = window.requestAnimationFrame(step);
    };

    const onTouchStart = (event: TouchEvent) => {
      cancelInertia();
      if (event.touches.length !== 1) {
        touchLastYRef.current = null;
        touchLastTimeRef.current = null;
        touchVelocityRef.current = 0;
        touchManualScrollActiveRef.current = false;
        return;
      }

      const viewportHeight = getStableViewportHeight();
      const zoomPhaseHeight = viewportHeight * 3;
      const collagePhaseEnd = zoomPhaseHeight + viewportHeight;
      // Keep manual scroll active through the full-screen collage area too,
      // so gestures continue working after fully zooming in.
      touchManualScrollActiveRef.current = window.scrollY < collagePhaseEnd;

      touchVelocityRef.current = 0;
      touchLastYRef.current = event.touches[0].clientY;
      touchLastTimeRef.current = performance.now();
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      if (!touchManualScrollActiveRef.current) return;
      if (touchLastYRef.current === null) {
        touchLastYRef.current = event.touches[0].clientY;
        touchLastTimeRef.current = performance.now();
        return;
      }

      const currentY = event.touches[0].clientY;
      const now = performance.now();
      const deltaY = touchLastYRef.current - currentY;
      const dt = touchLastTimeRef.current
        ? now - touchLastTimeRef.current
        : 16.67;
      touchLastYRef.current = currentY;
      touchLastTimeRef.current = now;
      if (Math.abs(deltaY) < 0.5) return;
      const MAX_TOUCH_STEP_PX = 28;
      const clampedDeltaY = Math.max(
        -MAX_TOUCH_STEP_PX,
        Math.min(MAX_TOUCH_STEP_PX, deltaY),
      );

      const instantaneousVelocity = clampedDeltaY / Math.max(dt, 1);
      touchVelocityRef.current =
        touchVelocityRef.current * 0.65 + instantaneousVelocity * 0.35;

      event.preventDefault();
      window.scrollBy({ top: clampedDeltaY, behavior: "auto" });
    };

    const onTouchEnd = () => {
      touchLastYRef.current = null;
      touchLastTimeRef.current = null;
      if (touchManualScrollActiveRef.current) {
        startInertia();
      } else {
        touchVelocityRef.current = 0;
      }
      touchManualScrollActiveRef.current = false;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      cancelTouchMotion();
      cancelTouchMotionRef.current = () => {};
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return (
    <div className="relative">
      <>
        <div
          style={{
            height: viewportHeightPx ? `${viewportHeightPx * 3}px` : "300vh",
          }}
        />
        <div
          ref={containerRef}
          style={{
            width: "100vw",
            height: viewportHeightPx ? `${viewportHeightPx}px` : "100vh",
            overflow: "hidden",
            position: zoomComplete ? "relative" : "fixed",
            top: zoomComplete ? "auto" : 0,
            left: 0,
            zIndex: zoomComplete ? 1 : 10,
            backfaceVisibility: "hidden",
            transform: "translate3d(0, 0, 0)",
            opacity: imageLoaded && !isProjectRestoreActive ? 1 : 0,
            transition: "opacity 0.3s ease-in",
            // Let swipes always reach document scrolling.
            pointerEvents: "none",
            touchAction: "pan-y",
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
              // Keep the collage visual-only so touch scroll always reaches the page.
              pointerEvents: "none",
              touchAction: "pan-y",
            }}
          />
          {imageLoaded && (
            <button
              ref={scrollHintButtonRef}
              type="button"
              onClick={jumpToZoomedPhoto}
              datadog-action-name="Home Scroll Hint"
              onKeyDown={handleScrollHintKeyDown}
              aria-label={
                zoomComplete ? "Jump to intro content" : "Jump to zoomed photo"
              }
              style={{
                position: "absolute",
                left: "50%",
                bottom: "1.5rem",
                transform: "translateX(-50%)",
                padding: "0.6rem 1rem",
                backgroundColor: "rgba(26, 26, 24, 0.88)",
                color: "#ece7c1",
                borderRadius: "8px",
                fontSize: "0.85rem",
                lineHeight: "1.2",
                letterSpacing: "0.08em",
                zIndex: 10,
                cursor: "pointer",
                backdropFilter: "blur(4px)",
                pointerEvents: "auto",
                animation:
                  showScrollHintNudge && !prefersReducedMotion
                    ? "scroll-hint-nudge 1400ms ease-out 1"
                    : "none",
              }}
            >
              {scrollHintText}
              <span className="text-lg px-2 inline-block ">
                {zoomComplete ? "↓" : "↑↓"}
              </span>
            </button>
          )}
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

      {/* Main Content */}
      <main
        id="main-content"
        className="relative bg-background"
        style={{
          zIndex: 1,
          opacity: isProjectRestoreActive ? 0 : 1,
          transition: isProjectRestoreActive
            ? "none"
            : "opacity 0.18s ease-out",
          pointerEvents: isProjectRestoreActive ? "none" : "auto",
        }}
      >
        <Intro onWorkReverseTab={handleWorkReverseTab} />
        <WorkShowcase projects={projects} />
        <Footer />
      </main>
      <style jsx>{`
        @keyframes scroll-hint-nudge {
          0% {
            opacity: 0.78;
            transform: translateX(-50%) translateY(4px);
          }
          35% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          70% {
            opacity: 1;
            transform: translateX(-50%) translateY(-2px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
