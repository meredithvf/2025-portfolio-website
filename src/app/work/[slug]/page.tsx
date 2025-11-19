import { projects } from "@/data/projects";
import { notFound } from "next/navigation";
import Link from "next/link";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-12 text-foreground/60 hover:text-foreground transition-colors"
        >
          ← Back to Work
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light mb-4">
            {project.title}
          </h1>
          <p className="text-lg text-foreground/60">{project.category}</p>
        </div>

        <div className="mb-12">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-auto rounded-sm"
          />
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-foreground/80">
            This is a placeholder for the project detail page. You can add more
            content, images, descriptions, and details about this project here.
          </p>
        </div>
      </div>
    </div>
  );
}

