// "Hermes Agent Mastery" — our own Bangla course on Nous Research's Hermes
// Agent. Two sections: (1) the official documentation, retold story-style for
// absolute beginners, and (2) the Udemy course "Hermes Agent: Build a
// Self-Improving AI Agent" (Arnold Oberleiter), written up from transcripts.
//
// Lesson bodies live in lib/data/video-golpo/<contentId>.json and render via
// the /module/story/[contentId] route.

import type {
  CourseContentItem,
  CourseModule,
  CourseSummary,
} from "@/lib/data/course-modules";
import {
  hermesUdemySections,
  type UdemySectionOutline,
} from "./hermes-udemy-outline";

export const HERMES_COURSE_ID = "hermes-agent-mastery";

export const DOCS_BASE_URL = "https://hermes-agent.nousresearch.com";

interface DocPage {
  /** Path under /docs/, e.g. "getting-started/installation". */
  path: string;
  title: string;
}

interface DocSection {
  slug: string;
  title: string;
  pages: DocPage[];
}

const docSections: DocSection[] = [
  {
    slug: "introduction",
    title: "০. Hermes পরিচিতি (Introduction)",
    pages: [
      {
        path: "introduction/what-is-hermes",
        title: "Hermes কী? কোথায় ব্যবহার হয়, সুবিধা ও কী কী করা যায়",
      },
    ],
  },
  {
    slug: "getting-started",
    title: "১. শুরু করি (Getting Started)",
    pages: [
      { path: "getting-started/installation", title: "Installation" },
      { path: "getting-started/quickstart", title: "Quickstart" },
      { path: "getting-started/learning-path", title: "Learning Path" },
      { path: "getting-started/updating", title: "Updating" },
      { path: "getting-started/platform-support", title: "Platform Support" },
    ],
  },
  {
    slug: "using-hermes",
    title: "২. Hermes ব্যবহার (Using Hermes)",
    pages: [
      { path: "user-guide/cli", title: "CLI" },
      { path: "user-guide/tui", title: "TUI (Terminal UI)" },
      { path: "user-guide/configuration", title: "Configuration" },
      { path: "user-guide/configuring-models", title: "Configuring Models" },
      { path: "user-guide/sessions", title: "Sessions" },
      { path: "user-guide/profiles", title: "Profiles" },
      { path: "user-guide/git-worktrees", title: "Git Worktrees" },
      { path: "user-guide/docker", title: "Docker Backend" },
      { path: "user-guide/security", title: "Security" },
      {
        path: "user-guide/checkpoints-and-rollback",
        title: "Checkpoints & Rollback",
      },
      { path: "user-guide/bot-mode", title: "Bot Mode" },
      { path: "user-guide/local-models", title: "Local Models" },
      { path: "user-guide/secrets", title: "Secrets" },
      {
        path: "user-guide/which-file-does-what",
        title: "Which File Does What?",
      },
    ],
  },
  {
    slug: "core-features",
    title: "৩. মূল Feature (Core Features)",
    pages: [
      { path: "user-guide/features/overview", title: "Features Overview" },
      { path: "user-guide/features/tools", title: "Tools" },
      { path: "user-guide/features/skills", title: "Skills System" },
      { path: "user-guide/features/curator", title: "Curator" },
      { path: "user-guide/features/memory", title: "Memory" },
      {
        path: "user-guide/features/memory-providers",
        title: "Memory Providers",
      },
      { path: "user-guide/features/context-files", title: "Context Files" },
      {
        path: "user-guide/features/context-references",
        title: "Context References",
      },
      {
        path: "user-guide/features/personality",
        title: "Personality & SOUL.md",
      },
      { path: "user-guide/features/plugins", title: "Plugins" },
      { path: "user-guide/features/computer-use", title: "Computer Use" },
      { path: "user-guide/features/web-search", title: "Web Search & Extract" },
      {
        path: "user-guide/features/web-dashboard",
        title: "Hermes Web Dashboard",
      },
    ],
  },
  {
    slug: "automation",
    title: "৪. Automation",
    pages: [
      { path: "user-guide/features/cron", title: "Cron Jobs" },
      { path: "user-guide/features/delegation", title: "Delegation" },
      { path: "user-guide/features/kanban", title: "Kanban Multi-Agent" },
      {
        path: "user-guide/features/kanban-tutorial",
        title: "Kanban Tutorial",
      },
      { path: "user-guide/features/goals", title: "Persistent Goals" },
      { path: "user-guide/features/code-execution", title: "Code Execution" },
      { path: "user-guide/features/hooks", title: "Hooks" },
      { path: "user-guide/features/loops", title: "Recurring Loops" },
      { path: "user-guide/features/heartbeat", title: "Session Heartbeats" },
    ],
  },
  {
    slug: "media-web",
    title: "৫. Voice, Browser ও Media",
    pages: [
      { path: "user-guide/features/voice-mode", title: "Voice Mode" },
      { path: "user-guide/features/browser", title: "Browser" },
      { path: "user-guide/features/vision", title: "Vision" },
      {
        path: "user-guide/features/image-generation",
        title: "Image Generation",
      },
      { path: "user-guide/features/tts", title: "Text-to-Speech" },
    ],
  },
  {
    slug: "messaging",
    title: "৬. Messaging Platform (Telegram, Discord…)",
    pages: [
      { path: "user-guide/messaging", title: "Messaging Overview" },
      { path: "user-guide/messaging/telegram", title: "Telegram" },
      { path: "user-guide/messaging/discord", title: "Discord" },
      { path: "user-guide/messaging/slack", title: "Slack" },
      { path: "user-guide/messaging/whatsapp", title: "WhatsApp" },
      { path: "user-guide/messaging/email", title: "Email" },
      { path: "user-guide/messaging/webhooks", title: "Webhooks" },
    ],
  },
  {
    slug: "integrations",
    title: "৭. Integration (MCP, API…)",
    pages: [
      { path: "integrations", title: "Integrations Overview" },
      { path: "integrations/providers", title: "Providers" },
      {
        path: "user-guide/features/mcp",
        title: "MCP (Model Context Protocol)",
      },
      { path: "user-guide/features/acp", title: "ACP" },
      { path: "user-guide/features/api-server", title: "API Server" },
      {
        path: "user-guide/features/provider-routing",
        title: "Provider Routing",
      },
      {
        path: "user-guide/features/fallback-providers",
        title: "Fallback Providers",
      },
      {
        path: "user-guide/features/credential-pools",
        title: "Credential Pools",
      },
      { path: "integrations/nous-portal", title: "Nous Portal" },
    ],
  },
  {
    slug: "guides",
    title: "৮. Guide ও Tutorial",
    pages: [
      { path: "guides/tips", title: "Tips & Best Practices" },
      { path: "guides/local-ollama-setup", title: "Run Hermes with Ollama" },
      { path: "guides/daily-briefing-bot", title: "Daily Briefing Bot" },
      {
        path: "guides/team-telegram-assistant",
        title: "Team Telegram Assistant",
      },
      {
        path: "guides/python-library",
        title: "Use Hermes as a Python Library",
      },
      { path: "guides/use-mcp-with-hermes", title: "Use MCP with Hermes" },
      { path: "guides/use-soul-with-hermes", title: "Use SOUL.md with Hermes" },
      { path: "guides/automate-with-cron", title: "Automate with Cron" },
      { path: "guides/work-with-skills", title: "Work with Skills" },
      { path: "guides/delegation-patterns", title: "Delegation Patterns" },
      {
        path: "guides/github-pr-review-agent",
        title: "GitHub PR Review Agent",
      },
      { path: "guides/automation-blueprints", title: "Automation Blueprints" },
      {
        path: "guides/troubleshooting-agent-quality",
        title: "Troubleshooting: My Agent Feels Dumber",
      },
    ],
  },
  {
    slug: "reference",
    title: "৯. Reference",
    pages: [
      { path: "reference/cli-commands", title: "CLI Commands" },
      { path: "reference/slash-commands", title: "Slash Commands" },
      {
        path: "reference/environment-variables",
        title: "Environment Variables",
      },
      { path: "reference/tools-reference", title: "Tools Reference" },
      { path: "reference/toolsets-reference", title: "Toolsets Reference" },
      { path: "reference/mcp-config-reference", title: "MCP Config Reference" },
      { path: "reference/faq", title: "FAQ & Troubleshooting" },
    ],
  },
  {
    slug: "developer",
    title: "১০. Developer Guide (ভেতরের গল্প)",
    pages: [
      { path: "developer-guide/architecture", title: "Architecture" },
      { path: "developer-guide/agent-loop", title: "Agent Loop" },
      { path: "developer-guide/prompt-assembly", title: "Prompt Assembly" },
      { path: "developer-guide/adding-tools", title: "Adding Tools" },
      { path: "developer-guide/creating-skills", title: "Creating Skills" },
      { path: "developer-guide/plugins", title: "Build a Hermes Plugin" },
    ],
  },
];

