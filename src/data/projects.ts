import { Project } from "@/components/WorkShowcase";

export const projects: Project[] = [
  {
    id: "1",
    title: "Lucid Software",
    category: "Software Engineer, Design System Team Lead",
    thumbnail: "/images/lucid-logo.png",
    slug: "lucid",
    description: "Led the design system team, creating scalable component libraries and establishing design patterns for enterprise collaboration tools.",
    showcaseMedia: {
      type: "image",
      src: "/images/lucid/design-system-tabs.png",
    },
    sunColor: "#E8D5A3", // Muted golden wheat
  },
  {
    id: "2",
    title: "Cereal Reads",
    category: "Founder, Full stack developer",
    thumbnail: "/images/cereal_logo.png",
    slug: "cereal-reads",
    description: "A reading-first mobile app that integrates with Patreon to improve the serial fiction experience.",
    showcaseMedia: {
      type: "video",
      src: "https://dtbn723bxqwag.cloudfront.net/hero_video_720.mp4",
    },
    sunColor: "#D4B896", // Muted warm sand
  },
  {
    id: "3",
    title: "Sava",
    category: "Founder, Full stack developer",
    thumbnail: "/images/sava-logo.png",
    slug: "sava",
    description: "A dating safety app providing automated exit strategies and check-ins for safer dating experiences.",
    showcaseMedia: {
      type: "video",
      src: "https://github.com/meredithvf/website-video-hosting/releases/download/V1.0.0/SavaPromo.mp4",
    },
    sunColor: "#C9B8C9", // Muted dusty lavender
  },
  {
    id: "4",
    title: "BYU HCI Lab",
    category: "Researcher & Engineer",
    thumbnail: "/images/byu-logo.png",
    slug: "byu-hci",
    description: "Published research on HCI outdoors, exploring the relationship between technology and natural environments.",
    showcaseMedia: {
      type: "image",
      src: "/images/byu-logo.png",
    },
    sunColor: "#B8C9D4", // Muted soft blue dusk
  },
];
