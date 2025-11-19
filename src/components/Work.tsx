"use client";

import { useState, useEffect } from "react";
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
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (hoveredProject && hoveredProject.id !== displayedProject?.id) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayedProject(hoveredProject);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [hoveredProject, displayedProject]);

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section id="work" className="relative w-full min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
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
                <div className="flex items-center justify-between py-4 border-b border-foreground/10 group-hover:border-foreground/30 transition-colors duration-300">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-foreground/40 font-mono tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg md:text-xl font-light group-hover:text-foreground transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-sm text-foreground/50 mt-1">
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
          <div className="sticky top-20 h-[60vh] lg:h-[80vh]">
            <div className="relative w-full h-full overflow-hidden rounded-sm bg-foreground/5">
              {displayedProject && (
                <div
                  key={displayedProject.id}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <img
                    src={displayedProject.thumbnail}
                    alt={displayedProject.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
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
