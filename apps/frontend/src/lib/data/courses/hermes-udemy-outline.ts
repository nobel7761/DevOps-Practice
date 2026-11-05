// Generated from docs/hermes/udemy-course.txt (Udemy curriculum HTML):
// "Hermes Agent: Build a Self-Improving AI Agent" by Arnold Oberleiter.
// 7 sections, 53 lectures. Titles/durations are as published on Udemy.

export interface UdemyLectureOutline {
  title: string;
  duration: string;
}

export interface UdemySectionOutline {
  title: string;
  lectures: UdemyLectureOutline[];
}

export const hermesUdemySections: UdemySectionOutline[] = [
  {
    title: "Introduction",
    lectures: [
      {
        title: "Introduction",
        duration: "0:07",
      },
      {
        title: "Course Overview",
        duration: "6:11",
      },
      {
        title: "Instructor Introduction: Arnold Oberleiter (Arnie)",
        duration: "1:20",
      },
      {
        title: "Important Links and Resources",
        duration: "0:12",
      },
      {
        title:
          "Hermes Agent Explained: Harness, Architecture, and How It Works",
        duration: "15:34",
      },
    ],
  },
  {
    title: "Hermes Agent Setup from Zero",
    lectures: [
      {
        title: "Section Overview",
        duration: "1:35",
      },
      {
        title: "Hermes Desktop",
        duration: "0:49",
      },
      {
        title:
          "Hermes Agent Installation Options: Local, Sandbox, Separate Device, or VPS",
        duration: "7:33",
      },
      {
        title:
          "Hermes Agent VPS Setup: Install and Run Hermes on a Server in a Docker Container",
        duration: "6:02",
      },
      {
        title: "Hermes basic Setup: LLMs, Telegram and more",
        duration: "15:15",
      },
      {
        title: "WSL2 Setup: Install and Configure Windows Subsystem for Linux",
        duration: "9:27",
      },
      {
        title:
          "Hermes Agent local Installation: Mac, Linux, and Windows with WSL2 Ubuntu",
        duration: "13:02",
      },
      {
        title: "Basic Hermes Commands, Changing Models, and Dashboard",
        duration: "8:04",
      },
      {
        title: "Recap",
        duration: "1:39",
      },
    ],
  },
  {
    title: "Hermes Basics and Intermediate Use Cases",
    lectures: [
      {
        title: "Section Overview",
        duration: "2:33",
      },
      {
        title: "Hermes Agent Documentation Overview",
        duration: "8:03",
      },
      {
        title: "Tools: First Tests with Browser Automation",
        duration: "6:05",
      },
      {
        title: "How to Onboard Your Agent and Manage the user.md File",
        duration: "5:16",
      },
      {
        title: "Manage VPS Files in VS Code with SSH",
        duration: "5:01",
      },
      {
        title: "Skills: How Hermes Uses Skills to Perform Tasks",
        duration: "8:09",
      },
      {
        title: "Context Management and Session Management: Saving Tokens",
        duration: "8:42",
      },
      {
        title: "Slash Commands, Reasoning, and Permissions",
        duration: "7:32",
      },
      {
        title: "Hermes Automation: Running Scheduled Tasks with Cron Jobs",
        duration: "4:44",
      },
      {
        title:
          "Hermes Memory and Personality: Managing user.md, Memory, and soul.md",
        duration: "6:17",
      },
      {
        title: "Hermes Voice Mode: Enable Speech Input and Output",
        duration: "9:04",
      },
      {
        title: "Recap",
        duration: "7:28",
      },
    ],
  },
  {
    title:
      "Hermes Advanced: Create Skills, MCP Servers, CLIs, Plugins, Hooks & RL Training",
    lectures: [
      {
        title: "Section Overview",
        duration: "2:59",
      },
      {
        title: "Build Custom Hermes Skills for Your Agent",
        duration: "23:58",
      },
      {
        title: "Selfimproving Skills",
        duration: "3:36",
      },
      {
        title: "Hermes Skills for ComfyUI: Automate and Manage Workflows",
        duration: "9:18",
      },
      {
        title: "MCP Server in Hermes: An Example with Supabase and SQL",
        duration: "7:58",
      },
      {
        title: "Plugins: Bundle Skills, Tools, Hooks, and CLIs",
        duration: "3:43",
      },
      {
        title: "Hooks for Automation and Logging",
        duration: "6:21",
      },
      {
        title:
          "CLI Integration in Hermes Agent: An Example with the GitHub CLI",
        duration: "6:50",
      },
      {
        title:
          "RL Training with Hermes Agent: Reinforcement Learning and LoRA Creation",
        duration: "7:44",
      },
      {
        title: "Recap",
        duration: "8:30",
      },
    ],
  },
  {
    title: "Hermes Desktop",
    lectures: [
      {
        title: "Hermes Desktop: Everything that you need to know",
        duration: "21:52",
      },
    ],
  },
  {
    title: "Hermes Pro: Subagents, Parallel Agents, Kanban, and More Use Cases",
    lectures: [
      {
        title: "Section Overview",
        duration: "1:36",
      },
      {
        title: "Hermes for Fitness and Nutrition",
        duration: "5:09",
      },
      {
        title: "Hermes Video Editing Workflow: How My Agent Edited This Course",
        duration: "6:20",
      },
      {
        title: "Manage Mails, Calender and 8.000 Apps with the Zapier MCP",
        duration: "4:56",
      },
      {
        title:
          "Hermes Smart Home Assistant: Control Devices, Cameras, and Automations",
        duration: "3:59",
      },
      {
        title:
          "Coding: Subagents, Monitor Repos, Delegate to Claude Code, Codex & Claude Design",
        duration: "11:38",
      },
      {
        title: "Subagents, Multi-Agent Delegation, and Kanban Boards",
        duration: "13:04",
      },
      {
        title:
          "Obsidian and LLM Wiki as RAG Database with Hermes Agent and Claude Code",
        duration: "24:21",
      },
      {
        title: "Local Models with Ollama for Hermes Agent",
        duration: "4:47",
      },
      {
        title: "More Use Cases",
        duration: "2:35",
      },
      {
        title: "Recap",
        duration: "4:54",
      },
    ],
  },
  {
    title: "Security and What's Next",
    lectures: [
      {
        title: "Welcome in the last Section",
        duration: "0:28",
      },
      {
        title:
          "Attack Vectors for Agents. Jailbreaks, Prompt Injections, and More",
        duration: "8:47",
      },
      {
        title:
          "AI Agent Security: Tool Poisoning, MCP Rug Pulls, and Hidden Risks",
        duration: "17:12",
      },
      {
        title: "Recap and what is next",
        duration: "8:32",
      },
      {
        title: "Bonus",
        duration: "0:10",
      },
    ],
  },
];
