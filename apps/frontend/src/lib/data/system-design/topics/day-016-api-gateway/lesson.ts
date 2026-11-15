// Day 16 · API Gateway — Phase 2 lesson (Day 18 goes deeper into rate limiting,
// Day 45 into gRPC, Day 57/59 into retries and circuit breakers, Day 63 into service mesh).

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

const day = topicHrefForDay;

export const day016Lesson: SdLesson = {
  topicId: "sd-day-016",
  day: 16,
  title: "API Gateway",
  definition:
    "API Gateway হলো অনেকগুলো backend service-এর সামনে একটাই দরজা: প্রতিটা request এখানে পরিচয় যাচাই, সীমা, রূপান্তর আর log পেরিয়ে সঠিক service-এ পৌঁছায়।",

  objectives: [
    "অনেক service-এর সামনে কেন একটা gateway লাগে (এক ঠিকানা, cross-cutting কাজ এক জায়গায়) আর কখন লাগে না, উদাহরণ দিয়ে ব্যাখ্যা করতে পারবেন।",
    "Routing, authentication, rate limiting, transformation, aggregation, protocol translation, caching, observability, versioning আর CORS: gateway-র প্রতিটা দায়িত্ব কী সমস্যা মেটায়, বলতে পারবেন।",
    "একটা request gateway-র plugin chain-এ কোন ক্রমে এগোয় (route → auth → rate limit → transform → upstream → response → log), আর ক্রম ভুল হলে কী ঝুঁকি তৈরি হয়, বিশ্লেষণ করতে পারবেন।",
    "API Gateway, reverse proxy, load balancer আর service mesh-এর পার্থক্য, BFF pattern, আর gateway-কে single point of failure বা 'god gateway' হতে না দেওয়ার কৌশল নিয়ে যুক্তি দিতে পারবেন।",
    "Kong-কে DB-less mode-এ চালিয়ে path দিয়ে route, API key দিয়ে auth আর rate limit বসাতে পারবেন, আর 401, 429 ও RateLimit header নিজে দেখে বুঝতে পারবেন।",
  ],

  prerequisites: [
    { day: 4, title: "API কী? REST-এর বেসিক", href: day(4) },
    { day: 9, title: "Load Balancers", href: day(9) },
    { day: 15, title: "Proxy Servers", href: day(15) },
  ],

  problem: {
    markdown: `"খাবারবাড়ি" একটা food delivery startup। শুরুতে একটা monolith ছিল, পরে team বড় হওয়ায় সেটা ভেঙে পাঁচটা service হলো: **User**, **Menu**, **Order**, **Payment** আর **Review**। প্রতিটা service-এর নিজের subdomain: \`users.khabarbari.com\`, \`orders.khabarbari.com\`... আর client তিন রকম: Android/iOS app, website, আর রেস্টুরেন্ট partner-দের integration।

ছয় মাস পরে যা দাঁড়াল:

1. **প্রতিটা service নিজের মতো auth করে।** Order service JWT-এর মেয়াদ দেখে, Menu service দেখে না। Review service-এর নতুন \`DELETE /reviews/{id}\` endpoint-এ এক developer auth check দিতেই ভুলে গেল। কেউ ধরল না, কারণ "auth তো সবাই নিজে করে"।
2. **Rate limit, CORS, logging পাঁচবার, পাঁচ রকম।** একটা bot Menu service-কে মিনিটে হাজারবার ডাকছে, কারণ শুধু Order service-এ limit আছে। একটা bug খুঁজতে পাঁচটা আলাদা log format মেলাতে হয়, কোনো common request id নেই।
3. **Mobile app-এর home screen-এ ৫টা আলাদা call।** User profile, কাছের রেস্টুরেন্ট, চলমান order, offer, review। গ্রামের ধীর 3G-তে প্রতিটা call-এর আলাদা DNS, TLS আর round trip; screen আসতে কয়েক সেকেন্ড।
4. **ভেতরের গঠন বাইরে খোলা।** Team যখন Order service-কে দুই ভাগ করতে চাইল, দেখা গেল app-এর পুরনো version-গুলো সরাসরি \`orders.khabarbari.com\`-এর পুরনো path ডাকছে। Play Store-এর সব user app update না করা পর্যন্ত কিছু বদলানো যাবে না।
5. **JWT signing key rotate করতে পাঁচটা service redeploy।** একটা ভুলে গেলে সেই service-এ সবাই 401 পায়।

সমস্যা কোনো একটা service-এ না। সমস্যা হলো, **যে কাজগুলো সব service-এর জন্য একই** (কে ডাকছে, কতবার ডাকছে, log, CORS), সেগুলো প্রতিটা team নিজে নিজে করছে, আর client সরাসরি ভেতরের প্রতিটা service চেনে।`,
    diagrams: [
      {
        id: "day-016-before",
        caption:
          "আগে: প্রতিটা client সরাসরি প্রতিটা service ডাকে; auth, limit, log সবাই নিজের মতো করে, আর একজন auth ভুলে গেছে।",
        alt: "বামে Mobile App, Web আর Partner; ডানে User, Menu, Order, Payment আর Review service; প্রতিটা client অনেকগুলো service-এ সরাসরি arrow দিয়ে যুক্ত, Review service লাল dashed border-এ auth নেই চিহ্নিত।",
      },
    ],
  },

  analogy: {
    markdown: `একটা বড় সরকারি হাসপাতালের কথা ভাবুন। ভেতরে আলাদা আলাদা বিভাগ: medicine, হাড়, শিশু, pathology, X-ray।

রোগী কি সোজা গিয়ে যেকোনো ডাক্তারের দরজায় ধাক্কা দেয়? না। সবার আগে **গেটের পাশের টিকিট কাউন্টার আর reception**:

- **পরিচয় আর টিকিট:** টিকিট বা appointment slip ছাড়া ভেতরে যাওয়া যায় না। (**Authentication**)
- **দিনে কতজন:** একেক বিভাগ দিনে নির্দিষ্ট সংখ্যক রোগী দেখে, সীমা পেরোলে "কাল আসুন"। (**Rate limit / quota**)
- **কোন বিভাগে যাবেন:** "পেটে ব্যথা? তিনতলা, medicine, রুম ৩১২।" রোগীকে পুরো হাসপাতালের নকশা জানতে হয় না। বিভাগ অন্য তলায় সরলেও reception জানে, রোগীর কিছু বদলায় না। (**Routing**)
- **একই ফরমে লেখা:** রোগী নিজের ভাষায় সমস্যা বলে, reception সেটা হাসপাতালের ফরমে লিখে দেয়, যেটা ডাক্তার বোঝে। (**Transformation**)
- **"Full checkup" প্যাকেজ:** একটা কাউন্টার রক্ত, X-ray, ECG তিন জায়গা থেকে ফল এনে এক খামে দেয়। রোগীকে তিন জায়গায় ঘুরতে হয় না। (**Aggregation**)
- **রেজিস্টার খাতা:** কে কখন এলো, কোন বিভাগে গেল, সব লেখা থাকে। (**Logging**)

কিন্তু দুটো জিনিস খেয়াল করুন। **Reception রোগ নির্ণয় করে না, ওষুধও দেয় না।** সেটা ডাক্তারের কাজ। Reception যদি নিজেই চিকিৎসা শুরু করে, লাইন আটকে যাবে আর ভুল চিকিৎসা হবে। আর **reception বন্ধ থাকলে** ভেতরের সব ডাক্তার বসে থাকলেও কেউ ঢুকতে পারে না, তাই বড় হাসপাতালে কাউন্টার একাধিক।

API Gateway ঠিক এই reception: সব request-এর **একটাই প্রবেশপথ**, যেখানে "সবার জন্য একই" কাজগুলো হয়, কিন্তু আসল কাজ (business logic) থাকে ভেতরের service-এ।`,
    diagrams: [
      {
        id: "day-016-analogy",
        caption:
          "হাসপাতালের reception: টিকিট দেখে, সীমা মেনে, ঠিক বিভাগে পাঠায়; চিকিৎসা করে ভেতরের ডাক্তার।",
        alt: "বামে রোগীরা, মাঝে reception কাউন্টার যার ভেতরে টিকিট যাচাই, সীমা, পথ দেখানো আর খাতা লেখা চিহ্ন; ডানে medicine, শিশু, pathology আর X-ray বিভাগ।",
      },
    ],
  },

  coreConcept: {
    markdown: `**API Gateway** হলো client আর backend service-গুলোর মাঝখানে বসা একটা server, যেটা বাইরের **সব API request-এর একমাত্র প্রবেশপথ (single entry point)**। Client শুধু একটা ঠিকানা চেনে, যেমন \`api.khabarbari.com\`। পেছনে কয়টা service, কোথায় চলে, কে কোন path সামলায়, সেটা gateway জানে।

[Day 15](${day(15)})-এ দেখেছি **reverse proxy** server-এর পক্ষ হয়ে request নেয় আর পেছনে পাঠায়। API Gateway আসলে একটা **বিশেষ reverse proxy**, যে শুধু request পার করে না, **API-র ভাষা বোঝে**: কে ডাকছে (API key, JWT), কোন API, কত বার, কোন version।

### কেন: cross-cutting concern

যে কাজ প্রতিটা service-কেই করতে হয় কিন্তু কোনো service-এর আসল কাজ না, তাকে বলে **cross-cutting concern**: auth, rate limit, log, CORS, TLS। পাঁচটা service-এ পাঁচবার লিখলে পাঁচ রকম bug। Gateway-তে একবার লিখলে নিয়ম সবখানে একই, আর service team শুধু নিজের business logic-এ মন দেয়।

### Gateway-র দায়িত্বগুলো

- **Routing:** Path, host বা header দেখে কোন service-এ যাবে ঠিক করা। \`/orders/*\` → Order service, \`/menu/*\` → Menu service। প্রয়োজনে prefix কেটে দেয় (\`/orders/42\` → service-এ \`/42\`)। এতে ভেতরে service ভাঙা-জোড়া করলেও client-এর URL বদলায় না।
- **Authentication ও authorization:** **API key** (partner বা app চেনার জন্য) বা **JWT** যাচাই: signature, মেয়াদ (\`exp\`), কার জন্য (\`aud\`)। ভুল হলে সাথে সাথে **401**, request ভেতরে ঢোকেই না। সাথে মোটা দাগের authorization: "এই key দিয়ে শুধু \`/menu\` পড়া যাবে"।
- **Rate limiting ও quota:** প্রতি consumer (API key বা user) ধরে সীমা, পেরোলে **429**। Algorithm-এর বিস্তারিত [Day 18](${day(18)})-এ; এখানে শুধু এটুকু: gateway হলো limit বসানোর সবচেয়ে স্বাভাবিক জায়গা।
- **Request/response transformation:** Header যোগ বা বাদ (\`X-Request-Id\`, user-এর পরিচয়), পুরনো field-এর নাম বদলে নতুন format, ভেতরের stack trace লুকানো।
- **Aggregation:** একটা client request-এর জন্য কয়েকটা service ডেকে ফল এক জায়গায় জোড়া দেওয়া। Mobile-এর home screen ৫টা call-এর বদলে ১টা।
- **Protocol translation:** বাইরে REST/JSON, ভেতরে **gRPC** (Day 45-এ বিস্তারিত)। Browser আর partner সহজ JSON পায়, ভেতরের service-গুলো দ্রুত binary protocol-এ কথা বলে।
- **Caching:** সবার জন্য একই আর কম বদলায় এমন GET response (menu, শহরের তালিকা) gateway-তেই কিছুক্ষণ রেখে দেওয়া। Caching-এর গভীরে [Day 17](${day(17)})।
- **Observability:** প্রতিটা request-এর log, latency আর status-এর metrics, আর একটা **request/trace id** header বসিয়ে দেওয়া, যাতে পাঁচ service-এর log এক সুতোয় গাঁথা যায়।
- **Versioning:** \`/v1/orders\` পুরনো service-এ, \`/v2/orders\` নতুনটায়। পুরনো app ভাঙে না, নতুনটা ধীরে চালু হয়।
- **CORS ও TLS:** Browser-এর CORS নিয়ম আর HTTPS certificate এক জায়গায়, পাঁচ জায়গায় না।

### এর দাম: আরেকটা hop, আরেকটা ঝুঁকি

বিনামূল্যে কিছু না। Gateway মানে প্রতিটা request-এর পথে **আরেকটা network hop** আর কিছু CPU কাজ (TLS, auth, counter), সাধারণত কয়েক millisecond ([Day 7](${day(7)})-এর latency budget-এ এটা যোগ করতে হবে)। আর সব traffic যেহেতু এক দরজা দিয়ে যায়, gateway পড়ে গেলে পুরো API পড়ে যায়: একটা **single point of failure** ([Day 6](${day(6)}))।

সমাধান [Day 9](${day(9)}) আর [Day 14](${day(14)})-এর পরিচিত কৌশল: gateway-কে **stateless** রাখুন (counter থাকলে Redis-এ), কয়েকটা instance চালান, আর সামনে একটা L4 load balancer বসান। একটা instance মরলে বাকিরা চালিয়ে নেয়।`,
    diagrams: [
      {
        id: "day-016-main",
        caption:
          "পরে: সব client একটাই gateway চেনে; auth, limit, log সেখানে একবার, তারপর path দেখে সঠিক service-এ।",
        alt: "Mobile App, Web আর Partner তিনটা client একটা API Gateway-তে request পাঠায়; Gateway Redis-এ rate limit counter রাখে আর /users, /menu, /orders, /payments path দেখে চারটা service-এ পাঠায়।",
        downloadable: true,
      },
      {
        id: "day-016-before-after",
        caption:
          "পাশাপাশি: gateway ছাড়া প্রতিটা service সব নিজে করে আর client সব চেনে; gateway দিলে নিয়ম এক জায়গায়, client চেনে একটাই ঠিকানা।",
        alt: "উপরে gateway-হীন design যেখানে তিনটা client পাঁচটা service-এ সরাসরি যায়; নিচে gateway-ভিত্তিক design যেখানে সব request এক gateway দিয়ে যায়।",
      },
    ],
  },

  deepDive: [
    {
      title:
        "Plugin chain: একটা request কোন ক্রমে কী পেরোয়, আর ক্রম কেন জরুরি",
      markdown: `বেশিরভাগ gateway ভেতরে একটা **pipeline**: request একের পর এক ছোট ধাপ (Kong-এ **plugin**, Netflix Zuul-এ **filter**, Envoy-তে **filter**) পেরোয়। যেকোনো ধাপ চাইলে request থামিয়ে সাথে সাথে উত্তর দিতে পারে (401, 429), তখন পেছনের ধাপগুলো আর চলেই না।

একটা সাধারণ ক্রম:
1. **Route match:** আগে খুঁজে বের করা কোন route আর service। কারণ কোন plugin কী config নিয়ে চলবে, সেটা route/service অনুযায়ী আলাদা হতে পারে। মেলে না? **404**।
2. **Authentication:** key বা JWT যাচাই। ব্যর্থ? **401**।
3. **Rate limit:** এই consumer-এর counter বাড়াও। সীমা পেরোলে **429** আর \`Retry-After\`।
4. **Request transform:** prefix কাটা, পরিচয়ের header যোগ, client-এর credential সরানো।
5. **Upstream-এ পাঠানো:** service-এর সুস্থ instance বাছাই (load balancing), timeout আর retry।
6. **Response:** rate limit header, CORS header যোগ, ভেতরের error ঢেকে দেওয়া।
7. **Log ও metrics:** উত্তর চলে যাওয়ার পরে, যাতে user-এর latency-তে যোগ না হয়।

**Kong-এ ক্রম কিভাবে ঠিক হয়?** Kong (NGINX/OpenResty-র উপর বানানো) request-কে কয়েকটা **phase**-এ ভাগ করে: \`access\` (upstream-এ যাওয়ার আগে), \`header_filter\` আর \`body_filter\` (response আসার সময়), আর \`log\` (সব শেষে)। একই phase-এ প্রতিটা plugin-এর একটা স্থির **PRIORITY** সংখ্যা আছে, বড় সংখ্যা আগে চলে। Kong 3.9-এ কয়েকটা: \`cors\` 2000, \`jwt\` 1450, \`key-auth\` 1250, \`acl\` 950, \`rate-limiting\` 910, \`request-transformer\` 801। তাই auth সবসময় rate limit-এর আগে।

**ক্রমের একটা লুকানো ফল:** Auth আগে চলে বলে **ভুল key দিয়ে আসা request rate limiter পর্যন্ত পৌঁছায়ই না**, তাই সেগুলো গোনাও হয় না। Lab-এ নিজে দেখবেন: ভুল key দিয়ে যতবারই পাঠান, শুধু 401, কখনো 429 না। মানে "consumer ধরে limit" key আন্দাজ করার (brute-force) চেষ্টা থামায় না। এর জন্য আলাদা করে **IP ধরে একটা ঢিলা limit**, বা auth ব্যর্থতার হার দেখে block করার ব্যবস্থা লাগে।

**উল্টো ক্রমের দাম:** rate limit যদি auth-এর আগে থাকত, তখন consumer চেনা যেত না, শুধু IP ধরে গোনা যেত। Mobile operator-এর CGNAT-এর পেছনে হাজার user একই IP শেয়ার করে, তাই নিরীহ user-রা একে অন্যের limit খেয়ে ফেলত। সবচেয়ে ভালো সাধারণত দুটোই: সামনে IP ধরে উদার limit (আক্রমণ ঠেকাতে), auth-এর পরে consumer ধরে আসল limit (ন্যায্য ভাগের জন্য)।

**Plugin কোথায় বসাবেন:** Kong-এ plugin global (সব request), একটা service, একটা route, বা একটা consumer-এর জন্য বসানো যায়। একই plugin একাধিক জায়গায় থাকলে **সবচেয়ে নির্দিষ্টটা জেতে**, যেমন global limit মিনিটে 5 হলেও একটা route-এ আলাদা limit দিলে সেই route-এ সেটাই চলবে।`,
      diagrams: [
        {
          id: "day-016-plugin-chain",
          caption:
            "ধাপে ধাপে: একটা request route → auth → rate limit → transform → upstream → response → log পেরোয়; যেকোনো ধাপ আগেই থামিয়ে দিতে পারে।",
          alt: "সাতটা বাক্সের একটা সারি: Route match, Auth, Rate limit, Transform, Upstream, Response, Log; প্রতিটা ধাপে বর্তমান বাক্সটা highlight হয়, আর থামানো গেলে নিচে 404, 401 বা 429 লেখা।",
        },
        {
          id: "day-016-phases",
          caption:
            "Kong-এর ভেতরে: request phase-এ phase-এ এগোয়, আর একই phase-এ plugin চলে PRIORITY-র বড় থেকে ছোট ক্রমে।",
          alt: "চারটা কলাম: access phase-এ cors 2000, jwt 1450, key-auth 1250, acl 950, rate-limiting 910, request-transformer 801; তারপর upstream-এ proxy (load balancing, timeout, retries); তারপর header_filter ও body_filter phase-এ response-transformer 800; শেষে log phase-এ prometheus 13 আর http-log 12।",
        },
      ],
    },
    {
      title: "Auth কোথায়: শুধু edge-এ, নাকি service-এও? (zero trust)",
      markdown: `সবচেয়ে প্রচলিত design: gateway token যাচাই করে, তারপর ভেতরে একটা header বসিয়ে দেয়, যেমন \`X-Consumer-Username: rahim-app\` বা \`X-User-Id: 42\`। Service সেই header পড়ে ধরে নেয় user কে। সহজ, দ্রুত, service-এ কোনো crypto লাগে না।

**ফাঁদটা কোথায়?** Service যদি অন্য কোনো পথে reachable হয় (ভুল security group, পুরনো public IP, ভেতরের অন্য কোনো compromised service), তাহলে attacker নিজেই \`X-User-Id: 1\` header বসিয়ে সরাসরি service ডাকতে পারে। Service তো header বিশ্বাস করে! একে বলে **header spoofing**। তাই কয়েকটা নিয়ম:

1. **Gateway বাইরে থেকে আসা identity header মুছে দেবে**, তারপর নিজে বসাবে। নাহলে client নিজেই \`X-User-Id\` পাঠিয়ে দেবে আর gateway সেটা পার করে দেবে।
2. **Service-কে শুধু gateway থেকে reachable রাখুন** (private network, network policy)।
3. **Zero trust:** "ভেতরের network মানেই নিরাপদ" ধরে নেবেন না। Service নিজেও যাচাই করুক: হয় পুরো JWT forward করে service নিজে signature দেখে (public key cache করা থাকলে এটা খুব সস্তা), নয়তো service-to-service **mTLS** দিয়ে নিশ্চিত হোক call-টা সত্যিই gateway থেকে এসেছে। mTLS আর service mesh [Day 63](${day(63)})-এ।

**কাজের ভাগ:** Gateway করে **মোটা দাগের** কাজ: token বৈধ কিনা, মেয়াদ আছে কিনা, এই client এই API-তে ঢুকতে পারে কিনা (scope)। **সূক্ষ্ম authorization** থাকে service-এ: "user 42 কি order 99 দেখতে পারে?" Gateway জানে না order 99 কার, সেটা Order service-এর database জানে। এই check বাদ পড়লে একজন user অন্যের order id বদলে দেখে ফেলে, যেটা API-র সবচেয়ে প্রচলিত দুর্বলতাগুলোর একটা ([Day 80](${day(80)})-এ OWASP API তালিকায় আসবে)।

**Credential ভেতরে পাঠাবেন না।** Lab-এ দেখবেন, Kong-এর key-auth default-এ client-এর \`apikey\` header-টা upstream পর্যন্ত পাঠিয়ে দেয়। তখন service-এর log-এ সবার key জমা হয়। \`hide_credentials: true\` দিলে gateway যাচাইয়ের পরে key সরিয়ে ফেলে।

**JWT যাচাইয়ের খরচ:** Gateway প্রতি request-এ identity provider-কে ফোন করলে সেটা নতুন bottleneck। তাই সাধারণত gateway provider-এর public key set (**JWKS**) cache করে রাখে আর নিজেই signature মেলায়। দাম: token বাতিল (revoke) করলে মেয়াদ শেষ হওয়া পর্যন্ত সেটা চলতে থাকে, তাই access token-এর মেয়াদ ছোট রাখা হয় (Day 14-এ এই সমস্যা দেখেছি; গভীরে [Day 77](${day(77)}))।`,
    },
    {
      title: "Aggregation, BFF আর fan-out-এর latency",
      markdown: `Mobile home screen-এর জন্য gateway (বা তার পেছনের একটা ছোট service) একসাথে ৫টা service ডাকে আর এক JSON-এ জোড়া দেয়। ধীর মোবাইল network-এ ৫টা round trip-এর বদলে ১টা, আর ভেতরের data center-এর call অনেক দ্রুত।

**হিসাবটা ([Day 7](${day(7)})-এর নিয়ম):** ধরুন ভেতরের call: profile 20ms, restaurants 80ms, active order 30ms, offers 40ms, reviews 60ms।
- একটার পর একটা ডাকলে: 20 + 80 + 30 + 40 + 60 = **230ms**
- একসাথে (parallel) ডাকলে: max(…) = **80ms**, সবচেয়ে ধীরটাই ঠিক করে

**কিন্তু tail latency বাড়ে।** ধরুন প্রতিটা service ১% request-এ ধীর (p99)। পাঁচটাই একসাথে দ্রুত হওয়ার সম্ভাবনা 0.99⁵ ≈ 0.951। মানে প্রায় **৫% screen** অন্তত একটা ধীর call-এর জন্য আটকে থাকবে। Fan-out যত চওড়া, ধীর হওয়ার সম্ভাবনা তত বেশি।

তাই aggregation-এ তিনটা নিয়ম:
1. **প্রতিটা call-এর আলাদা timeout।** পুরো response-এর একটা বাজেট (ধরুন 300ms), প্রতিটা call তার ভেতরে।
2. **কোনটা জরুরি, কোনটা ঐচ্ছিক।** চলমান order না এলে screen ভুল দেখাবে, তাই error। Review বা offer না এলে সেই অংশ ফাঁকা রেখে বাকিটা পাঠান (**graceful degradation**)।
3. **Gateway-তে business logic না।** "কোন offer কোন user দেখবে" ধরনের সিদ্ধান্ত aggregation-এ ঢুকে গেলে gateway ধীরে ধীরে একটা monolith হয়ে যায় (নিচের "god gateway" দেখুন)।

**BFF (Backend for Frontend):** Mobile app চায় ছোট payload আর কম call; website চায় বেশি তথ্য; partner চায় স্থির, versioned API। একটা gateway-তে তিন রকম চাহিদা মেটাতে গেলে সেটা জটিল হয়ে যায়। তাই প্রতিটা client-এর জন্য **আলাদা একটা পাতলা backend**: Mobile BFF, Web BFF, Partner API। প্রতিটা BFF সাধারণত সেই frontend team-এর মালিকানায়, তাই তারা অন্য team-এর অপেক্ষা না করে নিজের screen-এর জন্য aggregation বদলাতে পারে। এই নামটা ছড়ায় SoundCloud-এর অভিজ্ঞতা থেকে, Sam Newman-এর লেখায়।

BFF-এর দাম: তিনটা BFF মানে তিনটা codebase, আর একই logic (যেমন "order-এর status কিভাবে দেখাবে") তিন জায়গায় কপি হওয়ার ঝুঁকি। ভাগাভাগির logic তাই ভেতরের service-এ রাখুন, BFF-এ শুধু জোড়া দেওয়া আর আকার বদলানো।

আরেকটা পথ **GraphQL**: client নিজেই বলে কোন field লাগবে, server একটা request-এ জোড়া দেয়। REST, RPC আর GraphQL-এর তুলনা [Day 44](${day(44)})-এ।`,
      diagrams: [
        {
          id: "day-016-bff",
          caption:
            "BFF: প্রতিটা client-এর নিজের পাতলা backend, যেটা ভেতরের service-গুলো parallel-এ ডেকে সেই client-এর মাপে উত্তর বানায়।",
          alt: "Mobile App Mobile BFF-এ আর Web Web BFF-এ যায়; দুই BFF-ই User, Restaurant, Order আর Offer service-কে ডাকে, Mobile BFF ছোট payload আর Web BFF বড় payload বানায়।",
        },
      ],
    },
    {
      title:
        "Timeout, retry আর circuit breaking: gateway যেন ঝড় বাড়িয়ে না দেয়",
      markdown: `Gateway সব traffic-এর মাঝখানে, তাই এর timeout আর retry-র সিদ্ধান্ত পুরো system-এর আচরণ বদলে দেয়।

**Timeout-এর ক্রম:** বাইরে থেকে ভেতরে timeout ছোট হতে হবে: client > gateway > service > database। উল্টো হলে কী হয়? ধরুন gateway-র timeout 2s, কিন্তু service ভেতরে database-এর জন্য 5s অপেক্ষা করে। Gateway 2s-এ client-কে **504** দিয়ে দিল, কিন্তু service আরও 3s কাজ করে গেল, যার ফল কেউ নেবে না। চাপের সময় এই "ভূতের কাজ" server আরও ভারী করে। Kong-এর service-এ \`connect_timeout\`, \`read_timeout\`, \`write_timeout\` আলাদা, default প্রতিটা 60,000ms, যা বেশিরভাগ API-র জন্য অনেক বেশি। নিজের API অনুযায়ী ছোট করুন।

**Retry গুণ হয়ে যায়।** Gateway 3 বার retry করে, তার পেছনের service তার dependency-কে 3 বার, সেটা আবার database-কে 3 বার। একটা user request থেকে খারাপ দিনে 3 × 3 × 3 = **27টা** চেষ্টা। যে service ধীর হয়ে পড়ছিল, সে এখন ২৭ গুণ চাপ খায় আর পুরোপুরি ভেঙে পড়ে (**retry storm**)। নিয়ম:
- Retry শুধু এক স্তরে, সাধারণত সবচেয়ে বাইরের দিকে বা যেখানে সবচেয়ে বেশি তথ্য আছে।
- শুধু **idempotent** request (GET, বা idempotency key সহ POST) retry করুন। Payment-এর POST আবার পাঠালে টাকা দুবার কাটতে পারে।
- মোট retry-এর একটা সীমা (**retry budget**), যেমন "মোট request-এর ১০%-এর বেশি retry না"।

Kong-এ service-এর \`retries\` default **5**, মানে proxy করতে ব্যর্থ হলে Kong নিজে আরও চেষ্টা করে। জেনে-বুঝে এটা ঠিক করুন, বিশেষ করে যেখানে পেছনে আরও retry আছে।

**Circuit breaking:** একটা upstream বারবার fail করলে কিছুক্ষণ তাকে ডাকাই বন্ধ, সাথে সাথে error বা fallback দাও। এতে ভাঙা service সেরে ওঠার সময় পায়, আর gateway-র connection আর thread ধীর call-এ আটকে থাকে না। Kong-এ upstream-এর **passive health check** (বারবার ব্যর্থ হলে target-কে unhealthy ধরা) কাছাকাছি কাজ করে; Envoy-তে circuit breaker আর outlier detection আছে। এখন এটুকু জানলেই চলবে, Retry আর idempotency নিয়ে [Day 57](${day(57)})-এ আর Circuit Breaker নিয়ে [Day 59](${day(59)})-এ গভীরে যাব।`,
    },
    {
      title: "Multi-tenant quota: অনেক partner, এক gateway",
      markdown: `খাবারবাড়ির partner API এখন ৩০০ রেস্টুরেন্ট ব্যবহার করে। প্রত্যেকে একজন **tenant**। একজনের bug-এ পাঠানো লক্ষ request যেন বাকিদের service খারাপ না করে (**noisy neighbour**), সেটা দেখা gateway-র দায়িত্ব।

**কী ধরে গুনবেন (limit key):** IP, consumer (API key), credential, নাকি path? Kong-এর rate-limiting plugin-এ \`limit_by\`-এর default **consumer**। ভালো design-এ key হয় tenant: এক রেস্টুরেন্টের ১০টা server আলাদা IP থেকে পাঠালেও একই ভাগ থেকে কাটবে।

**Rate বনাম quota:** Rate মানে গতি (সেকেন্ডে 20), quota মানে মোট পরিমাণ (মাসে ১০ লাখ call, plan অনুযায়ী)। Free, Pro, Enterprise tier-এ আলাদা সংখ্যা। Kong-এ consumer-দের group করে বা প্রতি consumer-এ আলাদা plugin config দিয়ে এটা হয়; AWS API Gateway-তে (REST API-তে) **usage plan** আর API key দিয়ে।

**কয়টা gateway node, কোথায় counter?** Gateway-র ৪টা instance, প্রতিটা নিজের memory-তে গুনলে (Kong-এর \`policy: local\`) একজন client-এর request load balancer-এ চার ভাগ হয়ে যায়, আর প্রত্যেক node আলাদা করে "মিনিটে 100" মানে। বাস্তবে সে প্রায় **400** পর্যন্ত পেতে পারে। কঠোর সীমা লাগলে counter রাখুন সবার shared জায়গায় (\`policy: redis\`)। দাম: প্রতি request-এ একটা Redis call আর Redis down হলে কী হবে সেই সিদ্ধান্ত (fail-open বনাম fail-closed)। Algorithm, atomicity আর এই সিদ্ধান্তের বিস্তারিত [Day 18](${day(18)})-এ।

**উত্তরে জানিয়ে দিন:** ভালো gateway প্রতিটা response-এ বাকি quota জানায়। Kong 3.9 lab-এ পাঠায় \`X-RateLimit-Limit-Minute\`, \`X-RateLimit-Remaining-Minute\` আর \`RateLimit-Limit\`, \`RateLimit-Remaining\`, \`RateLimit-Reset\`; সীমা পেরোলে **429** সাথে \`Retry-After\`। এতে partner-এর developer নিজেই নিজের গতি ঠিক করতে পারে।`,
    },
    {
      title: "Protocol translation, versioning আর 'god gateway' থেকে সাবধান",
      markdown: `**Protocol translation:** ভেতরের service-গুলো gRPC-তে কথা বলে (ছোট binary message, HTTP/2), কিন্তু browser আর partner চায় সাধারণ REST/JSON। Gateway মাঝখানে JSON-কে gRPC message-এ আর উত্তরকে আবার JSON-এ বদলে দেয়। Kong-এ এর জন্য \`grpc-gateway\` plugin, Envoy-তে gRPC-JSON transcoder filter আছে। gRPC আর Protocol Buffers [Day 45](${day(45)})-এ। দাম: প্রতি request-এ রূপান্তরের CPU, আর gateway-কে service-এর schema (proto file) জানতে হয়।

**Versioning:** Gateway-তে \`/v1/orders\` আর \`/v2/orders\` দুটো আলাদা route, আলাদা service-এ যেতে পারে। পুরনো app \`/v1\` ডাকতে থাকে, নতুন app \`/v2\`। কয়টা request এখনো \`/v1\`-এ আসছে gateway-র metrics থেকেই দেখা যায়, তাই কবে পুরনোটা বন্ধ করা নিরাপদ, অনুমান না করে মেপে বলা যায়। Header দিয়েও ভাগ করা যায় (\`Accept-Version\`), বা একটা ছোট ভাগ নতুন version-এ পাঠিয়ে canary করা যায়। Versioning-এর নিয়ম [Day 46](${day(46)})-এ।

**God gateway:** সবচেয়ে বড় ঝুঁকি technical না, সাংগঠনিক। Gateway যেহেতু সব request দেখে, লোভ হয় "এখানেই একটু logic রেখে দিই": order-এর মোট দাম হিসাব, ১০০০ টাকার বেশি হলে discount, রেস্টুরেন্ট বন্ধ থাকলে order বাতিল। এক বছর পরে:
- প্রতিটা business change-এ gateway deploy, আর gateway একটা team-এর হাতে, তাই সবাই তাদের অপেক্ষায়।
- এক team-এর ভুলে gateway crash, **সব** API বন্ধ।
- Logic দুই জায়গায় (gateway আর service), কোনটা সত্যি কেউ জানে না।

আপনি microservice-এ ভেঙেছিলেন যে monolith থেকে বাঁচতে, gateway-ই চুপিচুপি নতুন monolith হয়ে গেল।

**সহজ পরীক্ষা:** Gateway-র নিয়ম যেন শুধু **"কে, কতবার, কোথায়, কোন আকারে"** নিয়ে হয়। "এর মানে কী" (দাম, discount, order বৈধ কিনা) যদি gateway-তে লাগে, সেটা কোনো service-এর কাজ। Aggregation লাগলে আলাদা BFF বানান, যার মালিক সেই client-এর team।`,
      diagrams: [
        {
          id: "day-016-edge-layers",
          caption:
            "কে কোথায়: বাইরের traffic (north-south) L4 LB হয়ে দুটো gateway instance-এ; service থেকে service-এর traffic (east-west) gateway দিয়ে না, mesh sidecar দিয়ে।",
          alt: "Client থেকে L4 Load Balancer, সেখান থেকে Gateway A আর Gateway B; দুই gateway-ই Order Service-এ যায়; Order Service সরাসরি Payment Service-কে mesh দিয়ে ডাকে, gateway-তে ফিরে না গিয়ে।",
        },
      ],
    },
  ],

  tradeOffs: {
    markdown: `**কখন API Gateway লাগবে:** অনেকগুলো service, আর বাইরের client (app, web, partner) সেগুলো ডাকে; auth, rate limit, log সবখানে একই রকম চান; public বা partner API, যেখানে key, quota আর version manage করতে হয়; ভেতরের গঠন বদলাতে চান client না ভেঙে।

**কখন লাগবে না, বা কম দিয়ে চলবে:**
- একটা monolith আর একটা web client: একটা সাধারণ reverse proxy (NGINX) বা cloud load balancer যথেষ্ট। Gateway শুধু আরেকটা জিনিস চালানোর খরচ।
- **ভেতরের service-to-service call:** এগুলো gateway দিয়ে ঘুরিয়ে আনলে প্রতিটা call-এ অকারণ hop, আর gateway সব ভেতরের traffic-এর bottleneck। এখানে সরাসরি call, client-side load balancing বা service mesh ([Day 63](${day(63)}))।
- খুব কম latency-র কাজ (প্রতি millisecond গোনা হয়): প্রতিটা plugin-এর খরচ মেপে, শুধু যা দরকার তাই রাখুন।

**Managed বনাম নিজে চালানো:** AWS API Gateway-এর মতো managed service-এ server, scaling, patch নিয়ে ভাবতে হয় না, দাম request প্রতি। Kong, Envoy বা NGINX নিজে চালালে নিয়ন্ত্রণ পুরো, অনেক traffic-এ খরচ কম হতে পারে, কিন্তু high availability আর upgrade আপনার দায়িত্ব।

চারটা প্রায়-একই-রকম জিনিস পাশাপাশি:`,
    table: {
      headers: [
        "বিষয়",
        "Load Balancer",
        "Reverse Proxy",
        "API Gateway",
        "Service Mesh",
      ],
      rows: [
        [
          "মূল কাজ",
          "একই service-এর কয়েকটা copy-র মধ্যে traffic ভাগ",
          "Server-এর পক্ষে request নেওয়া: TLS, cache, compression, পেছনে পাঠানো",
          "API-র একমাত্র প্রবেশপথ: auth, limit, routing, transform, version",
          "Service থেকে service-এর call: mTLS, retry, timeout, traffic ভাগ",
        ],
        [
          "Traffic-এর দিক",
          "বাইরে থেকে ভেতরে, বা যেকোনো স্তরে",
          "বাইরে থেকে ভেতরে",
          "বাইরে থেকে ভেতরে (north-south)",
          "ভেতরে service-এর মধ্যে (east-west)",
        ],
        [
          "কী বোঝে",
          "L4: IP/port; L7: HTTP path, header",
          "HTTP (L7)",
          "HTTP + API-র ধারণা: consumer, key, JWT, quota, version",
          "HTTP/gRPC/TCP, service-এর পরিচয় (identity)",
        ],
        [
          "কোথায় চলে",
          "Service-এর সামনে",
          "Server-এর সামনে",
          "সব service-এর সামনে, edge-এ",
          "প্রতিটা service-এর পাশে sidecar বা node proxy",
        ],
        [
          "সাধারণ উদাহরণ",
          "AWS ALB/NLB, HAProxy",
          "NGINX, Caddy",
          "Kong, AWS API Gateway, Zuul",
          "Istio, Linkerd",
        ],
        [
          "কখন যথেষ্ট",
          "একটাই service, অনেক copy",
          "একটা বা কয়েকটা app, সাধারণ routing",
          "অনেক service, বাইরের অনেক ধরনের client বা partner",
          "অনেক service, ভেতরে নিরাপত্তা আর নির্ভরযোগ্যতা দরকার",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **Kong Gateway:** Open-source API gateway, NGINX আর OpenResty (NGINX + LuaJIT)-এর উপর বানানো; plugin সাধারণত Lua-তে লেখা। Database ছাড়া **DB-less mode**-এ চলতে পারে, তখন পুরো config একটা declarative YAML/JSON file থেকে আসে আর Admin API দিয়ে নতুন entity বানানো যায় না (lab-এ নিজে দেখবেন)। key-auth, jwt, rate-limiting, cors, request-transformer, proxy-cache, grpc-gateway এমন অনেক plugin সাথে আসে।
- **Amazon API Gateway:** AWS-এর managed gateway, তিন ধরনের API: **REST API**, **HTTP API** আর **WebSocket API**। HTTP API হালকা আর কম feature-এর, REST API-তে বেশি feature, যেমন API key আর **usage plan** দিয়ে প্রতি client-এর quota ও throttling। AWS-এর documentation অনুযায়ী throttling-এ token bucket algorithm ব্যবহার হয়। পেছনে Lambda function, HTTP endpoint বা অন্য AWS service থাকতে পারে।
- **Netflix Zuul:** Netflix-এর নিজের বানানো আর open source করা **edge service**, তাদের API-র সামনের দরজা: routing, auth, load shedding, আর নতুন version পরীক্ষার জন্য traffic ভাগ। Zuul-এর কাজ হয় **filter**-এর chain দিয়ে, ঠিক plugin chain-এর মতো। Zuul 2-কে Netflix blocking থেকে asynchronous, non-blocking (Netty-ভিত্তিক) design-এ সরিয়েছে, যাতে অনেক connection কম thread-এ সামলানো যায়।
- **অন্যান্য:** Envoy-ভিত্তিক gateway (Envoy Gateway, অনেক Kubernetes ingress), Spring Cloud Gateway, Google Apigee, Azure API Management। ধারণা সবখানে এক: route, auth, limit, transform, observe।

বাস্তবে প্রায় সব বড় system-এ একটা স্তরবিন্যাস দেখা যায়: সবার সামনে CDN ([Day 11](${day(11)})), তারপর L4/L7 load balancer, তারপর gateway, আর ভেতরে service, যাদের নিজেদের মধ্যের traffic সামলায় mesh।

*উৎস: Kong Gateway documentation (docs.konghq.com: DB-less ও declarative configuration, plugin priority/execution order, key-auth ও rate-limiting plugin reference); Kong-এর source (plugin handler-এর PRIORITY, v3.9.1-এ যাচাই করা); Amazon API Gateway Developer Guide (API type বাছাই, usage plan, throttling); Netflix Technology Blog ("Announcing Zuul: Edge Service in the Cloud", "Zuul 2: The Netflix Journey to Asynchronous, Non-Blocking Systems") ও github.com/Netflix/zuul; Sam Newman, "Backends For Frontends" pattern (samnewman.io)।*`,
  },

  mistakes: [
    {
      mistake:
        "Gateway-তে business logic ঢোকানো (দাম হিসাব, discount, order বৈধতা)। Gateway ধীরে ধীরে সবার ভাগের একটা monolith হয়ে যায়, প্রতিটা change-এ gateway deploy।",
      fix: "Gateway শুধু 'কে, কতবার, কোথায়, কোন আকারে'। Business rule service-এ; client অনুযায়ী জোড়া দেওয়া লাগলে আলাদা BFF।",
    },
    {
      mistake:
        "Gateway-তে auth হয়েছে বলে service অন্ধভাবে `X-User-Id` header বিশ্বাস করে, অথচ service অন্য পথেও reachable।",
      fix: "Gateway বাইরের identity header মুছে নিজে বসাক; service শুধু gateway থেকে reachable হোক; সম্ভব হলে service নিজে JWT বা mTLS যাচাই করুক।",
    },
    {
      mistake:
        "Client-এর API key বা token upstream পর্যন্ত পাঠিয়ে দেওয়া; সব service-এর log-এ সবার key জমা হয়।",
      fix: "যাচাইয়ের পরে credential সরিয়ে দিন (Kong-এ `hide_credentials: true`), ভেতরে শুধু পরিচয়ের header পাঠান।",
    },
    {
      mistake:
        "একটাই gateway instance চালানো। Gateway-র restart বা crash মানে পুরো API বন্ধ।",
      fix: "Gateway stateless রাখুন, অন্তত দুটো instance আলাদা zone-এ, সামনে load balancer আর health check।",
    },
    {
      mistake:
        "Gateway, service আর client, সবাই নিজে নিজে retry করে; একটা ধীর service-এ চাপ বহুগুণ হয়ে retry storm।",
      fix: "এক স্তরে retry, শুধু idempotent request-এ, backoff আর retry budget সহ; timeout বাইরে থেকে ভেতরে ছোট হতে থাকুক।",
    },
    {
      mistake:
        "কয়েকটা gateway node-এ local counter দিয়ে rate limit বসিয়ে ভাবা limit পুরো cluster-এর জন্য।",
      fix: "Node-এর সংখ্যা দিয়ে গুণ করে আসল সীমা বুঝুন; কঠোর সীমা লাগলে shared counter (Redis) ব্যবহার করুন।",
    },
    {
      mistake:
        "ভেতরের service-to-service call-ও gateway দিয়ে ঘুরিয়ে আনা (hairpin)। অকারণ hop, আর gateway ভেতরের সব traffic-এর bottleneck।",
      fix: "Gateway শুধু বাইরের (north-south) traffic-এর জন্য; ভেতরের call সরাসরি বা service mesh দিয়ে।",
    },
  ],

  lab: [
    {
      title: "Kong-এর config লিখুন (DB-less, declarative)",
      markdown: `আমরা চালাব: দুটো ছোট upstream service (\`traefik/whoami\`, যেটা পাওয়া request-এর সব header ফেরত দেখায়), আর তাদের সামনে **Kong 3.9.1**, database ছাড়া। Image দুটো Apple Silicon (arm64) আর Intel দুটোতেই চলে।

একটা ফাঁকা folder-এ \`kong.yml\` বানান:

\`\`\`bash
mkdir gw-lab && cd gw-lab
cat > kong.yml <<'EOF'
_format_version: "3.0"

services:
  - name: orders-service
    url: http://sdlab-day016-orders:80
    routes:
      - name: orders-route
        paths:
          - /orders
  - name: users-service
    url: http://sdlab-day016-users:80
    routes:
      - name: users-route
        paths:
          - /users

consumers:
  - username: rahim-app
    keyauth_credentials:
      - key: rahim-secret-123

plugins:
  - name: key-auth
    config:
      key_names:
        - apikey
  - name: rate-limiting
    config:
      minute: 5
      policy: local
EOF
\`\`\`

পড়ে নিন কী বলছি: দুটো **service** (পেছনের ঠিকানা), প্রতিটার একটা **route** (কোন path এলে সেখানে যাবে), একজন **consumer** যার API key \`rahim-secret-123\`, আর দুটো **global plugin**: \`apikey\` header-এ key চাই, আর মিনিটে ৫টার বেশি না।`,
    },
    {
      title: "Network, দুটো service আর Kong চালু করুন",
      markdown: `\`\`\`bash
docker network create sdlab-day016-net

docker run -d --name sdlab-day016-orders --network sdlab-day016-net \\
  traefik/whoami:v1.10 --name orders-service
docker run -d --name sdlab-day016-users --network sdlab-day016-net \\
  traefik/whoami:v1.10 --name users-service

docker run -d --name sdlab-day016-kong --network sdlab-day016-net \\
  -v "$PWD/kong.yml:/kong/kong.yml:ro" \\
  -e KONG_DATABASE=off \\
  -e KONG_DECLARATIVE_CONFIG=/kong/kong.yml \\
  -e KONG_PROXY_LISTEN="0.0.0.0:8000" \\
  -e KONG_ADMIN_LISTEN="0.0.0.0:8001" \\
  -p 8016:8000 -p 127.0.0.1:8017:8001 \\
  kong:3.9.1

until curl -s localhost:8017/status > /dev/null; do sleep 1; done; echo "Kong ready"
\`\`\`

\`KONG_DATABASE=off\` মানে DB-less: সব config ওই YAML থেকে। Port **8016** হলো proxy (client এখানে আসে), **8017** হলো Admin API, শুধু আপনার machine-এ (\`127.0.0.1\`) খোলা, কারণ admin API কখনো বাইরে খোলা রাখবেন না।`,
    },
    {
      title: "পরীক্ষা ১: key ছাড়া 401",
      markdown: `\`\`\`bash
curl -i localhost:8016/orders/42
curl -i -H "apikey: wrong-key" localhost:8016/orders/42
\`\`\`

দুটোতেই **\`HTTP/1.1 401 Unauthorized\`**। প্রথমটায় body \`"No API key found in request"\`, দ্বিতীয়টায় \`"Unauthorized"\`, সাথে \`WWW-Authenticate: Key\` header। খেয়াল করুন, request Order service পর্যন্ত যায়ইনি; gateway দরজাতেই থামিয়েছে।`,
    },
    {
      title: "পরীক্ষা ২: key দিয়ে 200, আর header-গুলো পড়ুন",
      markdown: `\`\`\`bash
curl -i -H "apikey: rahim-secret-123" localhost:8016/orders/42
\`\`\`

এবার **\`200 OK\`**। Response-এর উপরের দিকে Kong-এর যোগ করা header:

\`\`\`text
X-RateLimit-Limit-Minute: 5
X-RateLimit-Remaining-Minute: 4
RateLimit-Limit: 5
RateLimit-Remaining: 4
RateLimit-Reset: 30
X-Kong-Upstream-Latency: 7
X-Kong-Proxy-Latency: 1
Via: 1.1 kong/3.9.1
\`\`\`

(\`RateLimit-Reset\` মানে মিনিট শেষ হতে আর কত সেকেন্ড, তাই আপনার সংখ্যা আলাদা হবে। Latency-র সংখ্যাও আলাদা হবে; প্রথম request-এ বেশি দেখাতে পারে।) \`X-Kong-Proxy-Latency\` হলো gateway-র নিজের খরচ, \`X-Kong-Upstream-Latency\` হলো service-এর।

Body-তে whoami দেখাচ্ছে service আসলে কী পেয়েছে:

\`\`\`text
Name: orders-service
GET /42 HTTP/1.1
Apikey: rahim-secret-123
X-Consumer-Username: rahim-app
X-Forwarded-Path: /orders/42
X-Forwarded-Prefix: /orders
X-Kong-Request-Id: ...
\`\`\`

তিনটা জিনিস লক্ষ করুন:
1. **Routing আর prefix কাটা:** আপনি চেয়েছিলেন \`/orders/42\`, service পেয়েছে \`/42\`। Route-এর \`strip_path\` default-এ চালু।
2. **পরিচয়:** Service নিজে কিছু যাচাই না করেও জানে কে ডাকছে (\`X-Consumer-Username\`)। আর \`X-Kong-Request-Id\` দিয়ে gateway আর service-এর log মেলানো যায়।
3. **সমস্যা:** \`Apikey: rahim-secret-123\` service পর্যন্ত চলে গেছে! Service-এর log-এ এখন সবার গোপন key জমবে। পরের ধাপে ঠিক করব।

\`localhost:8016/users/7\` দিয়ে একই কাজ করলে \`Name: users-service\` দেখবেন। এক দরজা, path দেখে আলাদা service।`,
    },
    {
      title: "পরীক্ষা ৩: limit পেরিয়ে 429",
      markdown: `এক মিনিটের মধ্যে পরপর কয়েকটা পাঠান (এবার \`/users\`-এ):

\`\`\`bash
for i in 1 2 3 4 5 6; do
  curl -s -o /dev/null -w "%{http_code} " -H "apikey: rahim-secret-123" localhost:8016/users/7
done; echo
curl -i -H "apikey: rahim-secret-123" localhost:8016/users/7
\`\`\`

আগের ধাপে \`/orders\`-এ একটা পাঠানো হয়েছিল, তাই সম্ভবত দেখবেন \`200 200 200 200 429 429\`। মানে counter **consumer ধরে**, দুই service মিলিয়ে, কারণ plugin global আর \`limit_by\`-এর default consumer। (মাঝে মিনিট বদলে গেলে counter শূন্য থেকে শুরু হয়, তাই সংখ্যা একটু আলাদা হতে পারে। এটা fixed window-এর আচরণ, Day 18-এ দেখেছেন।)

শেষ request-এর header:

\`\`\`text
HTTP/1.1 429 Too Many Requests
X-RateLimit-Remaining-Minute: 0
RateLimit-Remaining: 0
Retry-After: 23
{ "message":"API rate limit exceeded", ... }
\`\`\`

এবার ভুল key দিয়ে অনেকবার পাঠান:

\`\`\`bash
for i in 1 2 3 4 5 6 7 8; do
  curl -s -o /dev/null -w "%{http_code} " -H "apikey: guess" localhost:8016/users/7
done; echo
\`\`\`

সবগুলো \`401\`, একটাও \`429\` না। কারণ key-auth (priority 1250) rate-limiting (910)-এর আগে চলে, ভুল key-এর request limiter পর্যন্ত পৌঁছায়ই না। Key আন্দাজ করা থামাতে আলাদা IP-ভিত্তিক limit লাগবে।`,
    },
    {
      title: "পরীক্ষা ৪: key লুকান আর নতুন consumer যোগ করুন",
      markdown: `পুরো \`kong.yml\` নতুন করে লিখুন: \`hide_credentials: true\` আর দ্বিতীয় consumer \`karim-app\`:

\`\`\`bash
cat > kong.yml <<'EOF'
_format_version: "3.0"

services:
  - name: orders-service
    url: http://sdlab-day016-orders:80
    routes:
      - name: orders-route
        paths:
          - /orders
  - name: users-service
    url: http://sdlab-day016-users:80
    routes:
      - name: users-route
        paths:
          - /users

consumers:
  - username: rahim-app
    keyauth_credentials:
      - key: rahim-secret-123
  - username: karim-app
    keyauth_credentials:
      - key: karim-secret-456

plugins:
  - name: key-auth
    config:
      key_names:
        - apikey
      hide_credentials: true
  - name: rate-limiting
    config:
      minute: 5
      policy: local
EOF

curl -s -o /dev/null -w "reload: %{http_code}\\n" -X POST localhost:8017/config -F config=@kong.yml
\`\`\`

\`reload: 201\` এলে নতুন config চালু, Kong restart ছাড়াই। এবার rahim-এর এই মিনিটের ভাগ শেষ করে দিন, তারপর দুজনকে পাশাপাশি দেখুন:

\`\`\`bash
for i in 1 2 3 4 5 6; do
  curl -s -o /dev/null -w "%{http_code} " -H "apikey: rahim-secret-123" localhost:8016/orders/1
done; echo
curl -s -o /dev/null -w "rahim: %{http_code}\\n" -H "apikey: rahim-secret-123" localhost:8016/orders/1
curl -s -H "apikey: karim-secret-456" localhost:8016/orders/1 | grep -i -E "apikey|consumer-username"
\`\`\`

Loop-এ শেষের দিকে \`429\` আসবে, তারপর \`rahim: 429\`, কিন্তু karim পায় \`200\`, আর output-এ শুধু \`X-Consumer-Username: karim-app\`, কোনো \`Apikey\` line নেই। প্রত্যেক consumer-এর ভাগ আলাদা (noisy neighbour আটকানো), আর key আর service পর্যন্ত যায় না।`,
    },
    {
      title: "পরীক্ষা ৫: DB-less-এ Admin API শুধু পড়ার জন্য",
      markdown: `\`\`\`bash
curl -s localhost:8017/routes | grep -o '"paths":\\[[^]]*\\]'
curl -s -X POST localhost:8017/services -d name=x -d url=http://example.com; echo
\`\`\`

প্রথমটা দেখায় \`"paths":["/orders"]\` আর \`"paths":["/users"]\`। দ্বিতীয়টা ব্যর্থ: \`"cannot create 'services' entities when not using a database"\`। DB-less-এ config-এর একমাত্র সত্য উৎস YAML file, তাই সেটা git-এ রেখে review করে deploy করা যায় (config as code)। দাম: ছোট একটা বদলেও পুরো config আবার পাঠাতে হয়।`,
    },
    {
      title: "পরিষ্কার করুন",
      markdown: `\`\`\`bash
docker rm -f sdlab-day016-kong sdlab-day016-orders sdlab-day016-users
docker network rm sdlab-day016-net
cd .. && rm -rf gw-lab
\`\`\``,
    },
  ],

  connections: {
    markdown: `- **[Day 4 · API ও REST](${day(4)}):** সেখানে API key, \`Authorization\` header, 401/429 আর versioning শিখেছিলাম। Gateway এগুলো এক জায়গায় প্রয়োগ করে।
- **[Day 6 · Availability](${day(6)}):** Gateway এক দরজা, তাই এক ঝুঁকি। Redundancy (কয়েকটা instance) ছাড়া এটা single point of failure।
- **[Day 7 · Latency vs Throughput](${day(7)}):** Gateway আরেকটা hop যোগ করে; aggregation-এ parallel call-এ সবচেয়ে ধীরটা গোনে, আর fan-out-এ tail latency বাড়ে।
- **[Day 9 · Load Balancers](${day(9)}):** L7 routing (path, host) gateway-রও মূল কাজ; আর gateway instance-গুলোর সামনে সাধারণত একটা load balancer থাকে।
- **[Day 14 · Stateful vs Stateless](${day(14)}):** Gateway stateless হলেই সহজে কয়েকটা চালানো যায়; rate limit counter-এর মতো state Redis-এ। JWT যাচাইয়ের ফাঁদগুলোও সেখান থেকে।
- **[Day 15 · Proxy Servers](${day(15)}):** API Gateway একটা বিশেষ reverse proxy, যে API-র ভাষা (consumer, key, quota) বোঝে।

সামনে যা আসছে: [Day 17](${day(17)})-এ Caching (gateway-র proxy cache সহ), [Day 18](${day(18)})-এ Rate Limiting-এর algorithm, [Day 44](${day(44)})-এ GraphQL, [Day 45](${day(45)})-এ gRPC, [Day 46](${day(46)})-এ API versioning, [Day 57](${day(57)})-এ Retry, [Day 59](${day(59)})-এ Circuit Breaker, [Day 63](${day(63)})-এ Service Mesh, [Day 77](${day(77)})-এ JWT, [Day 80](${day(80)})-এ API Security, আর [Day 89](${day(89)})-এ Logging, Metrics, Tracing।`,
  },

  explainYourself: [
    {
      question:
        'Teammate বলছে, "Gateway-তে JWT যাচাই হচ্ছে, তাই Order service-এ আর কোনো auth check লাগবে না।" কথাটা কতটা ঠিক?',
      idealAnswer:
        "আংশিক ঠিক। Gateway token-এর বৈধতা (signature, মেয়াদ, scope) দেখে, তাই প্রতিটা service-কে সেটা আবার করতে হয় না। কিন্তু দুটো জিনিস বাকি থাকে। এক, সূক্ষ্ম authorization: 'user 42 কি order 99 দেখতে পারে' gateway জানে না, এটা Order service-কেই দেখতে হবে। দুই, service যদি gateway ছাড়া অন্য পথে reachable হয়, কেউ নিজে identity header বসিয়ে ঢুকে পড়বে। তাই service-কে শুধু gateway থেকে reachable রাখা, gateway-কে বাইরের identity header মুছতে বলা, আর সম্ভব হলে service-এ JWT বা mTLS যাচাই রাখা দরকার (zero trust)।",
    },
    {
      question:
        "Mobile home screen-এর জন্য gateway ৪টা service parallel-এ ডাকে, প্রতিটার p99 100ms। কেউ বলছে, 'তাহলে screen-এর p99-ও 100ms।' ঠিক কিনা, আর কী করবেন?",
      idealAnswer:
        "না। Parallel-এ সবচেয়ে ধীর call-টাই ঠিক করে কখন উত্তর যাবে। চারটাই 100ms-এর নিচে থাকার সম্ভাবনা 0.99⁴ ≈ 0.96, মানে প্রায় ৪% request-এ অন্তত একটা ধীর call থাকবে। তাই screen-এর p99 প্রতিটা service-এর p99-এর চেয়ে খারাপ হবে। সমাধান: প্রতিটা call-এর আলাদা timeout, ঐচ্ছিক অংশ (offer, review) না এলে বাদ দিয়ে উত্তর পাঠানো, আর জরুরি অংশের জন্যই শুধু অপেক্ষা।",
    },
    {
      question:
        "Kong-এ key-auth আর rate-limiting দুটোই global। ভুল key দিয়ে কেউ মিনিটে হাজারবার চেষ্টা করছে, কিন্তু কখনো 429 পাচ্ছে না। কেন, আর কী করবেন?",
      idealAnswer:
        "Kong-এ একই phase-এ plugin priority অনুযায়ী চলে, key-auth (1250) rate-limiting (910)-এর আগে। ভুল key-এ key-auth সাথে সাথে 401 দিয়ে থামিয়ে দেয়, তাই rate-limiting চলেই না, counter বাড়ে না। Consumer ধরে limit তাই key আন্দাজ করার চেষ্টা থামায় না। সমাধান: IP ধরে আলাদা একটা ঢিলা limit (সামনে কোনো layer-এ বা আলাদা plugin config দিয়ে), auth ব্যর্থতার হার দেখে alert বা block, আর key যথেষ্ট লম্বা ও random রাখা।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "Microservice architecture-এ API Gateway কেন রাখবেন? কী trade-off আছে?",
      answerOutline: `- সমস্যা দিয়ে শুরু: client অনেক service চেনে, auth/limit/log প্রতিটায় আলাদা, ভেতরের গঠন বাইরে খোলা
- লাভ: এক entry point, cross-cutting concern এক জায়গায়, client না ভেঙে ভেতরে বদল, aggregation, versioning
- দাম: আরেকটা hop (latency), SPOF ঝুঁকি, gateway team bottleneck, god gateway ঝুঁকি
- প্রশমন: stateless, একাধিক instance + LB, business logic না, প্রয়োজনে BFF`,
    },
    {
      question:
        "API Gateway, load balancer আর service mesh-এর পার্থক্য কী? তিনটাই কি একসাথে লাগে?",
      answerOutline: `- LB: একই service-এর copy-গুলোতে ভাগ; L4 বা L7
- Gateway: north-south, API-র ধারণা (consumer, key, quota, version)
- Mesh: east-west, service-to-service mTLS, retry, timeout, traffic shifting
- বড় system-এ প্রায়ই তিনটাই: LB → gateway instance-গুলো; gateway → service; service ↔ service mesh দিয়ে
- ছোট system-এ একটা reverse proxy/LB-ই যথেষ্ট`,
    },
    {
      question: "Gateway-তে authentication কিভাবে design করবেন?",
      answerOutline: `- Partner-এর জন্য API key, user-এর জন্য JWT (OAuth/OIDC provider থেকে)
- Gateway-তে JWKS cache করে signature, exp, aud, scope যাচাই; ব্যর্থ হলে 401
- Downstream-এ identity header; বাইরের একই নামের header মুছে ফেলা; credential লুকানো
- Fine-grained authz (resource ownership) service-এ
- Zero trust: service শুধু gateway থেকে reachable, mTLS বা service-side JWT যাচাই
- Revocation: ছোট মেয়াদের access token`,
    },
    {
      question:
        "একটা gateway দিয়ে সব traffic যায়। এটা SPOF আর bottleneck হয়ে যাবে না?",
      answerOutline: `- হ্যাঁ, যদি একটা instance হয়। Gateway stateless রাখুন, horizontal scale
- সামনে L4 LB / DNS, একাধিক zone, health check
- State (rate limit counter, cache) বাইরে, Redis-এ; Redis down হলে fail-open/closed সিদ্ধান্ত
- Config deploy-এর ঝুঁকি: canary, rollback; এক team-এর plugin ভুলে সব বন্ধ না হয়
- Latency: plugin কম, timeout ঠিক, X-Kong-Proxy-Latency ধরনের metric দেখা`,
    },
    {
      question:
        "Mobile আর web দুটো client-এর চাহিদা আলাদা। একটা gateway দিয়ে চালাবেন, নাকি BFF?",
      answerOutline: `- আলাদা payload আকার, call-এর সংখ্যা, release চক্র
- BFF: প্রতি client-এর পাতলা backend, সেই frontend team-এর মালিকানা, aggregation আর আকার বদল
- Shared gateway এখনো সামনে থাকতে পারে auth, limit-এর জন্য
- দাম: কয়েকটা codebase, logic কপির ঝুঁকি; shared logic service-এ রাখা
- বিকল্প: GraphQL, যেখানে client নিজে field বাছে`,
    },
  ],

  summary: {
    points: [
      "API Gateway সব বাইরের API request-এর একমাত্র দরজা; client একটা ঠিকানা চেনে, ভেতরের গঠন লুকানো থাকে।",
      "Cross-cutting কাজ এক জায়গায়: routing, auth (API key, JWT), rate limit ও quota, transformation, caching, log ও trace id, versioning, CORS।",
      "Request একটা plugin chain পেরোয়: route → auth → rate limit → transform → upstream → response → log; ক্রম ঠিক করে কে কোথায় থামে।",
      "Gateway-তে মোটা দাগের auth, service-এ সূক্ষ্ম authorization; ভেতরের network-কে অন্ধভাবে বিশ্বাস নয় (zero trust)।",
      "Aggregation আর BFF ধীর network-এ call কমায়, কিন্তু fan-out-এ tail latency বাড়ে; প্রতিটা call-এ timeout আর graceful degradation।",
      "Gateway আরেকটা hop আর সম্ভাব্য SPOF: stateless রাখুন, কয়েকটা instance, সামনে load balancer।",
      "Business logic gateway-তে না; নাহলে সেটা 'god gateway', নতুন একটা monolith।",
    ],
    diagram: {
      id: "day-016-summary",
      caption: "এক নজরে API Gateway",
      alt: "তিনটা client একটা API Gateway-তে যায়, gateway-র ভেতরে auth, limit, route চিহ্ন, তারপর তিনটা service-এ।",
    },
  },
};
