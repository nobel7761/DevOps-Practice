// Day 4 · API কী? REST-এর বেসিক — introductory lesson (Day 44 and Day 46 go deeper).

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

export const day004Lesson: SdLesson = {
  topicId: "sd-day-004",
  day: 4,
  title: "API কী? REST-এর বেসিক",
  definition:
    "API হলো দুটো program-এর মধ্যে একটা চুক্তি: কী চাওয়া যায়, কিভাবে চাইতে হয় আর কী উত্তর আসবে; REST সেই চুক্তি বানানোর একটা style, যেখানে URL হলো জিনিসের (resource) নাম আর HTTP method হলো কাজ।",

  objectives: [
    "API কেন দরকার, অর্থাৎ ভেতরের database আর code লুকিয়ে একটা স্থির চুক্তি দেওয়ার মূল্য কী, উদাহরণ দিয়ে ব্যাখ্যা করতে পারবেন।",
    "একটা online shop-এর জন্য resource-ভিত্তিক REST endpoint (/products, /orders/{id}) ডিজাইন করে প্রতিটার সঠিক HTTP method আর status code বেছে দিতে পারবেন।",
    "Safe আর idempotent method-এর পার্থক্য, আর timeout-এর পরে কোন request retry করা নিরাপদ, যুক্তি দিয়ে বলতে পারবেন।",
    "PUT বনাম PATCH, consistent error format, pagination, versioning আর auth header নিয়ে প্রাথমিক সিদ্ধান্তগুলো নিতে পারবেন।",
    "Richardson Maturity Model দিয়ে একটা API কতটা 'RESTful' তা মাপতে পারবেন, আর কেন বেশিরভাগ API Level 2-তে থামে বুঝবেন।",
  ],

  prerequisites: [
    { day: 2, title: "Client, Server ও Internet", href: topicHrefForDay(2) },
    { day: 3, title: "DNS, HTTP ও একটি URL-এর গল্প", href: topicHrefForDay(3) },
  ],

  problem: {
    markdown: `রাকিব আর তার দুই বন্ধু মিলে "দেশিহাট" নামে একটা online shop চালায়: জামদানি, নকশিকাঁথা, মাটির জিনিস। প্রথমে শুধু একটা website ছিল, PHP-তে লেখা। যখন যা দরকার হয়েছে, একটা করে URL বানিয়ে ফেলেছে: \`/getAllProducts\`, \`/doOrderNew\`, \`/deleteProductNow?id=7\`।

তারপর এলো mobile app, আর একটা courier company-র সাথে চুক্তি। Courier-কে order-এর ঠিকানা দেখাতে হবে। তাড়াহুড়োয় রাকিব courier-কে **database-এর read password-ই দিয়ে দিল**: "orders table থেকে পড়ে নিন।"

এক মাসের মধ্যে চারটা ঘটনা:

1. **এক রাতে courier-এর system অচল।** রাকিব column-এর নাম \`addr\` থেকে \`shipping_address\` করেছিল। তার নিজের code ঠিক করে নিয়েছিল, কিন্তু courier-এর code তো সে দেখেনি। পরদিন একটা parcel-ও pickup হলো না।
2. **হঠাৎ ২০টা product উধাও।** Admin page-এ "মুছুন" link ছিল \`GET /deleteProductNow?id=7\`। একটা browser extension page-এর সব link আগেভাগে খুলে রাখছিল (prefetch)। প্রতিটা "খোলা"-ই একটা করে product মুছে দিয়েছে।
3. **App বলছে "Order সফল", অথচ order হয়নি।** Server সব ক্ষেত্রেই \`200 OK\` পাঠাত, ভুল হলে body-তে \`{"success": false}\`। App-এর developer শুধু status code দেখত।
4. **একই order তিনবার।** খারাপ network-এ app-এর request timeout হলে app নিজে থেকে আবার পাঠাত। আসলে প্রথম request-টাই server-এ পৌঁছে order বানিয়ে ফেলেছিল, শুধু উত্তরটা ফেরেনি।

চারটা সমস্যার মূলে একটাই জিনিস নেই: **একটা স্পষ্ট চুক্তি।** কে কী চাইতে পারবে, কিভাবে চাইবে, কোন কাজ নিরাপদে বারবার করা যায়, ভুল হলে উত্তর কেমন হবে, আর ভেতরের database বদলালেও বাইরের কারও যেন কিছু না ভাঙে। এই চুক্তির নামই **API**, আর সেটা সাজানোর সবচেয়ে প্রচলিত উপায় **REST**।`,
    diagrams: [
      {
        id: "day-004-before",
        caption:
          "আগে: প্রত্যেক client নিজের মতো endpoint ব্যবহার করে, আর courier partner সরাসরি database-এ ঢোকে; একটা column-এর নাম বদলালেই কারও code ভাঙে।",
        alt: "Mobile App আর Website দুটো আলাদা ধরনের URL দিয়ে Backend-এ যায়, Backend SQL দিয়ে Shop DB-তে; Courier Partner থেকে Shop DB-তে সরাসরি একটা লাল ভাঙা তীর, লেখা DB password দিয়ে সরাসরি।",
      },
    ],
  },

  analogy: {
    markdown: `পুরান ঢাকার একটা কাচ্চির দোকানে বসেছেন। টেবিলে একটা **menu card**: কাচ্চি বিরিয়ানি ৩৫০, মোরগ পোলাও ২৮০, বোরহানি ৮০, ফিরনি ৬০। Waiter এলেন, আপনি বললেন "দুই প্লেট কাচ্চি, এক গ্লাস বোরহানি।" কিছুক্ষণ পর খাবার এলো।

খেয়াল করুন কী কী হলো না:
- আপনি **রান্নাঘরে ঢোকেননি।** বাবুর্চি কোন হাঁড়িতে রাঁধেন, চাল কোথায় রাখা, কিছুই জানতে হয়নি।
- আপনি menu-তে নেই এমন কিছু ("একটু চাইনিজ করে দিন") চাইলে waiter ভদ্রভাবে বলবেন "এটা হবে না।" **Menu ঠিক করে দেয় কী চাওয়া যায়।**
- কাচ্চি শেষ হয়ে গেলে waiter এসে স্পষ্ট বলেন "কাচ্চি শেষ, পোলাও দেব?" চুপচাপ খালি প্লেট রেখে যান না। **উত্তরটাও চুক্তির অংশ।**
- পরের মাসে দোকান নতুন বাবুর্চি আনল, গ্যাসের চুলা বদলে লাকড়ির চুলা করল। আপনার order দেওয়ার নিয়ম একটুও বদলাল না। **ভেতর বদলায়, menu একই থাকে।**

Software-এ:
- **Menu = API contract**: কী কী চাওয়া যায় (endpoint), কিভাবে চাইতে হয় (method, JSON), আর কী ফেরত আসবে (status code, response)
- **Waiter = API server**: আপনার অনুরোধ নিয়ে যায়, নিয়ম মেনে কাজ করায়, উত্তর নিয়ে আসে
- **রান্নাঘর = ভেতরের code আর database**: যেটা client-এর কখনো দেখার দরকার নেই

দেশিহাটের courier partner আসলে রান্নাঘরে ঢুকে নিজে হাঁড়ি থেকে খাবার তুলছিল। বাবুর্চি হাঁড়ির জায়গা বদলাতেই সে খালি হাতে ফিরল।`,
    diagrams: [
      {
        id: "day-004-analogy",
        caption:
          "কাচ্চির দোকান: customer menu দেখে waiter-কে বলে; রান্নাঘর বদলালেও menu, মানে চুক্তি, একই থাকে।",
        alt: "বামে Customer, তার পাশে কাচ্চি বিরিয়ানি, মোরগ পোলাও, বোরহানি, ফিরনির দাম লেখা একটা Menu card, তারপর Waiter, আর ডানে ড্যাশ দেওয়া বাক্সে রান্নাঘর; Customer আর Waiter-এর মধ্যে order আর খাবারের তীর।",
      },
    ],
  },

  coreConcept: {
    markdown: `**API (Application Programming Interface)** হলো একটা program আরেকটা program-এর সাথে কিভাবে কথা বলবে, তার চুক্তি। এখানে "program" মানে আপনার mobile app, আরেকটা company-র server, এমনকি আপনার নিজের অন্য একটা service। Day 2-এ দেখেছিলাম client request পাঠায়, server উত্তর দেয়; API ঠিক করে সেই request আর উত্তর দেখতে কেমন হবে।

API-র আসল মূল্য **লুকানো**: ভেতরে কী আছে (কোন database, কোন table, কোন language) client জানে না, জানার দরকারও নেই। তাই ভেতরটা বদলানো যায়, চুক্তি না ভেঙে।

**কে ব্যবহার করে, সেই হিসেবে তিন ধরনের API:**
- **Public API**: যে কেউ sign up করে key নিয়ে ব্যবহার করতে পারে। যেমন payment gateway বা map-এর API। একবার ছাড়লে বদলানো সবচেয়ে কঠিন, কারণ কারা ব্যবহার করছে আপনি জানেনই না।
- **Partner API**: নির্দিষ্ট কিছু business-এর জন্য, চুক্তি করে। দেশিহাটের courier partner-এর জন্য যেটা দরকার ছিল।
- **Internal API**: নিজেদের app, website আর service-গুলোর মধ্যে। বদলানো সহজ, কিন্তু তবুও চুক্তি, কারণ mobile app-এর পুরনো version মানুষের phone-এ মাসের পর মাস থেকে যায়।

### REST: চুক্তিটা সাজানোর একটা style

**REST (Representational State Transfer)** কোনো library বা protocol না, একটা **architectural style**, মানে কিছু নিয়মের সমষ্টি। Roy Fielding ২০০০ সালে তাঁর PhD dissertation-এ এটা বর্ণনা করেন, মূলত Web নিজে কেন এত ভালো scale করে তা ব্যাখ্যা করতে গিয়ে। আজ "REST API" বলতে সাধারণত বোঝায় HTTP-র উপর, JSON দিয়ে, নিচের নিয়মগুলো মেনে বানানো API।

**১. Resource আর URL: বিশেষ্য (noun), ক্রিয়া (verb) না।** System-এর প্রতিটা "জিনিস" একটা **resource**: product, order, customer। প্রতিটার একটা ঠিকানা (URI):
- \`/products\`: সব product-এর তালিকা (collection)
- \`/products/7\`: ৭ নম্বর product (একটা নির্দিষ্ট resource)
- \`/orders/42/items\`: ৪২ নম্বর order-এর ভেতরের item-গুলো

\`/getAllProducts\` বা \`/doOrderNew\`-এর মতো URL-এ কাজটা নামের ভেতরে ঢুকে গেছে। REST-এ কাজ বলবে method।

**২. HTTP Method: ক্রিয়া।** Day 3-এ method-গুলো দেখেছিলাম; API-তে প্রতিটার নির্দিষ্ট অর্থ:

| Method | অর্থ | দেশিহাটে উদাহরণ |
|---|---|---|
| \`GET\` | পড়ো, কিছু বদলিও না | \`GET /products?category=saree\` |
| \`POST\` | collection-এ নতুন কিছু তৈরি করো | \`POST /orders\` |
| \`PUT\` | এই ঠিকানার resource পুরোটা এটা দিয়ে বদলে দাও | \`PUT /products/7\` |
| \`PATCH\` | এই resource-এর শুধু কিছু অংশ বদলাও | \`PATCH /orders/42\` (status: shipped) |
| \`DELETE\` | এই resource মুছে দাও | \`DELETE /cart/items/3\` |

**৩. Status code: উত্তরের প্রথম কথা।** Day 3-এর 2xx/3xx/4xx/5xx মনে আছে? API-তে client-এর code মূলত status code দেখেই সিদ্ধান্ত নেয়, তাই এটা সঠিক হওয়া জরুরি। সবচেয়ে বেশি লাগে: \`200 OK\`, \`201 Created\` (নতুন resource, সাথে \`Location\` header-এ তার ঠিকানা), \`202 Accepted\` (নিয়েছি, কাজটা পরে শেষ হবে, যেমন বড় report বানানো), \`204 No Content\`, \`400 Bad Request\`, \`401 Unauthorized\` (কে আপনি?), \`403 Forbidden\` (চিনি, কিন্তু অনুমতি নেই), \`404 Not Found\`, \`409 Conflict\` (যেমন stock শেষ), \`422 Unprocessable Content\` (JSON ঠিক, কিন্তু মানে ভুল), \`429 Too Many Requests\`, \`500\`, \`503\`।

**৪. Representation: JSON।** Client resource-টা নিজে পায় না, পায় তার একটা **representation**, মানে একটা বর্ণনা। এখন প্রায় সবসময় JSON:

\`\`\`http
GET /products/7 HTTP/1.1
Host: api.deshihat.com
Accept: application/json
\`\`\`

\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/json

{ "id": 7, "name": "Jamdani Saree", "price": 4500, "stock": 3 }
\`\`\`

Database-এ হয়তো এটা তিনটা table-এ ছড়ানো, অন্য column-নামে। Client সেটা জানে না, এটাই লুকানোর সুবিধা।

**৫. Stateless:** প্রতিটা request নিজের মধ্যে সম্পূর্ণ। Server আগের request মনে রেখে পরেরটা বোঝে না; কে আপনি (token), কী চান (method, URL, body), সব প্রতিবার সাথে আসে। লাভ: যেকোনো server যেকোনো request সামলাতে পারে, তাই server বাড়ানো সহজ (Day 14-এ বিস্তারিত)।

**৬. Uniform interface:** সব resource-এর সাথে একই ধরনের কথা বলা যায়, একই method, একই status code-এর অর্থ। একটা REST API শিখলে আরেকটা প্রায় আন্দাজ করা যায়। আর মাঝের যেকোনো অংশ (cache, proxy, CDN) না জেনেই বোঝে যে \`GET\` নিরাপদ, তার উত্তর cache করা যায়।

### দেশিহাটের ছোট্ট REST API

\`\`\`text
GET    /products              সব product (filter: ?category=saree)
GET    /products/{id}         একটা product
POST   /products              নতুন product (শুধু admin)
PATCH  /products/{id}         দাম বা stock বদলানো
DELETE /products/{id}         product সরানো (শুধু admin)

POST   /orders                নতুন order
GET    /orders/{id}           order-এর অবস্থা
PATCH  /orders/{id}           courier status বদলায়: "picked", "delivered"
GET    /customers/{id}/orders একজন customer-এর সব order
\`\`\`

একটা order দেওয়া:

\`\`\`http
POST /orders HTTP/1.1
Host: api.deshihat.com
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json

{ "items": [{ "productId": 7, "qty": 1 }], "shippingAddress": "বাড়ি ১২, রোড ৫, ধানমন্ডি" }
\`\`\`

\`\`\`http
HTTP/1.1 201 Created
Location: /orders/42
Content-Type: application/json

{ "id": 42, "status": "pending", "total": 4500 }
\`\`\`

Courier এখন database-এ ঢোকে না, \`GET /orders/42\` আর \`PATCH /orders/42\` ব্যবহার করে। Column-এর নাম বদলালে রাকিব শুধু API-র ভেতরের code ঠিক করবে; বাইরের JSON-এ তখনো \`shippingAddress\`-ই থাকবে।

### Safe আর idempotent: কোন request বারবার পাঠানো নিরাপদ

- **Safe**: request-টা server-এর কিছু বদলায় না। \`GET\`, \`HEAD\`, \`OPTIONS\`। এজন্যই browser, crawler বা prefetch নির্ভয়ে \`GET\` link খোলে, আর দেশিহাটের \`GET /deleteProductNow\` বিপদ ডেকেছিল।
- **Idempotent**: একই request একবার পাঠালে যা হয়, দশবার পাঠালেও server-এর অবস্থা ঠিক তাই হয়। \`GET\`, \`PUT\`, \`DELETE\` idempotent; \`POST\` না, আর \`PATCH\` নিশ্চিতভাবে না।

কেন এটা জরুরি? Network-এ timeout হলে client জানে না request পৌঁছেছিল কিনা। Idempotent হলে নিশ্চিন্তে আবার পাঠানো যায়। \`POST /orders\` আবার পাঠালে আরেকটা order হতে পারে, দেশিহাটের চতুর্থ সমস্যা। এর সমাধান **idempotency key**, deep dive-এ ছুঁয়ে যাব, আর Day 57-এ পুরোটা।

এখন এটুকু জানলেই চলবে। REST-কে RPC আর GraphQL-এর পাশে রেখে তুলনা হবে [Day 44](${topicHrefForDay(44)})-এ, আর pagination, versioning, idempotency key আর error format নিয়ে পুরো ডিজাইন [Day 46](${topicHrefForDay(46)})-এ গভীরে যাব।`,
    diagrams: [
      {
        id: "day-004-main",
        caption:
          "পরে: Mobile App, Website আর Courier Partner, সবাই একই REST API-র চুক্তি মেনে কথা বলে; database-এ হাত দেয় শুধু API।",
        alt: "বামে Mobile App (GET /products), Website (POST /orders) আর Courier Partner (PATCH /orders/42), তিনটা থেকে তীর মাঝের হাইলাইট করা REST API-তে; REST API থেকে ডানে Shop DB-তে একটা তীর।",
        downloadable: true,
      },
      {
        id: "day-004-before-after",
        caption:
          "পাশাপাশি: আগে সবাই ভেতরের জিনিসে সরাসরি নির্ভর করত; পরে মাঝখানে একটা স্থির চুক্তি।",
        alt: "উপরে আগের design, যেখানে courier partner সরাসরি database-এ লাল ভাঙা তীরে যায়; নিচে পরের design, যেখানে সব client REST API হয়ে database-এ যায়।",
      },
    ],
  },

  deepDive: [
    {
      title:
        "একটা request-এর যাত্রা: client → API → validation → database → response",
      markdown: `\`POST /orders\` server-এ পৌঁছানোর পর ভেতরে কী কী হয়, একটা ভালো API-তে ক্রমটা মোটামুটি একই:

1. **Routing**: method আর path দেখে ঠিক handler খোঁজা। \`/orders\`-এ \`POST\` আছে, কিন্তু \`DELETE /orders\` নেই? তাহলে \`405 Method Not Allowed\`। Path-ই নেই? \`404\`।
2. **Authentication**: \`Authorization\` header-এর token আসল কিনা। না থাকলে বা ভুল হলে \`401\`।
3. **Authorization**: এই user কি এই কাজ করতে পারে? Customer অন্যের order দেখতে চাইলে \`403\` (অনেকে \`404\` দেয়, যাতে order-টা যে আছে সেটাও ফাঁস না হয়)।
4. **Validation**: body JSON হিসেবে পড়া যায় কিনা (না গেলে \`400\`), \`Content-Type\` ঠিক কিনা (\`415\`), field-গুলোর মান অর্থপূর্ণ কিনা, যেমন \`qty\` ধনাত্মক (না হলে \`400\` বা \`422\`)।
5. **Business rule আর database**: stock আছে কিনা, তারপর order লেখা। Stock শেষ হলে \`409 Conflict\`।
6. **Response**: \`201 Created\`, \`Location: /orders/42\`, আর body-তে নতুন order-এর JSON।

ক্রমটা কেন এমন? **সস্তা আর নিশ্চিত যাচাই আগে, দামি কাজ পরে।** Token বা JSON ভুল হলে database-এ যাওয়ার আগেই থামলে server-এর খরচ বাঁচে, আর আক্রমণকারী বেশি দূর যেতে পারে না। আর validation কখনো শুধু client-এ রাখবেন না; Day 2-এর নিয়ম, server client-কে অন্ধভাবে বিশ্বাস করে না। Lab-এ দেখবেন validation না থাকলে \`qty: -5\`-এর order-ও \`201\` পেয়ে যায়।`,
      diagrams: [
        {
          id: "day-004-request-flow",
          caption:
            "ধাপে ধাপে: request আগে auth আর validation পার হয়, তারপর database; উত্তরে 201 আর নতুন order-এর ঠিকানা।",
          alt: "Mobile App, API Server, Auth + Validation আর Shop DB-এর মধ্যে sequence diagram: POST /orders, যাচাই, INSERT, order id 42, 201 Created, তারপর GET /orders/42 আর 200 OK।",
        },
      ],
    },
    {
      title: "PUT বনাম PATCH, আর প্রতিটা method-এর idempotency",
      markdown: `**PUT** মানে "এই ঠিকানায় resource-টা **ঠিক এটাই** হোক।" আপনি যা পাঠাবেন, সেটাই পুরো নতুন অবস্থা। তাই \`PUT /products/2\` body-তে শুধু \`{"price": 2000}\` দিলে, নিয়ম মেনে চলা server name আর stock মুছে দেবে (lab-এ নিজেই দেখবেন)। আবার client নিজে ঠিকানা জানলে PUT দিয়ে নতুন resource তৈরিও করা যায়: \`PUT /carts/abc123\` (নতুন হলে \`201\`, বদলালে \`200\` বা \`204\`)।

**PATCH** মানে "এই পরিবর্তনগুলো প্রয়োগ করো।" শুধু পাঠানো field বদলায়, বাকিগুলো যেমন ছিল তেমন থাকে।

PUT-এর একটা লুকানো বিপদ **lost update**: দুজন admin একই সময়ে product 2 খুললেন (GET)। একজন দাম বদলে পুরো object PUT করলেন, আরেকজন stock বদলে পুরো object PUT করলেন। দ্বিতীয়জনের PUT-এ পুরনো দাম ছিল, তাই প্রথমজনের পরিবর্তন নিঃশব্দে মুছে গেল। শুধু বদলানো field PATCH করলে ঝুঁকি কমে। পুরো সমাধান **conditional request**: GET-এর response-এ server একটা version চিহ্ন দেয় (\`ETag\` header), client PUT-এর সাথে \`If-Match: <সেই ETag>\` পাঠায়, আর এর মধ্যে কেউ বদলে থাকলে server \`412 Precondition Failed\` দেয়, client আবার পড়ে নিয়ে চেষ্টা করে।

এবার idempotency, একটা একটা করে:
- **GET**: কিছু বদলায় না, তাই safe, আর স্বাভাবিকভাবেই idempotent।
- **PUT**: পুরো অবস্থা বসিয়ে দেয়। দশবার একই body বসালেও ফল একই। **Idempotent।**
- **DELETE**: প্রথমবার মুছল (\`200\`/\`204\`), দ্বিতীয়বার \`404\`। উত্তর আলাদা, কিন্তু server-এর **অবস্থা** একই: resource নেই। Idempotency মাপা হয় অবস্থা দিয়ে, response code দিয়ে না। **Idempotent।**
- **POST**: প্রতিবার নতুন কিছু তৈরি করে। দুবার পাঠালে দুটো order। **Idempotent না।**
- **PATCH**: নির্ভর করে কী পাঠাচ্ছেন। \`{"status": "shipped"}\` (মান বসানো) বারবার দিলেও একই। কিন্তু "stock ১ বাড়াও" বা "list-এ একটা item যোগ করো" ধরনের patch প্রতিবার ফল বদলায়। তাই HTTP spec PATCH-কে idempotent ধরে না।

**Retry কেন এর উপর নির্ভর করে:** Client request পাঠাল, ৫ সেকেন্ডে উত্তর এলো না। তিনটা সম্ভাবনা: request পৌঁছায়ইনি, পৌঁছে কাজ হয়ে গেছে কিন্তু উত্তর হারিয়েছে, অথবা কাজ এখনো চলছে। Client আলাদা করতে পারে না। Idempotent request হলে প্রশ্নটাই অবান্তর, আবার পাঠান। POST হলে আবার পাঠানো মানে duplicate-এর ঝুঁকি।

সমাধান: client প্রতিটা "আসল" কাজের জন্য একটা অনন্য **idempotency key** বানায় (যেমন UUID), header-এ পাঠায়, আর retry-তে একই key পাঠায়। Server key দেখে বোঝে "এটা তো আগেই করেছি", নতুন order না বানিয়ে আগের উত্তরটাই ফেরত দেয়। Payment API-গুলোতে এটা খুব প্রচলিত। পুরো design (key কতদিন রাখবেন, একই key-তে আলাদা body এলে কী করবেন) [Day 57](${topicHrefForDay(57)})-এ।`,
      diagrams: [
        {
          id: "day-004-put-patch",
          caption:
            'একই body {"price": 2000}: PUT পুরো resource বদলে দেয়, তাই name আর stock হারায়; PATCH শুধু price বদলায়।',
          alt: "তিনটা কার্ড পাশাপাশি। প্রথমটায় product 2: name Nakshi Kantha, price 2200, stock 10। দ্বিতীয়টা PUT-এর পরে: শুধু id আর price 2000, name আর stock কাটা দাগে লাল। তৃতীয়টা PATCH-এর পরে: name আর stock আগের মতো, price 2000।",
        },
      ],
    },
    {
      title: "Error-এর একটা নির্দিষ্ট JSON format",
      markdown: `দেশিহাটের তৃতীয় সমস্যা ছিল "সব কিছু 200"। নিয়ম দুটো:

1. **Status code সঠিক দিন।** Client-এর code, monitoring, retry logic, load balancer সবাই status code দেখে। \`200\` দিয়ে body-তে error লুকালে সবাই ভুল বোঝে; আর monitoring-এ error rate শূন্য দেখায়।
2. **Body-র error format পুরো API-তে একই রাখুন।** তাহলে client একবার error সামলানোর code লিখলেই হয়।

একটা প্রচলিত গঠন:

\`\`\`json
{
  "error": {
    "code": "OUT_OF_STOCK",
    "message": "Jamdani Saree-র stock শেষ।",
    "details": [{ "field": "items[0].qty", "issue": "available: 0" }],
    "requestId": "req_8f2c1a"
  }
}
\`\`\`

- \`code\`: machine-এর জন্য স্থির নাম। Client \`if (code === "OUT_OF_STOCK")\` লিখতে পারে; message-এর লেখা বদলালেও code ভাঙে না।
- \`message\`: মানুষের জন্য।
- \`details\`: কোন field-এ সমস্যা, form-এ লাল দাগ দেখাতে কাজে লাগে।
- \`requestId\`: user support-এ জানালে log-এ ঠিক request-টা খুঁজে পাওয়া যায়।

একটা standard-ও আছে: **RFC 9457 "Problem Details for HTTP APIs"**, media type \`application/problem+json\`, field \`type\`, \`title\`, \`status\`, \`detail\`, \`instance\`। নিজের format বানান বা standard নিন, আসল কথা হলো **সব জায়গায় একই**।

আর কখনো error-এ stack trace, SQL query বা server-এর ভেতরের path পাঠাবেন না। ওগুলো log-এ যাবে, client-এর কাছে না; নাহলে আক্রমণকারী আপনার ভেতরের গঠন জেনে যায়।`,
    },
    {
      title: "এক নজরে: pagination, versioning, auth header আর rate limit",
      markdown: `এগুলো প্রত্যেকটা নিজেই বড় বিষয়। আজ শুধু কেন লাগে আর মূল ধারণা।

**Pagination:** \`GET /products\` যদি ৫০,০০০ product একসাথে পাঠায়, response কয়েক MB, database-এর উপর চাপ, আর phone-এর memory শেষ। তাই টুকরো টুকরো দেওয়া হয়:
- **Offset/limit**: \`?page=3&limit=20\` বা \`?offset=40&limit=20\`। সহজ, যেকোনো page-এ লাফ দেওয়া যায়। কিন্তু অনেক পেছনের page-এ database-কে আগের সব row গুনে বাদ দিতে হয় (ধীর), আর পড়ার মাঝে নতুন item ঢুকলে কিছু item দুবার বা একবারও আসে না।
- **Cursor**: \`?after=prod_9f3a&limit=20\`। "এর পর থেকে দাও"। বড় ও দ্রুত বদলানো list-এ স্থির আর দ্রুত, কিন্তু সরাসরি "page ৫০"-এ যাওয়া যায় না।
Response-এ পরের page-এর link বা cursor দিন। বিস্তারিত [Day 46](${topicHrefForDay(46)})-এ।

**Versioning:** Public API একবার ছাড়লে client-রা আপনার নিয়ন্ত্রণে নেই। নতুন field **যোগ করা** সাধারণত নিরাপদ; কিন্তু field মোছা, নাম বদলানো, type বদলানো (\`price\` সংখ্যা থেকে string) পুরনো client ভাঙে। তখন নতুন version লাগে: URL-এ (\`/v1/orders\`, \`/v2/orders\`), header-এ, বা কিছু company যেমন তারিখ দিয়ে version দেয়। পুরনো version কিছুদিন চালু রেখে, আগে থেকে জানিয়ে বন্ধ করতে হয়।

**Auth header:** API-কে জানাতে হয় কে ডাকছে। সাধারণত \`Authorization: Bearer <token>\` (login করা user-এর জন্য) বা server-to-server-এ একটা **API key**। দুটো নিয়ম: সবসময় HTTPS, আর token কখনো URL-এর query-তে না (\`?token=...\`), কারণ URL server log, proxy log আর browser history-তে থেকে যায়। \`401\` মানে "কে আপনি জানি না", \`403\` মানে "জানি, কিন্তু অনুমতি নেই"। Authentication, OAuth আর JWT নিয়ে [Day 75](${topicHrefForDay(75)}), [Day 76](${topicHrefForDay(76)}) আর [Day 77](${topicHrefForDay(77)})-এ।

**Rate limit:** একজন client (bug-ওয়ালা script বা আক্রমণকারী) যেন পুরো API দখল করতে না পারে, তাই প্রতি key বা IP-তে সীমা: যেমন মিনিটে ১০০ request। সীমা পার হলে \`429 Too Many Requests\`, সাথে \`Retry-After\` header, কতক্ষণ পরে আবার চেষ্টা করবে। ভালো client \`429\` পেলে সাথে সাথে retry না করে অপেক্ষা করে। কিভাবে বানায় (token bucket ইত্যাদি) [Day 18](${topicHrefForDay(18)})-এ।`,
    },
    {
      title: "HATEOAS আর Richardson Maturity Model: কতটা REST?",
      markdown: `Fielding-এর REST-এ একটা নিয়ম আছে যেটা প্রায় কেউ মানে না: **HATEOAS (Hypermedia As The Engine Of Application State)**। মানে response নিজেই বলে দেবে এরপর কী করা যায়, link দিয়ে, যেমন একটা web page-এ link থাকে:

\`\`\`json
{
  "id": 42,
  "status": "pending",
  "links": {
    "self": "/orders/42",
    "cancel": "/orders/42/cancellation",
    "pay": "/orders/42/payment"
  }
}
\`\`\`

Order ship হয়ে গেলে \`cancel\` link আর থাকবে না। Client-কে "কখন cancel করা যায়" নিয়ম জানতে হয় না, link আছে কিনা দেখলেই হয়।

API কতটা REST মেনে চলে, সেটা মাপার একটা জনপ্রিয় উপায় Leonard Richardson-এর **Richardson Maturity Model**, যেটা Martin Fowler-এর লেখার মাধ্যমে পরিচিত হয়:
- **Level 0**: একটা URL, সব POST, কাজটা body-তে লেখা (\`POST /api {"action": "getOrder"}\`)। HTTP শুধু বাহন।
- **Level 1**: আলাদা resource, আলাদা URL (\`/orders/42\`), কিন্তু method-এর অর্থ নেই।
- **Level 2**: সঠিক HTTP method আর status code। GET safe, POST তৈরি করে, 404 মানে নেই।
- **Level 3**: Level 2 + HATEOAS।

সত্যি কথা: **বেশিরভাগ বাস্তব "REST API" Level 2-তে থামে।** কারণ client app সাধারণত আগে থেকেই জানে কোন screen-এ কী দেখাবে আর কোন URL ডাকবে; link খুঁজে খুঁজে চলার মতো generic client খুব কম লেখা হয়। আর documentation (যেমন OpenAPI spec) দিয়ে সেই চুক্তি আগেই লেখা থাকে। Fielding নিজে বলেছেন hypermedia ছাড়া API আসলে REST না, তাই কেউ কেউ এগুলোকে "HTTP API" বলেন। Interview-তে এই পার্থক্যটা জানা থাকলে ভালো, কিন্তু Level 2 ঠিকমতো করাই বাস্তবে সবচেয়ে বড় কাজ।`,
      diagrams: [
        {
          id: "day-004-maturity",
          caption:
            "Richardson Maturity Model-এর চারটা ধাপ; বেশিরভাগ API Level 2-তে (method + status code) থামে।",
          alt: "চার ধাপের সিঁড়ি: Level 0 এক URL সব POST, Level 1 আলাদা resource URL, Level 2 HTTP method আর status code (হাইলাইট করা, লেখা বেশিরভাগ API এখানে থামে), Level 3 HATEOAS response-এ link।",
        },
      ],
    },
  ],

  tradeOffs: {
    markdown: `**REST কখন ভালো:** CRUD-ধরনের resource (product, order, user), public বা partner API যেখানে অনেক অচেনা client, যেখানে HTTP caching কাজে লাগে (\`GET\` response CDN বা browser cache করতে পারে), আর যেখানে সহজে \`curl\` দিয়ে পরীক্ষা করা আর বোঝা জরুরি।

**কখন অন্য কিছু ভাববেন:** ভেতরের service-গুলোর মধ্যে খুব বেশি সংখ্যক ছোট call, যেখানে প্রতিটা millisecond আর byte গোনা হয় (gRPC, Day 45); mobile screen-এ একসাথে অনেক resource-এর অল্প অল্প field লাগে আর বারবার আলাদা call করতে হচ্ছে (GraphQL, Day 44); server থেকে client-এ সাথে সাথে খবর পাঠাতে হবে (WebSocket/SSE, Day 43); বা কাজটা আসলে একটা "action" যেটা resource-এ ভালো বসে না (তখন \`POST /orders/42/cancellation\`-এর মতো action-কে resource বানিয়ে নেওয়া হয়, অথবা RPC-style)।

REST-এর দাম: একটা screen-এর জন্য কয়েকটা round trip লাগতে পারে, আর response-এ client-এর দরকারের চেয়ে বেশি field আসতে পারে।

পাঁচটা method পাশাপাশি:`,
    table: {
      headers: [
        "Method",
        "কাজ",
        "Safe?",
        "Idempotent?",
        "সফল হলে সাধারণ status",
        "Timeout-এর পরে অন্ধ retry",
      ],
      rows: [
        ["GET", "পড়া", "হ্যাঁ", "হ্যাঁ", "200 (না থাকলে 404)", "নিরাপদ"],
        [
          "POST",
          "collection-এ নতুন তৈরি, বা action",
          "না",
          "না",
          "201 + Location (action-এ 200/202)",
          "বিপজ্জনক: duplicate; idempotency key লাগে",
        ],
        [
          "PUT",
          "পুরো resource বসানো/বদলানো",
          "না",
          "হ্যাঁ",
          "200 / 204 (নতুন হলে 201)",
          "নিরাপদ",
        ],
        [
          "PATCH",
          "আংশিক বদলানো",
          "না",
          "নিশ্চিত না (patch-এর ধরনের উপর)",
          "200 / 204",
          "শুধু 'মান বসানো' patch হলে",
        ],
        [
          "DELETE",
          "মোছা",
          "না",
          "হ্যাঁ (দ্বিতীয়বার 404 হলেও)",
          "204 / 200",
          "নিরাপদ",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **Stripe**-এর API resource-ভিত্তিক REST-এর একটা পরিচিত উদাহরণ: \`/v1/customers\`, \`/v1/payment_intents\`-এর মতো URL, সঠিক status code, আর একটা নির্দিষ্ট error object। Duplicate payment ঠেকাতে POST request-এ \`Idempotency-Key\` header নেয়। Version দেয় তারিখ দিয়ে, যেটা account-এ ঠিক করা থাকে বা \`Stripe-Version\` header দিয়ে বদলানো যায়।
- **GitHub REST API** pagination-এর জন্য \`Link\` header-এ পরের/আগের page-এর URL দেয়, rate limit জানায় \`x-ratelimit-limit\`, \`x-ratelimit-remaining\`-এর মতো response header-এ, আর version বাছাই হয় \`X-GitHub-Api-Version\` header দিয়ে।
- **OpenAPI Specification** (আগের নাম Swagger) দিয়ে একটা REST API-র পুরো চুক্তি (path, method, request/response-এর গঠন) একটা YAML/JSON file-এ লেখা হয়; তা থেকে documentation, client code আর test বানানো যায়।
- বাংলাদেশে **bKash**, **SSLCommerz**-এর মতো payment gateway merchant-দের জন্য HTTP/JSON API আর developer documentation দেয়; দেশিহাটের মতো shop এগুলো দিয়েই checkout বানায়।
- জনপ্রিয় tool: API বানাতে Express/NestJS (Node), FastAPI/Django REST Framework (Python), Spring Boot (Java); পরীক্ষা করতে \`curl\`, Postman, Insomnia; সামনে বসাতে API Gateway (Day 16)।

*উৎস: Roy T. Fielding, "Architectural Styles and the Design of Network-based Software Architectures" (PhD dissertation, UC Irvine, 2000), Chapter 5; RFC 9110 (HTTP Semantics: safe ও idempotent method, status code); RFC 5789 (PATCH); RFC 9457 (Problem Details for HTTP APIs); RFC 6585 (429 Too Many Requests); Martin Fowler, "Richardson Maturity Model" (martinfowler.com, 2010); Stripe API Reference (idempotent requests, versioning); GitHub REST API documentation (pagination, rate limits, API versions); OpenAPI Initiative (spec.openapis.org); bKash ও SSLCommerz developer documentation।*`,
  },

  mistakes: [
    {
      mistake:
        "URL-এ ক্রিয়া বসানো: /getProducts, /createOrder, /deleteUser?id=5। প্রতিটা নতুন কাজে নতুন নাম, কোনো নিয়ম থাকে না।",
      fix: "URL-এ বিশেষ্য (resource) রাখুন, কাজ বলুক method: GET /products, POST /orders, DELETE /users/5।",
    },
    {
      mistake:
        "অবস্থা বদলানো কাজ GET দিয়ে করা (GET /orders/42/cancel)। Crawler, prefetch বা cache সেটা নিজে থেকেই চালিয়ে দিতে পারে।",
      fix: "GET সবসময় safe রাখুন। বদলানোর জন্য POST, PATCH বা DELETE।",
    },
    {
      mistake:
        'সব কিছুতে 200 OK, আর ভুল হলে body-তে {"success": false}। Client, monitoring আর retry logic সবাই বিভ্রান্ত হয়।',
      fix: "সঠিক status code দিন (4xx client-এর ভুল, 5xx server-এর), আর body-তে পুরো API-জুড়ে একই error format।",
    },
    {
      mistake:
        "আংশিক update-এ PUT ব্যবহার করে শুধু বদলানো field পাঠানো, ফলে বাকি field মুছে যায় (বা server PUT-কে PATCH-এর মতো চালায়, যা পরে বিভ্রান্তি তৈরি করে)।",
      fix: "আংশিক বদলে PATCH; PUT-এ সবসময় পুরো representation পাঠান।",
    },
    {
      mistake:
        "Timeout হলে POST অন্ধভাবে retry করা, ফলে duplicate order বা দুবার টাকা কাটা।",
      fix: "Idempotent method নিরাপদে retry করুন; POST-এর জন্য idempotency key দিন, server key দেখে duplicate আটকাবে।",
    },
    {
      mistake:
        "Database-এর table বা column হুবহু JSON-এ বের করে দেওয়া, বা partner-কে database-এ সরাসরি access দেওয়া।",
      fix: "API-র JSON একটা আলাদা চুক্তি হিসেবে ডিজাইন করুন; ভেতরের গঠন বদলালেও বাইরের representation একই রাখুন।",
    },
    {
      mistake:
        "Collection endpoint-এ pagination না রাখা। প্রথমে ৫০টা item, এক বছর পর ৫০,০০০, তখন response আর database দুটোই ধীর।",
      fix: "শুরু থেকেই limit আর page/cursor রাখুন, আর একটা সর্বোচ্চ limit ঠিক করে দিন।",
    },
    {
      mistake:
        "Token বা API key URL-এর query-তে পাঠানো (?api_key=...)। সেটা log আর browser history-তে থেকে যায়।",
      fix: "Authorization header ব্যবহার করুন, সবসময় HTTPS-এর উপর।",
    },
  ],

  lab: [
    {
      title: "একটা ছোট REST API চালু করুন (json-server)",
      markdown: `**json-server** একটা JSON file থেকে সাথে সাথে একটা পুরো REST API বানিয়ে দেয়। শুধু Node.js (18 বা তার বেশি) লাগবে। একটা খালি folder-এ \`db.json\` বানান:

\`\`\`bash
mkdir deshihat-api && cd deshihat-api
cat > db.json <<'EOF'
{
  "products": [
    { "id": 1, "name": "Jamdani Saree", "price": 4500, "stock": 3 },
    { "id": 2, "name": "Nakshi Kantha", "price": 2200, "stock": 10 }
  ],
  "orders": []
}
EOF
npx json-server@0.17.4 --watch db.json --port 3500
\`\`\`

Version ইচ্ছা করে \`0.17.4\` দেওয়া হয়েছে; নতুন 1.x version-এ id আর query-র নিয়ম কিছুটা আলাদা। Port 3500 ব্যস্ত থাকলে \`--port 4000\` দিন (তখন নিচের command-গুলোতেও 4000)। Terminal-টা খোলা রাখুন, এখানে প্রতিটা request-এর method, path আর status code log হবে। নিচের command-গুলো আরেকটা terminal-এ চালান।`,
    },
    {
      title: "GET: পড়ুন, আর না থাকলে কী হয় দেখুন",
      markdown: `\`\`\`bash
curl -i http://localhost:3500/products
curl -i http://localhost:3500/products/1
curl -i http://localhost:3500/products/99
curl "http://localhost:3500/products?price_gte=3000"
\`\`\`

\`-i\` দিলে response-এর status line আর header-ও দেখা যায়। প্রথম দুটোয় \`HTTP/1.1 200 OK\` আর \`Content-Type: application/json\`। তৃতীয়টায় \`404 Not Found\`। চতুর্থটায় filter: শুধু ৩,০০০ টাকার বেশি দামের product। খেয়াল করুন, এই GET-গুলো দশবার চালালেও \`db.json\` একটুও বদলায় না (safe)।`,
    },
    {
      title: "POST: নতুন order, আর কেন POST idempotent না",
      markdown: `\`\`\`bash
curl -i -X POST http://localhost:3500/orders \\
  -H "Content-Type: application/json" \\
  -d '{"productId": 1, "qty": 2}'
\`\`\`

দেখবেন \`201 Created\` আর \`Location: http://localhost:3500/orders/1\`। এবার **ঠিক একই command আবার চালান**, তারপর:

\`\`\`bash
curl http://localhost:3500/orders
\`\`\`

দুটো order, id 1 আর 2। একই request দুবার = দুটো জিনিস। Timeout-এর পরে অন্ধ retry-তে বাস্তবে ঠিক এটাই হয়।

এবার একটা অর্থহীন order পাঠান:

\`\`\`bash
curl -s -o /dev/null -w "%{http_code}\\n" -X POST http://localhost:3500/orders \\
  -H "Content-Type: application/json" -d '{"productId": 999, "qty": -5}'
\`\`\`

\`201\`! json-server কোনো business validation করে না: product 999 নেই, qty ঋণাত্মক, তবুও order হয়ে গেল। আসল API-তে এখানে \`400\`/\`422\` আসা উচিত, আর সেই যাচাই আপনাকেই লিখতে হবে।`,
    },
    {
      title: "PUT বনাম PATCH: একই body, আলাদা ফল",
      markdown: `\`\`\`bash
curl -X PATCH http://localhost:3500/products/1 \\
  -H "Content-Type: application/json" -d '{"price": 4200}'

curl -X PUT http://localhost:3500/products/2 \\
  -H "Content-Type: application/json" -d '{"price": 2000}'
\`\`\`

PATCH-এর পরে product 1-এর name আর stock যেমন ছিল তেমন, শুধু price 4200। PUT-এর পরে product 2 দেখুন: শুধু \`{"price": 2000, "id": 2}\`, name আর stock **উধাও**। PUT মানে "পুরোটা এটা দিয়ে বদলাও"। দুটো command-ই আরও কয়েকবার চালান: ফল আর বদলায় না, কারণ এই দুটো request-ই একটা মান "বসিয়ে" দিচ্ছে।`,
    },
    {
      title: "DELETE দুবার, pagination আর ভাঙা JSON",
      markdown: `\`\`\`bash
curl -s -o /dev/null -w "%{http_code}\\n" -X DELETE http://localhost:3500/orders/1
curl -s -o /dev/null -w "%{http_code}\\n" -X DELETE http://localhost:3500/orders/1
\`\`\`

প্রথমবার \`200\`, দ্বিতীয়বার \`404\`। উত্তর আলাদা, কিন্তু দুবারের শেষে server-এর অবস্থা একই: order 1 নেই। এটাই DELETE-এর idempotency।

Pagination:

\`\`\`bash
curl -i "http://localhost:3500/products?_page=1&_limit=1"
\`\`\`

Header-এ \`X-Total-Count: 2\` (মোট কয়টা) আর \`Link: <...?_page=2&_limit=1>; rel="next"\` দেখবেন: পরের page-এর ঠিকানা server নিজেই বলে দিচ্ছে।

শেষে ভাঙা JSON পাঠান:

\`\`\`bash
curl -s -o /dev/null -w "%{http_code}\\n" -X POST http://localhost:3500/orders \\
  -H "Content-Type: application/json" -d 'not json'
\`\`\`

\`400 Bad Request\`: request-টাই পড়া যায়নি, ভুল client-এর।

শেষ হলে server-এর terminal-এ **Ctrl+C**। \`db.json\` file খুলে দেখুন, সব পরিবর্তন সেখানে লেখা হয়ে গেছে; আবার শুরু করতে চাইলে প্রথম ধাপের মতো file-টা নতুন করে বানান।`,
    },
  ],

  connections: {
    markdown: `- **Day 2 · Client, Server ও Internet**: client request পাঠায়, server যাচাই করে উত্তর দেয়, আর server client-কে অন্ধভাবে বিশ্বাস করে না। API সেই আদান-প্রদানের নিয়মগুলো লিখিত চুক্তি বানায়, আর validation সেই অবিশ্বাসের বাস্তব রূপ।
- **Day 3 · DNS, HTTP ও একটি URL-এর গল্প**: সেখানে HTTP method, header, body আর status code-এর গঠন দেখেছিলাম, আর বলেছিলাম "API-র দৃষ্টিতে এগুলো Day 4-এ"। আজ দেখলাম REST সেই একই HTTP-কে কিভাবে চুক্তির ভাষা বানায়: URL = resource, method = কাজ, status code = ফলাফল।

সামনে যেখানে এগুলো আবার আসবে:
- **[Day 14 · Stateful vs Stateless](${topicHrefForDay(14)})**: stateless API কেন horizontal scaling সহজ করে।
- **[Day 16 · API Gateway](${topicHrefForDay(16)})**: অনেক API-র সামনে একটা দরজা, যেখানে auth, rate limit আর routing এক জায়গায়।
- **[Day 17 · Caching](${topicHrefForDay(17)})**: safe GET response কেন আর কিভাবে cache করা যায়।
- **[Day 18 · Rate Limiting](${topicHrefForDay(18)})**: 429 আর Retry-After-এর পেছনের algorithm।
- **[Day 44 · REST vs RPC vs GraphQL](${topicHrefForDay(44)})**: এখন এটুকু জানলেই চলবে, Day 44-এ গভীরে যাব (কখন REST ছেড়ে অন্য style)।
- **[Day 46 · API Design গভীরে](${topicHrefForDay(46)})**: এখন এটুকু জানলেই চলবে, Day 46-এ গভীরে যাব (cursor pagination, versioning policy, idempotency key, error format)।
- **[Day 57 · Idempotency, Retry ও Exactly-once](${topicHrefForDay(57)})**: POST-কে retry-নিরাপদ বানানোর পুরো design।
- **[Day 75](${topicHrefForDay(75)}) · [76](${topicHrefForDay(76)}) · [77](${topicHrefForDay(77)})**: Authentication vs Authorization, OAuth 2.0 আর JWT, অর্থাৎ Authorization header-এর token আসে কোথা থেকে।`,
  },

  explainYourself: [
    {
      question:
        'রাকিব বলছে, "Courier partner-কে database-এর read-only access দিলেই তো হয়, আলাদা API বানানোর ঝামেলা কেন?" আপনি কী বলবেন?',
      idealAnswer:
        "Read-only হলেও courier তখন আমাদের ভেতরের গঠনের (table, column-এর নাম, data-র ধরন) উপর নির্ভর করবে, তাই আমরা কিছু বদলালেই তাদের code ভাঙবে, আর আমরা জানতেও পারব না। তারা অন্য customer-এর data-ও পড়তে পারবে, ভারী query চালিয়ে database ধীর করে দিতে পারবে, আর আমরা কোনো নিয়ম বা সীমা বসাতে পারব না। API থাকলে আমরা ঠিক করি তারা কী দেখবে (শুধু তাদের order, শুধু ঠিকানা আর status), auth আর rate limit বসাতে পারি, আর ভেতর বদলালেও JSON-এর চুক্তি একই রাখতে পারি।",
    },
    {
      question:
        "DELETE /orders/7 দ্বিতীয়বার পাঠালে 404 আসে। তাহলে DELETE-কে idempotent বলা হয় কেন?",
      idealAnswer:
        "Idempotency মাপা হয় server-এর অবস্থা দিয়ে, response দিয়ে না। প্রথমবার order 7 মুছে গেল; দ্বিতীয়, তৃতীয়বার পাঠালেও শেষ অবস্থা একই: order 7 নেই। কোনো বাড়তি পরিবর্তন হয়নি। তাই timeout-এর পরে DELETE আবার পাঠানো নিরাপদ; client শুধু 404-কে 'আগেই মোছা হয়ে গেছে' হিসেবে বুঝলেই হয়। উল্টো দিকে POST দুবার পাঠালে দুটো order হয়, অবস্থা বদলায়, তাই POST idempotent না।",
    },
    {
      question:
        'আপনার teammate একটা endpoint বানিয়েছে: সব response 200, আর ভুল হলে body-তে {"ok": false, "msg": "..."}। এতে কী কী সমস্যা হবে?',
      idealAnswer:
        "Client-এর HTTP library, monitoring, load balancer আর retry logic সবাই status code দেখে সিদ্ধান্ত নেয়। সব 200 হলে dashboard-এ error rate শূন্য দেখাবে, অথচ user-রা ব্যর্থ হচ্ছে; কোনটা retry করা উচিত (503) আর কোনটা না (400) বোঝা যাবে না; আর প্রতিটা client-কে body খুলে আলাদা নিয়মে error খুঁজতে হবে। ঠিক উপায় হলো সঠিক 4xx/5xx দেওয়া, আর body-তে পুরো API-জুড়ে একই error format, যেখানে machine-এর জন্য স্থির code আর মানুষের জন্য message থাকে।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "একটা online shop-এর জন্য REST API ডিজাইন করুন: product দেখা, cart আর order।",
      answerOutline: `- Resource আগে ঠিক করুন: products, carts (বা cart items), orders, customers
- Endpoint: GET /products (filter, pagination), GET /products/{id}, POST /orders, GET /orders/{id}, PATCH /orders/{id} (status), GET /customers/{id}/orders
- প্রতিটায় method আর status: POST → 201 + Location, ভুল input → 400/422, stock শেষ → 409, অন্যের order → 403/404
- Representation: JSON, database-এর গঠন থেকে আলাদা
- Auth header, pagination, versioning আর error format এক লাইনে উল্লেখ করুন
- Order POST-এ idempotency key, কারণ mobile network-এ retry হবেই`,
    },
    {
      question: "PUT আর PATCH-এর পার্থক্য কী? কোনটা idempotent?",
      answerOutline: `- PUT: পুরো representation বসায়; যা পাঠাননি তা থাকে না; client ঠিকানা জানলে নতুন তৈরিও করতে পারে
- PATCH: আংশিক পরিবর্তন প্রয়োগ করে
- PUT idempotent: একই body বারবার = একই অবস্থা
- PATCH spec অনুযায়ী idempotent ধরা হয় না: 'মান বসানো' patch idempotent, কিন্তু 'বাড়াও/যোগ করো' না
- বাস্তব প্রভাব: timeout-এর পরে PUT নিরাপদে retry করা যায়`,
    },
    {
      question:
        "Payment API-তে client timeout পেয়ে request আবার পাঠাল। দুবার টাকা কাটা কিভাবে আটকাবেন?",
      answerOutline: `- সমস্যা: timeout-এ client জানে না প্রথম request সফল হয়েছিল কিনা; POST idempotent না
- Client প্রতিটা payment চেষ্টার জন্য একটা অনন্য idempotency key বানায়, retry-তে একই key পাঠায়
- Server key আর ফলাফল জমা রাখে; একই key আবার এলে নতুন charge না করে আগের response ফেরত দেয়
- একই key-তে আলাদা body এলে error; key কিছু সময় পরে expire
- বিস্তারিত: database-এ unique constraint, একসাথে দুটো একই key এলে কী (Day 57)`,
    },
    {
      question:
        "আপনার public API-তে একটা field-এর নাম বদলাতে হবে। কিভাবে করবেন যাতে কারও app না ভাঙে?",
      answerOutline: `- Field যোগ করা non-breaking, কিন্তু নাম বদলানো/মোছা breaking change
- প্রথমে নতুন field যোগ করুন, কিছুদিন দুটোই পাঠান, পুরনোটা deprecated ঘোষণা করুন
- না পারলে নতুন version: /v2/ URL, header বা তারিখ-ভিত্তিক version
- পুরনো version-এর শেষ তারিখ আগে থেকে জানান, কে এখনো পুরনোটা ডাকছে তা metrics দিয়ে দেখুন`,
    },
    {
      question: "401 আর 403-এর পার্থক্য কী? 400, 404, 409, 422 কখন দেবেন?",
      answerOutline: `- 401: কে আপনি জানি না (token নেই/ভুল/মেয়াদোত্তীর্ণ), আবার login করুন
- 403: আপনাকে চিনি, কিন্তু এই কাজের অনুমতি নেই
- 400: request-টাই পড়া যায় না বা গঠন ভুল (ভাঙা JSON)
- 422: গঠন ঠিক, কিন্তু মান অর্থহীন (qty: -5); অনেক API এখানেও 400 দেয়, পুরো API-তে একটা নিয়ম রাখাই আসল
- 404: resource নেই (অথবা থাকলেও লুকাতে চাই); 409: বর্তমান অবস্থার সাথে সংঘাত (stock শেষ, একই email-এ account আছে)`,
    },
  ],

  summary: {
    points: [
      "API হলো program-দের মধ্যে চুক্তি: ভেতরের code আর database লুকিয়ে একটা স্থির menu দেয়।",
      "REST-এ URL হলো resource-এর নাম (/products/7), HTTP method হলো কাজ, status code হলো ফলাফল, JSON হলো representation।",
      "Stateless: প্রতিটা request-এ token সহ সব তথ্য আসে, তাই যেকোনো server যেকোনো request সামলাতে পারে।",
      "GET safe; GET, PUT, DELETE idempotent; POST না, PATCH নিশ্চিত না। Timeout-এর পরে retry এর উপরেই নির্ভর করে।",
      "PUT পুরোটা বদলায়, PATCH শুধু পাঠানো অংশ।",
      "সঠিক status code আর পুরো API-জুড়ে একই error JSON; শুরু থেকেই pagination, Authorization header আর versioning-এর পরিকল্পনা।",
      "Richardson Model-এ বেশিরভাগ API Level 2-তে থামে; HATEOAS (Level 3) বাস্তবে কম দেখা যায়।",
    ],
    diagram: {
      id: "day-004-summary",
      caption: "এক নজরে REST API",
      alt: "Client (GET /products/7) আর Partner (POST /orders) থেকে হাইলাইট করা REST API-তে তীর, REST API থেকে Database-এ query।",
    },
  },
};
