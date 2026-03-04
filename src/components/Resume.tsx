"use client";

import ResumeLink from "@/components/ResumeLink";

export default function Resume() {
  return (
    <section id="resume" className="relative w-full min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-4">Resume</h2>
          <div className="w-24 h-px bg-foreground/20 mt-8"></div>
        </div>

        <div className="max-w-2xl">
          <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
            Want something more formal?
          </p>

          <ResumeLink
            className="px-6 py-3 text-xl bg-foreground text-background border-foreground hover:bg-foreground/5 hover:text-foreground hover:border-foreground inline-block border rounded-sm transition-all duration-300 hover:translate-x-2 hover:scale-110 origin-left"
            aria-label="Download resume as PDF"
          >
            Download Resume ↓
          </ResumeLink>
        </div>
      </div>
    </section>
  );
}
