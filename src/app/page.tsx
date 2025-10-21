"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Sample images - you can replace these with your own images
const sampleImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop",
];

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomComplete, setIsZoomComplete] = useState(false);
  const [targetLetterIndex, setTargetLetterIndex] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Initialize random target letter on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * 17); // 17 total letters
    setTargetLetterIndex(randomIndex);
  }, []);

  useEffect(() => {
    let accumulatedScroll = 0;
    const maxScroll = 1000; // Total scroll needed to complete zoom

    const handleWheel = (e: WheelEvent) => {
      if (!isZoomComplete) {
        e.preventDefault();

        // Accumulate scroll delta
        accumulatedScroll += e.deltaY;
        accumulatedScroll = Math.max(0, Math.min(accumulatedScroll, maxScroll));

        const progress = accumulatedScroll / maxScroll;
        setScrollProgress(progress);

        // Use the target letter's image
        setSelectedImageIndex(targetLetterIndex % sampleImages.length);

        // Check if zoom is complete
        if (progress >= 1) {
          setIsZoomComplete(true);
          document.body.style.overflow = "auto";
        }
      }
    };

    // Prevent all scrolling until zoom is complete
    const preventScroll = (e: Event) => {
      if (!isZoomComplete) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    // Initially disable scrolling
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      document.body.style.overflow = "auto";
    };
  }, [isZoomComplete, targetLetterIndex]);

  const zoomScale = 1 + scrollProgress * 50; // Scale from 1 to 51x for extreme zoom into target letter
  const imageOpacity = Math.min(scrollProgress * 2, 1); // Fade in as user scrolls

  return (
    <div className="relative">
      {/* Hero Section with Image-Filled Text */}
      <div
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden bg-black"
      >
        {/* Background Images - Only visible when zoomed */}
        <div className="absolute inset-0">
          {sampleImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 will-change-opacity ${
                index === selectedImageIndex && scrollProgress > 0.9
                  ? "opacity-100"
                  : "opacity-0"
              }`}
              style={{
                transition: "opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Image
                src={image}
                alt={`Background ${index + 1}`}
                fill
                className="object-cover will-change-transform"
                style={{
                  transform: `scale(${
                    index === selectedImageIndex ? zoomScale : 1
                  })`,
                  transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Text with Multiple Images Fill */}
        <div
          ref={textRef}
          className="relative z-10 text-center will-change-transform"
        >
          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-bold leading-none select-none will-change-transform"
            style={{
              transform: `scale(${1 + scrollProgress * 3})`,
              transition: "transform 0.1s ease-out",
              textShadow: "0 0 20px rgba(0,0,0,0.5)",
              transformOrigin: "center center",
            }}
          >
            {/* MEREDITH */}
            <div className="flex justify-center gap-2 mb-2">
              {["M", "E", "R", "E", "D", "I", "T", "H"].map((letter, index) => {
                const isTarget = index === targetLetterIndex;
                const shouldHide = false; // Never hide letters - they disappear naturally due to zoom
                const shouldFade = false; // Never fade letters

                return (
                  <span
                    key={index}
                    className="inline-block"
                    style={{
                      backgroundImage: `url(${
                        sampleImages[index % sampleImages.length]
                      })`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(2px 2px 8px rgba(0,0,0,0.4))",
                      transform: isTarget ? `scale(${zoomScale})` : "scale(1)",
                      transition:
                        "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out",
                      zIndex: isTarget ? 10 : 1,
                      position: "relative",
                      opacity: shouldHide
                        ? 0
                        : shouldFade
                        ? Math.max(0, 1 - (scrollProgress - 0.95) * 20)
                        : 1,
                    }}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>

            {/* VON FELDT */}
            <div className="flex justify-center gap-2">
              {["V", "O", "N", " ", "F", "E", "L", "D", "T"].map(
                (letter, index) => {
                  const letterIndex = index + 8; // Offset for second line
                  const isTarget = letterIndex === targetLetterIndex;
                  const shouldHide = false; // Never hide letters - they disappear naturally due to zoom
                  const shouldFade = false; // Never fade letters

                  return (
                    <span
                      key={index}
                      className="inline-block"
                      style={{
                        backgroundImage: `url(${
                          sampleImages[letterIndex % sampleImages.length]
                        })`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        filter: "drop-shadow(2px 2px 8px rgba(0,0,0,0.4))",
                        transform: "none",
                        transition: "opacity 0.5s ease-out",
                        zIndex: isTarget ? 10 : 1,
                        position: "relative",
                        opacity: 1, // Always visible - they disappear naturally due to zoom
                      }}
                    >
                      {letter}
                    </span>
                  );
                }
              )}
            </div>
          </h1>
        </div>

        {/* Overlay that appears as user scrolls */}
        <div
          className="absolute inset-0 bg-black transition-opacity duration-1000"
          style={{ opacity: imageOpacity * 0.3 }}
        />
      </div>

      {/* Content Below the Fold */}
      <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
            Welcome to My Portfolio
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                About Me
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                I'm a creative professional passionate about design and
                technology. This interactive scrolling experience showcases my
                love for innovative web experiences and attention to detail.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                My Work
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                I specialize in creating engaging digital experiences that tell
                stories and connect with audiences. From web design to
                interactive installations, I bring ideas to life through
                thoughtful design and technical excellence.
              </p>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6"
              >
                <h4 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Project {item}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
