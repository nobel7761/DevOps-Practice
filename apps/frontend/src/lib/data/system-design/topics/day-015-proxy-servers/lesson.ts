// Day 15 · Proxy Servers — Phase 2. Builds on Day 9 (L7 load balancer, TLS
// termination) and Day 11 (edge caching) without repeating them. Day 16 goes
// into API Gateway, Day 17 into caching, Day 41/78 into TLS, Day 63 into
// service mesh.

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

const day = topicHrefForDay;

export const day015Lesson: SdLesson = {
  topicId: "sd-day-015",
  day: 15,
  title: "Proxy Servers",
  definition:
    "Proxy হলো মাঝখানে বসা একটা server, যে অন্য কারো হয়ে request পাঠায়: forward proxy client-এর হয়ে বাইরে যায়, reverse proxy server-এর হয়ে সামনে দাঁড়ায়।",

  objectives: [
    "Forward proxy আর reverse proxy কার হয়ে কাজ করে, কে কাকে চেনে আর কে কাকে চেনে না, ছবি এঁকে ব্যাখ্যা করতে পারবেন; transparent proxy কোথায় আলাদা তা-ও বলতে পারবেন।",
    "একটা forward proxy HTTP request আর HTTPS request (CONNECT tunnel) কিভাবে আলাদাভাবে সামলায়, proxy কতটুকু দেখতে পায়, আর TLS interception-এর জন্য client-এ কী বসাতে হয়, ধাপে ধাপে বলতে পারবেন।",
    "X-Forwarded-For, X-Forwarded-Proto, Forwarded আর Via header পড়ে একাধিক hop পেরিয়ে আসল client IP বের করতে পারবেন, আর কেন এগুলো শুধু চেনা proxy থেকে বিশ্বাস করতে হয়, spoofing-এর উদাহরণ দিয়ে দেখাতে পারবেন।",
    "Reverse proxy-র buffering, slow-client সুরক্ষা, upstream keep-alive, compression আর caching কেন কাজের, তার হিসাব আর trade-off বলতে পারবেন; reverse proxy, load balancer, API gateway আর sidecar-এর পার্থক্য করতে পারবেন।",
    "Docker-এ Squid দিয়ে forward proxy আর NGINX দিয়ে reverse proxy চালিয়ে access log, CONNECT tunnel, header, gzip আর cache HIT নিজের চোখে দেখবেন।",
  ],

  prerequisites: [
    { day: 2, title: "Client, Server ও Internet", href: day(2) },
    { day: 3, title: "DNS, HTTP ও একটি URL-এর গল্প", href: day(3) },
    { day: 9, title: "Load Balancers", href: day(9) },
  ],

  problem: {
    markdown: `"কোডঘর" ঢাকার একটা software কোম্পানি। ২০০ জন কর্মী, অফিসে একটা ১০০ Mbps internet line, আর তারা নিজেরা একটা online exam platform চালায়, যেটা দেশের কয়েকটা কোচিং সেন্টার ব্যবহার করে। দুই দিক থেকে সমস্যা জমছে।

**অফিসের ভেতর থেকে বাইরে যাওয়ার দিক:**

- প্রতিটা laptop সরাসরি internet-এ যায়। সোমবার সকালে OS-এর একটা ১ GB update এলো, ২০০টা laptop প্রত্যেকে আলাদাভাবে নামাল, মানে একই জিনিস ২০০ GB। দুপুর পর্যন্ত অফিসের internet প্রায় অচল।
- Security team জানে না কে কোথায় যাচ্ছে। এক কর্মীর laptop-এ malware ঢুকে একটা অচেনা domain-এ data পাঠাচ্ছিল, কেউ টেরই পায়নি। কোনো domain block করার জায়গাও নেই।
- একটা bank partner বলেছে, তাদের API-তে আসা প্রতিটা call-এর হিসাব (কে, কখন, কোথায়) রাখতে হবে। অথচ call যায় ২০টা আলাদা machine থেকে, যার যার মতো।

**বাইরে থেকে ভেতরে আসার দিক (exam platform):**

- তিনটা app server, প্রত্যেকটার নিজের public IP। প্রতিটায় আলাদা TLS certificate, আলাদা renew। একটা renew করতে ভুলে গেলেই exam-এর মাঝে browser-এ লাল সতর্কবার্তা।
- App-টা Python-এ, প্রতিটা server-এ ১৬টা worker। গ্রামের ছাত্ররা ধীর mobile network-এ answer sheet-এর ছবি upload করে। একটা ধীর upload ৩০ সেকেন্ড ধরে একটা worker আটকে রাখে। পরীক্ষার শেষ ৫ মিনিটে ৫০ জন একসাথে upload করল, সব worker ব্যস্ত, বাকিরা timeout।
- কেউ server-এর IP খুঁজে পেয়ে সরাসরি port scan শুরু করল। App server internet-এর সামনে নগ্ন দাঁড়িয়ে।
- JSON response compress হয় না, তাই প্রশ্নপত্রের ২০০ KB-র JSON ধীর network-এ আরও ধীর।

দুটো দিকের সমস্যা দেখতে আলাদা, কিন্তু মূল কারণ একই: **client আর server সরাসরি কথা বলছে, মাঝে নিয়ন্ত্রণ করার, মনে রাখার বা আড়াল করার কেউ নেই।**`,
    diagrams: [
      {
        id: "day-015-before",
        caption:
          "আগে: অফিসের প্রতিটা laptop সরাসরি internet-এ, আর বাইরের user সরাসরি প্রতিটা app server-এ; মাঝে কেউ নেই।",
        alt: "বামে Office Laptops সরাসরি Internet-এ তীর দিয়ে যুক্ত, লেবেল 'নিয়ন্ত্রণ নেই'। ডানে Students থেকে তিনটা App Server-এ আলাদা তীর, প্রতিটায় 'public IP'; একটা App Server লাল, লেবেল 'worker শেষ'।",
      },
    ],
  },

  analogy: {
    markdown: `মতিঝিলের একটা বড় অফিস ভবনের কথা ভাবুন। দুজন মানুষ এই অফিসের সব আসা-যাওয়া সামলান, কিন্তু উল্টো দিকে।

**অফিসের পিয়ন রহিম ভাই (Forward Proxy)।** কর্মীদের বাইরের কিছু লাগলে নিজেরা যান না, রহিম ভাইকে বলেন: "স্টেশনারি দোকান থেকে দুটো file আনেন", "ব্যাংকে এই খামটা জমা দিয়ে আসেন।"

- দোকানদার দেখে রহিম ভাইকে, কোন কর্মী চাইল জানে না। (**বাইরের server client-কে দেখে না, proxy-কে দেখে।**)
- অফিসের নিয়ম আছে কোন দোকানে যাওয়া যাবে, কোনটায় না। রহিম ভাই খাতায় লিখে রাখেন কে কী আনাল। (**Filtering আর logging।**)
- সবাই যে A4 কাগজ বারবার চায়, তার একটা বান্ডিল তিনি ড্রয়ারে রেখে দেন। পরের জন চাইলে বাজারে যেতে হয় না। (**Caching।**)
- কেউ সিল করা খাম দিলে রহিম ভাই শুধু ঠিকানা দেখেন, "সোনালী ব্যাংক, দিলকুশা শাখা", ভেতরে কী লেখা জানেন না। (**HTTPS-এর CONNECT tunnel: proxy শুধু কোথায় যাচ্ছে দেখে, কী যাচ্ছে না।**) খাম খুলে পড়তে চাইলে অফিসকে আগে থেকে কর্মীদের জানিয়ে নিজের সিল-মোহর মানতে রাজি করাতে হবে, সেটা আলাদা ব্যাপার।

**নিচতলার reception-এর শিউলি আপা (Reverse Proxy)।** বাইরে থেকে কেউ এলে সরাসরি কোনো রুমে যেতে পারে না। সবাই reception-এ আসে।

- Visitor জানে না হিসাব বিভাগ কোন তলায়, কয়জন বসে। সে শুধু reception চেনে। (**Client শুধু proxy-কে দেখে, ভেতরের server লুকানো।**)
- শিউলি আপা ঠিক করেন কে কোন বিভাগে যাবে, ভিড় হলে কাকে বসিয়ে রাখবেন। (**Routing, load balancing।**)
- কেউ এক পাতার আবেদন ধীরে ধীরে লিখতে থাকলে আপা তাকে reception-এর টেবিলে বসিয়ে লিখতে দেন; লেখা শেষ হলে তবেই কাগজটা ভেতরে যায়। ভেতরের অফিসাররা ওই সময়টা অন্য কাজ করেন। (**Request buffering: ধীর client ভেতরের server আটকায় না।**)
- কোম্পানির brochure চাইলে আপা ড্রয়ার থেকেই দিয়ে দেন, ভেতরে যেতে হয় না। (**Caching।**)

দুজনেই "মাঝের মানুষ"। পার্থক্য হলো **কার হয়ে কাজ করেন।** রহিম ভাই অফিসের কর্মীদের (client-এর) প্রতিনিধি, শিউলি আপা অফিসের বিভাগগুলোর (server-এর) প্রতিনিধি।`,
    diagrams: [
      {
        id: "day-015-analogy",
        caption:
          "অফিস ভবন: পিয়ন কর্মীদের হয়ে বাইরে যান (forward proxy), reception বাইরের মানুষদের হয়ে ভেতরে পাঠান (reverse proxy)।",
        alt: "বাম অংশে তিনজন কর্মী পিয়নকে কাজ দিচ্ছেন, পিয়ন দোকানে ফর্দ নিয়ে আর ব্যাংকে সিল করা খাম নিয়ে যাচ্ছেন, ব্যাংকের তীরে লেখা 'শুধু ঠিকানা'। ডান অংশে বাইরের তিনজন visitor reception desk-এ আসছেন, reception তাদের হিসাব, HR আর IT বিভাগে পাঠাচ্ছেন।",
      },
    ],
  },

  coreConcept: {
    markdown: `**Proxy** মানে প্রতিনিধি। Network-এ proxy হলো এমন একটা server, যে একটা connection নিজে গ্রহণ করে, তারপর অন্য কারো কাছে নতুন একটা request পাঠায়, উত্তর এনে ফেরত দেয়। Client আর server-এর মধ্যে আর সরাসরি connection থাকে না; থাকে দুটো আলাদা connection: client ↔ proxy, আর proxy ↔ server।

এই "মাঝে বসা"-টাই proxy-র শক্তি। যে মাঝে বসে, সে দেখতে পারে, বদলাতে পারে, আটকাতে পারে, মনে রাখতে পারে।

### Forward proxy: client-এর হয়ে

Client জানে proxy আছে, আর নিজেই ঠিক করে proxy দিয়ে যাবে (browser-এর proxy setting, \`HTTPS_PROXY\` environment variable, বা অফিসের policy)। বাইরের server দেখে proxy-র IP, client-এর না।

কোথায় দেখবেন: অফিস, বিশ্ববিদ্যালয়ের campus network, স্কুলের lab, বা production-এ server-গুলোর বাইরে যাওয়ার (**egress**) পথে। কাজ:
- **Egress control (বাইরে যাওয়া নিয়ন্ত্রণ):** কোন domain-এ যাওয়া যাবে, কোনটায় না
- **Logging ও audit:** কে কখন কোথায় গেল
- **Caching:** একই file বারবার বাইরে থেকে না আনা
- **পরিচয় আড়াল:** বাইরের server আসল client চেনে না (VPN-এর মতো privacy tool-ও এই ধারণায় চলে)
- **একটাই বের হওয়ার IP:** partner-এর firewall-এ শুধু proxy-র IP allow করলেই হয়

### Reverse proxy: server-এর হয়ে

Client জানেই না proxy আছে। সে ভাবে \`exam.kodghor.com\`-ই server। আসলে DNS তাকে reverse proxy-র IP দেয়, আর proxy পেছনের আসল server-এ পাঠায়। ভেতরের server-গুলো private network-এ, internet থেকে সরাসরি পৌঁছানো যায় না।

জনপ্রিয় reverse proxy: **NGINX**, **HAProxy**, **Envoy**, **Caddy**, **Traefik**। কাজ:
- **TLS termination:** certificate এক জায়গায় ([Day 9](${day(9)})-এ termination, passthrough আর re-encryption দেখেছি, আজ আর বিস্তারে যাব না)
- **Routing:** \`/api\` এক দলে, \`/static\` আরেক দলে; দরকার হলে load balancing
- **Origin লুকানো:** server-এর IP আর ভেতরের গঠন বাইরে থেকে অদেখা
- **Buffering:** ধীর client-এর সাথে proxy ধৈর্য ধরে, app server-এর worker আটকায় না
- **Compression:** gzip বা brotli দিয়ে response ছোট করা
- **Caching:** বারবার চাওয়া জিনিস proxy নিজেই দেয়
- **Rate limiting আর auth-এর জায়গা:** সব request একটা দরজা দিয়ে আসে, তাই নিয়ম বসানোর সবচেয়ে ভালো জায়গা এটাই ([Day 18](${day(18)})-এ rate limiting)

[Day 11](${day(11)})-এর CDN edge server-ও আসলে একটা reverse proxy, শুধু পৃথিবীজুড়ে ছড়ানো। আর [Day 9](${day(9)})-এর L7 load balancer হলো এমন reverse proxy, যার মূল কাজ ভাগ করা।

### এক লাইনে পার্থক্য

| | Forward proxy | Reverse proxy |
|---|---|---|
| কার হয়ে কাজ করে | Client-এর | Server-এর |
| কে proxy-র কথা জানে | Client (নিজে configure করে) | Server-এর মালিক; client জানে না |
| কাকে লুকায় | Client-কে | Server-কে |
| কে বসায় | অফিস/ISP/ব্যবহারকারী | Website-এর মালিক |

### Transparent proxy: কেউ configure করেনি, তবুও আছে

কিছু proxy client-এর setting ছাড়াই বসে। Router বা firewall port 80-এর সব traffic চুপচাপ proxy-তে ঘুরিয়ে দেয় (Linux-এ যেমন iptables-এর REDIRECT rule, আর Squid-এ \`intercept\` option)। Client ভাবে সরাসরি যাচ্ছে। হোটেলের Wi-Fi-তে প্রথমবার যে login page আসে (**captive portal**), অনেক সময় এভাবেই কাজ করে।

সুবিধা: প্রতিটা device-এ setting লাগে না। দাম: HTTPS-এ transparent proxy শুধু destination IP আর TLS handshake-এর SNI (hostname) দেখে, তার বেশি কিছু না; আর কিছু ভাঙলে ব্যবহারকারী বোঝে না কেন।

**কেন এটা বিনামূল্যে না?** প্রতিটা proxy একটা বাড়তি hop: কিছুটা latency, একটা বাড়তি জিনিস চালু রাখা আর monitor করা, আর সবচেয়ে বড় কথা, সব traffic এক জায়গা দিয়ে যায়, তাই সেটা পড়লে সব পড়ে। এই দামগুলো গভীরে অংশে দেখব।`,
    diagrams: [
      {
        id: "day-015-main",
        caption:
          "পরে: অফিসের laptop-রা forward proxy দিয়ে বাইরে যায়; বাইরের user-রা reverse proxy দিয়ে ভেতরের app server-এ পৌঁছায়।",
        alt: "বাম থেকে ডানে: Office Laptops থেকে Forward Proxy (Squid), সেখান থেকে Internet; Internet থেকে Reverse Proxy (NGINX), সেখান থেকে তিনটা App Server। Forward proxy-র নিচে 'filter, log, cache', reverse proxy-র নিচে 'TLS, buffer, gzip, cache'।",
        downloadable: true,
      },
      {
        id: "day-015-before-after",
        caption:
          "পাশাপাশি: মাঝে কেউ না থাকলে নিয়ন্ত্রণ, cache আর আড়াল কিছুই নেই; proxy বসালে দুই দিকেই একটা নিয়ন্ত্রিত দরজা।",
        alt: "উপরে আগের design: laptop সরাসরি internet-এ আর user সরাসরি app server-এ। নিচে পরের design: forward proxy আর reverse proxy মাঝে বসানো।",
      },
    ],
  },

  deepDive: [
    {
      title:
        "Forward proxy ভেতরে: HTTP-তে কী হয়, HTTPS-এ CONNECT tunnel, আর TLS interception",
      markdown: `### HTTP request proxy-তে কিভাবে যায়

Proxy ছাড়া browser server-কে বলে:

\`\`\`text
GET /news HTTP/1.1
Host: example.com
\`\`\`

Proxy দিয়ে গেলে browser connection খোলে proxy-র সাথে, আর request line-এ **পুরো URL** লেখে (একে বলে **absolute-form**):

\`\`\`text
GET http://example.com/news HTTP/1.1
Host: example.com
\`\`\`

Proxy পুরো URL পড়ে, নিজে DNS lookup করে, নিজে server-এর সাথে connection খোলে। যেহেতু সব খোলা, proxy চাইলে path দেখে block করতে পারে, response cache করতে পারে, header যোগ করতে পারে। Proxy login চাইলে উত্তর দেয় **407 Proxy Authentication Required**, আর client পরের বার \`Proxy-Authorization\` header পাঠায় (server-এর 401/\`Authorization\`-এর proxy সংস্করণ)।

### HTTPS: proxy কেন ভেতরটা দেখতে পারে না

HTTPS-এ browser আর server-এর মধ্যে TLS, মানে end-to-end encryption। Proxy মাঝে বসে request পড়লে সেটা আর end-to-end থাকে না। তাই browser অন্য পথে যায়, **CONNECT** method দিয়ে:

1. Browser proxy-কে বলে: \`CONNECT example.com:443 HTTP/1.1\`। মানে "আমার জন্য example.com-এর 443 port-এ একটা পাইপ খুলে দাও।"
2. Proxy নিয়ম দেখে (domain কি allowed?), DNS করে, server-এর সাথে TCP connection খোলে।
3. Proxy উত্তর দেয় \`HTTP/1.1 200 Connection established\`। এখন থেকে proxy একটা **tunnel**: দুই দিক থেকে যা bytes আসে, না বুঝে অন্য দিকে পার করে।
4. Browser এই tunnel-এর ভেতর দিয়ে সরাসরি server-এর সাথে TLS handshake করে। Certificate আসে আসল server-এর, তাই browser-এর তালা ঠিকঠাক।
5. এরপর \`GET /account\`, cookie, password, সব encrypted অবস্থায় tunnel দিয়ে যায়।

Proxy কী জানে: hostname আর port (CONNECT line থেকে), কখন শুরু-শেষ, কত bytes গেল। কী জানে না: path, query, header, body। Lab-এ Squid-এর log-এ দেখবেন HTTP request-এর পুরো URL লেখা, আর HTTPS-এর শুধু \`CONNECT example.com:443\`।

এজন্যই অফিসের proxy domain ধরে block করতে পারে ("facebook.com বন্ধ"), কিন্তু "facebook.com-এ শুধু game বন্ধ" করতে পারে না। আর CONNECT সাধারণত শুধু 443-এ allow করা হয়; নইলে যে কেউ tunnel দিয়ে যেকোনো port-এ (যেমন 25-এ spam mail) যেতে পারত।

### TLS interception: খাম খুলে পড়া

কিছু প্রতিষ্ঠান (bank, সরকারি দপ্তর, বড় কোম্পানি) HTTPS-এর ভেতরও দেখতে চায়: malware download আটকানো, গোপন file বাইরে যাওয়া (data leak) ধরা। একে বলে **TLS interception** (বা SSL inspection; Squid-এ এর নাম **SSL Bump**)। কিভাবে:

1. Proxy CONNECT পেয়ে tunnel বানায় না। Browser-এর সাথে নিজেই TLS handshake করে।
2. Browser চায় example.com-এর certificate। Proxy সাথে সাথে **একটা নকল certificate বানায়**: নাম example.com, কিন্তু sign করা প্রতিষ্ঠানের নিজের **root CA** দিয়ে।
3. Proxy আসল server-এর সাথে আলাদা একটা TLS connection করে। এখন দুই connection-এর মাঝে plaintext proxy-র হাতে।

ধাপ ২ কাজ করে **শুধু একটা শর্তে:** প্রতিষ্ঠানের root CA প্রতিটা device-এর trust store-এ আগে থেকে বসানো থাকতে হবে (সাধারণত IT team অফিসের laptop-এ policy দিয়ে বসায়)। না থাকলে browser সাথে সাথে certificate error দেখাবে, কারণ নকল certificate কোনো চেনা CA sign করেনি। এজন্যই কারো বাসার Wi-Fi-তে বসা proxy আপনার bank-এর HTTPS পড়তে পারে না।

এর দামও আছে:
- যেসব app **certificate pinning** করে (নির্দিষ্ট certificate বা key ছাড়া মানে না, অনেক mobile banking app), সেগুলো interception-এর পেছনে কাজই করে না। তাই এমন domain-কে "bump না করে পার করো" তালিকায় রাখতে হয়।
- Proxy-কে এখন আসল server-এর certificate ঠিকমতো যাচাই করতে হয়, কারণ browser আর সেটা দেখতে পায় না। Proxy এটা ঢিলেঢালা করলে সবার নিরাপত্তা কমে।
- Root CA-র private key এখন পুরো প্রতিষ্ঠানের সবচেয়ে বিপজ্জনক গোপন জিনিস: ফাঁস হলে যে কেউ সব কর্মীর জন্য যেকোনো site-এর নকল certificate বানাতে পারবে।
- আইন আর গোপনীয়তা: ব্যক্তিগত banking বা health site সাধারণত interception থেকে বাদ রাখা হয়, আর কর্মীদের জানাতে হয়।

TLS handshake আর certificate chain কিভাবে যাচাই হয়, এখন এটুকু জানলেই চলবে, [Day 41](${day(41)})-এ (TLS/SSL Handshake) আর [Day 78](${day(78)})-এ (Encryption ও TLS) গভীরে যাব।

### Client কিভাবে জানে proxy কোথায়

- **হাতে setting:** browser বা OS-এর proxy setting।
- **Environment variable:** \`http_proxy\`, \`HTTPS_PROXY\`, \`NO_PROXY\`। curl, pip, npm, Docker সহ অনেক command-line tool এগুলো মানে। \`NO_PROXY\`-তে ভেতরের address (যেমন \`localhost,.internal\`) রাখতে ভুলবেন না, নইলে ভেতরের service-এর call-ও proxy ঘুরে বাইরে যেতে চাইবে।
- **PAC file:** ছোট একটা JavaScript function, \`FindProxyForURL(url, host)\`, যেটা প্রতিটা URL-এর জন্য বলে দেয় কোন proxy দিয়ে যাবে নাকি \`DIRECT\`। বড় অফিসে এটাই প্রচলিত।

একটা শিক্ষণীয় ঘটনা: ২০১৬ সালের **httpoxy** সমস্যা। CGI-ধাঁচের app-এ request-এর প্রতিটা header \`HTTP_<নাম>\` environment variable হয়ে যায়। Attacker \`Proxy: http://evil.example\` header পাঠালে তা হয়ে যেত \`HTTP_PROXY\`, আর app-এর ভেতরের HTTP library সেটাকে proxy setting ভেবে নিজের outbound call attacker-এর server দিয়ে পাঠাত। শিক্ষা: proxy setting কোথা থেকে আসছে, সেটাও নিরাপত্তার অংশ।`,
      diagrams: [
        {
          id: "day-015-connect-flow",
          caption:
            "ধাপে ধাপে: browser CONNECT চায়, proxy tunnel খোলে, তারপর TLS আর আসল request tunnel-এর ভেতর দিয়ে encrypted অবস্থায় যায়; proxy শুধু host:port দেখে।",
          alt: "Browser, Forward Proxy আর example.com-এর sequence diagram: CONNECT example.com:443, proxy থেকে TCP connect, 200 Connection established, ClientHello (SNI), server certificate, encrypted GET /account, encrypted response। শেষ ধাপের ব্যাখ্যায় বলা আছে proxy-র log-এ শুধু 'CONNECT example.com:443' থাকে।",
        },
      ],
    },
    {
      title:
        "Hop-এর পর hop: X-Forwarded-For, Forwarded, Via, আর আসল client IP খোঁজা",
      markdown: `Proxy মাঝে বসার একটা পার্শ্বপ্রতিক্রিয়া আছে। Server যে TCP connection পায়, সেটা proxy-র কাছ থেকে। তাই app-এর কাছে "client IP" মানে proxy-র IP। Rate limit, fraud check, log, দেশ অনুযায়ী দাম, সব ভুল হয়ে যায়। এজন্য proxy-রা request-এ header যোগ করে:

| Header | কী বলে | উদাহরণ |
|---|---|---|
| \`X-Forwarded-For\` (XFF) | এ পর্যন্ত কোন কোন IP পেরিয়ে এসেছে, বাম থেকে ডানে | \`X-Forwarded-For: 203.0.113.7, 10.0.1.5\` |
| \`X-Forwarded-Proto\` | Client আসলে কোন scheme-এ এসেছিল | \`X-Forwarded-Proto: https\` |
| \`X-Forwarded-Host\` | Client কোন Host চেয়েছিল | \`X-Forwarded-Host: exam.kodghor.com\` |
| \`X-Real-IP\` | NGINX-এর প্রচলিত রীতি: শুধু একটা IP | \`X-Real-IP: 203.0.113.7\` |
| \`Forwarded\` (RFC 7239) | উপরের সবগুলোর standard, একটা header-এ | \`Forwarded: for=203.0.113.7;proto=https;host=exam.kodghor.com\` |
| \`Via\` | কোন কোন proxy পেরিয়েছে (IP না, proxy-র নাম ও protocol) | \`Via: 1.1 squid-office, 1.1 edge-cdn\` |

কয়েকটা খুঁটিনাটি:
- \`X-\` দিয়ে শুরু header-গুলো কোনো standard না, শুধু সবাই মেনে চলে এমন রীতি (de facto)। \`Forwarded\` হলো standard, কিন্তু বাস্তবে XFF এখনো অনেক বেশি চলে।
- প্রতিটা proxy XFF-এর **ডানে** নিজের দেখা peer IP যোগ করে। NGINX-এ \`$proxy_add_x_forwarded_for\` ঠিক এটাই করে: আগের XFF + ", " + \`$remote_addr\`।
- \`X-Forwarded-Proto\` কেন জরুরি: [Day 9](${day(9)})-এর মতো TLS যদি proxy-তে খোলে, app দেখে সাধারণ HTTP। তখন app ভাবতে পারে "এটা insecure, https-এ redirect করি", আর client আবার https-এ আসে, আবার redirect... **অসীম redirect loop।** অথবা cookie-তে \`Secure\` flag বসে না। App-কে \`X-Forwarded-Proto\` দেখে বুঝতে হয়।
- \`Via\` শুধু তথ্য না, **loop ধরতেও** কাজে লাগে: একটা proxy নিজের নাম আগেই \`Via\`-তে দেখলে বোঝে request ঘুরে আবার তার কাছে এসেছে।

### সবচেয়ে বড় ফাঁদ: XFF যে কেউ লিখতে পারে

XFF একটা সাধারণ header। Client নিজেই পাঠাতে পারে:

\`\`\`bash
curl -H "X-Forwarded-For: 1.2.3.4" https://exam.kodghor.com/login
\`\`\`

NGINX \`$proxy_add_x_forwarded_for\` দিয়ে এর ডানে আসল IP যোগ করে, তাই app পায় \`1.2.3.4, 203.0.113.7\`। App যদি **বামের প্রথম IP**-কে client ধরে, তাহলে attacker প্রতিটা request-এ নতুন নকল IP দিয়ে আপনার IP-ভিত্তিক rate limit, login-attempt lock আর IP allowlist সব পার হয়ে যাবে। Lab-এ নিজে এটা করে দেখবেন।

**নিয়ম:** XFF-কে ডান দিক থেকে পড়ুন। ডানের যে IP-গুলো আপনার নিজের চেনা proxy-র (trusted), সেগুলো বাদ দিন। বাদ দেওয়ার পরে ডান দিক থেকে **প্রথম যে IP চেনা না**, সেটাই আসল client। তার বামে যা আছে, সব client-এর নিজের লেখা, বিশ্বাস করবেন না।

একটা উদাহরণ। আপনার setup: Cloudflare → NGINX → app। NGINX-এর কাছে আসা request:

\`\`\`text
TCP peer (NGINX যাকে দেখে):  172.68.10.20          ← Cloudflare-এর IP
X-Forwarded-For:               1.2.3.4, 203.0.113.7  ← প্রথমটা client-এর লেখা, দ্বিতীয়টা Cloudflare যোগ করেছে
\`\`\`

TCP peer Cloudflare-এর প্রকাশিত IP range-এর ভেতরে, তাই এর লেখা XFF বিশ্বাস করা যায়। XFF-এর ডান দিক থেকে প্রথম IP \`203.0.113.7\`, এটা কোনো চেনা proxy না, তাই এটাই আসল client। \`1.2.3.4\` বাদ।

কিন্তু কেউ যদি Cloudflare-কে পাশ কাটিয়ে সরাসরি NGINX-এ আসে, TCP peer হবে তার নিজের IP, যেটা trusted না। তখন XFF-এর কোনো কিছুই বিশ্বাস করা যাবে না; peer IP-ই client।

### NGINX-এ এটা কিভাবে: real_ip module

\`\`\`nginx
set_real_ip_from 10.0.0.0/8;          # আমাদের ভেতরের proxy-রা
set_real_ip_from 173.245.48.0/20;     # Cloudflare-এর range (তাদের প্রকাশিত তালিকা থেকে সব)
real_ip_header   X-Forwarded-For;
real_ip_recursive on;
\`\`\`

- \`set_real_ip_from\`: কোন peer-এর পাঠানো header বিশ্বাস করব।
- \`real_ip_header\`: কোন header থেকে IP নেব।
- \`real_ip_recursive on\`: XFF-এর ডান থেকে trusted IP-গুলো বাদ দিতে দিতে প্রথম untrusted IP নাও। এটা \`off\` থাকলে শুধু সবচেয়ে ডানের IP নেয়, ফলে দুই স্তরের proxy-তে ভেতরের proxy-র IP-কেই client ভেবে বসবে।

এরপর NGINX-এর \`$remote_addr\` নিজেই আসল client IP হয়ে যায়; log, \`limit_req\`, \`allow/deny\` সবাই সেটা ব্যবহার করে। আসল TCP peer-টা তখনও \`$realip_remote_addr\`-এ পাওয়া যায়।

একটা সূক্ষ্ম পরিণাম (lab-এ দেখবেন): real_ip চালুর পরে \`$remote_addr\` বদলে যাওয়ায় \`$proxy_add_x_forwarded_for\` এখন proxy-র IP-র বদলে client-এর IP-ই আবার যোগ করে। তাই app-এ পরিষ্কার একটা মান দিতে \`X-Real-IP $remote_addr\` পাঠানো, আর app-কে শুধু সেটা বিশ্বাস করতে বলা, সহজ নিয়ম।

আর একটা কথা: এই কাজ **একবার, সবার সামনের trusted proxy-তে** করুন। প্রতিটা app নিজের মতো XFF parse করলে কেউ না কেউ ভুল করবেই।`,
      diagrams: [
        {
          id: "day-015-headers",
          caption:
            "ভেতরের গঠন: প্রতিটা hop TCP peer বদলায় আর XFF-এর ডানে একটা IP যোগ করে; client-এর লেখা নকল IP সবসময় বামে থাকে।",
          alt: "চারটা কলাম: Client, Edge proxy, NGINX, App। প্রতিটা hop-এর নিচে একটা কার্ডে TCP peer, X-Forwarded-For, X-Forwarded-Proto আর Via। X-Forwarded-For hop-এ hop-এ বাড়ে: '1.2.3.4 (নকল)', তারপর '1.2.3.4, 203.0.113.7', তারপর '1.2.3.4, 203.0.113.7, 172.68.10.20'। নিচে ডান থেকে পড়ার নিয়ম আর আসল client 203.0.113.7 চিহ্নিত।",
        },
      ],
    },
    {
      title: "Buffering আর ধীর client: reverse proxy কেন app server-এর ঢাল",
      markdown: `কোডঘরের সমস্যাটা মনে করুন: ১৬টা worker, ধীর upload একেকটা worker ৩০ সেকেন্ড আটকে রাখে। হিসাবটা দেখুন:

- একটা upload-এর আসল কাজ (ছবি save করা) ৫০ms। কিন্তু ধীর network-এ body আসতে ৩০ সেকেন্ড।
- Proxy ছাড়া worker পুরো ৩০ সেকেন্ড ধরে বসে থাকে, socket থেকে একটু একটু করে পড়ে। ১৬ জন ধীর ছাত্র মানেই সব worker শেষ; তখন দ্রুত network-এর ছাত্রের ১০ms-এর request-ও লাইনে।
- Worker-এর কার্যকর ক্ষমতা: প্রতি worker সেকেন্ডে ২০টা ৫০ms-এর কাজ পারত, অথচ ধীর upload-এ ৩০ সেকেন্ডে একটা। ক্ষমতা কমে **৬০০ ভাগের এক ভাগ।**

### Request buffering

NGINX-এর মতো reverse proxy default-ভাবে (\`proxy_request_buffering on\`) **পুরো request body আগে নিজে নিয়ে নেয়** (ছোট হলে memory-তে, বড় হলে disk-এর temp file-এ), তারপর একবারে app-কে পাঠায়। App-এর কাছে ৩০ সেকেন্ডের upload হয়ে যায় ৫০ms-এর কাজ, কারণ body এখন ভেতরের দ্রুত network দিয়ে একবারে আসে।

কেন NGINX এটা পারে আর app worker পারে না? NGINX **event-driven**: অল্প কয়েকটা process হাজার হাজার connection একসাথে ধরে রাখে, প্রতিটা অপেক্ষমাণ connection-এর খরচ সামান্য memory। Thread বা process-প্রতি-request মডেলের app-এ প্রতিটা অপেক্ষমাণ connection মানে একটা আটকে থাকা worker।

### Response buffering

উল্টো দিকেও একই কথা (\`proxy_buffering on\`, default)। App ২ MB-র report বানিয়ে proxy-কে দ্রুত দিয়ে দেয়, worker মুক্ত। Proxy তারপর ধীর client-কে নিজের গতিতে পাঠায়।

কখন buffering বন্ধ করবেন: **streaming** response-এ, যেমন Server-Sent Events, LLM-এর token-by-token উত্তর, বা লম্বা download যেখানে প্রথম byte দ্রুত পৌঁছানো জরুরি। তখন \`proxy_buffering off\` (বা app থেকে \`X-Accel-Buffering: no\` header), নইলে client পুরো উত্তর শেষ হওয়া পর্যন্ত কিছুই দেখবে না। আর খুব বড় upload সরাসরি stream করতে চাইলে \`proxy_request_buffering off\`, তবে তখন ধীর client-এর ঢালটাও হারাবেন।

### Slowloris: ইচ্ছা করে ধীর হওয়া

**Slowloris** একটা পরিচিত attack: attacker শত শত connection খোলে, প্রতিটায় HTTP header খুব ধীরে পাঠায় (কয়েক সেকেন্ড পরপর একটা লাইন), কখনো শেষ করে না। Connection-প্রতি-thread server-এর সব thread আটকে যায়, অথচ attacker-এর bandwidth প্রায় লাগে না। এটা volumetric DDoS না, তাই সাধারণ bandwidth-ভিত্তিক সুরক্ষা ধরতে পারে না।

Reverse proxy-তে প্রতিরোধ:
- \`client_header_timeout\`: পুরো header এই সময়ের মধ্যে না এলে NGINX 408 দিয়ে connection বন্ধ করে, যত ধীরেই টুকরো আসুক। \`client_body_timeout\`: body-র দুই টুকরোর মাঝে এর বেশি নীরবতা হলে বন্ধ (পুরো body-র সময় না)। দুটোর default ৬০ সেকেন্ড; বেশিরভাগ API-র জন্য ১০-১৫ সেকেন্ড যথেষ্ট।
- \`limit_conn\`: একটা IP থেকে একসাথে সর্বোচ্চ কয়টা connection
- \`client_max_body_size\`: body-র সর্বোচ্চ আকার (NGINX-এ default 1 MB; বেশি হলে **413**)। Exam-এর ছবির জন্য বাড়াতে হবে, কিন্তু সীমাহীন রাখবেন না।
- \`keepalive_timeout\`: অলস keep-alive connection কতক্ষণ খোলা থাকবে

এতে proxy নিজেও নিরাপদ, আর পেছনের app কখনো এই ধীর connection-গুলো দেখেই না। (বড় পরিসরের DDoS নিয়ে [Day 81](${day(81)})-এ।)

### দুটো ভিন্ন error, দুটো ভিন্ন অর্থ

Proxy মাঝে থাকায় error-এর উৎসও দুই রকম। **502 Bad Gateway**: proxy upstream থেকে ঠিকঠাক উত্তর পায়নি (connection refused, app crash করে connection কেটে দিল)। **504 Gateway Timeout**: upstream সময়মতো উত্তর দেয়নি (\`proxy_read_timeout\`, default ৬০ সেকেন্ড)। এগুলো proxy নিজে বানায়, app না। Debug-এর প্রথম প্রশ্ন: "error-টা কে বানাল?"

### Hop-by-hop header আর request smuggling

কিছু header শুধু এক hop-এর জন্য: \`Connection\`, \`Keep-Alive\`, \`Proxy-Authorization\`, \`TE\`, \`Transfer-Encoding\`, \`Upgrade\`। Proxy-কে এগুলো পরের hop-এ না পাঠিয়ে নিজে সামলাতে হয় (WebSocket-এর \`Upgrade\` তাই NGINX-এ আলাদা করে পাঠাতে হয়)।

আর একটা উন্নত বিপদ: **HTTP request smuggling**। Proxy আর app যদি একটা request কোথায় শেষ হলো, তা নিয়ে ভিন্নমত পোষণ করে (যেমন একজন \`Content-Length\` মানে, আরেকজন \`Transfer-Encoding: chunked\`), তাহলে attacker একটা request-এর ভেতরে আরেকটা লুকিয়ে পাঠাতে পারে, যেটা proxy-র নিয়ম পার হয়ে app-এ পৌঁছায়। সমাধান: proxy আর server দুটোই হালনাগাদ রাখা, অস্পষ্ট request (দুটো header একসাথে) প্রত্যাখ্যান করা, আর upstream-এ সম্ভব হলে HTTP/2-এর মতো স্পষ্ট framing।`,
    },
    {
      title: "Upstream connection pooling আর keep-alive: হিসাব করে দেখুন",
      markdown: `Client থেকে proxy পর্যন্ত connection নিয়ে আমরা অনেক ভাবি। কিন্তু **proxy থেকে app server** পর্যন্ত connection-ও সমান গুরুত্বপূর্ণ।

### Keep-alive না থাকলে কী হয়

NGINX-এর \`proxy_pass\` default-এ upstream-এ HTTP/1.0 পাঠায় আর প্রতিটা request-এর পরে connection বন্ধ করে। মানে প্রতিটা request-এ নতুন TCP handshake (আর upstream-এ TLS থাকলে TLS handshake-ও)।

ধরুন একটা NGINX একটা app server-এ সেকেন্ডে ১,০০০ request পাঠায়:
- সেকেন্ডে ১,০০০টা নতুন connection, ১,০০০টা বন্ধ।
- TCP-তে যে দিক আগে connection বন্ধ করে, সেই socket কিছুক্ষণ **TIME_WAIT** অবস্থায় থাকে, যাতে দেরিতে আসা পুরনো packet নতুন connection-এ ঢুকে না পড়ে। Linux-এ এই সময় ৬০ সেকেন্ড।
- তাহলে যেকোনো মুহূর্তে প্রায় ১,০০০ × ৬০ = **৬০,০০০টা socket TIME_WAIT-এ।**
- প্রতিটা outbound connection-এর জন্য proxy-কে একটা local port লাগে। একই app server-এর একই ip:port-এ যেতে Linux-এর default ephemeral port range (32768-60999) মানে মোটামুটি **২৮,০০০টা port।**

৬০,০০০ > ২৮,০০০। Port শেষ হয়ে গেলে নতুন connection খোলা যায় না, NGINX-এর log-এ "Cannot assign requested address", আর user-রা পায় 502। এটা **ephemeral port exhaustion**, আর load test-এ সবচেয়ে প্রচলিত "রহস্যময়" error-গুলোর একটা।

### Keep-alive দিয়ে connection pool

\`\`\`nginx
upstream app {
    server app:8000;
    keepalive 16;                  # প্রতিটা worker process-এ সর্বোচ্চ ১৬টা অলস connection জমা রাখো
}

server {
    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;        # HTTP/1.1-এ keep-alive স্বাভাবিক
        proxy_set_header Connection "";  # client-এর "Connection: close" upstream-এ যেন না যায়
    }
}
\`\`\`

এখন একটা connection শত শত request বয়ে নেয়। একটা connection গড়ে ২০০ request বইলে ১,০০০ req/s-এর জন্য নতুন connection লাগে সেকেন্ডে মাত্র ৫টা, TIME_WAIT-এ থাকে ৫ × ৬০ = ৩০০টা। আর প্রতিটা request থেকে একটা handshake-এর latency (একই data center-এ কয়েকশো microsecond, TLS হলে আরও বেশি) কমে যায়।

খেয়াল রাখার মতো:
- \`keepalive 16\` মানে সর্বোচ্চ connection ১৬ না; ব্যস্ত সময়ে বেশি খুলবে, শুধু অলস হলে ১৬টা জমা থাকবে, বাকিগুলো বন্ধ হবে।
- App server-এর নিজের keep-alive timeout proxy-র চেয়ে **বেশি** রাখুন। App আগে অলস connection বন্ধ করে দিলে, ঠিক সেই মুহূর্তে proxy সেই connection-এ request পাঠালে একটা অহেতুক 502 আসে। (অনেক cloud LB-র documentation-এ একই পরামর্শ।)
- HAProxy-তে একই ধারণার নাম \`http-reuse\`, Envoy-তে connection pool setting। নাম ভিন্ন, ধারণা একই: **connection দামি, reuse করো।**

এই একই কারণে database-এর সামনে PgBouncer-এর মতো connection pooler বসানো হয়, সেটাও আসলে একটা বিশেষ ধরনের proxy।`,
    },
    {
      title: "Proxy-তে caching আর compression: কতটুকু proxy-র কাজ, কতটুকু না",
      markdown: `### Caching

[Day 11](${day(11)})-এ CDN-এর edge-এ \`Cache-Control\`, \`ETag\`, cache key, stampede সব দেখেছি। একই জিনিস আপনার নিজের reverse proxy-তেও চলে, শুধু এক জায়গায়। Lab-এ NGINX-এর \`proxy_cache\` দিয়ে একটা ধীর endpoint প্রথমবার MISS (১ সেকেন্ড), পরেরবার HIT (কয়েক millisecond) দেখবেন।

Reverse proxy cache-এর দুটো কাজের কৌশল:
- **Micro-caching:** খুব জনপ্রিয় dynamic page (যেমন exam-এর ফলাফলের সারাংশ), যেটা সেকেন্ডে হাজারবার চাওয়া হয়, মাত্র ১ সেকেন্ডের জন্য cache করা। ১,০০০ req/s থেকে app-এ যায় সেকেন্ডে ১টা। User দেখে বড়জোর ১ সেকেন্ড পুরনো data, যেটা প্রায় সব ক্ষেত্রে চলে।
- **Origin বিপদে পড়লে পুরনো কপি:** NGINX-এর \`proxy_cache_use_stale error timeout\` দিলে app down থাকলেও মেয়াদোত্তীর্ণ কপি দেওয়া যায়। খালি page-এর চেয়ে ৫ মিনিট পুরনো page ভালো।

Forward proxy-র cache দেখতে অন্যরকম। কোডঘরের ১ GB update ২০০ বার নামার বদলে Squid একবার নামিয়ে বাকি ১৯৯ বার নিজের disk থেকে দেয়: ২০০ GB-র জায়গায় ১ GB। তবে আজকের internet-এর বেশিরভাগই HTTPS, আর CONNECT tunnel-এ proxy ভেতরের file দেখতেই পায় না, তাই cache-ও করতে পারে না। এজন্য forward proxy caching এখন মূলত কাজে লাগে HTTP-তে চলা package mirror বা update server-এ, অথবা interception-ওয়ালা পরিবেশে। (OS update-এর জন্য অনেক প্রতিষ্ঠান আলাদা নির্দিষ্ট cache server রাখে।)

একটা কঠিন নিয়ম সবখানে: **personalised response shared cache-এ যাবে না।** \`/api/me\`-এর মতো response-এ \`Cache-Control: private\` বা \`no-store\`, আর proxy-র cache শুধু নির্দিষ্ট path-এ চালু। Cache invalidation, eviction আর stampede সাধারণভাবে, এখন এটুকু জানলেই চলবে, [Day 17](${day(17)})-এ (Caching) গভীরে যাব।

### Compression

Text (HTML, JSON, CSS, JS) খুব ভালো compress হয়। Lab-এ একটা পুনরাবৃত্ত text-এর ৪৬,০০০ byte gzip-এ ৩৫৬ byte হবে (আসল JSON-এ সাধারণত ৫-১০ গুণ ছোট হয়, এতটা না)। কোডঘরের ২০০ KB প্রশ্নপত্র ৩০ KB-র আশেপাশে নামলে, ধীর 3G-তে কয়েক সেকেন্ড বাঁচে।

কেন app-এ না করে proxy-তে? এক জায়গায় নিয়ম, সব app-এর জন্য; আর app-এর CPU বাঁচে। কিন্তু খেয়াল:
- **যা আগে থেকেই compressed** (JPEG, PNG, MP4, ZIP), তা আবার compress করলে CPU নষ্ট, আকার প্রায় একই। তাই \`gzip_types\`-এ শুধু text-ধর্মী type।
- **খুব ছোট response** (কয়েকশো byte) compress করলে লাভ নেই, header-এর বোঝা বরং বাড়ে। তাই \`gzip_min_length\`।
- **Brotli** সাধারণত gzip-এর চেয়ে ভালো compress করে, বিশেষ করে static file আগে থেকে compress করে রাখলে।
- Compression মানে CPU। খুব ব্যস্ত proxy-তে compression level কম রাখা (যেমন gzip level 1-5) সাধারণত ভালো ভারসাম্য।
- নিরাপত্তার একটা সূক্ষ্ম দিক: একই HTTPS response-এ গোপন token আর user-এর পাঠানো text একসাথে থাকলে, compressed আকার দেখে গোপন অংশ অনুমানের attack (**BREACH**) আছে। তাই খুব সংবেদনশীল response-এ সতর্ক থাকুন।`,
    },
    {
      title:
        "Proxy নিজেই SPOF, আর বড় ছবি: load balancer, API gateway, sidecar ও service mesh",
      markdown: `### সব পথ এক দরজায়, তাই দরজা পড়লে সব পড়ে

Reverse proxy পড়ে গেলে, পেছনে ১০টা সুস্থ app server থাকলেও site বন্ধ। Forward proxy পড়লে পুরো অফিস internet-ছাড়া। [Day 6](${day(6)})-এর ভাষায় proxy একটা **single point of failure (SPOF)**।

Reverse proxy-র জন্য সমাধান [Day 9](${day(9)})-এ load balancer-এর জন্য যা দেখেছি তাই: floating IP সহ active-passive জোড়া (keepalived/VRRP), বা DNS/ECMP দিয়ে active-active দল। আলাদা কিছু শিখতে হবে না, কারণ L7 LB আর reverse proxy একই জাতের জিনিস।

Forward proxy-তে একটা নীতিগত প্রশ্ন আসে: proxy down হলে কী হবে?
- **Fail-open:** proxy না পেলে client সরাসরি যাক (PAC file-এ \`"PROXY proxy1:3128; PROXY proxy2:3128; DIRECT"\`)। কাজ চলে, কিন্তু সেই সময় filtering আর log নেই।
- **Fail-closed:** proxy না থাকলে বাইরে যাওয়া বন্ধ। নিরাপদ, কিন্তু কাজও বন্ধ।

Bank-এর মতো জায়গা fail-closed বেছে নেয় আর তাই proxy-র redundancy-তে বেশি খরচ করে; সাধারণ অফিস প্রায়ই fail-open।

আরেকটা ঝুঁকি: proxy-র config একটা জায়গায়, তাই একটা ভুল config (ভুল regex-এ সব request block) মুহূর্তে সবার জন্য সব ভেঙে দেয়। Config বদল ধাপে ধাপে, আর \`nginx -t\`-এর মতো যাচাই আগে।

### Reverse proxy, load balancer, API gateway: একই পরিবারের তিন সদস্য

এগুলো আলাদা জিনিস না, একই ধারণার ভিন্ন **জোর**:
- **Reverse proxy:** সাধারণ নাম। সামনে দাঁড়ানো, TLS, buffering, cache, routing।
- **Load balancer:** reverse proxy (বা L4-এ শুধু packet/connection পার করা যন্ত্র), যার মূল জোর একাধিক server-এ ভাগ করা আর health check। [Day 9](${day(9)})।
- **API gateway:** reverse proxy, যার জোর API-কেন্দ্রিক নিয়মে: authentication, API key, প্রতি-client rate limit ও quota, request/response রূপান্তর, version। এর বিস্তারিত পরের দিন, [Day 16](${day(16)})-এ।

বাস্তবে একই software তিন ভূমিকাতেই চলে। NGINX একই config-এ TLS খোলে, ভাগ করে, আবার \`limit_req\` দিয়ে rate limit-ও করে। তাই প্রশ্ন "এটা কোনটা?" না, প্রশ্ন "এই জায়গায় আমার কোন কাজগুলো দরকার?" Trade-offs অংশের table-এ পাশাপাশি দেখুন।

### Sidecar proxy আর service mesh (পরিচিতি)

এতক্ষণ proxy ছিল সামনের দরজায়, বাইরে আর ভেতরের মাঝে (একে বলে **north-south** traffic)। কিন্তু microservice-এ বেশিরভাগ traffic ভেতরেই: Order service → Payment service → Inventory service (**east-west** traffic)। এদের মাঝেও retry, timeout, mTLS encryption, metrics দরকার। প্রতিটা service-এর code-এ, প্রতিটা ভাষায় আলাদা করে এগুলো লিখলে ভুল আর অমিল অনিবার্য।

সমাধান: প্রতিটা service instance-এর পাশে একটা ছোট proxy, একই machine বা Kubernetes pod-এ, যাকে বলে **sidecar**। Service-এর সব আসা-যাওয়া traffic (সাধারণত iptables rule দিয়ে স্বয়ংক্রিয়ভাবে) sidecar দিয়ে যায়। Service ভাবে সরাসরি কথা বলছে; আসলে:

\`Order service → Order-এর sidecar → (mTLS) → Payment-এর sidecar → Payment service\`

লক্ষ করুন, এখানে একই sidecar বাইরে যাওয়ার সময় forward proxy-র মতো (নিজের service-এর হয়ে) আর ভেতরে আসার সময় reverse proxy-র মতো (নিজের service-এর সামনে) কাজ করে।

সব sidecar-কে কেন্দ্র থেকে নিয়ম দেয় একটা **control plane**; sidecar-গুলো মিলে **data plane**। পুরোটাকে বলে **service mesh**। Istio Envoy-কে sidecar হিসেবে ব্যবহার করে, Linkerd ব্যবহার করে Rust-এ লেখা নিজের ছোট proxy। দাম: প্রতিটা pod-এ বাড়তি একটা process (memory, CPU), প্রতিটা call-এ দুটো বাড়তি hop, আর চালানোর জটিলতা। (এই দামের কারণেই sidecar ছাড়া mesh-এর পদ্ধতিও এসেছে।) Service mesh, এখন এটুকু জানলেই চলবে, [Day 63](${day(63)})-এ (Service Discovery ও Service Mesh) গভীরে যাব।`,
      diagrams: [
        {
          id: "day-015-sidecar",
          caption:
            "Sidecar: প্রতিটা service-এর পাশে একটা proxy; service-গুলোর মধ্যে সব traffic sidecar থেকে sidecar-এ যায়, আর control plane সবাইকে নিয়ম দেয়।",
          alt: "উপরে Control Plane, তা থেকে দুটো sidecar-এ ড্যাশ দেওয়া তীর 'config'। নিচে Order Service থেকে Order sidecar, সেখান থেকে 'mTLS' লেবেলসহ Payment sidecar, সেখান থেকে Payment Service।",
        },
      ],
    },
  ],

  tradeOffs: {
    markdown: `**কখন proxy বসাবেন:**
- **Reverse proxy:** প্রায় সব production web app-এ, এমনকি একটাই server থাকলেও। TLS এক জায়গায়, ধীর client থেকে app-এর সুরক্ষা, compression, আর ভবিষ্যতে server যোগ করার সুযোগ। খরচ কম, লাভ অনেক।
- **Forward proxy:** যখন বাইরে যাওয়া নিয়ন্ত্রণ, audit বা একটাই বের হওয়ার IP দরকার: অফিস network, আর production-এ যেসব server-কে শুধু নির্দিষ্ট কিছু বাইরের API-তে যেতে দেওয়া হবে।
- **Sidecar/mesh:** অনেক service, অনেক ভাষা, আর সবার মধ্যে mTLS, retry, metrics একইভাবে চাই।

**কখন না বা সাবধানে:**
- খুব latency-সংবেদনশীল ভেতরের call-এ প্রতিটা বাড়তি hop গুনতে হয়। Sidecar প্রতিটা call-এ দুটো hop যোগ করে।
- Proxy-তে এমন logic ঢোকাবেন না যেটা আসলে business rule (order-এর নিয়ম, দামের হিসাব)। Proxy config-এ লুকানো business logic test করা কঠিন আর কেউ খুঁজে পায় না।
- TLS interception শুধু স্পষ্ট নীতি, আইনি ভিত্তি আর নিরাপদ CA ব্যবস্থাপনা থাকলে।
- Streaming response-এ buffering চালু রেখে "কেন কিছু আসছে না" ভাবা।

একই পরিবারের সদস্যদের পাশাপাশি:`,
    table: {
      headers: [
        "বিষয়",
        "Forward Proxy",
        "Reverse Proxy",
        "Load Balancer",
        "API Gateway",
      ],
      rows: [
        [
          "কার হয়ে কাজ করে",
          "Client-এর (অফিস, campus, egress)",
          "Server-এর",
          "Server-এর",
          "Server-এর (API-র)",
        ],
        [
          "মূল জোর",
          "Egress control, log, cache, পরিচয় আড়াল",
          "সামনে দাঁড়ানো: TLS, buffering, cache, routing, origin লুকানো",
          "অনেক server-এ ভাগ, health check, failover",
          "Auth, API key, প্রতি-client rate limit ও quota, রূপান্তর",
        ],
        [
          "Client কি proxy-র কথা জানে",
          "হ্যাঁ (setting/PAC), transparent হলে না",
          "না",
          "না",
          "না, তবে API key/token দেয়",
        ],
        [
          "HTTPS-এর ভেতর দেখে কি",
          "সাধারণত না (CONNECT tunnel); interception হলে হ্যাঁ",
          "হ্যাঁ, TLS এখানে খোলে",
          "L7 হলে হ্যাঁ, L4 হলে না",
          "হ্যাঁ",
        ],
        [
          "কোন layer",
          "L7 (HTTP), CONNECT-এ L4-এর মতো tunnel",
          "সাধারণত L7",
          "L4 বা L7",
          "L7",
        ],
        [
          "প্রচলিত tool",
          "Squid, অফিসের secure web gateway",
          "NGINX, HAProxy, Envoy, Caddy",
          "HAProxy, NGINX, AWS ALB/NLB",
          "Kong, AWS API Gateway, Envoy-ভিত্তিক gateway",
        ],
        [
          "পড়ে গেলে",
          "অফিস internet-ছাড়া (fail-open না হলে)",
          "Site বন্ধ",
          "Site বন্ধ",
          "সব API বন্ধ",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **NGINX:** web server হিসেবে শুরু, কিন্তু আজ সবচেয়ে বেশি চলে reverse proxy হিসেবে। Documentation অনুযায়ী \`ngx_http_proxy_module\` (proxy_pass, buffering, \`proxy_cache\`), \`ngx_http_realip_module\` (\`set_real_ip_from\`, \`real_ip_recursive\`) আর upstream-এর \`keepalive\` আজকের প্রায় সব ধারণা দেয়। Kubernetes-এর জনপ্রিয় ingress controller-গুলোর একটা (ingress-nginx) এর উপর বানানো। মূল NGINX forward proxy হিসেবে HTTPS-এর CONNECT সামলায় না; সেজন্য Squid-এর মতো tool।
- **Squid:** পুরনো ও বহুল ব্যবহৃত caching forward proxy। ACL দিয়ে domain/port/সময় অনুযায়ী নিয়ম, CONNECT tunnel, আর **SSL Bump** দিয়ে TLS interception। আজকের lab-এ এটাই।
- **HAProxy:** উচ্চ-ক্ষমতার L4/L7 proxy ও load balancer। \`option forwardfor\` দিয়ে X-Forwarded-For যোগ করে, \`http-reuse\` দিয়ে upstream connection reuse করে।
- **Envoy:** Lyft-এ তৈরি, পরে open source, এখন CNCF-এর graduated project। Istio service mesh-এর sidecar আর অনেক API gateway-র ভিত্তি। Retry, circuit breaking, outlier detection, rate limit সবই proxy-তে।
- **Linkerd:** আরেকটা service mesh, sidecar হিসেবে Rust-এ লেখা নিজস্ব হালকা proxy (linkerd2-proxy) ব্যবহার করে।
- **Cloudflare:** বিশাল reverse proxy network। Documentation অনুযায়ী origin-এ পাঠানো request-এ visitor-এর IP \`CF-Connecting-IP\` আর \`X-Forwarded-For\` header-এ দেয়, আর তাদের IP range-এর তালিকা প্রকাশ করে, যাতে origin শুধু ওই range থেকে আসা header বিশ্বাস করতে (বা শুধু ওই range থেকে traffic নিতে) পারে।
- **AWS Application Load Balancer:** Documentation অনুযায়ী target-এ পাঠানো request-এ \`X-Forwarded-For\`, \`X-Forwarded-Proto\` আর \`X-Forwarded-Port\` যোগ করে, কারণ target নিজে শুধু ALB-র IP দেখে।
- **অফিস ও campus:** বড় প্রতিষ্ঠান সাধারণত "secure web gateway" নামে forward proxy চালায় (নিজেদের data center-এ বা cloud service হিসেবে), PAC file দিয়ে laptop-গুলো সেদিকে পাঠায়, আর নীতি অনুযায়ী নির্দিষ্ট category-র HTTPS interception করে।

*উৎস: NGINX documentation (ngx_http_proxy_module, ngx_http_realip_module, ngx_http_upstream_module: keepalive, ngx_http_gzip_module, ngx_http_core_module: client_max_body_size ও timeouts); Squid documentation (http_access, CONNECT, SslBump, access log tags); HAProxy Configuration Manual (option forwardfor, http-reuse); Envoy documentation ও CNCF project page; Istio ও Linkerd documentation; Cloudflare documentation (HTTP request headers: CF-Connecting-IP, X-Forwarded-For; IP ranges); AWS Elastic Load Balancing documentation (X-Forwarded headers); RFC 7239 (Forwarded HTTP Extension); RFC 9110 (HTTP Semantics: CONNECT, Via, 407); RFC 9112 (HTTP/1.1: absolute-form); httpoxy.org (CVE-2016-5385 সহ httpoxy সমস্যার বিবরণ)।*`,
  },

  mistakes: [
    {
      mistake:
        "X-Forwarded-For-এর প্রথম (বামের) IP-কে আসল client ধরে নেওয়া। Attacker নিজে header পাঠিয়ে IP-ভিত্তিক rate limit, login lock আর allowlist পার হয়ে যায়।",
      fix: "ডান দিক থেকে পড়ুন, শুধু নিজের চেনা proxy-র IP বাদ দিন; NGINX-এ set_real_ip_from + real_ip_recursive on, আর app শুধু সেই একটা মান বিশ্বাস করুক।",
    },
    {
      mistake:
        "Origin server-কে internet থেকে সরাসরি পৌঁছানোর মতো খোলা রাখা। কেউ proxy/CDN পাশ কাটিয়ে সরাসরি আসে, সাথে নকল XFF নিয়ে, আর proxy-র সব নিয়ম অর্থহীন হয়।",
      fix: "App server private network-এ রাখুন, firewall-এ শুধু proxy-র IP থেকে traffic নিন।",
    },
    {
      mistake:
        "TLS proxy-তে খুলে app-কে X-Forwarded-Proto না দেওয়া বা app-এ না পড়া। App ভাবে request HTTP, https-এ redirect করে, আর অসীম redirect loop বা Secure ছাড়া cookie।",
      fix: "Proxy-তে X-Forwarded-Proto $scheme পাঠান, আর app framework-এ 'trusted proxy' setting চালু করুন যাতে শুধু চেনা proxy-র header মানে।",
    },
    {
      mistake:
        "Forward proxy-কে internet-এর দিকে খোলা রেখে 'http_access allow all' দেওয়া (open proxy)। দুনিয়ার spammer আর attacker আপনার IP দিয়ে traffic চালায়।",
      fix: "শুধু নিজের network range allow করুন, proxy authentication দিন, CONNECT শুধু 443-এ, আর proxy-কে ভেতরের interface-এ bind করুন।",
    },
    {
      mistake:
        "Upstream keep-alive ছাড়া অনেক traffic চালানো। Load test-এ হঠাৎ 502, log-এ 'Cannot assign requested address'।",
      fix: 'upstream-এ keepalive, proxy_http_version 1.1 আর Connection "" দিন; app-এর keep-alive timeout proxy-র চেয়ে বেশি রাখুন।',
    },
    {
      mistake:
        "Streaming response (SSE, LLM-এর token-by-token উত্তর) proxy-র পেছনে চালু করে buffering বন্ধ না করা। Client পুরো উত্তর শেষ হওয়া পর্যন্ত কিছুই পায় না।",
      fix: "ওই location-এ proxy_buffering off দিন, বা app থেকে X-Accel-Buffering: no পাঠান; আর read timeout লম্বা করুন।",
    },
    {
      mistake:
        "একটাই reverse proxy বা forward proxy রেখে পেছনে অনেক server দিয়ে 'high availability' ভাবা।",
      fix: "Proxy-কেও জোড়ায় চালান (floating IP বা active-active), আর forward proxy-র জন্য fail-open নাকি fail-closed, আগেই ঠিক করুন।",
    },
  ],

  lab: [
    {
      title: "প্রস্তুতি: একটা echo app, একটা Squid আর একটা NGINX",
      markdown: `এই lab-এ Docker Compose দিয়ে তিনটা container চালাবেন:

- **app**: ছোট Python server। যেকোনো path-এ নিজের কাছে আসা সব header আর TCP peer-এর IP ফেরত দেয়। \`/news\` ১ সেকেন্ড দেরি করে আর \`Cache-Control: public, max-age=30\` পাঠায়। \`/big\` একটা বড় text দেয়।
- **squid**: forward proxy, host-এর port **8128**-এ।
- **rp**: NGINX reverse proxy, host-এর port **8150**-এ, app-এর সামনে।

দুটো port-ই \`127.0.0.1\`-এ bind করা, যাতে আপনার network-এর অন্য কেউ এই proxy ব্যবহার করতে না পারে। Docker আর curl ছাড়া কিছু লাগবে না। HTTPS-এর ধাপে internet লাগবে।

\`\`\`bash
mkdir -p proxy-lab/nginx && cd proxy-lab
\`\`\`

\`app.py\`:

\`\`\`bash
cat > app.py <<'EOF'
import json
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

origin_hits = 0


class Handler(BaseHTTPRequestHandler):
    def send(self, body, content_type, cache_control):
        data = body.encode()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", cache_control)
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        global origin_hits
        origin_hits += 1
        if self.path == "/news":
            # ধীর কাজের ভান, আর proxy-কে বলা: ৩০ সেকেন্ড cache করতে পারো
            time.sleep(1)
            body = f"আজকের খবর · origin hit #{origin_hits}\\n"
            self.send(body, "text/plain; charset=utf-8", "public, max-age=30")
        elif self.path == "/big":
            body = "proxy servers are fun. " * 2000
            self.send(body, "text/plain", "no-store")
        else:
            # কে আমাকে call করল, আর কোন header এলো, সব ফেরত দাও
            info = {
                "tcp_peer": self.client_address[0],
                "headers": dict(self.headers),
            }
            self.send(json.dumps(info, indent=2) + "\\n", "application/json", "no-store")

    def log_message(self, *args):
        pass


print("app listening on :8000", flush=True)
ThreadingHTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
EOF
\`\`\`

Squid-এর config। নিয়মগুলো উপর থেকে নিচে পড়া হয়, প্রথম যেটা মেলে সেটাই খাটে:

\`\`\`bash
cat > squid.conf <<'EOF'
http_port 3128

acl SSL_ports port 443
acl Safe_ports port 80 443 8000
acl blocked dstdomain .facebook.com

http_access deny !Safe_ports
http_access deny CONNECT !SSL_ports
http_access deny blocked
http_access allow all

logformat lab %>a %Ss/%>Hs %rm %ru
access_log stdio:/var/log/squid/access.log lab
EOF
\`\`\`

- \`deny CONNECT !SSL_ports\`: tunnel শুধু 443-এ, অন্য port-এ না।
- \`deny blocked\`: facebook.com আর তার সব subdomain বন্ধ, এটাই egress control।
- \`allow all\` শুধু এই lab-এর জন্য, কারণ port শুধু আপনার নিজের machine থেকে পৌঁছানো যায়। আসল অফিসে এখানে থাকবে \`acl office src 10.20.0.0/16\` আর \`http_access allow office\`। Internet-এর দিকে \`allow all\` মানে open proxy।
- \`logformat lab\`: log-এ client IP, ফলাফল/status, method আর URL।

NGINX reverse proxy-র config:

\`\`\`bash
cat > nginx/default.conf <<'EOF'
proxy_cache_path /var/cache/nginx/rp keys_zone=rp:10m max_size=100m inactive=10m;

upstream app {
    server app:8000;
    keepalive 16;                  # upstream-এ connection খোলা রেখে reuse
}

server {
    listen 80;

    gzip on;
    gzip_types text/plain application/json;
    gzip_min_length 1000;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;        # keepalive-এর জন্য দরকার
        proxy_set_header Connection "";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /news {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_cache rp;
        add_header X-Cache-Status $upstream_cache_status always;
    }
}
EOF
\`\`\`

\`compose.yaml\`। Squid-কে একটা নির্দিষ্ট IP (\`172.28.15.10\`) দেওয়া হয়েছে, শেষ পরীক্ষায় NGINX-কে বলব "শুধু এই IP-কে বিশ্বাস করো"।

\`\`\`bash
cat > compose.yaml <<'EOF'
name: sdlab-day015

services:
  app:
    image: python:3.12-alpine
    container_name: sdlab-day015-app
    command: python -u /app.py
    volumes:
      - ./app.py:/app.py:ro

  rp:
    image: nginx:1.27-alpine
    container_name: sdlab-day015-rp
    ports:
      - "127.0.0.1:8150:80"
    volumes:
      - ./nginx:/etc/nginx/conf.d:ro
    depends_on:
      - app

  squid:
    image: ubuntu/squid:6.6-24.04_beta
    container_name: sdlab-day015-squid
    ports:
      - "127.0.0.1:8128:3128"
    volumes:
      - ./squid.conf:/etc/squid/squid.conf:ro
    networks:
      default:
        ipv4_address: 172.28.15.10

networks:
  default:
    name: sdlab-day015-net
    ipam:
      config:
        - subnet: 172.28.15.0/24
EOF

docker compose up -d && sleep 5
\`\`\`

\`ubuntu/squid\` image-এ Intel আর Apple Silicon (arm64) দুটোর build আছে। Port 8128/8150 বা subnet \`172.28.15.0/24\` আপনার machine-এ আগে থেকে ব্যবহৃত হলে \`compose.yaml\`-এ বদলে নিন (subnet বদলালে Squid-এর IP আর শেষ ধাপের \`realip.conf\`-ও বদলাতে হবে)।`,
    },
    {
      title: "পরীক্ষা ১: Forward proxy দিয়ে HTTP request, আর proxy-র log",
      markdown: `\`curl -x\` মানে "এই proxy দিয়ে যাও"। App-কে proxy দিয়ে call করুন:

\`\`\`bash
curl -s -x http://localhost:8128 http://app:8000/hello
\`\`\`

\`\`\`text
{
  "tcp_peer": "172.28.15.10",
  "headers": {
    "Host": "app:8000",
    "User-Agent": "curl/8.7.1",
    "Accept": "*/*",
    "Via": "1.1 ecc60986a01a (squid/6.13)",
    "X-Forwarded-For": "172.28.15.1",
    "Cache-Control": "max-age=259200",
    "Connection": "keep-alive"
  }
}
\`\`\`

তিনটা জিনিস খেয়াল করুন:
1. **\`app\` নামটা আপনার machine চেনে না**, চেনে শুধু Docker network-এর ভেতরের Squid। তবুও কাজ করল, কারণ forward proxy-তে DNS lookup করে **proxy**, client না।
2. **\`tcp_peer\` হলো Squid-এর IP** (\`172.28.15.10\`)। App আপনাকে দেখেনি, দেখেছে proxy-কে।
3. Squid নিজে থেকে যোগ করেছে **\`Via\`** (কোন proxy পেরিয়ে এলো) আর **\`X-Forwarded-For\`** (আসলে কার request)। Docker Desktop-এ আপনার machine এই network-এ gateway address \`172.28.15.1\` হিসেবে দেখা যায়। (Container id, version আর curl version আপনার ক্ষেত্রে আলাদা হতে পারে।)

এবার proxy-র খাতা দেখুন:

\`\`\`bash
docker exec sdlab-day015-squid tail -1 /var/log/squid/access.log
\`\`\`

\`\`\`text
172.28.15.1 TCP_MISS/200 GET http://app:8000/hello
\`\`\`

HTTP-তে proxy **পুরো URL** দেখে আর লিখে রাখে, path সহ। \`TCP_MISS\` মানে cache-এ ছিল না, বাইরে থেকে আনতে হয়েছে।`,
    },
    {
      title: "পরীক্ষা ২: HTTPS আর CONNECT tunnel",
      markdown: `এবার একটা HTTPS site (internet লাগবে)। \`-v\` দিলে curl proxy-র সাথে কথোপকথন দেখায়:

\`\`\`bash
curl -v -s -o /dev/null -x http://localhost:8128 https://example.com 2>&1 \\
  | grep -E '^> CONNECT|^< HTTP/1.1|SSL connection using|subject:'
\`\`\`

\`\`\`text
> CONNECT example.com:443 HTTP/1.1
< HTTP/1.1 200 Connection established
* SSL connection using TLSv1.3 / AEAD-CHACHA20-POLY1305-SHA256 / [blank] / UNDEF
*  subject: CN=example.com
\`\`\`

ধাপগুলো মিলিয়ে নিন: curl বলল \`CONNECT example.com:443\`, Squid বলল \`200 Connection established\`, তারপর curl tunnel-এর ভেতর দিয়ে **সরাসরি example.com-এর সাথে** TLS করল, আর certificate এলো example.com-এরই (\`subject: CN=example.com\`), Squid-এর না। (Cipher-এর লাইন আপনার curl আর OS অনুযায়ী আলাদা দেখাতে পারে।)

এবার log:

\`\`\`bash
docker exec sdlab-day015-squid tail -1 /var/log/squid/access.log
\`\`\`

\`\`\`text
172.28.15.1 TCP_TUNNEL/200 CONNECT example.com:443
\`\`\`

\`TCP_TUNNEL\`, আর URL-এর জায়গায় শুধু \`example.com:443\`। Path কী ছিল, কী header গেল, Squid জানে না। এটাই "proxy HTTPS-এর ভেতর দেখে না"-এর প্রমাণ।`,
    },
    {
      title: "পরীক্ষা ৩: Egress control, একটা domain বন্ধ",
      markdown: `\`\`\`bash
curl -v -s -o /dev/null -x http://localhost:8128 https://www.facebook.com 2>&1 \\
  | grep -E '^< HTTP/1.1|tunnel failed'
docker exec sdlab-day015-squid tail -1 /var/log/squid/access.log
\`\`\`

\`\`\`text
< HTTP/1.1 403 Forbidden
* CONNECT tunnel failed, response 403
172.28.15.1 TCP_DENIED/403 CONNECT www.facebook.com:443
\`\`\`

HTTPS হলেও block করা গেল, কারণ hostname CONNECT line-এই খোলা থাকে। কিন্তু "facebook-এর শুধু একটা page বন্ধ" এভাবে করা যেত না, কারণ path tunnel-এর ভেতরে, encrypted।`,
    },
    {
      title: "পরীক্ষা ৪: Forward proxy-র cache",
      markdown: `\`/news\` ১ সেকেন্ড নেয়, আর \`max-age=30\` বলে। Proxy দিয়ে দুবার চাই:

\`\`\`bash
for i in 1 2; do
  curl -s -w 'time=%{time_total}s\\n' -x http://localhost:8128 http://app:8000/news
done
docker exec sdlab-day015-squid tail -2 /var/log/squid/access.log
\`\`\`

\`\`\`text
আজকের খবর · origin hit #2
time=1.007254s
আজকের খবর · origin hit #2
time=0.002406s
172.28.15.1 TCP_MISS/200 GET http://app:8000/news
172.28.15.1 TCP_MEM_HIT/200 GET http://app:8000/news
\`\`\`

দ্বিতীয়বার origin-এ যায়ইনি: hit নম্বর বাড়েনি, সময় ১ সেকেন্ড থেকে ২ millisecond, আর log-এ \`TCP_MEM_HIT\` (Squid-এর memory cache থেকে)। কোডঘরের ১ GB update ২০০ বার নামার বদলে এভাবেই একবার নামে। তবে মনে রাখুন, HTTPS (CONNECT) হলে এই cache কাজ করত না। (Hit নম্বর আপনার ক্ষেত্রে আলাদা হতে পারে; জরুরি হলো দুবার একই থাকা।)`,
    },
    {
      title: "পরীক্ষা ৫: Reverse proxy-র পেছনে app কী দেখে",
      markdown: `এবার উল্টো দিক। আপনি সরাসরি NGINX-কে call করছেন, কোনো proxy setting ছাড়া, যেমন বাইরের একজন user করে:

\`\`\`bash
curl -s localhost:8150/orders
\`\`\`

\`\`\`text
{
  "tcp_peer": "172.28.15.3",
  "headers": {
    "Host": "localhost",
    "X-Real-IP": "172.28.15.1",
    "X-Forwarded-For": "172.28.15.1",
    "X-Forwarded-Proto": "http",
    "User-Agent": "curl/8.7.1",
    "Accept": "*/*"
  }
}
\`\`\`

- \`tcp_peer\` NGINX-এর IP। App আপনার সাথে সরাসরি কোনো connection পায়নি।
- আপনার IP app জানল শুধু NGINX-এর লেখা header থেকে: \`X-Real-IP\` আর \`X-Forwarded-For\`।
- \`X-Forwarded-Proto: http\`, কারণ এই lab-এ TLS নেই। Production-এ NGINX TLS খুললে এখানে \`https\` থাকত, আর app এটা দেখেই বুঝত redirect লাগবে কিনা।
- আপনি কখনো জানলেন না পেছনে Python app আছে, কোন port-এ। **Origin লুকানো।**`,
    },
    {
      title: "পরীক্ষা ৬: নকল X-Forwarded-For দিয়ে spoofing",
      markdown: `এবার attacker-এর মতো নিজেই একটা XFF পাঠান:

\`\`\`bash
curl -s -H 'X-Forwarded-For: 6.6.6.6' localhost:8150/ | grep -E '"X-'
\`\`\`

\`\`\`text
    "X-Real-IP": "172.28.15.1",
    "X-Forwarded-For": "6.6.6.6, 172.28.15.1",
    "X-Forwarded-Proto": "http",
\`\`\`

NGINX আপনার নকল মানটা রেখে দিয়ে তার ডানে আসল IP যোগ করেছে। App যদি XFF-এর **প্রথম** IP-কে client ধরে, সে ভাববে request এসেছে \`6.6.6.6\` থেকে। প্রতি request-এ নতুন নকল IP পাঠালে IP-ভিত্তিক rate limit কোনো কাজেই আসবে না।

\`X-Real-IP\` ঠিক আছে, কারণ NGINX সেটা নিজের দেখা \`$remote_addr\` থেকে লিখেছে, client-এর header থেকে না।`,
    },
    {
      title: "পরীক্ষা ৭: gzip compression",
      markdown: `\`/big\` প্রায় ৪৬ KB text। একবার compression ছাড়া, একবার \`Accept-Encoding: gzip\` বলে:

\`\`\`bash
curl -s -o /dev/null -w 'plain: %{size_download} bytes\\n' localhost:8150/big
curl -s -H 'Accept-Encoding: gzip' -o /dev/null -w 'gzip:  %{size_download} bytes\\n' localhost:8150/big
curl -s -H 'Accept-Encoding: gzip' -D - -o /dev/null localhost:8150/big | grep -i content-encoding
\`\`\`

\`\`\`text
plain: 46000 bytes
gzip:  356 bytes
Content-Encoding: gzip
\`\`\`

App কিছুই বদলায়নি, NGINX পথে compress করেছে। এখানে অনুপাত অস্বাভাবিক বড়, কারণ একই বাক্য ২,০০০ বার; আসল JSON বা HTML সাধারণত ৫-১০ গুণ ছোট হয়। আর client \`Accept-Encoding\` না বললে NGINX compress করে না, কারণ client হয়তো খুলতে পারবে না।`,
    },
    {
      title: "পরীক্ষা ৮: Reverse proxy-র cache, MISS তারপর HIT",
      markdown: `\`\`\`bash
for i in 1 2 3; do
  curl -s -D - -w 'time=%{time_total}s\\n' localhost:8150/news | grep -E 'X-Cache|খবর|time='
done
\`\`\`

\`\`\`text
X-Cache-Status: MISS
আজকের খবর · origin hit #8
time=1.022448s
X-Cache-Status: HIT
আজকের খবর · origin hit #8
time=0.004937s
X-Cache-Status: HIT
আজকের খবর · origin hit #8
time=0.004692s
\`\`\`

প্রথমটা MISS, app-এ গেল, ১ সেকেন্ড। পরের দুটো HIT, NGINX নিজের cache থেকে, কয়েক millisecond, app-এর hit নম্বর বাড়েনি। NGINX app-এর \`Cache-Control: public, max-age=30\` মেনেছে; ৩০ সেকেন্ড পরে আবার MISS দেখবেন। (Hit নম্বর আগের পরীক্ষাগুলোর উপর নির্ভর করে, তাই আপনার ক্ষেত্রে আলাদা হতে পারে।) Cache-এর গভীর অংশ [Day 11](${day(11)})-এর lab-এ করেছিলেন।`,
    },
    {
      title: "পরীক্ষা ৯: দুই hop, আর trusted proxy দিয়ে আসল IP",
      markdown: `এবার দুটো proxy জুড়ে দিন: আপনি → Squid (forward) → NGINX (reverse) → app। ঠিক যেমন অফিসের কেউ proxy দিয়ে বাইরের একটা site-এ যায়:

\`\`\`bash
curl -s -x http://localhost:8128 http://rp/ | grep -E '"X-(Real|Forwarded-For)|Via'
\`\`\`

\`\`\`text
    "X-Real-IP": "172.28.15.10",
    "X-Forwarded-For": "172.28.15.1, 172.28.15.10",
    "Via": "1.1 ecc60986a01a (squid/6.13)",
\`\`\`

XFF-এ দুটো IP: বামে আপনি (Squid যোগ করেছে), ডানে Squid (NGINX যোগ করেছে)। কিন্তু \`X-Real-IP\` এখন **Squid-এর IP**, কারণ NGINX-এর চোখে TCP peer Squid। এভাবে চললে app সব অফিস-কর্মীকে একজন মানুষ ভাববে।

NGINX-কে বলুন, Squid-এর লেখা XFF বিশ্বাসযোগ্য। \`conf.d\`-এর সব \`.conf\` file NGINX পড়ে, তাই একটা নতুন file যথেষ্ট:

\`\`\`bash
cat > nginx/realip.conf <<'EOF'
# শুধু এই address-এর পাঠানো X-Forwarded-For বিশ্বাস করো (আমাদের squid)
set_real_ip_from 172.28.15.10;
real_ip_header X-Forwarded-For;
real_ip_recursive on;
EOF

docker exec sdlab-day015-rp nginx -t && docker exec sdlab-day015-rp nginx -s reload
\`\`\`

তিনটা request দিয়ে যাচাই করুন: Squid দিয়ে, সরাসরি নকল XFF সহ, আর Squid দিয়ে নকল XFF সহ।

\`\`\`bash
curl -s -x http://localhost:8128 http://rp/ | grep -E '"X-(Real|Forwarded-For)'
curl -s -H 'X-Forwarded-For: 6.6.6.6' localhost:8150/ | grep -E '"X-(Real|Forwarded-For)'
curl -s -H 'X-Forwarded-For: 6.6.6.6' -x http://localhost:8128 http://rp/ | grep -E '"X-(Real|Forwarded-For)'
\`\`\`

\`\`\`text
    "X-Real-IP": "172.28.15.1",
    "X-Forwarded-For": "172.28.15.1, 172.28.15.1",
    "X-Real-IP": "172.28.15.1",
    "X-Forwarded-For": "6.6.6.6, 172.28.15.1",
    "X-Real-IP": "172.28.15.1",
    "X-Forwarded-For": "6.6.6.6, 172.28.15.1, 172.28.15.1",
\`\`\`

তিনবারই \`X-Real-IP\` আসল client \`172.28.15.1\`:
1. Squid দিয়ে: peer Squid (trusted), তাই NGINX XFF থেকে Squid-এর আগের IP নিল।
2. সরাসরি নকল XFF: peer আপনার machine, trusted না, তাই XFF পুরো উপেক্ষা। \`6.6.6.6\` কাজে এলো না।
3. Squid দিয়ে নকল XFF: \`real_ip_recursive on\` ডান থেকে trusted IP বাদ দিয়ে প্রথম untrusted IP নিল, \`6.6.6.6\` বামে পড়ে রইল।

XFF-এ \`172.28.15.1\` দুবার কেন? real_ip চালুর পরে NGINX-এর \`$remote_addr\` নিজেই বদলে client-এর IP হয়ে যায়, তাই \`$proxy_add_x_forwarded_for\` Squid-এর বদলে আবার client-এর IP যোগ করে। এজন্যই app-কে শুধু \`X-Real-IP\`-এর মতো একটা পরিষ্কার মান বিশ্বাস করতে বলা সহজ।`,
    },
    {
      title: "পরিষ্কার করুন",
      markdown: `\`\`\`bash
docker compose down -v
cd .. && rm -rf proxy-lab
\`\`\`

\`-v\` দরকার, কারণ Squid image-এর log আর cache directory আলাদা volume-এ থাকে।

চাইলে আরও খেলুন:
- \`squid.conf\`-এ \`acl worktime time MTWHF 09:00-18:00\` আর \`http_access deny blocked worktime\` দিয়ে শুধু অফিস সময়ে block করুন (\`docker compose restart squid\`)।
- NGINX-এ \`location /news\`-এ \`proxy_cache_use_stale error timeout;\` যোগ করে reload দিন, তারপর \`docker stop sdlab-day015-app\`। Cache-এ থাকা \`/news\` তবুও আসে কিনা দেখুন, আর \`/orders\` কী error দেয় (502)।
- নিজের terminal-এ \`export https_proxy=http://localhost:8128\` দিয়ে কয়েকটা সাধারণ \`curl https://...\` চালান, তারপর Squid-এর log দেখুন। (শেষে \`unset https_proxy\`।)`,
    },
  ],

  connections: {
    markdown: `- **[Day 2](${day(2)}) · Client, Server ও Internet:** সেখানে client আর server-এর মধ্যে একটা সরাসরি connection ছিল। Proxy সেটাকে দুটো connection-এ ভাঙে, আর মাঝে একটা নিয়ন্ত্রণের জায়গা তৈরি করে।
- **[Day 3](${day(3)}) · DNS, HTTP ও URL:** Forward proxy-তে DNS করে proxy নিজে, আর request line-এ পুরো URL যায়। আর reverse proxy কাজ করে কারণ DNS আপনার domain-এর জন্য proxy-র IP দেয়।
- **[Day 6](${day(6)}) · Availability:** সব traffic এক দরজায়, তাই proxy SPOF। Redundancy-র একই নিয়ম এখানেও।
- **[Day 9](${day(9)}) · Load Balancers:** L7 load balancer আসলে একটা reverse proxy। TLS termination, passthrough, re-encryption আর active-passive জোড়া সেখানে দেখেছি; আজ দেখলাম header, buffering আর connection pool।
- **[Day 11](${day(11)}) · CDN:** CDN-এর edge পৃথিবীজুড়ে ছড়ানো reverse proxy। Cache-এর নিয়ম (\`Cache-Control\`, cache key) একই। আর CDN-এর পেছনে real client IP খুঁজতেই আজকের \`set_real_ip_from\` লাগে।
- **[Day 13](${day(13)}) · Vertical vs Horizontal Scaling:** Server বাড়ালে সামনে একটা একক প্রবেশপথ লাগে; সেটা reverse proxy।
- **[Day 14](${day(14)}) · Stateful vs Stateless:** Proxy নিজে প্রায় stateless (cache ছাড়া), তাই তাকে জোড়ায় বা দলে চালানো সহজ।

সামনে যা আসছে: [Day 16](${day(16)})-এ API Gateway (reverse proxy + API-র নিয়ম), [Day 17](${day(17)})-এ Caching গভীরে, [Day 18](${day(18)})-এ Rate Limiting, [Day 41](${day(41)})-এ TLS/SSL Handshake, [Day 42](${day(42)})-এ HTTP/1.1 vs HTTP/2 vs HTTP/3, [Day 59](${day(59)})-এ Circuit Breaker & Bulkhead, [Day 63](${day(63)})-এ Service Discovery ও Service Mesh, [Day 78](${day(78)})-এ Encryption ও TLS, আর [Day 81](${day(81)})-এ DDoS Mitigation।`,
  },

  explainYourself: [
    {
      question:
        'আপনার এক বন্ধু বলছে, "অফিসের proxy দিয়ে browse করলে IT সব দেখতে পায়, bank-এর password-ও।" কথাটা কখন ঠিক, কখন ভুল?',
      idealAnswer:
        "সাধারণ forward proxy-তে HTTPS যায় CONNECT tunnel দিয়ে: proxy শুধু hostname, port, সময় আর কত bytes গেল দেখে; path, header, password সব end-to-end encrypted, তাই দেখে না। তবে HTTP site হলে পুরো URL আর content দেখে। আর অফিস যদি TLS interception চালায় আর অফিসের laptop-এ নিজের root CA বসিয়ে রাখে, তাহলে proxy নকল certificate দিয়ে মাঝে খুলে সবকিছু দেখতে পারে। নিজের ব্যক্তিগত device-এ সেই CA না থাকলে interception করলে browser certificate error দেখাবে। তাই উত্তর: 'নির্ভর করে, device-এ অফিসের CA আছে কিনা আর interception চালু কিনা।'",
    },
    {
      question:
        "Load balancer, reverse proxy আর API gateway কি তিনটা আলাদা জিনিস? একটা ছোট startup-এর জন্য কোনটা দিয়ে শুরু করবেন?",
      idealAnswer:
        "তিনটাই server-এর সামনে বসা proxy, পার্থক্য মূল জোরে। Reverse proxy সাধারণ নাম (TLS, buffering, cache, routing); load balancer-এর জোর অনেক server-এ ভাগ আর health check; API gateway-র জোর auth, API key, প্রতি-client quota আর রূপান্তরের মতো API নিয়মে। একই NGINX তিনটার কাজই কিছুটা করতে পারে। ছোট startup একটা reverse proxy (NGINX বা Caddy) দিয়ে শুরু করবে: TLS, gzip, ধীর client থেকে সুরক্ষা, আর পরে server বাড়লে upstream-এ যোগ করা। আলাদা API gateway লাগবে যখন অনেক service বা বাইরের developer-দের জন্য public API আর তাদের key/quota সামলাতে হবে।",
    },
    {
      question:
        "App-এর log-এ সব request-এর IP একই দেখাচ্ছে: 10.0.1.5। আবার কেউ বলছে X-Forwarded-For-এর প্রথম IP নিলেই হবে। আপনি কী করবেন আর কেন?",
      idealAnswer:
        "10.0.1.5 সম্ভবত সামনের proxy বা load balancer-এর IP, কারণ app-এর TCP connection আসে proxy থেকে। XFF-এর প্রথম IP নেওয়া বিপজ্জনক, কারণ client নিজেই XFF পাঠাতে পারে, আর proxy শুধু তার ডানে যোগ করে, তাই বামের মান নকল হতে পারে। সঠিক পদ্ধতি: শুধু নিজের চেনা proxy-গুলোর IP trusted তালিকায় রাখা, XFF ডান থেকে পড়ে trusted IP বাদ দিয়ে প্রথম untrusted IP-কে client ধরা। NGINX-এ set_real_ip_from + real_ip_header X-Forwarded-For + real_ip_recursive on দিয়ে এটা একবার সামনে করে app-কে X-Real-IP পাঠানো, আর app-কে internet থেকে সরাসরি পৌঁছানো বন্ধ রাখা।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "Forward proxy আর reverse proxy-র পার্থক্য কী? দুটোর একটা করে বাস্তব ব্যবহার বলুন।",
      answerOutline: `- কার হয়ে: forward = client-এর, reverse = server-এর
- কে জানে: forward-এ client configure করে (বা transparent); reverse-এ client জানে না, DNS proxy-র IP দেয়
- কাকে লুকায়: forward client-কে, reverse server-কে
- Forward-এর ব্যবহার: অফিস/campus egress control, audit log, cache, production server-এর বাইরে যাওয়া সীমিত করা
- Reverse-এর ব্যবহার: TLS termination, buffering, compression, cache, routing, origin লুকানো, rate limit-এর জায়গা
- বাড়তি নম্বর: transparent proxy, আর sidecar যেটা দুই দিকেই কাজ করে`,
    },
    {
      question:
        "Corporate proxy দিয়ে একটা HTTPS request কিভাবে যায়? Proxy কী দেখতে পায়?",
      answerOutline: `- Client: CONNECT host:443 → proxy policy check, DNS, TCP connect → 200 Connection established
- তারপর proxy blind tunnel; client আর server-এর TLS handshake tunnel-এর ভেতরে, certificate আসল server-এর
- Proxy দেখে: hostname, port, সময়, bytes; দেখে না: path, header, body
- তাই domain-স্তরে block সম্ভব, path-স্তরে না
- TLS interception: proxy নিজে TLS terminate করে, on-the-fly certificate বানায় নিজের root CA দিয়ে; শর্ত client-এ সেই CA trusted; certificate pinning ভাঙে; CA key-র নিরাপত্তা আর গোপনীয়তার প্রশ্ন`,
    },
    {
      question:
        "Reverse proxy-র পেছনে app-এ আসল client IP কিভাবে পাবেন, আর কী ভুল হতে পারে?",
      answerOutline: `- সমস্যা: app-এর TCP peer = proxy
- Header: X-Forwarded-For (প্রতিটা hop ডানে যোগ করে), X-Real-IP, Forwarded (RFC 7239), X-Forwarded-Proto
- ভুল: XFF-এর প্রথম IP নেওয়া → spoofing, rate limit পার
- ঠিক: trusted proxy তালিকা, ডান থেকে পড়ে প্রথম untrusted IP; NGINX real_ip module (set_real_ip_from, real_ip_recursive)
- Origin-এ সরাসরি আসা বন্ধ, নইলে নকল header সরাসরি পৌঁছায়
- X-Forwarded-Proto না মানলে redirect loop/Secure cookie সমস্যা`,
    },
    {
      question:
        "Production-এ load test করতে গিয়ে NGINX থেকে 502 আসছে, log-এ 'Cannot assign requested address'। কী হচ্ছে, কিভাবে ঠিক করবেন?",
      answerOutline: `- কারণ: upstream keep-alive নেই, প্রতিটা request নতুন connection; বন্ধ socket TIME_WAIT-এ (Linux-এ ৬০s)
- হিসাব: ১,০০০ req/s × ৬০s = ৬০,০০০ socket, অথচ এক upstream ip:port-এর জন্য ~২৮,০০০ ephemeral port → port exhaustion
- Fix: upstream { keepalive N; }, proxy_http_version 1.1, proxy_set_header Connection ""
- App-এর keep-alive timeout proxy-র চেয়ে বেশি, নইলে race-এ মাঝে মাঝে 502
- আরও: একাধিক upstream address, ephemeral port range বাড়ানো (শেষ উপায়), metrics-এ TIME_WAIT গোনা`,
    },
    {
      question: "Service mesh-এ sidecar proxy কেন? এর দাম কী?",
      answerOutline: `- East-west traffic-এ retry, timeout, mTLS, metrics, traffic splitting প্রতিটা service-এ একইভাবে চাই
- প্রতিটা ভাষায় library-তে লেখা কঠিন ও অসংগত → প্রতিটা instance-এর পাশে proxy (Envoy, linkerd2-proxy)
- iptables দিয়ে traffic sidecar-এ ঘোরানো; control plane নিয়ম দেয়, sidecar-রা data plane
- দাম: প্রতি call-এ দুটো বাড়তি hop (latency), প্রতিটা pod-এ বাড়তি CPU/memory, operational জটিলতা, debug কঠিন
- কখন না: অল্প কয়েকটা service, এক ভাষা, ছোট team`,
    },
  ],

  summary: {
    points: [
      "Proxy মাঝে বসে client↔server-এর একটা connection-কে দুটো বানায়; তাই সে দেখতে, বদলাতে, আটকাতে আর মনে রাখতে পারে।",
      "Forward proxy client-এর হয়ে বাইরে যায় (egress control, log, cache, পরিচয় আড়াল); reverse proxy server-এর হয়ে সামনে দাঁড়ায় (TLS, buffering, gzip, cache, routing, origin লুকানো)।",
      "HTTPS-এ forward proxy CONNECT tunnel বানায়, শুধু host:port দেখে; ভেতর দেখতে TLS interception লাগে, যার শর্ত client-এ প্রতিষ্ঠানের root CA।",
      "XFF-এ প্রতিটা hop ডানে IP যোগ করে, client বামে যা খুশি লিখতে পারে; তাই শুধু চেনা proxy বিশ্বাস করুন, ডান থেকে প্রথম untrusted IP-ই আসল client।",
      "Buffering ধীর client আর slowloris থেকে app-কে বাঁচায়; streaming response-এ buffering বন্ধ করতে হয়।",
      "Upstream keep-alive ছাড়া বেশি traffic-এ TIME_WAIT জমে port শেষ হয়; connection reuse করুন।",
      "Proxy নিজেই SPOF; জোড়ায় চালান। LB, API gateway আর sidecar একই পরিবারের, পার্থক্য কাজের জোরে।",
    ],
    diagram: {
      id: "day-015-summary",
      caption: "এক নজরে Proxy Servers",
      alt: "Client থেকে Forward Proxy হয়ে Internet, Internet থেকে Reverse Proxy হয়ে দুটো Server; Forward Proxy থেকে Internet-এর তীরে লেবেল 'client-এর হয়ে', Internet থেকে Reverse Proxy-র তীরে 'server-এর হয়ে'।",
    },
  },
};
