"use client";

import { useEffect, useRef, useState } from "react";

// Generate a dense grid of small images that will be clipped to text
const generateImageGrid = (imageCount: number) => {
  const positions = [];
  const imageSize = 20; // Small images for grid
  const cols = 60; // 1200 / 20 = 60 columns
  const rows = 15; // 300 / 20 = 15 rows

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * imageSize;
      const y = row * imageSize;
      const imageIdx = (row * cols + col) % imageCount;

      positions.push({ x, y, imageIdx, size: imageSize, row, col });
    }
  }

  return positions;
};

// Better text detection using more precise bounds
const isPositionInText = (x: number, y: number, size: number) => {
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  // MEREDITH: centered at x=600, baseline at y=135, height ~120px
  // So roughly x=300-900, y=15-135
  const inMeredith =
    centerX >= 300 && centerX <= 900 && centerY >= 15 && centerY <= 135;

  // VON FELDT: centered at x=600, baseline at y=225, height ~120px
  // So roughly x=300-900, y=105-225
  const inVonFeldt =
    centerX >= 300 && centerX <= 900 && centerY >= 105 && centerY <= 225;

  return inMeredith || inVonFeldt;
};

// Get positions that are actually within the text bounds
const getTextPositions = (allPositions: any[]) => {
  return allPositions.filter((pos) => {
    return isPositionInText(pos.x, pos.y, pos.size);
  });
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
      size: number;
      row: number;
      col: number;
    }>
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Your personal images
  const images = [
    "/images/bodhi_manda_zeno.jpeg",
    "/images/dar_al_islam.jpeg",
    "/images/dombes_barn.jpeg",
    "/images/dombes_sheep.jpeg",
    "/images/dombes.jpeg",
    "/images/haute_cross.jpeg",
    "/images/haute_joseph.jpeg",
    "/images/haute_south.jpeg",
    "/images/haute_terrace.jpeg",
    "/images/jemez_soda_dam.jpeg",
    "/images/sutra_hall_ext.jpeg",
    "/images/taroudant_fountain.jpeg",
    "/images/taroudant_mosque.jpeg",
    "/images/taroudant_teapot.jpeg",
    "/images/taroudant_walkers.jpeg",
    "/images/zmm_buddha_hall.jpeg",
  ];

  // Generate grid and select a target image on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      // Generate full grid of small images
      const allPositions = generateImageGrid(images.length);
      setImagePositions(allPositions);

      // Get only positions within text bounds
      const textPositions = getTextPositions(allPositions);

      if (textPositions.length > 0) {
        // Pick a random position from text positions to zoom to
        const randomIdx = Math.floor(Math.random() * textPositions.length);
        const targetPos = textPositions[randomIdx];

        // Calculate center of the selected image
        const centerX = targetPos.x + targetPos.size / 2;
        const centerY = targetPos.y + targetPos.size / 2;

        // Convert to percentage for transform-origin
        const percentX = (centerX / 1200) * 100;
        const percentY = (centerY / 300) * 100;

        setTargetPosition({ x: percentX, y: percentY });
      }
      hasInitialized.current = true;
    }
  }, [images.length]);

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

    // Reset target when scrolled back to top
    const checkReset = () => {
      if (window.scrollY < 10 && scrollProgress > 0.5) {
        // User has scrolled back to top - pick new target from text positions
        const textPositions = getTextPositions(imagePositions);

        if (textPositions.length > 0) {
          const randomIdx = Math.floor(Math.random() * textPositions.length);
          const targetPos = textPositions[randomIdx];
          const centerX = targetPos.x + targetPos.size / 2;
          const centerY = targetPos.y + targetPos.size / 2;
          const percentX = (centerX / 1200) * 100;
          const percentY = (centerY / 300) * 100;
          setTargetPosition({ x: percentX, y: percentY });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scroll", checkReset, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", checkReset);
    };
  }, [scrollProgress, imagePositions]);

  // Calculate zoom transformation - zoom TO a specific small image tile
  // With 20px images, we need significant zoom to fill the screen
  // Screen is roughly 1200px wide, so we need 1200/20 = 60x zoom to fill width
  const zoomScale = 1 + scrollProgress * 59; // Zoom from 1x to 60x to fill screen with 20px image

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
            // Zoom IN to a randomly selected point
            transform: `scale(${zoomScale})`,
            transformOrigin: `${targetPosition.x}% ${targetPosition.y}%`,
            transition: "none",
          }}
        >
          <div className="relative">
            <svg viewBox="0 0 1200 300" className="w-[90vw] max-w-6xl h-auto">
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
                    key={idx}
                    href={images[pos.imageIdx]}
                    x={pos.x}
                    y={pos.y}
                    width={pos.size}
                    height={pos.size}
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
