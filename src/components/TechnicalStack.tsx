interface TechnicalStackProps {
  technologies: string[];
}

export default function TechnicalStack({ technologies }: TechnicalStackProps) {
  return (
    <section className="mb-20">
      <div className="flex flex-wrap items-center gap-2 text-foreground/80">
        {technologies.map((tech, index) => (
          <span key={tech} className="flex items-center">
            <span className="text-lg font-light">{tech}</span>
            {index < technologies.length - 1 && (
              <span className="mx-3 text-foreground/40">•</span>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}

