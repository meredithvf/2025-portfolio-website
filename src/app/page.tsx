"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";

// Generate a dense grid of small images that will be clipped to text
// Only generate images within the text bounds (MEREDITH VON FELDT area)
const generateImageGrid = (imageCount: number) => {
  const positions = [];
  const imageWidth = 30; // Small images for grid
  const imageHeight = 20; // Small images for grid

  // Text bounds: MEREDITH VON FELDT, ideally this is not hard coded but corresponds to where the text is
  const textMinX = 290;
  const textMaxX = 910;
  const textMinY = 50;
  const textMaxY = 225;

  // Calculate number of columns and rows needed to cover the text area
  // Use ceil to ensure we include images that extend beyond the bounds
  const cols = Math.ceil((textMaxX - textMinX) / imageWidth);
  const rows = Math.ceil((textMaxY - textMinY) / imageHeight);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = textMinX + col * imageWidth;
      const y = textMinY + row * imageHeight;
      const imageIdx = (row * cols + col) % imageCount;

      positions.push({
        x,
        y,
        imageIdx,
        imageWidth: imageWidth,
        imageHeight: imageHeight,
        row,
        col,
      });
    }
  }

  return positions;
};

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [zoomComplete, setZoomComplete] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [imagePositions, setImagePositions] = useState<
    Array<{
      x: number;
      y: number;
      imageIdx: number;
      imageWidth: number;
      imageHeight: number;
      row: number;
      col: number;
    }>
  >([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const hasInitialized = useRef(false);
  const previousScrollProgress = useRef(0);
  const hasScrolledDown = useRef(false);
  const imageCache = useRef<Set<string>>(new Set());
  const loadedImagesCount = useRef(0);

  // Visible positions for zoom targets (in viewBox coordinates)
  const visiblePositions = [
    { x: 410, y: 50 },
    { x: 440, y: 50 },
    { x: 560, y: 50 },
    { x: 590, y: 50 },
    { x: 740, y: 50 },
    { x: 770, y: 50 },
  ];

  // Helper function to calculate transform-origin percentage from viewBox coordinates
  const calculateTargetPosition = useCallback((): {
    x: number;
    y: number;
  } | null => {
    if (!svgRef.current || !nameRef.current) {
      return null;
    }

    const randomIdx = Math.floor(Math.random() * visiblePositions.length);
    const targetPos = visiblePositions[randomIdx];
    const viewBoxX = targetPos.x + 30 / 2;
    const viewBoxY = targetPos.y + 20 / 2;

    // Get actual rendered dimensions of the SVG
    const svgRect = svgRef.current.getBoundingClientRect();
    const svgViewBox = svgRef.current.viewBox.baseVal;
    const svgViewBoxWidth = svgViewBox.width || 1200;
    const svgViewBoxHeight = svgViewBox.height || 300;

    // Get the container div dimensions (the element being transformed)
    const containerRect = nameRef.current.getBoundingClientRect();

    // Calculate the position of the target point in the SVG's coordinate system
    // Then map it to the container's coordinate system
    const scaleX = svgRect.width / svgViewBoxWidth;
    const scaleY = svgRect.height / svgViewBoxHeight;

    // Position of target in SVG's rendered coordinates
    const svgX = viewBoxX * scaleX;
    const svgY = viewBoxY * scaleY;

    // Position relative to the container (accounting for centering)
    // The SVG is centered in the container, so we need to find its offset
    const svgOffsetX = svgRect.left - containerRect.left;
    const svgOffsetY = svgRect.top - containerRect.top;

    // Final position relative to container
    const containerX = svgOffsetX + svgX;
    const containerY = svgOffsetY + svgY;

    // Convert to percentage for transform-origin
    const percentX = (containerX / containerRect.width) * 100;
    const percentY = (containerY / containerRect.height) * 100;

    return { x: percentX, y: percentY };
  }, [visiblePositions]);

  // Your personal images
  const images = useMemo(
    () => [
      "/images/bodhi_hot_springs.jpeg",
      "/images/bodhi_manda_zeno.jpeg",
      "/images/dar_al_islam.jpeg",
      "/images/dombes_barn.jpeg",
      "/images/dombes_sheep.jpeg",
      "/images/dombes.jpeg",
      "/images/haute_bateliere.jpeg",
      "/images/haute_cloister.jpeg",
      "/images/haute_cove.jpeg",
      "/images/haute_cross.jpeg",
      "/images/haute_joseph.jpeg",
      "/images/haute_last_supper.jpeg",
      "/images/haute_pantry.jpeg",
      "/images/haute_south.jpeg",
      "/images/haute_stained_glass.jpeg",
      "/images/haute_terrace.jpeg",
      "/images/haute_wysteria.jpeg",
      "/images/jemez_soda_dam.jpeg",
      "/images/jemez_valley.jpeg",
      "/images/oriyoki.jpeg",
      "/images/rome_lds_visitor_center.jpeg",
      "/images/sutra_hall_ext.jpeg",
      "/images/taroudant_biking_in_rain.jpeg",
      "/images/taroudant_fountain.jpeg",
      "/images/taroudant_getting_treats.jpeg",
      "/images/taroudant_mosque.jpeg",
      "/images/taroudant_selling_oranges.jpeg",
      "/images/taroudant_tannery.jpeg",
      "/images/taroudant_teapot.jpeg",
      "/images/taroudant_walkers.jpeg",
      "/images/zmm_buddha_hall.jpeg",
    ],
    []
  );

  // Preload all images to prevent jumps
  useEffect(() => {
    let cancelled = false;
    const loadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (imageCache.current.has(src)) {
          resolve();
          return;
        }
        const img = new Image();
        img.onload = () => {
          if (!cancelled) {
            imageCache.current.add(src);
            loadedImagesCount.current += 1;
            if (loadedImagesCount.current === images.length) {
              setImagesLoaded(true);
            }
            resolve();
          }
        };
        img.onerror = reject;
        img.src = src;
      });
    };

    // Preload all images
    Promise.all(images.map(loadImage)).catch((err) => {
      console.error("Error preloading images:", err);
      // Still set as loaded to allow rendering
      setImagesLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [images]);

  // Generate grid and select a target image on mount
  useEffect(() => {
    if (!hasInitialized.current && imagesLoaded) {
      // Generate grid of small images (now only within text bounds)
      const allPositions = generateImageGrid(images.length);
      setImagePositions(allPositions);

      // Wait for next frame to ensure SVG is rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (allPositions.length > 0) {
            const target = calculateTargetPosition();
            if (target) {
              setTargetPosition(target);
            }
          }
          hasInitialized.current = true;
        });
      });
    }
  }, [images.length, imagesLoaded, calculateTargetPosition]);

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
          if (scrollTop < zoomPhaseHeight) {
            // During zoom phase
            newProgress = Math.min(scrollTop / zoomPhaseHeight, 1);
            setScrollProgress(newProgress);
            setZoomComplete(false);

            // Prevent default scroll during zoom phase
            if (containerRef.current) {
              containerRef.current.style.position = "fixed";
              containerRef.current.style.top = "0";
            }
          } else {
            // After zoom completes
            newProgress = 1;
            setScrollProgress(newProgress);
            setZoomComplete(true);

            if (containerRef.current) {
              containerRef.current.style.position = "absolute";
              containerRef.current.style.top = "0";
            }
          }

          // Track if user has scrolled down
          if (newProgress > 0.1) {
            hasScrolledDown.current = true;
          }

          // Reset target when scrolled back to top
          // Check if we were previously scrolled down and now at top
          if (scrollTop < 10 && hasScrolledDown.current) {
            // User has scrolled back to top - pick new target from visible positions
            if (imagePositions.length > 0) {
              const target = calculateTargetPosition();
              if (target) {
                setTargetPosition(target);
              }
            }
            // Reset the flag so we don't keep resetting while at top
            hasScrolledDown.current = false;
          }

          // Update previous scroll progress
          previousScrollProgress.current = newProgress;

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
    };
  }, [imagePositions, calculateTargetPosition]);

  // Calculate zoom transformation - zoom TO a specific small image tile
  // Screen is roughly 1200px wide, so we need 1200/30 = 60x zoom to fill width
  const zoomScale = useMemo(() => 1 + scrollProgress * 50, [scrollProgress]); // Zoom from 1x to 40x to fill screen with 30px image

  // Keep the name visible throughout most of the zoom
  // It only fades at the very end when we're fully inside the image
  const nameOpacity = useMemo(
    () =>
      scrollProgress < 0.8
        ? 1
        : Math.max(0, 1 - ((scrollProgress - 0.8) / 0.2) * 1),
    [scrollProgress]
  );

  return (
    <div className="relative">
      {/* Loading indicator */}
      {!imagesLoaded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="text-foreground/60">Loading images...</div>
        </div>
      )}

      {/* Fixed container for zoom effect */}
      <div
        ref={containerRef}
        className="w-full h-screen overflow-hidden "
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 10,
          backfaceVisibility: "hidden",
          transform: "translate3d(0, 0, 0)",
          opacity: imagesLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in",
        }}
      >
        {/* Name with image-filled text - ZOOMING IN */}
        <div
          ref={nameRef}
          className="absolute inset-0 flex items-center justify-center "
          style={{
            // Zoom IN to a randomly selected point
            transform: `translate3d(0, 0, 0) scale(${zoomScale})`,
            transformOrigin: `${targetPosition.x}% ${targetPosition.y}%`,
            transition: "none",
            backfaceVisibility: "hidden",
            perspective: 1000,
          }}
        >
          <div className="relative">
            <svg
              ref={svgRef}
              viewBox="0 0 1200 300"
              className="w-[90vw] max-w-6xl h-auto"
            >
              <defs>
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

              {/* Grid of small images clipped to text */}
              <g clipPath="url(#text-clip)">
                {imagePositions.map((pos, idx) => (
                  <image
                    key={`${pos.row}-${pos.col}-${pos.imageIdx}`}
                    href={images[pos.imageIdx]}
                    x={pos.x}
                    y={pos.y}
                    width={pos.imageWidth}
                    height={pos.imageHeight}
                    preserveAspectRatio="xMidYMid slice"
                  />
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Spacer to enable scrolling - matches zoom phase height */}
      <div style={{ height: "400vh" }} />

      {/* ######################################################### */}

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
    </div>
  );
}
