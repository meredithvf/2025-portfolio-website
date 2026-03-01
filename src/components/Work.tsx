"use client";

import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import Link from "next/link";

export interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  slug: string;
}

interface WorkProps {
  projects: Project[];
}

export default function Work({ projects }: WorkProps) {
  const [hoveredProject, setHoveredProject] = useState<Project | null>(
    projects[0] || null
  );
  const [displayedProject, setDisplayedProject] = useState<Project | null>(
    projects[0] || null
  );
  const [nextProject, setNextProject] = useState<Project | null>(null);
  const [showNext, setShowNext] = useState(false);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing timers
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (hoveredProject && hoveredProject.id !== displayedProject?.id) {
      // Preload image and wait for it to be ready
      const img = new window.Image();
      img.src = hoveredProject.thumbnail;

      const startTransition = () => {
        // Always set the next project to the hovered one
        setNextProject(hoveredProject);
        setShowNext(false);

        // Small delay to ensure DOM is ready, then start transition
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = requestAnimationFrame(() => {
            setShowNext(true);
          });
        });

        transitionTimerRef.current = setTimeout(() => {
          setDisplayedProject(hoveredProject);
          setNextProject(null);
          setShowNext(false);
          transitionTimerRef.current = null;
        }, 900);
      };

      // If image is already loaded, start immediately
      if (img.complete) {
        startTransition();
      } else {
        // Wait for image to load before starting transition
        img.onload = startTransition;
        img.onerror = startTransition; // Start even if image fails
      }
    } else if (hoveredProject && hoveredProject.id === displayedProject?.id) {
      // If hovering over the currently displayed project, reset transition state
      setNextProject(null);
      setShowNext(false);
    }

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [hoveredProject, displayedProject]);

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section id="work" className="relative w-full min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <h2 className="text-4xl md:text-5xl font-light mb-4">Work</h2>
          <div className="w-24 h-px bg-foreground/20 mt-8"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Project List */}
          <div className="space-y-1">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                href={`/work/${project.slug}`}
                className="block group"
                onMouseEnter={() => setHoveredProject(project)}
              >
                <div className="flex items-center justify-between py-4 border-b border-foreground/10 group-hover:border-foreground/30 transition-colors duration-300 bounce-item">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-foreground/40 font-mono tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg md:text-xl font-light group-hover:text-foreground transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-sm text-foreground/[0.66] mt-1">
                        {project.category}
                      </p>
                    </div>
                  </div>
                  <span className="text-foreground/30 group-hover:text-foreground/60 transition-colors duration-300">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Thumbnail Display */}
          <div className="h-[35vh] lg:h-[calc(100vh-12rem)] max-w-full">
            <div
              className={`relative w-full h-full overflow-hidden rounded-sm ${
                displayedProject?.thumbnail.includes("byu-logo") ||
                nextProject?.thumbnail.includes("byu-logo")
                  ? "bg-white"
                  : "bg-foreground/5"
              }`}
            >
              {displayedProject && (
                <div
                  key={displayedProject.id}
                  className="absolute inset-0"
                  style={{
                    opacity: showNext ? 0 : 1,
                    transition: "opacity 1500ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <NextImage
                    src={displayedProject.thumbnail}
                    alt={displayedProject.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={`w-full h-full ${
                      displayedProject.thumbnail.includes("byu-logo")
                        ? "object-contain p-20"
                        : "object-cover"
                    }`}
                    loading="lazy"
                  />
                </div>
              )}
              {nextProject && (
                <div
                  key={`next-${nextProject.id}`}
                  className="absolute inset-0"
                  style={{
                    opacity: showNext ? 1 : 0,
                    transition: "opacity 900ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <NextImage
                    src={nextProject.thumbnail}
                    alt={nextProject.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={`w-full h-full ${
                      nextProject.thumbnail.includes("byu-logo")
                        ? "object-contain p-20"
                        : "object-cover"
                    }`}
                    loading="eager"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
