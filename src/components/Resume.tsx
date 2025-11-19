"use client";

export default function Resume() {
  const handleDownload = () => {
    // Create a link element and trigger download
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "resume.pdf";
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
            Download a copy of my resume to learn more about my experience,
            skills, and background.
          </p>

          <button
            onClick={handleDownload}
            className="group inline-flex items-center gap-3 px-8 py-4 border border-foreground/20 hover:border-foreground/60 bg-transparent hover:bg-foreground/5 transition-all duration-300 rounded-sm"
          >
            <span className="text-lg font-light">Download Resume</span>
            <span className="text-foreground/40 group-hover:text-foreground/80 transition-colors duration-300">
              ↓
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

