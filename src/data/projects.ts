import type { Project } from "@/types/project";

export const projects: Project[] = [
  {
    id: "5",
    title: "Monastery Finder",
    category: "Full stack developer",
    thumbnail: "/images/monastery-finder/landing-page.png",
    slug: "monastery-finder",
    description:
      "A website that helps people discover spiritual communities and receive personalized recommendations through a chatbot-guided profile and agent-driven community data.",
    showcaseMedia: {
      type: "image",
      src: "/images/monastery-finder/landing-page.png",
    },
    sunColor: "#efe0a8",
  },
  {
    id: "1",
    title: "Lucid Software",
    category: "Software Engineer, Design System Team Lead",
    thumbnail: "/images/lucid-logo.png",
    slug: "lucid",
    description:
      "Led the design system team, creating scalable, accessible component libraries and establishing design patterns for enterprise collaboration tools.",
    showcaseMedia: {
      type: "image",
      src: "/images/lucid/design-system-tabs.png",
    },
    sunColor: "#f2e3a5",
  },
  {
    id: "2",
    title: "Cereal Reads",
    category: "Founder, Full stack developer",
    thumbnail: "/images/cereal_logo.png",
    slug: "cereal-reads",
    description:
      "A reading-first mobile app that integrates with Patreon to improve the serial fiction experience.",
    showcaseMedia: {
      type: "video",
      src: "https://dtbn723bxqwag.cloudfront.net/hero_video_720.mp4",
    },
    sunColor: "#f5de98", // Slightly warmer yellow
  },
  {
    id: "3",
    title: "Sava",
    category: "Founder, Full stack developer",
    thumbnail: "/images/sava-logo.png",
    slug: "sava",
    description:
      "A dating safety app providing automated exit strategies and check-ins for safer dating experiences.",
    showcaseMedia: {
      type: "video",
      src: "/videos/SavaPromo.mp4",
    },
    sunColor: "#f7d88b", // Soft golden yellow
  },
  {
    id: "4",
    title: "Human Computer Interaction Lab",
    category: "Researcher & Engineer",
    thumbnail: "/images/byu-logo.png",
    slug: "byu-hci",
    description:
      "Published research on HCI outdoors, exploring the relationship between technology and natural environments.",
    showcaseMedia: {
      type: "image",
      src: "/images/byu-logo.png",
    },
    sunColor: "#f9d27e", // Rich golden yellow
  },
];
