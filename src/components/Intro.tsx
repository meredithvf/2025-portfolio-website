"use client";

import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";

type IntroProps = {
  onWorkReverseTab?: (event: ReactKeyboardEvent<HTMLAnchorElement>) => void;
};

export default function Intro({ onWorkReverseTab }: IntroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const elementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    elementsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  const handleResumeDownload = () => {
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "meredith-von-feldt-resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="relative w-full min-h-[70vh] flex items-center py-20 px-6 md:px-12"
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Introduction */}
          <div className="lg:col-span-7">
            <p
              ref={addToRefs}
              className="animate-on-scroll text-sm uppercase tracking-[0.16em] font-medium text-foreground/[0.66] mb-6"
            >
              Software Engineer & Designer
            </p>
            
            <h1
              ref={addToRefs}
              className="animate-on-scroll delay-100 display-heading text-4xl md:text-5xl lg:text-6xl mb-8"
            >
              <span className="italic">Meredith Sunshine</span>
            </h1>
            
            <div
              ref={addToRefs}
              className="animate-on-scroll delay-200 space-y-4 text-lg text-foreground/[0.68] leading-relaxed max-w-xl"
            >
              <p className="mb-4">
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

          {/* Right: Navigation */}
          <nav
            className="lg:col-span-5 lg:pt-8"
            aria-label="Main navigation"
          >
            <ul className="space-y-4">
              <li
                ref={addToRefs}
                className="animate-on-scroll delay-200"
              >
                <a
                  href="#work"
                  onKeyDown={onWorkReverseTab}
                  className="group flex items-center justify-between py-3 border-b border-foreground/30 hover:border-foreground/70 transition-colors duration-300"
                >
                  <span className="display-heading text-2xl md:text-3xl group-hover:translate-x-2 group-hover:scale-110 transition-transform duration-300">
                    Work
                  </span>
                  <span className="text-2xl text-foreground/[0.68] group-hover:text-foreground/70 group-hover:-translate-x-1 transition-all duration-300">
                    →
                  </span>
                </a>
              </li>
              
              <li
                ref={addToRefs}
                className="animate-on-scroll delay-300"
              >
                <button
                  onClick={handleResumeDownload}
                  className="group flex items-center justify-between py-3 border-b border-foreground/30 hover:border-foreground/70 transition-colors duration-300 w-full text-left"
                  aria-label="Download resume as PDF"
                >
                  <span className="display-heading text-2xl md:text-3xl group-hover:translate-x-2 group-hover:scale-110 transition-transform duration-300">
                    Resume
                  </span>
                  <span className="text-lg text-foreground/[0.68] group-hover:text-foreground group-hover:-translate-x-1 transition-colors duration-300">
                    ↓ PDF
                  </span>
                </button>
              </li>
              
              <li
                ref={addToRefs}
                className="animate-on-scroll delay-400"
              >
                <a
                  href="mailto:meredithvf@gmail.com"
                  className="group flex items-center justify-between py-3 border-b border-foreground/30 hover:border-foreground/70 transition-colors duration-300"
                  aria-label="Send email to meredithvf@gmail.com"
                >
                  <span className="display-heading text-2xl md:text-3xl group-hover:translate-x-2 group-hover:scale-110 transition-transform duration-300">
                    Connect
                  </span>
                  <span className="text-sm text-foreground/[0.68] group-hover:text-foreground group-hover:-translate-x-1 transition-colors duration-300">
                    meredithvf@gmail.com
                  </span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
