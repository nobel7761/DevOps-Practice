// Snapshot of "MASTERING AWS & DEVOPS SEASON 4" course modules, pulled from
// poridhi.io's course roadmap API for the logged-in user's enrolled course.

export type CourseContentType =
  | "lab"
  | "pre_class"
  | "live_class"
  | "ai_interview"
  | "ai_exam"
  | "project_submission";

export interface CourseContentItem {
  type: CourseContentType;
  title: string | null;
  completed: boolean;
  /** Only set for type "lab" with published content; null means not yet provisioned by poridhi.io. */
  labId?: string | null;
}

export interface CourseModule {
  id: string;
  title: string;
  contentCounts: Record<CourseContentType, number>;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  contents: CourseContentItem[];
}

export interface CourseMilestone {
  id: string;
  title: string;
  modules: CourseModule[];
}

export interface CourseSummary {
  courseTitle: string;
  milestones: CourseMilestone[];
}

export interface CourseLocation {
  milestone: CourseMilestone;
  module: CourseModule;
}

export function findModuleLocation(moduleId: string): CourseLocation | null {
  for (const milestone of masteringAwsDevopsSeason4.milestones) {
    const courseModule = milestone.modules.find(
      (candidate) => candidate.id === moduleId,
    );
    if (courseModule) return { milestone, module: courseModule };
  }
  return null;
}

export function findLabLocation(labId: string): CourseLocation | null {
  for (const milestone of masteringAwsDevopsSeason4.milestones) {
    for (const courseModule of milestone.modules) {
      if (
        courseModule.contents.some(
          (content) => content.type === "lab" && content.labId === labId,
        )
      ) {
        return { milestone, module: courseModule };
      }
    }
  }
  return null;
}

