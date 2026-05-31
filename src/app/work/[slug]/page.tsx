import { projects } from "@/data/projects";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProjectHeader from "@/components/ProjectHeader";
import ProjectLayout from "@/components/ProjectLayout";

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
  const backHref = `/?project=${slug}`;

  if (!project) {
    notFound();
  }

  if (slug === "monastery-finder") {
    return (
      <ProjectLayout
        title={project.title}
        category={project.category}
        backHref={backHref}
        overviewText="Monastery Finder is a website that helps people discover spiritual communities — monasteries, temples, zen centers, retreat centers, and similar places — in order to visit and stay at these communities. Users interact with a chatbot to help them create a profile based on the type of experience they are looking for. They then receive personalized community recommendations. Users can easily ascertain whether they want to visit a community by viewing a consolidated profile for each place."
        overviewMedia={{
          type: "video",
          src: "/videos/monastery_finder_hazy_moon_zen_center.mp4",
        }}
        overviewDescription="The backend is organized around an agent harness that runs a two-stage data workflow. Discovery pipelines find and queue monastery/community sources, and enrichment pipelines transform those raw findings into structured, comparable records. The system treats agent runs as backend jobs, with shared schemas and validation between pipeline stages so downstream and frontend pages consume clean, consistent data. This design separates crawling/collection from normalization/scoring, which makes the platform easier to scale, debug, and iterate as new sources are added."
        featuresTitle="What I Worked On"
        features={[
          {
            image: "/images/monastery-finder/discovery-chat.png",
            alt: "Discovery chat interface",
            title: "Discovery chat",
            description:
              "The discovery chat is a short, turn-limited conversation powered by a Next.js API route that calls OpenAI with a custom system prompt. The model extracts qualitative context (narrative summary, readiness intent, and any user-volunteered constraints) while deliberately avoiding numeric scoring.",
          },
          {
            image: "/images/monastery-finder/profile-scoring.png",
            alt: "Spiritual orientation preference sliders",
            title: "Profile scoring / scales",
            description:
              "User preferences are captured as 0–100 bipolar spectrum sliders (spiritual orientation, community structure, lifestyle) plus a 1–5 seriousness scale, normalized to a fixed [0, 1] vector and mapped onto community feature dimensions through rules that handle semantic pole inversions. Community-side scores are LLM-extracted jsonb (grouped by practice, community, lifestyle, etc.) normalized to the same vector space; matching applies hard filters on region and tradition, then ranks candidates with a weighted mean absolute distance across aligned dimensions.",
          },
          {
            image: "/images/monastery-finder/community-information.png",
            alt: "Community profile with About, Retreats, and Programs sections",
            title: "Community information",
            description:
              "Community information is gathered through the harness&apos;s agentic discovery-to-enrichment flow: discovery agents identify relevant monastery/community sources, then enrichment agents extract and normalize fields like About, Retreats, location, and practices into a shared schema. Instead of one-off scraping logic, the backend uses reusable agent steps, validation gates, and structured outputs so new communities can be added with the same pipeline and quality checks.",
          },
          {
            image: "/images/monastery-finder/community-scoring.png",
            alt: "Community scores dashboard",
            title: "Community scoring",
            description:
              'Scoring is also agent-driven: enrichment agents produce normalized feature values, then a deterministic scoring stage maps those values onto shared scales and calculates composite community scores. This keeps the "agentic" part focused on evidence collection/interpretation while the final scale math stays consistent, transparent, and easy to recalibrate over time.',
          },
        ]}
        technologies={[
          "Next.js",
          "React",
          "TypeScript",
          "OpenAI",
          "PostgreSQL",
          "Supabase",
          "Tavily",
          "Mapbox",
          "Cheerio",
        ]}
        websiteUrl="https://monasteryfinder.com/"
      />
    );
  }

  if (slug === "lucid") {
    return (
      <ProjectLayout
        title={project.title}
        category={project.category}
        backHref={backHref}
        overviewText={
          <>
            I worked on the design system team at Lucid Software from 2022-2025,
            eventually becoming team lead. I drove accessibility, design-system
            quality, and cross-org alignment—leading projects like Accessibility
            Focus Testing, On-Canvas Keyboard Navigation, and a Design System
            Catalog Update. I partnered with UX, engineering, legal, and product
            to advance Web Content Accessibility Guidelines (WCAG) compliance
            and publish Lucid&apos;s{" "}
            <a
              href="https://www.lucid.co/accessibility"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              accessibility statement
            </a>
            .
          </>
        }
        overviewMedia={{
          type: "image",
          src: "https://help.lucid.co/hc/article_attachments/34335027337876",
        }}
        overviewDescription="Beyond technical work, I led team training, documentation, and mentoring. I taught design system courses, created onboarding materials, led tech talks, and improved processes to increase engineering self-sufficiency."
        featuresTitle="Some of the Projects I Worked On"
        features={[
          {
            image:
              "https://help.lucid.co/hc/article_attachments/34335027337876",
            alt: "Accessibility Statement",
            title: "Accessibility Statement Release",
            description:
              "Led engineering work to publish Lucid's accessibility statement. Audited, updated, and created core components, verified WCAG compliance, and coordinated with legal, UX, and engineering to formalize our accessibility posture.",
          },
          {
            image: "/images/lucid/design-system-tabs.png",
            alt: "Screenshot example of Lucid's design system in use",
            title: "Design System Components",
            description:
              "Modernized core components like the tabs system—improving architecture, accessibility, and developer experience. Created documentation and patterns to make components easier for designers, customer, and enginners to use.",
          },
          {
            image: "/images/lucid/design-system-sticky-note.png",
            alt: "Screenshot example of Lucid's design system in use",
            title: "Design System Catalog Revamp",
            description:
              "Led a multi-quarter initiative to overhaul the internal design system catalog. Redesigned component pages, improved documentation, and enhanced discoverability based on engineer feedback.",
          },
          {
            image:
              "https://help.lucid.co/hc/article_attachments/34335027340052",
            alt: "Accessibility Testing",
            title: "Accessibility Testing Infrastructure",
            description:
              "Built new testing tools and standardized keyboard/focus test patterns. Introduced automated accessibility coverage and a KPI tracking system for violations across the codebase.",
          },
        ]}
        technologies={["Typescript", "Angular", "HTML/CSS"]}
        websiteUrl="https://www.lucid.co/"
      />
    );
  }

  if (slug === "cereal-reads") {
    return (
      <ProjectLayout
        title={project.title}
        category={project.category}
        backHref={backHref}
        overviewText={
          <>
            My brother and I built Cereal Reads in 2023–2024 to solve a common
            challenge for serial fiction authors using Patreon: they want to
            offer a truly subscription-worthy reading experience, but Patreon
            isn’t designed for long-form, serialized content. Our app integrates
            with Patreon to make serial fiction easier to read, listen to, and
            navigate for both authors and subscribers alike. Read our story {""}
            <a
              href="https://www.cerealreads.com/our_story"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              here
            </a>
            .
          </>
        }
        overviewMedia={{
          type: "video",
          src: "https://dtbn723bxqwag.cloudfront.net/hero_video_720.mp4",
        }}
        overviewDescription="I built the mobile app, integrating with Patreon's API to authenticate subscribers, gate content based on membership tiers, track reading progress, and keep readers engaged."
        features={[
          {
            image: "/images/cereal/reader_screenshot.png",
            alt: "Beautiful Reading Mode",
            title: "Beautiful Reading Experience",
            description: "Customizable reading settings and location tracking.",
          },
          {
            image: "/images/cereal/cereal_comment_2.svg",
            alt: "In-line Comments",
            title: "In-Line Comments",
            description: "In-line comments to keep readers engaged.",
          },
          {
            image: "/images/cereal/TOCScreenshot.png",
            alt: "Table of Contents",
            title: "Easy Navigation",
            description:
              "Comprehensive table of contents available based off subscription tiers.",
          },
          {
            image: "/images/cereal/HomePageScreenshot.png",
            alt: "Text-to-Speech Audiobooks",
            title: "Text-to-Speech Audiobooks",
            description:
              "Audiobook conversion adds an additional delight to using Cereal over reading on Patreon.",
          },
        ]}
        technologies={["Supabase", "Patreon API", "Expo", "React Native"]}
        websiteUrl="https://www.cerealreads.com/"
      />
    );
  }

  // Special case for Sava
  if (slug === "sava") {
    return (
      <ProjectLayout
        title={project.title}
        category={project.category}
        backHref={backHref}
        overviewText="Sava was a dating safety app I built with a team as part of BYU's Sandbox startup accelerator program. We created it to help people feel safer and more comfortable on dates, especially when meeting someone new. The app provides automated exit strategies—like pre-scheduled texts or calls—that give users a socially acceptable way to leave uncomfortable situations without having to explain themselves."
        overviewMedia={{
          type: "video",
          src: "/videos/SavaPromo.mp4",
        }}
        overviewDescription="We were driven by our own experiences and those of friends who wanted a better way to stay safe while dating. As a founder, I was involved in validation, testing, and prototyping. My main responsibility was the technical implementation. I built features that let users set up check-ins throughout their date, receive automated exit calls or texts, and contact emergency services if needed. The app launched in 2022 and was available on all app stores, helping people navigate the dating world with more confidence and peace of mind."
        features={[
          {
            image: "/images/sava/sava-screenshot-step1.jpeg",
            alt: "Sava Step 1",
            title: "Accurate Native Notifications",
            description:
              "Worked with ios and android notifications so that users could set up notifications to check in with them at specific times.",
          },
          {
            image: "/images/sava/sava-screenshot-step2.jpeg",
            alt: "Sava Step 2",
            title: "Automated Exit Strategies",
            description:
              "Used Twilio and Firebase Messaging to send automated calls and texts to the user and user's emergency contact.",
          },
          {
            image: "/images/sava/sava-screenshot-step3.jpeg",
            alt: "Sava Step 3",
            title: "Customizable Messages",
            description:
              "Allowed users to customize the text or phone call message that was sent to them.",
          },
          {
            image: "/images/sava/sava-screenshot-step4.jpeg",
            alt: "Sava Step 4",
            title: "One Tap Response",
            description:
              "Built a custom notification system so that users could respond to their check in notification from their lock screen, watch, or notification center.",
          },
        ]}
        technologies={["Flutter", "Firebase", "Twilio API", "Heap Analytics"]}
        newsAndAwards={[
          {
            title:
              "BYU students create dating safety app to prevent sexual assault",
            url: "https://kutv.com/news/eye-on-utah/byu-students-create-dating-safety-app-to-prevent-sexual-assault",
            source: "KUTV",
            image:
              "https://kutv.com/resources/media/b7e5082c-dfdb-42dc-a7d7-18a806b11709-630EYEONUTAHKELLY.transfer_frame_1103.png",
            imageAlt: "BYU students create dating safety app Sava",
          },
          {
            title:
              "First all-female team competing in the Student Innovator of the Year competition",
            url: "https://engineering.byu.edu/news/first-all-female-team-at-sioy",
            source: "BYU Engineering",
            image:
              "https://brightspotcdn.byu.edu/dims4/default/2e43750/2147483647/strip/true/crop/8192x5464+0+0/resize/1920x1281!/quality/90/?url=https%3A%2F%2Fbrigham-young-brightspot-us-east-2.s3.us-east-2.amazonaws.com%2Fe2%2F53%2Ff79576ec4cc487599995ac1417ad%2F2203-07-068-1.jpg",
            imageAlt:
              "Two teammates presenting pitch for Sava at the Student Innovator of the Year competition",
          },
        ]}
      />
    );
  }

  if (slug === "byu-hci") {
    return (
      <ProjectLayout
        title={project.title}
        category={project.category}
        backHref={backHref}
        overviewText="I worked in the BYU Human Computer Interaction Lab from 2019–2021. I was initially drawn to this lab because I was interested in the relationship between technology and the outdoors. Among other projects, I spent significant time researching this topic. I co-authored “Outside Where? A Survey of Climates and Built Environments in Studies of HCI Outdoors,” a paper published in the CHI 2021 proceedings."
        technologies={["Python", "R"]}
        websiteUrl="https://dl.acm.org/doi/fullHtml/10.1145/3491102.3507656"
        websiteButtonText="View paper"
        newsAndAwards={[
          {
            title: "2nd place in section at the BYU Research Competition",
            organization: "BYU",
            date: "2019",
          },
        ]}
      />
    );
  }

  // Default template for other projects
  return (
    <>
      <ProjectHeader title={project.title} backHref={backHref} />
      <div className="min-h-screen pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-lg text-foreground/60 mb-4">
              {project.category}
            </p>
          </div>

          <div className="mb-12">
            <Image
              src={project.thumbnail}
              alt={project.title}
              width={1600}
              height={900}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="w-full h-auto rounded-sm"
            />
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-foreground/80">
              This is a placeholder for the project detail page. You can add
              more content, images, descriptions, and details about this project
              here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
