export interface CareerOutlook {
  title: string;
  level: string;
  roles: string[];
  demand: string;
  nextSteps: string;
}

export interface CourseLayoutOptions {
  /** Sidebar shows milestone → module → topic, each module a dropdown of its topics. */
  topicTree: boolean;
  /** Sidebar header carries its own "Home" link (the top bar always has one). */
  sidebarHomeLink: boolean;
  /** Replaces the stat tiles on the right of the course hero. */
  careerOutlook?: CareerOutlook;
}

const DEFAULT_LAYOUT: CourseLayoutOptions = {
  topicTree: false,
  sidebarHomeLink: true,
};

const DEVOPS_CAREER: CareerOutlook = {
  title: "Course শেষে আপনি কোথায় দাঁড়াবেন",
  level:
    "Linux থেকে AWS, Terraform/Ansible, Kubernetes, Observability আর CI/CD/GitOps: পুরো DevOps stack। Lab-গুলো নিজে করে শেষ করলে Junior থেকে Mid-level DevOps/Cloud role-এর interview দেওয়ার মতো হাতে-কলমে skill তৈরি হবে।",
  roles: [
    "DevOps Engineer",
    "Cloud Engineer (AWS)",
    "Site Reliability Engineer",
    "Platform / Kubernetes Engineer",
  ],
  demand:
    "Cloud আর Kubernetes এখন প্রায় সব product company-র ভিত্তি। দেশের software company আর বিদেশি remote চাকরি, দুই জায়গাতেই এই skill-এর চাহিদা বাড়ছে, অথচ production চালানোর অভিজ্ঞতাসহ engineer কম।",
  nextSteps:
    "Lab-এর কাজ GitHub-এ রাখুন, একটা end-to-end project বানান (Terraform → Kubernetes → CI/CD → monitoring), তারপর AWS Solutions Architect Associate বা CKA certification দিন।",
};

const COURSE_LAYOUTS: Record<string, Partial<CourseLayoutOptions>> = {
  "devops-season-4": {
    topicTree: true,
    sidebarHomeLink: false,
    careerOutlook: DEVOPS_CAREER,
  },
};

export function getCourseLayout(courseId: string): CourseLayoutOptions {
  return { ...DEFAULT_LAYOUT, ...COURSE_LAYOUTS[courseId] };
}