export const masteringAwsDevopsSeason4: CourseSummary = {
  courseTitle: "MASTERING AWS & DEVOPS SEASON 4",
  milestones: [
    {
      id: "cae9ca27-b531-4e46-a1d4-1a9c1b1bd3ed",
      title: "Linux, Scripting & Containerization",
      modules: [
        {
          id: "74b6214c-6880-4092-a870-0dd99de179b0",
          title: "Linux Fundamentals",
          contentCounts: {
            lab: 9,
            pre_class: 0,
            live_class: 3,
            ai_interview: 1,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 7, total: 13, percentage: 54 },
          contents: [
            { type: "live_class", title: "Orientation Class", completed: true },
            {
              type: "live_class",
              title: "Linux File System Basics & Navigation",
              completed: true,
            },
            {
              type: "live_class",
              title: "Linux User Management",
              completed: true,
            },
            {
              type: "lab",
              title: "Mastering Linux File System Navigation",
              completed: true,
              labId: "69b1d476bfa7b7946e16bde2",
            },
            {
              type: "lab",
              title: "Linux User and Group Management",
              completed: true,
              labId: "69b1d4fb23b200e2a40fbdd4",
            },
            {
              type: "lab",
              title: "User Account Management in Linux",
              completed: true,
              labId: "69b1d50523b200e2a40fbddb",
            },
            {
              type: "lab",
              title: "Managing Sudo Access for System Administration",
              completed: true,
              labId: "69b1d50d23b200e2a40fbde2",
            },
            {
              type: "lab",
              title: "Understanding /etc/skel/ in Linux",
              completed: false,
              labId: "69b1d5184a49372ba788301e",
            },
            {
              type: "lab",
              title: "Linux User Modification",
              completed: false,
              labId: "69b1d51f4a49372ba7883025",
            },
            {
              type: "lab",
              title: "Mastering Linux File Permissions",
              completed: false,
              labId: "69b1d5254a49372ba788302c",
            },
            {
              type: "lab",
              title: "Linux Performance Analysis",
              completed: false,
              labId: "69b1d52d4a49372ba7883033",
            },
            {
              type: "lab",
              title: "System Logging and Monitoring",
              completed: false,
              labId: "69b1d5334a49372ba7883052",
            },
            {
              type: "ai_interview",
              title: "Linux User & Access Management",
              completed: false,
            },
          ],
        },
        {
          id: "db3595de-7f99-4c5c-a2c6-3997b51f1715",
          title: "Text Processing & Regular Expressions",
          contentCounts: {
            lab: 5,
            pre_class: 0,
            live_class: 4,
            ai_interview: 1,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 10, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Introduction To Linux Pipes & Grep",
              completed: false,
            },
            {
              type: "live_class",
              title: "Introduction To Text Processing",
              completed: false,
            },
            {
              type: "live_class",
              title: "Introduction To sed",
              completed: false,
            },
            {
              type: "live_class",
              title: "Introduction To awk",
              completed: false,
            },
            {
              type: "lab",
              title: "Bulk File Editing with sed",
              completed: false,
              labId: "69c4e57723b200e2a411dddc",
            },
            {
              type: "lab",
              title: "Pattern Matching with Regular Expressions",
              completed: false,
              labId: "69c4e58823b200e2a411dde3",
            },
            {
              type: "lab",
              title: "Linux Pipes and I/O Redirection",
              completed: false,
              labId: "69c284a9bfa7b7946e189979",
            },
            {
              type: "lab",
              title: "Text Processing with grep, sed, and awk",
              completed: false,
              labId: "69c284fe23b200e2a41199b0",
            },
            {
              type: "lab",
              title: "Log Analysis with awk and grep",
              completed: false,
              labId: "69c2851a23b200e2a41199da",
            },
            {
              type: "ai_interview",
              title: "Linux Log Processing Tasks",
              completed: false,
            },
          ],
        },
        {
          id: "de4ef374-b579-49ad-add9-810b3e1dc708",
          title: "Mininet",
          contentCounts: {
            lab: 8,
            pre_class: 8,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 16, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Software Defined Networking (SDN)",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Configure and Manage Network Flows at Different Layers",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Layer 2 Traffic Forwarding Setup in Mininet with OpenFlow",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Layer 3 Traffic Forwarding Setup in Mininet with OpenFlow",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Layer 4 Traffic Forwarding Setup in Mininet with OpenFlow",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Simulating a Two-Subnet Network Topology in Mininet with One Switch",
              completed: false,
            },
            {
              type: "pre_class",
              title: "ARP Fundamentals and Advanced Topologies with Mininet",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Simulating VLAN Networks with Mininet",
              completed: false,
            },
            {
              type: "lab",
              title: "Software Defined Networking (SDN)",
              completed: false,
              labId: "69e0e99023b200e2a4159f0d",
            },
            {
              type: "lab",
              title: "Configure and manage network flows at different layers",
              completed: false,
              labId: "69e0e99023b200e2a4159f11",
            },
            {
              type: "lab",
              title:
                "Layer 2 Traffic Forwarding Setup in Mininet with OpenFlow",
              completed: false,
              labId: "69e0e99023b200e2a4159f13",
            },
            {
              type: "lab",
              title:
                "Layer 3 Traffic Forwarding Setup in Mininet with OpenFlow",
              completed: false,
              labId: "69e0e99023b200e2a4159f15",
            },
            {
              type: "lab",
              title:
                "Layer 4 Traffic Forwarding Setup in Mininet with OpenFlow",
              completed: false,
              labId: "69e0e99023b200e2a4159f17",
            },
            {
              type: "lab",
              title:
                "Simulating a Two-Subnet Network Topology in Mininet with One Switch",
              completed: false,
              labId: "69e0e99023b200e2a4159f19",
            },
            {
              type: "lab",
              title: "ARP Fundamentals and Advanced Topologies with Mininet",
              completed: false,
              labId: "69e0e99023b200e2a4159f1b",
            },
            {
              type: "lab",
              title: "Simulating VLAN Networks with Mininet",
              completed: false,
              labId: "69e0e99023b200e2a4159f1d",
            },
          ],
        },
        {
          id: "be24673c-6a00-4ea7-b5f1-8316d7f85ab4",
          title: "Linux Networking & Security",
          contentCounts: {
            lab: 5,
            pre_class: 0,
            live_class: 3,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 8, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Introduction To Linux Networking",
              completed: false,
            },
            {
              type: "live_class",
              title: "Linux Networking Basic Part 1",
              completed: false,
            },
            {
              type: "live_class",
              title: "Linux Networking Basic Part 2",
              completed: false,
            },
            {
              type: "lab",
              title: "Firewall Management with ufw",
              completed: false,
              labId: "69d2157cbfa7b7946e1a97e0",
            },
            {
              type: "lab",
              title: "Packet Capture and Traffic Analysis with tcpdump",
              completed: false,
              labId: "69d21575bfa7b7946e1a97d9",
            },
            {
              type: "lab",
              title: "Connection Monitoring with netstat and ss",
              completed: false,
              labId: "69d2156dbfa7b7946e1a97d2",
            },
            {
              type: "lab",
              title: "Network Interface & Routing Configuration",
              completed: false,
              labId: "69d2154823b200e2a4139708",
            },
            {
              type: "lab",
              title: "Advanced Firewall Rules with iptables",
              completed: false,
              labId: "69d21582bfa7b7946e1a97e7",
            },
          ],
        },
        {
          id: "56af25b2-69da-4ccd-89f1-766e6c371401",
          title: "Bash Scripting & Automation",
          contentCounts: {
            lab: 9,
            pre_class: 0,
            live_class: 2,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "lab",
              title: "Introduction To jq",
              completed: false,
              labId: "69b1e4a54a49372ba7883528",
            },
            {
              type: "lab",
              title: "Introduction to Bash Scripting",
              completed: false,
              labId: "69b1e4a54a49372ba788352a",
            },
            {
              type: "lab",
              title: "Variables in Bash Scripting",
              completed: false,
              labId: "69b1e4a54a49372ba788352c",
            },
            {
              type: "lab",
              title: "Arrays in Bash Scripting",
              completed: false,
              labId: "69b1e4a54a49372ba788352e",
            },
            {
              type: "lab",
              title: "String Operations in Bash Scripting",
              completed: false,
              labId: "69b1e4a54a49372ba7883530",
            },
            {
              type: "lab",
              title: "Conditional Statements in Bash Scripting",
              completed: false,
              labId: "69b1e4a54a49372ba7883532",
            },
            {
              type: "lab",
              title: "Loops in Bash Scripting",
              completed: false,
              labId: "69b1e4a54a49372ba7883534",
            },
            {
              type: "lab",
              title: "Functions in Bash Scripting",
              completed: false,
              labId: "69b1e4a54a49372ba7883536",
            },
            {
              type: "lab",
              title: "Mastering Redirection in Bash Scripting",
              completed: false,
              labId: "69b1e4a54a49372ba7883538",
            },
            {
              type: "live_class",
              title: "Introduction To Bash Scripting",
              completed: false,
            },
            {
              type: "live_class",
              title: "Bash Scripting & Automation",
              completed: false,
            },
          ],
        },
        {
          id: "3537a6a8-ecc9-41b6-827f-99b7b46cdfea",
          title: "Linux & Container Network Namespace Fundamentals",
          contentCounts: {
            lab: 0,
            pre_class: 8,
            live_class: 2,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 10, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Container Networking",
              completed: false,
            },
            {
              type: "live_class",
              title: "Egress Networking",
              completed: false,
            },
            {
              type: "pre_class",
              title: "CN-lab-01 NETWORK NAMESPACE INSPECTING",
              completed: false,
            },
            {
              type: "pre_class",
              title: "CN-lab-02 CONNECT NETWORK NS TO HOST",
              completed: false,
            },
            {
              type: "pre_class",
              title: "CN-lab-03.1 CONNECT NETWORK NS TO ROOT",
              completed: false,
            },
            {
              type: "pre_class",
              title: "CN-lab-03.2 CONNECT NETWORK NS TO ROOT",
              completed: false,
            },
            {
              type: "pre_class",
              title: "CN-lab-04 EGRESS TRAFFIC",
              completed: false,
            },
            {
              type: "pre_class",
              title: "CN-lab-05 CONNECT TWO CUSTOM NETWORK NS",
              completed: false,
            },
            {
              type: "pre_class",
              title: "CN-lab-06 BRIDGE NETWORKING AMONG NAMESPACES",
              completed: false,
            },
            {
              type: "pre_class",
              title: "CN-lab-07 PROCESS COMMUNICATION BETWEEN NAMESPACES",
              completed: false,
            },
          ],
        },
        {
          id: "1c70d42d-1d77-4515-baaf-6dbbe44c8808",
          title: "Overlay Networking & Network Simulation",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 1,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 1, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Overlay Networking & Network Simulation",
              completed: false,
            },
          ],
        },
        {
          id: "e92d0961-5397-408f-ae9d-3be596d2dc72",
          title: "Docker Fundamentals & Container Lifecycle",
          contentCounts: {
            lab: 5,
            pre_class: 0,
            live_class: 1,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Docker Architecture and its Components",
              completed: false,
            },
            {
              type: "lab",
              title: "Running an NGINX Web Server in a Docker Container",
              completed: false,
              labId: "6a43e3e823b200e2a424b4b5",
            },
            {
              type: "lab",
              title: "The Lifecycle of a Container",
              completed: false,
              labId: "6a43e3e823b200e2a424b4b7",
            },
            {
              type: "lab",
              title: "Differentiating Docker stop vs Kill",
              completed: false,
              labId: "6a43e3e823b200e2a424b4b9",
            },
            {
              type: "lab",
              title: "Docker Container Restart Policies",
              completed: false,
              labId: "6a43e3e823b200e2a424b4bb",
            },
            {
              type: "lab",
              title: "Automatic Restart of Docker Containers",
              completed: false,
              labId: "6a43e3e823b200e2a424b4bd",
            },
          ],
        },
        {
          id: "18703e83-2c22-432d-a4d0-30bb35f41106",
          title: "Docker Networking & Storage",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 2,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 2, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Docker Storage and Volume",
              completed: false,
            },
            {
              type: "live_class",
              title: "Docker networking",
              completed: false,
            },
          ],
        },
        {
          id: "a4773e07-b433-49ec-a3f6-84ef432d82e2",
          title: "Docker Image Management & Optimization",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 1,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 1, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title:
                "Docker Registry, Multi Staging Dockerfile & Docker Compose .mp4",
              completed: false,
            },
          ],
        },
        {
          id: "7f6f8705-54e9-4deb-ab3f-231989257010",
          title: "Web Applications & Multi-Container Deployments",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Docker for Web Applications",
              completed: false,
            },
            {
              type: "live_class",
              title: "Introduction to Docker Compose",
              completed: false,
            },
            {
              type: "live_class",
              title: "Deploying Multi-Container Applications",
              completed: false,
            },
            {
              type: "lab",
              title: "Running an NGINX Web Server in Docker",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deploying a Monitored NGINX Web Server",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Setting Up a Host-Like Environment",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Keeping Containers Running with Supervisor",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Containerizing a Single-Container App",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Multi-stage Builds with Node.js",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Introduction to Docker Compose",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deploying Multi-Container Applications",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Multi-Container App with Docker Compose",
              completed: false,
            },
          ],
        },
        {
          id: "dd38a68b-72b2-446e-aba7-dacc74d70304",
          title: "Makefile",
          contentCounts: {
            lab: 1,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 1, percentage: 0 },
          contents: [
            {
              type: "lab",
              title: "Makefile for Docker",
              completed: false,
              labId: "6a43e9f1bfa7b7946e2ba535",
            },
          ],
        },
        {
          id: "a70492f6-2eb2-421a-a3e7-706576f66b49",
          title: "Micro-service With Docker",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 1,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 1, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Docker Networking & Microservice",
              completed: false,
            },
          ],
        },
        {
          id: "a69d2add-d1bd-45e3-9a56-d930a05ebe40",
          title: "Rec- Basic Docker Concepts",
          contentCounts: {
            lab: 3,
            pre_class: 3,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 6, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Running an NGINX Web Server in a Docker Container",
              completed: false,
            },
            {
              type: "lab",
              title: "Running an NGINX Web Server in a Docker Container",
              completed: false,
              labId: "6a43e3e823b200e2a424b4b5",
            },
            {
              type: "pre_class",
              title: "The Lifecycle of a Container",
              completed: false,
            },
            {
              type: "lab",
              title: "The Lifecycle of a Container",
              completed: false,
              labId: "6a43e3e823b200e2a424b4b7",
            },
            {
              type: "pre_class",
              title: "Docker Container Restart Policies",
              completed: false,
            },
            {
              type: "lab",
              title: "Docker Container Restart Policies",
              completed: false,
              labId: "6a43e3e823b200e2a424b4bb",
            },
          ],
        },
        {
          id: "6ccd823d-e877-4b51-96c7-c850c6e5121a",
          title: "Rec- Docker CLI and Image Management",
          contentCounts: {
            lab: 2,
            pre_class: 2,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 4, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Filtering Docker Images",
              completed: false,
            },
            {
              type: "lab",
              title: "Filtering Docker Images",
              completed: false,
              labId: "6a43e3fbbfa7b7946e2ba3b2",
            },
            {
              type: "lab",
              title: "Create own Docker image",
              completed: false,
              labId: "6a43e3fbbfa7b7946e2ba3b6",
            },
            {
              type: "pre_class",
              title: "Create Own Docker Image",
              completed: false,
            },
          ],
        },
        {
          id: "3e7a9c36-543a-4e08-9cc4-b2ee1263f11d",
          title: "Rec- Docker Container Storage",
          contentCounts: {
            lab: 2,
            pre_class: 2,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 4, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Docker Bind Mounts",
              completed: false,
            },
            {
              type: "lab",
              title: "Docker Bind Mounts",
              completed: false,
              labId: "6a43e40fbfa7b7946e2ba3cd",
            },
            {
              type: "pre_class",
              title: "Working with Docker Volumes",
              completed: false,
            },
            {
              type: "lab",
              title: "Working with Docker Volumes",
              completed: false,
              labId: "6a43e40fbfa7b7946e2ba3d1",
            },
          ],
        },
        {
          id: "774ef344-c3b1-4dc8-b9ba-ad26e078e563",
          title: "Rec- Docker Container Networking",
          contentCounts: {
            lab: 1,
            pre_class: 1,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 2, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Communication Between Containers in a Custom Bridge Network",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Communication Between Containers in a Custom Bridge Network",
              completed: false,
              labId: "6a64aa92bfa7b7946e2f88ba",
            },
          ],
        },
        {
          id: "da9344c3-d8e4-4b01-b45f-7e3ea965a7e8",
          title: "Rec- Security & Container Configuration",
          contentCounts: {
            lab: 2,
            pre_class: 2,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 4, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Setting Up a Host-Like Environment Using Docker Containers",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Setting Up a Host-Like Environment Using Docker Containers",
              completed: false,
              labId: "6a64ac25bfa7b7946e2f8907",
            },
            {
              type: "pre_class",
              title: "Keeping Containers Running with Supervisor",
              completed: false,
            },
            {
              type: "lab",
              title: "Keeping Containers Running with Supervisor",
              completed: false,
              labId: "6a64ac25bfa7b7946e2f890b",
            },
          ],
        },
        {
          id: "206c1ec8-845f-4e60-b68b-ef2d63c678ed",
          title: "Rec- Docker Image Creation & Optimization",
          contentCounts: {
            lab: 4,
            pre_class: 4,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 8, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Building Docker Images from a Container",
              completed: false,
            },
            {
              type: "lab",
              title: "Building Docker Images from a Container",
              completed: false,
              labId: "6a43e9c9bfa7b7946e2ba4fc",
            },
            {
              type: "pre_class",
              title: "Reviewing Filesystem Changes",
              completed: false,
            },
            {
              type: "lab",
              title: "Reviewing Filesystem Changes",
              completed: false,
              labId: "6a43e9c9bfa7b7946e2ba500",
            },
            {
              type: "pre_class",
              title: "Exploring Docker Image Layers and Size Management",
              completed: false,
            },
            {
              type: "lab",
              title: "Exploring Docker Image Layers and Size Management",
              completed: false,
              labId: "6a43e9c9bfa7b7946e2ba504",
            },
            {
              type: "pre_class",
              title: "Extracting Container Image Filesystem Using Docker",
              completed: false,
            },
            {
              type: "lab",
              title: "Extracting Container Image Filesystem Using Docker",
              completed: false,
              labId: "6a43e9c9bfa7b7946e2ba508",
            },
          ],
        },
        {
          id: "57cfdad8-19ab-4b75-bcdb-6248b914f346",
          title: "Rec- Dockerizing Applications",
          contentCounts: {
            lab: 1,
            pre_class: 1,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 2, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Containerize  a  Single-Container App",
              completed: false,
            },
            {
              type: "lab",
              title: "Containerize a Single-Container App",
              completed: false,
              labId: "6a43e9debfa7b7946e2ba51a",
            },
          ],
        },
        {
          id: "001a8951-48fe-436d-8aa4-4bfa4c2e5cae",
          title: "Rec- Docker Compose",
          contentCounts: {
            lab: 1,
            pre_class: 1,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 2, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Introduction to Docker Compose",
              completed: false,
            },
            {
              type: "lab",
              title: "Intro to Docker Compose",
              completed: false,
              labId: "6a43e42723b200e2a424b50a",
            },
          ],
        },
        {
          id: "80a092bd-5074-4920-9851-a82dc000ffb6",
          title: "Rec- Monitoring and Logging",
          contentCounts: {
            lab: 1,
            pre_class: 1,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 2, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Deploying a Monitored NGINX Web Server Using Docker",
              completed: false,
            },
            {
              type: "lab",
              title: "Deploying a Monitored NGINX Web Server Using Docker",
              completed: false,
              labId: "6a43e9e7bfa7b7946e2ba529",
            },
          ],
        },
        {
          id: "3483c17d-d97a-4393-86dc-f9cc62731237",
          title: "Rec- Microservices with Docker",
          contentCounts: {
            lab: 1,
            pre_class: 1,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 2, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "E-commerce Microservices with Docker.",
              completed: false,
            },
            {
              type: "lab",
              title: "E-commerce Microservices with Docker",
              completed: false,
              labId: "6a43e9fb23b200e2a424b5f3",
            },
          ],
        },
      ],
    },
    {
      id: "1c984ef0-92aa-44d4-929d-ad3e8718bbd3",
      title: "Cloud Fundamentals with AWS",
      modules: [
        {
          id: "68cd1ea6-a590-42bc-9af3-7a71c5ff72fb",
          title: "AWS EC2 & Storage Fundamentals",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 1,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 1, total: 1, percentage: 100 },
          contents: [
            {
              type: "live_class",
              title: "AWS Fundamentals and Resources",
              completed: true,
            },
          ],
        },
        {
          id: "48470d1f-5007-4fad-891c-7d8829e67194",
          title: "VPC Design & Network Architecture",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 1,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 1, percentage: 0 },
          contents: [
            { type: "live_class", title: "AWS Networking", completed: false },
          ],
        },
        {
          id: "28c03794-d893-4137-b6a5-18c46f5e653c",
          title: "Application Deployment on EC2 with systemd",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 1,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 1, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "EC2 Provision and SystemD",
              completed: false,
            },
          ],
        },
        {
          id: "15c9a84d-67fb-4963-b545-7411c41e98a2",
          title: "AWS Networking Rec",
          contentCounts: {
            lab: 8,
            pre_class: 9,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 17, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Launch An Ec2 Instance In A Virtual Private Cloud (VPC) -Lab-01",
              completed: false,
            },
            {
              type: "lab",
              title: "Launch An Ec2 Instance In A Virtual Private Cloud (vpc)",
              completed: false,
              labId: "6ab51651bfa7b7946e38e184",
            },
            {
              type: "pre_class",
              title: "Deploying a Bastion Server in a Public Subnet -Lab-02",
              completed: false,
            },
            {
              type: "lab",
              title: "Deploying a Bastion Server in a Public Subnet",
              completed: false,
              labId: "6ab51651bfa7b7946e38e186",
            },
            {
              type: "pre_class",
              title: "Creating and Configuring a Secure AWS VPC -Lab-03",
              completed: false,
            },
            {
              type: "lab",
              title: "Creating and Configuring a Secure AWS VPC",
              completed: false,
              labId: "6ab51651bfa7b7946e38e188",
            },
            {
              type: "pre_class",
              title:
                "Create a Secure SSH connection between a Bastion Server and a Private Instance -Lab-04",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Create a Secure SSH connection between a Bastion Server and a Private Instance",
              completed: false,
              labId: "6ab51651bfa7b7946e38e18a",
            },
            {
              type: "pre_class",
              title: "Deploying MySQL on EC2 Using Systemd -Lab-05 Part 1",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Deploying MySQL on EC2 Using Systemd -Lab-05 Part 2",
              completed: false,
            },
            {
              type: "lab",
              title: "Deploying MySQL on EC2 Using Systemd",
              completed: false,
              labId: "6ab51651bfa7b7946e38e18c",
            },
            {
              type: "pre_class",
              title: "DEPLOY MONGODB IN EC2 USING SYSTEMD -Lab-06",
              completed: false,
            },
            {
              type: "lab",
              title: "DEPLOY MONGODB IN EC2 USING SYSTEMD",
              completed: false,
              labId: "6ab51651bfa7b7946e38e18e",
            },
            {
              type: "pre_class",
              title:
                "Deploying MySQL in a Private Subnet on AWS using Docker Compose -Lab-07",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Deploying MySQL in a Private Subnet on AWS using Docker Compose",
              completed: false,
              labId: "6ab51651bfa7b7946e38e190",
            },
            {
              type: "pre_class",
              title: "Deploy Nginx in EC2 using SystemD -Lab-08",
              completed: false,
            },
            {
              type: "lab",
              title: "Deploy Nginx in EC2 using systemd",
              completed: false,
              labId: "6ab51651bfa7b7946e38e192",
            },
          ],
        },
        {
          id: "ae67a756-ce00-406a-b8b5-dd029a04e2f1",
          title: "Serverless & Lambda Fundamentals",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 1,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 1, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Serverless & Lambda Fundamentals",
              completed: false,
            },
          ],
        },
        {
          id: "12468f14-f705-452b-84ca-7f52ab4ff4ab",
          title: "Event-Driven Architectures with Lambda",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Event-driven Patterns with Lambda, API Gateway, and S3",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Building a Serverless Application Using Step Functions, API Gateway, Lambda, and S3 in AWS",
              completed: false,
              labId: null,
            },
            {
              type: "live_class",
              title: "AWS S3 Event Notification with Lambda and SES",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Automated EC2 Deployment & MySQL Management with Lambda & API Gateway",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Deploying a Serverless Application Using AWS Lambda, API Gateway, and DynamoDB",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Automated EC2 Deployment & MongoDB Management with Lambda & API Gateway",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Automated EC2 Deployment & PostgreSQL Management with Lambda & API Gateway",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Event-Driven App with Lambda & API Gateway",
              completed: false,
            },
          ],
        },
        {
          id: "2d423742-aa08-497f-a5ee-ced030fdbace",
          title: "Multi-VPC & Private Connectivity",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "AWS Transit Gateway & Multi-VPC Architecture",
              completed: false,
            },
            {
              type: "live_class",
              title: "AWS PrivateLink & VPC Endpoints",
              completed: false,
            },
            {
              type: "live_class",
              title: "VPN Connections & Site-to-Site VPN",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Implementing AWS Transit Gateway for Multi-VPC Communication",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Configuring AWS PrivateLink for Private Service Access",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Setting Up VPC Endpoints (Gateway & Interface Endpoints)",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Multi-VPC Connectivity with Transit Gateway",
              completed: false,
            },
          ],
        },
        {
          id: "4a859cf8-8420-4cee-9858-fa3e6d11ab9c",
          title: "Edge Services, DNS & Load Balancing",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "AWS Route 53 - Advanced DNS Configuration",
              completed: false,
            },
            {
              type: "pre_class",
              title: "AWS CloudFront & Global Accelerator",
              completed: false,
            },
            {
              type: "live_class",
              title:
                "Network Load Balancer vs Application Load Balancer (Advanced Features)",
              completed: false,
            },
            {
              type: "lab",
              title: "Implementing AWS Direct Connect (Simulated Environment)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Advanced Route 53 Configuration with Health Checks and Routing Policies",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Route 53, CloudFront and Load Balancing",
              completed: false,
            },
          ],
        },
        {
          id: "ebd297c7-f9dc-49cc-b0be-72ce27af07de",
          title: "Network Security & Monitoring",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "VPC Flow Logs & Network Monitoring",
              completed: false,
            },
            {
              type: "live_class",
              title: "AWS WAF, Shield & Network Security",
              completed: false,
            },
            {
              type: "live_class",
              title: "AWS Network Firewall",
              completed: false,
            },
            {
              type: "lab",
              title: "Deploying AWS WAF with Application Load Balancer",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Implementing VPC Flow Logs and Network Monitoring Dashboard",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "AWS Network Security with WAF and Flow Logs",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "ee47843d-cf75-4606-a6ab-2ca114d856cf",
      title: "Infrastructure as Code (IaC) & Server Management",
      modules: [
        {
          id: "df073c78-bcb1-4750-b249-bcab551ee0ea",
          title: "Pulumi As IAC",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Introduction to Infrastructure as Code",
              completed: false,
            },
            {
              type: "live_class",
              title: "Getting Started with Pulumi",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Setting Up a VPC with Public Subnet, Route Table, and Internet Gateway",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "VPC with Public and Private Subnets, Route Tables, IGW, and NAT Gateway",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Launch EC2 Instances in Public and Private Subnets",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "SSH from Public Subnet Instance to Private Subnet Instance",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "AWS Infrastructure with Pulumi",
              completed: false,
            },
          ],
        },
        {
          id: "34ee7e8e-bb5c-49a1-bc85-6a4d323caeba",
          title: "Terraform Core Concepts & State",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            { type: "live_class", title: "Terraform Basics", completed: false },
            {
              type: "live_class",
              title: "Terraform providers",
              completed: false,
            },
            {
              type: "live_class",
              title: "Input Variables and Variable Blocks",
              completed: false,
            },
            {
              type: "live_class",
              title: "Using Variables in Terraform",
              completed: false,
            },
            {
              type: "live_class",
              title: "Resource Attributes & Dependencies",
              completed: false,
            },
            { type: "live_class", title: "Output Variables", completed: false },
            { type: "live_class", title: "Terraform States", completed: false },
            {
              type: "live_class",
              title: "Working With Terraform",
              completed: false,
            },
            { type: "live_class", title: "Remote state", completed: false },
            {
              type: "live_class",
              title: "Terraform Functions and Conditional Expression",
              completed: false,
            },
            {
              type: "lab",
              title: "Terraform Installation and CLI Setup",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Writing First HCL Configuration",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Update and Destroy Infrastructure Safely",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Using Input Variables and Variable Blocks",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Using Variables in Terraform Across Multiple Resources",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Working with Resource Attributes & Dependencies",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Defining and Consuming Output Variables",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Using Terraform Built-In Functions and Conditional Expressions",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Basic Terraform Commands (init, fmt, validate, plan, apply, destroy)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Using Lifecycle Rules in Terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Using Data Sources in Terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Using Meta-Arguments (count and for_each) in Terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Understanding Terraform State and Its Purpose",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "State Considerations in Team Environments",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Remote State and Remote Backends (S3, etc.)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Remote State Commands and State Management",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Remote State & State Locking with S3 and DynamoDB",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Terraform State and Core Workflow",
              completed: false,
            },
          ],
        },
        {
          id: "d6712f34-0bdf-4d4f-8193-0ae6706f6ca6",
          title: "Terraform for AWS Networking & Compute",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Terraform with AWS",
              completed: false,
            },
            {
              type: "live_class",
              title: "Terraform Provisioners",
              completed: false,
            },
            {
              type: "live_class",
              title: "Terraform Import - taints and debugging",
              completed: false,
            },
            {
              type: "lab",
              title: "Creating an S3 Bucket in AWS with Terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Creating an IAM Role and Policy in AWS with Terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "AWS EC2 with Terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Using Terraform Provisioners for EC2 Configuration",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Using terraform import for Existing AWS Resources",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Handling terraform taint and Resource Recreation",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Debugging Terraform Plans and Applies",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Securing Private Subnet Access with a Bastion Server using Terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "3-tier architecture using terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "VPC peering using terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "AWS ALB using terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "AWS Autoscaling using terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deploying a Simple AWS Lambda Function Using Terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Github action AWS infra with terraform",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Terraform AWS Networking and Compute",
              completed: false,
            },
          ],
        },
        {
          id: "6626fc40-c4d6-45da-8765-a852e455b31f",
          title: "Terraform Modules & Best Practices",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Terraform Modules",
              completed: false,
            },
            {
              type: "lab",
              title: "Terraform Modules with the Local Provider",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Refactoring Infrastructure into Reusable Modules (conceptual and practical exercises based on previous labs)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Multi-Environment Infrastructure with Shared Network in Terraform",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "AWS Network Infrastructure Using Terraform Registry Modules",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Reusable Terraform Modules Design",
              completed: false,
            },
          ],
        },
        {
          id: "885b3e63-ed6b-4264-bbb4-104f1eb65fd4",
          title: "Ansible Fundamentals",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            { type: "pre_class", title: "Ansible Overview", completed: false },
            {
              type: "lab",
              title:
                "Getting Started with Ansible: Setup and Running Ad-hoc Commands",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Ansible Ad-hoc Commands on Servers",
              completed: false,
            },
          ],
        },
        {
          id: "de15dcdd-312e-462a-af12-9eab51424633",
          title: "Application Installation & Configuration with Ansible",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Application Installation Patterns with Ansible",
              completed: false,
            },
            {
              type: "lab",
              title: "Installing Nginx Using Ansible",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Installing Jenkins on an EC2 Instance Using Ansible Playbook",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Installing MySQL on an EC2 Instance Using Ansible",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Installing Redis on an EC2 Instance Using Ansible Playbook",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Installing Docker on remote servers using Ansible Playbook",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Installing and Configuring PostgreSQL on Multiple EC2 Instances Using Ansible Playbook",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "App Installation with Ansible Playbooks",
              completed: false,
            },
          ],
        },
        {
          id: "3da2e881-ee31-4ac9-93c1-98183630145d",
          title: "Automation, CI/CD & AWS Infrastructure with Ansible",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Infrastructure Automation with Ansible",
              completed: false,
            },
            {
              type: "live_class",
              title: "CI/CD Integration Patterns with Ansible",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Automating MySQL Installation on an EC2 Instance Using Ansible and GitHub Actions",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Automate Git-runner setup using Ansible",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Automating Nginx Website Deployment with Ansible",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "AWS Infrastructure Deployment with Ansible (VPC)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "AWS Infrastructure Deployment with Ansible (EC2)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "AWS Infrastructure Deployment with Ansible (Role-based)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Launch multiple EC2 instances with different AMI IDs using Ansible and install Nginx into these instances",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Ansible CI/CD and AWS Automation",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "e62217ff-e519-4880-9fe9-763cabecf596",
      title: "Kubernetes Mastery",
      modules: [
        {
          id: "d9169cd4-ded6-4149-bdc6-259fb0db8956",
          title: "Kubernetes Setup & Configuration",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Check health of the Kubernetes API endpoints",
              completed: false,
            },
            {
              type: "live_class",
              title: "Filtering Output with Custom Columns",
              completed: false,
            },
            {
              type: "live_class",
              title: "Generate Kubernetes YAMLs Easily",
              completed: false,
            },
            {
              type: "live_class",
              title: "List Kubernetes API Resources",
              completed: false,
            },
            {
              type: "live_class",
              title: "Verify Service Account Permissions",
              completed: false,
            },
            {
              type: "lab",
              title: "Installing Kubernetes",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Multi-node Cluster with kubeadm",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Setting up k3s Lightweight Cluster",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Configuring kubectl Contexts",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Kubernetes Cluster Setup and kubectl",
              completed: false,
            },
          ],
        },
        {
          id: "5711438d-a0bf-408b-bf14-493cb400f330",
          title: "Core Kubernetes Concepts",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Pods, ReplicaSets, and Deployments Overview",
              completed: false,
            },
            {
              type: "live_class",
              title: "Services, Namespaces, ConfigMaps & Secrets",
              completed: false,
            },
            {
              type: "lab",
              title: "Creating and Managing Pods",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Working with ReplicaSets",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deployment Strategies",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Service Types and Networking",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Understanding Namespaces",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "ConfigMaps and Secrets",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Deploying Apps with Kubernetes Core Objects",
              completed: false,
            },
          ],
        },
        {
          id: "333127df-446e-404b-8eb8-5e618871ca4c",
          title: "Storage & Deployment Strategies",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Persistent Volumes, PVCs, and Storage Classes",
              completed: false,
            },
            {
              type: "pre_class",
              title: "StatefulSets and Deployment Strategies Overview",
              completed: false,
            },
            {
              type: "lab",
              title: "Persistent Volumes (PV)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Persistent Volume Claims (PVC)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Storage Classes",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "StatefulSet Applications",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Blue-Green Deployments",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Canary Deployments",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Rolling Updates",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Scaling Applications",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Kubernetes Storage and Stateful Deployments",
              completed: false,
            },
          ],
        },
        {
          id: "1751e44f-4ab9-4038-abb9-2218c24f7f11",
          title: "Resource Management & Advanced Networking",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Resource Quotas, Limits, and Networking Concepts",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Ingress, Network Policies, Load Balancing & External DNS",
              completed: false,
            },
            {
              type: "lab",
              title: "Resource Quotas and Limits",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Service Mesh with Istio",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Ingress Controllers",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Network Policies",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Load Balancing",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "External DNS Configuration",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Resource Quotas and Ingress Configuration",
              completed: false,
            },
          ],
        },
        {
          id: "9fbf308f-444e-433a-baf4-580d9c61a2a3",
          title: "Monitoring, Observability & Security",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title:
                "Kubernetes Monitoring Overview (Prometheus, Grafana, ELK, Dashboard)",
              completed: false,
            },
            {
              type: "live_class",
              title: "RBAC, Pod Security, Network Security & Secret Management",
              completed: false,
            },
            {
              type: "lab",
              title: "Prometheus Setup",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Grafana Dashboards",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "ELK Stack Integration",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Kubernetes Dashboard",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "RBAC Configuration",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Pod Security Policies",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Network Security Policies",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Secret Management",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Container Security Scanning",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Kubernetes RBAC and Security Hardening",
              completed: false,
            },
          ],
        },
        {
          id: "c3de03e0-145a-4cf8-a08a-4d6c2785fb9c",
          title: "Stateful Services, Messaging & CI/CD",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Database Clusters and Message Queues on Kubernetes",
              completed: false,
            },
            {
              type: "live_class",
              title: "CI/CD Integration and Auto-scaling on Kubernetes",
              completed: false,
            },
            {
              type: "lab",
              title: "Database Clusters (MySQL PostgreSQL)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Message Queues (RabbitMQ Kafka)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "CI/CD Pipeline Integration",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Auto-scaling Applications",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deploying Applications on Kubernetes",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Stateful Services and Messaging on Kubernetes",
              completed: false,
            },
          ],
        },
        {
          id: "8b78d175-3155-4fc1-931b-d4e914d502a6",
          title: "Kubernetes Networking Internals",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title:
                "Infrastructure Setup for Kubernetes Cluster with Terraform",
              completed: false,
            },
            {
              type: "live_class",
              title: "Kubernetes Cluster Setup on AWS EC2 Instances",
              completed: false,
            },
            {
              type: "live_class",
              title:
                "Network Interfaces for Kubernetes Pod Communication with Bash CNI",
              completed: false,
            },
            {
              type: "live_class",
              title: "Dynamic IP Assignment for Kubernetes Pods with Bash CNI",
              completed: false,
            },
            {
              type: "live_class",
              title:
                "Fixing Pod Connectivity and External Access in Kubernetes",
              completed: false,
            },
            {
              type: "lab",
              title: "Configuring Kubernetes Network Policies",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Networking with Services",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Kubernetes Pod Networking Internals",
              completed: false,
            },
          ],
        },
        {
          id: "aabc3ae5-618a-4fb2-8cee-852c4797cf69",
          title: "Cilium in Kubernetes — Concepts & Installation",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title:
                "What is Cilium and Why It’s Used (CNI overview, comparison with iptables/kube-proxy)",
              completed: false,
            },
            {
              type: "live_class",
              title: "Cilium Core Components: Agent and Operator",
              completed: false,
            },
            {
              type: "live_class",
              title: "Where Cilium Sits in Kubernetes Networking",
              completed: false,
            },
            {
              type: "live_class",
              title:
                "Pod-to-Pod Communication and Service Handling with Cilium (ClusterIP, kube-proxy replacement)",
              completed: false,
            },
            {
              type: "live_class",
              title:
                "Basic Cilium NetworkPolicy (L3/L4), Hubble Intro & Operational Checks",
              completed: false,
            },
            {
              type: "lab",
              title: "Installing Cilium CNI in Kubernetes Cluster",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Verifying Cilium Installation and Checking Component Status",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Understanding Cilium Agent and Operator Logs",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Cilium Installation and Component Verification",
              completed: false,
            },
          ],
        },
        {
          id: "207ca1e1-cfd4-4ccd-ae11-0bd00efb8e4c",
          title: "Cilium — Network Policy, Service Mesh & Observability",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title:
                "Cilium Network Policies in Practice (L3/L4, DNS-based, Pod-to-Pod)",
              completed: false,
            },
            {
              type: "live_class",
              title:
                "Cilium Service Mesh, kube-proxy Replacement & Hubble Observability",
              completed: false,
            },
            {
              type: "lab",
              title: "Creating Basic L3/L4 Network Policies with Cilium",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Implementing Pod-to-Pod Communication Policies",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Configuring DNS-based Network Policies",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Replacing kube-proxy with Cilium",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Configuring ClusterIP Services with Cilium",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Testing Service Discovery with Cilium",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Installing and Configuring Hubble UI",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Visualizing Network Traffic with Hubble",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Analyzing Service Dependencies and Traffic Flow",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Troubleshooting Network Issues with Hubble CLI",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Cilium Network Policies and Hubble Observability",
              completed: false,
            },
          ],
        },
        {
          id: "01d6774e-2898-4644-b661-c038692ce70f",
          title: "Microservices With Kubernetes",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Building Microservices with Kubernetes",
              completed: false,
            },
            {
              type: "live_class",
              title: "Deploying Microservices on Kubernetes",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Deploy MySQL into Kubernetes and test connectivity from a Ubuntu container",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Flask App and MySQL Deployment in Kubernetes",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Create Flask and MySQL deployments using secrets",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Microservices with Database on Kubernetes",
              completed: false,
            },
          ],
        },
        {
          id: "ec076503-f637-45d0-865b-7d1ec9f21b87",
          title: "Kubernetes The Hard Way",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Kubernetes Installation Methods",
              completed: false,
            },
            {
              type: "live_class",
              title: "The Hard Way Approach",
              completed: false,
            },
            {
              type: "lab",
              title: "Kubernetes the Hard Way on AWS: Infrastructure Setup",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Provisioning CA and Generating TLS Certificates for Kubernetes",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Generating Kubernetes Configuration Files for Authentication",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Bootstrapping the etcd Cluster",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Bootstrapping the Kubernetes Control Plane",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Bootstrapping the Kubernetes Worker Nodes",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Provisioning Pod Network Routes",
              completed: false,
              labId: null,
            },
            { type: "lab", title: "Smoke Test", completed: false, labId: null },
          ],
        },
        {
          id: "15d3beb7-2cf8-440e-9f06-73e1bef09598",
          title: "Helm Fundamentals",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "What is Helm and Helm Chart Structure",
              completed: false,
            },
            {
              type: "live_class",
              title: "Create Helm Chart From Scratch",
              completed: false,
            },
            {
              type: "live_class",
              title:
                "Validate, Deploy, Upgrade, Rollback & Uninstall Helm Releases",
              completed: false,
            },
            {
              type: "live_class",
              title: "Helm Templating Engine",
              completed: false,
            },
            {
              type: "live_class",
              title: "Package the Helm Chart",
              completed: false,
            },
            {
              type: "lab",
              title: "Introduction to Helm & Installation",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Chart Structure & Creating Your First Chart",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Helm Templating Deep Dive",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Validation & Multi-Environment Configs",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Release Lifecycle (Upgrade, Rollback, Uninstall)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Package, Version & Publish Charts",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Helm Chart Creation and Release Management",
              completed: false,
            },
          ],
        },
        {
          id: "709bb9bf-09cf-4504-97b6-828e06aa488b",
          title: "Helm — Debugging, Best Practices & Application Deployment",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Chart Validation, Testing & Debugging Helm Charts",
              completed: false,
            },
            {
              type: "live_class",
              title: "Helm Chart Possible Errors & Best Practices",
              completed: false,
            },
            {
              type: "lab",
              title: "Deploy Flask Application With Helm",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deploy Nodejs Application With Helm",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deploy mysql With Helm",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deploy Redis With Helm",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deploy Rabbitmq With Helm",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Helm Chart Debugging and App Deployment",
              completed: false,
            },
          ],
        },
        {
          id: "04203d0b-c050-4fca-bea1-14c684ed57be",
          title: "Kustomize For Deployment",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "What is Kustomize, Why Use It & Use Cases",
              completed: false,
            },
            {
              type: "live_class",
              title: "Multi-Environment Deployments and Feature Flags",
              completed: false,
            },
            {
              type: "live_class",
              title: "Configuration Management and Resource Customization",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Kustomize: Simplifying Kubernetes Configurations for Multiple Environments",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Kustomize in Practice: Managing Kubernetes Configurations Across Environments",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Deploying NGINX Web Server in Multiple Environments with Kustomize",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Generating ConfigMaps Using Kustomize",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Kustomize Multi-Environment Configuration",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "f65e79de-c982-45f5-b550-77effee2c362",
      title: "Observability Stack (Monitoring, Logging, Tracing)",
      modules: [
        {
          id: "40d8a991-62aa-4f85-a9cf-d2f386d20c58",
          title: "Prometheus For Monitoring (Basic)",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Understanding Monitoring Concepts",
              completed: false,
            },
            {
              type: "live_class",
              title: "Introduction to Prometheus",
              completed: false,
            },
            {
              type: "lab",
              title: "Setting Up Prometheus",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Monitoring Applications with Prometheus",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Prometheus Setup and App Monitoring",
              completed: false,
            },
          ],
        },
        {
          id: "f72b23ef-dd89-4b48-b82b-d8ce0afa152a",
          title: "Prometheus Advanced — Architecture, Metrics & PromQL",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Introduction to Prometheus Architecture",
              completed: false,
            },
            {
              type: "live_class",
              title: "Understanding Metrics Types",
              completed: false,
            },
            {
              type: "live_class",
              title: "PromQL Query Language Basics",
              completed: false,
            },
            {
              type: "lab",
              title: "Deploying Prometheus in Kubernetes",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Installing Prometheus Operator",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Configuring ServiceMonitors",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Basic PromQL Queries",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "First Grafana Dashboard",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Creating Dashboards for Kubernetes Monitoring",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "PromQL Queries for Kubernetes Monitoring",
              completed: false,
            },
          ],
        },
        {
          id: "90fb6c9f-9c46-425e-8db7-fe75d1af7c5d",
          title: "Prometheus Advanced — Alert Management",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Alert Manager Overview",
              completed: false,
            },
            {
              type: "live_class",
              title: "Grafana Integration",
              completed: false,
            },
            {
              type: "live_class",
              title: "SLI/SLO Implementation",
              completed: false,
            },
            {
              type: "lab",
              title: "Setting up Alert Manager",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Basic Alert Rules",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Alert Manager Setup",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Notification Channels",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Alert Routing",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Silencing and Inhibition",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Alertmanager Rules and Notification Routing",
              completed: false,
            },
          ],
        },
        {
          id: "1f343938-de75-4177-9701-f9a237bb4346",
          title: "Prometheus Advanced — Container & Docker Monitoring",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Container Metrics and Exporters",
              completed: false,
            },
            {
              type: "live_class",
              title: "cAdvisor Integration",
              completed: false,
            },
            {
              type: "live_class",
              title: "Docker Container Monitoring Best Practices",
              completed: false,
            },
            {
              type: "live_class",
              title: "Resource Usage Metrics",
              completed: false,
            },
            {
              type: "lab",
              title: "Container Metrics Collection",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Setting up cAdvisor",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Docker Container Labels",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Resource Usage Monitoring",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Container Health Checks",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Container Metrics with cAdvisor",
              completed: false,
            },
          ],
        },
        {
          id: "5adb5ed0-ba00-473d-92ce-de91dfbec3ff",
          title: "Prometheus Advanced — Node & Cluster Monitoring",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            { type: "live_class", title: "Node Exporter", completed: false },
            {
              type: "live_class",
              title: "Service Discovery in Kubernetes",
              completed: false,
            },
            {
              type: "live_class",
              title: "Custom Metrics API",
              completed: false,
            },
            {
              type: "live_class",
              title: "High Availability Prometheus Setup & Federation",
              completed: false,
            },
            {
              type: "lab",
              title: "Node Exporter Configuration",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "kube-state-metrics Setup",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Custom ServiceMonitors",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Namespace Monitoring",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Cluster Overview Dashboard",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Node Performance Metrics",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Pod Resource Usage",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Network Traffic Visualization",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Custom Metrics Dashboards",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Node and Cluster Health Monitoring",
              completed: false,
            },
          ],
        },
        {
          id: "58dc6892-35ea-4121-a7b2-abdd3a889970",
          title:
            "Prometheus Advanced — Application Monitoring & Custom Exporters",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Custom Exporters Development",
              completed: false,
            },
            {
              type: "live_class",
              title: "Federation and Remote Storage",
              completed: false,
            },
            {
              type: "live_class",
              title: "Monitoring Security Aspects",
              completed: false,
            },
            {
              type: "lab",
              title: "Monitoring Microservices",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Database Monitoring",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Application Performance",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "SLO Implementation",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Custom Exporter and SLO Definition",
              completed: false,
            },
          ],
        },
        {
          id: "1347fa13-981b-4562-a96c-4054e9f6442f",
          title: "Grafana — Setup & Dashboards",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Introduction to Grafana",
              completed: false,
            },
            {
              type: "live_class",
              title: "Integrating Grafana with Kubernetes",
              completed: false,
            },
            {
              type: "live_class",
              title: "Building Grafana Dashboards",
              completed: false,
            },
            {
              type: "lab",
              title: "Setting Up Grafana in Kubernetes",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Creating Visualizations",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Creating Your First Dashboard",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Integrating Grafana with Data Sources",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Grafana Dashboards for Kubernetes Metrics",
              completed: false,
            },
          ],
        },
        {
          id: "3a6c3c5f-91c3-4cf4-bfbb-2aa70503a51e",
          title: "Loki — Deployment & Logging",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "What is Loki and Why Use It for Log Management",
              completed: false,
            },
            {
              type: "live_class",
              title: "Deploying Loki on Kubernetes",
              completed: false,
            },
            {
              type: "lab",
              title: "Deploying Loki in Kubernetes",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Collecting Logs from Applications",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Logging For Flask API",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Logging For Fast API",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Logging For Express API",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Application Log Aggregation with Loki",
              completed: false,
            },
          ],
        },
        {
          id: "2d74fc73-29a0-4ea2-abb1-19b3868ecc2b",
          title: "Tempo & OpenTelemetry — Distributed Tracing",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Understanding Observability and Distributed Tracing",
              completed: false,
            },
            {
              type: "live_class",
              title: "Deploying Tempo in Kubernetes",
              completed: false,
            },
            {
              type: "live_class",
              title: "Introduction to OpenTelemetry",
              completed: false,
            },
            {
              type: "lab",
              title: "Tracing Requests with Tempo",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Using Tempo with Grafana",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Setting Up OpenTelemetry",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Tracing with Tempo",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Distributed Tracing with Tempo and OpenTelemetry",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "fee2c4cc-a28e-4520-bc65-38ca44375b60",
      title: "Production-Grade CI/CD & GitOps",
      modules: [
        {
          id: "fc300c1e-daa2-4425-89f4-bafc9aa3cc3f",
          title: "CI/CD For Docker",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "CI/CD Fundamentals for Containerized Applications",
              completed: false,
            },
            {
              type: "live_class",
              title: "Docker Build Optimization & Image Scanning",
              completed: false,
            },
            {
              type: "live_class",
              title: "Automated Testing for Docker",
              completed: false,
            },
            {
              type: "live_class",
              title: "Container Registry Management",
              completed: false,
            },
            {
              type: "lab",
              title: "Basic Docker CI Pipeline",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Multi-stage Build Pipeline",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Image Scanning and Security Checks",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Automated Testing in Docker",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Docker Registry Integration",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Docker Compose CI/CD",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Docker CI Pipeline with Image Scanning",
              completed: false,
            },
          ],
        },
        {
          id: "d8d3fb87-1f74-4451-80cd-70559c5cb5e3",
          title: "Deployment of Microservices With AWS",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Building Microservices on AWS",
              completed: false,
            },
            { type: "live_class", title: "AWS ECS Overview", completed: false },
            {
              type: "lab",
              title: "Deploying Microservices to AWS",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Using AWS Fargate",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Microservices Deployment on AWS ECS",
              completed: false,
            },
          ],
        },
        {
          id: "67504af9-53e2-48fb-9ee7-bf4295a886fd",
          title: "GitOps Fundamentals — Principles & Workflows",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title:
                "Introduction to GitOps Principles and GitOps vs Traditional CI/CD",
              completed: false,
            },
            {
              type: "live_class",
              title: "Benefits, Challenges & GitOps Workflows and Patterns",
              completed: false,
            },
            {
              type: "live_class",
              title:
                "Git as Single Source of Truth and Pull-based vs Push-based Deployment",
              completed: false,
            },
            {
              type: "lab",
              title: "Setting Up a GitOps Repository Structure",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Implementing Pull-based Deployment with Git Webhooks",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Creating Multi-Environment GitOps Workflows (Dev, Staging, Prod)",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "GitOps Repository and Pull-based Deployment",
              completed: false,
            },
          ],
        },
        {
          id: "11cd066a-70ae-4a5f-bcec-693326bdd65d",
          title: "GitOps — Kubernetes, Security & Implementation",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title:
                "GitOps for Kubernetes and Multi-Environment GitOps Strategies",
              completed: false,
            },
            {
              type: "live_class",
              title: "GitOps Tooling Landscape (ArgoCD, Flux, Jenkins X)",
              completed: false,
            },
            {
              type: "live_class",
              title:
                "GitOps Security Best Practices, Secrets Management & Monitoring",
              completed: false,
            },
            {
              type: "lab",
              title: "Implementing GitOps with Kubernetes Manifests",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Integrating Secrets Management in GitOps (Sealed Secrets, External Secrets)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Building a Complete GitOps Pipeline with Multiple Environments",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Implementing GitOps Monitoring and Drift Detection",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "GitOps on Kubernetes with Secrets Management",
              completed: false,
            },
          ],
        },
        {
          id: "1cf74cd9-dc78-4e47-9653-5e7fb9e92e2c",
          title: "ArgoCD — Fundamentals & Multi-Environment Management",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Introduction to GitOps and Getting Started with ArgoCD",
              completed: false,
            },
            {
              type: "live_class",
              title:
                "ArgoCD Multi-Environment Management, Helm Integration & Security",
              completed: false,
            },
            {
              type: "lab",
              title: "Basic ArgoCD Setup and Configuration",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Simple Application Deployment",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Multi-Environment Management",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "GitOps Pipeline",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Helm Integration",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Private Repository Integration",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "RBAC and Security",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "ArgoCD Setup and Multi-Environment Management",
              completed: false,
            },
          ],
        },
        {
          id: "f8e134aa-2a83-40c7-bade-6a8d0956ad55",
          title: "ArgoCD — Advanced Features & Deployment Strategies",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title:
                "ArgoCD Advanced Features: ApplicationSet, Sync Strategy, Health Check & Disaster Recovery",
              completed: false,
            },
            {
              type: "live_class",
              title:
                "ArgoCD Notifications, Custom Plugins & Deployment Strategies",
              completed: false,
            },
            {
              type: "lab",
              title: "ApplicationSet",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Sync Strategy",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Health Check",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Disaster Recovery",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Notification and Monitoring",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Custom Plugin",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Blue-Green Deployment",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Canary Deployment",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "ArgoCD ApplicationSets and Sync Strategies",
              completed: false,
            },
          ],
        },
        {
          id: "d35f59d3-adc9-48a1-83fb-6d5199b277f0",
          title: "GitHub Actions — Fundamentals & Runners",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "What are GitHub Actions and Using Actions for CI/CD",
              completed: false,
            },
            {
              type: "live_class",
              title: "GitHub Actions Workflows and Self-Hosted Runners",
              completed: false,
            },
            {
              type: "live_class",
              title: "Secrets Management, Matrix Builds & Best Practices",
              completed: false,
            },
            {
              type: "lab",
              title: "Introduction to GitHub Actions",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "GitHub Actions Multiple Jobs with Dependencies",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "GitHub Actions with Docker and Nginx",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Self-Hosted GitHub Actions Runner Setup",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Self Hosted Runner in Kubernetes",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Self Hosted Runner in k3s Cluster Running on AWS",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "GitHub Actions with Self-Hosted Runners",
              completed: false,
            },
          ],
        },
        {
          id: "2122265f-5437-4d49-bf90-ea9ad928320d",
          title: "GitHub Actions — Infrastructure Automation",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Automating AWS Infrastructure with GitHub Actions",
              completed: false,
            },
            {
              type: "live_class",
              title: "Using Pulumi and Terraform with GitHub Actions",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Creating AWS Infrastructure with GitHub Actions and SSH Access",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Automating K3s cluster Deployment in AWS Using Pulumi and GitHub Actions",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Automating Lambda Function Deployment with Pulumi and GitHub Actions",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Github action AWS infra with terraform",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "AWS Infrastructure Automation with GitHub Actions",
              completed: false,
            },
          ],
        },
        {
          id: "24fb9a4a-5468-4afa-a42e-d69a8e3a0ccf",
          title: "GitHub Actions — Application CI/CD Pipelines",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Building Application CI/CD Pipelines with GitHub Actions",
              completed: false,
            },
            {
              type: "live_class",
              title: "Multi-Language and Microservice Pipeline Patterns",
              completed: false,
            },
            {
              type: "lab",
              title:
                "Automated CI/CD Pipeline for Express.js Deployment Using GitHub Actions and Self-Hosted Runners",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deploy React app on EC2 instance using github actions",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Auto-Deploy Go App on AWS EC2 by Building a Docker Image and Publish it to Dockerhub with CI/CD Pipeline using GitHub Actions",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Setting Up CI/CD Pipeline for Flask Application on AWS EC2 with GitHub Actions",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Building a CI/CD Pipeline for E-commerce Microservices with GitHub Actions",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Building a CI/CD Pipeline for CRUD Application with GitHub Actions",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "End-to-End App CI/CD with GitHub Actions",
              completed: false,
            },
          ],
        },
        {
          id: "19629137-0692-4ca8-91e8-c9aa6721431a",
          title: "Jenkins",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "live_class",
              title: "Understanding Jenkins and CI/CD",
              completed: false,
            },
            {
              type: "live_class",
              title: "Setting Up Jenkins",
              completed: false,
            },
            {
              type: "lab",
              title: "Jenkins Installation on Ubuntu: A Step-by-Step Guide",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Creating and Managing Your First Jenkins Job",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Running Jenkins on Port 80: Two Different Methods",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Setting Up a Jenkins Agent Using SSH Keys",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Configuring Docker Containers as Build Agents in Jenkins",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Building a Java Application with Maven Using Jenkins",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "Automating Docker Image Builds and Pushes to Docker Hub using Jenkins",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deploy Application On Kubernetes Using Jenkins",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Jenkins Pipelines and Kubernetes Deployment",
              completed: false,
            },
          ],
        },
        {
          id: "e1cf6219-7962-4731-b156-8a394a014dcf",
          title: "Production Deployment & Common Practices",
          contentCounts: {
            lab: 0,
            pre_class: 0,
            live_class: 0,
            ai_interview: 0,
            ai_exam: 0,
            project_submission: 0,
          },
          progress: { completed: 0, total: 0, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Integrating All Components",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Best Practices for Production Deployment",
              completed: false,
            },
            {
              type: "lab",
              title: "Building a Full Deployment Pipeline",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Deploying a Complete Application",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Full Production Deployment Pipeline",
              completed: false,
            },
          ],
        },
      ],
    },
  ],
};
