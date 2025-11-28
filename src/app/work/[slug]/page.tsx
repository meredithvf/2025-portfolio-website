import { projects } from "@/data/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TechnicalStack from "@/components/TechnicalStack";

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

  // Special case for Cereal Reads
  if (slug === "project-two") {
    return (
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-block mb-8 text-foreground/60 hover:text-foreground transition-colors"
          >
            ←
          </Link>

          {/* Hero Image */}
          <div className="mb-20 px-12">
            <Image
              src="/images/cereal/cereal_hero.png"
              alt="Cereal Reads Website Homepage"
              width={800}
              height={600}
              className="w-full h-auto rounded-sm"
              priority
            />
          </div>

          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-light mb-4">
              {project.title}
            </h1>
            <p className="text-lg text-foreground/60 mb-8">
              {project.category}
            </p>
            <div className="w-24 h-px bg-foreground/20 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <p className="text-xl text-foreground/80 leading-relaxed max-w-3xl lg:col-span-2">
                A reading-first app that integrates with Patreon to improve
                reading, listening, and navigation experiences for serial
                fiction authors and their subscribers. Trusted by authors with
                over 10,000 members.
              </p>
              <div className="flex justify-center lg:col-span-1">
                <a
                  href="https://www.cerealreads.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 border border-foreground/30 hover:border-foreground hover:bg-foreground/5 transition-colors rounded-sm"
                >
                  Visit Website →
                </a>
              </div>
            </div>
          </div>

          {/* Overview Section with Video */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-light mb-6">Overview</h2>
            <div className="w-24 h-px bg-foreground/20 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Video */}
              <div className="relative w-full">
                <video
                  // add this style because there were small black lines as chrome bug
                  style={{ margin: "-1px" }}
                  className="w-full rounded-lg shadow-2xl"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source
                    src="https://dtbn723bxqwag.cloudfront.net/hero_video_720.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
              {/* Overview Text */}
              <div className="flex flex-col justify-between h-full">
                <div className="text-xl text-foreground/80 leading-relaxed space-y-4">
                  <p>
                    Cereal Reads was built to solve the problem of serial
                    fiction authors struggling to provide a subscription-worthy
                    reading experience on Patreon. The platform offers a
                    beautiful, dedicated reading experience that keeps
                    subscribers engaged and coming back for more.
                  </p>
                  <p>
                    As the founder and full-stack developer, I built the mobile
                    app, integrating seamlessly with Patreon's API to
                    authenticate subscribers and gate content based on
                    membership tiers.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-light mb-6">
              Some of the Features I Built
            </h2>
            <div className="w-24 h-px bg-foreground/20 mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div>
                <Image
                  src="/images/cereal/reader_screenshot.png"
                  alt="Beautiful Reading Mode"
                  width={300}
                  height={200}
                  className="w-full h-auto rounded-sm mb-4"
                />
                <h3 className="text-lg font-light mb-2">
                  Beautiful Reading Experience
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  Customizable reading settings including dark mode, text size
                  adjustment, and immersive reading mode.
                </p>
              </div>

              {/* Feature 2 */}
              <div>
                <Image
                  src="/images/cereal/cereal_comment_2.svg"
                  alt="In-line Comments"
                  width={300}
                  height={200}
                  className="w-full h-auto rounded-sm mb-4"
                />
                <h3 className="text-lg font-light mb-2">In-Line Comments</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  In-line comments to keep readers engaged.
                </p>
              </div>

              {/* Feature 3 */}
              <div>
                <Image
                  src="/images/cereal/TOCScreenshot.png"
                  alt="Table of Contents"
                  width={300}
                  height={200}
                  className="w-full h-auto rounded-sm mb-4"
                />
                <h3 className="text-lg font-light mb-2">Easy Navigation</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  Comprehensive table of contents based of off subscription
                  tiers.
                </p>
              </div>

              {/* Feature 4 */}
              <div>
                <Image
                  src="/images/cereal/HomePageScreenshot.png"
                  alt="Beautiful Reading Mode"
                  width={300}
                  height={200}
                  className="w-full h-auto rounded-sm mb-4"
                />
                <h3 className="text-lg font-light mb-2">
                  Text-to-Speech Audiobooks
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  Convert chapters into high-quality audiobooks with just a few
                  clicks to add an additional delight to using Cereal over
                  reading on Patreon.
                </p>
              </div>
            </div>
          </section>

          {/* Technical Stack */}
          <TechnicalStack
            technologies={["Supabase", "Patreon API", "Expo", "React Native"]}
          />
        </div>
      </div>
    );
  }

  // Default template for other projects
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