/** Stable content id for a docs page, e.g. "hermes-doc-getting-started-installation". */
export function hermesDocContentId(path: string): string {
  return `hermes-doc-${path.replace(/\//g, "-")}`;
}

function toDocItem(page: DocPage): CourseContentItem {
  return {
    type: "doc_lesson",
    title: page.title,
    completed: false,
    contentId: hermesDocContentId(page.path),
  };
}

function toDocModule(section: DocSection): CourseModule {
  const contents = section.pages.map(toDocItem);
  return {
    id: `${HERMES_COURSE_ID}-docs-${section.slug}`,
    title: section.title,
    contentCounts: { doc_lesson: contents.length },
    progress: { completed: 0, total: contents.length, percentage: 0 },
    contents,
  };
}

/** Stable content id for a Udemy lecture, e.g. "hermes-udemy-s2-l3" (1-based). */
export function hermesUdemyContentId(
  sectionIndex: number,
  lectureIndex: number,
): string {
  return `hermes-udemy-s${sectionIndex + 1}-l${lectureIndex + 1}`;
}

function toUdemyModule(
  section: UdemySectionOutline,
  sectionIndex: number,
): CourseModule {
  const contents: CourseContentItem[] = section.lectures.map(
    (lecture, lectureIndex) => ({
      type: "udemy_lecture",
      title: lecture.title,
      completed: false,
      contentId: hermesUdemyContentId(sectionIndex, lectureIndex),
      durationLabel: lecture.duration,
    }),
  );
  return {
    id: `${HERMES_COURSE_ID}-udemy-s${sectionIndex + 1}`,
    title: section.title,
    contentCounts: { udemy_lecture: contents.length },
    progress: { completed: 0, total: contents.length, percentage: 0 },
    contents,
  };
}

export const hermesAgentMasteryCourse: CourseSummary = {
  courseTitle: "Hermes Agent Mastery",
  courseId: HERMES_COURSE_ID,
  milestones: [
    {
      id: `${HERMES_COURSE_ID}-docs`,
      title: "Documentation",
      modules: docSections.map(toDocModule),
    },
    {
      id: `${HERMES_COURSE_ID}-udemy`,
      title: "Udemy Course",
      modules: hermesUdemySections.map(toUdemyModule),
    },
  ],
};
