import { projects } from "@/data/projects";
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

  if (!project) {
    notFound();
  }

  if (slug === "lucid") {
    return (
      <ProjectLayout
        title={project.title}
        category={project.category}
        overviewText={
          <>
            I worked on the design system team at Lucid Software from 2022-2025.
            I became a central technical and organizational leader, driving
            accessibility, design-system quality, and cross-org alignment. I led
            several high-impact projects—including Accessibility Focus Testing,
            On-Canvas Keyboard Navigation, and the Design System Catalog Update—
            while also managing external contractors and taking on the role of
            team lead. I partnered closely with UX, engineering, legal, and
            product to advance WCAG compliance, publish Lucid's accessibility
            statement, and introduce scalable testing and tracking frameworks.
            My work helped the organization accelerate its accessibility goals,
            reduce design-system-related friction, and preserve UI quality
            across products. You can view Lucid's accessibility page{" "}
            <a
              href="https://www.lucid.co/accessibility"
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
          type: "image",
          src: "https://help.lucid.co/hc/article_attachments/34335027337876",
        }}
        overviewDescription="Beyond technical execution, I took ownership of team training, 
        documentation strategy, mentoring, and process optimization. 
        I taught Lucid Design System courses, created new onboarding materials, 
        led tech talks, improved sprint rituals, 
        and launched documentation and ownership initiatives 
        that reduced recurring questions and increased engineering self-sufficiency. 
        Throughout my time on the team, I focused on elevating our execution, 
        strengthening cross-team communication, 
        and helping my teammates feel supported and successful."
        featuresTitle="Some of the Projects I Worked On"
        features={[
          {
            image:
              "https://help.lucid.co/hc/article_attachments/34335027337876",
            alt: "Accessibility Statement",
            title: "Accessibilty Statement Release",
            description:
              "As the team lead during release, I played a key role in helping Lucid publish its accessibility statement by leading the engineering work necessary to validate, document, and formalize our compliance story. I partnered closely with legal, UX, and engineering to ensure the statement accurately reflected our technical standards and in-product accessibility posture. This included auditing core components, verifying WCAG-aligned behaviors, and establishing the testing frameworks and documentation needed to support our claims. By driving both the engineering readiness and the cross-team coordination, I helped Lucid confidently release a statement that met legal expectations, represented our accessibility progress, and positioned the company for future compliance milestones.",
          },
          {
            image: "/images/lucid/design-system-tabs.png",
            alt: "Screenshot example of Lucid's design system in use",
            title: "Design System Component Updates",
            description:
              "I led significant modernization across the design system, improving core components, refining architectural patterns, and making updates easier and more accessible for engineers to adopt. For example I redesigned the top tabs component, but my contributions spanned many components and included developing clear documentation, guiding implementation paths, and strengthening ownership and consistency. By proactively supporting engineers and streamlining patterns, I helped ensure that design system updates were performant, accessible, and straightforward to use across Lucid’s products.",
          },
          {
            image: "/images/lucid/design-system-sticky-note.png",
            alt: "Screenshot example of Lucid's design system in use",
            title: "Design System Catalog Revamp",
            description:
              "I led a multi-quarter initiative to revamp the internal Design System website/catalog, making it a more meaningful and discoverable resource. I conducted multiple rounds of surveys and interviews, redesigned component pages, added clearer replacement instructions, improved the sandbox, tightened ownership boundaries, and shaped the implementation work. These changes reduced inconsistency, clarified documentation, and improved the engineering experience across Lucid.",
          },
          {
            image:
              "https://help.lucid.co/hc/article_attachments/34335027340052",
            alt: "Accessibility Testing",
            title: "Accessibilty Testing Infrastructure",
            description:
              "I significantly expanded Lucid’s accessibility testing capabilities by introducing new testing infrastructure, standardizing focus and keyboard-navigation test patterns, and driving organization-wide efforts to align with WCAG requirements. I created a new testing tool and improved the broader harness architecture to make writing accessible frontend tests simpler, faster, and more consistent. I also led testing epics, added automated coverage across core components, and helped define a new KPI and parser for tracking accessibility violations in the codebase. Together, these efforts enabled Lucid to scale accessibility testing, catch issues earlier, and build more inclusive, compliant user experiences.",
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
        overviewText={
          <>
            I created this app with my brother in 2023/2024 in order to solve
            the problem of serial fiction authors struggling to provide a
            subscription-worthy reading experience on Patreon. Read our story{" "}
            {""}
            <a
              href="https://www.cerealreads.com/our_story"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              here
            </a>
            . Cereal is a reading-first app that integrates with Patreon to
            improve reading, listening, and navigation experiences for serial
            fiction authors and their subscribers."
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
        overviewText="Sava was a dating safety app I built with a team as part of BYU's Sandbox startup accelerator program. We created it to help people feel safer and more comfortable on dates, especially when meeting someone new. The app provides automated exit strategies—like pre-scheduled texts or calls—that give users a socially acceptable way to leave uncomfortable situations without having to explain themselves."
        overviewMedia={{
          type: "video",
          src: "https://github.com/meredithvf/website-video-hosting/releases/download/V1.0.0/SavaPromo.mp4",
        }}
        overviewDescription="We were driven by our own experiences and those of friends who wanted a better way to stay safe while dating. As a founder I was involved in validation, testing, and prototyping, but I was primarily responsible for the technical implementation, building features that let users set up check-ins throughout their date, receive automated exit calls or texts, and contact emergency services if needed. The app launched in 2022 and was available on all app stores, helping people navigate the dating world with more confidence and peace of mind."
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
            title: "First all-female team at SIOY",
            url: "https://engineering.byu.edu/news/first-all-female-team-at-sioy",
            source: "BYU Engineering",
            image:
              "https://brightspotcdn.byu.edu/dims4/default/2e43750/2147483647/strip/true/crop/8192x5464+0+0/resize/1920x1281!/quality/90/?url=https%3A%2F%2Fbrigham-young-brightspot-us-east-2.s3.us-east-2.amazonaws.com%2Fe2%2F53%2Ff79576ec4cc487599995ac1417ad%2F2203-07-068-1.jpg",
            imageAlt: "First all-female team at SIOY with Sava app",
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
        overviewText="I worked in the BYU Human Computer Interaction Lab from 2019-2021. I was initially drawn to this lab because I was interested in the relationship between technology and the outdoors. Among other projects, I got to spend lots of time researching this topic and in the CHI 2021 proceedings I published &ldquo;Outside Where? A Survey of Climates and Built Environments in Studies of HCI outdoors.&rdquo;"
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
      <ProjectHeader title={project.title} />
      <div className="min-h-screen pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-lg text-foreground/60 mb-4">
              {project.category}
            </p>
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
