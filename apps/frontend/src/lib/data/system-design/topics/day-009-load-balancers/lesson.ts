// Day 9 · Load Balancers — Phase 1 introduction (Day 14 goes deeper into stateless servers,
// Day 31 into consistent hashing, Day 63 into service discovery, Day 88 into multi-region).

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

const day = topicHrefForDay;

export const day009Lesson: SdLesson = {
  topicId: "sd-day-009",
  day: 9,
  title: "Load Balancers",
  definition:
    "Load Balancer হলো কয়েকটা server-এর সামনে বসা একটাই প্রবেশপথ, যেটা প্রতিটা request কোন সুস্থ server-এ যাবে ঠিক করে দেয়।",

  objectives: [
    "একটা server-এর সীমা আর single point of failure থেকে শুরু করে, load balancer-এর চারটা কাজ (একটাই প্রবেশপথ, ভাগ করা, অসুস্থ server বাদ দেওয়া, server লুকিয়ে রাখা) উদাহরণ দিয়ে ব্যাখ্যা করতে পারবেন।",
    "L4 আর L7 load balancer কী দেখতে পায় আর কী পায় না, TLS termination, passthrough আর re-encryption-এর পার্থক্য, আর কখন কোনটা বাছবেন, যুক্তি দিয়ে বলতে পারবেন।",
    "Round robin, weighted round robin, least connections, least response time, IP hash, power of two choices আর consistent hashing কিভাবে server বাছে, হিসাব করে দেখাতে পারবেন, আর কোন পরিস্থিতিতে কোনটা ভুল সিদ্ধান্ত নেয় চিনতে পারবেন।",
    "Health check-এর interval আর threshold থেকে failure ধরার সময় হিসাব করতে পারবেন, আর sticky session, connection draining ও retry নিরাপদভাবে সাজাতে পারবেন।",
    "Load balancer নিজেই যেন single point of failure না হয়, তার জন্য floating IP সহ active-passive জোড়া, active-active, DNS-based আর global load balancing-এর পার্থক্য বলতে পারবেন।",
  ],

  prerequisites: [
    { day: 2, title: "Client, Server ও Internet", href: day(2) },
    { day: 5, title: "Scalability", href: day(5) },
    { day: 6, title: "Availability", href: day(6) },
  ],

  problem: {
    markdown: `"টিকিটঘর" একটা ছোট startup, বাস আর লঞ্চের টিকিট online-এ বিক্রি করে। পুরো app একটা server-এ, database আলাদা machine-এ। সারা বছর ঠিকঠাক চলে।

তারপর ঈদের আগে, অগ্রিম টিকিট বিক্রি শুরু সকাল ৮টায়। ৭:৫৯-এ হাজার হাজার মানুষ বারবার refresh চাপছে। ৮:০০-এ সবাই একসাথে "Search" চাপল। যা হলো:

1. **Server-এর CPU 100%।** প্রতিটা request লাইনে দাঁড়াল, page আসতে ৩০ সেকেন্ড, তারপর \`504 Gateway Timeout\`। একটা machine যতই শক্তিশালী হোক, তার একটা ছাদ আছে ([Day 5](${day(5)})-এর কথা)।
2. **Team তাড়াহুড়ো করে আরও দুটো server চালু করল।** কিন্তু user-রা তো সেগুলো চেনে না! App আর website এখনো পুরনো server-এর ঠিকানাতেই যাচ্ছে। নতুন দুটো server বসে আছে, পুরনোটা মরছে।
3. **কেউ বলল, DNS-এ তিনটা IP দিয়ে দাও।** দেওয়া হলো। কিছুটা ভাগ হলো, কিন্তু অসমানভাবে, কারণ অনেক resolver আর app একটা IP পেয়ে সেটাই ধরে রাখে। তারপর server ২ crash করল। DNS কিছুই জানে না, সে এখনো server ২-এর IP দিয়ে যাচ্ছে, আর cache-এর কারণে TTL শেষ না হওয়া পর্যন্ত ([Day 3](${day(3)})) প্রায় এক-তৃতীয়াংশ user error দেখল।
4. **সবশেষে, পুরনো server-এর পুরো ভিড়টাই ছিল একটা single point of failure** ([Day 6](${day(6)})): সেটা পড়লে বিক্রি বন্ধ।

শিক্ষাটা পরিষ্কার: শুধু বেশি server কিনলেই হয় না। দরকার এমন কিছু, যেটা **সবার জন্য একটাই ঠিকানা** দেবে, পেছনের server-গুলোতে **কাজ ভাগ করবে**, **মরা server চিনে বাদ দেবে**, আর server যোগ-বাদ হলেও user-কে কিছু জানতে হবে না। সেটাই **Load Balancer**।`,
    diagrams: [
      {
        id: "day-009-before",
        caption:
          "আগে: সব ধরনের user একটাই server-এ; সেটার CPU শেষ হলে বা সেটা পড়লে পুরো বিক্রি বন্ধ।",
        alt: "Web users, Mobile users আর Agent app, তিনটা থেকেই তীর একটা লাল দাগের 'একমাত্র Server'-এ, তীরে লেখা CPU 100% আর timeout; server থেকে Database-এ একটা তীর।",
      },
    ],
  },

  analogy: {
    markdown: `ধরুন পদ্মা সেতুর মাওয়া প্রান্তের টোল প্লাজা। ঈদের আগের রাতে শত শত গাড়ি। টোল booth যদি একটা থাকত, লাইন যেত কয়েক কিলোমিটার। তাই অনেকগুলো booth। কিন্তু শুধু booth বাড়ালেই হয় না, কে কোন booth-এ যাবে সেটা কেউ ঠিক না করলে সবাই প্রথম booth-এই ভিড় করবে।

তাই সামনে একজন **ট্রাফিক সার্জেন্ট** দাঁড়িয়ে হাত দিয়ে দেখিয়ে দেন: "আপনি ২ নম্বরে, আপনি ৪ নম্বরে।"

- **গাড়ি = Request**, আর **booth = Server**। সব গাড়ি একটাই রাস্তা দিয়ে আসে, একটাই ঠিকানা।
- **সার্জেন্ট = Load Balancer**: নিজে টোল নেন না, শুধু ঠিক করেন কে কোথায় যাবে।
- **পালা করে পাঠানো = Round Robin।** সবচেয়ে ছোট লাইনে পাঠানো = **Least Connections**।
- **ETC lane** (কার্ড ছুঁইয়ে দ্রুত পার) বেশি গাড়ি সামলায়, তাই সেখানে বেশি পাঠানো = **Weighted** ভাগ।
- **৩ নম্বর booth-এর মেশিন নষ্ট, লাল বাতি জ্বলছে।** সার্জেন্ট সেখানে আর গাড়ি পাঠান না = **Health check** দিয়ে অসুস্থ server বাদ।
- **বাস-ট্রাক আলাদা lane-এ।** এর জন্য সার্জেন্টকে গাড়িটা দেখতে হয়, শুধু রাস্তার lane নম্বর দেখলে হয় না = **L7 routing** (request-এর ভেতরটা দেখে সিদ্ধান্ত)।
- **একটা booth বন্ধ করার আগে** নতুন গাড়ি পাঠানো বন্ধ, কিন্তু যারা লাইনে আছে তাদের টোল নেওয়া শেষ হতে দেওয়া = **Connection draining**।

আর সবচেয়ে গুরুত্বপূর্ণ প্রশ্ন: সার্জেন্ট নিজে মাথা ঘুরে পড়ে গেলে? পুরো প্লাজায় বিশৃঙ্খলা। তাই পাশে আরেকজন তৈরি থাকেন। Load balancer-এর ক্ষেত্রেও ঠিক তাই: **load balancer নিজেও একটা single point of failure হতে পারে**, তার জন্যও backup লাগে।`,
    diagrams: [
      {
        id: "day-009-analogy",
        caption:
          "টোল প্লাজা: সার্জেন্ট (load balancer) প্রতিটা গাড়িকে খোলা booth-এ পাঠান; বন্ধ booth বাদ, বাস-ট্রাক আলাদা lane-এ।",
        alt: "বামে গাড়ির সারি (Request), মাঝে একজন ট্রাফিক সার্জেন্ট (Load Balancer), ডানে চারটা booth: সাধারণ lane, ETC lane (weight), লাল দাগের বন্ধ booth (unhealthy), আর বাস-ট্রাক lane (L7 rule); নিচে লেখা সার্জেন্টেরও backup লাগে।",
      },
    ],
  },

  coreConcept: {
    markdown: `**Load Balancer (LB)** এমন একটা component, যেটা client আর কয়েকটা একই রকম server-এর মাঝে বসে, আর প্রতিটা আসা request (বা connection) কোন server-এ যাবে ঠিক করে। Client জানে শুধু load balancer-এর ঠিকানা; পেছনে কয়টা server, তাদের IP কী, সে জানে না।

### Load balancer-এর চারটা কাজ

1. **একটাই প্রবেশপথ (single entry point):** \`tikitghor.com\` একটা ঠিকানায় যায়, সেটা load balancer। পেছনে ২টা server হোক বা ২০০টা, client-এর কাছে একই।
2. **কাজ ভাগ করা (distribution):** একটা **algorithm** দিয়ে ঠিক করে পরের request কোন server-এ যাবে। সবচেয়ে সহজটা **round robin**: ১, ২, ৩, আবার ১।
3. **অসুস্থ server বাদ দেওয়া (health checking):** নিয়মিত প্রতিটা server-কে জিজ্ঞেস করে "ঠিক আছ?" (যেমন \`GET /health\`)। পরপর কয়েকবার উত্তর না এলে তাকে **rotation** (যাদের মধ্যে ভাগ হয় সেই তালিকা) থেকে বাদ দেয়, সেরে উঠলে ফিরিয়ে আনে।
4. **Server লুকিয়ে রাখা (abstraction):** Server-গুলো private network-এ থাকে, internet থেকে সরাসরি পৌঁছানো যায় না। Server যোগ, বাদ, বদল, deploy, সবই পেছনে চুপচাপ হয়, client টেরও পায় না।

এই চারটা মিলে দুটো বড় সমস্যার সমাধান হয়, যেগুলো আমরা আগে দেখেছি:
- **Scalability ([Day 5](${day(5)})):** server যোগ করলেই capacity বাড়ে, কারণ load balancer নতুন server-কেও ভাগ দেয়। Horizontal scaling-এর দরজা এটাই। (Day 5-এর lab-এ NGINX দিয়ে replica-র সামনে এটাই বসিয়েছিলেন।)
- **Availability ([Day 6](${day(6)})):** একটা server পড়লে health check তাকে বাদ দেয়, বাকিরা চালিয়ে যায়। App server আর SPOF থাকে না। (Day 6-এর lab-এ দুই backend-এর মধ্যে failover নিজের চোখে দেখেছিলেন।)

আজ আমরা সেখান থেকে আরও এগোব: কোন algorithm কখন, load balancer request-এর কতটা দেখতে পায়, state আর deploy কিভাবে সামলায়, আর load balancer নিজে মরলে কী।

### একটা request-এর পথ

User \`https://tikitghor.com/search\` খুলল। DNS তাকে load balancer-এর IP দিল। Browser load balancer-এর সাথে TCP আর TLS connection বানাল। Load balancer algorithm দিয়ে একটা সুস্থ server বাছল (ধরি Server 2), request সেখানে পাঠাল, উত্তর পেয়ে user-কে ফেরত দিল। Server 2 নিজের চোখে দেখে, request এসেছে load balancer থেকে; user-এর আসল IP জানতে চাইলে load balancer সেটা \`X-Forwarded-For\` header-এ লিখে দেয়।

### কোথায় কোথায় load balancer থাকে

শুধু internet-এর মুখে না। বড় system-এ কয়েক স্তরে থাকে:
- **Edge-এ:** internet থেকে আসা traffic web/API server-দের মধ্যে ভাগ করতে।
- **ভেতরে (internal):** এক service থেকে আরেক service-এ যাওয়া request-এর জন্য, যেমন order service থেকে payment service-এর কয়েকটা কপিতে।
- **Database-এর সামনে:** read request কয়েকটা read replica-য় ভাগ করতে।

### কী দিয়ে বানানো

- **Software:** NGINX, HAProxy, Envoy। সাধারণ Linux server-এ চলে। আজকের lab-এ NGINX।
- **Cloud managed:** AWS-এর Application Load Balancer (ALB) আর Network Load Balancer (NLB), Google Cloud Load Balancing ইত্যাদি। চালানো, patch আর scale করার দায়িত্ব cloud-এর।
- **Hardware appliance:** আগে data center-এ বিশেষ যন্ত্র ব্যবহার হতো; এখন বেশিরভাগ জায়গায় software আর cloud LB-ই চলে।

### L4 আর L7: প্রথম পরিচয়

Load balancer request-এর কতটা "পড়ে", তার উপর দুই ভাগ। **L4 (Layer 4, transport) load balancer** শুধু IP address আর port দেখে TCP/UDP connection ভাগ করে, ভেতরে কী আছে খোলে না। **L7 (Layer 7, application) load balancer** HTTP request পুরো পড়ে: path, Host, header, cookie, আর তার ভিত্তিতে সিদ্ধান্ত নিতে পারে, যেমন \`/api/\` এক দল server-এ, \`/images/\` আরেক দলে। গভীরে যাই অংশে বিস্তারিত।

### খরচটা কী?

Load balancer বিনামূল্যে না:
- প্রতিটা request-এ একটা বাড়তি hop, তাই সামান্য বাড়তি latency (ভালো LB-তে সাধারণত খুবই কম, কিন্তু শূন্য না)।
- আরেকটা component চালাতে, monitor করতে আর configure করতে হয়। ভুল config (যেমন খুব কড়া health check) নিজেই outage বানাতে পারে।
- আর সবচেয়ে বড় কথা: সব traffic এখন এর মধ্য দিয়ে যায়। **Load balancer একটা থাকলে সেটাই নতুন SPOF।** তাই বাস্তবে load balancer সবসময় জোড়ায় বা দলে চলে।`,
    diagrams: [
      {
        id: "day-009-main",
        caption:
          "পরে: user-রা চেনে শুধু load balancer-কে; সে সুস্থ server-দের মধ্যে request ভাগ করে, আর health check-এ fail করা Server 3-কে বাদ রাখে।",
        alt: "Users থেকে Load Balancer-এ 'একটাই ঠিকানা' তীর; Load Balancer থেকে Server 1 আর Server 2-তে ~৫০% করে তীর, Server 3 লাল দাগে আর তার দিকের তীরে লেখা 'health ✕ · বাদ'; Server 1 ও 2 থেকে Database-এ তীর।",
        downloadable: true,
      },
      {
        id: "day-009-before-after",
        caption:
          "পাশাপাশি: একটা server-এ capacity একটা machine-এর সমান আর সেটাই SPOF; load balancer-এর পেছনে capacity বাড়ে, একটা server পড়লেও site চলে।",
        alt: "উপরে আগের design: তিন ধরনের user একটা ব্যর্থ server-এ। নিচে পরের design: Users, Load Balancer, তিনটা server যার একটা health check-এ বাদ, আর Database।",
      },
    ],
  },

  deepDive: [
    {
      title: "L4 বনাম L7: load balancer request-এর কতটা দেখতে পায়",
      markdown: `একটা HTTPS request-কে একটা খামের ভেতরে খাম ভাবুন। বাইরের খামে লেখা কোথা থেকে কোথায় (IP), কোন দরজায় (port)। তার ভেতরে তালা দেওয়া বাক্স (TLS)। বাক্সের ভেতরে আসল চিঠি: \`GET /api/orders\`, \`Host\`, \`Cookie\`, body।

**L4 load balancer** শুধু বাইরের খাম পড়ে:
- দেখে: source/destination IP, port, protocol (TCP/UDP)।
- সিদ্ধান্ত নেয় **connection ধরে**: একটা TCP connection একবার একটা server-এ গেলে তার সব packet সেখানেই যায়।
- ভেতরের কিছু খোলে না, তাই খুব দ্রুত, কম CPU, আর যেকোনো TCP/UDP protocol চলে (database, MQTT, game server, DNS)।
- কিছু design-এ উত্তর load balancer হয়ে না ফিরে সরাসরি server থেকে client-এ যায় (**Direct Server Return, DSR**), তাতে LB-র উপর চাপ আরও কমে।
- সীমা: path, header, cookie দেখতে পায় না, তাই "\`/api\` এদিকে, \`/video\` ওদিকে" বলতে পারে না। HTTP error দেখে retry-ও করতে পারে না।

**L7 load balancer** client-এর connection নিজে শেষ (terminate) করে, পুরো HTTP request পড়ে, তারপর backend-এর সাথে **আলাদা** connection-এ পাঠায়:
- দেখে: method, path, Host, header, cookie, query string।
- সিদ্ধান্ত নেয় **প্রতিটা request ধরে**, তাই একই connection-এর দুটো request দুই server-এ যেতে পারে।
- বাড়তি ক্ষমতা: path/host-based routing, cookie দিয়ে sticky session, HTTP 502/503 দেখে অন্য server-এ retry, header যোগ (\`X-Forwarded-For\`, request id), compression, rate limiting, auth।
- দাম: প্রতিটা request parse করতে বেশি CPU আর memory, আর HTTPS হলে TLS খুলতে হয়।

**একটা সূক্ষ্ম কিন্তু জরুরি পার্থক্য:** HTTP/2 আর gRPC অনেকগুলো request একটাই লম্বা TCP connection-এ পাঠায়। L4 load balancer connection ভাগ করে, request না। ফলে ধরুন ৩টা client-এর ৩টা connection ৩টা server-এ গেল, কিন্তু একটা client বাকিদের দশ গুণ request পাঠায়; তার server-টা পুড়ছে, বাকিরা আরামে। নতুন server যোগ করলেও পুরনো connection সরে না। এখানে **request-level (L7) balancing** দরকার।

### L7 routing: এক ঠিকানা, অনেক service

L7 load balancer-এ rule লেখা যায়:
- **Path-based:** \`/api/*\` → API server pool, \`/static/*\` → static file server, \`/video/*\` → শক্তিশালী video pool।
- **Host-based:** \`api.shop.com\` → API pool, \`admin.shop.com\` → admin pool, একই IP-তে।
- **Header/cookie-based:** \`X-Beta-User: yes\` বা নির্দিষ্ট cookie থাকলে নতুন version-এ (canary deploy, [Day 85](${day(85)})-এ বিস্তারিত)।

লাভ দুটো: প্রতিটা কাজের জন্য আলাদা আকারের server রাখা যায় (video-র জন্য বড়, static-এর জন্য ছোট), আর এক pool-এর সমস্যা আরেক pool-কে ছোঁয় না (blast radius ছোট)। এই কাজটাই আরও বড় পরিসরে করে **API Gateway** ([Day 16](${day(16)})), আর L7 LB আসলে একধরনের **reverse proxy** ([Day 15](${day(15)}))।

### TLS কোথায় খুলবেন: termination, passthrough, re-encryption

HTTPS request-এর ভেতরটা পড়তে হলে কাউকে TLS খুলতে হবে। তিনটা পথ:

1. **TLS termination (LB-তে খোলা):** Certificate আর private key load balancer-এ। LB TLS খুলে HTTP পড়ে, তারপর backend-এ সাধারণ HTTP পাঠায়। লাভ: L7 routing সম্ভব, certificate এক জায়গায় manage, backend-এর CPU বাঁচে। ঝুঁকি: LB থেকে backend পর্যন্ত data খোলা অবস্থায় যায়, তাই সেই network-কে বিশ্বাস করতে হয়।
2. **TLS passthrough (না খুলে পার করা):** LB L4-এর মতো encrypted bytes সরাসরি backend-এ পাঠায়, TLS খোলে backend। লাভ: শেষ পর্যন্ত encrypted, private key শুধু backend-এ। দাম: LB path/cookie দেখতে পায় না, তাই L7 routing, cookie stickiness, HTTP retry কিছুই না। (TLS handshake-এর SNI field-এ hostname খোলা থাকে, তাই অনেক LB passthrough-এও hostname দেখে route করতে পারে, তবে path না।)
3. **Re-encryption (খুলে আবার তালা):** LB TLS খুলে request পড়ে, তারপর backend-এর সাথে নতুন TLS connection-এ পাঠায়। L7-এর সব সুবিধা, আর পথে কোথাও data খোলা না। দাম: দুইবার TLS-এর CPU আর দুই জায়গায় certificate। Bank, health, payment-এর মতো যেখানে নিয়ম বা compliance "সবখানে encrypted" চায়, সেখানে এটাই সাধারণ।

TLS handshake ভেতরে কিভাবে চলে, তা [Day 41](${day(41)})-এ আসবে। এখন এটুকু জানলেই চলবে: **L7 সুবিধা চাইলে LB-কে TLS খুলতেই হবে।**`,
      diagrams: [
        {
          id: "day-009-layers",
          caption:
            "ভেতরের গঠন: L4 load balancer দেখে শুধু IP আর port; L7 load balancer TLS খোলার পরে path, Host, cookie সব দেখে।",
          alt: "একটা HTTPS request-এর পাঁচটা স্তর উপর থেকে নিচে: IP header, TCP header, TLS (encrypted), HTTP line (GET /api/orders, Host), HTTP headers (Cookie, Authorization)। বামে বন্ধনী দিয়ে প্রথম দুটো স্তর চিহ্নিত 'L4 LB দেখে', ডানে বন্ধনী দিয়ে সবগুলো চিহ্নিত 'L7 LB দেখে, TLS খোলার পরে'।",
        },
      ],
    },
    {
      title: "Algorithm: পরের request কোন server-এ যাবে",
      markdown: `Algorithm বাছাই নির্ভর করে তিনটা প্রশ্নে: server-গুলো কি সমান? request-গুলো কি সমান ভারী? একই user-কে কি একই server-এ যেতে হবে?

| Algorithm | কিভাবে বাছে | কখন ভালো | কোথায় ভুল করে |
|---|---|---|---|
| Round Robin | পালা করে ১, ২, ৩, ১... | সব server সমান, request প্রায় সমান | Server অসমান বা request-এর ভার অসমান হলে |
| Weighted Round Robin | Weight অনুপাতে পালা | Server-গুলোর ক্ষমতা আলাদা | Weight ভুল হলে; ধীর হয়ে যাওয়া server ধরতে পারে না |
| Least Connections | যার চলমান connection সবচেয়ে কম | Request-এর সময় অনেক কম-বেশি হয় (কিছু ৫০ms, কিছু ৫s) | Connection সংখ্যা আর আসল ভার এক না হলে |
| Least Response Time | যে সম্প্রতি দ্রুত উত্তর দিচ্ছে আর কম ব্যস্ত | Server-দের গতি আলাদা, কেউ মাঝে মাঝে ধীর | মাপা latency পুরনো হলে, বা ধীরের কারণ request নিজেই |
| IP Hash | Client IP-এর hash থেকে server | Cookie ছাড়া একই client-কে একই server-এ রাখা | NAT-এর পেছনে হাজার user এক IP-তে; server যোগ-বাদে প্রায় সবাই সরে |
| Random | এলোমেলো | অনেক LB node, shared state নেই | ছোট সংখ্যায় অসমান হতে পারে |
| Power of Two Choices | এলোমেলো দুটো, তাদের মধ্যে কম ব্যস্তটা | অনেক LB node, প্রত্যেকের তথ্য একটু পুরনো | প্রায় কোথাও খারাপ না; এটাই এর জনপ্রিয়তার কারণ |

### Round robin আর weighted round robin

Round robin সবচেয়ে সহজ, কোনো state লাগে না শুধু একটা counter ছাড়া। কিন্তু ধরুন একটা server-এ ১৬ core, বাকি দুটোয় ৪ core। সমান ভাগ দিলে ছোট দুটো আগে ডুববে। তখন **weight**: বড়টার weight ৪, ছোট দুটোর ১ করে। মোট weight ৬, তাই বড়টা পাবে ৪/৬ ≈ ৬৭%, ছোট দুটো ১৭% করে।

NGINX-এর weighted round robin একটা "smooth" পদ্ধতি ব্যবহার করে: weight ৩:১:১ হলে A A A B C না পাঠিয়ে A B A C A-র মতো ছড়িয়ে দেয়, যাতে বড় server-এ হঠাৎ এক ঝাঁক request একসাথে না পড়ে। Lab-এ নিজে দেখবেন।

### Least connections, আর কখন এটা ভুল বোঝায়

ধরুন কিছু request ৫০ms-এর (product দেখা), কিছু ৫ সেকেন্ডের (PDF report)। Round robin গুনে গুনে সমান request দেয়, কিন্তু যার ভাগে কয়েকটা report পড়ল সে ডুবছে। **Least connections** দেখে কার হাতে এখন সবচেয়ে কম কাজ চলছে, সেখানে পাঠায়। ভারী কাজ যার কাছে, তার connection অনেকক্ষণ খোলা থাকে, তাই সে নতুন কাজ কম পায়। (NGINX-এর \`least_conn\` আর HAProxy-র \`leastconn\` server-এর weight-ও হিসাবে ধরে।)

কিন্তু "connection সংখ্যা = ভার", এই অনুমান সবসময় খাটে না:
- **খরচ অসমান:** Server A-তে ৫টা connection, সবগুলো ভারী report বানাচ্ছে (CPU 100%)। Server B-তে ৮টা, সবগুলো হালকা। Least connections A-কেই পরের request দেবে, কারণ ৫ < ৮।
- **Idle connection:** WebSocket বা keep-alive-এ হাজার connection খোলা, কিন্তু বেশিরভাগ চুপচাপ। Connection গুনলে ভুল ছবি।
- **দ্রুত fail করা server:** একটা server ভাঙা, প্রতিটা request-এ ১ms-এ \`500\` দিয়ে দেয়। তার connection সবসময় প্রায় শূন্য, তাই least connections তাকেই **সবচেয়ে বেশি** request পাঠায়! একে বলে **black hole**। তাই error rate দেখে server বাদ দেওয়া (passive health check, outlier detection) least connections-এর সাথে জরুরি।

**Least response time** চলমান কাজের সাথে সম্প্রতি মাপা latency-ও দেখে। ধীর হয়ে যাওয়া server (GC pause, noisy neighbour, disk সমস্যা) নিজে থেকেই কম request পায়। খেয়াল রাখবেন, NGINX open source-এ এটা নেই; NGINX Plus-এর \`least_time\`, আর অন্য LB-তে নানা নামে আছে।

### IP hash, আর বাংলাদেশের mobile network-এর hot spot

IP hash client-এর IP থেকে একটা hash বানিয়ে server বাছে, তাই একই IP সবসময় একই server-এ। Cookie ছাড়াই stickiness।

সমস্যা হলো **NAT**। মোবাইল operator-রা সাধারণত **Carrier-Grade NAT (CGNAT)** ব্যবহার করে: হাজার হাজার গ্রাহক internet-এ একই public IP নিয়ে বের হয়, কারণ IPv4 address যথেষ্ট নেই। অফিস বা university-র Wi-Fi-ও একই কাজ করে। আপনার server দেখে, একটা IP থেকে বিশাল traffic। IP hash সেই পুরো ভিড় **একটা server-এ** পাঠায়। ঈদের offer-এর দিন এক operator-এর একটা NAT IP-র পেছনে ৫,০০০ user থাকলে, আর মোট ১০টা server-এ আপনার ২০,০০০ user হলে, ওই একটা server-এ অন্তত ২৫% traffic, যেখানে ন্যায্য ভাগ ১০%। অন্যরা ফাঁকা, সেটা পুড়ছে।

আরেকটা কম-জানা তথ্য: NGINX-এর \`ip_hash\` IPv4 address-এর প্রথম তিনটা অংশ (যেমন \`103.54.12.x\`) দিয়ে hash করে, পুরো address না। ফলে একই /24 block-এর সব client একই server-এ যায়, ভিড় আরও ঘন হয়।

সমাধান: stickiness দরকার হলে IP-র বদলে **cookie** বা **user id** দিয়ে, আর সবচেয়ে ভালো হলো stickiness-এর দরকারটাই সরানো (পরের অংশে)।

### Random আর power of two choices

বড় system-এ load balancer একটা না, অনেকগুলো node, প্রত্যেকে আলাদাভাবে সিদ্ধান্ত নেয়, আর কেউই অন্যদের সর্বশেষ অবস্থা জানে না। তখন "সবচেয়ে কম ব্যস্ত server" সবাই একসাথে একই server-কে ভাবে, আর সবাই মিলে তাকেই ডুবিয়ে দেয় (**herd behavior**)।

**Power of two choices**: এলোমেলো দুটো server বাছো, তাদের মধ্যে কম ব্যস্তটায় পাঠাও। শুনতে সামান্য, কিন্তু Michael Mitzenmacher-এর গবেষণা (১৯৯৬-এর thesis) দেখায়, শুধু এলোমেলো একটার বদলে দুটো দেখলেই সবচেয়ে ব্যস্ত server-এর ভার নাটকীয়ভাবে কমে। আর যেহেতু প্রতিবার ভিন্ন জোড়া, সবাই একই server-এ ঝাঁপিয়ে পড়ে না। Envoy-এর least request policy আর NGINX-এর \`random two least_conn\` এই ধারণাই ব্যবহার করে।

### Consistent hashing: শুধু পরিচয়

সাধারণ hash-এ server বাছা হয় \`hash(key) % N\` দিয়ে। N = ৪ থেকে ৫ হলে প্রায় সব key-র ভাগশেষ বদলায়, মানে প্রায় সব user নতুন server-এ যায়। Cache server হলে সব cache একসাথে অকেজো।

**Consistent hashing** server আর key দুটোকেই একটা বৃত্তের (ring) উপর বসায়; প্রতিটা key ঘড়ির কাঁটার দিকে প্রথম যে server পায় তার কাছে যায়। একটা server যোগ বা বাদ হলে শুধু তার পাশের অংশের key সরে, মোটামুটি ১/N ভাগ। NGINX-এ \`hash $key consistent\`, Envoy-তে ring hash আর Maglev। Lab-এ দেখবেন একটা backend বন্ধ করলে শুধু তার user-রাই সরে। Ring, virtual node আর hot key নিয়ে এখন এটুকু জানলেই চলবে, [Day 31](${day(31)})-এ গভীরে যাব।

**নিচের simulator-এ নিজে চালিয়ে দেখুন:** "ভারী request-এ Round Robin বনাম Least Connections" preset চালিয়ে Algorithm tab-এ দুটো পালা করে বদলান, আর p99 latency দেখুন। তারপর "অসমান server" challenge-এ একটা Large আর দুটো Small server-এ Round Robin দিয়ে শুরু করে দেখুন কোন server-এর CPU লাল হয়, তারপর Weighted Round Robin-এ সমাধান করুন।`,
      diagrams: [
        {
          id: "day-009-algorithms",
          caption:
            "Algorithm তুলনা: একই তিনটা server, একই মুহূর্ত, অথচ পাঁচটা algorithm-এর সিদ্ধান্ত আলাদা।",
          alt: "উপরে তিনটা server: A (চলমান ৮, গড় ৩০ms), B (চলমান ৩, গড় ১২০ms), C (চলমান ৫, গড় ৬০ms)। নিচে পাঁচ সারি: Round Robin C বাছে, Least Connections B বাছে, Least Response Time A বাছে (score A ২৭০, B ৪৮০, C ৩৬০), IP Hash সবসময় A, Power of Two Choices A আর C থেকে C বাছে।",
        },
      ],
    },
    {
      title: "Health check: কখন একটা server-কে 'মৃত' ধরবেন",
      markdown: `Day 6-এ দেখেছি health check কেন লাগে। এখানে দেখি কিভাবে সাজাতে হয়, আর কোথায় নিজেই বিপদ ডাকে।

### Active বনাম passive

- **Active health check:** LB নিজে থেকে নিয়মিত probe পাঠায়, যেমন প্রতি ৫ সেকেন্ডে \`GET /health\`, ২ সেকেন্ডের timeout। কোনো user request না থাকলেও মরা server ধরা পড়ে। HAProxy-তে server-এর পাশে \`check\` লিখলেই চালু, AWS ALB/NLB target group-এ এটা built-in। NGINX-এ নিয়মিত probe পাঠানো (\`health_check\` directive) **NGINX Plus**-এর feature, open source-এ নেই।
- **Passive health check:** আলাদা probe না, আসল request-এর ফল দেখে। NGINX open source-এ \`max_fails\` আর \`fail_timeout\`: \`fail_timeout\` সময়ের মধ্যে \`max_fails\` বার fail করলে server-কে \`fail_timeout\` সময় বাদ রাখে (default যথাক্রমে ১ আর ১০ সেকেন্ড)। Envoy-তে এর নাম **outlier detection**: পরপর কয়েকটা 5xx দিলে host-কে কিছুক্ষণ বের করে দেয়।

দুটো একসাথে সবচেয়ে ভালো। Active ধরে "পুরো মরা" server, user traffic আসার আগেই। Passive ধরে "চালু কিন্তু ভুল উত্তর দিচ্ছে" server, যেটা হয়তো \`/health\`-এ ঠিকই 200 দেয়।

### Interval, timeout আর threshold

চারটা সংখ্যা ঠিক করে, কত দ্রুত আর কত নির্ভুলভাবে ধরা হবে:
- **Interval:** কত পরপর check (যেমন ৫s)।
- **Timeout:** কতক্ষণ উত্তরের অপেক্ষা (যেমন ২s)।
- **Unhealthy threshold:** পরপর কয়টা fail হলে বাদ (যেমন ৩)। HAProxy-তে \`fall\`।
- **Healthy threshold:** পরপর কয়টা সফল হলে ফেরত (যেমন ২)। HAProxy-তে \`rise\`।

**হিসাব:** মরা server ধরতে মোটামুটি **interval × unhealthy threshold** সময় লাগে, সবচেয়ে খারাপ ক্ষেত্রে আরেকটু (শেষ check-এর timeout)। Interval ১০s আর threshold ৩ হলে প্রায় ৩০ সেকেন্ড। ১০০ request/s-এর site-এ, ৪টা server-এর একটা মরলে ওই ৩০ সেকেন্ডে প্রায় ২৫ × ৩০ = **৭৫০টা request** মরা server-এ যায়। Retry না থাকলে এরা সবাই error দেখে।

তাহলে interval ১ সেকেন্ড আর threshold ১ দিলেই তো হয়? না:
- **Flapping:** একটা হারানো packet বা একটা ৩০০ms-এর GC pause-এ সুস্থ server বাদ পড়বে, পরের check-এ ফিরবে, আবার বাদ। "এই আছে, এই নেই" server-এর কারণে connection ভাঙে, cache ঠান্ডা হয়, আর বাকি server-এ হঠাৎ ভার লাফায়। তাই বাদ দিতে কয়েকটা fail আর ফেরাতে কয়েকটা success লাগে, ঠিক ঘরের thermostat যেমন ঠিক এক বিন্দুতে না, একটা পরিসরে চালু-বন্ধ হয় (hysteresis)।
- **Check-এর খরচ:** ২০টা LB node × ৫০টা backend × প্রতি সেকেন্ডে একবার = backend-গুলোতে সেকেন্ডে ১,০০০টা health check। বড় fleet-এ health check নিজেই ভার।

### Health endpoint-এ কী থাকবে

- **Shallow check** (\`/health\` শুধু "process চালু আছে" বলে): সস্তা, কিন্তু database connection ভাঙা server-কেও সুস্থ বলবে।
- **Deep check** (database, cache, অন্য service সব পরীক্ষা): বেশি সত্য, কিন্তু বিপজ্জনক। Database এক মুহূর্ত ধীর হলে **সব** server একসাথে check fail করবে, আর LB সবাইকে বাদ দিয়ে নিজেই পুরো outage বানাবে।

মাঝামাঝি পথ: health check শুধু সেই জিনিস দেখুক যেটা **এই server-এর নিজের** সমস্যা (process, local disk, thread pool ভর্তি কিনা), shared dependency না। আর অনেক LB-তে একটা সুরক্ষা আছে: AWS-এর documentation অনুযায়ী target group-এর **সব** target unhealthy হলে ALB সবার কাছেই request পাঠায় ("fail open"), কারণ "সবাই মৃত" প্রায়ই health check-এর ভুল। Envoy-তে একে বলে **panic threshold**।

**নিচের simulator-এ নিজে চালিয়ে দেখুন:** "Health check ছাড়া server মারা গেলে" preset চালিয়ে fail হওয়া request গুনুন। তারপর "Server crash" challenge-এ Reliability tab থেকে interval আর "কয়বার fail করলে বাদ" কমিয়ে, Retry চালু করে fail ১%-এর নিচে আনুন। Interval ১০ সেকেন্ড আর threshold ৫ দিয়ে একবার চালিয়ে দেখুন কতক্ষণ ধরে error আসে।`,
      diagrams: [
        {
          id: "day-009-l7-flow",
          caption:
            "ধাপে ধাপে: একটা request TLS termination, path routing আর algorithm পেরিয়ে server-এ যায়; তারপর health check একটা মরা server-কে বাদ দেয় আর সুস্থ হলে ফেরায়।",
          alt: "Client, L7 Load Balancer, API pool-এর দুটো server আর একটা Static pool server-এর architecture; প্রতিটা ধাপে request-এর পথ, API pool · 2-এর অবস্থা (সুস্থ, ব্যর্থ, বাদ, ফেরত) আর তীরের লেখা বদলায়।",
        },
      ],
    },
    {
      title: "Sticky session আর connection draining: state আর deploy সামলানো",
      markdown: `### Sticky session: সমাধান, নাকি সমস্যা লুকানো?

ধরুন app user-এর cart server-এর memory-তে রাখে। প্রথম request Server 1-এ গেল, cart-এ ২টা টিকিট। পরের request round robin-এ Server 2-তে, সেখানে cart খালি! User ভাবে টিকিট হারাল।

দ্রুত সমাধান **sticky session (session affinity)**: একই user-কে সবসময় একই server-এ পাঠাও। উপায় দুটো:
- **IP দিয়ে:** IP hash। আগেই দেখলাম CGNAT-এ এটা ভিড় জমায়, আর mobile user Wi-Fi থেকে 4G-তে গেলে IP বদলায়, stickiness ভাঙে।
- **Cookie দিয়ে:** LB প্রথম উত্তরে একটা cookie বসায় (যেমন "এই user Server 1-এর"), পরের request-এ সেটা দেখে পাঠায়। AWS ALB-তে এটা target group-এর stickiness setting, HAProxy-তে \`cookie\` directive। IP-র চেয়ে নির্ভুল, তবে L7 লাগে।

কিন্তু sticky session সমস্যা সারায় না, শুধু ঢেকে রাখে:
- **Server মরলে session যায়:** Server 1 crash করলে তার সব user-এর cart হারাল। Health check তাকে বাদ দিলেও data তো ওই memory-তে ছিল।
- **ভার অসমান হয়:** কিছু user সারাদিন ব্যস্ত, তারা এক server-এ আটকে থাকে। নতুন server যোগ করলে পুরনো user-রা সরে না, তাই নতুন server ফাঁকা।
- **Deploy আর scale-in কঠিন:** একটা server বন্ধ করতে চাইলে তার user-দের session শেষ হওয়া পর্যন্ত অপেক্ষা।

ভালো সমাধান হলো server-কে **stateless** বানানো: session আর cart রাখুন একটা shared store-এ (যেমন Redis বা database), অথবা signed token-এ client-এর কাছে। তখন যেকোনো server যেকোনো request নিতে পারে, আর load balancer সবচেয়ে ভালো algorithm স্বাধীনভাবে বাছতে পারে। Stateless design নিয়ে এখন এটুকু জানলেই চলবে, [Day 14](${day(14)})-এ গভীরে যাব।

Stickiness-এর একটা বৈধ ব্যবহারও আছে: **performance**। যেমন প্রতিটা server-এ local cache থাকলে একই user বা একই key একই server-এ গেলে cache hit বাড়ে। তখনও correctness যেন stickiness-এর উপর নির্ভর না করে; server বদলালে শুধু একটু ধীর হবে, ভুল হবে না।

**নিচের simulator-এ নিজে চালিয়ে দেখুন:** "Shopping cart হারিয়ে যাচ্ছে" challenge-এ Reliability tab থেকে Sticky session (বা Algorithm tab-এ IP Hash) চালু করে সমাধান করুন। তারপর ওই user-এর server বন্ধ করুন, metrics-এ "session হারাল" গোনা দেখুন।

### Connection draining: deploy-এর সময় কেউ যেন মাঝপথে না কাটে

নতুন version deploy করতে একটা server বন্ধ করবেন। সরাসরি বন্ধ করলে তার উপর যে request চলছিল (কেউ payment করছিল, কেউ ১০MB ছবি upload করছিল) সবাই মাঝপথে কাটা পড়ে।

**Connection draining** (AWS-এ **deregistration delay**) মানে:
1. LB-কে বলা "এই server-কে আর **নতুন** request দিও না।"
2. চলমান request-গুলো শেষ হতে দেওয়া, একটা সর্বোচ্চ সময় পর্যন্ত (AWS ALB-এর default ৩০০ সেকেন্ড, বদলানো যায়)।
3. তারপর server বন্ধ।

App-এর দিকেও কাজ আছে, একে বলে **graceful shutdown**:
- \`SIGTERM\` পেলে process সাথে সাথে মরবে না। আগে নিজের readiness/health endpoint-কে fail করাবে, যাতে LB তাকে rotation থেকে সরায়, তারপর নতুন connection নেওয়া বন্ধ করবে, চলমান কাজ শেষ করবে, তারপর বের হবে।
- Keep-alive connection-এ \`Connection: close\` পাঠিয়ে client-কে নতুন connection খুলতে বলবে, যাতে সেটা অন্য server-এ যায়।
- WebSocket-এর মতো ঘণ্টাব্যাপী connection drain হওয়ার অপেক্ষা অর্থহীন। সেখানে client-কে reconnect করতে বলুন, আর client-এর reconnect logic যেন ঠিক থাকে।

Draining-এর সময় নিয়ে একটা trade-off: বেশি লম্বা হলে deploy ধীর (১০টা server একটা একটা করে, প্রতিটায় ৩০০ সেকেন্ড অপেক্ষা = শুধু অপেক্ষাতেই ৫০ মিনিট)। বেশি ছোট হলে লম্বা request কাটা পড়ে। আপনার সবচেয়ে লম্বা স্বাভাবিক request কত সময় নেয়, তার একটু বেশি রাখুন। Rolling, blue-green আর canary deploy নিয়ে [Day 85](${day(85)})-এ বিস্তারিত।

উল্টো দিকটাও আছে: নতুন server চালু হয়েই পুরো ভাগ পেলে, তার ঠান্ডা cache আর JIT নিয়ে হঠাৎ ভিড়ে সে হোঁচট খায়। কিছু LB **slow start** দেয়: নতুন server-এর ভাগ কয়েক সেকেন্ড ধরে ধীরে বাড়ে।`,
    },
    {
      title: "Load balancer নিজেই যেন SPOF না হয়",
      markdown: `সব traffic load balancer দিয়ে যায়। সেটা একটা machine হলে, server যতগুলোই থাকুক, পুরো site-এর availability ওই একটা machine-এর সমান। সমাধানগুলো সহজ থেকে বড় পরিসরে:

### Active-passive জোড়া আর floating IP

দুটো LB machine, **LB-A (active)** আর **LB-B (standby)**। Client যে IP-তে আসে, সেটা কোনো নির্দিষ্ট machine-এর না, একটা **floating IP / virtual IP (VIP)**, যেটা যে active তার কাছে থাকে।

- দুজনে **VRRP** (Virtual Router Redundancy Protocol) দিয়ে কথা বলে। Linux-এ এটা সাধারণত **keepalived** দিয়ে করা হয়। Active নিয়মিত ঘোষণা (advertisement) পাঠায়: "আমি বেঁচে আছি।"
- Standby কিছুক্ষণ ঘোষণা না পেলে (VRRP-তে মোটামুটি তিনটা advertisement interval-এর সমান সময়) ধরে নেয় active মৃত, VIP নিজের করে নেয়, আর network-কে জানিয়ে দেয় (gratuitous ARP) যে এখন থেকে এই IP-র packet তার কাছে আসবে।
- Advertisement interval ১ সেকেন্ড হলে failover মোটামুটি ৩-৪ সেকেন্ডে। Client-এর চলমান TCP connection সাধারণত কাটা পড়ে (standby সেগুলোর কথা জানে না), তবে নতুন connection সাথে সাথে চলে।

দাম: standby সারাক্ষণ বসে থাকে, অর্ধেক hardware অলস। আর দুজনেরই config সবসময় এক রাখতে হয়, নইলে failover-এর পর "নতুন" LB ভিন্ন আচরণ করে।

একটা বিপদ: দুজনের মাঝের link কাটা পড়লে দুজনেই ভাবতে পারে "অন্যজন মৃত, আমিই active" (**split brain**)। তখন দুজনেই VIP দাবি করে। এজন্য heartbeat-এর জন্য আলাদা পথ রাখা আর বাইরের কোনো সাক্ষী দিয়ে যাচাই করা হয়। (Day 6-এর false failover মনে আছে?)

### Active-active

দুই বা তার বেশি LB একসাথে traffic নেয়। কিভাবে client ভাগ হয়?
- **DNS-এ একাধিক IP** দিয়ে, অথবা
- Router-এর **ECMP** (equal-cost multi-path) দিয়ে: router নিজেই packet-গুলো কয়েকটা LB machine-এ ভাগ করে, প্রতিটা connection-এর packet একই machine-এ। Google-এর Maglev এভাবে কাজ করে (industry অংশে)।

লাভ: কোনো machine অলস না, আর একটা পড়লে বাকিরা নেয়। শর্ত: একটা পড়লেও বাকিদের পুরো ভার নেওয়ার জায়গা থাকতে হবে (Day 6-এর N+1)।

### DNS-based আর global load balancing (GSLB)

একটা data center বা region পুরো বন্ধ হলে? তখন region-এর উপরে আরেক স্তর:
- **DNS-based load balancing:** DNS server প্রশ্নকারীর অবস্থান, region-এর health আর weight দেখে ভিন্ন region-এর IP দেয়। একে **GSLB (Global Server Load Balancing)** বলা হয়। সীমা: DNS cache আর TTL। TTL ৬০ সেকেন্ড দিলেও কিছু resolver আর app বেশিক্ষণ পুরনো IP ধরে রাখে, তাই failover মিনিট লাগতে পারে। আর DNS প্রতিটা request দেখে না, শুধু নাম খোঁজা দেখে, তাই সূক্ষ্ম ভাগ সম্ভব না।
- **Anycast:** একই IP address পৃথিবীর অনেক জায়গা থেকে (BGP দিয়ে) ঘোষণা করা হয়। Internet-এর routing নিজে থেকেই user-কে network-এর হিসাবে কাছের জায়গায় নিয়ে যায়। একটা জায়গা বন্ধ হলে সেটা ঘোষণা তুলে নেয়, traffic পরের কাছের জায়গায় যায়, DNS TTL-এর অপেক্ষা ছাড়াই। CDN আর বড় DNS provider-রা এটা ব্যাপকভাবে ব্যবহার করে ([Day 11](${day(11)})-এ CDN)।

বাস্তবে এগুলো স্তরে স্তরে বসে: DNS/anycast user-কে কাছের region-এ পাঠায় → region-এ L4 LB-র দল (ECMP-তে active-active) → তার পেছনে L7 LB-র দল → তার পেছনে app server। প্রতিটা স্তর নিচের স্তরের SPOF সরায়। Multi-region design নিয়ে এখন এটুকু জানলেই চলবে, [Day 88](${day(88)})-এ গভীরে যাব।

**নিচের simulator-এ নিজে চালিয়ে দেখুন:** "Load Balancer নিজেই মারা গেল" challenge-এ Reliability tab-এর "Primary LB বন্ধ করো" চাপুন, দেখুন পুরো site বন্ধ। তারপর "দ্বিতীয় Load Balancer (active-passive)" চালু করে দেখুন কয়েক সেকেন্ডের failover-এর পরে request আবার সফল হচ্ছে, আর ওই কয়েক সেকেন্ডে কী হলো।`,
      diagrams: [
        {
          id: "day-009-lb-pair",
          caption:
            "Active-passive জোড়া: user-রা floating IP-তে আসে; IP এখন LB-A-র কাছে, VRRP heartbeat থেমে গেলে LB-B সেটা নিয়ে নেয়।",
          alt: "Users থেকে 'Floating IP (VIP)' 203.0.113.10-এ তীর; VIP থেকে হাইলাইট করা LB-A (active)-এ গাঢ় তীর আর ঝাপসা LB-B (standby)-তে ড্যাশ দেওয়া তীর; LB-A থেকে LB-B-তে 'VRRP heartbeat' ড্যাশ তীর; দুই LB থেকেই Server pool-এ তীর, LB-B-রটা ড্যাশ দেওয়া।",
        },
      ],
    },
    {
      title: "Retry আর observability: LB যা দেখে, তা কাজে লাগানো",
      markdown: `### LB-তে retry: বন্ধু, কিন্তু বিপজ্জনক বন্ধু

Day 6-এর lab-এ দেখেছেন, একটা backend fail করলে LB request-টা অন্য server-এ পাঠালে user error-ই দেখে না। এটা দারুণ, কিন্তু তিনটা ফাঁদ আছে।

**১. Non-idempotent request।** \`POST /orders\` backend-এ পৌঁছে order বানাল, তারপর উত্তর পাঠানোর আগে connection কাটল। LB দেখল "fail", অন্য server-এ আবার পাঠাল। এখন দুটো order, টাকা দুবার কাটা! LB জানে না প্রথম server কাজটা করেছিল কিনা। ([Day 4](${day(4)})-এর idempotency মনে আছে?) এজন্য NGINX documentation অনুযায়ী, request upstream-এ পাঠানো হয়ে গেলে \`POST\`, \`LOCK\`, \`PATCH\`-এর মতো non-idempotent request NGINX নিজে থেকে পরের server-এ retry করে না, যদি না আপনি \`proxy_next_upstream\`-এ স্পষ্টভাবে \`non_idempotent\` লেখেন। নিরাপদ নিয়ম: connect-ই হয়নি (request backend-এ পৌঁছায়নি) এমন fail সব request-এ retry করা যায়; পৌঁছানোর পরের fail শুধু idempotent request-এ, অথবা request-এ **idempotency key** থাকলে।

**২. Retry storm।** ধরুন request তিন স্তর পার হয়: edge LB → API service → order service → database। প্রতিটা স্তর fail হলে মোট ৩ বার চেষ্টা করে। Database ধীর হলে order service প্রতিটা request-এ ৩ বার database-এ যায়, API service প্রতিটা request-এ ৩ বার order service-এ, edge ৩ বার API-তে। একটা user request database-এ পৌঁছায় **৩ × ৩ × ৩ = ২৭ বার**। যে database ধীর হয়ে কষ্ট পাচ্ছিল, তার উপর এখন ২৭ গুণ ভার। ছোট একটা ধীরগতি পুরো outage-এ পরিণত হয়।

উপায়:
- Retry একটা স্তরেই করুন (সাধারণত সবচেয়ে বাইরের বা সবচেয়ে ভেতরের), সব স্তরে না।
- **Retry budget:** মোট request-এর একটা ছোট অংশের (যেমন ১০-২০%) বেশি retry না। Envoy-তে retry budget এই কাজই করে।
- Retry-এর আগে অপেক্ষা (exponential backoff আর jitter), আর ভাঙা service-কে কিছুক্ষণ ডাকাই বন্ধ (circuit breaker, [Day 59](${day(59)}))।
- Timeout-এর বিন্যাস: ভেতরের স্তরের timeout বাইরের চেয়ে ছোট, নইলে বাইরের LB হাল ছেড়ে retry করছে, অথচ ভেতরে আগের চেষ্টাটা তখনো চলছে।

**৩. Timeout ছাড়া retry অর্থহীন।** NGINX-এর \`proxy_connect_timeout\`-এর default ৬০ সেকেন্ড। মরা server-এর জন্য এক মিনিট বসে থেকে তারপর retry করলে user ততক্ষণে চলে গেছে।

Retry, idempotency key আর exactly-once নিয়ে এখন এটুকু জানলেই চলবে, [Day 57](${day(57)})-এ গভীরে যাব।

### LB-র observability: সবচেয়ে ভালো জানালা

সব request load balancer দিয়ে যায়, তাই user-এর অভিজ্ঞতার সবচেয়ে কাছের সংখ্যাগুলো এখানেই পাওয়া যায় ([Day 7](${day(7)})-এ বলেছিলাম latency কোথায় মাপবেন)। যা দেখবেন:

- **Backend অনুযায়ী latency (p50, p95, p99):** একটা server-এর p99 বাকিদের দ্বিগুণ? সেটা ধীর হয়ে যাচ্ছে (disk, noisy neighbour, খারাপ deploy)। গড় দেখলে এটা চাপা পড়ে।
- **5xx, কিন্তু ভাগ করে:** backend নিজে \`500\` দিয়েছে, নাকি LB \`502\` (backend ভুল/অসম্পূর্ণ উত্তর দিয়েছে বা connection ভেঙেছে), \`503\` (পাঠানোর মতো সুস্থ backend নেই), \`504\` (backend সময়মতো উত্তর দেয়নি) দিয়েছে? AWS ALB-এর metric-এও এই দুটো আলাদা গোনা হয় (load balancer-এর নিজের 5xx বনাম target-এর 5xx)। কারণ খোঁজার প্রথম সূত্র এটাই।
- **প্রতিটা backend-এর চলমান connection আর request-এর ভাগ:** একটা server অন্যদের তিন গুণ পাচ্ছে? IP hash-এর hot spot, ভুল weight, বা least connections-এর black hole।
- **Healthy/unhealthy host সংখ্যা আর flapping:** একটা server ঘণ্টায় ২০ বার আসা-যাওয়া করছে মানে health check খুব কড়া, বা server আসলেই অসুস্থ।
- **Retry-এর সংখ্যা:** হঠাৎ বেড়ে গেলে কোথাও ধীরে ধীরে কিছু ভাঙছে, আর retry সেটা ঢেকে রাখছে।

একটা ব্যবহারিক কৌশল: LB-র access log-এ backend-এর ঠিকানা আর backend-এর response time রাখুন (NGINX-এ \`$upstream_addr\`, \`$upstream_response_time\`)। NGINX একাধিক backend চেষ্টা করলে \`$upstream_addr\`-এ কমা দিয়ে সবগুলো লেখে, তাই log দেখেই retry ধরা যায়। Lab-এর শেষ পরীক্ষায় এটাই করবেন। Metrics, log আর tracing নিয়ে [Day 89](${day(89)})-এ বিস্তারিত।`,
    },
  ],

  simulator: "load-balancer-lab",

  tradeOffs: {
    markdown: `**কখন load balancer লাগবে:** একাধিক server-এ একই app চলছে (scale বা redundancy-র জন্য); zero-downtime deploy চান; TLS certificate এক জায়গায় রাখতে চান; এক ঠিকানার পেছনে কয়েকটা service (L7 routing)।

**কখন হয়তো লাগবে না, বা অন্য কিছু ভালো:**
- একটাই server, কম traffic, downtime সহ্য করা যায়: LB শুধু খরচ আর জটিলতা বাড়াবে। (তবে TLS termination আর পরে server যোগ করার সুবিধার জন্য অনেকেই শুরুতেই একটা reverse proxy বসায়।)
- Service থেকে service-এ ভেতরের call: প্রতিটা call-এ একটা আলাদা LB-র hop না রেখে, client নিজেই service discovery থেকে server-এর তালিকা নিয়ে ভাগ করতে পারে (**client-side load balancing**), বা service mesh-এর sidecar এই কাজ করে ([Day 63](${day(63)}))।
- কাজ যদি এখনই করার দরকার না হয়: LB request *ঠেলে* server-এ পাঠায়, queue-তে worker-রা নিজেই কাজ *টেনে* নেয়, ফলে ভার নিজে থেকেই ভাগ হয় ([Day 12](${day(12)})-এ Message Queue)।

**Managed বনাম নিজে চালানো:** Cloud LB (ALB, NLB) নিজে scale করে, redundant থাকে, patch লাগে না; দাম প্রতি ঘণ্টা আর traffic অনুযায়ী, আর নিয়ন্ত্রণ কম। NGINX/HAProxy/Envoy নিজে চালালে নিয়ন্ত্রণ পুরো, খরচ কম হতে পারে, কিন্তু SPOF সরানো, scale আর upgrade আপনার দায়িত্ব।

কোন স্তরের load balancing কী দেয়:`,
    table: {
      headers: [
        "বিষয়",
        "L4 Load Balancer",
        "L7 Load Balancer",
        "DNS / Global (GSLB, anycast)",
      ],
      rows: [
        [
          "কী দেখে",
          "IP, port, TCP/UDP",
          "HTTP path, Host, header, cookie",
          "DNS প্রশ্ন (নাম), প্রশ্নকারীর আনুমানিক অবস্থান",
        ],
        [
          "কিসের ভিত্তিতে ভাগ",
          "Connection",
          "প্রতিটা request",
          "Name lookup (DNS) বা network route (anycast)",
        ],
        [
          "গতি ও খরচ",
          "খুব দ্রুত, কম CPU",
          "Request parse আর TLS-এ বেশি CPU",
          "প্রতি request-এ কোনো hop নেই",
        ],
        [
          "TLS",
          "সাধারণত passthrough",
          "Termination বা re-encryption",
          "জড়িত না",
        ],
        [
          "Routing ক্ষমতা",
          "শুধু IP/port ধরে",
          "Path/host/header-based, canary, retry, header যোগ",
          "Region বা data center বাছাই",
        ],
        [
          "Failover-এর গতি",
          "Health check-এর গতিতে (সেকেন্ড)",
          "Health check-এর গতিতে (সেকেন্ড)",
          "DNS: TTL আর cache-এর উপর নির্ভর (মিনিট হতে পারে); anycast: route সরার গতিতে",
        ],
        [
          "উদাহরণ",
          "AWS NLB, LVS/IPVS, Maglev, HAProxy (TCP mode)",
          "AWS ALB, NGINX, HAProxy (HTTP mode), Envoy",
          "Route 53-এর মতো DNS routing policy, anycast CDN",
        ],
        [
          "উপযুক্ত",
          "Non-HTTP protocol, বিপুল connection, সবচেয়ে কম latency",
          "Web/API, microservice-এর সামনে, বিভিন্ন path-এ বিভিন্ন pool",
          "Region-এর মধ্যে ভাগ ও failover, user-কে কাছের region-এ নেওয়া",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **NGINX:** Open source NGINX-এর upstream module-এ default algorithm weighted round robin (\`weight=\`), এছাড়া \`least_conn\`, \`ip_hash\` (IPv4-এর প্রথম তিনটা অংশ দিয়ে hash), \`hash ... consistent\` (ketama consistent hashing) আর \`random\` (\`random two least_conn\` = power of two choices)। Health check open source-এ passive (\`max_fails\`, \`fail_timeout\`); নিয়মিত probe পাঠানো active \`health_check\` আর \`least_time\` NGINX Plus-এর feature।
- **HAProxy:** \`balance\` দিয়ে \`roundrobin\`, \`leastconn\`, \`source\` (client IP hash), \`uri\`, \`hdr\`, \`random\` ইত্যাদি। Server-এর পাশে \`check\` দিলে active health check, \`inter\` (interval), \`fall\` আর \`rise\` (কয়বার fail/success) দিয়ে নিয়ন্ত্রণ। একই software TCP (L4) আর HTTP (L7) দুই mode-এ চলে।
- **AWS Elastic Load Balancing:** AWS documentation অনুযায়ী **Application Load Balancer** layer 7-এ কাজ করে (path, host, header-based routing, target group-এ health check, cookie-ভিত্তিক stickiness, deregistration delay), আর **Network Load Balancer** layer 4-এ TCP/UDP/TLS connection ভাগ করে। AWS-এর ভাষায় NLB প্রতিটা connection-এর জন্য target বাছে একটা flow hash দিয়ে, তাই একটা connection-এর সব packet একই target-এ যায়।
- **Envoy:** Lyft-এ তৈরি, ২০১৬ সালে open source হয়, পরে CNCF project। Service mesh-এর sidecar হিসেবে বহুল ব্যবহৃত। Load balancing policy-র মধ্যে round robin, least request (সব weight সমান হলে এলোমেলো দুটো host থেকে কম active request-ওয়ালাটা, অর্থাৎ power of two choices), ring hash আর Maglev। Active health checking আর outlier detection (passive) দুটোই আছে, আর retry budget দিয়ে retry storm সীমিত রাখা যায়।
- **Google Maglev:** NSDI 2016-এ প্রকাশিত paper "Maglev: A Fast and Reliable Software Network Load Balancer" অনুযায়ী, Google ২০০৮ থেকে সাধারণ Linux server-এ চলা এই software L4 load balancer ব্যবহার করছে, বিশেষ hardware appliance-এর বদলে। Router ECMP দিয়ে packet অনেকগুলো Maglev machine-এ ছড়ায় (active-active), Maglev একটা নিজস্ব consistent hashing (Maglev hashing) দিয়ে backend বাছে যাতে machine বদলালেও একই connection একই backend-এ যায়, আর উত্তর Maglev হয়ে না ফিরে সরাসরি user-এর দিকে যায়। এটা দেখায়, বড় পরিসরে L4 load balancing-ও একটা distributed system।
- **Power of two choices:** Michael Mitzenmacher-এর ১৯৯৬-এর PhD thesis "The Power of Two Choices in Randomized Load Balancing" এই ধারণার মূল গবেষণা, যেটা আজ Envoy, NGINX আর HAProxy-র মতো tool-এ ব্যবহার হয়।
- **keepalived:** Linux-এ VRRP দিয়ে দুই LB-র মধ্যে floating IP সরানোর সবচেয়ে প্রচলিত open source tool; প্রায়ই HAProxy বা NGINX-এর সাথে active-passive জোড়ায় ব্যবহার হয়।

*উৎস: NGINX documentation (ngx_http_upstream_module, ngx_http_proxy_module: proxy_next_upstream); HAProxy Configuration Manual (balance, check, inter, fall, rise); AWS Elastic Load Balancing documentation (Application Load Balancer, Network Load Balancer, target group health checks, deregistration delay); Envoy documentation (load balancing, outlier detection, retry budgets); Eisenbud et al., "Maglev: A Fast and Reliable Software Network Load Balancer", NSDI 2016; M. Mitzenmacher, "The Power of Two Choices in Randomized Load Balancing", PhD thesis, UC Berkeley, 1996; RFC 5798 (VRRP version 3); keepalived documentation।*`,
  },

  mistakes: [
    {
      mistake:
        "দুটো app server রেখে ভাবা SPOF শেষ, অথচ সামনের load balancer একটাই। সেটা পড়লে পুরো site বন্ধ।",
      fix: "LB-কে জোড়ায় চালান (floating IP সহ active-passive, বা active-active), অথবা managed cloud LB নিন, যেটা নিজেই redundant।",
    },
    {
      mistake:
        "Server-এর memory-তে session রেখে sticky session দিয়ে কাজ চালানো, তারপর server মরলে বা নতুন server যোগ করলে অবাক হওয়া।",
      fix: "Session shared store-এ (Redis/database) বা token-এ রাখুন, server stateless করুন। Stickiness থাকলে শুধু performance-এর জন্য, correctness-এর জন্য না।",
    },
    {
      mistake:
        "Health check-এ database-সহ সব dependency পরীক্ষা করা। Database এক মুহূর্ত ধীর হলে সব server একসাথে unhealthy, LB নিজেই outage বানায়।",
      fix: "Health check শুধু server-এর নিজের অবস্থা দেখুক; shared dependency-র সমস্যা আলাদা monitoring আর alert দিয়ে ধরুন।",
    },
    {
      mistake:
        "Interval ১ সেকেন্ড আর threshold ১ দিয়ে 'দ্রুততম' health check বানানো, ফলে একটা হারানো packet-এ সুস্থ server বাদ পড়ে আর flapping শুরু হয়।",
      fix: "Unhealthy threshold ২-৩, healthy threshold ২-এর মতো রাখুন, আর detection-এর বাকি ফাঁক retry দিয়ে ঢাকুন।",
    },
    {
      mistake:
        "LB-তে সব request-এ, POST সহ, অন্ধভাবে retry চালু করা, আর প্রতিটা স্তরে আলাদা retry রাখা।",
      fix: "Backend-এ পৌঁছানোর পরের fail শুধু idempotent request বা idempotency key থাকলে retry করুন; retry এক স্তরে রাখুন, budget আর backoff দিন।",
    },
    {
      mistake:
        "Mobile-heavy app-এ stickiness-এর জন্য IP hash ব্যবহার করা। CGNAT-এর পেছনের হাজার user এক server-এ জমে hot spot বানায়।",
      fix: "Stickiness লাগলে cookie বা user id দিয়ে hash করুন, আর per-backend request-এর ভাগ monitor করুন।",
    },
    {
      mistake:
        "Deploy-এর সময় server সরাসরি বন্ধ করা, connection draining বা graceful shutdown ছাড়া। চলমান payment আর upload মাঝপথে কাটে।",
      fix: "আগে LB থেকে deregister (draining), app-এ SIGTERM ধরে নতুন কাজ বন্ধ করে চলমান কাজ শেষ করুন, তারপর বন্ধ।",
    },
    {
      mistake:
        "শুধু LB-র মোট error rate দেখা, backend অনুযায়ী latency আর 5xx-এর উৎস (LB-র 502/503/504 বনাম backend-এর 500) আলাদা না করা।",
      fix: "Per-backend p99, per-backend request share, LB-generated বনাম backend-generated 5xx, আর retry সংখ্যা আলাদা graph-এ রাখুন।",
    },
  ],

  lab: [
    {
      title: "প্রস্তুতি: তিনটা backend আর একটা NGINX load balancer",
      markdown: `এই lab-এ Docker Compose দিয়ে তিনটা ছোট backend চালাবেন, যারা শুধু নিজের নাম বলে, আর সামনে একটা NGINX load balancer। তারপর config বদলে বদলে round robin, \`weight\`, \`least_conn\`, \`ip_hash\`, consistent hash আর L7 path routing নিজের চোখে দেখবেন। Docker ছাড়া কিছু লাগবে না।

(Day 5-এ NGINX-কে replica-র সামনে বসিয়েছিলেন, Day 6-এ failover দেখেছিলেন। আজ মনোযোগ algorithm আর routing-এ।)

\`\`\`bash
mkdir -p lb-lab/lb && cd lb-lab
\`\`\`

\`backend.py\`: প্রতিটা request-এ নিজের নাম ফেরত দেয়। \`/work\` path-এ \`WORK_SECONDS\` সেকেন্ড ঘুমায়, যেন একটা ভারী কাজ। ThreadingHTTPServer, তাই একসাথে অনেক request নিতে পারে।

\`\`\`bash
cat > backend.py <<'EOF'
import os
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

NAME = os.environ["NAME"]
WORK_SECONDS = float(os.environ.get("WORK_SECONDS", "0.1"))


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/work"):
            time.sleep(WORK_SECONDS)  # ভারী কাজের ভান
        body = f"{NAME}\\n".encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


print(f"{NAME} listening on :8000", flush=True)
ThreadingHTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
EOF
\`\`\`

\`compose.yaml\`। খেয়াল করুন, \`backend-1\`-এর \`/work\` ২ সেকেন্ড নেয়, বাকিদের ০.১ সেকেন্ড; least_conn-এর পরীক্ষায় এটা কাজে লাগবে।

\`\`\`bash
cat > compose.yaml <<'EOF'
name: sdlab-day009

services:
  backend-1:
    image: python:3.12-alpine
    container_name: sdlab-day009-backend-1
    command: python /backend.py
    environment:
      NAME: backend-1
      WORK_SECONDS: "2"
    volumes:
      - ./backend.py:/backend.py:ro

  backend-2:
    image: python:3.12-alpine
    container_name: sdlab-day009-backend-2
    command: python /backend.py
    environment:
      NAME: backend-2
    volumes:
      - ./backend.py:/backend.py:ro

  backend-3:
    image: python:3.12-alpine
    container_name: sdlab-day009-backend-3
    command: python /backend.py
    environment:
      NAME: backend-3
    volumes:
      - ./backend.py:/backend.py:ro

  lb:
    image: nginx:1.27-alpine
    container_name: sdlab-day009-lb
    ports:
      - "8089:80"
    volumes:
      - ./lb:/etc/nginx/conf.d:ro
    depends_on:
      - backend-1
      - backend-2
      - backend-3

networks:
  default:
    name: sdlab-day009-net
EOF
\`\`\`

Load balancer-এর প্রথম config, সাধারণ round robin। \`log_format\`-এ প্রতিটা request কোন backend-এ গেল (\`$upstream_addr\`) আর কত সময় নিল, সেটা লেখা থাকবে। \`zone\` দিলে NGINX-এর সব worker process একই upstream অবস্থা ভাগ করে, যাতে পালা আর connection গোনা ঠিক থাকে।

\`\`\`bash
cat > lb/default.conf <<'EOF'
log_format lb '$remote_addr "$request" $status '
              'upstream=$upstream_addr time=$upstream_response_time';

upstream app {
    zone app 64k;
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}

server {
    listen 80;
    access_log /var/log/nginx/access.log lb;

    location / {
        proxy_pass http://app;
    }
}
EOF
\`\`\`

দুটো ছোট script। \`count.sh\` একটার পর একটা request পাঠিয়ে গোনে কে কয়টা উত্তর দিল; \`burst.sh\` request-গুলো ০.১ সেকেন্ড পরপর ছাড়ে, আগেরটার উত্তরের অপেক্ষা না করে, যাতে অনেকগুলো একসাথে চলে:

\`\`\`bash
cat > count.sh <<'EOF'
#!/bin/sh
# ব্যবহার: ./count.sh <request সংখ্যা> <path>
for i in $(seq 1 "$1"); do
  curl -s "localhost:8089$2"
done | sort | uniq -c
EOF

cat > burst.sh <<'EOF'
#!/bin/sh
# ব্যবহার: ./burst.sh <request সংখ্যা> <path>
for i in $(seq 1 "$1"); do
  curl -s "localhost:8089$2" &
  sleep 0.1
done | sort | uniq -c
wait
EOF

chmod +x count.sh burst.sh
docker compose up -d && sleep 3
curl -s localhost:8089/
\`\`\`

\`backend-1\` (বা অন্য কোনো নাম) দেখলে সব তৈরি। (\`sleep 3\` দেওয়া হলো কারণ backend-গুলোর Python চালু হতে এক-দুই সেকেন্ড লাগে; তার আগে request গেলে \`502 Bad Gateway\` আসে।) Port 8089 অন্য কিছু ব্যবহার করলে \`compose.yaml\`-এ বদলে নিন।`,
    },
    {
      title: "পরীক্ষা ১: Round robin, আর log-এ প্রমাণ",
      markdown: `\`\`\`bash
./count.sh 30 /
\`\`\`

\`\`\`text
  10 backend-1
  10 backend-2
  10 backend-3
\`\`\`

একদম সমান ভাগ। এবার load balancer-এর log দেখুন:

\`\`\`bash
docker logs sdlab-day009-lb 2>/dev/null | tail -3
\`\`\`

\`\`\`text
192.168.65.1 "GET / HTTP/1.1" 200 upstream=172.19.0.2:8000 time=0.001
192.168.65.1 "GET / HTTP/1.1" 200 upstream=172.19.0.3:8000 time=0.001
192.168.65.1 "GET / HTTP/1.1" 200 upstream=172.19.0.4:8000 time=0.001
\`\`\`

প্রতিটা লাইনে আলাদা backend IP, পালা করে। প্রথম কলামের IP (আপনার machine-এ ভিন্ন হতে পারে) হলো load balancer যাকে client হিসেবে দেখছে; মনে রাখুন, সব request একই IP থেকে আসছে, পরীক্ষা ৪-এ এটা জরুরি।`,
    },
    {
      title: "পরীক্ষা ২: Weighted round robin",
      markdown: `ধরুন backend-1 বড় machine, বাকিদের তিন গুণ ক্ষমতা। তাকে \`weight=3\` দিন:

\`\`\`bash
cat > lb/default.conf <<'EOF'
log_format lb '$remote_addr "$request" $status '
              'upstream=$upstream_addr time=$upstream_response_time';

upstream app {
    zone app 64k;
    server backend-1:8000 weight=3;
    server backend-2:8000;
    server backend-3:8000;
}

server {
    listen 80;
    access_log /var/log/nginx/access.log lb;

    location / {
        proxy_pass http://app;
    }
}
EOF
docker exec sdlab-day009-lb nginx -t && docker exec sdlab-day009-lb nginx -s reload && sleep 2
./count.sh 30 /
\`\`\`

\`\`\`text
  18 backend-1
   6 backend-2
   6 backend-3
\`\`\`

হিসাব মিলিয়ে নিন: মোট weight ৩ + ১ + ১ = ৫, তাই backend-1 পায় ৩০ × ৩/৫ = ১৮, বাকিরা ৬ করে। এবার ক্রমটা দেখুন:

\`\`\`bash
for i in 1 2 3 4 5 6 7 8 9 10; do curl -s localhost:8089/; done | tr '\\n' ' '; echo
\`\`\`

\`\`\`text
backend-1 backend-2 backend-1 backend-3 backend-1 backend-1 backend-2 backend-1 backend-3 backend-1
\`\`\`

backend-1 তিনবার একটানা পায় না, ছড়িয়ে পায়। এটাই NGINX-এর smooth weighted round robin।

(আমরা config-এর পুরো folder mount করেছি, একটা file না, তাই host-এ file বদলালে container-এর ভেতরেও বদলায়; \`nginx -s reload\` চলমান connection না কেটেই নতুন config নেয়: নতুন worker process চালু হয়, পুরনোরা হাতের কাজ শেষ করে বিদায় নেয়। এতে এক মুহূর্ত লাগে, তাই reload-এর পরে \`sleep 2\`; নইলে প্রথম কয়েকটা request পুরনো config-এ চলে যেতে পারে।)`,
    },
    {
      title: "পরীক্ষা ৩: ধীর backend, Round robin বনাম least_conn",
      markdown: `প্রথমে আবার সাধারণ round robin-এ ফিরি (weight ছাড়া), আর \`/work\` path-এ ৩০টা request প্রায় একসাথে পাঠাই। মনে রাখুন, backend-1-এর \`/work\` ২ সেকেন্ড নেয়, বাকিদের ০.১ সেকেন্ড।

\`\`\`bash
cat > lb/default.conf <<'EOF'
log_format lb '$remote_addr "$request" $status '
              'upstream=$upstream_addr time=$upstream_response_time';

upstream app {
    zone app 64k;
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}

server {
    listen 80;
    access_log /var/log/nginx/access.log lb;

    location / {
        proxy_pass http://app;
    }
}
EOF
docker exec sdlab-day009-lb nginx -s reload && sleep 2
./burst.sh 30 /work
\`\`\`

\`\`\`text
  10 backend-1
  10 backend-2
  10 backend-3
\`\`\`

Round robin জানে না backend-1 ধীর। ১০ জন user-কে সে ধীর server-এ পাঠাল, প্রত্যেকে ২ সেকেন্ড অপেক্ষা করল। এবার \`upstream\`-এ শুধু একটা লাইন যোগ করুন, \`least_conn;\`:

\`\`\`bash
cat > lb/default.conf <<'EOF'
log_format lb '$remote_addr "$request" $status '
              'upstream=$upstream_addr time=$upstream_response_time';

upstream app {
    zone app 64k;
    least_conn;
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}

server {
    listen 80;
    access_log /var/log/nginx/access.log lb;

    location / {
        proxy_pass http://app;
    }
}
EOF
docker exec sdlab-day009-lb nginx -s reload && sleep 2
./burst.sh 30 /work
\`\`\`

\`\`\`text
   2 backend-1
  15 backend-2
  13 backend-3
\`\`\`

(সংখ্যা আপনার machine-এ এক-দুই কম-বেশি হবে।) ধীর backend-1-এর connection ২ সেকেন্ড খোলা থাকে, তাই তার "চলমান" গোনা বেশি দেখায়, আর least_conn নতুন request দ্রুত দুজনকে দেয়। ২ সেকেন্ড অপেক্ষা করা user ১০ জন থেকে নেমে ২ জন। Code বা server একটুও বদলায়নি, শুধু algorithm।

ভাবার প্রশ্ন: backend-1 যদি ধীর না হয়ে প্রতিটা request-এ ১ms-এ \`500\` error দিত, least_conn কী করত? (গভীরে যাই অংশের "black hole" দেখুন।)`,
    },
    {
      title: "পরীক্ষা ৪: ip_hash আর consistent hash দিয়ে stickiness",
      markdown: `\`least_conn;\` লাইনটার জায়গায় \`ip_hash;\` দিন:

\`\`\`bash
cat > lb/default.conf <<'EOF'
log_format lb '$remote_addr "$request" $status '
              'upstream=$upstream_addr time=$upstream_response_time';

upstream app {
    zone app 64k;
    ip_hash;
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}

server {
    listen 80;
    access_log /var/log/nginx/access.log lb;

    location / {
        proxy_pass http://app;
    }
}
EOF
docker exec sdlab-day009-lb nginx -s reload && sleep 2
./count.sh 20 /
\`\`\`

\`\`\`text
  20 backend-3
\`\`\`

(আপনার ক্ষেত্রে অন্য কোনো একটা backend হতে পারে।) ২০টাই এক backend-এ! কারণ পরীক্ষা ১-এ দেখেছি, load balancer-এর চোখে সব request একই IP থেকে আসছে। এটাই CGNAT-এর ছোট সংস্করণ: একটা IP-র পেছনে যত user, সবাই এক server-এ। আর NGINX-এর \`ip_hash\` IPv4-এর প্রথম তিন অংশ দিয়ে hash করে, তাই একই /24-এর আলাদা machine-গুলোও একই backend-এ যেত।

এবার IP-র বদলে user-এর পরিচয় দিয়ে stickiness। ধরি app প্রতিটা request-এ \`X-User\` header পাঠায়, আর আমরা consistent hash ব্যবহার করি। সাথে \`proxy_connect_timeout 1s\`, যাতে বন্ধ backend-এর জন্য বেশিক্ষণ অপেক্ষা না করে:

\`\`\`bash
cat > lb/default.conf <<'EOF'
log_format lb '$remote_addr "$request" $status '
              'upstream=$upstream_addr time=$upstream_response_time';

upstream app {
    zone app 64k;
    hash $http_x_user consistent;
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}

server {
    listen 80;
    access_log /var/log/nginx/access.log lb;

    location / {
        proxy_pass http://app;
        proxy_connect_timeout 1s;
    }
}
EOF
docker exec sdlab-day009-lb nginx -s reload && sleep 2

cat > users.sh <<'EOF'
#!/bin/sh
for u in rahim karim salma nusrat tania jamal; do
  printf "%-7s → " "$u"
  for i in 1 2 3; do
    curl -s -m 5 -H "X-User: $u" localhost:8089/ | tr -d '\\n'
    printf " "
  done
  echo
done
EOF
chmod +x users.sh
./users.sh
\`\`\`

\`\`\`text
rahim   → backend-3 backend-3 backend-3
karim   → backend-3 backend-3 backend-3
salma   → backend-2 backend-2 backend-2
nusrat  → backend-3 backend-3 backend-3
tania   → backend-1 backend-1 backend-1
jamal   → backend-3 backend-3 backend-3
\`\`\`

প্রতিটা user সবসময় নিজের backend-এ। (৬ জনের মধ্যে ৪ জন backend-3-এ, অল্প key-তে hash এমন অসমান হতেই পারে; হাজার user-এ গড়ে সমান হয়।) এবার যার কাছে কম user, এমন একটা backend বন্ধ করুন (আমাদের ক্ষেত্রে backend-2, শুধু salma):

\`\`\`bash
docker stop sdlab-day009-backend-2
./users.sh
\`\`\`

\`\`\`text
rahim   → backend-3 backend-3 backend-3
karim   → backend-3 backend-3 backend-3
salma   → backend-3 backend-3 backend-3
nusrat  → backend-3 backend-3 backend-3
tania   → backend-1 backend-1 backend-1
jamal   → backend-3 backend-3 backend-3
\`\`\`

শুধু salma সরল, বাকি সবাই নিজের জায়গায়। সাধারণ \`hash % N\` হলে N বদলানোয় প্রায় সবাই সরত। এটাই consistent hashing-এর মূল সুবিধা (Day 31-এ বিস্তারিত)। salma-র প্রথম request-এ সামান্য দেরি হতে পারে: NGINX আগে বন্ধ backend-2-এ connect চেষ্টা করে, fail হলে পরেরটায় পাঠায় (Day 6-এর passive health check)।

\`\`\`bash
docker start sdlab-day009-backend-2
sleep 12
./users.sh
\`\`\`

\`fail_timeout\` (১০ সেকেন্ড) শেষে salma আবার backend-2-এ ফেরে। (ফিরে না এলে \`docker compose restart lb\` দিন: container restart-এ IP বদলালে NGINX পুরনো IP ধরে রাখে।) খেয়াল করুন, salma-র session backend-3-এর memory-তে থাকলে ফেরার সময় আবার হারাত। এজন্যই stateless server।`,
    },
    {
      title: "পরীক্ষা ৫: L7 routing, /api/ আর /static/ আলাদা pool-এ",
      markdown: `এবার দুটো upstream দল: API-র জন্য backend-1 আর backend-2, static file-এর জন্য backend-3। Path দেখে load balancer ঠিক করবে কোন দলে যাবে, আর অচেনা path-এ নিজেই \`404\` দেবে:

\`\`\`bash
cat > lb/default.conf <<'EOF'
log_format lb '$remote_addr "$request" $status '
              'upstream=$upstream_addr time=$upstream_response_time';

upstream api_pool {
    zone api_pool 64k;
    server backend-1:8000;
    server backend-2:8000;
}

upstream static_pool {
    zone static_pool 64k;
    server backend-3:8000;
}

server {
    listen 80;
    access_log /var/log/nginx/access.log lb;

    location /api/ {
        proxy_pass http://api_pool;
    }

    location /static/ {
        proxy_pass http://static_pool;
    }

    location / {
        default_type text/plain;
        return 404 "no route for $uri\\n";
    }
}
EOF
docker exec sdlab-day009-lb nginx -t && docker exec sdlab-day009-lb nginx -s reload && sleep 2
./count.sh 10 /api/users
./count.sh 10 /static/logo.png
curl -s -i localhost:8089/admin | head -1
\`\`\`

\`\`\`text
   5 backend-1
   5 backend-2
  10 backend-3
HTTP/1.1 404 Not Found
\`\`\`

\`/api/\` দুই API server-এ ভাগ হলো, \`/static/\` সব গেল static pool-এ, আর \`/admin\`-এর জন্য কোনো rule নেই বলে load balancer নিজেই \`404\` দিল, কোনো backend-কে বিরক্ত না করে। এটা L7: path না পড়লে এই সিদ্ধান্ত সম্ভব না। L4 load balancer-এ এটা করতে হলে আলাদা IP বা port লাগত।`,
    },
    {
      title: "পরীক্ষা ৬: Log থেকে observability",
      markdown: `পুরো lab-এ কোন backend কয়টা request পেয়েছে, LB-র log থেকেই বের করুন:

\`\`\`bash
docker logs sdlab-day009-lb 2>/dev/null | grep -o 'upstream=[^ ]*' | sort | uniq -c
\`\`\`

\`\`\`text
   2 upstream=-
  74 upstream=172.19.0.2:8000
   1 upstream=172.19.0.2:8000,
 129 upstream=172.19.0.3:8000
  63 upstream=172.19.0.4:8000
\`\`\`

(সংখ্যা আপনার চালানো অনুযায়ী আলাদা হবে।) তিনটা জিনিস খেয়াল করুন:
- \`upstream=-\`: LB নিজেই উত্তর দিয়েছে (\`/admin\`-এর 404), কোনো backend-এ যায়নি।
- **কমা সহ লাইন**: পরীক্ষা ৪-এ backend-2 বন্ধ থাকার সময় NGINX প্রথমে তাকে চেষ্টা করে fail করেছে, তারপর আরেকজনকে। পুরো লাইনটা দেখলে (\`docker logs sdlab-day009-lb 2>/dev/null | grep ', '\`) দুটো ঠিকানাই পাবেন। এভাবেই log থেকে retry ধরা যায়।
- কোন IP কোন backend, মিলিয়ে নিন:

\`\`\`bash
docker inspect -f '{{.Name}} {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' \\
  sdlab-day009-backend-1 sdlab-day009-backend-2 sdlab-day009-backend-3
\`\`\`

\`time=\` field-গুলো দিয়ে backend অনুযায়ী latency-ও বের করা যায়; \`/work\`-এর লাইনগুলোতে backend-1-এর time ২ সেকেন্ডের কাছে দেখবেন। Production-এ ঠিক এই তথ্যগুলো metrics হিসেবে graph-এ যায়।`,
    },
    {
      title: "পরিষ্কার করুন",
      markdown: `\`\`\`bash
docker compose down
\`\`\`

এটা চারটা container আর \`sdlab-day009-net\` network মুছে দেবে। Image-গুলোও মুছতে চাইলে (অন্য lab-এ লাগলে রেখে দিন):

\`\`\`bash
docker rmi python:3.12-alpine nginx:1.27-alpine
\`\`\`

চাইলে আরও খেলুন: পরীক্ষা ৩-এ \`least_conn;\`-এর জায়গায় \`random two least_conn;\` দিয়ে দেখুন (power of two choices)। আর পরীক্ষা ২-এ weight ৩:১:১-এর বদলে ৫:৩:২ দিয়ে, চালানোর আগে হিসাব করুন ৩০টা request-এ কে কয়টা পাবে।`,
    },
  ],

  connections: {
    markdown: `- **[Day 2](${day(2)}) · Client, Server ও Internet**: সেখানে client সরাসরি একটা server-এর সাথে কথা বলত। Load balancer মাঝে বসে সেই "একটা server"-কে একটা দলে বদলে দেয়, client কিছু টের পায় না।
- **[Day 3](${day(3)}) · DNS, HTTP ও একটি URL-এর গল্প**: DNS-এ কয়েকটা IP দেওয়াও একধরনের load balancing, কিন্তু TTL আর cache-এর কারণে মরা server চট করে সরানো যায় না। তাই DNS ব্যবহার হয় region বাছতে, আর region-এর ভেতরে load balancer।
- **[Day 4](${day(4)}) · API কী? REST-এর বেসিক**: Stateless request-এর জন্যই যেকোনো server যেকোনো request নিতে পারে। আর idempotency ঠিক করে LB কোন request নিরাপদে retry করতে পারবে।
- **[Day 5](${day(5)}) · Scalability**: Horizontal scaling-এর দরজা load balancer। সেখানে NGINX replica-র সামনে বসিয়েছিলাম, আজ দেখলাম কিভাবে বুদ্ধি করে ভাগ করে।
- **[Day 6](${day(6)}) · Availability**: Health check, failover আর SPOF। আজ সেটা load balancer নিজের উপরও প্রয়োগ করলাম: floating IP, active-active, GSLB।
- **[Day 7](${day(7)}) · Latency vs Throughput**: Least response time আর power of two choices tail latency কমায়; আর LB-ই user-এর latency মাপার সবচেয়ে ভালো জায়গা।
- **[Day 8](${day(8)}) · CAP Theorem**: Active-passive LB-র split brain হলো partition-এর সময় দুজনেরই "আমিই leader" ভাবার সমস্যা, CAP-এর সেই একই প্রশ্ন।

সামনে যা আসছে: [Day 11](${day(11)})-এ CDN (anycast আর edge), [Day 12](${day(12)})-এ Message Queue (push-এর বদলে pull), [Day 13](${day(13)})-এ Vertical vs Horizontal Scaling, [Day 14](${day(14)})-এ Stateful vs Stateless (sticky session-এর আসল সমাধান), [Day 15](${day(15)})-এ Proxy Servers, [Day 16](${day(16)})-এ API Gateway, [Day 31](${day(31)})-এ Consistent Hashing গভীরে, [Day 41](${day(41)})-এ TLS Handshake, [Day 57](${day(57)})-এ Idempotency ও Retry, [Day 63](${day(63)})-এ Service Discovery ও Service Mesh, [Day 85](${day(85)})-এ Blue-Green ও Canary Deploy, [Day 87](${day(87)})-এ Autoscaling, আর [Day 88](${day(88)})-এ Multi-region ও Edge।`,
  },

  explainYourself: [
    {
      question:
        'আপনার teammate বলছে, "Least connections সবসময় round robin-এর চেয়ে ভালো, কারণ এটা server-এর ভার দেখে।" কথাটা কতটা ঠিক?',
      idealAnswer:
        "আংশিক ঠিক। Request-এর সময় যখন অনেক কম-বেশি হয়, তখন least connections ভালো, কারণ ভারী কাজ যার কাছে তার connection খোলা থাকে আর সে নতুন কাজ কম পায়। কিন্তু এটা connection গোনে, আসল ভার না। কম connection-এর server-এ সবগুলো ভারী কাজ থাকতে পারে, idle WebSocket connection গোনাকে ভুল করে, আর যে server ১ms-এ error দিয়ে দেয় তার connection সবসময় কম বলে সে সবচেয়ে বেশি request পায় (black hole)। তাই least connections-এর সাথে error দেখে server বাদ দেওয়া (passive health check) লাগে, আর সব server ও request সমান হলে round robin-ই সরল ও যথেষ্ট।",
    },
    {
      question:
        "Health check interval ১০ সেকেন্ড আর unhealthy threshold ৩। একটা server crash করলে user-রা কতক্ষণ error দেখতে পারে? এটা কমানোর দুটো উপায় আর তাদের দাম বলুন।",
      idealAnswer:
        "Detection-এ মোটামুটি interval × threshold = ৩০ সেকেন্ড, সবচেয়ে খারাপ ক্ষেত্রে শেষ check-এর timeout যোগ হয়। এই সময়ে মরা server-এর ভাগের request fail করে। উপায় ১: interval বা threshold কমানো; দাম হলো একটা হারানো packet বা GC pause-এ সুস্থ server বাদ পড়া (flapping) আর বেশি health check traffic। উপায় ২: LB-তে retry আর passive health check; দাম হলো retry শুধু নিরাপদ request-এ (idempotent বা connect-ই হয়নি) চলে, আর সব স্তরে retry দিলে retry storm হতে পারে।",
    },
    {
      question:
        "Sticky session দিয়ে cart হারানোর সমস্যা মিটে গেল। তাহলে stateless server বানানোর ঝামেলা কেন নেবেন?",
      idealAnswer:
        "Sticky session সমস্যা ঢাকে, সারায় না। Cart তখনো একটা server-এর memory-তে, তাই সেই server crash বা deploy হলে cart হারায়। ব্যস্ত user-রা এক server-এ আটকে থাকায় ভার অসমান হয়, নতুন server যোগ করলে পুরনো user সরে না, আর scale-in বা deploy করতে session শেষ হওয়ার অপেক্ষা লাগে। IP-ভিত্তিক হলে CGNAT-এ hot spot আর IP বদলালে stickiness ভাঙা যোগ হয়। Session shared store-এ রাখলে যেকোনো server যেকোনো request নিতে পারে, LB স্বাধীনভাবে সেরা algorithm বাছে, আর server হারানো মানে শুধু capacity কমা, data হারানো না।",
    },
  ],

  interviewQuestions: [
    {
      question: "L4 আর L7 load balancer-এর পার্থক্য কী, আর কখন কোনটা বাছবেন?",
      answerOutline: `- L4: IP/port দেখে connection ভাগ করে, ভেতরে খোলে না; দ্রুত, কম CPU, যেকোনো TCP/UDP protocol
- L7: connection terminate করে HTTP পড়ে, প্রতিটা request আলাদা ভাগ; path/host/header routing, cookie stickiness, retry, header যোগ
- TLS: L7 সুবিধার জন্য termination বা re-encryption লাগে; passthrough-এ শুধু L4 (বড়জোর SNI)
- HTTP/2/gRPC-এর লম্বা connection-এ L4 অসমান ভাগ করে, request-level L7 লাগে
- প্রায়ই দুটোই: সামনে L4 (বিপুল connection, active-active), পেছনে L7 (routing)`,
    },
    {
      question:
        "আপনার পেছনে তিনটা server-এর ক্ষমতা আলাদা, আর কিছু request ১০ গুণ ভারী। কোন algorithm বাছবেন?",
      answerOutline: `- শুধু ক্ষমতা আলাদা, request সমান: weighted round robin, weight = ক্ষমতার অনুপাত
- Request-এর ভার অসমান: least connections (weighted), কারণ ভারী কাজ connection খোলা রাখে
- Server-এর গতি সময়ে সময়ে বদলায়: least response time বা power of two choices
- সাবধানতা: connection ≠ ভার, black hole (দ্রুত error দেওয়া server), তাই passive health check/outlier detection
- সম্ভব হলে খুব ভারী কাজ আলাদা pool-এ (L7 routing) বা queue-তে`,
    },
    {
      question:
        "Load balancer নিজেই যেন single point of failure না হয়, কিভাবে design করবেন?",
      answerOutline: `- Active-passive: দুই LB, floating IP, keepalived/VRRP heartbeat; failover কয়েক সেকেন্ড, চলমান connection কাটতে পারে; split brain-এর ঝুঁকি
- Active-active: DNS-এ একাধিক IP বা router-এর ECMP দিয়ে কয়েকটা LB; N+1 capacity
- Region-স্তরে: DNS-based GSLB (TTL-এর সীমা) বা anycast
- Managed cloud LB, যেটা নিজেই redundant
- স্তরে স্তরে: anycast/DNS → L4 দল → L7 দল → app`,
    },
    {
      question:
        "Health check কিভাবে design করবেন যাতে দ্রুত ধরে কিন্তু নিজেই outage না বানায়?",
      answerOutline: `- Active (probe) + passive (আসল request-এর error / outlier detection)
- Interval, timeout, unhealthy/healthy threshold; detection ≈ interval × threshold
- Flapping এড়াতে threshold > 1, ফেরাতে কয়েকটা success
- Health endpoint শুধু নিজের অবস্থা দেখুক, shared dependency না; নইলে সব server একসাথে বাদ
- সব unhealthy হলে fail open / panic threshold
- Detection-এর ফাঁক ঢাকতে নিরাপদ retry`,
    },
    {
      question: "Zero-downtime deploy-এ load balancer-এর ভূমিকা কী?",
      answerOutline: `- Rolling deploy: একটা একটা server rotation থেকে বের করা
- Connection draining / deregistration delay: নতুন request বন্ধ, চলমানগুলো শেষ হতে দেওয়া
- App-এ graceful shutdown: SIGTERM-এ readiness fail, নতুন কাজ বন্ধ, চলমান কাজ শেষ, keep-alive বন্ধ
- নতুন server-এ health check পাস করার পরে traffic, প্রয়োজনে slow start
- Canary: L7 rule দিয়ে অল্প traffic নতুন version-এ, metrics দেখে বাড়ানো
- Draining সময়ের trade-off: লম্বা = ধীর deploy, ছোট = কাটা request`,
    },
  ],

  summary: {
    points: [
      "Load Balancer কয়েকটা server-এর সামনে একটাই প্রবেশপথ: request ভাগ করে, অসুস্থ server বাদ দেয়, আর server-দের লুকিয়ে রাখে।",
      "L4 দেখে শুধু IP আর port, connection ভাগ করে, দ্রুত; L7 TLS খুলে path, header, cookie দেখে প্রতিটা request ভাগ করে, বেশি ক্ষমতা আর বেশি CPU।",
      "Algorithm বাছুন server আর request-এর ধরন দেখে: সমান হলে round robin, অসমান server-এ weighted, অসমান request-এ least connections, অনেক LB node-এ power of two choices।",
      "IP hash CGNAT-এর পেছনের হাজার user-কে এক server-এ জমায়; stickiness লাগলে cookie বা user id, আর সবচেয়ে ভালো stateless server।",
      "Health check-এ detection ≈ interval × threshold; বেশি কড়া হলে flapping, আর shared dependency পরীক্ষা করলে সব server একসাথে বাদ।",
      "Deploy-এ connection draining আর graceful shutdown; retry শুধু নিরাপদ request-এ আর এক স্তরে, নইলে retry storm।",
      "Load balancer নিজেও SPOF: floating IP সহ active-passive, active-active, আর region-স্তরে DNS/GSLB বা anycast।",
    ],
    diagram: {
      id: "day-009-summary",
      caption: "এক নজরে Load Balancers",
      alt: "Users থেকে Load Balancer, সেখান থেকে algorithm দিয়ে Server 1 আর Server 2-তে, আর health check-এ fail করা লাল Server 3-এর দিকে ড্যাশ দেওয়া তীর।",
    },
  },
};
