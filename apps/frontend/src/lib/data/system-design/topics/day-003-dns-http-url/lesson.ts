// Day 3 · DNS, HTTP ও একটি URL-এর গল্প — introductory lesson (Day 40 goes deeper into DNS, Day 42 into HTTP versions).

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

export const day003Lesson: SdLesson = {
  topicId: "sd-day-003",
  day: 3,
  title: "DNS, HTTP ও একটি URL-এর গল্প",
  definition:
    "URL বলে কী চাই আর কোথায় চাই; DNS সেই নামকে IP-তে বদলায়, তারপর TCP আর TLS দিয়ে নিরাপদ রাস্তা খুলে browser HTTP-তে request পাঠায় আর server response দেয়।",

  objectives: [
    "একটা URL-কে scheme, host, port, path, query আর fragment-এ ভেঙে বলতে পারবেন, আর কোন অংশ server পর্যন্ত যায় না তা জানবেন।",
    "DNS resolver, root, TLD আর authoritative server মিলে কিভাবে একটা নামকে IP-তে বদলায়, আর browser, OS ও resolver-এর cache আর TTL কী ভূমিকা রাখে, ধাপে ধাপে এঁকে দেখাতে পারবেন।",
    "একটা HTTP request আর response-এর গঠন (method, header, status code, body) পড়ে বুঝতে পারবেন, আর 2xx/3xx/4xx/5xx দেখে সমস্যা কোন দিকে তা আন্দাজ করতে পারবেন।",
    '"DNS propagation" যে আসলে TTL-এর মেয়াদ শেষ হওয়া, তা বুঝে একটা server migration-এর আগে TTL কমানোর পরিকল্পনা করতে পারবেন।',
    "HTTP কেন stateless, keep-alive কেন latency কমায়, আর redirect, HSTS ও HTTPS কেন সবখানে দরকার, যুক্তি দিয়ে বলতে পারবেন।",
  ],

  prerequisites: [
    { day: 1, title: "সিস্টেম ডিজাইন আসলে কী?", href: topicHrefForDay(1) },
    { day: 2, title: "Client, Server ও Internet", href: topicHrefForDay(2) },
  ],

  problem: {
    markdown: `Day 2-এ আমাদের "বইঘর" দোকানটা একটা server-এ উঠেছিল। Server-এর public IP \`203.0.113.10\`। খুশিতে আপনি এই IP-টাই flyer-এ ছাপিয়ে দিলেন, Facebook page-এ দিলেন, ক্রেতাদের SMS-এ পাঠালেন: "\`http://203.0.113.10\`-এ ঢুকে বই কিনুন।"

তিন মাস পর তিনটা সমস্যা একসাথে এলো:

1. **নম্বর কেউ মনে রাখে না।** ক্রেতারা ফোন করে বলে, "ভাই, ওই ২০৩ দিয়ে শুরু ঠিকানাটা আবার দেন।" অনেকে ভুল নম্বর টাইপ করে অন্য কারও server-এ চলে যায়।
2. **Server বদলালে সব ঠিকানা মরে যায়।** কম খরচের একটা নতুন hosting-এ সরলেন, নতুন IP \`198.51.100.20\`। পুরনো server বন্ধ করতেই flyer, SMS, Facebook post, সব ঠিকানা অচল। ক্রেতাদের হাতে থাকা ঠিকানা আপনি বদলাতে পারেন না।
3. **"সাইট খুলছে না", কিন্তু কোথায় ভাঙল?** একদিন এক ক্রেতা লিখল, "আপনার সাইট খোলে না।" আপনি জানেন না সমস্যা কোথায়: ঠিকানা খোঁজায়, connection খোলায়, নিরাপত্তা যাচাইয়ে, নাকি server-এর code-এ। Browser-এর address bar-এ Enter চাপা আর page দেখার মাঝে যে ৬-৭টা ধাপ আছে, সেগুলো না চিনলে খোঁজা শুরু করারই জায়গা নেই।

প্রথম দুটো সমস্যার মূলে একটা জিনিস: **ক্রেতা সরাসরি machine-এর ঠিকানা ধরে রেখেছে।** আমাদের দরকার একটা মানুষের মনে রাখার মতো **নাম**, যেটা স্থায়ী থাকবে, আর মাঝে কেউ একজন সেই নামকে বর্তমান IP-তে বদলে দেবে। তৃতীয় সমস্যার সমাধান হলো পুরো যাত্রাটা ধাপে ধাপে চেনা। আজকের lesson এই দুটো নিয়েই।`,
    diagrams: [
      {
        id: "day-003-before",
        caption:
          "আগে: ক্রেতারা সরাসরি পুরনো IP ধরে রেখেছে; server সরানোর পর সেই ঠিকানা অচল, আর নতুন server-এর খবর কেউ জানে না।",
        alt: "দুজন client সরাসরি 203.0.113.10 ঠিকানার পুরনো server-এ যাচ্ছে, server-টা লাল চিহ্নে বন্ধ; পাশে 198.51.100.20-এর নতুন server ঝাপসা, কোনো তীর নেই।",
      },
    ],
  },

  analogy: {
    markdown: `ধরুন আপনি গ্রাম থেকে ঢাকায় এসেছেন, নিউ মার্কেটের "বইঘর" দোকান থেকে একটা বই কিনবেন। দোকানের নাম জানেন, কিন্তু দোকান নম্বর জানেন না।

**১. রিকশাওয়ালা মামা (Resolver):** আপনি রিকশায় উঠে বললেন, "মামা, নিউ মার্কেটের বইঘর।" মামা যদি গত সপ্তাহেই কাউকে সেখানে নিয়ে গিয়ে থাকেন, সরাসরি নিয়ে যাবেন। এটা তাঁর **মনে রাখা (cache)**। না জানলে তিনি আপনার হয়ে খোঁজ নেবেন, আপনাকে কিছু করতে হবে না।

**২. মোড়ের ট্রাফিক পুলিশ (Root server):** মামা প্রথমে জিজ্ঞেস করলেন। পুলিশ দোকান চেনেন না, শুধু বললেন, "নিউ মার্কেট? ওই দিকে যান, মার্কেট সমিতির অফিসে জিজ্ঞেস করেন।"

**৩. মার্কেট সমিতির অফিস (TLD server):** সমিতি সব দোকানের খবর রাখে না, কিন্তু জানে কোন ব্লক কে দেখে: "বইঘর তো B ব্লকে, ব্লকের ম্যানেজার সাহেব বলতে পারবেন।"

**৪. B ব্লকের ম্যানেজার (Authoritative server):** উনিই আসল খাতা রাখেন। "বইঘর, দোকান নং ২১৪।" এই উত্তরটাই চূড়ান্ত।

মামা আপনাকে ২১৪-এর সামনে নামিয়ে দিলেন, আর ঠিকানাটা কয়েক দিন মনে রাখবেন। সেটাই **TTL**: কতদিন মনে রাখা নিরাপদ। দোকান সরে গেলে মামার পুরনো স্মৃতি কিছুদিন ভুল জায়গায় নিয়ে যেতে পারে।

এবার দোকানে ঢুকে:
- দেয়ালে ঝোলানো **trade license** দেখে নিশ্চিত হলেন এটাই আসল বইঘর, নকল দোকান না। এটা **TLS certificate**।
- দোকানদারকে একটা নির্দিষ্ট ভঙ্গিতে বললেন: "জীবনানন্দের *রূপসী বাংলা*, paperback, একটা।" এটা **HTTP request**।
- দোকানদার বললেন "আছে, এই নিন" (**200 OK**), অথবা "আমরা ২১৮-তে সরে গেছি, ওখানে যান" (**301 redirect**), অথবা "এই বই নেই" (**404**), অথবা "ভেতরে গোলমাল, পরে আসেন" (**500/503**)।
- বইয়ের সাথে একটা চিরকুট দিলেন: "মলাট আর bookmark পাশের counter থেকে নিন।" আপনি আবার গিয়ে সেগুলোও নিলেন। এটা **follow-up request** (CSS, ছবি, JavaScript)।

আর দোকানদার আপনাকে মনে রাখেন না। পরের বার গেলে আবার বলতে হবে আপনি কে। তাই তিনি আপনার হাতে একটা **মেম্বারশিপ কার্ড** দিয়ে দিলেন, প্রতিবার দেখালেই হবে। এটাই **cookie**।`,
    diagrams: [
      {
        id: "day-003-analogy",
        caption:
          "নিউ মার্কেটে দোকান খোঁজা: রিকশাওয়ালা মামা পুলিশ, সমিতি আর ব্লক ম্যানেজারকে জিজ্ঞেস করে দোকান নম্বর বের করেন, তারপর আপনি দোকানে গিয়ে বই চান।",
        alt: "বামে আপনি আর রিকশাওয়ালা মামা; মামা ক্রমানুসারে ট্রাফিক পুলিশ, মার্কেট সমিতি আর ব্লক ম্যানেজারকে জিজ্ঞেস করছেন; শেষে দোকান নং ২১৪, যেখানে trade license ঝোলানো আর দোকানদার বই দিচ্ছেন।",
      },
    ],
  },

  coreConcept: {
    markdown: `Address bar-এ একটা URL লিখে Enter চাপলে মোটামুটি ছয়টা কাজ হয়: **URL পড়া → DNS দিয়ে নাম থেকে IP → TCP connection → TLS handshake → HTTP request/response → render আর বাকি জিনিস আনা।** একটা একটা করে দেখি।

**১. URL: কী চাই, আর কোথায় চাই**

\`https://www.boighor.com:443/books/search?q=jibanananda&page=2#reviews\`

- **Scheme** (\`https\`): কোন protocol-এ কথা হবে। \`https\` মানে HTTP, কিন্তু TLS দিয়ে encrypt করা।
- **Host** (\`www.boighor.com\`): কোন machine। এটা নাম, IP না। এটাকেই DNS IP-তে বদলাবে।
- **Port** (\`443\`): machine-এর কোন program (Day 2-এর কথা)। না লিখলে scheme অনুযায়ী default ধরা হয়: \`http\` হলে 80, \`https\` হলে 443। তাই সাধারণত URL-এ port দেখা যায় না।
- **Path** (\`/books/search\`): server-এর ভেতরে কোন জিনিস (resource)।
- **Query** (\`?q=jibanananda&page=2\`): বাড়তি শর্ত, \`key=value\` জোড়া, \`&\` দিয়ে আলাদা। খোঁজা, filter, page নম্বর এখানে যায়।
- **Fragment** (\`#reviews\`): page-এর ভেতরে কোন অংশে যাবে। **এটা server-এ পাঠানোই হয় না**, browser নিজে ব্যবহার করে।

URL-এ space বা বাংলা অক্ষরের মতো কিছু থাকলে সেগুলো \`%\` দিয়ে encode হয়ে যায় (যেমন space হয় \`%20\`), কারণ URL-এ শুধু নির্দিষ্ট কিছু অক্ষর সরাসরি চলে।

**২. DNS: Internet-এর phone book**

**DNS** (Domain Name System) নাম থেকে IP বের করে। আপনার phone-এর contact list-এর মতো: আপনি "আম্মু" চাপেন, phone নম্বর dial করে। নামটা স্থায়ী, নম্বর বদলালে শুধু contact-টা update করতে হয়। বইঘরের সমস্যার সমাধান এটাই: ক্রেতারা মনে রাখবে \`boighor.com\`, server সরালে আমরা শুধু DNS-এ নতুন IP বসাব।

নামটা খুঁজে দিতে চার রকম server কাজ করে:
- **Recursive resolver**: আপনার হয়ে পুরো খোঁজটা করে। সাধারণত আপনার ISP-র, অথবা public resolver যেমন Cloudflare-এর \`1.1.1.1\` বা Google-এর \`8.8.8.8\`। (রিকশাওয়ালা মামা)
- **Root server**: DNS গাছের একদম মাথা। নাম চেনে না, শুধু বলে \`.com\`-এর খবর কোন server রাখে।
- **TLD server** (Top-Level Domain: \`.com\`, \`.org\`, \`.bd\`): বলে \`boighor.com\`-এর দায়িত্ব কোন name server-এর।
- **Authoritative server**: যার কাছে \`boighor.com\`-এর আসল record আছে। চূড়ান্ত উত্তর এখান থেকেই আসে।

DNS-এ তথ্য থাকে **record** আকারে। আজ তিনটা জানলেই চলবে:
- **A record**: নাম → IPv4 ঠিকানা। \`boighor.com → 198.51.100.20\`
- **AAAA record**: নাম → IPv6 ঠিকানা। \`boighor.com → 2001:db8::20\`
- **CNAME record**: নাম → আরেকটা নাম (alias)। \`www.boighor.com → boighor.com\`। Resolver তখন দ্বিতীয় নামটা আবার খোঁজে।

প্রতিটা record-এর সাথে একটা **TTL** (Time To Live) থাকে, সেকেন্ডে। \`TTL 300\` মানে "এই উত্তর ৫ মিনিট পর্যন্ত মনে রাখতে পারো।" এজন্য প্রতিবার root থেকে খুঁজতে হয় না। উত্তর জমা থাকে কয়েক জায়গায়:
1. **Browser cache**: browser নিজে কিছুক্ষণ মনে রাখে।
2. **OS cache**: আপনার computer-এর operating system। (\`/etc/hosts\` file-ও এখানে আগে দেখা হয়।)
3. **Resolver cache**: ISP-র resolver হাজার হাজার মানুষের উত্তর মনে রাখে, তাই জনপ্রিয় নাম প্রায় সবসময় সেখানে তৈরি থাকে।

Cache-এর লাভ গতি, আর দাম হলো **পুরনো উত্তর**: IP বদলালেও TTL শেষ না হওয়া পর্যন্ত কেউ কেউ পুরনো IP পাবে। এই trade-off-টাই deep dive-এ খুলে দেখব।

**৩. TCP আর TLS: রাস্তা খোলা আর পরিচয় যাচাই**

IP পাওয়ার পর browser server-এর 443 port-এ একটা **TCP connection** খোলে। এর জন্য একটা ছোট handshake লাগে, খরচ প্রায় এক round trip (RTT)। TCP নিশ্চিত করে data ক্রমমতো আর হারানো ছাড়া পৌঁছাবে। (TCP vs UDP-এর পুরো তুলনা Day 39-এ।)

তারপর **TLS handshake**: server একটা **certificate** দেখায়, যেটা একটা বিশ্বস্ত প্রতিষ্ঠান (Certificate Authority) সই করেছে। Browser যাচাই করে certificate-টা সত্যিই \`www.boighor.com\`-এর কিনা। মিললে দুপক্ষ একটা গোপন key ঠিক করে, এরপর সব data encrypt হয়ে যায়। (TLS 1.3-এ এতে সাধারণত আরও এক RTT লাগে। বিস্তারিত Day 41-এ।)

**৪. HTTP: request আর response-এর ভাষা**

এখন browser একটা **HTTP request** পাঠায়। এটা আসলে নির্দিষ্ট নিয়মে লেখা text (Day 2-এর lab-এ netcat দিয়ে দেখেছিলেন):

\`\`\`http
GET /books/search?q=jibanananda&page=2 HTTP/1.1
Host: www.boighor.com
User-Agent: Mozilla/5.0 ...
Accept: text/html
Cookie: session=a8f3k2
\`\`\`

- **Method** বলে কী করতে চাই। \`GET\`: কিছু আনো। \`POST\`: নতুন কিছু পাঠাও (order দাও)। \`PUT\`/\`PATCH\`: বদলাও। \`DELETE\`: মুছে ফেলো। (API-র দৃষ্টিতে এগুলো Day 4-এ আরও দেখব।)
- **Header** হলো \`নাম: মান\` আকারে বাড়তি তথ্য। \`Host\` বলে কোন site চাই, কারণ একটা IP-তে অনেকগুলো site থাকতে পারে।
- **Body** ঐচ্ছিক। \`GET\`-এ সাধারণত থাকে না; \`POST\`-এ form বা JSON data থাকে।

Server উত্তর দেয় একটা **HTTP response**:

\`\`\`http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 18432
Cache-Control: max-age=60

<!doctype html> ...
\`\`\`

প্রথম লাইনের **status code** তিন অঙ্কের। প্রথম অঙ্কটাই বলে দেয় কী হলো:
- **2xx · সফল**: \`200 OK\`, \`201 Created\` (নতুন কিছু তৈরি হলো), \`204 No Content\` (সফল, কিন্তু body নেই)
- **3xx · অন্য জায়গায় দেখো**: \`301 Moved Permanently\`, \`302 Found\` (সাময়িক), \`304 Not Modified\` (আপনার কাছে যা আছে সেটাই চলবে)
- **4xx · Client-এর ভুল**: \`400 Bad Request\`, \`401 Unauthorized\` (কে আপনি? login করুন), \`403 Forbidden\` (চিনি, কিন্তু অনুমতি নেই), \`404 Not Found\`, \`429 Too Many Requests\`
- **5xx · Server-এর ভুল**: \`500 Internal Server Error\` (code-এ কিছু ভেঙেছে), \`502 Bad Gateway\` (মাঝের proxy বা load balancer পেছনের server থেকে ভাঙা বা অচল উত্তর পেয়েছে), \`503 Service Unavailable\` (server এখন ব্যস্ত বা maintenance-এ), \`504 Gateway Timeout\` (মাঝের proxy পেছনের server-এর উত্তর সময়মতো পায়নি)

একটা কাজের নিয়ম: **4xx দেখলে আগে request দেখুন, 5xx দেখলে আগে server দেখুন।**

**৫. Cookie: এক নজরে**

HTTP নিজে আগের request মনে রাখে না (কেন, সেটা deep dive-এ)। তাই login-এর পর server response-এ একটা header পাঠায়: \`Set-Cookie: session=a8f3k2\`। Browser এটা জমা রাখে, আর ওই site-এ পরের প্রতিটা request-এ নিজে থেকে \`Cookie: session=a8f3k2\` জুড়ে দেয়। Server ওই নম্বর দেখে চেনে আপনি কে। (মেম্বারশিপ কার্ড।)

**৬. Render আর follow-up request**

প্রথম response-এ আসে শুধু HTML। Browser HTML পড়তে পড়তে দেখে আরও কী লাগবে: \`style.css\`, \`app.js\`, বইয়ের ছবি, font। প্রতিটার জন্য আলাদা HTTP request যায়, অনেক সময় অন্য domain-এ (যেমন CDN, Day 11), আর তখন সেগুলোর জন্যও DNS lookup হয়। একটা সাধারণ page খুলতে কয়েক ডজন request হওয়া খুবই স্বাভাবিক। CSS আসার পর browser page আঁকে (render), JavaScript চলে, আর আপনি বইয়ের তালিকা দেখেন।

এই যাত্রার প্রতিটা ধাপ আলাদাভাবে ভাঙতে পারে, আর প্রতিটা ভাঙার লক্ষণ আলাদা। "Server not found" মানে DNS; "connection refused" বা timeout মানে TCP; certificate warning মানে TLS; 404 বা 500 মানে HTTP পর্যন্ত পৌঁছেছেন, সমস্যা request বা server-এর code-এ। বইঘরের তৃতীয় সমস্যার উত্তর এটাই।

এখন এটুকু জানলেই চলবে। DNS-এর ভেতরের সব record, DNSSEC আর resolver-এর কাজ Day 40-এ, আর HTTP/1.1, HTTP/2, HTTP/3-এর পার্থক্য Day 42-এ গভীরে যাব।`,
    diagrams: [
      {
        id: "day-003-url",
        caption:
          "একটা URL-এর ছয়টা অংশ; fragment (#reviews) browser-এর কাছেই থাকে, server পর্যন্ত যায় না।",
        alt: "https://www.boighor.com:443/books/search?q=jibanananda&page=2#reviews URL-টা রঙিন খণ্ডে ভাগ করা: scheme, host, port, path, query, fragment; নিচে একই রঙে প্রতিটার নাম আর ছোট ব্যাখ্যা।",
      },
      {
        id: "day-003-main",
        caption:
          "পুরো ছবি: browser আগে resolver-এর কাছে IP চায়, resolver root, TLD আর authoritative server ঘুরে উত্তর আনে; তারপর browser সরাসরি server-এ TCP, TLS আর HTTP চালায়।",
        alt: "Browser থেকে DNS Resolver-এ তীর; Resolver থেকে Root, TLD (.com) আর Authoritative server-এ তিনটা তীর; Browser থেকে boighor.com server-এ HTTPS তীর, server-এর পাশে database।",
        downloadable: true,
      },
      {
        id: "day-003-http-message",
        caption:
          "HTTP request আর response দুটোরই একই গঠন: প্রথম লাইন, header, খালি লাইন, তারপর ঐচ্ছিক body।",
        alt: "বামে একটা HTTP request: method, path, version, তার নিচে Host, Accept, Cookie header, খালি লাইন; ডানে response: status line 200 OK, Content-Type, Cache-Control, Set-Cookie header, খালি লাইন আর HTML body।",
      },
      {
        id: "day-003-before-after",
        caption:
          "পাশাপাশি: IP ছাপালে server সরানো মানে সব ঠিকানা অচল; নাম ছাপালে শুধু DNS record বদলালেই সবাই নতুন server-এ যায়।",
        alt: "উপরে আগের design, যেখানে client সরাসরি পুরনো IP-তে যায় আর server বন্ধ; নিচে পরের design, যেখানে client আগে DNS-কে নাম জিজ্ঞেস করে আর নতুন server-এর IP পায়।",
      },
    ],
  },

  deepDive: [
    {
      title: "পুরো যাত্রা ধাপে ধাপে: recursive আর iterative resolution",
      markdown: `DNS-এ দুই ধরনের প্রশ্ন করা হয়, আর পার্থক্যটা হলো **কে খাটে**।

- **Recursive query**: আপনার computer-এর ছোট্ট DNS client (একে বলে **stub resolver**) resolver-কে বলে, "পুরো উত্তর এনে দাও।" নিজে আর কিছু করে না। এক প্রশ্ন, এক উত্তর।
- **Iterative query**: Resolver নিজে root-কে জিজ্ঞেস করে। Root উত্তর দেয় না, শুধু **referral** দেয়: "\`.com\`-এর server-দের জিজ্ঞেস করো।" Resolver তখন TLD-কে জিজ্ঞেস করে, সেও referral দেয়: "\`boighor.com\`-এর name server \`ns1.example-dns.net\`।" শেষে authoritative server আসল উত্তর দেয়।

কেন এই ভাগ? Root আর TLD server-গুলো পৃথিবীর সব resolver-এর প্রশ্ন পায়। এরা যদি নিজেরা পুরো খোঁজ করে দিত, তাদের উপর কাজ আর memory অনেক গুণ বেড়ে যেত। Referral দেওয়া সস্তা: শুধু "পরের জন ওই"। ভারী কাজটা resolver করে, আর সে উত্তর cache করে রাখে বলে পরের লাখো মানুষের জন্য আর খুঁজতে হয় না। বাস্তবে resolver-এর cache-এ \`.com\`-এর TLD server-দের ঠিকানা প্রায় সবসময় থাকে, তাই root পর্যন্ত যাওয়া খুব কমই লাগে।

কয়েকটা জিনিস জানা কাজে দেয়:
- DNS query সাধারণত **UDP port 53**-এ যায়, কারণ প্রশ্ন-উত্তর ছোট আর একটা packet-এই হয়ে যায়, connection খোলার খরচ লাগে না। উত্তর বড় হলে TCP-তে চলে যায়।
- **Root server** ১৩টা নামে (a থেকে m.root-servers.net), কিন্তু প্রতিটা নামের পেছনে বিশ্বজুড়ে অনেকগুলো copy, **anycast** দিয়ে: একই IP অনেক জায়গা থেকে announce করা হয়, আর আপনার packet কাছেরটায় যায়।
- পুরনো DNS-এ প্রশ্ন-উত্তর encrypt হয় না, তাই পথের যে কেউ দেখতে পারে আপনি কোন site খুঁজছেন। **DNS over HTTPS (DoH)** আর **DNS over TLS (DoT)** এটা ঠিক করে।

নিচের ধাপগুলোতে Enter চাপা থেকে page দেখা পর্যন্ত পুরো যাত্রা দেখুন। খেয়াল করুন, DNS-এর ধাপগুলো (১-৮) শুধু প্রথমবার; cache-এ থাকলে browser সরাসরি ৯ নম্বর ধাপে চলে যায়।`,
      diagrams: [
        {
          id: "day-003-journey",
          caption:
            "ধাপে ধাপে: cache miss হলে resolver root → TLD → authoritative ঘুরে IP আনে; তারপর TCP, TLS, HTTP আর follow-up request।",
          alt: "Browser, Resolver, Root, TLD, Authoritative আর Web Server-এর মধ্যে sequence diagram: DNS-এর প্রশ্ন আর referral, তারপর TCP ও TLS handshake, GET request, 200 OK, আর CSS/ছবির জন্য আরও request।",
        },
        {
          id: "day-003-dns-tree",
          caption:
            "DNS একটা গাছ: root-এর নিচে TLD, তার নিচে domain; প্রতিটা স্তর শুধু তার ঠিক নিচের স্তরের দায়িত্ব কাকে দেওয়া আছে তা জানে।",
          alt: "উপরে root (.), তার নিচে com, org, bd; com-এর নিচে boighor.com আর example.com, org-এর নিচে wikipedia.org, bd-এর নিচে com.bd; boighor.com-এর নিচে www আর api; root → com → boighor.com → www পথটা হাইলাইট করা।",
        },
      ],
    },
    {
      title: '"DNS propagation" আসলে TTL-এর মেয়াদ শেষ হওয়া',
      markdown: `অনেকে বলে, "DNS বদলেছি, ২৪-৪৮ ঘণ্টা লাগবে propagate হতে।" যেন নতুন IP-টা ধীরে ধীরে পৃথিবীজুড়ে ছড়াচ্ছে। আসলে কিছুই ছড়ায় না।

Authoritative server-এ record বদলানোর **সাথে সাথেই** নতুন উত্তর তৈরি। কেউ যদি এখন authoritative-কে সরাসরি জিজ্ঞেস করে, নতুন IP পাবে। সমস্যা হলো বাকিরা authoritative-কে জিজ্ঞেস করছেই না, কারণ তাদের resolver-এর cache-এ পুরনো উত্তর আছে, আর সেটার TTL এখনো শেষ হয়নি। প্রতিটা cache নিজের সময়ে মেয়াদ শেষ করে আবার জিজ্ঞেস করে। তাই "propagation" আসলে হাজারো আলাদা cache-এর **আলাদা আলাদা সময়ে মেয়াদ শেষ হওয়া**।

**হিসাবটা সোজা:** পুরনো record-এর TTL ছিল ৮৬,৪০০ সেকেন্ড (২৪ ঘণ্টা)। আপনি দুপুর ১২টায় বদলালেন। একটা resolver ঠিক ১১:৫৯-এ পুরনো উত্তরটা cache করেছিল। সে পরের দিন ১১:৫৯ পর্যন্ত পুরনো IP দেবে। অর্থাৎ **সবচেয়ে খারাপ ক্ষেত্রে অপেক্ষা = পুরনো TTL**, নতুন TTL না।

তাই server migration-এর সঠিক পরিকল্পনা:
1. Migration-এর অন্তত **পুরনো TTL-এর সমান সময় আগে** TTL কমিয়ে দিন, যেমন ৬০ সেকেন্ড। (TTL ২৪ ঘণ্টা হলে এক দিন আগে।)
2. সব cache নতুন, ছোট TTL পেয়ে গেলে IP বদলান। এখন বড়জোর ১ মিনিটে সবাই নতুন IP পাবে।
3. কিছু সময় পুরনো server চালু রাখুন, কারণ কিছু resolver আর app TTL পুরোপুরি মানে না।
4. সব ঠিক থাকলে TTL আবার বাড়িয়ে দিন।

**TTL কত রাখবেন, সেটা একটা trade-off:**
- **ছোট TTL** (৩০-৩০০s): বদল দ্রুত কার্যকর, failover দ্রুত। কিন্তু resolver বেশি বার জিজ্ঞেস করে, authoritative-এর উপর চাপ আর মাঝে মাঝে user-এর lookup latency বাড়ে।
- **বড় TTL** (ঘণ্টা বা দিন): দ্রুত, cache-এ সবসময় থাকে। কিন্তু ভুল record দিলে বা server পড়ে গেলে ঠিক করতে ঘণ্টার পর ঘণ্টা লাগে।

আরেকটা লুকানো ফাঁদ **negative caching**: যে নাম নেই (NXDOMAIN), সেই "নেই" উত্তরটাও cache হয়। নতুন subdomain বানানোর আগেই কেউ সেটা খুঁজে থাকলে, record যোগ করার পরেও কিছুক্ষণ তার কাছে "নেই" আসবে। কতক্ষণ, সেটা ঠিক হয় zone-এর SOA record থেকে।`,
      diagrams: [
        {
          id: "day-003-cache-layers",
          caption:
            "উত্তর তিন স্তরে cache হয়; প্রতিটা স্তর নিজের TTL শেষ হলেই পরের স্তরকে জিজ্ঞেস করে, তাই 'propagation' আসলে cache-এর মেয়াদ শেষ হওয়া।",
          alt: "বাম থেকে ডানে Browser, Browser cache, OS cache, Resolver cache আর Authoritative server, তীর দিয়ে জোড়া; cache miss হলে পরের স্তরে যায়, আর resolver-এর TTL শেষ হলেই প্রশ্ন authoritative-এ পৌঁছায়।",
        },
      ],
    },
    {
      title: "DNS দিয়ে traffic ভাগ: round-robin আর GeoDNS",
      markdown: `DNS শুধু ঠিকানা বলে না, **কাকে কোন ঠিকানা বলবে** সেটাও ঠিক করতে পারে। এটা system design-এ খুব শক্তিশালী একটা অস্ত্র।

**DNS round-robin:** একটা নামের জন্য একাধিক A record রাখা যায়: \`boighor.com → 198.51.100.20, 198.51.100.21, 198.51.100.22\`। Resolver সাধারণত ক্রম বদলে উত্তর দেয়, আর বেশিরভাগ client প্রথমটা ব্যবহার করে। ফলে traffic মোটামুটি তিন server-এ ভাগ হয়।

কিন্তু এর সীমাবদ্ধতা বড়:
- DNS জানে না কোন server-এর কী অবস্থা। একটা server পড়ে গেলেও তার IP দিতে থাকে, আর cache-এ থাকা উত্তর TTL পর্যন্ত বদলায়ই না।
- ভাগটা সমান হয় না। একটা বড় ISP-র resolver হাজারো user-কে একই cache-করা উত্তর দেয়, ফলে তারা সবাই একই server-এ যায়।

তাই ভেতরে আসল ভাগাভাগি সাধারণত **Load Balancer** করে, যে প্রতিটা request দেখে আর server-এর health জানে (Day 9)। DNS তখন বড় স্তরে কাজ করে।

**GeoDNS (location-ভিত্তিক উত্তর):** Authoritative server দেখে প্রশ্নটা কোথা থেকে এলো, আর কাছের data center-এর IP দেয়। ঢাকার user পায় Singapore-এর IP, লন্ডনের user পায় Frankfurt-এর। Day 2-এর propagation latency কমানোর একটা সরাসরি উপায়। AWS Route 53-এর মতো managed DNS-এ geolocation আর latency-based routing আছে।

একটা সূক্ষ্ম কথা: authoritative server user-কে দেখে না, দেখে **resolver**-কে। আপনি ঢাকায় বসে যদি এমন resolver ব্যবহার করেন যেটা অন্য দেশ থেকে প্রশ্ন করছে, ভুল অঞ্চলের উত্তর পেতে পারেন। এটা কমাতে **EDNS Client Subnet** নামে একটা extension আছে, যেখানে resolver user-এর network-এর একটা অংশ (পুরো IP না) জানিয়ে দেয়।

**CNAME-এর একটা নিয়ম:** zone-এর মূল নামে (\`boighor.com\`, যাকে বলে **apex**) CNAME দেওয়া যায় না, কারণ সেখানে অন্য record (যেমন NS, SOA) থাকতেই হয়, আর CNAME অন্য record-এর সাথে থাকতে পারে না। তাই অনেক DNS provider নিজস্ব সমাধান দেয় (যেমন Route 53-এর alias record, Cloudflare-এর CNAME flattening), যেগুলো ভেতরে নাম খুঁজে A record হিসেবে উত্তর দেয়।

Global traffic management, failover আর multi-region design নিয়ে Day 88-এ পুরোটা দেখব।`,
    },
    {
      title: "HTTP কেন stateless, আর cookie দিয়ে কিভাবে state আসে",
      markdown: `**Stateless** মানে প্রতিটা HTTP request নিজের মধ্যেই সম্পূর্ণ। Server আগের request-এর কথা মনে রাখতে বাধ্য না। আপনি এইমাত্র login করেছেন, পরের request-এ server নিজে থেকে সেটা জানে না।

এটা দুর্বলতা মনে হলেও ইচ্ছাকৃত, আর এর লাভ বিশাল:
- **যেকোনো server যেকোনো request সামলাতে পারে।** Request-এর মধ্যেই সব তথ্য আছে, তাই load balancer যেকোনো server-এ পাঠাতে পারে। Server বাড়ানো-কমানো সহজ (Day 5, Day 14)।
- **Server-এর memory বাঁচে।** লাখো user-এর "কথোপকথন কোথায় আছে" মনে রাখতে হয় না।
- **Fail করলে সহজ।** একটা server মারা গেলে কারও অর্ধেক-শেষ কথোপকথন হারায় না।
- **মাঝের জিনিসগুলো কাজ করতে পারে।** Proxy আর CDN একটা request একা দেখেই বুঝতে পারে সেটা cache থেকে দেওয়া যায় কিনা।

কিন্তু app-এর তো state লাগে: login, cart, ভাষা। সমাধান হলো **state-টা প্রতিটা request-এর সাথে পাঠানো**। Cookie সেটাই করে:

\`\`\`http
Set-Cookie: session=a8f3k2; HttpOnly; Secure; SameSite=Lax; Max-Age=86400
\`\`\`

- \`HttpOnly\`: JavaScript এই cookie পড়তে পারবে না। কোনো XSS bug থাকলেও session চুরি কঠিন হয়।
- \`Secure\`: শুধু HTTPS-এ পাঠানো হবে।
- \`SameSite\`: অন্য site থেকে আসা request-এ cookie যাবে কিনা। CSRF আক্রমণ কমায়।
- \`Max-Age\` / \`Expires\`: কতদিন থাকবে। না দিলে browser বন্ধ করলেই মুছে যায় (session cookie)।

দুটো সাধারণ ধরন: cookie-তে শুধু একটা random **session id** রাখা, আর আসল তথ্য server-এর একটা shared store-এ (যেমন Redis); অথবা একটা সই করা **token** (যেমন JWT), যেটার মধ্যেই তথ্য থাকে। দুটোতেই server-গুলো নিজেরা stateless থাকে। Session store কোথায় রাখবেন আর এর trade-off নিয়ে Day 14-এ, JWT নিয়ে Day 75-এ।

মনে রাখবেন, cookie ওই domain-এর **প্রতিটা** request-এ যায়, ছবি আর CSS-এর request-এও। ১০টা বড় cookie মানে প্রতিটা request-এ কয়েক KB বাড়তি। অনেক site এজন্য ছবি আর static file আলাদা domain থেকে দেয়।`,
    },
    {
      title: "Keep-alive আর connection reuse: round trip বাঁচানো",
      markdown: `Day 2-এ দেখেছিলাম, দূরত্ব কমানো ছাড়া round trip-এর সময় কমে না। তাই আসল কৌশল হলো **round trip-এর সংখ্যা** কমানো।

একটা হিসাব করি। বইঘরের server Singapore-এ, ঢাকা থেকে RTT ধরি ৫০ms। প্রতিটা নতুন HTTPS connection-এ:
- TCP handshake: ১ RTT
- TLS 1.3 handshake: ১ RTT
- তারপর request আর response: ১ RTT

অর্থাৎ নতুন connection-এ প্রথম byte আসতেই প্রায় **৩ RTT = ১৫০ms**, server একটুও সময় না নিলেও। এখন page-এ যদি ৩০টা জিনিস থাকে, আর প্রতিটার জন্য নতুন connection খুলি, তাহলে শুধু handshake-এই নষ্ট হয় অনেক সময়।

**Keep-alive (persistent connection):** একটা connection খুলে সেটা দিয়েই একটার পর একটা request পাঠানো। HTTP/1.1-এ এটাই default। দ্বিতীয় request থেকে খরচ শুধু ১ RTT, handshake আর লাগে না। Browser HTTP/1.1-এ প্রতিটা host-এর সাথে সাধারণত কয়েকটা (প্রায় ৬টা) connection একসাথে খোলা রাখে আর ঘুরিয়ে ব্যবহার করে।

HTTP/1.1-এর সীমা হলো একটা connection-এ একসময়ে একটাই request-response চলে; সামনেরটা ধীর হলে পেছনেরগুলো আটকে থাকে (**head-of-line blocking**)। HTTP/2 একটা connection-এই অনেকগুলো request একসাথে চালায়, আর HTTP/3 TCP-র বদলে QUIC ব্যবহার করে handshake আরও কমায়। এই পার্থক্যগুলো Day 42-এ।

একই নিয়ম আপনার backend-এর ভেতরেও খাটে। আপনার service যদি প্রতিটা call-এ payment API বা database-এর সাথে নতুন connection খোলে, প্রতিবার handshake-এর দাম দিতে হয়। এজন্য **connection pool** রাখা হয়: আগে থেকে কয়েকটা connection খোলা, কাজ শেষে ফেরত, পরের কাজে আবার ব্যবহার।

দাম কী? খোলা connection server-এর memory আর file descriptor খায়। তাই server একটা **idle timeout** রাখে, অনেকক্ষণ চুপ থাকা connection বন্ধ করে দেয়। Load balancer আর backend-এর idle timeout না মিললে অদ্ভুত error আসে, যেমন হঠাৎ কিছু 502। এটা Day 9-এ মনে রাখবেন।`,
    },
    {
      title: "Redirect, HSTS আর কেন HTTPS সবখানে",
      markdown: `**Redirect** মানে server বলছে "যা চাইছেন সেটা অন্য ঠিকানায়", আর \`Location\` header-এ নতুন ঠিকানা দেয়। Browser নিজে থেকে সেখানে নতুন request পাঠায়।

| Code | অর্থ | Browser কি মনে রাখে? | Method কি বদলাতে পারে? |
|---|---|---|---|
| **301** | স্থায়ীভাবে সরে গেছে | হ্যাঁ, cache করে | পুরনো নিয়মে POST → GET হয়ে যেতে পারে |
| **302** | সাময়িক | না (নির্দেশ না থাকলে) | POST → GET হয়ে যেতে পারে |
| **307** | সাময়িক | না | না, একই method আর body |
| **308** | স্থায়ী | হ্যাঁ | না, একই method আর body |

দুটো বাস্তব শিক্ষা:
1. **301 সাবধানে দিন।** Browser 301 cache করে রাখে, অনেক সময় অনেক দিন। ভুল জায়গায় 301 দিয়ে পরে ঠিক করলেও যাদের browser মনে রেখেছে, তারা ভুল জায়গাতেই যাবে। সাময়িক কিছুর জন্য 302 বা 307।
2. **প্রতিটা redirect একটা বাড়তি round trip** (আর অন্য host হলে নতুন DNS, TCP, TLS)। \`http://boighor.com\` → \`https://boighor.com\` → \`https://www.boighor.com\` মানে user কিছু দেখার আগেই দুটো redirect। Link সবসময় চূড়ান্ত ঠিকানায় দিন।

**HTTP → HTTPS redirect-এর ফাঁক:** user \`boighor.com\` টাইপ করলে browser অনেক সময় প্রথমে \`http://\` দিয়ে চেষ্টা করে। ওই প্রথম request encrypt হয় না। একই café Wi-Fi-তে বসা কেউ ওই মুহূর্তে মাঝে ঢুকে redirect-টাই আটকে দিতে পারে, আর user-কে সাধারণ HTTP-তেই রেখে দিতে পারে (**SSL stripping**)।

**HSTS** (HTTP Strict Transport Security) এর সমাধান। Server একবার HTTPS response-এ বলে:

\`\`\`http
Strict-Transport-Security: max-age=31536000; includeSubDomains
\`\`\`

এরপর এক বছর browser এই site-এ **কখনো HTTP দিয়ে যাবে না**, নিজেই ভেতরে HTTPS বানিয়ে নেবে, আর certificate-এ সমস্যা থাকলে user-কে "তবুও এগিয়ে যান"-এর সুযোগও দেবে না। কিন্তু একদম প্রথম visit-এর আগে browser তো header দেখেনি। এজন্য **HSTS preload list** আছে: browser-এর ভেতরেই ছাপানো domain-এর তালিকা, যেগুলো প্রথম দিন থেকেই HTTPS-only।

**কেন HTTPS সবখানে, শুধু login page-এ না?**
- **গোপনীয়তা:** কোন বই দেখছেন, কী খুঁজছেন, এগুলোও ব্যক্তিগত তথ্য।
- **অখণ্ডতা (integrity):** HTTP-তে পথের যে কেউ page বদলে দিতে পারে, বিজ্ঞাপন বা ক্ষতিকর script ঢুকিয়ে দিতে পারে। এমনকি একটা HTTP page-এর login form-ও HTTPS-এ submit হলেও নিরাপদ না, কারণ form-টাই বদলে দেওয়া যায়।
- **Cookie রক্ষা:** একটা HTTP request-এ session cookie গেলেই সেটা চুরি হতে পারে।
- **আধুনিক feature-এর শর্ত:** Browser অনেক নতুন feature (যেমন service worker, location) শুধু secure context-এ দেয়, আর HTTP/2-HTTP/3 বাস্তবে প্রায় সবসময় HTTPS-এর উপর চলে।

আর খরচ? TLS 1.3-এ handshake ছোট, আধুনিক CPU-তে encryption প্রায় বিনামূল্যে, আর Let's Encrypt-এর মতো প্রতিষ্ঠান বিনা টাকায় certificate দেয়। তাই আজ HTTP রাখার কোনো যুক্তি আর নেই। TLS-এর ভেতরের handshake Day 41-এ।`,
    },
  ],

  tradeOffs: {
    markdown: `এই lesson-এ কয়েকটা সিদ্ধান্ত বারবার আসে। প্রতিটার একটা "সস্তা আর দ্রুত" দিক আছে, আর একটা "নিরাপদ আর নমনীয়" দিক।

**DNS TTL:** বদল বা failover ঘন ঘন হলে ছোট TTL; স্থির record-এ (যেমন MX, বা বছরে একবার বদলায় এমন IP) বড় TTL। Migration-এর আগে সাময়িকভাবে কমান।

**Redirect:** স্থায়ী বদলে (domain বদল, HTTPS) 301/308; পরীক্ষা, maintenance বা login-এর পরে ফেরত পাঠানোর মতো সাময়িক কাজে 302/307। POST-এর redirect-এ 307/308, যাতে body না হারায়।

**State কোথায়:** cookie-তে session id আর server-এ data, নাকি সই করা token-এ data। প্রথমটায় চাইলেই session বাতিল করা যায়, দ্বিতীয়টায় shared store লাগে না।

নিচের table-এ সবচেয়ে প্রচলিত তুলনাটা, traffic কোথায় পাঠাবেন তা DNS দিয়ে ঠিক করবেন নাকি load balancer দিয়ে:`,
    table: {
      headers: [
        "বিষয়",
        "ছোট DNS TTL (৩০-৩০০s)",
        "বড় DNS TTL (ঘণ্টা-দিন)",
        "DNS round-robin",
        "Load Balancer (Day 9)",
      ],
      rows: [
        [
          "বদল কার্যকর হতে সময়",
          "মিনিটের মধ্যে",
          "ঘণ্টা থেকে দিন",
          "TTL যত, তত",
          "প্রায় সাথে সাথে",
        ],
        [
          "Authoritative-এর উপর চাপ",
          "বেশি",
          "কম",
          "TTL অনুযায়ী",
          "প্রযোজ্য না",
        ],
        [
          "User-এর lookup latency",
          "মাঝে মাঝে বেশি (cache miss)",
          "প্রায় সবসময় cache-এ",
          "স্বাভাবিক",
          "এক IP, বাড়তি lookup নেই",
        ],
        [
          "Server পড়লে কী হয়",
          "দ্রুত সরানো যায়",
          "অনেকক্ষণ ভুল IP-তে যায়",
          "পড়া server-এর IP-ও দিতে থাকে",
          "Health check দেখে বাদ দেয়",
        ],
        [
          "ভাগ কতটা সমান",
          "প্রযোজ্য না",
          "প্রযোজ্য না",
          "অসমান (বড় resolver-এর cache)",
          "প্রতি request-এ সমানভাবে",
        ],
        [
          "উপযুক্ত",
          "Failover, migration, multi-region",
          "স্থির record",
          "খুব সহজ setup, বা region বাছাই",
          "একই region-এর ভেতরে server-দের মধ্যে ভাগ",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **Cloudflare (\`1.1.1.1\`)**, **Google Public DNS (\`8.8.8.8\`)** আর **Quad9 (\`9.9.9.9\`)** হলো জনপ্রিয় public recursive resolver। অনেকে ISP-র resolver-এর বদলে এগুলো ব্যবহার করে, গতি বা গোপনীয়তার জন্য। এরা DoH আর DoT সমর্থন করে।
- **AWS Route 53**-এর নামটাই এসেছে DNS-এর port 53 থেকে। এতে weighted, latency-based, geolocation routing আর health check-ভিত্তিক failover আছে, অর্থাৎ deep dive-এর GeoDNS ধারণাটা managed service হিসেবে।
- **Facebook, অক্টোবর ২০২১:** একটা configuration ভুলে Facebook-এর backbone network-এর সংযোগ কেটে যায়, আর তাদের DNS server-গুলো নিজেদের route (BGP) announce করা বন্ধ করে দেয়। ফলে বাইরের দুনিয়ায় \`facebook.com\` খুঁজেই পাওয়া যাচ্ছিল না। Facebook, Instagram, WhatsApp কয়েক ঘণ্টা বন্ধ ছিল। DNS কতটা মৌলিক, এটা তার সবচেয়ে বড় উদাহরণগুলোর একটা।
- **Dyn, অক্টোবর ২০১৬:** Mirai botnet দিয়ে DNS provider Dyn-এর উপর বিশাল DDoS আক্রমণ হয়, আর Dyn-এর উপর নির্ভরশীল অনেক বড় site (যেমন Twitter) অনেক user-এর কাছে খুলছিল না। শিক্ষা: একটাই DNS provider-এর উপর পুরো নির্ভরতা একটা single point of failure।
- **Let's Encrypt** (২০১৫-১৬ থেকে) বিনামূল্যে আর স্বয়ংক্রিয় (ACME protocol) TLS certificate দেওয়া শুরু করে, যেটা HTTPS-কে সবার জন্য সহজ করে দেয়। আর **Chrome 68** (২০১৮) থেকে সব HTTP page-কে "Not secure" দেখানো শুরু করে।
- **HSTS preload list** Chromium project রক্ষণাবেক্ষণ করে, আর প্রধান browser-গুলো এটা ব্যবহার করে।

জনপ্রিয় tool: \`dig\` আর \`nslookup\` (DNS প্রশ্ন), \`curl\` (HTTP), browser-এর DevTools-এর Network tab (প্রতিটা request-এর DNS, connect, TLS আর waiting সময় আলাদা করে দেখায়), আর DNS server হিসেবে BIND, CoreDNS (Kubernetes-এর ভেতরের DNS)।

*উৎস: RFC 1034/1035 (DNS), RFC 2308 (negative caching), RFC 7871 (EDNS Client Subnet), RFC 9110 (HTTP semantics ও status code), RFC 6797 (HSTS), RFC 6265 (cookie); root-servers.org; AWS Route 53 Developer Guide; Facebook Engineering blog-এর ৪ অক্টোবর ২০২১ outage-এর বিবরণ; Dyn-এর ২০১৬ আক্রমণ নিয়ে প্রকাশিত বিবৃতি; Let's Encrypt ও Chromium (hstspreload.org) documentation; Chromium blog-এর Chrome 68 ঘোষণা।*`,
  },

  mistakes: [
    {
      mistake:
        'DNS বদলে "propagation"-এর জন্য বসে থাকা, অথচ আগে TTL না কমানো। ফলে পুরনো server বন্ধ করার পর কয়েক ঘণ্টা কিছু user ভুল IP-তে গিয়ে site খুলতে পারে না।',
      fix: "Migration-এর অন্তত পুরনো TTL-এর সমান সময় আগে TTL কমান (যেমন ৬০s), তারপর IP বদলান, আর কিছু সময় পুরনো server চালু রাখুন।",
    },
    {
      mistake:
        'সব কিছুতে 200 OK পাঠানো, আর error-টা body-র ভেতরে লেখা (`{"error": "not found"}`)। Monitoring, cache আর client library কেউ বুঝতে পারে না কিছু ভুল হয়েছে।',
      fix: "সঠিক status code দিন: client-এর ভুলে 4xx, server-এর ভুলে 5xx। Body-তে বিস্তারিত দিন, কিন্তু code-টাই আসল সংকেত।",
    },
    {
      mistake:
        "সাময়িক কাজে (maintenance page, A/B পরীক্ষা) 301 দেওয়া। Browser সেটা cache করে রাখে, পরে সরিয়ে দিলেও user-রা পুরনো জায়গায় যেতে থাকে।",
      fix: "সাময়িক redirect-এ 302 বা 307; 301/308 শুধু তখনই, যখন সত্যিই স্থায়ী।",
    },
    {
      mistake: "শুধু login আর payment page-এ HTTPS রাখা, বাকি site HTTP-তে।",
      fix: "পুরো site HTTPS, HTTP থেকে স্থায়ী redirect, তারপর HSTS header। Session cookie-তে `Secure` আর `HttpOnly`।",
    },
    {
      mistake:
        "ধরে নেওয়া যে server আগের request মনে রাখবে, যেমন login-এর তথ্য একটা server-এর memory-তে রাখা। দ্বিতীয় server যোগ করতেই user বারবার logout হয়ে যায়।",
      fix: "HTTP stateless ধরে design করুন: session id cookie-তে আর data shared store-এ (Redis), অথবা সই করা token।",
    },
    {
      mistake: '"Site খুলছে না" শুনে সরাসরি application code ঘাঁটা।',
      fix: "যাত্রা ধরে আগাও: `dig` দিয়ে DNS, তারপর connect হয় কিনা, certificate ঠিক কিনা, তারপর status code। Error message-টাই বলে দেয় কোন ধাপে ভেঙেছে।",
    },
    {
      mistake:
        "Fragment (`#...`)-এ গোপন বা জরুরি তথ্য রেখে ভাবা যে server সেটা পাবে, অথবা query string-এ password পাঠানো।",
      fix: "Fragment server-এ যায় না। আর query string log, browser history আর Referer-এ থেকে যায়, তাই গোপন তথ্য POST body বা header-এ পাঠান।",
    },
  ],

  lab: [
    {
      title: "DNS-কে নিজে প্রশ্ন করুন: A, AAAA, CNAME আর TTL",
      markdown: `macOS আর বেশিরভাগ Linux-এ \`dig\` আগে থেকেই থাকে। (Ubuntu-তে না থাকলে \`sudo apt install dnsutils\`। Windows-এ \`nslookup\` ব্যবহার করতে পারেন, অথবা Docker দিয়ে: \`docker run --rm alpine sh -c "apk add -q bind-tools && dig example.com"\`।)

\`\`\`bash
dig example.com A
dig example.com AAAA
dig +short www.github.com
\`\`\`

প্রথম command-এর **ANSWER SECTION**-এ এরকম একটা লাইন পাবেন:

\`\`\`text
example.com.   1652   IN   A   <একটা IPv4 ঠিকানা>
\`\`\`

মাঝের সংখ্যাটা **TTL**, সেকেন্ডে। এখন একই command কয়েক সেকেন্ড পর আবার চালান। TTL কমেছে? তাহলে উত্তরটা আপনার resolver-এর **cache** থেকে এসেছে, আর সংখ্যাটা বলছে আর কতক্ষণ সেটা cache-এ থাকবে।

তৃতীয় command-এ যদি একাধিক লাইন দেখেন, যার প্রথমটা একটা নাম আর শেষটা IP, তাহলে সেখানে একটা **CNAME** আছে: নাম → নাম → IP।

শেষে নিচের দিকে \`;; Query time:\` দেখুন। প্রথমবার আর দ্বিতীয়বারের সময়ের পার্থক্যই cache-এর লাভ।`,
    },
    {
      title: "Root থেকে নিজে হেঁটে আসুন: dig +trace",
      markdown: `\`+trace\` দিয়ে \`dig\` নিজেই resolver-এর কাজটা করে, root থেকে শুরু করে iterative ভাবে:

\`\`\`bash
dig +trace example.com
\`\`\`

Output-এ তিনটা ভাগ দেখবেন:
1. \`.\`-এর জন্য অনেকগুলো \`NS\` লাইন: \`a.root-servers.net\` থেকে \`m.root-servers.net\`। এরা root।
2. \`com.\`-এর জন্য \`NS\` লাইন (\`a.gtld-servers.net\` ধরনের নাম): root-এর **referral**, "\`.com\`-এর খবর এদের কাছে।"
3. \`example.com.\`-এর \`NS\`, তারপর শেষে আসল \`A\` record: authoritative server-এর উত্তর।

প্রতিটা ধাপের শেষে \`Received ... from ...\` লাইনে দেখুন কোন server উত্তর দিল আর কত ms লাগল। (কিছু অফিস বা ISP network বাইরের DNS server-এ সরাসরি প্রশ্ন আটকে দেয়; তখন trace মাঝপথে থেমে যেতে পারে। বাসার network বা mobile hotspot-এ চেষ্টা করুন।)`,
    },
    {
      title: "একটা HTTPS request-এর ভেতর দেখুন: curl -v",
      markdown: `\`\`\`bash
curl -v https://example.com -o /dev/null
\`\`\`

\`-v\` (verbose) পুরো যাত্রা দেখায়:
- \`* Trying <IP>:443...\` আর \`Connected to\`: DNS শেষ, TCP connection খুলেছে।
- \`SSL connection using TLSv1.3\` আর \`Server certificate:\` অংশ: TLS handshake, certificate কার নামে আর কে সই করেছে।
- \`>\` দিয়ে শুরু লাইন: আপনার পাঠানো **request** (\`GET / HTTP/2\` বা \`HTTP/1.1\`, \`Host\`, \`User-Agent\`, \`Accept\`)।
- \`<\` দিয়ে শুরু লাইন: server-এর **response**: status line, তারপর header।

এবার redirect দেখুন। \`-I\` শুধু header আনে, \`-L\` redirect মেনে চলে:

\`\`\`bash
curl -sI http://github.com | head -5
curl -sIL http://github.com | grep -iE "^HTTP|^location"
\`\`\`

প্রথমটায় একটা **3xx** status আর \`Location: https://...\` header দেখবেন: HTTP থেকে HTTPS-এ পাঠানো হচ্ছে। দ্বিতীয়টায় পুরো redirect শিকল।

\`\`\`bash
curl -sI https://github.com | grep -i strict-transport-security
\`\`\`

এই header-ই **HSTS**। \`max-age\` দেখুন, কত সেকেন্ড browser এই site-এ HTTP ব্যবহার করবে না।`,
    },
    {
      title: "নিজের server: Host header, 404, 304 আর keep-alive",
      markdown: `Docker দিয়ে একটা nginx চালান:

\`\`\`bash
docker run -d --name web -p 8080:80 nginx:1.27-alpine
\`\`\`

**১. DNS ছাড়াই নামকে IP-তে বসানো।** \`--resolve\` দিয়ে curl-কে বলে দিন \`boighor.test\` নামটা \`127.0.0.1\`-এ আছে (এটা \`/etc/hosts\`-এ লেখার মতো, শুধু এই একটা command-এর জন্য):

\`\`\`bash
curl -v --resolve boighor.test:8080:127.0.0.1 http://boighor.test:8080/ -o /dev/null
\`\`\`

\`>\` লাইনে দেখুন \`Host: boighor.test:8080\`। IP একটাই, কিন্তু browser জানিয়ে দেয় কোন নাম চেয়েছিল। একই server-এ অনেক site এভাবেই চলে।

**২. Status code-গুলো নিজে তৈরি করুন:**

\`\`\`bash
curl -s -o /dev/null -w "%{http_code}\\n" http://localhost:8080/
curl -s -o /dev/null -w "%{http_code}\\n" http://localhost:8080/nai-emon-page
\`\`\`

প্রথমটা \`200\`, দ্বিতীয়টা \`404\`।

**৩. 304 Not Modified:** response-এর \`ETag\` নিয়ে আবার জিজ্ঞেস করুন "এটা কি বদলেছে?":

\`\`\`bash
ETAG=$(curl -sI http://localhost:8080/ | grep -i '^etag' | cut -d' ' -f2 | tr -d '\\r')
echo "$ETAG"
curl -sI -H "If-None-Match: $ETAG" http://localhost:8080/ | head -1
\`\`\`

উত্তর \`HTTP/1.1 304 Not Modified\`, কোনো body ছাড়া। Browser এভাবেই cache-এ থাকা file আবার ব্যবহার করে, পুরো file না নামিয়ে।

**৪. Keep-alive:** একই command-এ দুটো URL দিলে curl একটা connection-ই আবার ব্যবহার করে:

\`\`\`bash
curl -sv http://localhost:8080/ http://localhost:8080/ -o /dev/null -o /dev/null 2>&1 | grep -iE "connected to|re-?using"
\`\`\`

প্রথমবার \`Connected to localhost\`, দ্বিতীয়বার connection re-use করার একটা লাইন (curl-এর version অনুযায়ী লেখা একটু আলাদা হতে পারে)। দ্বিতীয় request-এ নতুন TCP handshake লাগেনি।

**৫. Server-এর দিক থেকে দেখুন:**

\`\`\`bash
docker logs web
\`\`\`

প্রতিটা লাইনে method, path, status code। লক্ষ করুন, URL-এ \`#\` দিয়ে কিছু লিখে পাঠালেও (\`curl "http://localhost:8080/#reviews"\`) log-এ fragment আসে না।

শেষে পরিষ্কার করুন:

\`\`\`bash
docker rm -f web
\`\`\``,
    },
  ],

  connections: {
    markdown: `- **Day 1 · সিস্টেম ডিজাইন আসলে কী?**: system design মানে অংশগুলো কিভাবে একসাথে কাজ করবে, আর প্রতিটা সিদ্ধান্তের trade-off। আজকের TTL ছোট-বড়, 301 না 302, সবই সেই ধরনের সিদ্ধান্ত।
- **Day 2 · Client, Server ও Internet**: সেখানে IP, port, packet আর round trip শিখেছিলাম, আর বলেছিলাম "নাম থেকে IP কিভাবে আসে, Day 3-এ"। আজ সেই নাম (DNS) আর request/response-এর ভাষা (HTTP) যোগ হলো। Day 2-এর "HTTP stateless" কথাটার কারণও আজ দেখলাম।

সামনে যেখানে এগুলো আবার আসবে:
- **Day 4 · API কী? REST-এর বেসিক**: HTTP method আর status code দিয়েই REST API বানানো হয়।
- **Day 9 · Load Balancers**: DNS round-robin-এর সীমাবদ্ধতা যেখানে load balancer পূরণ করে।
- **Day 11 · CDN**: GeoDNS আর anycast দিয়ে user-কে কাছের server-এ পাঠানো।
- **Day 14 · Stateful vs Stateless**: cookie, session store আর stateless server-এর পুরো গল্প।
- **Day 39 · TCP vs UDP**: কেন DNS সাধারণত UDP-তে আর HTTP TCP-তে।
- **Day 40 · DNS গভীরে**: এখন এটুকু জানলেই চলবে, Day 40-এ গভীরে যাব (সব record type, DNSSEC, resolver-এর ভেতর)।
- **Day 41 · TLS/SSL Handshake**: certificate যাচাই আর key ঠিক করার পুরো ধাপ।
- **Day 42 · HTTP/1.1 vs HTTP/2 vs HTTP/3**: এখন এটুকু জানলেই চলবে, Day 42-এ গভীরে যাব (multiplexing, head-of-line blocking, QUIC)।
- **Day 88 · Global traffic ও multi-region**: GeoDNS, failover আর region বাছাইয়ের বড় ছবি।`,
  },

  explainYourself: [
    {
      question:
        "আপনি DNS-এ IP বদলালেন। এক বন্ধু নতুন site দেখছে, আরেকজন এখনো পুরনোটা। কেন এমন হলো, আর পরের বার কী করলে এটা কয়েক মিনিটে মিটে যেত?",
      idealAnswer:
        "Authoritative server-এ record সাথে সাথেই বদলেছে, কিন্তু দ্বিতীয় বন্ধুর resolver (বা browser/OS) পুরনো উত্তরটা cache করে রেখেছে, আর সেটার TTL এখনো শেষ হয়নি। প্রথম বন্ধুর cache হয়তো আগেই মেয়াদ শেষ করে নতুন করে জিজ্ঞেস করেছে। সবচেয়ে খারাপ ক্ষেত্রে অপেক্ষা পুরনো TTL-এর সমান। পরের বার migration-এর অন্তত পুরনো TTL-এর সমান সময় আগে TTL ৬০ সেকেন্ডের মতো কমিয়ে রাখলে, IP বদলানোর পর এক মিনিটের মধ্যেই সবাই নতুনটা পেত।",
    },
    {
      question:
        "HTTP stateless হলে আমি login করার পর Facebook আমাকে পরের page-এ কিভাবে চেনে? Stateless রাখার লাভটা কী?",
      idealAnswer:
        "Login-এর পর server Set-Cookie দিয়ে একটা session id বা token পাঠায়, browser সেটা জমা রাখে আর প্রতিটা পরের request-এ Cookie header-এ জুড়ে দেয়। Server সেটা দেখে (shared session store থেকে বা token-এর সই যাচাই করে) চেনে আপনি কে। অর্থাৎ state প্রতিটা request-এর সাথে আসে, server-এর memory-তে আটকে থাকে না। লাভ হলো যেকোনো server যেকোনো request সামলাতে পারে, তাই server বাড়ানো, বদলানো বা একটা পড়ে গেলে সামলানো সহজ।",
    },
    {
      question:
        "একটা page খুলতে browser-এর Network tab-এ ৪০টা request দেখছেন, আর প্রথম byte আসতেই অনেক সময় লাগছে। কোন কোন জায়গায় round trip বাঁচানো যায়?",
      idealAnswer:
        "প্রথমে দেখতে হবে প্রতিটা নতুন connection-এ DNS, TCP আর TLS-এর জন্য কয়েকটা RTT যাচ্ছে কিনা। Keep-alive আর HTTP/2 দিয়ে একই connection বারবার ব্যবহার করলে handshake বাঁচে। অপ্রয়োজনীয় redirect (http → https → www) বাদ দিয়ে link সরাসরি চূড়ান্ত ঠিকানায় দিলে প্রতিটা redirect-এর এক বা একাধিক RTT বাঁচে। অনেক আলাদা domain থেকে জিনিস আনলে প্রতিটার জন্য আলাদা DNS আর connection লাগে, তাই domain কমানো যায়। আর static file-এ cache header দিলে পরের বার request-ই লাগে না, বা শুধু 304 আসে।",
    },
  ],

  interviewQuestions: [
    {
      question: "Browser-এ একটা URL লিখে Enter চাপার পর কী কী ঘটে?",
      answerOutline: `- URL parse: scheme, host, port (default 443), path, query; fragment server-এ যায় না
- HSTS বা preload list-এ থাকলে সরাসরি https
- DNS: browser cache → OS cache (/etc/hosts) → recursive resolver → (cache miss হলে) root → TLD → authoritative; A/AAAA/CNAME, TTL
- TCP handshake (১ RTT), TLS handshake (TLS 1.3-এ সাধারণত ১ RTT), certificate যাচাই
- HTTP request (method, Host, cookie) → server (হয়তো load balancer, CDN হয়ে) → response (status, header, body)
- Render: HTML parse, CSS/JS/ছবির follow-up request (keep-alive-এ একই connection), render
- বোনাস: প্রতিটা ধাপ কিভাবে fail করে আর কিভাবে বোঝা যায়`,
    },
    {
      question:
        "DNS propagation কী? Zero-downtime server migration কিভাবে করবেন?",
      answerOutline: `- Propagation বলে কিছু ছড়ায় না; authoritative সাথে সাথে বদলায়, cache-গুলো TTL শেষে নতুন করে জিজ্ঞেস করে
- Worst case অপেক্ষা = পুরনো TTL
- পরিকল্পনা: পুরনো TTL-এর সমান সময় আগে TTL কমানো → নতুন server চালু ও পরীক্ষা → IP বদল → পুরনো server কিছু সময় চালু → TTL আবার বাড়ানো
- Negative caching আর TTL না মানা client-এর কথা মনে রাখা
- আরও ভালো: সামনে load balancer বা স্থির IP রাখা, যাতে backend বদলাতে DNS-ই না বদলাতে হয়`,
    },
    {
      question:
        "Recursive আর iterative DNS query-র পার্থক্য কী, আর কেন এভাবে ভাগ করা?",
      answerOutline: `- Stub resolver → recursive resolver: recursive ("পুরো উত্তর দাও")
- Resolver → root/TLD/authoritative: iterative (প্রতিটা referral দেয়, resolver নিজে পরের ধাপে যায়)
- কেন: root/TLD-এর উপর কাজ কম রাখা; ভারী কাজ আর cache resolver-এ, যেটা লাখো user-এর মধ্যে ভাগ হয়
- UDP 53, বড় উত্তরে TCP; root ১৩টা নাম, anycast দিয়ে অনেক instance`,
    },
    {
      question:
        "301, 302, 307 আর 308-এর পার্থক্য কী? HTTP থেকে HTTPS-এ কোনটা দেবেন, আর HSTS কেন দরকার?",
      answerOutline: `- 301/308 স্থায়ী (browser cache করে), 302/307 সাময়িক
- 307/308 method আর body রাখে; 301/302-এ POST → GET হয়ে যেতে পারে
- HTTP → HTTPS: স্থায়ী redirect (301 বা 308)
- প্রথম HTTP request encrypt হয় না, SSL stripping সম্ভব
- HSTS: browser নিজেই https ব্যবহার করে, max-age, includeSubDomains; প্রথম visit-এর ফাঁক বন্ধ করতে preload list`,
    },
    {
      question: "HTTP stateless কেন? তাহলে login session কিভাবে কাজ করে?",
      answerOutline: `- প্রতিটা request স্বয়ংসম্পূর্ণ; server আগের request মনে রাখতে বাধ্য না
- লাভ: যেকোনো server যেকোনো request নিতে পারে, horizontal scaling, failure-এ সহজ, proxy/CDN cache করতে পারে
- State আসে request-এর সাথে: Set-Cookie → Cookie header; session id + shared store (Redis) বা signed token (JWT)
- Cookie attribute: HttpOnly, Secure, SameSite, Max-Age
- Trade-off: session store-এ চাইলেই বাতিল করা যায় কিন্তু store লাগে; token-এ store লাগে না কিন্তু বাতিল করা কঠিন`,
    },
  ],

  summary: {
    points: [
      "URL = scheme + host + port + path + query + fragment; fragment server-এ যায় না, port না দিলে 80/443।",
      "DNS নামকে IP-তে বদলায়: resolver আপনার হয়ে root → TLD → authoritative ঘুরে আসে (iterative), আপনি শুধু একবার জিজ্ঞেস করেন (recursive)।",
      "A = IPv4, AAAA = IPv6, CNAME = আরেকটা নাম; প্রতিটা উত্তর TTL পর্যন্ত browser, OS আর resolver-এ cache হয়।",
      '"DNS propagation" আসলে cache-এর মেয়াদ শেষ হওয়া; migration-এর আগে TTL কমান।',
      "IP পাওয়ার পর TCP (১ RTT), TLS (TLS 1.3-এ সাধারণত ১ RTT), তারপর HTTP request; keep-alive এই handshake বাঁচায়।",
      "Status code-এর প্রথম অঙ্ক: 2xx সফল, 3xx অন্য জায়গায়, 4xx client-এর ভুল, 5xx server-এর ভুল।",
      "HTTP stateless, তাই cookie দিয়ে state প্রতিটা request-এর সাথে যায়; HTTPS সবখানে, আর HSTS দিয়ে HTTP-তে ফেরার পথ বন্ধ।",
    ],
    diagram: {
      id: "day-003-summary",
      caption: "এক নজরে DNS, HTTP ও একটি URL-এর গল্প",
      alt: "Browser থেকে DNS resolver হয়ে IP, তারপর Browser থেকে web server-এ HTTPS request আর 200 OK response।",
    },
  },
};
