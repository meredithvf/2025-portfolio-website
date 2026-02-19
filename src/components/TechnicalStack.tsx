interface TechnicalStackProps {
  technologies: string[];
}

export default function TechnicalStack({ technologies }: TechnicalStackProps) {
  return (
    <section className="mb-20">
      <p className="text-sm uppercase tracking-[0.16em] font-medium text-foreground/[0.66] mb-4">
        Technologies
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {technologies.map((tech) => (
          <span
            key={tech}
            className="px-4 py-2 text-sm font-light text-foreground/70 border border-foreground/15 rounded-sm transition-all duration-300"
          >
            {tech}
          </span>
        ))}
      </div>
    </section>
  );
}

