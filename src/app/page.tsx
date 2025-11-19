"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const lowResImageRef = useRef<HTMLImageElement | null>(null);
  const highResImageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // --- CONFIG ------------------------------------------------------------
  // Adjust to fit your exported PNG resolution
  const IMAGE_WIDTH = 8000;
  const IMAGE_HEIGHT = 3000;

  // Initial zoom (1.0 = fit screen)
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 40;

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

    let zoom = 1;
    let target = TARGETS.E;
    let ticking = false;
    let animationFrameId: number | null = null;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
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

      // Clear canvas
      ctx.fillStyle = "#000000";
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
      const scale = zoom;
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

    // Initial draw
    draw();

    const onScroll = (e: WheelEvent) => {
      e.preventDefault();

      const delta = e.deltaY > 0 ? 1.05 : 0.95;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * delta));

      // Switch to high-res image if zooming in past threshold
      if (
        newZoom > HIGH_RES_ZOOM_THRESHOLD &&
        zoom <= HIGH_RES_ZOOM_THRESHOLD
      ) {
        if (highResImageRef.current) {
          imageRef.current = highResImageRef.current;
          draw();
        }
      }

      // Switch back to low-res if zooming out past threshold
      if (
        newZoom <= HIGH_RES_ZOOM_THRESHOLD &&
        zoom > HIGH_RES_ZOOM_THRESHOLD
      ) {
        if (lowResImageRef.current) {
          imageRef.current = lowResImageRef.current;
          draw();
        }
      }

      zoom = newZoom;

      if (!ticking) {
        ticking = true;
        animationFrameId = requestAnimationFrame(() => {
          draw();
          ticking = false;
        });
      }
    };

    window.addEventListener("wheel", onScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [imageLoaded]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "black",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          imageRendering: "auto",
        }}
      />
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
  );
}
