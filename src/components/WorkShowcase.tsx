"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/types/project";
import ProjectSlide from "./ProjectSlide";

// Re-export Project type for convenience
export type { Project } from "@/types/project";

interface WorkShowcaseProps {
  projects: Project[];
}

export default function WorkShowcase({ projects }: WorkShowcaseProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setHeaderVisible(true);
        });
      },
      { threshold: 0.2 }
    );

    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!projects || projects.length === 0) return null;

  return (
    <section
      id="work"
      className="relative w-full overflow-hidden"
      aria-labelledby="work-heading"
    >
      {/* Header */}
      <div ref={headerRef} className="max-w-6xl mx-auto px-6 md:px-12 py-24">
        <div
          className={`transition-all duration-1000 ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <p className="text-sm uppercase tracking-[0.16em] font-medium text-foreground/[0.66] mb-4">
            Selected Work
          </p>
          <h2
            id="work-heading"
            className="display-heading text-5xl md:text-6xl lg:text-7xl"
          >
            Projects
          </h2>
        </div>
      </div>

      {/* Projects */}
      {projects.map((project, index) => (
        <ProjectSlide
          key={project.id}
          anchorId={`project-${project.slug}`}
          project={project}
          index={index}
          isLast={index === projects.length - 1}
          previousColor={index > 0 ? projects[index - 1].sunColor : "#ece7c1"}
        />
      ))}
    </section>
  );
}
