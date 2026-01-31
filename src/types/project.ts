export interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  slug: string;
  description?: string;
  showcaseMedia?: {
    type: "image" | "video";
    src: string;
  };
  sunColor?: string;
}
