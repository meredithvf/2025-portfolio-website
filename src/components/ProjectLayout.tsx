"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import ProjectHeader from "@/components/ProjectHeader";
import TechnicalStack from "@/components/TechnicalStack";
import Button from "@/components/Button";

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
  backHref?: string;
  overviewText: string | React.ReactNode;
  overviewMedia?: {
    type: "video" | "image";
    src: string;
    alt?: string;
  };
  overviewDescription?: string;
  featuresTitle?: string;
  features?: Feature[];
  technologies: string[];
  websiteUrl?: string;
  websiteButtonText?: string;
  newsAndAwards?: NewsAndAwardsItem[];
}

export default function ProjectLayout({
  title,
  category,
  backHref,
  overviewText,
  overviewMedia,
  overviewDescription,
  featuresTitle = "Some of the Features I Built",
  features,
  technologies,
  websiteUrl,
  websiteButtonText = "Visit Website",
  newsAndAwards,
}: ProjectLayoutProps) {
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
      },
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

  return (
    <>
      {/* Side Navigation - hidden on mobile */}
      <div className="hidden lg:block fixed top-1/2 left-8 -translate-y-1/2 z-50">
        <div className="sideways-lr flex flex-row items-center justify-center gap-x-40">
          <Link
            href="/#work"
            datadog-action-name="Project Header Work"
            className="text-foreground/40 hover:text-foreground transition-colors duration-300 text-sm tracking-wider"
          >
            Work
          </Link>
          <a
            href="mailto:meredithvf@gmail.com"
            datadog-action-name="Project Header Contact"
            className="text-foreground/40 hover:text-foreground transition-colors duration-300 text-sm tracking-wider"
          >
            Contact
          </a>
        </div>
      </div>
      <div className="hidden lg:block fixed top-1/2 right-8 -translate-y-1/2 z-50">
        <div className="vertical-lr flex flex-row items-center justify-center gap-x-40">
          <Link
            href="/#intro"
            datadog-action-name="Project Header Home"
            className="text-foreground/40 hover:text-foreground transition-colors duration-300 text-sm tracking-wider"
          >
            Home
          </Link>
          <a
            href="/resume.pdf"
            download="meredith-von-feldt-resume.pdf"
            datadog-action-name="Project Header Resume"
            className="text-foreground/40 hover:text-foreground transition-colors duration-300 text-sm tracking-wider"
          >
            Resume
          </a>
        </div>
      </div>

      <ProjectHeader title={title} backHref={backHref} />

      <div className="min-h-screen pb-20 px-6 md:px-12 lg:mx-20">
        <div className="max-w-6xl mx-auto">
          {/* Category & Overview Section */}
          <div className="mb-16">
            <p
              ref={addToRefs}
              className="animate-on-scroll text-sm uppercase tracking-[0.16em] font-medium text-foreground/[0.66] mb-6"
            >
              {category}
            </p>
            <div className="w-24 h-px bg-foreground/20 mb-8"></div>
            {(overviewText || websiteUrl) && (
              <div
                ref={addToRefs}
                className="animate-on-scroll delay-100 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start"
              >
                {overviewText && (
                  <div className="text-xl text-foreground/80 leading-relaxed max-w-3xl lg:col-span-2">
                    {overviewText}
                  </div>
                )}
                {websiteUrl && (
                  <div className="flex justify-start lg:justify-center items-start lg:col-span-1 lg:pt-1">
                    <Button
                      href={websiteUrl}
                      datadogActionName={`Project CTA ${title}`}
                    >
                      {websiteButtonText} →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Overview Section with Video/Image */}
          {overviewMedia && (
            <section className="mb-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Media */}
                <div
                  ref={addToRefs}
                  className="animate-on-scroll delay-200 relative w-full"
                >
                  <div className="overflow-hidden rounded-sm">
                    {overviewMedia.type === "video" ? (
                      <video
                        style={{ margin: "-1px" }}
                        className="w-full shadow-xl hover:scale-[1.02] transition-transform duration-500"
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
                        className="w-full h-auto shadow-xl hover:scale-[1.02] transition-transform duration-500"
                      />
                    )}
                  </div>
                </div>
                {/* Overview Text */}
                {overviewDescription && (
                  <div
                    ref={addToRefs}
                    className="animate-on-scroll delay-300 flex flex-col justify-center h-full lg:pl-4"
                  >
                    <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
                      {overviewDescription}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Key Features */}
          {features && features.length > 0 && (
            <section className="mb-24">
              <h2
                ref={addToRefs}
                className="animate-on-scroll display-heading text-3xl md:text-4xl mb-4"
              >
                {featuresTitle}
              </h2>
              <div className="w-24 h-px bg-foreground/20 mb-12"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features?.map((feature, index) => (
                  <div
                    key={index}
                    ref={addToRefs}
                    className={`animate-on-scroll group`}
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <div className="overflow-hidden rounded-sm mb-4">
                      <Image
                        src={feature.image}
                        alt={feature.alt}
                        width={300}
                        height={200}
                        className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {feature.title && (
                      <h3 className="text-lg font-light mb-2 group-hover:text-foreground transition-colors duration-300">
                        {feature.title}
                      </h3>
                    )}
                    {feature.description && (
                      <p className="text-foreground/60 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Technical Stack */}
          {technologies.length > 0 && (
            <div ref={addToRefs} className="animate-on-scroll">
              <TechnicalStack technologies={technologies} />
            </div>
          )}

          {/* News and Awards */}
          {newsAndAwards && newsAndAwards.length > 0 && (
            <section className="mb-24 mt-24">
              <h2
                ref={addToRefs}
                className="animate-on-scroll display-heading text-3xl md:text-4xl mb-4"
              >
                News and Awards
              </h2>
              <div className="w-24 h-px bg-foreground/20 mb-12"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsAndAwards.map((item, index) => {
                  const Component = item.url ? "a" : "div";
                  const props = item.url
                    ? {
                        href: item.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        "datadog-action-name": `Project News ${title} ${index + 1}`,
                      }
                    : {};
                  const isClickable = !!item.url;

                  return (
                    <Component
                      key={index}
                      ref={(el: HTMLElement | null) => {
                        if (el) addToRefs(el);
                      }}
                      {...props}
                      className={`animate-on-scroll ${
                        isClickable ? "group" : ""
                      } block border border-foreground/10 ${
                        isClickable
                          ? "hover:border-foreground/30 hover:bg-foreground/[0.02] cursor-pointer"
                          : ""
                      } transition-all duration-300 rounded-sm overflow-hidden`}
                      style={{ animationDelay: `${(index + 1) * 100}ms` }}
                    >
                      {item.image && (
                        <div className="relative w-full h-48 overflow-hidden bg-foreground/5">
                          <Image
                            src={item.image}
                            alt={item.imageAlt || item.title}
                            fill
                            className={`object-cover transition-transform duration-500 ${
                              isClickable ? "group-hover:scale-105" : ""
                            }`}
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h4
                          className={`text-lg font-light mb-3 ${
                            isClickable
                              ? "group-hover:text-foreground transition-colors duration-300"
                              : ""
                          }`}
                        >
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-foreground/[0.66]">
                          {(item.source || item.organization) && (
                            <span>{item.source || item.organization}</span>
                          )}
                          {(item.source || item.organization) && item.date && (
                            <span className="text-foreground/30">•</span>
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

          {/* Back to Work Link */}
          <Link
            href="/#work"
            datadog-action-name="Project Back To Work"
            className="group inline-flex items-center gap-3 text-foreground/60 hover:text-foreground transition-colors duration-300"
          >
            <span className="group-hover:-translate-x-2 transition-transform duration-300">
              ←
            </span>
            <span className="text-lg">Back to all work</span>
          </Link>
        </div>
      </div>
    </>
  );
}
