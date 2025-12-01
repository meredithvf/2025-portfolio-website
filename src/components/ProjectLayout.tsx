import Link from "next/link";
import Image from "next/image";
import ProjectHeader from "@/components/ProjectHeader";
import TechnicalStack from "@/components/TechnicalStack";

interface Feature {
  image: string;
  alt: string;
  title: string;
  description: string;
}

interface NewsAndAwardsItem {
  title: string;
  url?: string; // Optional - awards might not have URLs
  source?: string; // For news articles
  organization?: string; // For awards
  date?: string;
  image?: string;
  imageAlt?: string;
}

interface ProjectLayoutProps {
  title: string;
  category: string;
  overviewText: string;
  overviewMedia?: {
    type: "video" | "image";
    src: string;
    alt?: string;
  };
  overviewDescription?: string;
  featuresTitle?: string;
  features: Feature[];
  technologies: string[];
  websiteUrl?: string;
  newsAndAwards?: NewsAndAwardsItem[];
}

export default function ProjectLayout({
  title,
  category,
  overviewText,
  overviewMedia,
  overviewDescription,
  featuresTitle = "Some of the Features I Built",
  features,
  technologies,
  websiteUrl,
  newsAndAwards,
}: ProjectLayoutProps) {
  return (
    <>
      <div className="absolute top-14 z-10 rotate-270">
        <Link
          href="/"
          className="text-foreground/60 hover:text-foreground transition-colors text-sm"
        >
          Back to Work →
        </Link>
      </div>

      <ProjectHeader title={title} />

      <div className="min-h-screen pb-20 mx-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-2xl mb-6">{category}</p>
            <div className="w-24 h-px bg-foreground/20 mb-8"></div>
            {(overviewText || websiteUrl) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {overviewText && (
                  <p className="text-xl text-foreground/80 leading-relaxed max-w-3xl lg:col-span-2">
                    {overviewText}
                  </p>
                )}
                {websiteUrl && (
                  <div className="flex justify-center align-center lg:col-span-1">
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 border border-foreground/30 hover:border-foreground hover:bg-foreground/5 transition-colors rounded-sm"
                    >
                      Visit Website →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Overview Section with Video/Image */}
          {overviewMedia && (
            <section className="mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Media */}
                <div className="relative w-full">
                  {overviewMedia.type === "video" ? (
                    <video
                      style={{ margin: "-1px" }}
                      className="w-full rounded-lg shadow-2xl"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src={overviewMedia.src} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image
                      src={overviewMedia.src}
                      alt={overviewMedia.alt || title}
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-lg shadow-2xl"
                    />
                  )}
                </div>
                {/* Overview Text */}
                {overviewDescription && (
                  <div className="flex flex-col justify-between h-full">
                    <div className="text-xl text-foreground/80 leading-relaxed space-y-4">
                      <p>{overviewDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Key Features */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-light mb-6">
              {featuresTitle}
            </h2>
            <div className="w-24 h-px bg-foreground/20 mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index}>
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    width={300}
                    height={200}
                    className="w-full h-auto rounded-sm mb-4"
                  />
                  {feature.title && (
                    <h3 className="text-lg font-light mb-2">{feature.title}</h3>
                  )}
                  {feature.description && (
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Technical Stack */}
          {technologies.length > 0 && (
            <TechnicalStack technologies={technologies} />
          )}

          {/* News and Awards */}
          {newsAndAwards && newsAndAwards.length > 0 && (
            <section className="mb-20 mt-20">
              <h2 className="text-3xl md:text-4xl font-light mb-6">
                News and Awards
              </h2>
              <div className="w-24 h-px bg-foreground/20 mb-12"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newsAndAwards.map((item, index) => {
                  const Component = item.url ? "a" : "div";
                  const props = item.url
                    ? {
                        href: item.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                      }
                    : {};

                  return (
                    <Component
                      key={index}
                      {...props}
                      className={`group block border border-foreground/20 ${
                        item.url
                          ? "hover:border-foreground/40 hover:bg-foreground/5 cursor-pointer"
                          : ""
                      } transition-all rounded-sm overflow-hidden`}
                    >
                      {item.image && (
                        <div className="relative w-full h-48 overflow-hidden bg-foreground/5">
                          <Image
                            src={item.image}
                            alt={item.imageAlt || item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h4
                          className={`text-lg font-light mb-3 ${
                            item.url
                              ? "group-hover:text-foreground transition-colors"
                              : ""
                          }`}
                        >
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-foreground/60">
                          {(item.source || item.organization) && (
                            <span>{item.source || item.organization}</span>
                          )}
                          {(item.source || item.organization) && item.date && (
                            <span>•</span>
                          )}
                          {item.date && <span>{item.date}</span>}
                        </div>
                      </div>
                    </Component>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
