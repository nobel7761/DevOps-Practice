// Outline-only snapshot of "FORWARD DEPLOYED ENGINEERING CAREER TRACK" pulled from poridhi.io's course
// roadmap API. The account used to fetch this is not enrolled in this course,
// so poridhi.io only exposes the syllabus structure (milestones/modules/
// content titles) — lab ids, video urls, and durations are gated behind
// enrollment and are therefore left unset below (see CourseSummary.notEnrolled).

import type { CourseSummary } from "@/lib/data/course-modules";

export const forwardDeployedEngineeringCourse: CourseSummary = {
  courseTitle: "FORWARD DEPLOYED ENGINEERING CAREER TRACK",
  notEnrolled: true,
  milestones: [
    {
      id: "e5dd174c-291d-4ca8-a42f-aec63bd35530",
      title: "Agentic Software Engineering",
      modules: [
        {
          id: "e641fad2-5581-49cd-b1f3-1113d2b1e98a",
          title: "Your First Agentic Workflow",
          contentCounts: {
            pre_class: 3,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Introduction to Claude Code",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Controlling the agent: permissions, memory, and conventions",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Prompting for agents and managing context",
              completed: false,
            },
            {
              type: "lab",
              title: "Getting Started with Claude Code",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Automating Code Standards with CLAUDE.md",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Agentic Workflows Under the Hood",
              completed: false,
            },
          ],
        },
        {
          id: "31dee0f0-674f-43a0-adc6-3de3c2dac63b",
          title: "Context Management for Agentic Systems",
          contentCounts: {
            pre_class: 2,
            lab: 3,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "The context window as a system resource",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Managing and extending context across sessions",
              completed: false,
            },
            {
              type: "lab",
              title: "Token Usage Analysis",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Session Workflow Design",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Context Lifecycle Management",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing for Context Constraints",
              completed: false,
            },
          ],
        },
        {
          id: "47627a62-a9c2-4859-af46-0731b2da4fc8",
          title: "Tool Use, Skills & the Agentic Loop",
          contentCounts: {
            pre_class: 2,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 5, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "How Claude Code uses tools internally",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Building reusable Skills",
              completed: false,
            },
            {
              type: "lab",
              title: "Tracing the Agentic Loop",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Building a Reusable Workflow Skill",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Tool Use and Skill Design",
              completed: false,
            },
          ],
        },
        {
          id: "cd6a2e45-219e-4bd4-bba5-5794bd0fcba2",
          title: "Subagent Architecture & Delegation",
          contentCounts: {
            pre_class: 2,
            lab: 3,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Single-Agent Limits and the Power of Delegation",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Designing and orchestrating specialized agents",
              completed: false,
            },
            {
              type: "lab",
              title: "Building a Multi-Agent Code Review System",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Reducing Context Costs with Subagent Delegation",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Isolating Data-Intensive Work with Subagents",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Multi-Agent System Design",
              completed: false,
            },
          ],
        },
        {
          id: "6743bb01-3858-48b0-a30f-73fbdfe14f70",
          title: "Guardrails with Hooks & MCP Servers",
          contentCounts: {
            pre_class: 2,
            lab: 3,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Hooks: intercepting and controlling agent actions",
              completed: false,
            },
            {
              type: "pre_class",
              title: "MCP servers: extending Claude Code safely",
              completed: false,
            },
            {
              type: "lab",
              title: " Building Hook-Based Safety Guardrails",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Secure Database Access with an MCP Server",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Automated Incident Detection with Hooks and MCP",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Guardrails and Safe Agent Design",
              completed: false,
            },
          ],
        },
        {
          id: "c0ff5a5f-2a4d-410c-936c-4e8c3ba84c79",
          title: "Docker and Kubernetes in Agentic Workflows",
          contentCounts: {
            pre_class: 3,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 8, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "AI-assisted Dockerization",
              completed: false,
            },
            {
              type: "pre_class",
              title: " Kubernetes fundamentals and AI-assisted deployment",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Infrastructure MCP servers",
              completed: false,
            },
            {
              type: "lab",
              title: "Application Containerization Workflow",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Kubernetes Application Deployment",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Cluster Management and Recovery",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Debugging Containerized Applications",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Infrastructure Agents and Container Debugging",
              completed: false,
            },
          ],
        },
        {
          id: "740ad790-d42f-4d95-9da4-7ba00a09f375",
          title: "Multi-Agent Platform: CI/CD, Integration & Production",
          contentCounts: {
            pre_class: 3,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Designing multi-agent systems at scale",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Agent-powered CI/CD",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Production operations, safety, and ethics",
              completed: false,
            },
            {
              type: "lab",
              title: "The Self-Healing CI Pipeline",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "The Full Stack Agent Platform",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Production Multi-Agent Systems",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "46b663ba-2bfe-4eb6-a47d-05fba1d53893",
      title: "Building Claude Code From Scratch",
      modules: [
        {
          id: "f52c0beb-905d-47b6-b1ae-96b0907e33ea",
          title: "The Core Engine",
          contentCounts: {
            pre_class: 2,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 5, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "The provider layer and the API client",
              completed: false,
            },
            {
              type: "pre_class",
              title: "The message protocol and the agentic loop",
              completed: false,
            },
            {
              type: "lab",
              title: "Building the Provider Layer and Streaming Client",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "The Agentic REPL Skeleton",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "The Core Engine",
              completed: false,
            },
          ],
        },
        {
          id: "100341ef-6852-4da3-b821-50acac66bb9e",
          title: "The Tool-Use Protocol",
          contentCounts: {
            pre_class: 2,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 5, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Tool schema design and execution",
              completed: false,
            },
            {
              type: "pre_class",
              title: "The multi-turn loop and tool call parsing",
              completed: false,
            },
            {
              type: "lab",
              title: "Implementing Bash and FileRead",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "The Multi-Turn Agentic Loop",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "The Tool-Use Protocol",
              completed: false,
            },
          ],
        },
        {
          id: "b3e5cc32-ab68-47be-8832-63e547426b5d",
          title: "The Tool System",
          contentCounts: {
            pre_class: 2,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 5, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Tool factory and the Tool abstraction",
              completed: false,
            },
            {
              type: "pre_class",
              title: "File editing, parallel execution, and search tools",
              completed: false,
            },
            {
              type: "lab",
              title: "Building the Tool Factory and Permission Gate",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Parallel Tool Execution and Search Operations",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Tool System Design",
              completed: false,
            },
          ],
        },
        {
          id: "b2aa6a99-d1f1-4131-a380-649501fa3409",
          title: "MCP: Extending the Tool Surface",
          contentCounts: {
            pre_class: 2,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 5, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "The MCP protocol and architecture",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Building and consuming MCP servers",
              completed: false,
            },
            {
              type: "lab",
              title: "Building a Toy MCP Server",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "The MCP Client and Dynamic Tool Discovery",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "MCP and Tool Protocol Design",
              completed: false,
            },
          ],
        },
        {
          id: "2bf4e8c9-0cc7-4eda-b051-4cfbff01fb18",
          title: "Context Management",
          contentCounts: {
            pre_class: 2,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 5, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "The context window as a finite resource",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Auto-compact: summarization and compact boundaries",
              completed: false,
            },
            {
              type: "lab",
              title: "Token Budgeting and Auto-Compact",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Compact Boundaries and Recovery",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Context Management Design",
              completed: false,
            },
          ],
        },
        {
          id: "5a345ee9-3686-4715-951b-cf0add0af93c",
          title: "Memory Management",
          contentCounts: {
            pre_class: 4,
            lab: 3,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 8, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "The CLAUDE.md hierarchy and context injection",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Conditional/nested memory and lazy context injection",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Auto-memory: MEMORY.md index and typed topic files",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Session memory extraction",
              completed: false,
            },
            {
              type: "lab",
              title: "CLAUDE.md Hierarchy and Conditional Rules",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "MEMORY.md Index and Typed Topic Files",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Session Memory Extraction",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Memory System Design",
              completed: false,
            },
          ],
        },
        {
          id: "13bec4c8-de4b-4583-8ec4-4eb9175e2940",
          title: "Terminal UI and the Full Loop",
          contentCounts: {
            pre_class: 2,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 5, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Terminal rendering and input handling",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Startup sequence, slash commands, and the full integration",
              completed: false,
            },
            {
              type: "lab",
              title: "Terminal UI and Streaming Output",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Slash Commands and the Full Startup Sequence",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Terminal UI and Integration",
              completed: false,
            },
          ],
        },
        {
          id: "0918fc39-85d7-4801-897d-71107f9c0338",
          title: "Capstone: The Simplified Claude Code",
          contentCounts: {
            pre_class: 2,
            lab: 3,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "System prompt design and the orchestration layer",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Session persistence, packaging, and production hardening",
              completed: false,
            },
            {
              type: "lab",
              title: "System Prompts, Session Resume, and Full Assembly",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "The End-to-End Development Session",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Packaging, Testing, and Distribution",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: " System Design Review",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "790c6ce7-ffa3-4fba-b4ac-ce370208a7c9",
      title: "Agentic System Design",
      modules: [
        {
          id: "2d492ab7-4a44-45ca-812e-36741ae84573",
          title: "Agentic System Design Foundations",
          contentCounts: {
            pre_class: 2,
            lab: 3,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Multi-agent architecture patterns and orchestration",
              completed: false,
            },
            {
              type: "pre_class",
              title: " Shared memory, context economics, and observability",
              completed: false,
            },
            {
              type: "lab",
              title: "Design and Evaluate Multi-Agent Architectures",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Building a Shared Memory Layer for Multi-Agent Systems",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Instrumenting and Debugging Multi-Agent Pipelines",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Architecting a Multi-Agent System",
              completed: false,
            },
          ],
        },
        {
          id: "d9b02069-a12c-46a3-a3d2-a5de64a493dd",
          title: "SRE & Production Agent Design",
          contentCounts: {
            pre_class: 2,
            lab: 3,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Incident response lifecycle and alert triage",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Root cause analysis and observability integration",
              completed: false,
            },
            {
              type: "lab",
              title: " Context-Aware Alert Triage System",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Distributed Root Cause Analysis System",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Incident Response Automation Agent",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing a Production Incident Response Agent",
              completed: false,
            },
          ],
        },
        {
          id: "b109f28d-043f-4e4b-9ffd-a77c767fc583",
          title: "Designing Log Intelligence Systems with LLMs",
          contentCounts: {
            pre_class: 2,
            lab: 3,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Log parsing: traditional vs. LLM-based approaches",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Caching, streaming, and production trade-offs",
              completed: false,
            },
            {
              type: "lab",
              title: "Designing an LLM Log Parser with Intelligent Caching",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Streaming Log Analysis with Anomaly Detection",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Optimizing LLM Log Parsing for Production Cost",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing a Production Log Intelligence System",
              completed: false,
            },
          ],
        },
        {
          id: "1ed0a13b-d079-4bd9-aacd-424711b72f9a",
          title: "API-Driven Agentic Systems & Observability Integration",
          contentCounts: {
            pre_class: 2,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 5, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "API design for agentic systems",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Control planes, streaming, and resilience patterns",
              completed: false,
            },
            {
              type: "lab",
              title: "Build an Observability API for Metrics and Logs",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Design an API Control Plane to Manage and Monitor Agents",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing an Agent Control Plane",
              completed: false,
            },
          ],
        },
        {
          id: "5b3caf87-a5bc-4e00-9014-3d57261da40b",
          title: "Secure System Design for Agentic Platforms",
          contentCounts: {
            pre_class: 2,
            lab: 3,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Authentication, authorization, and least privilege",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Data security, API hardening, and guardrails",
              completed: false,
            },
            {
              type: "lab",
              title: "Building a Role-Based Access Gateway for Agent Systems",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Designing Immutable Audit Logs for Agentic Systems",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Attacking and Hardening Your Agent Security Layer",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Secure Agent System Design",
              completed: false,
            },
          ],
        },
        {
          id: "9ddeed31-7f39-430b-ad16-4cafe072e20c",
          title: "Capstone: Full Agentic SRE Platform",
          contentCounts: {
            pre_class: 2,
            lab: 1,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 4, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "System composition and data flow design",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Failure modes and resilience patterns",
              completed: false,
            },
            {
              type: "lab",
              title: "Assemble and Validate a Complete Agentic SRE System",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Capstone System Design Review",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "5dd0ef8c-fd78-4649-a389-5c240d3377bc",
      title: "Platform Engineering",
      modules: [
        {
          id: "21cc2de6-f892-401b-8b0d-d892d6e3a746",
          title: "Infrastructure Provisioning",
          contentCounts: {
            pre_class: 2,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 5, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Infrastructure as code and Kubernetes provisioning",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Production observability infrastructure",
              completed: false,
            },
            {
              type: "lab",
              title: "Provisioning the Platform Infrastructure",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deploying the Production Observability Stack",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Infrastructure as Code and Observability Architecture",
              completed: false,
            },
          ],
        },
        {
          id: "b342b72b-dd67-4708-bd6f-1d819c679878",
          title: "Observability with Distributed Tracing",
          contentCounts: {
            pre_class: 2,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 5, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Distributed tracing fundamentals and OpenTelemetry",
              completed: false,
            },
            {
              type: "pre_class",
              title: "TraceQL and trace-based RCA",
              completed: false,
            },
            {
              type: "lab",
              title: " Instrumenting Services with Distributed Tracing",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Building a Trace-Based RCA Agent",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Distributed Tracing and Trace-Driven Diagnosis",
              completed: false,
            },
          ],
        },
        {
          id: "b42c200f-f5b4-4f48-a16f-fc52cd9cb8b3",
          title: "The Platform API",
          contentCounts: {
            pre_class: 2,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 5, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Unified API hub design and proxying",
              completed: false,
            },
            {
              type: "pre_class",
              title: "RBAC, audit logging, and API security",
              completed: false,
            },
            {
              type: "lab",
              title: "Building the Unified Platform API",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Securing the Platform API with RBAC and Audit Logging",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing a Unified Platform API",
              completed: false,
            },
          ],
        },
        {
          id: "b9d803e2-1d52-41f2-a7d2-4d5128efe723",
          title: "Ops CLI & Platform Automation",
          contentCounts: {
            pre_class: 2,
            lab: 3,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "CLI design and implementation",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Platform automation and MCP integration",
              completed: false,
            },
            {
              type: "lab",
              title: "Building the Ops CLI",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Automating Platform Operations with CI/CD",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Extending Platform Control with an MCP Server",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing a Developer Platform CLI and MCP Integration",
              completed: false,
            },
          ],
        },
        {
          id: "639fe77a-3071-4f18-968d-87a610c51c45",
          title: "Production SRE Agent",
          contentCounts: {
            pre_class: 2,
            lab: 2,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 5, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "SRE agent pipeline and trace-augmented RCA",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Slack integration and incident drill methodology",
              completed: false,
            },
            {
              type: "lab",
              title: "Building the SRE Investigation Pipeline",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "The Incident Drill with Slack Approval Gate",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing a Production SRE Agent",
              completed: false,
            },
          ],
        },
      ],
    },
  ],
};
