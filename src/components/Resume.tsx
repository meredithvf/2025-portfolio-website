"use client";

import Button from "@/components/Button";

export default function Resume() {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "meredith-von-feldt-resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

          <Button onClick={handleDownload}>Download Resume ↓</Button>
        </div>
      </div>
    </section>
  );
}
