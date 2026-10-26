// Weekly recap posts (Plan doc Section 8.2, type 5): one every 7 days, extra to
// that day's main post, with a PDF carousel of the week's topics.

import type { RecapTopic } from "@/lib/system-design/export/carousel";
import type { LinkedInPost } from "@/lib/system-design/validate-topic";
import week01 from "./recaps/week-01.json";

export interface WeeklyRecap {
  week: number;
  post: LinkedInPost;
  topics: RecapTopic[];
  nextTopics: string[];
}

export const RECAPS: Record<number, WeeklyRecap> = {
  1: {
    week: 1,
    post: week01 as LinkedInPost,
    topics: [
      {
        day: 1,
        title: "সিস্টেম ডিজাইন আসলে কী?",
        definition:
          "অনেক user, অনেক data আর failure সামলাতে পারে এমনভাবে software-এর অংশগুলো সাজানোর পরিকল্পনা।",
      },
      {
        day: 2,
        title: "Client, Server ও Internet",
        definition:
          "Client request পাঠায়, Server উত্তর দেয়, আর Internet হলো তাদের মাঝের network-এর network।",
      },
      {
        day: 3,
        title: "DNS, HTTP ও একটি URL-এর গল্প",
        definition:
          "DNS website-এর নাম থেকে IP খুঁজে দেয়, আর HTTP হলো browser ও server-এর কথা বলার নিয়ম।",
      },
      {
        day: 4,
        title: "API কী? REST-এর বেসিক",
        definition:
          "API দুই software-এর কথা বলার চুক্তি; REST-এ resource থাকে URL-এ, কাজ বোঝায় HTTP method।",
      },
      {
        day: 5,
        title: "Scalability",
        definition:
          "Load বাড়লে system-এর ক্ষমতা বাড়িয়ে একই মানের সেবা দিতে পারার সামর্থ্য।",
      },
      {
        day: 6,
        title: "Availability",
        definition:
          "System মোট সময়ের কত অংশ ব্যবহারযোগ্য থাকে, যেমন 99.9% মানে বছরে প্রায় ৯ ঘণ্টা বন্ধ।",
      },
      {
        day: 7,
        title: "Latency vs Throughput",
        definition:
          "Latency হলো একটা কাজ কত সময় নেয়; Throughput হলো প্রতি সেকেন্ডে কতগুলো কাজ শেষ হয়।",
      },
    ],
    nextTopics: [
      "Day 8 · CAP Theorem",
      "Day 9 · Load Balancers",
      "Day 10 · Databases",
    ],
  },
};

export const getRecap = (week: number): WeeklyRecap | undefined => RECAPS[week];
