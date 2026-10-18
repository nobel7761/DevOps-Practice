import type { CommandEntry } from "@/lib/data/commands/types";

// Bangla, story-first command explainers. Hand-written (not scraped) —
// one entry per distinct command usage actually demonstrated in a lab.
export const commandGlossary: Record<string, CommandEntry> = {
  "mkdir-p": {
    id: "mkdir-p",
    command: "mkdir -p ~/code/lab/projects/website",
    category: "File & Directory Management",
    story:
      "ধরো, তুমি একটা বহুতল building বানাতে চাও — ground floor, তার ভেতরে আরেকটা floor, তার ভেতরে আরেকটা room। সাধারণত একটার পর একটা করে বানাতে হতো, কিন্তু `-p` ব্যবহার করলে তুমি এক কথায় পুরো chain-টা (মাঝের floor গুলো আগে থেকে না থাকলেও) একসাথে বানিয়ে ফেলতে পারো।",
    tokens: [
      {
        token: "mkdir",
        meaning: "নতুন directory (folder) বানানোর command (make directory)",
      },
      {
        token: "-p",
        meaning:
          '"parents" — path-এর মাঝে যে যে folder নাই, সেগুলোও automatically বানিয়ে দেবে। এটা ছাড়া চালালে মাঝের কোনো folder (যেমন এখানে "code" বা "lab") আগে থেকে না থাকলে error দেবে।',
      },
      {
        token: "~/code/lab/projects/website",
        meaning:
          'কোন path-এ directory বানাতে হবে; "~" মানে তোমার home directory।',
      },
    ],
    tip: '⚠️ Interview tip: "-p" ছাড়া mkdir a/b/c চালালে, যদি "a" folder-ই না থাকে তাহলে error দেবে ("No such file or directory")। "-p" দিলে পুরো chain-ই নির্বিঘ্নে বানিয়ে দেবে।',
  },
  "echo-redirect": {
    id: "echo-redirect",
    command: 'echo "Hello World" > ~/code/lab/projects/website/index.html',
    category: "File & Directory Management",
    story:
      'ধরো তুমি একটা খালি খাতায় (file) কিছু লিখে রাখতে চাও। "echo" হচ্ছে তোমার মুখ — quote-এর ভেতরের লেখাটা বলে (print করে) দেয়। আর ">" চিহ্নটা একটা arrow, যেটা বলে দেয় "এই লেখাটা terminal-এ না দেখিয়ে, এই file-এর ভেতরে লিখে দাও"।',
    tokens: [
      { token: "echo", meaning: "terminal-এ লেখা print করার command" },
      { token: '"Hello World"', meaning: "যে text টা print/write হবে" },
      {
        token: ">",
        meaning:
          "redirect operator — আগের command-এর output নিয়ে file-এ লিখে দেয় (file আগে থেকে থাকলে তার পুরনো content মুছে নতুন করে লিখবে)।",
      },
      {
        token: "~/code/lab/projects/website/index.html",
        meaning: "কোন file-এ লেখা হবে",
      },
    ],
    tip: '⚠️ ">" আর ">>" এক না! ">" দিলে file-এর আগের সব content মুছে নতুন করে লিখবে (overwrite)। ">>" দিলে আগের content-এর শেষে নতুন লাইন যোগ হবে (append)। এটা খুব common interview question।',
  },
  pwd: {
    id: "pwd",
    command: "pwd",
    category: "Navigation",
    story:
      'তুমি যদি একটা বিশাল mall-এ হারিয়ে যাও, আর কাউকে জিজ্ঞেস করো "আমি এখন কোথায় আছি?" — "pwd" ঠিক সেই কাজটাই করে, file system-এর জন্য। এটা তোমাকে বলে দেয় তুমি এখন কোন folder-এর ভেতরে আছো, root (/) থেকে পুরো path দেখিয়ে।',
    tokens: [
      {
        token: "pwd",
        meaning:
          "Print Working Directory — বর্তমান (current) directory-র পুরো path দেখানোর command",
      },
    ],
    tip: "Tip: এর কোনো argument লাগে না, শুধু command-টাই যথেষ্ট।",
  },
  "cd-path": {
    id: "cd-path",
    command: "cd ~/code/lab",
    category: "Navigation",
    story:
      '"cd" হচ্ছে তোমার পা — এটা দিয়ে তুমি এক folder থেকে আরেক folder-এ হাঁটো (move করো)। এখানে "~" মানে তোমার "বাড়ি" (home directory) — তাই "~/code/lab" মানে "বাড়ি থেকে code folder, তারপর তার ভেতরের lab folder-এ যাও"।',
    tokens: [
      {
        token: "cd",
        meaning: "Change Directory — directory পরিবর্তন করার command",
      },
      {
        token: "~",
        meaning: "home directory-র shortcut (যেমন /root বা /home/username)",
      },
      { token: "~/code/lab", meaning: "পুরো destination path" },
    ],
    tip: '💡 Tip: শুধু "cd" লিখলে (কোনো argument ছাড়া) সোজা home directory-তে নিয়ে যাবে। আর "cd -" লিখলে ঠিক আগের folder-এ ফিরিয়ে নিয়ে যাবে — এটা অনেকেই জানে না!',
  },
  "cd-dotdot": {
    id: "cd-dotdot",
    command: "cd ..",
    category: "Navigation",
    story:
      'ধরো তুমি একটা building-এর 3rd floor-এ আছো আর পুরো building থেকে বের না হয়েই এক floor নিচে নামতে চাও। "cd .." ঠিক সেটাই করে — তোমাকে এক ধাপ উপরের (parent) folder-এ নিয়ে যায়।',
    tokens: [
      { token: "cd", meaning: "directory পরিবর্তনের command" },
      {
        token: "..",
        meaning: "parent directory বোঝানোর বিশেষ symbol (একধাপ উপরে)",
      },
    ],
    tip: '⚠️ "." (এক ডট) মানে "current directory" (এখন যেখানে আছো), আর ".." (দুই ডট) মানে "parent directory" (একধাপ উপরে) — এই দুইটা গুলিয়ে ফেলা একটা common ভুল।',
  },
  "ls-la": {
    id: "ls-la",
    command: "ls -la",
    category: "Navigation",
    story:
      'তুমি একটা ঘরে ঢুকে চারপাশে তাকালে কী কী আছে দেখতে পাও — "ls" ঠিক সেটাই করে, বর্তমান folder-এ কী কী file/folder আছে তার list দেখায়। কিন্তু কিছু জিনিস সাধারণ চোখে লুকানো (hidden) থাকে — "-la" দিলে সেই লুকানো জিনিসগুলোও দেখা যায়, সাথে প্রতিটার বিস্তারিত তথ্য।',
    tokens: [
      {
        token: "ls",
        meaning: "List — directory-র ভেতরের file/folder list দেখানোর command",
      },
      {
        token: "-l",
        meaning:
          '"long format" — প্রতিটা file/folder-এর বিস্তারিত তথ্য দেখায় (permission, owner, size, date)',
      },
      {
        token: "-a",
        meaning:
          '"all" — hidden file (যেগুলোর নাম "." দিয়ে শুরু, যেমন .bashrc) সহ সব দেখায়',
      },
      {
        token: "<path>",
        meaning:
          'যেমন "ls ~/code/lab/projects" — নিজের জায়গা থেকে না সরে অন্য কোনো folder-এর ভেতরে কী আছে তা দেখার জন্য path দেওয়া যায়।',
      },
    ],
    tip: '💡 Tip: "-l" আর "-a" কে একসাথে "-la" (বা "-al", ক্রম কোনো ব্যাপার না) লিখে দেওয়া যায় — Linux-এ multiple single-letter flag একসাথে জোড়া যাওয়াটা খুব common একটা pattern।',
  },
  "find-name": {
    id: "find-name",
    command: 'find . -name "*.txt"',
    category: "Search",
    story:
      'ধরো তোমার hard drive একটা বিশাল লাইব্রেরি, আর তুমি নির্দিষ্ট নামের একটা বই খুঁজছো। "find" সেই লাইব্রেরিয়ান, যে প্রতিটা তাক (folder) আর তার ভেতরের তাক (subfolder) — সব জায়গায় খুঁজে বের করবে, যতই গভীরে থাকুক না কেন।',
    tokens: [
      { token: "find", meaning: "file/folder খোঁজার command" },
      {
        token: ".",
        meaning:
          'কোথা থেকে খোঁজা শুরু হবে — এখানে "." মানে "current directory" (আমি এখন যেখানে আছি)',
      },
      {
        token: '-name "*.txt"',
        meaning:
          'নাম দিয়ে filter — "*" মানে "যেকোনো কিছু", তাই "*.txt" মানে "txt দিয়ে শেষ হওয়া যেকোনো নামের file"',
      },
    ],
    tip: '⚠️ Interview tip: "ls" শুধু এক folder-এর ভেতরটা দেখায়, কিন্তু "find" পুরো folder-tree-তে ঢুকে recursively (subfolder-এর ভেতরেও) খোঁজে — এটাই দুইটার মূল পার্থক্য।',
  },
  "find-type-f": {
    id: "find-type-f",
    command: "find ./documents/notes -type f",
    category: "Search",
    story:
      'এবার ধরো তুমি শুধু বই (files) খুঁজছো, কোনো তাক (folders) না — "-type f" দিয়ে "find"-কে বলে দিচ্ছো শুধু file-ই দেখাও, folder বাদ দাও।',
    tokens: [
      { token: "find", meaning: "খোঁজার command" },
      {
        token: "./documents/notes",
        meaning:
          "কোথা থেকে খোঁজা শুরু হবে (current directory-র ভেতরের documents/notes folder)",
      },
      {
        token: "-type f",
        meaning:
          'শুধু "file" টাইপের জিনিস দেখাবে (folder/directory বাদ)। folder খুঁজতে চাইলে "-type d" ব্যবহার হয়।',
      },
    ],
  },
  "grep-r": {
    id: "grep-r",
    command: 'grep -r "Meeting" ~/code/lab/documents',
    category: "Search",
    story:
      '"find" তোমাকে file-এর নাম খুঁজে দেয়, কিন্তু "grep" খোঁজে file-এর ভেতরের লেখা। ধরো তুমি হাজারটা বইয়ের মধ্যে কোন বইয়ে একটা নির্দিষ্ট শব্দ লেখা আছে তা খুঁজছো — প্রতিটা বই (file) খুলে খুলে পড়ে দেখা "grep"-এর কাজ। "-r" দিলে সে একটা folder না, তার ভেতরের সব subfolder-এর file-ও পড়ে দেখবে।',
    tokens: [
      {
        token: "grep",
        meaning:
          "Global Regular Expression Print — file-এর ভেতরে text/pattern খোঁজার command",
      },
      {
        token: "-r",
        meaning: "Recursive — folder-এর ভেতরের সব subfolder-এও খুঁজবে",
      },
      { token: '"Meeting"', meaning: "কোন শব্দ/pattern খোঁজা হচ্ছে" },
      { token: "~/code/lab/documents", meaning: "কোন folder-এ খোঁজা হবে" },
    ],
    tip: '⚠️ Interview tip: "find" আর "grep" গুলিয়ে ফেলা খুব common ভুল — find = file/folder-এর নাম খোঁজে, grep = file-এর ভেতরের লেখা (content) খোঁজে। এই পার্থক্যটা স্পষ্ট করে বলতে পারাটা জরুরি।',
  },
  "grep-glob": {
    id: "grep-glob",
    command: 'grep "Plan" ~/code/lab/documents/*/*.txt',
    category: "Search",
    story:
      'এবার "-r" ছাড়াই "grep" ব্যবহার করা হচ্ছে — পুরো folder-tree ঘুরে বেড়ানোর বদলে, shell নিজেই "*/*.txt" pattern দিয়ে ঠিক কোন কোন file-এ খুঁজতে হবে তার একটা list বানিয়ে "grep"-কে দিয়ে দিচ্ছে।',
    tokens: [
      { token: "grep", meaning: "text খোঁজার command" },
      { token: '"Plan"', meaning: "কোন শব্দ খোঁজা হচ্ছে" },
      {
        token: "~/code/lab/documents/*/*.txt",
        meaning:
          '"*" wildcard — "যেকোনো নামের folder/file" বোঝায়; তাই এটা বলছে "documents-এর ভেতরের যেকোনো folder-এর ভেতরে থাকা যেকোনো .txt file"।',
      },
    ],
    tip: '💡 Tip: এখানে "*" wildcard-এর কাজটা shell (bash) নিজেই করে ফেলে command চালানোর আগেই — grep কিছুই জানে না এটা wildcard ছিল, সে শুধু file-এর একটা ready-made লিস্ট পায়।',
  },

  // ---- Lab 2: Linux User and Group Management ----
  useradd: {
    id: "useradd",
    command: "sudo useradd nabil",
    category: "User & Group Management",
    story:
      'ধরো, তোমার office-এ একটা special key-card আছে যেটা দিয়ে normal দরজা ছাড়াও "staff only" রুমে ঢোকা যায়। Linux-এ normal user হিসেবে তুমি অনেক গুরুত্বপূর্ণ কাজ (যেমন নতুন user বানানো) করতে পারো না — এর জন্য লাগে root-এর ক্ষমতা। "sudo" হচ্ছে ঠিক সেই key-card: command-এর আগে "sudo" লিখলে তুমি সাময়িকভাবে root-এর ক্ষমতা ধার করে শুধু ওই এক command চালাতে পারো, তারপর আবার normal user-এ ফিরে যাও। এখানে "useradd" দিয়ে "nabil" নামে একটা নতুন user (কর্মচারী) তৈরি হচ্ছে।',
    tokens: [
      {
        token: "sudo",
        meaning:
          "Superuser DO — সাময়িকভাবে root (সবচেয়ে ক্ষমতাশালী user)-এর অনুমতি নিয়ে পরের command-টা চালানো, শুধু ওই এক command-এর জন্যই, permanent না।",
      },
      { token: "useradd", meaning: "নতুন user account তৈরি করার command" },
      {
        token: "nabil",
        meaning:
          "যে username-এ user তৈরি হবে। Default ভাবে এই নামেই একটা home directory আর একটা primary group-ও তৈরি হয়ে যায়।",
      },
    ],
    tip: '⚠️ Interview tip: "sudo" আর root হিসেবে সরাসরি login করা (su -) এক না! sudo প্রতিটা command আলাদাভাবে log করে রাখে (কে, কখন, কী চালিয়েছে) — তাই accountability থাকে। সরাসরি root password share করলে কে কী করলো তা ট্র্যাক করা কঠিন হয়ে যায়।',
  },
  "id-cmd": {
    id: "id-cmd",
    command: "id nabil",
    category: "User & Group Management",
    story:
      'কারো পরিচয়পত্র (ID card) দেখলে যেমন নাম, কোন department, কোন কোন ক্লাবের member — সব এক নজরে বোঝা যায়, "id" command ঠিক তেমন একটা user সম্পর্কে তার UID, primary group, আর supplementary group — সব একসাথে দেখায়।',
    tokens: [
      {
        token: "id",
        meaning:
          "একটা user সম্পর্কে তার UID, GID, আর সব group membership দেখানোর command",
      },
      { token: "nabil", meaning: "কার তথ্য দেখতে চাও, সেই username" },
    ],
    tip: '💡 Tip: argument ছাড়া শুধু "id" লিখলে তোমার নিজের তথ্য দেখাবে।',
  },
  groupadd: {
    id: "groupadd",
    command: "sudo groupadd poridhi-minions",
    category: "User & Group Management",
    story:
      'ধরো তুমি একটা নতুন team/department বানাতে চাও, যাতে পরে অনেক কর্মচারীকে এক সাথে এই team-এর access দেওয়া যায় — একজন একজন করে না দিয়ে। "groupadd" ঠিক সেই নতুন team/department বানায়।',
    tokens: [
      {
        token: "sudo",
        meaning: "root-এর ক্ষমতা ধার করা (group বানানো privileged কাজ)",
      },
      {
        token: "groupadd",
        meaning: "নতুন group (দলভুক্ত করার একক) তৈরি করার command",
      },
      { token: "poridhi-minions", meaning: "নতুন group-এর নাম" },
    ],
    tip: '💡 Tip: user বানালে default ভাবে তার নিজের নামে একটা group বানানো হয় (primary group)। "groupadd" দিয়ে বানানো group গুলো সাধারণত supplementary group হিসেবে ব্যবহার হয় — একাধিক user share করতে পারে।',
  },
  "getent-group": {
    id: "getent-group",
    command: "getent group poridhi-minions",
    category: "User & Group Management",
    story:
      'তুমি যদি জানতে চাও কোনো group ঠিক আছে কিনা, বা তাতে কারা member — "getent" হচ্ছে একটা universal ঠিকানা-বই (phonebook) দেখার মত, যেটা system-এর group তথ্য ভান্ডার (/etc/group অথবা অন্য source, যেমন LDAP) থেকে সঠিক তথ্য এনে দেয়।',
    tokens: [
      {
        token: "getent",
        meaning:
          "get entries — system-এর নানা database (user, group, host ইত্যাদি) থেকে তথ্য বের করার universal command",
      },
      { token: "group", meaning: "কোন ধরনের তথ্য চাই — এখানে group তথ্য" },
      { token: "poridhi-minions", meaning: "কোন group-এর তথ্য দেখতে চাও" },
    ],
    tip: '💡 Tip: শুধু "cat /etc/group" দিয়েও group দেখা যায়, কিন্তু "getent" বেশি নির্ভরযোগ্য — বড় সিস্টেমে user/group তথ্য local file-এ না থেকে কখনো LDAP/AD-এর মত কেন্দ্রীয় সার্ভারে থাকে, আর getent দুই জায়গা থেকেই ঠিকমতো তথ্য আনতে পারে।',
  },
  "usermod-g": {
    id: "usermod-g",
    command: "sudo usermod -g poridhi-minions nabil",
    category: "User & Group Management",
    story:
      'প্রতিটা user-এর ঠিক একটাই "বাড়ি" গ্রুপ (primary group) থাকে — ধরো সেটা তার জন্মের পরিবার। "usermod -g" দিয়ে তুমি সেই মূল (primary) group পাল্টে দিতে পারো, যেন nabil আগের পরিবার থেকে বেরিয়ে নতুন পরিবারে (poridhi-minions) যোগ দিলো।',
    tokens: [
      {
        token: "usermod",
        meaning:
          "বিদ্যমান user-এর settings পরিবর্তন করার command (user modify)",
      },
      {
        token: "-g",
        meaning:
          "lowercase g — user-এর PRIMARY (মূল) group পাল্টায়। আগের primary group সম্পূর্ণ বদলে যায়।",
      },
      { token: "poridhi-minions", meaning: "নতুন primary group-এর নাম" },
      { token: "nabil", meaning: "কার জন্য পরিবর্তন হচ্ছে" },
    ],
    tip: '⚠️ Interview trap: lowercase "-g" আর uppercase "-G" সম্পূর্ণ আলাদা! "-g" primary group বদলে দেয় (replace), "-G" supplementary group হিসেবে যোগ করে (add)। এই দুইটা গুলিয়ে ফেলা খুব common ভুল।',
  },
  "usermod-aG": {
    id: "usermod-aG",
    command: "sudo usermod -aG poridhi-minions minhaz",
    category: "User & Group Management",
    story:
      'ধরো, "poridhi-minions" হচ্ছে একটা club, আর "minhaz" একজন মানুষ যাকে আমরা সেই club-এ add করতে চাই — কিন্তু তার আগে থেকে থাকা অন্য সব club-membership যেন না হারিয়ে যায়। "usermod -aG" ঠিক সেটাই করে: minhaz-কে poridhi-minions গ্রুপে supplementary member হিসেবে যোগ করে, আগের কোনো গ্রুপ membership না হারিয়েই।',
    tokens: [
      {
        token: "usermod",
        meaning: "user-কে modify করার command (user modification)",
      },
      {
        token: "-a",
        meaning:
          '"append" — আগের সব group membership অক্ষত রেখে, নতুন গ্রুপ শুধু যোগ (append) করে।',
      },
      {
        token: "-G",
        meaning:
          '"Groups" (uppercase) — কোন supplementary group-এ যোগ করতে হবে তা বলে দেয়।',
      },
      {
        token: "poridhi-minions",
        meaning:
          "group name (যদি group আগে থেকে create করা না থাকে তাহলে error দিবে)",
      },
      {
        token: "minhaz",
        meaning:
          "username (যদি user আগে থেকে create করা না থাকে তাহলে error দিবে)",
      },
    ],
    tip: '⚠️ সবচেয়ে common ভুল: "-a" বাদ দিয়ে শুধু "-G" দেওয়া! "usermod -G poridhi-minions minhaz" চালালে minhaz-এর আগের সব supplementary group মুছে গিয়ে শুধু poridhi-minions-ই থেকে যাবে — অন্য সব group থেকে চুপচাপ বের হয়ে যাবে। তাই "-a" আর "-G" সবসময় একসাথে ব্যবহার করতে হয়।',
  },
  "groups-cmd": {
    id: "groups-cmd",
    command: "groups nabil",
    category: "User & Group Management",
    story:
      'তুমি কোনো মানুষকে জিজ্ঞেস করলে, "তুমি কোন কোন ক্লাবের member?" — সে একনিঃশ্বাসে সবগুলো নাম বলে দেয়। "groups" command ঠিক সেই উত্তরটাই দেয়, শুধু group-এর নাম গুলো, কোনো UID/GID ছাড়াই।',
    tokens: [
      {
        token: "groups",
        meaning:
          "একটা user কোন কোন group-এর member তার শুধু নামের list দেখানোর command",
      },
      { token: "nabil", meaning: "কার group দেখতে চাও" },
    ],
    tip: '💡 Tip: "id nabil" আর "groups nabil" দুইটাই group দেখায়, কিন্তু "id" সাথে UID/GID নম্বরও দেয়, "groups" শুধু নাম দেয় — দ্রুত check করতে "groups" বেশি সহজ।',
  },
  "usermod-L": {
    id: "usermod-L",
    command: "sudo usermod -L fazlul",
    category: "User & Group Management",
    story:
      'ধরো fazlul লম্বা ছুটিতে গেছে, আর তুমি চাও না এই সময় কেউ (বা সে নিজেও ভুলে) তার account দিয়ে login করুক। কিন্তু তার data/file সব এখনো দরকার, তাই account delete করতে চাও না। "usermod -L" ঠিক একটা তালা (Lock) — account-টা বন্ধ হয়ে যায়, কিন্তু ভেতরের সব জিনিস অক্ষত থাকে।',
    tokens: [
      { token: "usermod", meaning: "user modify করার command" },
      {
        token: "-L",
        meaning:
          '"Lock" (uppercase L) — password-ভিত্তিক login বন্ধ করে দেয়, account-এর data/file কিছুই মোছে না',
      },
      { token: "fazlul", meaning: "কোন user-কে lock করা হচ্ছে" },
    ],
    tip: '💡 Tip: এটা "delete" না, "pause" — fazlul ফিরে এলে "usermod -U" দিয়ে আবার unlock করে দেওয়া যায়।',
  },
  "passwd-S": {
    id: "passwd-S",
    command: "passwd -S fazlul",
    category: "User & Group Management",
    story:
      'ধরো তুমি জানতে চাও কারো membership card টা আসলেই active আছে নাকি temporary suspend করা — "passwd -S" ঠিক সেই status report দেখায়: account lock করা আছে কিনা, password কবে বদলানো হয়েছিল, কবে expire করবে — সব এক লাইনে।',
    tokens: [
      { token: "passwd", meaning: "password-সংক্রান্ত কাজের command" },
      {
        token: "-S",
        meaning:
          '"Status" — account-এর password status দেখায় (L = locked, P = usable password, NP = কোনো password সেট করা নাই)',
      },
      { token: "fazlul", meaning: "কার status দেখতে চাও" },
    ],
    tip: '💡 Tip: output-এর প্রথম অক্ষরটাই সবচেয়ে গুরুত্বপূর্ণ — "L" দেখলে বুঝবে account locked, "P" দেখলে বুঝবে সে normally login করতে পারবে।',
  },
  "passwd-set": {
    id: "passwd-set",
    command: "sudo passwd fazlul",
    category: "User & Group Management",
    story:
      'একটা নতুন তালার জন্য চাবি বানানোর মতো — "passwd" দিয়ে কোনো user-এর password সেট বা পরিবর্তন করা হয়। প্রথমে নতুন password দিতে বলবে, তারপর আবার confirm করতে বলবে (ভুল টাইপ হলে ধরা পড়ার জন্য)।',
    tokens: [
      {
        token: "sudo",
        meaning:
          "root-এর ক্ষমতা ধার করা (অন্যের password বদলানো privileged কাজ)",
      },
      { token: "passwd", meaning: "password সেট/পরিবর্তন করার command" },
      { token: "fazlul", meaning: "কার password সেট হচ্ছে" },
    ],
    tip: '⚠️ Interview tip: "sudo passwd <user>" দিয়ে root অন্য যেকারো password পাল্টাতে পারে, পুরনো password না জেনেই। কিন্তু নিজের password বদলাতে শুধু "passwd" (sudo ছাড়া) লিখলে প্রথমে পুরনো password চাইবে।',
  },
  "usermod-U": {
    id: "usermod-U",
    command: "sudo usermod -U fazlul",
    category: "User & Group Management",
    story:
      'fazlul ছুটি থেকে ফিরেছে — এখন তার account-এর তালা খুলে দেওয়ার পালা। "usermod -U" ঠিক সেই চাবি, যেটা দিয়ে lock করা account আবার active করা যায়।',
    tokens: [
      { token: "usermod", meaning: "user modify করার command" },
      {
        token: "-U",
        meaning:
          '"Unlock" (uppercase U) — password-ভিত্তিক login আবার চালু করে',
      },
      { token: "fazlul", meaning: "কাকে unlock করা হচ্ছে" },
    ],
    tip: '⚠️ Interview trap: user-এর কোনো password-ই সেট করা না থাকলে "usermod -U" error দিবে — password ছাড়া unlock করলে account পুরোপুরি অরক্ষিত হয়ে যেত (কেউ password ছাড়াই ঢুকতে পারত)। তাই unlock করার আগে প্রথমে "passwd" দিয়ে একটা password সেট করে নিতে হয়।',
  },
  "cat-etc-passwd": {
    id: "cat-etc-passwd",
    command: "cat /etc/passwd",
    category: "User & Group Management",
    story:
      'Linux-এ সব user-এর একটা centralized তালিকা থাকে — ঠিক যেমন একটা অফিসের phone-book-এ সব কর্মচারীর নাম, ID, আর department লেখা থাকে। "/etc/passwd" ফাইলটাই সেই তালিকা, আর "cat" দিয়ে পুরো ফাইলটা একবারে পড়ে ফেলা যায়।',
    tokens: [
      {
        token: "cat",
        meaning:
          "একটা file-এর পুরো content terminal-এ দেখানোর command (concatenate)",
      },
      {
        token: "/etc/passwd",
        meaning:
          "সব user account-এর তথ্যের file — username, UID, GID, home directory, default shell",
      },
    ],
    tip: '💡 Tip: নাম যদিও "passwd", আসল (encrypted) password এখানে থাকে না — সেটা থাকে আলাদা, আরও সুরক্ষিত "/etc/shadow" ফাইলে, যেটা শুধু root পড়তে পারে।',
  },

  // ---- Lab 3: User Account Management in Linux ----
  "grep-w": {
    id: "grep-w",
    command: "sudo grep -w 'joker' /etc/passwd",
    category: "Search",
    story:
      'ধরো তুমি "car" শব্দটা খুঁজছো, কিন্তু file-এ "carpet", "scar", "car" — সব থাকলে শুধু "car"-ই চাও, "carpet"-এর ভেতরের অংশ না। "-w" ঠিক এই কাজ করে — শুধু পুরো শব্দ (whole word) মিললে তবেই match ধরবে।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "grep", meaning: "text/pattern খোঁজার command" },
      {
        token: "-w",
        meaning:
          '"word" — শুধু পুরো শব্দ (word boundary) মিললে match করবে, কোনো শব্দের ভেতরের অংশ হলে না',
      },
      { token: "'joker'", meaning: "কোন শব্দ খোঁজা হচ্ছে" },
      { token: "/etc/passwd", meaning: "কোন file-এ খোঁজা হবে" },
    ],
    tip: '💡 Tip: "-w" ছাড়া "grep joker" চালালে "joker2" বা "bigjoker"-এর মতো শব্দও match করে ফেলতে পারে — "-w" এই ভুল match আটকায়।',
  },
  "ls-ld": {
    id: "ls-ld",
    command: "sudo ls -ld /home/bob",
    category: "Navigation",
    story:
      'একটা ঘরের ভেতরে কী আছে না দেখে, শুধু ঘরের দরজাটা (folder নিজেই) কেমন — মালিক কে, কবে বানানো — সেটা জানতে চাইলে "-d" ব্যবহার হয়। এটা ভেতরে না ঢুকে, folder-টাকে নিজেই একটা item হিসেবে দেখায়।',
    tokens: [
      { token: "ls", meaning: "list করার command" },
      { token: "-l", meaning: "long format — বিস্তারিত তথ্য দেখায়" },
      {
        token: "-d",
        meaning:
          '"directory" — folder-এর ভেতরের content না দেখিয়ে, folder-টাকে নিজেই একটা entry হিসেবে দেখায়',
      },
      { token: "/home/bob", meaning: "কোন folder-এর তথ্য দেখতে চাও" },
    ],
    tip: '⚠️ "ls -la /home/bob" আর "ls -ld /home/bob"-এর পার্থক্য বোঝা জরুরি: প্রথমটা bob-এর ভেতরের সব file/folder লিস্ট করে, দ্বিতীয়টা শুধু "/home/bob" folder-টার নিজের তথ্য একলাইনে দেখায়।',
  },
  "useradd-m": {
    id: "useradd-m",
    command: "sudo useradd -m bob",
    category: "User & Group Management",
    story:
      'আগের বার user বানালে home directory (ব্যক্তিগত ঘর) তৈরি হয়নি, শুধু নামটাই register হয়েছিল। "-m" দিলে Linux সেই user-এর জন্য একটা থাকার জায়গাও সাথে সাথে বানিয়ে দেয় — ঠিক যেমন নতুন কর্মচারীকে একটা desk বরাদ্দ দেওয়া।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "useradd", meaning: "নতুন user account তৈরি করার command" },
      {
        token: "-m",
        meaning:
          '"make home directory" — user-এর জন্য /home/<username> ফোল্ডার তৈরি করে',
      },
      { token: "bob", meaning: "username" },
    ],
    tip: '⚠️ Interview tip: distro ভেদে home dir তৈরির default behavior ভিন্ন হতে পারে (কোনো সিস্টেম automatic বানায়, কোনোটায় না) — তাই explicitly "-m" দেওয়াই নিরাপদ অভ্যাস।',
  },
  "usermod-d": {
    id: "usermod-d",
    command: "sudo usermod -d /home/shiyanlou joker",
    category: "User & Group Management",
    story:
      'ধরো joker-এর ঠিকানা বদলে গেছে — কিন্তু তার জিনিসপত্র এখনো পুরনো বাসাতেই পড়ে আছে, শুধু কাগজে-কলমে (system-এর record-এ) নতুন ঠিকানা লেখা হলো। "usermod -d" ঠিক সেটাই করে — শুধু record-এ home directory-র path বদলে দেয়, আসল ফাইল move করে না।',
    tokens: [
      { token: "usermod", meaning: "user modify করার command" },
      {
        token: "-d",
        meaning:
          '"directory" — user-এর home directory path বদলে দেয় system-এর record-এ',
      },
      { token: "/home/shiyanlou", meaning: "নতুন home directory path" },
      { token: "joker", meaning: "কার জন্য পরিবর্তন হচ্ছে" },
    ],
    tip: '⚠️ Interview trap: "usermod -d" একা চালালে পুরনো ফোল্ডারের ফাইলগুলো নতুন জায়গায় move হয় না! ফাইল সহ move করতে চাইলে সাথে "-m" যোগ করতে হয় — "usermod -d /home/newpath -m username"।',
  },
  "usermod-s": {
    id: "usermod-s",
    command: "sudo usermod -s /bin/bash joker",
    category: "User & Group Management",
    story:
      'shell হচ্ছে তোমার আর computer-এর মধ্যে কথা বলার দোভাষী। কিছু ভাষা (/bin/sh) খুবই basic, আর কিছু (/bin/bash) অনেক feature-সমৃদ্ধ। "usermod -s" দিয়ে তুমি কোনো user-এর default দোভাষী (login shell) বদলে দিতে পারো।',
    tokens: [
      { token: "usermod", meaning: "user modify করার command" },
      { token: "-s", meaning: '"shell" — user-এর default login shell বদলায়' },
      {
        token: "/bin/bash",
        meaning: "নতুন shell-এর path (bash — আধুনিক, feature-সমৃদ্ধ shell)",
      },
      { token: "joker", meaning: "কার জন্য পরিবর্তন হচ্ছে" },
    ],
    tip: "💡 Tip: default shell অনেক সময় /bin/sh থাকে (খুবই basic) — বেশিরভাগ user /bin/bash বা /bin/zsh-এ পরিবর্তন করে নেয়, কারণ এতে alias, history, tab-completion ভালো কাজ করে।",
  },
  "su-dash": {
    id: "su-dash",
    command: "su - joker",
    category: "User & Group Management",
    story:
      'ধরো তুমি root হয়ে বসে আছো, কিন্তু এখন joker হিসেবে ঠিক joker-এর মতোই (তার নিজের home directory-তে, তার নিজের environment নিয়ে) কাজ করতে চাও। "su - joker" ঠিক সেই পরিচয় বদল — একদম joker হিসেবে fresh login করার মতো।',
    tokens: [
      {
        token: "su",
        meaning:
          '"substitute/switch user" — অন্য user হিসেবে শুরু করার command',
      },
      {
        token: "-",
        meaning:
          "এই dash বলে দেয় শুধু identity বদলাচ্ছি না, সম্পূর্ণ fresh login-এর মতো environment নতুন user অনুযায়ী reload করো",
      },
      { token: "joker", meaning: "কোন user হিসেবে switch করতে চাও" },
    ],
    tip: '⚠️ Interview tip: "su joker" (dash ছাড়া) আর "su - joker" (dash সহ) আলাদা! dash ছাড়া environment variable (যেমন PATH) root-এরই থেকে যায়, যা অদ্ভুত bug ঘটাতে পারে। dash দিলে joker-এর নিজস্ব clean environment পাওয়া যায়।',
  },
  "passwd-l": {
    id: "passwd-l",
    command: "sudo passwd -l joker",
    category: "User & Group Management",
    story:
      '"usermod -L" আর "passwd -l" — দুটোই account lock করে, কিন্তু উপায় আলাদা। "passwd -l" সরাসরি /etc/shadow ফাইলে password-এর জায়গায় একটা "!" বসিয়ে দেয়, যা password-কে অবৈধ করে দেয়।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "passwd", meaning: "password-সংক্রান্ত কাজের command" },
      {
        token: "-l",
        meaning:
          '"lock" (lowercase) — /etc/shadow-এ password field-এর শুরুতে "!" বসিয়ে authentication বন্ধ করে',
      },
      { token: "joker", meaning: "কাকে lock করা হচ্ছে" },
    ],
    tip: '⚠️ Interview trap: "usermod -L" আর "passwd -l" প্রায় একই কাজ করে, কিন্তু এরা দুটো আলাদা command, আলাদা টুল থেকে আসা — Linux-এ একই কাজের একাধিক রাস্তা থাকতে পারে, এটা জেনে রাখা ভালো।',
  },
  "passwd-u": {
    id: "passwd-u",
    command: "sudo passwd -u joker",
    category: "User & Group Management",
    story:
      'lock করা account-এর "তালা" খোলার জন্য — /etc/shadow-এ বসানো সেই "!" চিহ্নটা সরিয়ে দেয়, password আবার valid হয়ে যায়।',
    tokens: [
      { token: "passwd", meaning: "password-সংক্রান্ত command" },
      {
        token: "-u",
        meaning:
          '"unlock" (lowercase) — /etc/shadow থেকে "!" সরিয়ে password আবার valid করে',
      },
      { token: "joker", meaning: "কাকে unlock করা হচ্ছে" },
    ],
    tip: '💡 Tip: "passwd -u" আর "usermod -U" একই পরিবারের, দুইটাই unlock করে। interview-এ যেকোনোটা বললেই হবে, তবে দুটোই চেনা থাকা ভালো।',
  },
  "userdel-r": {
    id: "userdel-r",
    command: "sudo userdel -r bob",
    category: "User & Group Management",
    story:
      'ধরো bob চাকরি ছেড়ে দিয়েছে — শুধু নাম তালিকা থেকে কাটলেই হবে না, ডেস্কের সব জিনিসও সরাতে হবে। "userdel -r" ঠিক সেই সম্পূর্ণ বিদায় — user account আর তার home directory, দুটোই মুছে ফেলে।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      {
        token: "userdel",
        meaning: "user account মুছে ফেলার command (user delete)",
      },
      {
        token: "-r",
        meaning:
          '"remove" — user-এর home directory আর mail spool-ও সহ মুছে ফেলে',
      },
      { token: "bob", meaning: "কোন user মুছতে হবে" },
    ],
    tip: '⚠️ Interview tip: "-r" ছাড়া "userdel" চালালে শুধু account মুছবে, home directory/file গুলো থেকে যাবে — পরে owner-হীন ফাইল হয়ে system-এ জায়গা নষ্ট করতে থাকে।',
  },
  "cat-etc-shadow": {
    id: "cat-etc-shadow",
    command: "sudo cat /etc/shadow",
    category: "User & Group Management",
    story:
      '"/etc/passwd" সবার জন্য খোলা একটা phonebook, "/etc/shadow" তার বিপরীত — এখানে থাকে সবার encrypted password আর password-expiry তথ্য, আর এটা শুধু root পড়তে পারে। কারো sudo access আছে কিনা যাচাইয়ের একটা classic উপায় হলো সে এই ফাইল পড়তে পারে কিনা দেখা।',
    tokens: [
      {
        token: "sudo",
        meaning: "root-এর ক্ষমতা ধার করা (ছাড়া এই file পড়া যায় না)",
      },
      { token: "cat", meaning: "ফাইলের content দেখানোর command" },
      {
        token: "/etc/shadow",
        meaning:
          "সবার encrypted password আর password-expiry তথ্যের file — শুধু root পড়তে পারে",
      },
    ],
    tip: "⚠️ Interview tip: /etc/passwd সবাই পড়তে পারে (world-readable), কিন্তু /etc/shadow শুধু root পড়তে পারে — password hash leak হলে offline crack ঠেকাতে এই security design।",
  },
  "chown-colon": {
    id: "chown-colon",
    command: "sudo chown joker:joker /home/shiyanlou",
    category: "File Permissions",
    story:
      'প্রতিটা ফাইল/ফোল্ডারের একজন owner (মালিক) আর একটা group থাকে। "chown" দিয়ে তুমি সেই মালিকানা বদলে দিতে পারো — ঠিক যেমন একটা বাড়ির দলিলে নতুন মালিকের নাম লেখা হয়।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      {
        token: "chown",
        meaning:
          '"change owner" — file/folder-এর owner আর group বদলানোর command',
      },
      {
        token: "joker:joker",
        meaning:
          "প্রথম অংশ owner (joker), colon-এর পরের অংশ group (joker) — একসাথে দুটোই বদলানো যায়",
      },
      {
        token: "/home/shiyanlou",
        meaning: "কোন file/folder-এর মালিকানা বদলাবে",
      },
    ],
    tip: '💡 Tip: শুধু owner বদলাতে "chown joker /path" (group অপরিবর্তিত), শুধু group বদলাতে "chown :joker /path" (owner অপরিবর্তিত) — colon দিয়ে আলাদা করে লেখা যায়।',
  },
  "chmod-octal": {
    id: "chmod-octal",
    command: "chmod 700 /home/shiyanlou",
    category: "File Permissions",
    story:
      'Linux-এ প্রতিটা file/folder-এর permission তিনটা group-এর জন্য আলাদা করে সেট হয়: owner (মালিক), group (দলের বাকিরা), আর others (সবাই)। প্রতিটা group-এর তিনটা ক্ষমতা হতে পারে: read, write, execute — সংখ্যায় লেখা হয় r=4, w=2, x=1, আর যোগ করে একটা digit বানানো হয়। "700" মানে owner পায় সব (4+2+1=7), group আর others কিচ্ছু পায় না (0)।',
    tokens: [
      {
        token: "chmod",
        meaning: '"change mode" — file/folder-এর permission বদলানোর command',
      },
      {
        token: "প্রথম digit (৭)",
        meaning: "owner-এর অনুমতি — rwx (read+write+execute = 4+2+1 = 7)",
      },
      {
        token: "দ্বিতীয় digit (০)",
        meaning: "group-এর অনুমতি — কিছুই না (---)",
      },
      {
        token: "তৃতীয় digit (০)",
        meaning: "others (বাকি সবার) অনুমতি — কিছুই না (---)",
      },
      { token: "/home/shiyanlou", meaning: "কোন file/folder-এ apply হবে" },
    ],
    tip: '💡 Tip: মনে রাখার কৌশল — r=4, w=2, x=1, যা চাও যোগ করো। "read+write" চাইলে 4+2=6, "শুধু read" চাইলে 4। 755 মানে owner=rwx(7), group=r-x(5), others=r-x(5)।',
  },

  // ---- Lab 4: Managing Sudo Access for System Administration ----
  "useradd-G": {
    id: "useradd-G",
    command: "sudo useradd -G superadmin -m rootuser",
    category: "User & Group Management",
    story:
      'আগে দেখেছি user বানানোর পর "usermod -aG" দিয়ে আলাদা করে group-এ যোগ করা যায়। কিন্তু তাড়াতাড়ি করতে চাইলে, user বানানোর সময়ই সরাসরি group বলে দেওয়া যায় — ঠিক যেমন নতুন কর্মচারীর joining form-এই লিখে দেওয়া "এ কোন department-এ কাজ করবে"।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "useradd", meaning: "নতুন user account তৈরি করার command" },
      {
        token: "-G superadmin",
        meaning:
          "তৈরির সাথে সাথেই এই user-কে superadmin গ্রুপের supplementary member বানিয়ে দেয়",
      },
      { token: "-m", meaning: "home directory-ও একসাথে তৈরি করে" },
      { token: "rootuser", meaning: "username" },
    ],
    tip: '💡 Tip: "useradd -G" (তৈরির সময়) আর "usermod -aG" (পরে যোগ করা) — দুটোই group-এ যোগ করে, কিন্তু useradd-এর বেলায় "-a" লাগে না, কারণ user তো নতুন, তার "আগের" কোনো group নেই যা হারানোর ভয় থাকবে।',
  },
  visudo: {
    id: "visudo",
    command: "sudo visudo",
    category: "Sudo & Privilege Management",
    story:
      'ধরো company-র নিয়ম বইটা (rulebook) এমন জায়গায় রাখা, যেখানে যেকেউ গিয়ে লিখে ফেললে পুরো company-র security ভেঙে যেতে পারে — এক ভুল বানানেও বিপদ! তাই normal editor (nano/vim) দিয়ে সরাসরি না খুলে, "visudo" নামে একটা বিশেষ, সুরক্ষিত দরজা দিয়ে ঢুকতে হয়, যে save করার আগে সব syntax ভুল check করে দেয়। এই rulebook-ই হলো "/etc/sudoers" — এখানে লেখা থাকে কোন user/group কী কী command root হিসেবে চালাতে পারবে।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      {
        token: "visudo",
        meaning:
          '"vi" (editor) + "sudo" — /etc/sudoers ফাইল নিরাপদে edit করার জন্য বিশেষ command। সরাসরি "vim /etc/sudoers" দিয়ে edit করা উচিত না।',
      },
    ],
    tip: '⚠️ Interview tip: visudo খুলে এরকম একটা লাইন যোগ করা যায়: "%superadmin ALL=(ALL) ALL" — শুরুর "%" মানে এটা group (user না), "superadmin" গ্রুপের নাম, আর "ALL=(ALL) ALL" মানে "যেকোনো host থেকে, যেকোনো user হিসেবে, যেকোনো command চালানোর অনুমতি"। visudo-র সবচেয়ে বড় সুবিধা: save করার সময় syntax ভুল থাকলে warning দেয় এবং save হতে দেয় না — তাই ভুল করে পুরো sudo সিস্টেম নষ্ট (এবং কারো root access না থাকা) হওয়ার ঝুঁকি থাকে না।',
  },
  "visudo-f": {
    id: "visudo-f",
    command: "sudo visudo -f /etc/sudoers.d/serviceop",
    category: "Sudo & Privilege Management",
    story:
      'সবার জন্য একটাই বিশাল rulebook (sudoers) পরিবর্তন করার বদলে, প্রতিটা বিশেষ role-এর জন্য আলাদা ছোট নিয়মের কাগজ বানানো যায় — একটা আলাদা ফোল্ডারে ("/etc/sudoers.d/")। মূল বইটা না ছুঁয়ে, এটা একটা আলাদা appendix যোগ করার মতো।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      {
        token: "visudo",
        meaning:
          "sudoers-ধরনের ফাইল নিরাপদে (syntax-check সহ) edit করার command",
      },
      {
        token: "-f /etc/sudoers.d/serviceop",
        meaning:
          '"file" — main sudoers না, বরং কোন নির্দিষ্ট per-user/role ফাইল edit করতে চাও তা বলে দেয়',
      },
    ],
    tip: '💡 Tip: এই ফাইলের ভেতরে লেখা হয় "Cmnd_Alias SERVICE = /bin/systemctl restart sshd.service" (একটা নামের আড়ালে নির্দিষ্ট command define করা) আর তারপর "serviceop ALL=SERVICE" (serviceop-কে শুধু ওই alias-এর command চালানোর অনুমতি) — এভাবে একজন user-কে পুরো root না দিয়ে, ঠিক যতটুকু দরকার ততটুকুই access দেওয়া যায় (principle of least privilege)।',
  },
  "systemctl-restart": {
    id: "systemctl-restart",
    command: "sudo systemctl restart sshd.service",
    category: "Services & Processes",
    story:
      'Linux-এ প্রতিটা চলমান সেবা (service), যেমন SSH বা web server, "systemd" নামের একটা manager control করে। "systemctl restart" ঠিক যেমন কোনো যন্ত্র আটকে গেলে বন্ধ করে আবার চালু করা — service বন্ধ হয়ে আবার নতুন করে শুরু হয়।',
    tokens: [
      {
        token: "sudo",
        meaning: "root-এর ক্ষমতা ধার করা (service নিয়ন্ত্রণ privileged কাজ)",
      },
      {
        token: "systemctl",
        meaning: "systemd service manager-কে কমান্ড দেওয়ার command",
      },
      { token: "restart", meaning: "service বন্ধ করে আবার চালু করার নির্দেশ" },
      {
        token: "sshd.service",
        meaning: "কোন service-এর ওপর কাজ হবে (এখানে SSH সার্ভার)",
      },
    ],
    tip: '💡 Tip: "restart" আর "reload" আলাদা — restart পুরো service বন্ধ-চালু করে (সংক্ষিপ্ত downtime হতে পারে), reload চলমান অবস্থা থেকেই নতুন config পড়ে নেয় (downtime ছাড়াই), যদি service সেটা support করে।',
  },
  "systemctl-status": {
    id: "systemctl-status",
    command: "sudo systemctl status sshd.service",
    category: "Services & Processes",
    story:
      'service এখন কী অবস্থায় আছে — চলছে, বন্ধ, নাকি error দিচ্ছে — তা এক নজরে জানার জন্য "status" ব্যবহার হয়, ঠিক যেমন ডাক্তার রোগীর current অবস্থা চেক করে।',
    tokens: [
      {
        token: "systemctl",
        meaning: "systemd service manager-কে কমান্ড দেওয়ার command",
      },
      {
        token: "status",
        meaning:
          "service এখন running/stopped/failed কোন অবস্থায় আছে তা দেখায়, সাথে সাম্প্রতিক log-ও",
      },
      { token: "sshd.service", meaning: "কোন service-এর status দেখতে চাও" },
    ],
    tip: '⚠️ এই lab-এ serviceop user শুধু "restart" চালাতে পারে, কিন্তু "status" চালাতে গেলে denied হয় — কারণ sudoers ফাইলে তাকে শুধু নির্দিষ্ট Cmnd_Alias-এর command গুলোর জন্যই অনুমতি দেওয়া ছিল, "status" সেই তালিকায় ছিল না।',
  },
  pidof: {
    id: "pidof",
    command: "pidof sshd",
    category: "Services & Processes",
    story:
      'একটা চলমান process-এর নিজস্ব একটা পরিচয় নম্বর (Process ID) থাকে। "pidof" জিজ্ঞেস করে, "sshd নামের process-টার এখনকার ID কত?" — এটা দিয়ে বোঝা যায় service আসলেই নতুন করে restart হয়েছে কিনা (restart হলে ID বদলে যায়)।',
    tokens: [
      {
        token: "pidof",
        meaning:
          '"process ID of" — নাম দিয়ে একটা চলমান process-এর PID বের করার command',
      },
      { token: "sshd", meaning: "কোন process-এর PID খুঁজছো" },
    ],
    tip: '💡 Tip: restart-এর আগে আর পরে "pidof sshd" চালিয়ে PID compare করলে বোঝা যায় service সত্যিই নতুন করে শুরু হয়েছে কিনা — PID বদলে গেলে restart সফল হয়েছে।',
  },
  "ps-eo": {
    id: "ps-eo",
    command: "ps -eo pid,etime,cmd | grep sshd",
    category: "Services & Processes",
    story:
      'ধরো তুমি জানতে চাও একটা process ঠিক কতক্ষণ ধরে চলছে। "ps" সব চলমান process দেখায়, কিন্তু default output-এ অনেক কলাম থাকে — "-eo" দিয়ে তুমি বেছে বেছে শুধু দরকারি কলাম (PID, কতক্ষণ চলছে, কমান্ড) দেখতে পারো, আর "grep" দিয়ে পুরো তালিকা থেকে শুধু sshd-র লাইনটা ছেঁকে বের করো।',
    tokens: [
      {
        token: "ps",
        meaning:
          '"process status" — চলমান সব process-এর তালিকা দেখানোর command',
      },
      {
        token: "-e",
        meaning: "every process — শুধু নিজের না, সব user-এর সব process দেখাও",
      },
      {
        token: "-o pid,etime,cmd",
        meaning:
          '"output format" — কাস্টম কলাম বেছে নাও: pid, etime (কতক্ষণ ধরে চলছে), cmd (কমান্ড)',
      },
      {
        token: "| grep sshd",
        meaning:
          "pipe দিয়ে ps-এর পুরো output grep-এ পাঠানো হচ্ছে, যাতে শুধু sshd-সম্পর্কিত লাইনটাই দেখা যায়",
      },
    ],
    tip: '💡 Tip: "|" (pipe) Linux-এর সবচেয়ে শক্তিশালী ধারণাগুলোর একটা — এক command-এর output অন্য command-এর input হিসেবে সরাসরি পাঠানো যায়, যেন একটা factory-র assembly line।',
  },

  // ---- Lab 5: Understanding /etc/skel/ in Linux ----
  "echo-pipe-tee": {
    id: "echo-pipe-tee",
    command:
      'echo "Welcome to this system, enjoy your stay!" | sudo tee /etc/skel/welcome.txt',
    category: "File & Directory Management",
    story:
      'মনে আছে ">" দিয়ে file-এ লেখা যায়? কিন্তু সমস্যা হলো, "sudo echo ... > /root-owned-file" লিখলেও permission denied আসতে পারে! কারণ ">" (redirect)-এর কাজটা করে shell নিজে, echo কমান্ড না — আর shell তখনো তোমার normal (non-root) ক্ষমতায় চলছে, sudo শুধু "echo" অংশটাকেই root বানিয়েছিল। "tee" এই সমস্যার সমাধান — এটা একটা আসল command (যাকে sudo দিয়ে root বানানো যায়), যে pipe দিয়ে আসা লেখা file-এ লিখে দেয়, আবার সাথে সাথে terminal-এও দেখায়।',
    tokens: [
      { token: "echo", meaning: "লেখা terminal-এ print করার command" },
      {
        token: "| (pipe)",
        meaning: "echo-এর output সরাসরি পরের command-এর input হিসেবে পাঠায়",
      },
      {
        token: "sudo tee",
        meaning:
          "root ক্ষমতা নিয়ে tee চালানো — tee-ই root হিসেবে file-এ লিখছে, echo নয়",
      },
      { token: "/etc/skel/welcome.txt", meaning: "কোন file-এ লেখা হবে" },
    ],
    tip: '⚠️ Interview trap: "sudo echo text > /root-owned-file" প্রায়ই "Permission denied" দেয়, কারণ redirect (">") shell চালায়, sudo না! সমাধান: "echo text | sudo tee file" — এখানে sudo আসলে tee-কে root বানাচ্ছে, যে file-এ লেখার কাজটা করছে।',
  },
  "sudo-vim": {
    id: "sudo-vim",
    command: "sudo vim /etc/skel/.bashrc",
    category: "File & Directory Management",
    story:
      'root-এর মালিকানাধীন একটা file সরাসরি edit করতে চাইলে, normal user হিসেবে editor খুললে save করতে গিয়ে আটকে যাবে। "sudo vim" দিয়ে root ক্ষমতা নিয়ে editor-টাই খোলা হয়, যাতে পরিবর্তন সরাসরি save করা যায়।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      {
        token: "vim",
        meaning: "টেক্সট এডিট করার একটা জনপ্রিয় terminal editor",
      },
      { token: "/etc/skel/.bashrc", meaning: "কোন file edit করা হবে" },
    ],
    tip: '💡 Tip: vim নতুন হলে কঠিন লাগতে পারে — মনে রাখার মত সহজ শর্টকাট: "i" চাপলে লেখা শুরু করা যায় (insert mode), "Esc" চেপে normal mode-এ ফিরে এসে ":wq" লিখে save করে বের হওয়া যায়।',
  },
  "mkdir-basic": {
    id: "mkdir-basic",
    command: "sudo mkdir /home/testuser5",
    category: "File & Directory Management",
    story:
      '"mkdir -p" (lab 1-এ শেখা) যদি পুরো সিঁড়ি একসাথে বানানো হয়, "mkdir" (flag ছাড়া) তার চেয়ে সহজ, একলেভেল সংস্করণ — একটা মাত্র নতুন folder বানায়, কিন্তু parent folder (/home) আগে থেকেই থাকতে হবে।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "mkdir", meaning: "নতুন একটা folder বানানোর command" },
      { token: "/home/testuser5", meaning: "কোন path-এ folder বানাতে হবে" },
    ],
    tip: '⚠️ "mkdir /a/b/c" (flag ছাড়া) চালালে, মাঝের "a" বা "b" আগে থেকে না থাকলে error দিবে। শুধু শেষ ফোল্ডারটাই বানানো যায়, মাঝেরগুলো থাকতেই হবে — এটাই "mkdir" আর "mkdir -p"-এর মূল পার্থক্য।',
  },
  "rm-cmd": {
    id: "rm-cmd",
    command: "sudo rm /etc/skel/welcome.txt",
    category: "File & Directory Management",
    story:
      'একটা file একদম মুছে ফেলতে চাইলে "rm" ব্যবহার হয় — সতর্ক থাকতে হয়, কারণ Linux-এ সাধারণত কোনো "Recycle Bin" থাকে না, মোছা মানেই চিরতরে চলে যাওয়া।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "rm", meaning: '"remove" — file মুছে ফেলার command' },
      { token: "/etc/skel/welcome.txt", meaning: "কোন file মুছতে হবে" },
    ],
    tip: '⚠️ Interview tip: "rm" সাধারণত folder মুছতে পারে না, folder মুছতে হলে "rm -r" (recursive) লাগে। "rm -rf" জোর করে, কোনো confirmation ছাড়াই, recursively মুছে ফেলে — ভুল path দিলে মারাত্মক ক্ষতি হতে পারে, তাই এটা নিয়ে extra সতর্ক থাকা উচিত।',
  },
  "cp-r": {
    id: "cp-r",
    command: "sudo cp -r /etc/skel/. /home/testuser5/",
    category: "File & Directory Management",
    story:
      'ধরো তুমি একটা ঘরের ভেতরের সব জিনিস আরেকটা ঘরে নিয়ে যেতে চাও, কিন্তু আসল ঘরটাকে (box-টাকে) না নিয়ে, শুধু ভেতরের জিনিসগুলো। শেষের "." মানে "এই ফোল্ডারের ভেতরের সব কিছু", ফোল্ডারটা নিজে না।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "cp", meaning: '"copy" — file/folder কপি করার command' },
      {
        token: "-r",
        meaning:
          '"recursive" — folder-এর ভেতরের সব subfolder/file সহ কপি করে (folder কপি করতে -r বাধ্যতামূলক)',
      },
      {
        token: "/etc/skel/.",
        meaning:
          'শেষের "." মানে "এই ফোল্ডারের ভেতরের সব content", ফোল্ডারটা নিজে না',
      },
      { token: "/home/testuser5/", meaning: "কোথায় কপি হবে" },
    ],
    tip: '⚠️ Interview trap: "cp -r /etc/skel /home/testuser5/" (শেষে ডট ছাড়া) চালালে "/home/testuser5/skel/" নামে একটা নতুন subfolder তৈরি হয়ে যাবে! কিন্তু "/etc/skel/." (ডট সহ) চালালে ভেতরের ফাইলগুলো সরাসরি টার্গেটের ভেতরে চলে আসবে, কোনো extra নেস্টেড folder ছাড়াই।',
  },

  // ---- Lab 6: Linux User Modification ----
  "usermod-l-lower": {
    id: "usermod-l-lower",
    command: "sudo usermod -l newuser testuser",
    category: "User & Group Management",
    story:
      'ধরো কারো নামই বদলে যাচ্ছে (যেমন বিয়ের পর পদবি বদল) — তার বাকি সব তথ্য (home directory, UID, group) একই থাকছে, শুধু login name-টা বদলাচ্ছে। "usermod -l" (lowercase L) ঠিক এই কাজ — শুধু username বদলায়।',
    tokens: [
      { token: "usermod", meaning: "user modify করার command" },
      {
        token: "-l",
        meaning:
          '"login name" (lowercase L) — user-এর username/login name বদলায়, বাকি সব তথ্য অপরিবর্তিত থাকে',
      },
      { token: "newuser", meaning: "নতুন username" },
      { token: "testuser", meaning: "পুরনো (বর্তমান) username" },
    ],
    tip: '⚠️ এই পুরো পরিবারের সবচেয়ে বড় interview trap: lowercase "-l" (login name বদলায়) আর uppercase "-L" (account lock করে) — একদম আলাদা কাজ, শুধু একটা অক্ষরের পার্থক্য! এই দুটো গুলিয়ে ফেলা খুবই সাধারণ ভুল।',
  },
  "usermod-u": {
    id: "usermod-u",
    command: "sudo usermod -u 1100 newuser",
    category: "User & Group Management",
    story:
      'প্রতিটা user-এর একটা ইউনিক সংখ্যা (UID) থাকে, ঠিক যেমন প্রতিটা কর্মচারীর একটা employee ID থাকে। "usermod -u" দিয়ে সেই সংখ্যাটা বদলে দেওয়া যায় — সাধারণত কোনো migration বা সার্ভার merge করার সময় দরকার হয়।',
    tokens: [
      { token: "usermod", meaning: "user modify করার command" },
      { token: "-u", meaning: '"UID" — user-এর Unique ID নম্বর বদলায়' },
      { token: "1100", meaning: "নতুন UID নম্বর" },
      { token: "newuser", meaning: "কার UID বদলানো হচ্ছে" },
    ],
    tip: '⚠️ Interview tip: UID বদলালে ওই user-এর পুরনো ফাইলগুলোর owner স্বয়ংক্রিয়ভাবে আপডেট হয় না (ফাইলে শুধু সংখ্যাটাই store থাকে, নাম না) — তাই UID বদলানোর পর "find / -uid <পুরনো UID>" দিয়ে পুরনো ফাইল খুঁজে নতুন owner-এ chown করে দেওয়া দরকার হতে পারে।',
  },
  "usermod-e": {
    id: "usermod-e",
    command: "sudo usermod -e 2025-12-31 newuser",
    category: "User & Group Management",
    story:
      'ধরো কাউকে শুধু একটা নির্দিষ্ট সময়ের জন্য (যেমন contract প্রজেক্ট) access দিতে হবে — মেয়াদ শেষ হলে যেন automatic account বন্ধ হয়ে যায়, কাউকে মনে করে manually lock করতে না হয়। "usermod -e" সেই expiry date সেট করে দেয়।',
    tokens: [
      { token: "usermod", meaning: "user modify করার command" },
      {
        token: "-e",
        meaning:
          '"expire" — account কবে expire হয়ে যাবে তার তারিখ সেট করে (YYYY-MM-DD ফরম্যাটে)',
      },
      { token: "2025-12-31", meaning: "expiry date" },
      { token: "newuser", meaning: "কোন user-এর জন্য" },
    ],
    tip: '💡 Tip: মেয়াদ শেষ হলে account automatic "lock" হয়ে যায় (delete হয় না) — ফাইলগুলো থেকে যায়, পরে দরকার হলে expiry date সরিয়ে আবার চালু করা যায়।',
  },
  chage: {
    id: "chage",
    command: "sudo chage -l newuser",
    category: "User & Group Management",
    story:
      'একটা password কবে শেষবার বদলানো হয়েছিল, কবে আবার বদলাতে হবে, কতদিন পর warning দেওয়া হবে — এই পুরো সময়সূচি (aging schedule) এক নজরে দেখার জন্য "chage" ব্যবহার হয়। এটা একটা password-এর "health report card"।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      {
        token: "chage",
        meaning:
          '"change age" — password-এর মেয়াদ/বয়স সংক্রান্ত সব তথ্য দেখা বা বদলানোর command',
      },
      {
        token: "-l",
        meaning: '"list" — password aging-এর পুরো তথ্য তালিকা আকারে দেখায়',
      },
      { token: "newuser", meaning: "কার তথ্য দেখতে চাও" },
    ],
    tip: '💡 Tip: শুধু দেখা না, "chage" দিয়ে পরিবর্তনও করা যায় — "chage -d 0 user" দিলে পরের বার login করলেই password বদলাতে বাধ্য করবে, "chage -M 90 user" দিলে password সর্বোচ্চ 90 দিন valid থাকবে।',
  },
  "usermod-c": {
    id: "usermod-c",
    command: 'sudo usermod -c "Test User Account" newuser',
    category: "User & Group Management",
    story:
      "user account-এর সাথে একটা ছোট্ট নোট/বিবরণ জুড়ে দেওয়া যায় — যেমন তার আসল নাম বা designation — যাতে শুধু username দেখে বিভ্রান্ত না হতে হয়, কে আসলে এই account।",
    tokens: [
      { token: "usermod", meaning: "user modify করার command" },
      {
        token: "-c",
        meaning:
          '"comment" — GECOS field বদলায়, সাধারণত user-এর full name বা বিবরণ লেখার জন্য ব্যবহার হয়',
      },
      {
        token: '"Test User Account"',
        meaning: "কী text লেখা হবে comment field-এ",
      },
      { token: "newuser", meaning: "কার জন্য" },
    ],
    tip: '💡 Tip: এই field-টাকে "GECOS" বলা হয় (পুরনো একটা historical নাম) — আজকাল এখানে সাধারণত full name, অফিস নম্বর, ফোন নম্বরের মতো তথ্য রাখা হয়।',
  },
  groupdel: {
    id: "groupdel",
    command: "sudo groupdel testgroup",
    category: "User & Group Management",
    story:
      'একটা team/department আর দরকার না হলে, সেটা মুছে ফেলার জন্য "groupdel" ব্যবহার হয় — "groupadd"-এর ঠিক বিপরীত কাজ।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "groupdel", meaning: "group মুছে ফেলার command (group delete)" },
      { token: "testgroup", meaning: "কোন group মুছতে হবে" },
    ],
    tip: "⚠️ Interview tip: কোনো user-এর primary group হিসেবে ব্যবহৃত হচ্ছে এমন group মোছা যায় না — আগে সেই user-দের primary group বদলে দিতে হবে, তারপর group delete করা যাবে।",
  },
  "useradd-full": {
    id: "useradd-full",
    command:
      'sudo useradd -m -d /home/customuser -s /bin/bash -g users -G sudo -c "Custom User" -e 2025-12-31 customuser',
    category: "User & Group Management",
    story:
      'এতক্ষণ আমরা একটা একটা করে flag শিখেছি — এই command যেন সেই সবগুলোর "গ্র্যান্ড ফিনালে": এক লাইনেই home directory বানানো, shell সেট করা, primary/supplementary group ঠিক করা, নাম লেখা, আর expiry date — সব একসাথে। নতুন কর্মচারীর একটা সম্পূর্ণ joining form এক সাথে পূরণ করার মতো, ধাপে ধাপে না করে।',
    tokens: [
      { token: "-m", meaning: "home directory তৈরি করো" },
      {
        token: "-d /home/customuser",
        meaning: "home directory-র নির্দিষ্ট path বলে দাও",
      },
      { token: "-s /bin/bash", meaning: "default shell বলে দাও" },
      { token: "-g users", meaning: "primary group বলে দাও (একটাই)" },
      {
        token: "-G sudo",
        meaning:
          "supplementary group(গুলো) বলে দাও (একাধিক হতে পারে, কমা দিয়ে)",
      },
      { token: '-c "Custom User"', meaning: "comment/বিবরণ লেখো" },
      { token: "-e 2025-12-31", meaning: "expiry date বলে দাও" },
      { token: "customuser", meaning: "username" },
    ],
    tip: '💡 Interview tip: এই এক লাইনের command মুখস্থ করার দরকার নাই — আসল জিনিস হলো প্রতিটা flag আলাদা করে চিনতে পারা (এগুলো সবই আগের card-এ এক এক করে দেখেছি)। interview-এ এরকম "সব একসাথে" প্রশ্ন আসলে, প্রতিটা flag আলাদা করে ভেঙে ভেঙে বলাটাই সবচেয়ে ভালো উত্তর।',
  },
  "usermod-d-m": {
    id: "usermod-d-m",
    command: "sudo usermod -d /home/newuser -m newuser",
    category: "User & Group Management",
    story:
      '"usermod -d" একা ব্যবহার করলে শুধু record বদলায়, ফাইল move হয় না। কিন্তু এখানে সাথে "-m" যোগ করায়, আসল ফাইলগুলোও পুরনো ঠিকানা থেকে নতুন ঠিকানায় সত্যিকারের move হয়ে যায় — যেন শুধু ঠিকানা না বদলে, সত্যি সত্যি মাল-পত্র নিয়ে বাসা বদল করা।',
    tokens: [
      { token: "usermod", meaning: "user modify করার command" },
      { token: "-d /home/newuser", meaning: "নতুন home directory path" },
      {
        token: "-m",
        meaning:
          '"move" — পুরনো home directory-র সব ফাইল নতুন ঠিকানায় সত্যিকারভাবে move করে দেয়',
      },
      { token: "newuser", meaning: "কার জন্য" },
    ],
    tip: '⚠️ Interview trap: "usermod -d /path user" (একা) শুধু record বদলায়, ফাইল থেকে যায় পুরনো জায়গায়! ফাইল সহ সত্যিকারের move করতে "-m" ফ্ল্যাগ অবশ্যই লাগবে।',
  },

  // ---- Lab 7: Mastering Linux File Permissions ----
  "apt-install": {
    id: "apt-install",
    command: "sudo apt update && sudo apt install -y acl",
    category: "File Permissions",
    story:
      'Linux-এ software install করা অনেকটা দোকান থেকে জিনিস কেনার মতো — "apt" হচ্ছে package manager (দোকানদার)। প্রথমে "update" দিয়ে দোকানের সাম্প্রতিক catalog refresh করা হয়, তারপর "install" দিয়ে আসল জিনিসটা কেনা হয়।',
    tokens: [
      {
        token: "sudo",
        meaning: "root-এর ক্ষমতা ধার করা (software install privileged কাজ)",
      },
      {
        token: "apt update",
        meaning:
          "package list (catalog) সাম্প্রতিক তথ্য দিয়ে refresh করে, কিছুই install করে না",
      },
      {
        token: "&&",
        meaning: "আগের command সফল হলে তবেই পরের command চালাও (চেইন করা)",
      },
      {
        token: "apt install -y acl",
        meaning:
          '"acl" নামের package install করো; "-y" মানে প্রশ্ন জিজ্ঞেস না করেই "হ্যাঁ, ইনস্টল করো"',
      },
    ],
    tip: '💡 Tip: "update" প্যাকেজ list refresh করে (কী পাওয়া যায় তার তথ্য), আর "upgrade" ইতিমধ্যে install করা package-গুলোকে নতুন ভার্সনে নেয় — এই দুইটা গুলিয়ে ফেলা common ভুল।',
  },
  "which-cmd": {
    id: "which-cmd",
    command: "which setfacl getfacl",
    category: "File Permissions",
    story:
      'তুমি জানতে চাও কোনো command সিস্টেমে install আছে কিনা, আর থাকলে ঠিক কোথায় — "which" সেই command খুঁজে তার সঠিক path বলে দেয়।',
    tokens: [
      {
        token: "which",
        meaning:
          "একটা command system-এ কোথায় (কোন path-এ) আছে তা খুঁজে বের করার command",
      },
      {
        token: "setfacl getfacl",
        meaning: "একসাথে একাধিক command-এর path জানতে চাওয়া যায়",
      },
    ],
    tip: '💡 Tip: "which" কিছু না দেখালে (খালি output) মানে command-টা PATH-এ নেই, অর্থাৎ install করা নেই অথবা সঠিকভাবে PATH-এ যোগ করা নেই।',
  },
  "touch-cmd": {
    id: "touch-cmd",
    command: "touch /tmp/testfile",
    category: "File Permissions",
    story:
      'একটা সম্পূর্ণ খালি, নতুন file তৈরি করতে চাইলে (যার ভেতরে কিছুই লেখা থাকবে না) — "touch" ব্যবহার হয়। নাম থেকেই বোঝা যায়, যেন শুধু "ছুঁয়ে" দিলে একটা ফাইল তৈরি হয়ে যায়।',
    tokens: [
      {
        token: "touch",
        meaning:
          "খালি একটা নতুন file তৈরি করার command (বা বিদ্যমান file-এর last-modified সময় আপডেট করার জন্যও ব্যবহার হয়)",
      },
      { token: "/tmp/testfile", meaning: "কোন নামে file তৈরি হবে" },
    ],
    tip: '💡 Tip: file আগে থেকে থাকলে "touch" content কিছু বদলায় না, শুধু file-টার "last modified" timestamp আপডেট করে দেয়।',
  },
  "umask-view": {
    id: "umask-view",
    command: "umask",
    category: "File Permissions",
    story:
      'ধরো একটা কারখানায় নতুন product বানালেই default ভাবে কিছু safety feature off করা থাকে — "umask" হচ্ছে ঠিক সেই নিয়ম, যেটা ঠিক করে দেয় নতুন তৈরি হওয়া file/folder শুরুতে ঠিক কতটুকু permission নিয়ে জন্মাবে।',
    tokens: [
      {
        token: "umask",
        meaning:
          "নতুন তৈরি হওয়া file/folder-এর default permission থেকে কতটুকু বাদ (mask) যাবে তা দেখানোর command",
      },
    ],
    tip: "💡 Tip: file-এর maximum default হলো 666 (rw-rw-rw-, execute কখনো default থাকে না — নিরাপত্তার কারণে), folder-এর maximum 777। umask 022 থাকলে ফলাফল হয় file-এ 644, folder-এ 755।",
  },
  "umask-set": {
    id: "umask-set",
    command: "umask 027",
    category: "File Permissions",
    story:
      'নতুন একটা প্রজেক্টের জন্য ঠিক করা হলো, অচেনা কেউ (others) যেন নতুন তৈরি হওয়া কোনো file/folder-ই দেখতে না পারে — "umask 027" সেট করলেই নতুন থেকে তৈরি হওয়া প্রতিটা file/folder স্বয়ংক্রিয়ভাবে এই নিয়ম মেনে চলবে।',
    tokens: [
      { token: "umask", meaning: "umask সেট করার command" },
      {
        token: "027",
        meaning:
          "কতটুকু permission বাদ (mask) যাবে — ফলাফলে file হবে 640 (owner rw, group r, others কিছুই না), folder হবে 750",
      },
    ],
    tip: "⚠️ Interview trap: umask পরিবর্তন শুধু বর্তমান shell session-এর জন্য প্রযোজ্য! নতুন terminal খুললে আবার default-এ ফিরে যাবে — স্থায়ীভাবে বদলাতে চাইলে .bashrc বা .profile-এ লিখে রাখতে হয়।",
  },
  "chmod-symbolic": {
    id: "chmod-symbolic",
    command: "sudo chmod g+x /home/poridhian/code/projects/ProjectX/src",
    category: "File Permissions",
    story:
      'Octal notation (chmod 755) দিয়ে পুরো তিনটা digit-ই নতুন করে বলে দিতে হয়, এমনকি যেগুলো বদলাচ্ছেই না। কিন্তু মাঝে মাঝে শুধু একটা ছোট পরিবর্তন চাও, বাকি সব যেমন আছে তেমনই থাকুক — তখন "symbolic notation" ব্যবহার হয়, যেন শুধু একটা সুইচ অন/অফ করা, পুরো প্যানেল নতুন করে সেট না করে।',
    tokens: [
      { token: "chmod", meaning: "permission বদলানোর command" },
      { token: "g", meaning: "group (দলের বাকি সদস্যরা)-কে বোঝাচ্ছে" },
      {
        token: "+",
        meaning:
          '"+" মানে অনুমতি যোগ করো ("-" মানে বাদ দাও, "=" মানে exactly এটাই সেট করো, অন্য কিছু না রেখে)',
      },
      {
        token: "x",
        meaning: "execute অনুমতি (folder-এর বেলায় মানে 'ভেতরে ঢোকা/list করা')",
      },
    ],
    tip: '💡 Tip: symbolic notation-এ u (owner), g (group), o (others), a (সবাই) আর +/-/= দিয়ে combine করা যায় — যেমন "chmod o=r file" মানে "others-কে exactly read-only বানাও", আগে যা ছিল তা গুরুত্বপূর্ণ না।',
  },
  "chown-R": {
    id: "chown-R",
    command:
      "sudo chown -R dev_user1:dev /home/poridhian/code/projects/ProjectX",
    category: "File Permissions",
    story:
      '"chown" একা একটামাত্র file/folder-এর মালিকানা বদলায়, কিন্তু একটা পুরো প্রজেক্ট ফোল্ডার (তার ভেতরের সব subfolder/file সহ) একসাথে কারো নামে করে দিতে চাইলে "-R" লাগে — ঠিক যেমন একটা পুরো building-এর সব ফ্লোরের দলিল একসাথে নতুন মালিকের নামে করে দেওয়া।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "chown", meaning: "owner/group বদলানোর command" },
      {
        token: "-R",
        meaning:
          '"Recursive" — folder-এর ভেতরের সব subfolder/file-এও একই পরিবর্তন apply করে',
      },
      {
        token: "dev_user1:dev",
        meaning: "নতুন owner (dev_user1) : নতুন group (dev)",
      },
      {
        token: "/home/.../ProjectX",
        meaning: "কোন folder-এ (এবং তার ভেতরের সব কিছুতে) apply হবে",
      },
    ],
    tip: '💡 Tip: "-R" (uppercase, recursive for chown) chmod-এও একই কাজ করে — recursively apply করা, এটা দুই command-এরই common convention।',
  },
  "setfacl-m": {
    id: "setfacl-m",
    command:
      "sudo setfacl -R -m g:ops:rx /home/poridhian/code/projects/ProjectX/src",
    category: "File Permissions",
    story:
      'Normal permission (chmod) দিয়ে একটা file-এর জন্য মাত্র একটাই "group" নির্দিষ্ট করা যায়। কিন্তু বাস্তবে একই folder-এ তিনটা আলাদা team (dev, ops, qa)-কে তিন রকম আলাদা অনুমতি দিতে হতে পারে — এটা chmod একা পারে না। "setfacl" ঠিক এই সমস্যার সমাধান — chmod-এর বেসিক owner/group/others নিয়মের বাইরেও, একাধিক নির্দিষ্ট user বা group-কে আলাদা আলাদা অনুমতি দেওয়া যায়, একই file/folder-এ।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      {
        token: "setfacl",
        meaning:
          '"set ACL" — একটা file/folder-এ Access Control List (অতিরিক্ত, নির্দিষ্ট user/group-ভিত্তিক permission) যোগ করার command',
      },
      {
        token: "-R",
        meaning: "Recursive — folder-এর ভেতরের সব কিছুতেও apply হবে",
      },
      {
        token: "-m g:ops:rx",
        meaning:
          '"modify" — g মানে group (u দিলে user হতো), ops গ্রুপের নাম, rx মানে read+execute অনুমতি দাও',
      },
      { token: "/home/.../src", meaning: "কোন folder-এ apply হবে" },
    ],
    tip: '⚠️ Interview tip: ACL যোগ করলে "ls -l" output-এর permission string-এর শেষে একটা "+" চিহ্ন দেখা যায় (যেমন "drwxrwx---+") — এটাই বোঝার উপায় যে chmod-এর বাইরেও extra ACL rule আছে। "getfacl" দিয়ে সেই extra rule গুলো দেখা যায়।',
  },
  getfacl: {
    id: "getfacl",
    command: "getfacl /home/poridhian/code/projects/ProjectX/src",
    category: "File Permissions",
    story:
      'setfacl যা যোগ করেছে, সেটা ঠিকমতো বসেছে কিনা যাচাই করার জন্য "getfacl" ব্যবহার হয় — ঠিক যেমন একটা চুক্তিতে সই করার পর আবার পুরোটা পড়ে নিশ্চিত হওয়া সব শর্ত ঠিকভাবে লেখা হয়েছে কিনা।',
    tokens: [
      {
        token: "getfacl",
        meaning:
          '"get ACL" — একটা file/folder-এর পুরো Access Control List (chmod-এর বেসিক permission + setfacl-এর extra rule, সব) দেখানোর command',
      },
      { token: "/home/.../src", meaning: "কোন file/folder-এর ACL দেখতে চাও" },
    ],
    tip: '💡 Tip: "getfacl" output-এ chmod-এর owner/group/other permission আর setfacl-এর দেওয়া extra user:/group: entry — দুটোই একসাথে দেখা যায়, তাই পুরো ছবিটা এক জায়গাতেই বোঝা যায়।',
  },
  "sudo-u": {
    id: "sudo-u",
    command:
      "sudo -u dev_user1 cat /home/poridhian/code/projects/ProjectX/src/main.c",
    category: "File Permissions",
    story:
      'ধরো তুমি root, কিন্তু টেস্ট করতে চাও dev_user1 ঠিক কী কী করতে পারে — root হিসেবে করলে তো সবকিছুই করতে পারবে (সেটা test হবে না!)। "sudo -u" দিয়ে তুমি ঠিক dev_user1-এর চোখ দিয়ে, dev_user1-এর অনুমতি নিয়েই command চালাতে পারো, পুরোপুরি dev_user1 হিসেবে login না করেই।',
    tokens: [
      { token: "sudo", meaning: "অন্য কারো ক্ষমতা ধার করা" },
      {
        token: "-u dev_user1",
        meaning:
          '"user" — কোন user হিসেবে command চালাতে চাও তা বলে দেয় (default root, কিন্তু -u দিয়ে অন্য যেকোনো user বলা যায়)',
      },
      {
        token: "cat /home/.../main.c",
        meaning: "যে আসল command-টা dev_user1 হিসেবে চালানো হচ্ছে",
      },
    ],
    tip: '💡 Tip: "sudo -u user command" আর "su - user"-এর পার্থক্য — "su -" পুরো session-ই ওই user হয়ে যায় (login shell), কিন্তু "sudo -u" শুধু একটামাত্র command-এর জন্য সেই user হয়, তারপর আবার নিজের user-এ ফিরে আসে। Testing/scripting-এর জন্য "sudo -u" বেশি সুবিধাজনক।',
  },
  "ls-l-permissions": {
    id: "ls-l-permissions",
    command: "ls -l deploy.sh",
    category: "File Permissions",
    story:
      '"ls -l" চালালে প্রতিটা file-এর শুরুতে ১০টা অক্ষরের একটা string দেখা যায়, যেমন "-rwxr-xr--"। এটা আসলে file-এর পরিচয়পত্র — প্রথম অক্ষর বলে এটা file নাকি folder, তারপর তিনটা group of তিন তিন অক্ষর owner/group/others-এর অনুমতি বলে দেয়।',
    tokens: [
      {
        token: "প্রথম অক্ষর (- বা d)",
        meaning:
          '"-" মানে এটা একটা সাধারণ file, "d" মানে এটা একটা directory (folder)',
      },
      {
        token: "পরের ৩ অক্ষর (rwx)",
        meaning: "OWNER-এর অনুমতি — read, write, execute",
      },
      { token: "তার পরের ৩ অক্ষর (r-x)", meaning: "GROUP-এর অনুমতি" },
      { token: "শেষ ৩ অক্ষর (r--)", meaning: "OTHERS (বাকি সবার) অনুমতি" },
    ],
    tip: '💡 Tip: "-" চিহ্ন মানে সেই নির্দিষ্ট অনুমতি নেই। "rwxr-xr--" পড়ার সহজ উপায়: owner সব পারে (rwx), group শুধু পড়তে আর চালাতে পারে (r-x), বাকি সবাই শুধু পড়তে পারে (r--)।',
  },

  // ---- Lab 8: Linux Performance Analysis ----
  uptime: {
    id: "uptime",
    command: "uptime",
    category: "Performance Monitoring",
    story:
      'তুমি যদি কাউকে জিজ্ঞেস করো "কেমন আছো, ব্যস্ত নাকি?" — "uptime" সিস্টেমকে ঠিক এই প্রশ্নটাই করে। এটা বলে দেয় সিস্টেম কতক্ষণ ধরে চলছে, আর গত ১, ৫, আর ১৫ মিনিটে গড়ে কত কাজের চাপ (load) ছিল।',
    tokens: [
      {
        token: "uptime",
        meaning:
          "সিস্টেম কতক্ষণ ধরে চালু আছে, আর load average (গত 1/5/15 মিনিটের কাজের চাপ) দেখানোর command",
      },
    ],
    tip: "💡 Tip: load average-এর সংখ্যাটা তোমার CPU-র কোর সংখ্যার সাথে তুলনা করতে হয়। 4-কোরের মেশিনে load 4 মানে পুরো ব্যস্ত, এর বেশি মানে কাজ জমে যাচ্ছে (bottleneck)।",
  },
  "dmesg-tail": {
    id: "dmesg-tail",
    command: "dmesg | tail",
    category: "Performance Monitoring",
    story:
      'কার্নেল (Linux-এর মূল ইঞ্জিন) নিজের একটা ডায়েরি লেখে — হার্ডওয়্যার সমস্যা, মেমরি সংকট, এরকম গুরুত্বপূর্ণ ঘটনা টুকে রাখে। "dmesg" সেই ডায়েরি দেখায়, আর "| tail" দিয়ে শুধু সবচেয়ে সাম্প্রতিক কয়েকটা লাইন দেখা হয়, পুরোটা না।',
    tokens: [
      {
        token: "dmesg",
        meaning:
          "কার্নেলের message buffer (হার্ডওয়্যার/সিস্টেম সংক্রান্ত লগ) দেখানোর command",
      },
      {
        token: "| tail",
        meaning: "pipe দিয়ে শুধু সবশেষ কয়েকটা লাইন বের করে আনা",
      },
    ],
    tip: '⚠️ Interview tip: মেমরি শেষ হয়ে গেলে Linux-এর "OOM killer" (Out of Memory killer) নিজে থেকেই কোনো process মেরে ফেলে মেমরি খালি করে — এই ঘটনা dmesg-তে দেখা যায়, আর এটা অনেক production outage-এর আসল কারণ, interview-এ জিজ্ঞেস করা common topic।',
  },
  vmstat: {
    id: "vmstat",
    command: "vmstat 1",
    category: "Performance Monitoring",
    story:
      'একটা গাড়ির dashboard-এ যেমন speed, fuel, engine temperature একসাথে দেখা যায়, "vmstat" ঠিক তেমন একটা dashboard — CPU, মেমরি, আর I/O-এর অবস্থা একসাথে, প্রতি সেকেন্ডে refresh হয়ে দেখায়।',
    tokens: [
      {
        token: "vmstat",
        meaning:
          '"virtual memory statistics" — CPU, memory, swap, I/O-এর সার্বিক অবস্থা দেখানোর command',
      },
      { token: "1", meaning: "প্রতি ১ সেকেন্ডে নতুন করে refresh করো" },
    ],
    tip: '💡 Tip: "wa" (I/O wait) কলাম বেশি হলে disk বা network bottleneck সন্দেহ করতে হবে। "si/so" (swap in/out) শূন্যের বেশি হলে মানে RAM কম পড়ছে, system swap করছে — এটা performance-এর জন্য খুব খারাপ লক্ষণ।',
  },
  mpstat: {
    id: "mpstat",
    command: "mpstat -P ALL 1",
    category: "Performance Monitoring",
    story:
      '"vmstat" যদি পুরো গাড়ির dashboard হয়, "mpstat -P ALL" হচ্ছে প্রতিটা চাকার আলাদা চাপ মাপার যন্ত্র — এটা প্রতিটা CPU core-এর usage আলাদা করে দেখায়, একসাথে মিলিয়ে না।',
    tokens: [
      {
        token: "mpstat",
        meaning:
          '"multi-processor statistics" — প্রতিটা CPU core-এর usage আলাদা করে দেখানোর command',
      },
      {
        token: "-P ALL",
        meaning:
          '"processor" — সব core দেখাও (একটা নির্দিষ্ট core নম্বর দিয়েও শুধু সেটা দেখা যায়)',
      },
      { token: "1", meaning: "প্রতি সেকেন্ডে refresh করো" },
    ],
    tip: "💡 Tip: একটা মাত্র core 100% ব্যস্ত কিন্তু বাকিগুলো idle থাকলে বোঝা যায় কোনো application single-threaded (একটা মাত্র core ব্যবহার করতে পারে) — multi-core থাকলেও পুরো সুবিধা নিতে পারছে না।",
  },
  pidstat: {
    id: "pidstat",
    command: "pidstat 1",
    category: "Performance Monitoring",
    story:
      '"mpstat" গোটা CPU-র হিসাব দেয়, কিন্তু কোন নির্দিষ্ট process আসল খলনায়ক (culprit) তা জানতে "pidstat" লাগে — এটা প্রতিটা চলমান process কতটুকু CPU খাচ্ছে তা আলাদা করে দেখায়, ঠিক যেন কোন কর্মচারী কত ঘণ্টা কাজ করছে তার আলাদা হিসাব।',
    tokens: [
      {
        token: "pidstat",
        meaning:
          '"process ID statistics" — প্রতিটা process-এর CPU usage আলাদা করে দেখানোর command',
      },
      { token: "1", meaning: "প্রতি সেকেন্ডে refresh করো" },
    ],
    tip: '💡 Tip: output-এ "%CPU" কলাম সবচেয়ে গুরুত্বপূর্ণ — কোন process সবচেয়ে বেশি CPU খাচ্ছে তা এক নজরে বোঝা যায়, দরকার হলে সেটাকে optimize/kill/renice করার সিদ্ধান্ত নেওয়া যায়।',
  },
  iostat: {
    id: "iostat",
    command: "iostat -xz 1",
    category: "Performance Monitoring",
    story:
      'disk কতটা ব্যস্ত, কতটা দ্রুত সাড়া দিচ্ছে — এসব জানতে "iostat" দরকার। এটা disk-এর জন্য একদম vmstat-এর মতোই, কিন্তু আরো বিস্তারিত — প্রতিটা read/write কতক্ষণ সময় নিচ্ছে তাও দেখায়।',
    tokens: [
      {
        token: "iostat",
        meaning:
          '"I/O statistics" — disk-এর read/write কার্যকলাপের বিস্তারিত তথ্য দেখানোর command',
      },
      {
        token: "-x",
        meaning:
          '"extended" — অতিরিক্ত বিস্তারিত কলাম দেখায় (await, queue size ইত্যাদি)',
      },
      {
        token: "-z",
        meaning: '"zero" — একদম idle থাকা disk গুলো output থেকে বাদ দেয়',
      },
      { token: "1", meaning: "প্রতি সেকেন্ডে refresh করো" },
    ],
    tip: '💡 Tip: "%util" কলাম 100%-এর কাছাকাছি হলে disk প্রায় পুরোপুরি ব্যস্ত — এটাই সবচেয়ে সহজ "disk bottleneck আছে কিনা" বোঝার উপায়।',
  },
  "free-m": {
    id: "free-m",
    command: "free -m",
    category: "Performance Monitoring",
    story:
      'ঘরে কতটুকু জায়গা খালি আছে জানতে চাইলে যেমন মেপে দেখা হয়, "free" ঠিক তেমন মেমরি (RAM)-এর হিসাব দেখায় — মোট কতটুকু, কতটুকু ব্যবহার হচ্ছে, কতটুকু খালি।',
    tokens: [
      {
        token: "free",
        meaning: "memory (RAM) আর swap-এর ব্যবহার দেখানোর command",
      },
      {
        token: "-m",
        meaning:
          '"megabytes" — ফলাফল megabyte এককে দেখাও (default byte-এ দেখায়, যা পড়া কঠিন)',
      },
    ],
    tip: '💡 Tip: "free" মেমরি খুব কম দেখালেই ভয় পাওয়ার দরকার নেই — Linux ইচ্ছে করেই খালি মেমরি দিয়ে file cache রাখে, দরকার হলে সাথে সাথে ছেড়ে দেয়। আসল চিন্তার বিষয় "swap" ব্যবহার হচ্ছে কিনা — সেটা RAM কম পড়ার আসল লক্ষণ।',
  },
  "sar-dev": {
    id: "sar-dev",
    command: "sar -n DEV 1",
    category: "Performance Monitoring",
    story:
      'network card কতটা data পাঠাচ্ছে/নিচ্ছে তা জানতে "sar -n DEV" ব্যবহার হয় — ঠিক যেমন একটা রাস্তায় কত গাড়ি যাচ্ছে তার হিসাব রাখা।',
    tokens: [
      {
        token: "sar",
        meaning:
          '"system activity reporter" — বিভিন্ন ধরনের system activity রিপোর্ট করার command',
      },
      {
        token: "-n DEV",
        meaning: '"network, DEVice" — network interface-এর পরিসংখ্যান দেখাও',
      },
      { token: "1", meaning: "প্রতি সেকেন্ডে refresh করো" },
    ],
    tip: '💡 Tip: "rxkB/s" (receive) আর "txkB/s" (transmit) কলাম দেখে বোঝা যায় কতটুকু data আসছে/যাচ্ছে — একটা 1 Gbps নেটওয়ার্কের maximum প্রায় 125,000 KB/s।',
  },
  "sar-tcp": {
    id: "sar-tcp",
    command: "sar -n TCP,ETCP 1",
    category: "Performance Monitoring",
    story:
      'TCP হচ্ছে ইন্টারনেট যোগাযোগের মূল নিয়ম। "sar -n TCP,ETCP" সেই connection গুলো কেমন চলছে তা দেখায় — নতুন connection কত হচ্ছে, কোনো connection বারবার retry (retransmit) করতে হচ্ছে কিনা।',
    tokens: [
      { token: "sar", meaning: "system activity report করার command" },
      {
        token: "-n TCP,ETCP",
        meaning: "TCP connection আর error-সংক্রান্ত পরিসংখ্যান দেখাও",
      },
      { token: "1", meaning: "প্রতি সেকেন্ডে refresh করো" },
    ],
    tip: '⚠️ Interview tip: "retrans/s" (retransmission per second) শূন্যের বেশি মানে network-এ সমস্যা হচ্ছে — packet হারিয়ে যাচ্ছে, তাই আবার পাঠাতে হচ্ছে। এটা network issue বা server overload-এর জোরালো সংকেত।',
  },
  "top-cmd": {
    id: "top-cmd",
    command: "top",
    category: "Performance Monitoring",
    story:
      'এতক্ষণ যা যা আলাদা আলাদা command দিয়ে দেখলে (CPU, memory, process) — "top" সব একসাথে, একটা live টিভি সম্প্রচারের মতো একটামাত্র screen-এ দেখায়, আর real-time-এ আপডেট হতেই থাকে।',
    tokens: [
      {
        token: "top",
        meaning:
          "CPU, memory, আর প্রতিটা process-এর তথ্য একসাথে, live দেখানোর command",
      },
    ],
    tip: '💡 Tip: "top" চলা অবস্থায় "M" চাপলে memory অনুযায়ী sort হয়, "P" চাপলে CPU অনুযায়ী sort হয়, আর "k" চাপলে সরাসরি কোনো process-কে kill করা যায় — সব একটা interactive স্ক্রিন থেকেই।',
  },
  "stress-ng": {
    id: "stress-ng",
    command: "stress-ng --cpu $(nproc) --timeout 300s --metrics-brief",
    category: "Performance Monitoring",
    story:
      'একটা নতুন গাড়ি কেনার আগে যেমন test-drive করে দেখা হয় সর্বোচ্চ গতিতে কেমন চলে, "stress-ng" ঠিক সেই test-drive — ইচ্ছাকৃতভাবে CPU, memory, disk, বা network-কে চরম চাপে ফেলে দেখা হয় সিস্টেম কেমন সামলায়।',
    tokens: [
      {
        token: "stress-ng",
        meaning: "CPU/memory/disk/network-এ কৃত্রিম চাপ তৈরি করার টুল",
      },
      {
        token: "--cpu $(nproc)",
        meaning:
          '"$(nproc)" মানে এই মেশিনের CPU core সংখ্যা জেনে নাও, আর ততগুলো CPU-হগিং process চালাও',
      },
      {
        token: "--vm 1 --vm-bytes 80%",
        meaning: "(memory টেস্ট) মেমরির 80% দখল করে রাখা এমন 1টা process চালাও",
      },
      {
        token: "--io 4",
        meaning:
          "(disk টেস্ট) disk-এ লাগাতার read/write করা এমন 4টা process চালাও",
      },
      {
        token: "--sock 10",
        meaning: "(network টেস্ট) 10টা socket connection খুলে রাখো",
      },
      {
        token: "--timeout 300s",
        meaning: "কতক্ষণ এই চাপ চালিয়ে যাবে (সেকেন্ডে)",
      },
    ],
    tip: '⚠️ Interview tip: মেমরি 95%+ দখল হয়ে গেলে Linux-এর "OOM killer" স্বয়ংক্রিয়ভাবে কোনো process মেরে ফেলে মেমরি খালি করে দেয় (dmesg-এ এই ঘটনা দেখা যায়) — stress-ng দিয়ে এটা নিরাপদে, নিয়ন্ত্রিতভাবে দেখে শেখা যায়, production-এ হঠাৎ এই অবস্থায় পড়ার আগেই।',
  },
  iotop: {
    id: "iotop",
    command: "sudo apt install iotop && iotop",
    category: "Performance Monitoring",
    story:
      '"iostat" গোটা disk-এর হিসাব দেয়, কিন্তু কোন নির্দিষ্ট process disk-কে সবচেয়ে বেশি ব্যস্ত রাখছে তা জানতে "iotop" লাগে — অনেকটা "top" কমান্ডেরই, কিন্তু CPU-এর বদলে disk I/O-র জন্য।',
    tokens: [
      {
        token: "sudo apt install iotop",
        meaning: "প্রথমে টুলটা install করে নাও",
      },
      {
        token: "iotop",
        meaning:
          "প্রতিটা process কতটুকু disk I/O করছে তা live দেখানোর command (top-এর মতোই ইন্টারফেস)",
      },
    ],
    tip: '💡 Tip: "iostat" বলে "disk ব্যস্ত", "iotop" বলে "ঠিক কোন process disk-কে ব্যস্ত রাখছে" — দুটো একসাথে ব্যবহার করলে পুরো ছবিটা (কী হচ্ছে + কেন হচ্ছে) বোঝা যায়।',
  },
  iftop: {
    id: "iftop",
    command: "sudo apt install iftop && iftop",
    category: "Performance Monitoring",
    story:
      '"sar -n DEV" সার্বিক network সংখ্যা দেয়, কিন্তু কোন connection সবচেয়ে বেশি bandwidth খাচ্ছে তা দেখতে "iftop" লাগে — একটা live, visual bandwidth monitor।',
    tokens: [
      {
        token: "sudo apt install iftop",
        meaning: "প্রথমে টুলটা install করে নাও",
      },
      {
        token: "iftop",
        meaning:
          "কোন connection কতটুকু bandwidth ব্যবহার করছে তা live, গ্রাফিক্যালভাবে দেখানোর command",
      },
    ],
    tip: '💡 Tip: "iftop" root privilege ছাড়া সাধারণত network interface-এর raw ট্রাফিক দেখতে পারে না, তাই প্রায়ই "sudo iftop" লিখতে হয়।',
  },
  iperf3: {
    id: "iperf3",
    command: "iperf3 -s -p 5001",
    category: "Performance Monitoring",
    story:
      'দুইটা সার্ভারের মধ্যে network কতটা দ্রুত data পাঠাতে পারে তা মাপার জন্য "iperf3" ব্যবহার হয় — একপাশে একটা "server" মোডে অপেক্ষা করে, অন্যপাশ থেকে "client" মোডে data পাঠিয়ে speed test করা হয়, ঠিক যেমন ইন্টারনেট speed test করা হয়।',
    tokens: [
      {
        token: "iperf3",
        meaning: "দুই পয়েন্টের মধ্যে network bandwidth মাপার টুল",
      },
      {
        token: "-s",
        meaning: '"server" মোডে চালাও, অপেক্ষা করো connection-এর জন্য',
      },
      { token: "-p 5001", meaning: '"port" — কোন port-এ শুনবে' },
    ],
    tip: '💡 Tip: client পাশে চালাতে হয় "iperf3 -c <server> -p 5001 -t 300 -P 4" — "-c" মানে client মোড, "-t" কতক্ষণ টেস্ট চলবে, "-P 4" মানে একসাথে ৪টা parallel connection দিয়ে টেস্ট করা (বেশি সঠিক ফলাফলের জন্য)।',
  },
  "ss-tuln": {
    id: "ss-tuln",
    command: "ss -tuln",
    category: "Performance Monitoring",
    story:
      'কোন কোন দরজা (port) এখন "খোলা" আছে, কোনো service listen করছে — তা একনজরে দেখতে "ss" ব্যবহার হয়। ঠিক যেমন একটা বাড়ির সব দরজা-জানালা চেক করে দেখা কোনগুলো খোলা।',
    tokens: [
      {
        token: "ss",
        meaning:
          '"socket statistics" — network socket (connection/listening port)-এর তথ্য দেখানোর command',
      },
      { token: "-t", meaning: "TCP socket দেখাও" },
      { token: "-u", meaning: "UDP socket দেখাও" },
      {
        token: "-l",
        meaning:
          '"listening" — শুধু যেগুলো connection-এর জন্য অপেক্ষা করছে সেগুলো দেখাও',
      },
      {
        token: "-n",
        meaning:
          '"numeric" — IP/port নম্বর সরাসরি দেখাও, নাম (DNS lookup) খুঁজতে সময় নষ্ট না করে',
      },
    ],
    tip: "💡 Tip: এই command দিয়ে দ্রুত চেক করা যায় কোন কোন service চালু আছে (যেমন port 22-এ SSH, 8080-এ web app) — troubleshooting-এর প্রথম ধাপ হিসেবে খুবই common।",
  },
  "watch-cmd": {
    id: "watch-cmd",
    command: "watch -n 1 'uptime; echo \"---\"; vmstat 1 1'",
    category: "Performance Monitoring",
    story:
      'একটা command বারবার হাতে চালানোর বদলে, "watch" সেটা স্বয়ংক্রিয়ভাবে নির্দিষ্ট বিরতিতে repeat করে চালিয়ে যায় — ঠিক যেন একটা live CCTV ফিড, যা নিজে থেকেই refresh হতে থাকে।',
    tokens: [
      {
        token: "watch",
        meaning:
          "একটা command বারবার, নির্দিষ্ট সময় পরপর চালিয়ে live দেখানোর command",
      },
      { token: "-n 1", meaning: "প্রতি ১ সেকেন্ড পরপর আবার চালাও" },
      {
        token: "'uptime; ...; vmstat 1 1'",
        meaning:
          "quote-এর ভেতরে একাধিক command সেমিকোলন (;) দিয়ে আলাদা করে একসাথে চালানো যায়",
      },
    ],
    tip: '💡 Tip: যেকোনো command-এর আগে "watch -n 1" বসিয়ে দিলেই সেটা live monitoring dashboard-এর মতো হয়ে যায় — এক-বারের (one-shot) command-কেও এভাবে live করে ফেলা যায়।',
  },

  // ---- Lab 9: System Logging and Monitoring ----
  "ls-lh": {
    id: "ls-lh",
    command: "ls -lh /var/log/",
    category: "Logging & Monitoring",
    story:
      'ফাইলের size যখন লক্ষ লক্ষ byte হয়ে যায়, সংখ্যাটা পড়তে কষ্ট হয় (যেমন 104857600)। "-h" (human-readable) দিলে সেটা মানুষের বোঝার মতো করে দেখায় (যেমন 100M)।',
    tokens: [
      { token: "ls", meaning: "list করার command" },
      { token: "-l", meaning: "long format — বিস্তারিত তথ্য" },
      {
        token: "-h",
        meaning: '"human-readable" — ফাইল সাইজ KB/MB/GB-তে সহজপাঠ্য করে দেখায়',
      },
      { token: "/var/log/", meaning: "কোন folder দেখতে চাও" },
    ],
    tip: '💡 Tip: "-h" flag শুধু "ls"-এ না, "du" (disk usage) আর "df" (disk free)-তেও কাজ করে — এই তিনটাতেই সাইজ human-readable করতে "-h" যোগ করো।',
  },
  "find-type-log": {
    id: "find-type-log",
    command: 'sudo find /var/log -type f -name "*.log" 2>/dev/null',
    category: "Logging & Monitoring",
    story:
      "/var/log-এর ভেতরে অনেক subfolder, binary file, সব মিলিয়ে বিশাল জগাখিচুড়ি থাকতে পারে। এই command শুধু আসল .log এক্সটেনশনের টেক্সট ফাইলগুলো, যেকোনো গভীরতায় থাকুক না কেন, খুঁজে বের করে আনে।",
    tokens: [
      {
        token: "sudo",
        meaning: "root-এর ক্ষমতা ধার করা (কিছু log folder root-only হতে পারে)",
      },
      { token: "find", meaning: "খোঁজার command" },
      { token: "/var/log", meaning: "কোথা থেকে খোঁজা শুরু হবে" },
      { token: "-type f", meaning: "শুধু file (folder না)" },
      { token: '-name "*.log"', meaning: '".log" দিয়ে শেষ হওয়া নামের ফাইল' },
      {
        token: "2>/dev/null",
        meaning:
          '"2" মানে error message (stderr); সেগুলো "/dev/null"-এ (একটা "ব্ল্যাকহোল") পাঠিয়ে দেওয়া হচ্ছে, যাতে permission-denied এর মতো অপ্রয়োজনীয় error স্ক্রিনে না দেখায়',
      },
    ],
    tip: '💡 Tip: "2>/dev/null" একটা খুবই common pattern — কমান্ডের আসল output (stdout) স্ক্রিনে রেখে, শুধু error (stderr) গুলো লুকিয়ে ফেলা। "1" হলো stdout, "2" হলো stderr।',
  },
  "tee-heredoc": {
    id: "tee-heredoc",
    command:
      "sudo tee /var/log/apptrack/apptrack.log > /dev/null << 'EOF' ... EOF",
    category: "Logging & Monitoring",
    story:
      'একলাইনের লেখা না, অনেকগুলো লাইনের একটা পুরো ফাইল একসাথে তৈরি করতে চাইলে বারবার echo লেখা কষ্টকর। "heredoc" (<< \'EOF\' ... EOF) দিয়ে তুমি একসাথে অনেকগুলো লাইন একটা block হিসেবে দিতে পারো, যা "EOF" না আসা পর্যন্ত একটা একক ইনপুট হিসেবে ধরা হয়।',
    tokens: [
      {
        token: "sudo tee /var/log/apptrack/apptrack.log",
        meaning: "root ক্ষমতায়, এই ফাইলে লেখো",
      },
      {
        token: "> /dev/null",
        meaning:
          "tee normally স্ক্রিনেও echo করে দেখায়; সেটা না দেখাতে চাইলে সেই output /dev/null-এ ফেলে দেওয়া হচ্ছে",
      },
      {
        token: "<< 'EOF' ... EOF",
        meaning:
          '"heredoc" syntax — শুরুর "EOF" থেকে শেষের "EOF" পর্যন্ত যা কিছু লেখা, সবটাই একসাথে input হিসেবে পাঠানো হবে',
      },
    ],
    tip: "💡 Tip: 'EOF' নামটা বিশেষ কিছু না, এটা শুধু একটা marker — চাইলে অন্য যেকোনো শব্দ ব্যবহার করা যায়, শুধু শুরু আর শেষে একই শব্দ মিলতে হবে।",
  },
  "wc-l": {
    id: "wc-l",
    command: "wc -l /var/log/apptrack/apptrack.log",
    category: "Logging & Monitoring",
    story:
      'একটা ফাইলে মোট কত লাইন আছে তা গুনতে "wc -l" ব্যবহার হয় — ঠিক যেমন একটা বইয়ের মোট পাতা গোনা।',
    tokens: [
      {
        token: "wc",
        meaning:
          '"word count" — ফাইলের word/line/character সংখ্যা গোনার command',
      },
      { token: "-l", meaning: '"lines" — শুধু লাইন সংখ্যা গোনো' },
      { token: "/var/log/apptrack/apptrack.log", meaning: "কোন ফাইল গোনা হবে" },
    ],
    tip: '💡 Tip: "-l" ছাড়া শুধু "wc" চালালে তিনটা সংখ্যা দেখাবে — লাইন, word, আর character সংখ্যা, একসাথে।',
  },
  "tail-n": {
    id: "tail-n",
    command: "tail -15 /var/log/apptrack/apptrack.log",
    category: "Logging & Monitoring",
    story:
      'একটা বিশাল log file-এর একদম শেষে, সবচেয়ে সাম্প্রতিক ঘটনাগুলো থাকে — যেখানে crash হয়েছিল। পুরো ফাইল না পড়ে, "tail" দিয়ে সরাসরি শেষের কয়েক লাইন দেখা যায়।',
    tokens: [
      { token: "tail", meaning: "ফাইলের শেষের অংশ দেখানোর command" },
      { token: "-15", meaning: "শেষের ঠিক কতটা লাইন দেখাতে হবে" },
      { token: "/var/log/apptrack/apptrack.log", meaning: "কোন ফাইল" },
    ],
    tip: '💡 Tip: "tail"-এর বিপরীত হলো "head" — সেটা ফাইলের শুরুর লাইন দেখায়। দুটোই একই রকম "-n" ফ্ল্যাগ নেয় কত লাইন চাও তা বলতে।',
  },
  "tail-f": {
    id: "tail-f",
    command: "tail -f /var/log/apptrack/apptrack.log",
    category: "Logging & Monitoring",
    story:
      'এতক্ষণ যা শিখলে সব "অতীত" দেখার জন্য — কিন্তু একটা live সার্ভারের log ঠিক এখন কী লিখছে তা দেখতে চাইলে? "-f" (follow) দিলে terminal ফাইলের শেষে বসে অপেক্ষা করে, নতুন কোনো লাইন লেখা হলেই সাথে সাথে স্ক্রিনে দেখায়।',
    tokens: [
      { token: "tail", meaning: "ফাইলের শেষের অংশ দেখানোর command" },
      {
        token: "-f",
        meaning:
          '"follow" — ফাইল খোলা রেখে, নতুন লেখা হওয়া লাইন সাথে সাথে দেখাতে থাকে',
      },
      {
        token: "/var/log/apptrack/apptrack.log",
        meaning: "কোন ফাইল live দেখা হবে",
      },
    ],
    tip: '💡 Tip: "tail -f" থেকে বের হতে "Ctrl+C" চাপতে হয় — nginx, postgres, নিজের application — যেকোনো লাইভ log দেখার standard উপায় এটা।',
  },
  "grep-basic": {
    id: "grep-basic",
    command: 'grep "ERROR" /var/log/apptrack/apptrack.log',
    category: "Search",
    story:
      'হাজার লাইনের একটা ফাইলে শুধু "ERROR" লেখা লাইনগুলোই খুঁজে বের করতে চাও — পুরো ফাইল চোখ দিয়ে স্ক্যান না করে, "grep" সেই কাজটা মুহূর্তে করে দেয়।',
    tokens: [
      { token: "grep", meaning: "text pattern খোঁজার command" },
      { token: '"ERROR"', meaning: "কোন শব্দ/pattern খোঁজা হচ্ছে" },
      {
        token: "/var/log/apptrack/apptrack.log",
        meaning: "কোন ফাইলে খোঁজা হবে",
      },
    ],
    tip: "💡 Tip: এটা grep-এর সবচেয়ে basic ব্যবহার — শুধু একটা শব্দ, একটা ফাইলে। grep-কে -B/-A/-i/-c-এর মতো flag দিয়ে আরো শক্তিশালী বানানো যায়।",
  },
  "grep-BA": {
    id: "grep-BA",
    command: 'grep -B 3 -A 2 "CRITICAL" /var/log/apptrack/apptrack.log',
    category: "Search",
    story:
      "একটা error খুঁজে পেলেই যথেষ্ট না, জানতে হয় তার ঠিক আগে-পরে কী ঘটেছিল — ঠিক যেমন accident-এর CCTV ফুটেজে শুধু accident-এর মুহূর্ত না, তার আগে-পরের কয়েক সেকেন্ডও দেখা হয়।",
    tokens: [
      { token: "grep", meaning: "pattern খোঁজার command" },
      {
        token: "-B 3",
        meaning: '"Before" — match হওয়া লাইনের আগের ৩ লাইনও দেখাও',
      },
      {
        token: "-A 2",
        meaning: '"After" — match হওয়া লাইনের পরের ২ লাইনও দেখাও',
      },
      { token: '"CRITICAL"', meaning: "কোন শব্দ খোঁজা হচ্ছে" },
    ],
    tip: '💡 Tip: আগে-পরে সমান লাইন চাইলে "-C" (Context) ব্যবহার করা যায় — "-C 3" মানে দুই দিকেই ৩ লাইন করে, "-B"/"-A" আলাদা লেখার বদলে।',
  },
  "grep-i": {
    id: "grep-i",
    command: 'grep -i "memory" /var/log/apptrack/apptrack.log',
    category: "Search",
    story:
      'কেউ লিখেছে "Memory", কেউ "MEMORY", কেউ "memory" — বানান একই, শুধু ছোট-বড় হাতের অক্ষরে পার্থক্য। "-i" দিলে grep এই পার্থক্য উপেক্ষা করে সবগুলোই ধরে ফেলে।',
    tokens: [
      { token: "grep", meaning: "pattern খোঁজার command" },
      {
        token: "-i",
        meaning: '"ignore case" — ছোট-বড় হাতের অক্ষরের পার্থক্য উপেক্ষা করো',
      },
      {
        token: '"memory"',
        meaning: "কোন শব্দ খোঁজা হচ্ছে (যেকোনো capitalization-এ)",
      },
    ],
    tip: '💡 Tip: বিভিন্ন service-এর log বিভিন্ন capitalization convention ব্যবহার করতে পারে — তাই search-এর শুরুতেই "-i" ব্যবহার করা ভালো অভ্যাস, নাহলে অনেক match miss হয়ে যেতে পারে।',
  },
  "grep-c": {
    id: "grep-c",
    command: 'grep -c "ERROR" /var/log/apptrack/apptrack.log',
    category: "Search",
    story:
      'কতগুলো error হয়েছে তা জানতে চাইলে, প্রতিটা লাইন দেখে গোনার দরকার নাই — "-c" দিলে grep নিজেই গুনে একটা সংখ্যা বলে দেয়, কোনো লাইন না দেখিয়েই।',
    tokens: [
      { token: "grep", meaning: "pattern খোঁজার command" },
      {
        token: "-c",
        meaning:
          '"count" — matching লাইন না দেখিয়ে, শুধু কয়টা লাইন match করলো তার সংখ্যা দেখাও',
      },
      { token: '"ERROR"', meaning: "কোন শব্দ গোনা হচ্ছে" },
    ],
    tip: '💡 Tip: কোনো incident-এর severity দ্রুত আন্দাজ করার ভালো উপায় হলো "grep -c" দিয়ে ERROR/CRITICAL কতগুলো হয়েছে তা এক নজরে গুনে ফেলা।',
  },
  "journalctl-n": {
    id: "journalctl-n",
    command: "sudo journalctl -n 30",
    category: "Logging & Monitoring",
    story:
      'একটা application-এর log আলাদা ফাইলে থাকে, কিন্তু পুরো সিস্টেমে চলা সব service-এর, এমনকি kernel-এর ঘটনাও একসাথে রাখা হয় একটা কেন্দ্রীয় জায়গায় — journal। "journalctl" সেই journal পড়ার command, আর "-n 30" দিয়ে সবশেষ ৩০টা ঘটনা দেখা হয়।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      {
        token: "journalctl",
        meaning:
          "systemd journal (পুরো সিস্টেমের কেন্দ্রীয় log) পড়ার command",
      },
      { token: "-n 30", meaning: '"number" — সবশেষ ৩০টা entry দেখাও' },
    ],
    tip: '💡 Tip: "/var/log/" ফাইলগুলো আলাদা আলাদা application-ভিত্তিক, কিন্তু "journalctl" একটামাত্র জায়গা থেকে পুরো সিস্টেমের সব ঘটনা একসাথে দেখায় — troubleshooting-এর সময় এটা bird\'s-eye view দেয়।',
  },
  "journalctl-t": {
    id: "journalctl-t",
    command: "sudo journalctl -t apptrack",
    category: "Logging & Monitoring",
    story:
      'পুরো journal-এ হাজারো service-এর মিশ্রিত বার্তার মধ্যে থেকে শুধু একটা নির্দিষ্ট application-এর ("apptrack") বার্তাগুলোই আলাদা করে দেখতে চাইলে "-t" (tag) দিয়ে filter করা হয়।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "journalctl", meaning: "systemd journal পড়ার command" },
      {
        token: "-t apptrack",
        meaning: '"tag" — শুধু "apptrack" নামে ট্যাগ করা বার্তাগুলোই দেখাও',
      },
    ],
    tip: '💡 Tip: কোনো script "logger -t <nametag>" দিয়ে message পাঠালে, সেই একই ট্যাগ পরে "journalctl -t <nametag>" দিয়ে ফিল্টার করে বের করা যায়।',
  },
  "journalctl-since": {
    id: "journalctl-since",
    command: 'sudo journalctl --since "5 minutes ago"',
    category: "Logging & Monitoring",
    story:
      'পুরো journal history-র বদলে শুধু একটা নির্দিষ্ট সময়ের জানালা (window) দিয়ে দেখতে চাইলে "--since" ব্যবহার হয় — "গত ৫ মিনিটে কী কী ঘটেছে?" জিজ্ঞেস করার মতো।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "journalctl", meaning: "systemd journal পড়ার command" },
      {
        token: '--since "5 minutes ago"',
        meaning:
          "কত সময় আগে থেকে দেখতে চাও — relative (5 minutes ago, yesterday) বা absolute (2026-03-11 14:00:00) দুইভাবেই লেখা যায়",
      },
    ],
    tip: '💡 Tip: "--since"-এর সাথে "--until" ব্যবহার করে একটা নির্দিষ্ট সময়সীমা বেঁধে দেওয়া যায় — "incident ঠিক কখন শুরু হয়েছিল সেই সময়ে কী ঘটেছিল" খুঁজতে।',
  },
  "journalctl-p": {
    id: "journalctl-p",
    command: "sudo journalctl -p err",
    category: "Logging & Monitoring",
    story:
      'journal-এ info থেকে emergency পর্যন্ত বিভিন্ন গুরুত্বের (priority) বার্তা মিশে থাকে। incident পোস্টমর্টেমে শুধু "যা আসলেই ভাঙছিল" সেগুলো চাও, routine info বার্তা না — "-p err" দিয়ে শুধু error-এর সমান বা তার চেয়ে গুরুতর বার্তা ফিল্টার করা যায়।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "journalctl", meaning: "systemd journal পড়ার command" },
      {
        token: "-p err",
        meaning:
          '"priority" — শুধু "err" লেভেল আর তার চেয়ে গুরুতর (crit, alert, emerg) বার্তা দেখাও',
      },
    ],
    tip: '💡 Tip: priority একটা scale (0 সবচেয়ে গুরুতর emerg, 7 সবচেয়ে কম গুরুত্বপূর্ণ debug) — "-p err" মানে err(3) আর তার চেয়ে বেশি গুরুতর সবগুলো দেখাও, কম গুরুতরগুলো (info/debug) বাদ।',
  },
  "journalctl-f": {
    id: "journalctl-f",
    command: "sudo journalctl -f",
    category: "Logging & Monitoring",
    story:
      '"tail -f" যেমন একটা নির্দিষ্ট ফাইল live দেখায়, "journalctl -f" ঠিক তেমন পুরো সিস্টেমের journal live দেখায় — যেকোনো নতুন ঘটনা ঘটলেই সাথে সাথে স্ক্রিনে চলে আসে।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "journalctl", meaning: "systemd journal পড়ার command" },
      {
        token: "-f",
        meaning: '"follow" — নতুন entry আসলেই সাথে সাথে live দেখাতে থাকে',
      },
    ],
    tip: '💡 Tip: "tail -f" একটা নির্দিষ্ট ফাইল অনুসরণ করে, "journalctl -f" পুরো সিস্টেমের journal অনুসরণ করে — "journalctl -f -t apptrack" দিয়ে live + নির্দিষ্ট ট্যাগ একসাথে combine করা যায়।',
  },
  "journalctl-disk-usage": {
    id: "journalctl-disk-usage",
    command: "sudo journalctl --disk-usage",
    category: "Logging & Monitoring",
    story:
      'journal চিরকাল বাড়তেই থাকলে একদিন পুরো disk ভরে যাবে। "--disk-usage" জানিয়ে দেয় journal এখন ঠিক কতটুকু জায়গা দখল করে আছে, যাতে সময়মতো retention/limit ঠিক করা যায়।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      {
        token: "journalctl",
        meaning: "systemd journal পড়ার/পরিচালনার command",
      },
      {
        token: "--disk-usage",
        meaning: "journal এখন ডিস্কের কতটুকু জায়গা নিয়ে আছে তা দেখায়",
      },
    ],
    tip: "💡 Tip: ব্যস্ত production সার্ভারে journal উল্লেখযোগ্য জায়গা নিতে পারে — এই সংখ্যা নিয়মিত চেক করা disk পরিকল্পনা আর retention limit ঠিক করার জন্য জরুরি।",
  },
  "logger-cmd": {
    id: "logger-cmd",
    command:
      'sudo logger -t apptrack -p daemon.err "AppTrack service crashed — exit code 137 (OOM kill)"',
    category: "Logging & Monitoring",
    story:
      'তোমার নিজের script বা application যদি সরাসরি journal-এ কোনো বার্তা পাঠাতে চায় (ধরো, একটা backup script শেষ হলে "সফল হয়েছে" লিখে রাখতে চায়), "logger" সেই দরজা — command line থেকেই system log-এ একটা entry পাঠানো যায়।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      {
        token: "logger",
        meaning:
          "command line থেকে সরাসরি system journal/syslog-এ একটা বার্তা পাঠানোর command",
      },
      {
        token: "-t apptrack",
        meaning:
          '"tag" — এই বার্তাটা কার পক্ষ থেকে আসছে তার একটা নাম/লেবেল লাগানো',
      },
      {
        token: "-p daemon.err",
        meaning:
          '"priority" — facility.level ফরম্যাটে গুরুত্ব বলে দেওয়া (daemon = কোন ধরনের প্রোগ্রাম, err = কতটা গুরুতর)',
      },
      { token: '"AppTrack service crashed..."', meaning: "আসল বার্তার লেখা" },
    ],
    tip: '💡 Tip: "logger" শেল script-এ খুবই কাজের — backup/cron script চলার পর তার status "logger" দিয়ে system log-এ পাঠিয়ে রাখলে, পরে "journalctl -t <tag>" দিয়ে তার পুরো ইতিহাস দেখা যায়।',
  },
  "logrotate-debug": {
    id: "logrotate-debug",
    command: "sudo logrotate --debug /etc/logrotate.d/apptrack",
    category: "Logging & Monitoring",
    story:
      'একটা নতুন rotation config বানানোর পর, সেটা সত্যিই চালানোর আগে একবার "dry run" করে নিশ্চিত হওয়া ভালো — "--debug" ঠিক সেই নিরাপদ পরীক্ষা, কোনো ফাইল না ছুঁয়েই।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      {
        token: "logrotate",
        meaning:
          "log file নির্দিষ্ট সময়ে rotate (archive করে নতুন করে শুরু) করার টুল",
      },
      {
        token: "--debug",
        meaning: '"dry run" মোড — আসলে কিছু না করে, শুধু কী করা হতো তা দেখায়',
      },
      {
        token: "/etc/logrotate.d/apptrack",
        meaning: "কোন config ফাইল টেস্ট করা হচ্ছে",
      },
    ],
    tip: '💡 Tip: "log does not need rotating" দেখলে ঘাবড়ানোর দরকার নেই — মানে log সম্প্রতিই rotate হয়েছে (বা এইমাত্র তৈরি)। জোর করে rotate করতে "--force" লাগে।',
  },
  "logrotate-force": {
    id: "logrotate-force",
    command: "sudo logrotate --force /etc/logrotate.d/apptrack",
    category: "Logging & Monitoring",
    story:
      'সাধারণত logrotate নিজের সময়সূচি (daily/weekly) মেনে চলে, কিন্তু তুমি এখনই পরীক্ষা করে দেখতে চাও rotation ঠিকমতো কাজ করে কিনা — "--force" দিয়ে schedule উপেক্ষা করে এক্ষুনি rotation ঘটানো যায়।',
    tokens: [
      { token: "sudo", meaning: "root-এর ক্ষমতা ধার করা" },
      { token: "logrotate", meaning: "log rotation টুল" },
      {
        token: "--force",
        meaning: "সময়সূচি উপেক্ষা করে, এখনই জোর করে rotation ঘটাও",
      },
      {
        token: "/etc/logrotate.d/apptrack",
        meaning: "কোন config অনুযায়ী rotate হবে",
      },
    ],
    tip: '💡 Tip: rotate হওয়ার পর পুরনো log আর্কাইভ হয়ে যায় (যেমন "apptrack.log.1" বা compress হলে "apptrack.log.1.gz"), আর "apptrack.log" নামে একটা নতুন খালি ফাইল তৈরি হয় — এভাবে log ফাইল কখনো অসীম বড় হয়ে ডিস্ক ভরে ফেলে না।',
  },
  "sdn-control-data-plane": {
    id: "sdn-control-data-plane",
    command: "Control Plane বনাম Data Plane",
    category: "Software-Defined Networking",
    story:
      "ধরো একটা restaurant — Data Plane হলো ওয়েটার, যে শুধু অর্ডার অনুযায়ী খাবার টেবিলে পৌঁছে দেয় (packet forward করে), নিজে কোনো সিদ্ধান্ত নেয় না। আর Control Plane হলো manager/head chef, যে ঠিক করে কোন অর্ডার কীভাবে handle হবে। Traditional network-এ প্রতিটা switch/router নিজেই দুটো কাজ একসাথে করে (নিজের মধ্যে ওয়েটার আর manager দুটোই)। SDN এই দুটোকে আলাদা করে ফেলে — একটা central controller-ই পুরো network-এর জন্য manager হয়ে যায়, আর switch-গুলো শুধু ওয়েটারের কাজ (data forward) করে।",
    tokens: [
      {
        token: "Data Plane",
        meaning:
          "আসল packet forward করার কাজ — কে কোথায় পাঠানো হবে সেটা execute করে, decide করে না",
      },
      {
        token: "Control Plane",
        meaning:
          "সিদ্ধান্ত নেওয়ার জায়গা — কোন packet কোথায় যাবে, কোন rule apply হবে, সেটা ঠিক করে",
      },
    ],
    tip: "💡 Traditional network-এ control plane প্রতিটা device-এ আলাদা আলাদা থাকে (distributed), SDN-এ এটা centralize হয়ে যায় — এই centralization-ই SDN-এর মূল ধারণা।",
  },
  "sdn-packet-in-flow-mod": {
    id: "sdn-packet-in-flow-mod",
    command: "packet-in → controller decision → flow-mod",
    category: "Software-Defined Networking",
    story:
      "একটা নতুন ধরনের packet switch-এ এলে, আর switch-এর flow table-এ তার জন্য কোনো rule না থাকলে, switch নিজে কিছু না ভেবে controller-কে জিজ্ঞেস করে — এটাকে বলে 'packet-in message', অনেকটা নতুন কর্মচারী কোনো অপরিচিত situation-এ supervisor-কে ফোন করার মতো। Controller তখন ঠিক করে দেয় কী করতে হবে, আর সেই সিদ্ধান্তটা 'flow-mod message' আকারে switch-এ পাঠিয়ে দেয় — পরের বার একই ধরনের packet এলে switch নিজেই (controller-কে না জিজ্ঞেস করেই) সেই rule মনে রেখে কাজ করতে পারে।",
    tokens: [
      {
        token: "packet-in",
        meaning:
          "switch থেকে controller-কে পাঠানো বার্তা — 'এই packet-টার জন্য কোনো rule নেই, কী করবো?'",
      },
      {
        token: "flow-mod",
        meaning:
          "controller থেকে switch-কে পাঠানো বার্তা — নতুন flow rule install করার নির্দেশ",
      },
    ],
    tip: "⚡ একবার flow rule install হয়ে গেলে, সেই একই ধরনের পরবর্তী packet-গুলোর জন্য আর controller-কে জিজ্ঞেস করতে হয় না — এটাই performance-এর জন্য গুরুত্বপূর্ণ, প্রতিটা packet-এর জন্য controller-কে জিজ্ঞেস করলে পুরো network ধীর হয়ে যেত।",
  },
  "sdn-architecture-layers": {
    id: "sdn-architecture-layers",
    command: "Application → Control → Infrastructure (SDN-এর ৩টা layer)",
    category: "Software-Defined Networking",
    story:
      "SDN architecture-কে একটা company-র organizational structure হিসেবে ভাবা যায়। সবচেয়ে উপরে Application layer — এগুলো হলো বিভিন্ন policy/feature (যেমন firewall, load balancer), অনেকটা company-র বিভিন্ন department-এর মতো যারা নিজেদের চাহিদা জানায়। মাঝখানে Control layer — এখানে SDN Controller (যেমন OpenDaylight, Ryu, ONOS) বসে, এটাই পুরো company-র central management, যে পুরো network-এর global view রাখে আর সিদ্ধান্ত নেয়। সবচেয়ে নিচে Infrastructure layer — আসল OpenFlow-enabled switch-গুলো, যারা শুধু controller-এর নির্দেশ অনুযায়ী কাজ execute করে, অনেকটা ground-level কর্মীদের মতো।",
    tokens: [
      {
        token: "Application Layer",
        meaning:
          "নেটওয়ার্ক policy/feature তৈরি করার জায়গা (firewall, load balancing ইত্যাদি)",
      },
      {
        token: "Control Layer",
        meaning:
          "SDN Controller — পুরো network-এর centralized সিদ্ধান্ত-গ্রহণকারী",
      },
      {
        token: "Infrastructure Layer",
        meaning:
          "আসল OpenFlow switch/router — controller-এর নির্দেশ execute করে",
      },
    ],
  },
  "flowcfg-apt-install-mininet": {
    id: "flowcfg-apt-install-mininet",
    command: "sudo apt-get update && sudo apt-get install mininet",
    category: "Software-Defined Networking",
    story:
      "ধরো তুমি নতুন একটা app phone-এ install করার আগে app store-টা refresh (update) করো, যাতে latest version দেখা যায় — তারপর app-টা install করো। `apt-get update` ঠিক সেই refresh-টা করে (package list নতুন করে আনে), আর `apt-get install mininet` সেই নির্দিষ্ট tool-টা (Mininet) আসলে নামিয়ে বসিয়ে দেয়।",
    tokens: [
      {
        token: "sudo",
        meaning: "administrator (root) হিসেবে command চালানোর অনুমতি",
      },
      {
        token: "apt-get update",
        meaning:
          "system-এর package list (কোন package-এর কোন version পাওয়া যায়) নতুন/latest করে নেয়",
      },
      {
        token: "apt-get install mininet",
        meaning: '"mininet" নামের package/tool download করে install করে',
      },
    ],
    tip: "Ubuntu/Debian-based system-এ apt-get দিয়ে package manage হয়; install শেষ হলে terminal-এ `mn` কমান্ড পাওয়া যাবে।",
  },
  "flowcfg-mn-topo-single3": {
    id: "flowcfg-mn-topo-single3",
    command: "sudo mn --topo=single,3 --controller=none --mac",
    category: "Software-Defined Networking",
    story:
      "কল্পনা করো একটা ক্লাসরুম, যেখানে একটাই central switchboard (switch) আছে আর তার সাথে সরাসরি ৩ জন student (host) বসা। কিন্তু এবার ক্লাসে কোনো শিক্ষক (controller) নেই যে বলে দেবে কে কার সাথে কথা বলতে পারবে — তোমাকে (admin) নিজেই switchboard-এ সব নিয়ম লিখে দিতে হবে।",
    tokens: [
      {
        token: "sudo mn",
        meaning:
          "root privilege নিয়ে Mininet-এর virtual network topology চালু করার মূল command",
      },
      {
        token: "--topo=single,3",
        meaning:
          "একটা মাত্র switch (single) তৈরি হবে, তার সাথে সরাসরি ৩টা host যুক্ত থাকবে",
      },
      {
        token: "--controller=none",
        meaning:
          "কোনো SDN controller connect করা হবে না — flow rule manually দিতে হবে",
      },
      {
        token: "--mac",
        meaning:
          "প্রতিটা host-কে সহজে চেনার জন্য simplified/predictable MAC address assign করে",
      },
    ],
    tip: "⚠️ `--controller=none` দেওয়ার সাথে সাথে switch-এর flow table একদম খালি থাকে — flow rule না বসানো পর্যন্ত কোনো host-ই একে অপরের সাথে কথা বলতে পারবে না।",
  },
  "flowcfg-mn-dump": {
    id: "flowcfg-mn-dump",
    command: "mininet> dump",
    category: "Software-Defined Networking",
    story:
      "স্কুলে roll-call ডাকার মতো — শিক্ষক প্রতিটা student-এর নাম ধরে ডেকে তার অবস্থা (হাজির/অনুপস্থিত, কোথায় বসে আছে) check করে। `dump` কমান্ড ঠিক তেমনি Mininet-এর প্রতিটা node (host, switch)-এর নাম ধরে তার interface, IP, এবং process id-র বিস্তারিত অবস্থা দেখায়।",
    tokens: [
      {
        token: "dump",
        meaning:
          "topology-র সব host আর switch-এর বিস্তারিত status (interface name, IP address, process id) একসাথে দেখায়",
      },
    ],
    tip: "`dump` flow rule বা connectivity দেখায় না — এটা শুধু node গুলোর নিজস্ব অবস্থা দেখায়।",
  },
  "flowcfg-mn-net": {
    id: "flowcfg-mn-net",
    command: "mininet> net",
    category: "Software-Defined Networking",
    story:
      "একটা বিল্ডিংয়ের wiring diagram-এর মতো ভাবো, যেখানে দেখা যায় কোন ঘরের switch কোন ঘরের বাতির সাথে তার দিয়ে যুক্ত। `net` কমান্ড ঠিক সেই wiring diagram-টা দেখায় — কোন host-এর কোন interface, switch-এর কোন port-এর সাথে physically (virtually) যুক্ত।",
    tokens: [
      {
        token: "net",
        meaning:
          "topology-র node গুলোর মধ্যে connection/wiring mapping (কোন interface কার সাথে যুক্ত) দেখায়",
      },
    ],
    tip: "💡 `net`-এর আউটপুট দেখেই বোঝা যায় কোন host কোন switch port (যেমন s1-eth1, s1-eth2) দিয়ে connected — এটা পরে `ovs-ofctl` দিয়ে port-ভিত্তিক rule বসানোর সময় কাজে লাগে।",
  },
  "flowcfg-ovs-ofctl-show": {
    id: "flowcfg-ovs-ofctl-show",
    command: "mininet> sh ovs-ofctl show s1",
    category: "Software-Defined Networking",
    story:
      "ধরো তুমি একটা নতুন কেনা router/machine-এর spec sheet (datapath ID, কয়টা port, কী কী feature সাপোর্ট করে) চেক করছো। `ovs-ofctl show` ঠিক সেই spec sheet-টা দেখায় — switch `s1` আসলে কী করতে পারে।",
    tokens: [
      {
        token: "sh",
        meaning:
          "Mininet CLI থেকে সরাসরি host OS-এর shell command চালানোর জন্য ব্যবহৃত হয়",
      },
      {
        token: "ovs-ofctl",
        meaning:
          "Open vSwitch control করার command-line tool — switch query/manage করতে ব্যবহার হয়",
      },
      {
        token: "show",
        meaning: "switch-এর feature, port list, capability — সব তথ্য দেখায়",
      },
      {
        token: "s1",
        meaning: "যে switch-কে query করা হচ্ছে তার নাম",
      },
    ],
    tip: "আউটপুটে dpid (switch-এর unique ID), n_tables (সর্বোচ্চ flow table সংখ্যা), capabilities, এবং সমর্থিত actions (output, mod_dl_src, mod_nw_src ইত্যাদি)-এর তালিকা দেখা যায়।",
  },
  "flowcfg-ovs-ofctl-add-flow-normal": {
    id: "flowcfg-ovs-ofctl-add-flow-normal",
    command: "mininet> sh ovs-ofctl add-flow s1 action=normal",
    category: "Software-Defined Networking",
    story:
      'ধরো তুমি একটা নতুন কর্মচারীকে (switch) কোনো বিশেষ নির্দেশ না দিয়ে শুধু বলছো "তুমি একজন অভিজ্ঞ পুরনো দারোয়ানের মতোই কাজ করো" — অর্থাৎ MAC address মনে রেখে স্বাভাবিক নিয়মেই packet পাঠাও। `action=normal` ঠিক সেই পুরনো, traditional Ethernet switch-এর মতো আচরণ করতে বলে।',
    tokens: [
      {
        token: "add-flow",
        meaning:
          "switch-এর flow table-এ নতুন একটা rule (match + action) যোগ করার কমান্ড",
      },
      {
        token: "s1",
        meaning: "target switch, যেখানে rule-টা বসবে",
      },
      {
        token: "action=normal",
        meaning:
          "switch-কে বলে দেয় traditional L2 learning switch logic (MAC শিখে forward) ব্যবহার করতে, কোনো custom rule ছাড়াই",
      },
    ],
    tip: '`action=normal` দিলে fine-grained control পাওয়া যায় না — এটা শুধু একটা "default, dumb-switch মতো আচরণ করো" rule।',
  },
  "flowcfg-mn-pingall": {
    id: "flowcfg-mn-pingall",
    command: "mininet> pingall",
    category: "Software-Defined Networking",
    story:
      "অফিসের সবার ফোন লাইন একসাথে টেস্ট করার মতো — প্রত্যেকে প্রত্যেককে কল করে দেখে লাইন ঠিকঠাক কাজ করছে কিনা। `pingall` ঠিক তাই করে — topology-র প্রতিটা host থেকে বাকি সব host-এ ping পাঠিয়ে পুরো নেটওয়ার্কের connectivity একবারে test করে।",
    tokens: [
      {
        token: "pingall",
        meaning:
          "সব host-থেকে-সব host-এ ping পাঠিয়ে সম্পূর্ণ network connectivity একসাথে verify করে",
      },
    ],
    tip: "⚠️ flow rule না থাকলে (বা ভুল in_port/action দিলে) `pingall`-এর কোনো pair-ই সফল হবে না, যদিও physical wiring একদম ঠিক থাকে — এটাই data plane আর control plane আলাদা থাকার সবচেয়ে ভালো প্রমাণ।",
  },
  "flowcfg-ovs-ofctl-dump-flows": {
    id: "flowcfg-ovs-ofctl-dump-flows",
    command: "mininet> sh ovs-ofctl dump-flows s1",
    category: "Software-Defined Networking",
    story:
      "একটা notice board-এ এই মুহূর্তে কী কী নিয়ম (rule) টাঙানো আছে তা পড়ার মতো। `dump-flows` ঠিক সেই নোটিশ বোর্ড দেখায় — switch-এ এখন কী কী flow rule active আছে, তাদের priority, match condition আর action সহ।",
    tokens: [
      {
        token: "dump-flows",
        meaning:
          "switch-এর flow table-এ বর্তমানে যত rule আছে, সব priority/match/action সহ দেখায়",
      },
      {
        token: "s1",
        meaning: "যে switch-এর flow table দেখা হচ্ছে",
      },
    ],
    tip: "💡 নতুন rule add করার পর বা rule কাজ না করলে সবার আগে `dump-flows` দিয়ে check করো সেটা আসলে বসেছে কিনা এবং priority/match ঠিক আছে কিনা।",
  },
  "flowcfg-ovs-ofctl-del-flows": {
    id: "flowcfg-ovs-ofctl-del-flows",
    command: "mininet> sh ovs-ofctl del-flows s1",
    category: "Software-Defined Networking",
    story:
      "একটা notice board থেকে সব পুরনো নোটিশ ছিঁড়ে ফেলার মতো — board (switch) খালি হয়ে যায়, কেউ কোনো নিয়ম জানে না। `del-flows` চালালে switch-এর flow table থেকে সব rule মুছে যায়, ফলে switch আর বুঝতে পারে না কোন packet কোথায় পাঠাতে হবে।",
    tokens: [
      {
        token: "del-flows",
        meaning: "switch-এর flow table-এ থাকা সব flow entry একবারে মুছে ফেলে",
      },
      {
        token: "s1",
        meaning: "যে switch-এর flow table খালি করা হচ্ছে",
      },
    ],
    tip: "⚠️ `del-flows`-এর পর `pingall` চালালে সব ping fail করবে — physical connection অক্ষত থাকলেও কোনো forwarding rule না থাকায় switch সব packet drop করে দেয়।",
  },
  "flowcfg-ovs-add-flow-port1-to-2": {
    id: "flowcfg-ovs-add-flow-port1-to-2",
    command: "sh ovs-ofctl add-flow s1 priority=500,in_port=1,actions=output:2",
    category: "Software-Defined Networking",
    story:
      "একটা office-এ ধরো তুমি desk 1 থেকে desk 2-তে একটা one-way সরাসরি ফোন লাইন টেনে দিলে — desk 1 থেকে কিছু বললে সেটা সরাসরি শুধু desk 2-তে যায়, আর কোথাও না।",
    tokens: [
      {
        token: "priority=500",
        meaning:
          "এই rule-এর গুরুত্ব/অগ্রাধিকার — একাধিক rule match করলে বেশি priority-র rule আগে প্রযোজ্য হয়",
      },
      {
        token: "in_port=1",
        meaning:
          "match condition — switch-এর port 1 (h1-এর দিক) দিয়ে আসা packet-এর জন্যই এই rule প্রযোজ্য",
      },
      {
        token: "actions=output:2",
        meaning: "match হওয়া packet-টা port 2 (h2-এর দিক) দিয়ে বের করে দাও",
      },
    ],
    tip: "এই একটা rule শুধু h1 → h2 দিকের traffic handle করে — উল্টো দিক (h2 → h1)-এর জন্য আলাদা rule লাগবে।",
  },
  "flowcfg-ovs-add-flow-port2-to-1": {
    id: "flowcfg-ovs-add-flow-port2-to-1",
    command: "sh ovs-ofctl add-flow s1 priority=500,in_port=2,actions=output:1",
    category: "Software-Defined Networking",
    story:
      "আগের rule-টার ঠিক উল্টো দিক — desk 2 থেকে desk 1-এ ফেরার লাইন টানা হলো, যাতে দুইজনেই একে অপরের সাথে কথা বলতে পারে (দুইটা one-way rule মিলে কার্যত two-way communication তৈরি করে)।",
    tokens: [
      {
        token: "priority=500",
        meaning: "flow rule-এর priority, আগের rule-এর সমান",
      },
      {
        token: "in_port=2",
        meaning:
          "match condition — switch-এর port 2 (h2-এর দিক) দিয়ে আসা packet-এর জন্য",
      },
      {
        token: "actions=output:1",
        meaning: "match হওয়া packet-টা port 1 (h1-এর দিক) দিয়ে বের করে দাও",
      },
    ],
    tip: "h1↔h2-এর মধ্যে সম্পূর্ণ (bi-directional) ping কাজ করার জন্য এই দুইটা one-way rule-ই (port1→2 আর port2→1) একসাথে লাগে।",
  },
  "flowcfg-host-ping-c2": {
    id: "flowcfg-host-ping-c2",
    command: "h1 ping -c2 h2",
    category: "Software-Defined Networking",
    story:
      "একটা নির্দিষ্ট ফোন লাইন ঠিকঠাক কাজ করছে কিনা তা check করতে তুমি নির্দিষ্ট সংখ্যক (যেমন ২ বার) call করে দেখো, লাইন অনন্তকাল খোলা রাখো না। `ping -c2` ঠিক সেটাই করে — ঠিক ২টা ping packet পাঠিয়ে connectivity test করে, তারপর নিজে থেকে থেমে যায়।",
    tokens: [
      {
        token: "h1",
        meaning:
          "source host — Mininet CLI থেকে সরাসরি এই host-এর context-এ command চালানো হচ্ছে",
      },
      {
        token: "ping",
        meaning: "দুই host-এর মধ্যে network connectivity test করার command",
      },
      {
        token: "-c2",
        meaning:
          "ঠিক কয়টা ping packet পাঠানো হবে তা নির্দিষ্ট করে (count = 2); না দিলে ping অনন্তকাল চলতেই থাকে",
      },
      {
        token: "h2",
        meaning: "destination host, যাকে ping করা হচ্ছে",
      },
    ],
    tip: '⚠️ এই কমান্ডের ফলাফল সম্পূর্ণ নির্ভর করে switch-এ উপযুক্ত flow rule আছে কিনা তার উপর — physical topology ঠিক থাকলেও matching rule না থাকলে "Destination Host Unreachable" আসবে।',
  },
  "flowcfg-ovs-add-flow-port3-to-1-2": {
    id: "flowcfg-ovs-add-flow-port3-to-1-2",
    command:
      "sh ovs-ofctl add-flow s1 priority=500,in_port=3,actions=output:1,2",
    category: "Software-Defined Networking",
    story:
      "ধরো এতদিন desk 3 (h3) পুরো office network থেকে বিচ্ছিন্ন ছিল (ওর কোনো ফোন লাইনই ছিল না), এবার একসাথে desk 1 আর desk 2 — দুই জায়গাতেই লাইন টেনে দেওয়া হলো, যাতে desk 3 দুইজনের সাথেই কথা বলতে পারে।",
    tokens: [
      {
        token: "priority=500",
        meaning: "flow rule-এর অগ্রাধিকার",
      },
      {
        token: "in_port=3",
        meaning:
          "match condition — switch-এর port 3 (h3-এর দিক) দিয়ে আসা packet-এর জন্য",
      },
      {
        token: "actions=output:1,2",
        meaning:
          "একাধিক output port — match হওয়া packet port 1 আর port 2, দুই জায়গাতেই পাঠিয়ে দাও",
      },
    ],
    tip: "`output:1,2`-এর মতো comma দিয়ে একাধিক port দিলে, সেই packet-এর আলাদা copy প্রতিটা উল্লেখিত port দিয়ে বের হয় — এটা নির্দিষ্ট কিছু port-এ selective forwarding, পুরো broadcast না।",
  },
  "flowcfg-ovs-add-flow-port1-to-2-3": {
    id: "flowcfg-ovs-add-flow-port1-to-2-3",
    command:
      "sh ovs-ofctl add-flow s1 priority=500,in_port=1,actions=output:2,3",
    category: "Software-Defined Networking",
    story:
      "আগে desk 1 শুধু desk 2-এর সাথে লাইনে যুক্ত ছিল; এবার সেই পুরনো নিয়মটাই বদলে (replace করে) desk 1-কে desk 2 আর desk 3 — দুই জায়গাতেই connect করে দেওয়া হলো, যাতে সবাই সবার সাথে কথা বলতে পারে।",
    tokens: [
      {
        token: "priority=500",
        meaning: "flow rule-এর অগ্রাধিকার, আগের in_port=1 rule-এর মতোই",
      },
      {
        token: "in_port=1",
        meaning: "match condition — একই match field আগের in_port=1 rule-এর মতো",
      },
      {
        token: "actions=output:2,3",
        meaning: "match হওয়া packet port 2 আর port 3 — দুইটাতেই forward করো",
      },
    ],
    tip: "⚠️ একই match field (এখানে in_port=1, একই priority)-এর জন্য আবার add-flow দিলে, OVS আগের rule-কে পুরোপুরি replace করে দেয় — দুইটা rule আলাদা করে active থাকে না, নতুনটাই শেষ কথা।",
  },
  "flowcfg-ovs-add-flow-port2-to-1-3": {
    id: "flowcfg-ovs-add-flow-port2-to-1-3",
    command:
      "sh ovs-ofctl add-flow s1 priority=500,in_port=2,actions=output:1,3",
    category: "Software-Defined Networking",
    story:
      "একইভাবে desk 2-এর পুরনো এক-মুখী লাইনটাও বদলে দেওয়া হলো, এবার desk 2 থেকে desk 1 আর desk 3 — দুই জায়গাতেই লাইন যায়। তিনটা rule মিলিয়ে এখন প্রতিটা desk বাকি দুইটার সাথেই সরাসরি কথা বলতে পারে — পুরো office-এ full mesh connectivity।",
    tokens: [
      {
        token: "priority=500",
        meaning: "flow rule-এর অগ্রাধিকার",
      },
      {
        token: "in_port=2",
        meaning:
          "match condition — port 2 (h2-এর দিক) দিয়ে আসা packet-এর জন্য",
      },
      {
        token: "actions=output:1,3",
        meaning: "match হওয়া packet port 1 আর port 3 — দুইটাতেই forward করো",
      },
    ],
    tip: "💡 শেষমেশ প্রতিটা in_port-এর জন্য একটা করে rule (মোট ৩টা), যেখানে actions বাকি দুই port-এ output করে — এই pattern দিয়েই ৩-host full mesh connectivity অর্জন করা হয়েছে, কোনো controller ছাড়াই।",
  },
  "l2fwd-mn-start": {
    id: "l2fwd-mn-start",
    command: "sudo mn --topo=single,3 --controller=none --mac",
    category: "Software-Defined Networking",
    story:
      'ধরো তুমি একটা ছোট্ট toy network বানাতে চাও — একটা switch, আর তার সাথে যুক্ত তিনটা computer। স্বাভাবিক নেটওয়ার্কে একটা "মাথা" (controller) থাকে যে switch-কে বলে দেয় কী করতে হবে, কিন্তু এখানে আমরা ইচ্ছা করে সেই মাথাটা বাদ দিচ্ছি (--controller=none) — switch একদম ফাঁকা মাথা নিয়ে বসে থাকবে, আর পরে আমরা নিজেরাই হাতে করে ওকে প্রতিটা সিদ্ধান্ত (flow rule) শিখিয়ে দেব।',
    tokens: [
      {
        token: "mn",
        meaning:
          "Mininet টুল চালু করার command — এটা দিয়ে virtual switch আর host দিয়ে একটা network emulate করা যায়",
      },
      {
        token: "--topo=single,3",
        meaning:
          'টপোলজি নির্ধারণ করে — "single" মানে একটামাত্র switch, আর "3" মানে তার সাথে ৩টা host যুক্ত থাকবে',
      },
      {
        token: "--controller=none",
        meaning:
          "কোনো external SDN controller (যেমন POX/Ryu) থাকবে না — switch নিজে থেকে কোনো সিদ্ধান্ত নেবে না, flow rule ম্যানুয়ালি বসাতে হবে",
      },
      {
        token: "--mac",
        meaning:
          "host-গুলোর MAC address predictable, ছোট আকারে সেট করে দেয় (00:00:00:00:00:01, ...02, ...), যাতে পরে flow rule লেখা সহজ হয়",
      },
    ],
    tip: "sudo লাগে কারণ Mininet kernel-level virtual network namespace/interface তৈরি করে, যার জন্য root প্রিভিলেজ দরকার।",
  },
  "l2fwd-ifconfig": {
    id: "l2fwd-ifconfig",
    command: "mininet> h1 ifconfig",
    category: "Software-Defined Networking",
    story:
      'প্রতিটা host-কে তুমি জিজ্ঞেস করছো "তোমার ঠিকানা (IP) আর তোমার ID card নম্বর (MAC address) কী?" — ঠিক যেমন কাউকে ID card দেখাতে বললে সে নিজের পরিচয় জানায়, ifconfig host-টা নিজের network পরিচয় জানিয়ে দেয়।',
    tokens: [
      {
        token: "h1",
        meaning:
          "Mininet prompt-এ কোন host-এর ভেতরে গিয়ে command চালানো হবে তা বলে দেয় — এখানে h1",
      },
      {
        token: "ifconfig",
        meaning:
          "সেই host-এর network interface-এর তথ্য (IP address, MAC address) দেখানোর command",
      },
    ],
    tip: "h2 ifconfig, h3 ifconfig লিখলেও একই কাজ হবে, শুধু host বদলে যাবে — পরের flow rule লেখার আগে প্রতিটা host-এর MAC address জেনে নেওয়া জরুরি।",
  },
  "l2fwd-flow-mac": {
    id: "l2fwd-flow-mac",
    command:
      "mininet> sh ovs-ofctl add-flow s1 dl_src=00:00:00:00:00:01,dl_dst=00:00:00:00:00:02,actions=output:2",
    category: "Software-Defined Networking",
    story:
      'ধরো একটা ডাকঘরের ক্লার্ক-কে তুমি হাতে লেখা একটা নিয়ম দিয়ে বললে — "যদি কোনো চিঠির প্রেরক হয় X আর প্রাপক হয় Y, তাহলে সেটা সরাসরি বাক্স নম্বর ২-তে রেখে দিও।" switch (s1)-এর নিজের কোনো বুদ্ধি নেই (controller=none), তাই এই rule-টা তুমি ম্যানুয়ালি তার flow table-এ ঢুকিয়ে দিচ্ছো, ঠিক যেমন পোস্ট অফিসের ক্লার্ক-কে হাতে লেখা নির্দেশ দেওয়া হয়।',
    tokens: [
      {
        token: "sh",
        meaning:
          "Mininet prompt-এর ভেতর থেকে shell-level command চালানোর জন্য ব্যবহার হয় (এখানে ovs-ofctl একটা shell tool)",
      },
      {
        token: "ovs-ofctl",
        meaning: "Open vSwitch-এর flow table manage করার command-line tool",
      },
      {
        token: "add-flow s1",
        meaning: "s1 নামের switch-এ একটা নতুন flow rule (entry) যোগ করে",
      },
      {
        token: "dl_src=00:00:00:00:00:01",
        meaning:
          "match field — প্যাকেটের source MAC address h1 হলে এই rule apply হবে (dl = data link layer)",
      },
      {
        token: "dl_dst=00:00:00:00:00:02",
        meaning:
          "match field — প্যাকেটের destination MAC address h2 হলে এই rule apply হবে",
      },
      {
        token: "actions=output:2",
        meaning:
          "match মিললে প্যাকেটটা switch-এর port 2 (যেখানে h2 যুক্ত) দিয়ে পাঠিয়ে দাও",
      },
    ],
    tip: "h2 থেকে h1-এ reply পাঠাতে হলে উল্টো দিকের rule-ও লাগবে — dl_src আর dl_dst বদলে, actions=output:1 দিয়ে আরেকটা add-flow চালাতে হয়; নাহলে one-way traffic-ই চলবে, কারণ প্রতিটা rule শুধু একটা নির্দিষ্ট দিক match করে।",
  },
  "l2fwd-pingall": {
    id: "l2fwd-pingall",
    command: "mininet> pingall",
    category: "Software-Defined Networking",
    story:
      'ক্লাসরুমে roll call-এর মতো — প্রতিটা student (host) একে একে বাকি সবাইকে "হ্যালো, তুমি কি আমার কথা শুনতে পাচ্ছো?" বলে জিজ্ঞেস করছে, আর উত্তর এলে নোট রাখা হচ্ছে কে কার সাথে যোগাযোগ করতে পারলো।',
    tokens: [
      {
        token: "pingall",
        meaning:
          "Mininet-এর built-in command — প্রতিটা host থেকে বাকি সব host-এ ping করে connectivity test করে, কোন কোন জোড়া host পরস্পর যোগাযোগ করতে পারছে তার summary দেখায়",
      },
    ],
    tip: "pingall fail করলে এর মানে এই না যে flow rule ভুল — ARP broadcast ঠিকমতো না গেলেও ping fail করতে পারে, কারণ ping শুরুর আগে ARP দিয়ে MAC address resolve করা লাগে।",
  },
  "l2fwd-flow-arp-flood": {
    id: "l2fwd-flow-arp-flood",
    command:
      "mininet> sh ovs-ofctl add-flow s1 dl_type=0x806,nw_proto=1,action=flood",
    category: "Software-Defined Networking",
    story:
      'ARP broadcast অনেকটা একটা বড় ঘরে দাঁড়িয়ে জোরে চিৎকার করে জিজ্ঞেস করার মতো — "এই IP-টা কার?" আগের rule-গুলো শুধু নির্দিষ্ট প্রেরক-প্রাপক জানা থাকলেই কাজ করে, কিন্তু এই চিৎকারের কোনো নির্দিষ্ট প্রাপক নেই — তাই flood action দিয়ে বলা হচ্ছে "ঘরে যে যে আছে, সবাইকেই শুনিয়ে দাও।"',
    tokens: [
      {
        token: "dl_type=0x806",
        meaning:
          "match field — Ethernet frame type 0x806 মানে এই প্যাকেটটা ARP প্যাকেট",
      },
      {
        token: "nw_proto=1",
        meaning: "ARP-এর মধ্যেও নির্দিষ্টভাবে ARP request প্যাকেট match করে",
      },
      {
        token: "action=flood",
        meaning:
          "match মিললে প্যাকেটটা switch-এর সব port দিয়ে (incoming port বাদে) broadcast করে পাঠায়, ঠিক hub-এর মতো আচরণ করে",
      },
    ],
    tip: "আগের dl_src/dl_dst rule শুধু normal (unicast) traffic handle করে — ARP-এর জন্য আলাদা rule না দিলে host একে অপরের MAC address-ই জানতে পারবে না, তাই pingall শুরুতে fail করেছিল।",
  },
  "l3fwd-flow-subnet-normal": {
    id: "l3fwd-flow-subnet-normal",
    command:
      "mininet> sh ovs-ofctl add-flow s1 priority=500,dl_type=0x800,nw_src=10.0.0.0/24,nw_dst=10.0.0.0/24,actions=normal",
    category: "Software-Defined Networking",
    story:
      'ধরো একটা পুরো এলাকার (subnet) জন্য একটা সাধারণ ট্রাফিক নিয়ম বানানো হলো — "এই এলাকার ভেতরে যেকোনো গাড়ি (IP) থেকে এই এলাকার ভেতরে যেকোনো গাড়িতে গেলে, স্বাভাবিক ট্রাফিক পুলিশ (switch-এর নিজস্ব MAC-learning logic) সামলে নেবে।" এখানে আর MAC address ধরে ধরে rule লেখা হচ্ছে না (যেমন আগের L2 lab-এ), বরং IP address আর subnet দিয়ে সিদ্ধান্ত নেওয়া হচ্ছে — এটাই Layer 3 forwarding-এর মূল পার্থক্য।',
    tokens: [
      {
        token: "priority=500",
        meaning:
          "rule-টার অগ্রাধিকার সংখ্যা — flow table-এ একাধিক rule মিললে, বেশি priority-র rule আগে/প্রধানত apply হয়",
      },
      {
        token: "dl_type=0x800",
        meaning:
          "match field — Ethernet type 0x800 মানে IPv4 প্যাকেট (ARP থেকে আলাদা করতে)",
      },
      {
        token: "nw_src=10.0.0.0/24",
        meaning:
          "match field — source IP যদি 10.0.0.0/24 subnet-এর ভেতরে হয় (nw = network layer, Layer 3)",
      },
      {
        token: "nw_dst=10.0.0.0/24",
        meaning: "match field — destination IP-ও একই subnet-এর ভেতরে হতে হবে",
      },
      {
        token: "actions=normal",
        meaning:
          "switch-এর নিজস্ব স্বাভাবিক (traditional) MAC-learning switching behavior অনুযায়ী প্যাকেট ফরওয়ার্ড করো, বিশেষ কোনো OpenFlow রুট ছাড়াই",
      },
    ],
    tip: "এই lab-এ dl_src/dl_dst-এর বদলে nw_src/nw_dst ব্যবহার হচ্ছে — এটাই মূল পার্থক্য Layer 2 বনাম Layer 3 forwarding-এর মধ্যে: MAC address না দেখে IP address দেখে decision নেওয়া হচ্ছে।",
  },
  "l3fwd-flow-priority-dscp": {
    id: "l3fwd-flow-priority-dscp",
    command:
      "mininet> sh ovs-ofctl add-flow s1 priority=800,dl_type=0x800,nw_src=10.0.0.3,nw_dst=10.0.0.0/24,actions=mod_nw_tos:184,normal",
    category: "Software-Defined Networking",
    story:
      "এয়ারপোর্টের VIP লাইনের মতো — h3-এর ট্রাফিককে একটা বিশেষ ট্যাগ (priority boarding pass) দেওয়া হচ্ছে, আর এই গেটের নিয়মটা (priority 800) সাধারণ গেটের (priority 500) চেয়ে বেশি গুরুত্বপূর্ণ, তাই h3-এর ক্ষেত্রে এটাই আগে চেক হবে।",
    tokens: [
      {
        token: "priority=800",
        meaning:
          "আগের general rule-এর (priority 500) চেয়ে বেশি priority, তাই h3 থেকে আসা ট্র্যাফিকের ক্ষেত্রে এই rule-টাই জিতে যাবে",
      },
      {
        token: "nw_src=10.0.0.3",
        meaning:
          "শুধু h3 (source IP 10.0.0.3) থেকে আসা প্যাকেটের জন্য এই rule প্রযোজ্য",
      },
      {
        token: "actions=mod_nw_tos:184,normal",
        meaning:
          "প্রথমে IP header-এর TOS field-এ মান 184 বসিয়ে দাও (DSCP 46 / Expedited Forwarding বোঝায়), তারপর normal switching দিয়ে forward করো",
      },
      {
        token: "mod_nw_tos:184",
        meaning:
          "একটা action যা প্যাকেটের TOS byte পরিবর্তন করে — নেটওয়ার্কে এই প্যাকেটকে higher-priority/QoS traffic হিসেবে চিহ্নিত করার জন্য",
      },
    ],
    tip: "184 সংখ্যাটা ম্যাজিক না — DSCP 46 (বাইনারি 101110)-কে 2 bit বামে shift করলে 10111000 = 184 হয়, কারণ TOS byte-এর প্রথম 6 bit-ই DSCP-এর জায়গা, বাকি 2 bit ECN-এর জন্য।",
  },
  "l3fwd-flow-arp-port": {
    id: "l3fwd-flow-arp-port",
    command:
      "mininet> sh ovs-ofctl add-flow s1 arp,nw_dst=10.0.0.1,actions=output:1",
    category: "Software-Defined Networking",
    story:
      "আগের L2 lab-এ ARP-এর জন্য পুরো ঘরে চিৎকার করে (flood) সবাইকে জিজ্ঞেস করা হতো, কিন্তু এবার তোমার কাছে রিসেপশনিস্টের ডেস্ক নম্বরটাই জানা আছে — তাই পুরো অফিসে চিৎকার না করে সরাসরি সেই ডেস্কে (নির্দিষ্ট port-এ) গিয়ে জিজ্ঞেস করা যাচ্ছে।",
    tokens: [
      {
        token: "arp",
        meaning:
          "match field শর্টকাট — শুধু ARP প্যাকেট match করে (dl_type=0x806 লেখার বদলে সরাসরি 'arp' keyword ব্যবহার করা যায়)",
      },
      {
        token: "nw_dst=10.0.0.1",
        meaning:
          "এই ARP request-টা কোন IP address-এর জন্য (কাকে খোঁজা হচ্ছে), সেটা দিয়ে match করে",
      },
      {
        token: "actions=output:1",
        meaning:
          "flood না করে সরাসরি নির্দিষ্ট port-এ (এখানে port 1, যেখানে h1 যুক্ত) পাঠিয়ে দাও",
      },
    ],
    tip: "h2 আর h3-এর জন্যও একই প্যাটার্নে আলাদা rule লাগবে (nw_dst=10.0.0.2→output:2, nw_dst=10.0.0.3→output:3) — flood-এর চেয়ে এটা বড় নেটওয়ার্কে বেশি efficient, কারণ অযথা সব port-এ ARP পাঠানো হয় না।",
  },
  "l3fwd-ping-host": {
    id: "l3fwd-ping-host",
    command: "mininet> h3 ping h1",
    category: "Software-Defined Networking",
    story:
      "pingall দিয়ে একসাথে সবাইকে জিজ্ঞেস করার বদলে, এবার নির্দিষ্ট একজনকে সরাসরি ফোন করে জিজ্ঞেস করা হচ্ছে — h3-এর জন্য যে বিশেষ priority rule বসানো হয়েছে, সেটা ঠিকমতো কাজ করছে কিনা তা যাচাই করতে নির্দিষ্ট পথে (h3 থেকে h1) একটা targeted test চালানো হচ্ছে।",
    tokens: [
      {
        token: "h3",
        meaning:
          "Mininet prompt-এ উৎস host নির্ধারণ করে — h3 থেকে command চালানো হচ্ছে",
      },
      {
        token: "ping h1",
        meaning:
          "h1-এর IP address-এ ICMP ping পাঠিয়ে connectivity পরীক্ষা করা হচ্ছে",
      },
    ],
    tip: "pingall সব জোড়া host test করে, কিন্তু নির্দিষ্ট কোনো flow rule (যেমন h3-এর priority rule) ঠিকমতো কাজ করছে কিনা যাচাই করতে চাইলে h3 ping h1-এর মতো single, targeted ping চালানো বেশি কাজের।",
  },
  "l4fwd-mn-start": {
    id: "l4fwd-mn-start",
    command: "sudo mn --topo=single,3 --controller=none --mac",
    category: "Software-Defined Networking",
    story:
      'ধরো তুমি একটা ছোট অফিস খুলছো — ১টা reception desk (switch) আর তার সাথে সরাসরি যুক্ত ৩টা ডেস্ক (host)। "--topo=single,3" লিখলেই Mininet নিজে থেকে পুরো ছোট অফিসটা বানিয়ে দেয়। কিন্তু "--controller=none" দেওয়ার মানে হলো — এই অফিসের কোনো central manager (SDN controller) থাকছে না, তাই reception desk নিজে থেকে কোনো সিদ্ধান্তই জানে না, যতক্ষণ না আমরা নিজেরাই গিয়ে তাকে নিয়ম (rule) শিখিয়ে দিই।',
    tokens: [
      {
        token: "sudo",
        meaning:
          "root permission দরকার, কারণ Mininet kernel-level virtual network namespace/interface তৈরি করে",
      },
      {
        token: "mn",
        meaning: "Mininet network emulator চালু করার CLI command",
      },
      {
        token: "--topo=single,3",
        meaning:
          'built-in "single" topology template — ১টা switch-এর সাথে সরাসরি ৩টা host কানেক্টেড থাকবে',
      },
      {
        token: "--controller=none",
        meaning:
          "কোনো external SDN controller থাকবে না; switch নিজে থেকে কোনো rule না জানলে প্যাকেট ড্রপ করবে, যতক্ষণ না আমরা নিজে ovs-ofctl দিয়ে rule বসাই",
      },
      {
        token: "--mac",
        meaning:
          "host-দের MAC address random না হয়ে predictable/sequential হবে, যা debugging সহজ করে",
      },
    ],
    tip: "⚠️ controller=none মানে এই না যে network কাজ করবে না — এর মানে হলো, এখন switch-কে কী করতে হবে তা আমাদের manually ovs-ofctl দিয়ে বলে দিতে হবে, যেটা এই পুরো ল্যাবের মূল বিষয়।",
  },
  "l4fwd-http-server": {
    id: "l4fwd-http-server",
    command: "h3 python -m SimpleHTTPServer 80 &",
    category: "Software-Defined Networking",
    story:
      'ধরো h3 একটা নির্দিষ্ট ঠিকানায় (port 80) একটা ছোট দোকান খুলছে, যেখানে কেউ এসে (HTTP request পাঠালে) জিনিস পাবে। শেষের "&" চিহ্নটা মানে এই দোকান খুলেই তুমি কাউন্টার ছেড়ে চলে যেতে পারো (background-এ চলতে থাকবে), আর টার্মিনালে অন্য কাজ করতে পারবে।',
    tokens: [
      {
        token: "h3",
        meaning:
          "Mininet CLI-তে কোন host-এর namespace-এর ভেতরে command চালানো হবে তার prefix",
      },
      {
        token: "python -m SimpleHTTPServer 80",
        meaning:
          "Python-এর built-in simple HTTP server module চালু, port 80 (HTTP-র default port)-তে শোনার জন্য",
      },
      {
        token: "&",
        meaning:
          "command-টা background-এ চালানো, যাতে টার্মিনাল ব্লক না হয়ে পরের command চালানো যায়",
      },
    ],
    tip: '💡 Python 2-এ module-এর নাম "SimpleHTTPServer", কিন্তু Python 3-এ এটা "http.server" (python3 -m http.server 80) — পুরনো ল্যাব ম্যাটেরিয়ালে এই পার্থক্যটা খেয়াল রাখা দরকার।',
  },
  "l4fwd-arp-normal": {
    id: "l4fwd-arp-normal",
    command: "sh ovs-ofctl add-flow s1 arp,actions=normal",
    category: "Software-Defined Networking",
    story:
      'ARP হলো নেটওয়ার্কের একটা লাউডস্পিকার ঘোষণা — "এই IP-টা কার?" জিজ্ঞেস করে সবার কাছে। এই rule-টা switch-কে বলে দেয়, এই ধরনের ঘোষণা (ARP প্যাকেট) আটকে না রেখে স্বাভাবিক নিয়মেই (normal) সবার কাছে পৌঁছে দাও — নইলে কেউ কারো MAC address-ই জানতে পারবে না, আর IP দিয়ে কথা বলাই শুরু হবে না।',
    tokens: [
      {
        token: "sh",
        meaning:
          "Mininet CLI থেকে command সরাসরি underlying host OS-এর shell-এ চালানোর prefix (কোনো virtual host namespace-এ না গিয়ে)",
      },
      {
        token: "ovs-ofctl",
        meaning:
          "Open vSwitch-এর flow table (OpenFlow rule) manage করার CLI টুল",
      },
      {
        token: "add-flow",
        meaning: "switch-এ নতুন একটা OpenFlow rule (flow entry) যোগ করা",
      },
      {
        token: "s1",
        meaning: "কোন switch-এ rule বসবে, তার নাম",
      },
      {
        token: "arp",
        meaning: "match করার শর্ত — শুধু ARP প্রোটোকলের প্যাকেট",
      },
      {
        token: "actions=normal",
        meaning:
          "matched প্যাকেট switch-এর স্বাভাবিক L2 learning/forwarding logic দিয়ে হ্যান্ডেল হবে (MAC table অনুযায়ী forward বা flood)",
      },
    ],
    tip: "⚠️ এই rule না থাকলে host-রা একে অপরের MAC address-ই resolve করতে পারবে না, ফলে এরপরের কোনো IP-ভিত্তিক rule-ই আদৌ কাজে আসবে না — ARP হ্যান্ডলিং সবসময় সবার আগে দরকার।",
  },
  "l4fwd-http-flow": {
    id: "l4fwd-http-flow",
    command:
      "sh ovs-ofctl add-flow s1 priority=500,dl_type=0x800,nw_proto=6,tp_dst=80,actions=output:3",
    category: "Software-Defined Networking",
    story:
      'ধরো একটা মেইল সর্টিং অফিস শুধু ঠিকানা (IP, Layer 3) দেখে না, এনভেলাপের গায়ে লেখা নির্দিষ্ট "রুম নম্বর" (port, Layer 4) দেখেও চিঠি বাছাই করে — "port 80 লেখা সব HTTP চিঠি, কে পাঠিয়েছে তা না দেখেই, সরাসরি h3-এর রুমে (port 3) পাঠিয়ে দাও।" এটাই Layer 4 forwarding-এর মূল কথা — শুধু গন্তব্য না, গন্তব্যের ভেতরের "সার্ভিস" দেখেও সিদ্ধান্ত নেওয়া।',
    tokens: [
      {
        token: "priority=500",
        meaning:
          "এই rule-টার priority/গুরুত্ব — একাধিক rule match করলে বেশি priority-র rule আগে জিতবে",
      },
      {
        token: "dl_type=0x800",
        meaning: "data-link type match — 0x800 মানে IPv4 প্যাকেট (EtherType)",
      },
      {
        token: "nw_proto=6",
        meaning: "network protocol number match — 6 মানে TCP (UDP হলে 17 হতো)",
      },
      {
        token: "tp_dst=80",
        meaning:
          'transport-layer (Layer 4) destination port match — 80 মানে HTTP; এটাই "Layer 4 forwarding"-এর মূল কথা, IP না দেখে port দেখে decision নেওয়া',
      },
      {
        token: "actions=output:3",
        meaning:
          "matched প্যাকেট সরাসরি switch-এর 3 নম্বর পোর্ট দিয়ে পাঠানো হবে (যেখানে h3 কানেক্টেড)",
      },
    ],
    tip: "💡 একই port নম্বর TCP ও UDP দুই প্রোটোকলেই থাকতে পারে, তাই শুধু tp_dst দিলেই যথেষ্ট না — nw_proto দিয়ে নিশ্চিত করতে হয় যে এটা TCP ট্রাফিক।",
  },
  "l4fwd-normal-flow": {
    id: "l4fwd-normal-flow",
    command:
      "sh ovs-ofctl add-flow s1 priority=800,ip,nw_src=10.0.0.3,actions=normal",
    category: "Software-Defined Networking",
    story:
      'এটা একটা "রিটার্ন মেইল" rule — h3 যখন কারো reply পাঠায়, সেটা যেন ঠিকমতো প্রকৃত প্রাপকের কাছে ফিরে যায়, তার জন্য এই rule। source IP h3 থেকে আসা সব IP ট্রাফিককে switch-এর স্বাভাবিক নিয়মে (normal) ফরওয়ার্ড হতে দাও। আগের rule-টা শুধু h3-এর দিকে যাওয়া HTTP ট্রাফিক নিয়ন্ত্রণ করত, এটা তার উল্টো দিকটা (h3 থেকে বের হওয়া ট্রাফিক) সামলায়।',
    tokens: [
      {
        token: "priority=800",
        meaning:
          "আগের rule (priority=500)-এর চেয়ে বেশি priority — তবে dl_type ভিন্ন হওয়ায় সাধারণত একে অপরের সাথে conflict করে না",
      },
      {
        token: "ip",
        meaning: "match করার শর্ত — যেকোনো IPv4 প্যাকেট (প্রোটোকল নির্বিশেষে)",
      },
      {
        token: "nw_src=10.0.0.3",
        meaning:
          "network source address match — শুধু h3 (10.0.0.3) থেকে আসা প্যাকেট",
      },
      {
        token: "actions=normal",
        meaning:
          "normal L2/L3 forwarding logic দিয়ে হ্যান্ডেল, যাতে reply সঠিক destination-এ (h1/h2) পৌঁছায়",
      },
    ],
    tip: "⚠️ priority=500-এর tp_dst=80 rule শুধু h3-মুখী (incoming) ট্রাফিক কভার করে, কিন্তু h3 থেকে বের হওয়া (outgoing) response-এর জন্য এই আলাদা rule ছাড়া সেটা default-এ ড্রপ হয়ে যেতে পারত।",
  },
  "l4fwd-curl-test": {
    id: "l4fwd-curl-test",
    command: "h1 curl h3",
    category: "Software-Defined Networking",
    story:
      'এটা একদম সাধারণ একটা কাস্টমার-এর মতো — h1 হচ্ছে কাস্টমার, যে h3-এর দোকানে (HTTP server) গিয়ে একটা রিকোয়েস্ট করছে "তোমার কাছে কী আছে দেখাও"। এই একটা command দিয়েই পুরো আগের সব flow rule একসাথে টেস্ট হয়ে যায় — ARP, forward rule, আর return rule।',
    tokens: [
      {
        token: "h1",
        meaning: "h1 namespace-এ command চালানোর prefix",
      },
      {
        token: "curl",
        meaning:
          "HTTP client টুল — একটা URL/host-এ request পাঠিয়ে response দেখায়",
      },
      {
        token: "h3",
        meaning:
          "destination hostname (Mininet নিজে থেকে এটাকে h3-এর IP 10.0.0.3-তে resolve করে request পাঠায়)",
      },
    ],
    tip: "💡 curl সফল হওয়ার মানে শুধু একটা rule ঠিক আছে তা না — এটা প্রমাণ করে ARP, forward rule, আর return rule — তিনটাই একসাথে ঠিকমতো কাজ করছে।",
  },
  "l4fwd-dump-flows": {
    id: "l4fwd-dump-flows",
    command: "sh ovs-ofctl dump-flows s1",
    category: "Software-Defined Networking",
    story:
      "ধরো তুমি চেক করতে চাও তোমার অফিসের রুলবুকে এখন ঠিক কোন কোন নিয়ম লেখা আছে, আর প্রতিটা নিয়ম এ পর্যন্ত কতবার ব্যবহার হয়েছে। এই command-টা ঠিক সেটাই দেখায় — switch-এ এই মুহূর্তে বসানো সব flow rule, আর প্রতিটার packet/byte counter।",
    tokens: [
      {
        token: "dump-flows",
        meaning:
          "switch-এ এই মুহূর্তে ইনস্টল করা সব OpenFlow rule, packet count, এবং byte count দেখানোর command",
      },
      {
        token: "s1",
        meaning: "কোন switch-এর flow table দেখা হবে",
      },
    ],
    tip: "💡 packet count 0 হলে বুঝতে হবে সেই rule এখনো কোনো প্যাকেটের সাথে match করেনি — এটা দিয়ে কোন rule আসলে কাজ করছে, কোনটা করছে না তা সহজেই যাচাই করা যায়।",
  },
  "subnet-addswitch": {
    id: "subnet-addswitch",
    command:
      "br0 = self.addSwitch('br0', cls=OVSKernelSwitch, failMode='standalone')",
    category: "Software-Defined Networking",
    story:
      "ধরো তুমি একটা অফিসের জন্য একটা central reception desk বানাচ্ছো, যেটার কোনো বড় ম্যানেজারের (external controller) নির্দেশ ছাড়াই নিজে নিজে চলতে পারে। \"failMode='standalone'\" ঠিক এটাই বোঝায় — কোনো SDN controller সংযুক্ত না থাকলেও এই switch নিজে থেকেই একটা সাধারণ switch-এর মতো কাজ করে যাবে, Lab 1-এর মতো manually ovs-ofctl rule বসানোর দরকার হবে না।",
    tokens: [
      {
        token: "self.addSwitch(...)",
        meaning:
          "কাস্টম Topo ক্লাসের ভেতরে topology-তে নতুন একটা switch যোগ করার method",
      },
      {
        token: "'br0'",
        meaning: "switch-এর নাম (bridge 0)",
      },
      {
        token: "cls=OVSKernelSwitch",
        meaning:
          "কোন ধরনের switch implementation ব্যবহার হবে — kernel-space Open vSwitch",
      },
      {
        token: "failMode='standalone'",
        meaning:
          "কোনো external SDN controller না থাকলেও switch নিজে থেকেই normal L2 switch-এর মতো কাজ করবে",
      },
    ],
    tip: "💡 এই lab-এর standalone mode, l4fwd lab-এর controller=none + manual ovs-ofctl rule পদ্ধতির ঠিক বিপরীত — এখানে switch নিজেই স্বাধীনভাবে normal forwarding করে, আলাদা করে কোনো rule বসাতে হয় না।",
  },
  "subnet-addhost": {
    id: "subnet-addhost",
    command: "h20 = self.addHost('h20', ip='192.168.1.20/24')",
    category: "Software-Defined Networking",
    story:
      "ধরো তুমি একটা নতুন flat-এর বাসিন্দাকে তার বাসার ঠিকানা আর কোন এলাকা/ব্লক (subnet) তার, সেটা তৈরির সময়েই লিখে দিচ্ছো। addHost-এর ip প্যারামিটার দিয়ে host তৈরির মুহূর্তেই তাকে একটা static IP address আর subnet range (CIDR /24) বলে দেওয়া হচ্ছে।",
    tokens: [
      {
        token: "self.addHost(...)",
        meaning:
          "কাস্টম topology-তে নতুন একটা host (ভার্চুয়াল মেশিনের মতো) যোগ করা",
      },
      {
        token: "'h20'",
        meaning: "host-এর নাম",
      },
      {
        token: "ip='192.168.1.20/24'",
        meaning:
          "host-কে static IP address ও subnet mask (/24 মানে 255.255.255.0) সরাসরি তৈরির সময়েই অ্যাসাইন করে দেওয়া",
      },
    ],
    tip: "⚠️ /24 মানে প্রথম ২৪ বিট network prefix — তাই 192.168.1.x আর 192.168.0.x একই অক্টেট ভিন্ন হওয়ায় দুইটা সম্পূর্ণ আলাদা subnet, যদিও দেখতে খুবই কাছাকাছি।",
  },
  "subnet-addlink": {
    id: "subnet-addlink",
    command: "self.addLink(h20, br0)",
    category: "Software-Defined Networking",
    story:
      "এটা ঠিক একটা physical ethernet cable টানার মতো — একটা host আর switch-এর মধ্যে একটা ভার্চুয়াল সংযোগ তৈরি হচ্ছে, যাতে তারা একে অপরের সাথে প্যাকেট আদান-প্রদান করতে পারে।",
    tokens: [
      {
        token: "self.addLink(...)",
        meaning:
          "দুইটা node (host-switch বা switch-switch)-এর মধ্যে virtual link/cable তৈরি করা",
      },
      {
        token: "h20, br0",
        meaning: "কোন দুইটা node-এর মধ্যে link বসবে",
      },
    ],
    tip: "💡 এই ল্যাবে প্রতিটা host-ই আলাদা addLink call দিয়ে সরাসরি br0-এর সাথে যুক্ত — অর্থাৎ ৪টা host, ৪টা পৃথক link, সবাই একই central switch-এ মিলিত।",
  },
  "subnet-mininet-init": {
    id: "subnet-mininet-init",
    command: "net = Mininet(topo=topo, switch=OVSKernelSwitch)",
    category: "Software-Defined Networking",
    story:
      "এটা ব্লুপ্রিন্ট থেকে একটা আসল network object তৈরি করার ধাপ — আগে শুধু কাগজে (TwoSubnetTopo ক্লাসে) প্ল্যান করা হয়েছিল, এখন সেই প্ল্যান দিয়ে একটা বাস্তব, চালানোর উপযোগী Mininet network instance বানানো হচ্ছে।",
    tokens: [
      {
        token: "Mininet(...)",
        meaning:
          "মূল Mininet network object তৈরি করা, যেটা পুরো emulated network manage করবে",
      },
      {
        token: "topo=topo",
        meaning:
          "আগে define করা TwoSubnetTopo থেকে বানানো topology object pass করা",
      },
      {
        token: "switch=OVSKernelSwitch",
        meaning:
          "ডিফল্টভাবে কোন switch implementation ব্যবহার হবে তা পুরো network object-কে বলে দেওয়া",
      },
    ],
    tip: "💡 Topo ক্লাসের cls=OVSKernelSwitch আর এখানকার switch=OVSKernelSwitch — দুইটা আলাদা জায়গায় লেখা হলেও উদ্দেশ্য একই, consistency বজায় রাখা।",
  },
  "subnet-net-start": {
    id: "subnet-net-start",
    command: "net.start()",
    category: "Software-Defined Networking",
    story:
      "এটা একদম ইঞ্জিন স্টার্ট করার চাবি ঘোরানোর মতো — আগে define করা সব virtual host, switch, link এতক্ষণ শুধু কোডে লেখা ছিল, net.start() কল করলে সেগুলো আসলেই চালু/বুট হয়ে যায়।",
    tokens: [
      {
        token: "net.start()",
        meaning: "তৈরি করা সব virtual host, switch, link আসলেই চালু/বুট করা",
      },
    ],
    tip: "⚠️ net.start() না করলে শুধু topology define-ই হয়ে থাকবে, কোনো virtual network আসলে চালু হবে না।",
  },
  "subnet-cli": {
    id: "subnet-cli",
    command: "CLI(net)",
    category: "Software-Defined Networking",
    story:
      "নেটওয়ার্ক চালু হওয়ার পর এটা যেন একটা control room-এর দরজা খুলে দেওয়ার মতো — এখন থেকে ব্যবহারকারী নিজে হাতে ping, ifconfig-এর মতো command দিয়ে নেটওয়ার্কটা interact করতে পারবে।",
    tokens: [
      {
        token: "CLI(net)",
        meaning:
          "Mininet-এর interactive command-line interface চালু করা, যাতে ব্যবহারকারী ping/ifconfig ইত্যাদি command চালাতে পারে এই network-এর উপর",
      },
    ],
    tip: '💡 CLI(net) লাইনটা script-কে blocking করে রাখে — যতক্ষণ না ব্যবহারকারী CLI থেকে "exit" করে বের হয়, ততক্ষণ পরের লাইন (net.stop()) চলবে না।',
  },
  "subnet-net-stop": {
    id: "subnet-net-stop",
    command: "net.stop()",
    category: "Software-Defined Networking",
    story:
      "অফিস বন্ধ করার সময় যেমন সব লাইট-ফ্যান বন্ধ করে দরজা তালা দিতে হয়, net.stop() ঠিক তেমনি CLI থেকে বের হওয়ার পর সব virtual host/switch/link বন্ধ ও পরিষ্কার করে দেয়।",
    tokens: [
      {
        token: "net.stop()",
        meaning:
          "CLI থেকে বের হওয়ার পর সব virtual host/switch/link বন্ধ ও clean up করা",
      },
    ],
    tip: '⚠️ net.stop() ঠিকমতো না চললে virtual interface/namespace অবশিষ্ট থেকে যেতে পারে, যার জন্য পরের বার "mn -c" দিয়ে manually cleanup করতে হতে পারে।',
  },
  "subnet-run-script": {
    id: "subnet-run-script",
    command: "python3 simple_topo.py",
    category: "Software-Defined Networking",
    story:
      "পুরো blueprint ফাইলটা (addSwitch, addHost, addLink, net.start(), CLI, net.stop() — সব মিলিয়ে) একসাথে চালানোর command এটাই — পুরো custom network তৈরি ও চালু হয়ে যায় এক command-এই।",
    tokens: [
      {
        token: "python3",
        meaning: "Python 3 interpreter দিয়ে script চালানো",
      },
      {
        token: "simple_topo.py",
        meaning: "আমাদের লেখা কাস্টম topology script-এর filename",
      },
    ],
    tip: "💡 Mininet CLI-তে `mn --topo=...`-এর মতো built-in shortcut না দিয়ে, নিজের Python script চালানোর এই পদ্ধতি তখনই দরকার হয় যখন টপোলজি built-in template-এর চেয়ে বেশি কাস্টমাইজড হয় — যেমন এখানে দুই ভিন্ন subnet-এর host।",
  },
  "subnet-ping-same": {
    id: "subnet-ping-same",
    command: "h20 ping -c 3 h21",
    category: "Software-Defined Networking",
    story:
      "একই বিল্ডিং ব্লকের দুই প্রতিবেশী একে অপরকে সরাসরি ডাকছে — কোনো router বা মধ্যস্থতাকারী ছাড়াই, কারণ তারা একই subnet-এ আছে। এটা তাই সবসময় সফল হওয়া উচিত।",
    tokens: [
      {
        token: "h20",
        meaning: "কোন host থেকে command চালানো হচ্ছে",
      },
      {
        token: "ping",
        meaning:
          "আরেকটা host reachable কিনা, ICMP echo request/reply দিয়ে যাচাই করা",
      },
      {
        token: "-c 3",
        meaning:
          "ঠিক ৩টা ping packet পাঠিয়ে থেমে যাবে (না হলে ping অনন্তকাল চলতেই থাকবে)",
      },
      {
        token: "h21",
        meaning: "destination host (একই subnet, 192.168.1.0/24)",
      },
    ],
    tip: "💡 -c না দিলে ping Ctrl+C না করা পর্যন্ত চলতেই থাকবে — তাই টেস্টের সময় -c দিয়ে একটা নির্দিষ্ট সংখ্যায় থামানো সুবিধাজনক।",
  },
  "subnet-ping-cross": {
    id: "subnet-ping-cross",
    command: "h20 ping h10",
    category: "Software-Defined Networking",
    story:
      "এটা একদম অন্য ব্লকের একজনকে ফোন করার চেষ্টার মতো, কিন্তু কোনো router (operator) ছাড়া কল connect-ই হয় না — h20-এর IP স্ট্যাক বুঝে ফেলে h10 তার নিজের subnet-এর বাইরে, আর কোনো default gateway না থাকায় প্যাকেট পাঠানোরই উপায় থাকে না।",
    tokens: [
      {
        token: "h20",
        meaning: "source host (subnet 192.168.1.0/24)",
      },
      {
        token: "ping h10",
        meaning:
          "destination host, কিন্তু ভিন্ন subnet-এ (192.168.0.0/24) — -c না দেওয়ায় এটা Ctrl+C না করা পর্যন্ত চলতেই থাকবে, reply না পেয়েই",
      },
    ],
    tip: "⚠️ এই ব্যর্থতা হয় কারণ br0 একটা Layer 2 device, কোনো router/L3 configuration ছাড়া দুই আলাদা subnet-এর মধ্যে route করতে পারে না — এটাই এই পুরো ল্যাবের মূল শিক্ষা।",
  },
  "subnet-ifconfig": {
    id: "subnet-ifconfig",
    command: "h20 ifconfig",
    category: "Software-Defined Networking",
    story:
      "নিজের বাসার নামফলক চেক করার মতো — কোন host-এর কী IP address, কী MAC address বরাদ্দ হয়েছে তা দেখতে।",
    tokens: [
      {
        token: "h20",
        meaning: "কোন host-এর ভেতরে command চালানো হবে",
      },
      {
        token: "ifconfig",
        meaning:
          "সেই host-এর network interface-গুলোর IP address, MAC address ইত্যাদি তথ্য দেখানোর command",
      },
    ],
    tip: "💡 h20 আর h10-এ ifconfig চালিয়ে compare করলে স্পষ্ট দেখা যায় তারা দুই আলাদা subnet রেঞ্জে (192.168.1.x বনাম 192.168.0.x) আছে।",
  },
  "subnet-net-links": {
    id: "subnet-net-links",
    command: "net",
    category: "Software-Defined Networking",
    story:
      'এটা "কে কার সাথে তার দিয়ে যুক্ত" তার একটা সংক্ষিপ্ত ম্যাপ দেখার মতো — পুরো টপোলজির overview।',
    tokens: [
      {
        token: "net",
        meaning:
          "Mininet CLI-এর বিল্ট-ইন command, পুরো network-এ কোন node কোন node-এর সাথে (কোন interface দিয়ে) কানেক্টেড তার summary দেখায়",
      },
    ],
    tip: "💡 এই command দিয়ে সহজেই যাচাই করা যায় যে সত্যিই ৪টা host-ই আলাদা আলাদাভাবে br0-এর সাথে সরাসরি কানেক্টেড কিনা।",
  },
  "subnet-pingall": {
    id: "subnet-pingall",
    command: "pingall",
    category: "Software-Defined Networking",
    story:
      "এটা একটা বড় ফায়ার-ড্রিল রোল-কলের মতো — নেটওয়ার্কের প্রতিটা host জোড়ার মধ্যে একসাথে ping চালিয়ে দেখা হয় কে কাকে শুনতে পাচ্ছে (reachable) আর কে পাচ্ছে না।",
    tokens: [
      {
        token: "pingall",
        meaning:
          "Mininet CLI-এর বিল্ট-ইন command — network-এর প্রতিটা host-pair-এর মধ্যে ping চালিয়ে পুরো connectivity matrix (কে কার সাথে reachable) একসাথে দেখায়",
      },
    ],
    tip: "⚠️ এই ল্যাবে pingall-এর output মিশ্র (partial) হবে — একই subnet-এর জোড়াগুলো সফল, কিন্তু ভিন্ন subnet-এর জোড়াগুলো routing না থাকায় ব্যর্থ হবে।",
  },
  "arp-chmod-x-topo": {
    id: "arp-chmod-x-topo",
    command: "chmod +x arp_topo.py",
    category: "Software-Defined Networking",
    story:
      'ধরো তুমি একটা লিখিত রেসিপি/নির্দেশিকা (script) লিখেছো, কিন্তু সেটা এখনো শুধু কাগজের লেখা — নিজে থেকে কিছু করতে পারে না। "chmod +x" ঠিক সেই লেখাকে একটা "কাজ করতে পারা রোবট"-এ রূপান্তর করার permission (execute permission) দেয়, যাতে Linux ওটাকে শুধু text file না ভেবে, সরাসরি চালানোর মতো একটা program হিসেবে ট্রিট করে।',
    tokens: [
      {
        token: "chmod",
        meaning: '"change mode" — file/folder-এর permission বদলানোর command',
      },
      {
        token: "+x",
        meaning:
          'existing permission-এ "execute" (চালানোর) ক্ষমতা যোগ করে — owner/group/others সবার জন্যই যোগ হয়, আগের permission মুছে যায় না',
      },
      {
        token: "arp_topo.py",
        meaning:
          "Mininet টপোলজি সংজ্ঞায়িত করা Python script, যার permission বদলানো হচ্ছে",
      },
    ],
    tip: "💡 Tip: এই lab-এ script-টা আসলে `sudo python3 arp_topo.py` দিয়েই চালানো হয়েছে, তাই +x টেকনিক্যালি বাধ্যতামূলক না — কিন্তু convention হিসেবে +x দেওয়া থাকলে পরে `./arp_topo.py` দিয়েও সরাসরি (shebang ব্যবহার করে) চালানো যায়।",
  },
  "arp-run-topo": {
    id: "arp-run-topo",
    command: "sudo python3 arp_topo.py",
    category: "Software-Defined Networking",
    story:
      'Mininet যখন চলে, তখন সে Linux kernel-এর ভেতরে একদম নতুন করে virtual switch, virtual host, virtual link তৈরি করে — অনেকটা একজন পরিচালক শূন্য থেকে একটা মিনি-শহর বানানোর মতো, যেখানে প্রতিটা বাড়ি (host) আর রাস্তা (link) আগে থেকে ছিলই না। এরকম kernel-level virtual device বানাতে admin (root) ক্ষমতা লাগে, তাই "sudo" দিয়ে চালাতে হয়।',
    tokens: [
      {
        token: "sudo",
        meaning:
          "root/super-user হিসেবে command চালানো — kernel network namespace/interface তৈরি করতে admin ক্ষমতা লাগে বলে দরকার",
      },
      {
        token: "python3",
        meaning: "script চালানোর জন্য Python 3 interpreter",
      },
      {
        token: "arp_topo.py",
        meaning:
          "টপোলজি define করা script — চালালে Mininet নেটওয়ার্ক শুরু হয়ে তার নিজস্ব CLI (mininet>) খুলে যায়",
      },
    ],
    tip: '💡 Tip: script সফলভাবে চললে prompt বদলে "mininet>" হয়ে যায় — এখান থেকেই h1, h2-এর মতো host-এর নাম লিখে সরাসরি তাদের ভেতরে কমান্ড চালানো যায়।',
  },
  "arp-n": {
    id: "arp-n",
    command: "h1 arp -n",
    category: "Software-Defined Networking",
    story:
      'প্রতিটা host নিজের একটা ছোট্ট "notebook" (ARP cache) রাখে, যেখানে সে আগে যাদের বাসার নম্বর (MAC address) একবার জিজ্ঞেস করে জেনেছে, তাদের IP-র পাশে সেটা টুকে রাখে। "arp -n" মানে হলো সেই notebook-টা দেখতে চাওয়া — আর "-n" বলে দেয় "সুন্দর নাম খোঁজার জন্য সময় নষ্ট কোরো না, শুধু raw সংখ্যাগুলোই (IP) দেখাও"। এছাড়া Mininet CLI-তে যেকোনো কমান্ডের আগে host-এর নাম লিখলে (যেমন এখানে h1) সেটা ঠিক সেই host-এর ভেতরেই চলে, অন্য কোনো host-এ না।',
    tokens: [
      {
        token: "h1",
        meaning:
          'Mininet CLI syntax — "<host> <command>" লিখলে command-টা শুধু h1-এর namespace-এর ভেতরে চলে',
      },
      {
        token: "arp",
        meaning: "ARP cache দেখা/পরিবর্তন করার command",
      },
      {
        token: "-n",
        meaning:
          '"numeric" — hostname resolve করার চেষ্টা না করে সরাসরি সংখ্যায় IP address দেখায় (দ্রুত হয়)',
      },
    ],
    tip: "⚠️ শুরুতে h1-এর ARP cache খালি থাকবে, কারণ এখনো কোনো communication হয়নি — ping করার পরই এখানে নতুন entry যোগ হবে।",
  },
  "arp-ping-c1": {
    id: "arp-ping-c1",
    command: "h1 ping -c1 10.0.0.2",
    category: "Software-Defined Networking",
    story:
      'ধরো তুমি কারো বাসার দরজায় একবার মাত্র টোকা দিয়ে দেখছো সে বাসায় আছে কিনা, বারবার না দিয়ে। "ping -c1" ঠিক তাই করে — মাত্র একটা ICMP echo request পাঠিয়ে থেমে যায়। কিন্তু h1 এখনো h2-এর MAC address জানে না, তাই kernel নিজে থেকেই এই ping-এর আগে একটা ARP request পাঠিয়ে h2-এর MAC খুঁজে নেয় — ping-টা শুধু সেই ARP resolution-কে trigger করার উপলক্ষ্য।',
    tokens: [
      {
        token: "h1",
        meaning: "কোন host থেকে ping পাঠানো হচ্ছে (Mininet CLI syntax)",
      },
      {
        token: "ping",
        meaning:
          "ICMP echo request/reply দিয়ে connectivity টেস্ট করার command",
      },
      {
        token: "-c1",
        meaning:
          "count 1 — মাত্র ১টা echo request পাঠিয়ে থেমে যাবে (-c আর সংখ্যার মাঝে space লাগা বাধ্যতামূলক না)",
      },
      {
        token: "10.0.0.2",
        meaning: "destination IP — এখানে h2-এর address",
      },
    ],
    tip: '💡 Tip: ping নিজে ARP resolve করে না — এটা শুধু kernel-কে বলে "এই IP-তে packet পাঠাও"; MAC না জানা থাকলে kernel স্বয়ংক্রিয়ভাবে একটা ARP request পাঠিয়ে সেটা resolve করে নেয়, তারপরই আসল ping যায়।',
  },
  "arp-ip-neigh-flush": {
    id: "arp-ip-neigh-flush",
    command: "h1 ip neigh flush all",
    category: "Software-Defined Networking",
    story:
      'ধরো তোমার ঠিকানার notebook-টা পুরোপুরি মুছে একদম নতুন, সাদা পাতা থেকে আবার শুরু করতে চাও। "ip neigh flush all" ঠিক সেটাই করে — h1-এর শেখা সব ARP entry (IP-to-MAC mapping) একসাথে মুছে দেয়, যাতে পরের বার communicate করার সময় আবার নতুন করে ARP resolution দেখা যায়।',
    tokens: [
      {
        token: "ip",
        meaning:
          "modern iproute2 command suite — পুরনো net-tools (ifconfig/arp)-এর replacement",
      },
      {
        token: "neigh",
        meaning:
          '"neighbor table" — Linux kernel-এর ভাষায় ARP cache-কেই বোঝায় (IPv6-এর neighbor discovery-ও এর অংশ)',
      },
      {
        token: "flush",
        meaning: "entry মুছে ফেলার সাব-কমান্ড",
      },
      {
        token: "all",
        meaning: "নির্দিষ্ট একটা entry না, বরং পুরো neighbor table-ই মুছে দেয়",
      },
    ],
    tip: '💡 Tip: এটা পুরনো "arp -d <ip>" (একটা একটা করে entry মোছা)-এর বদলে একবারেই সব মুছে ফেলার modern উপায় — পরে `h1 arp -n` চালালে dekha jabe cache আবার খালি।',
  },
  "arp-ifconfig": {
    id: "arp-ifconfig",
    command: "h2 ifconfig",
    category: "Software-Defined Networking",
    story:
      'ARP cache ঘুরিয়ে জিজ্ঞেস করার বদলে, এখানে সরাসরি h2-কে বলা হচ্ছে "তোমার নিজের ID card (interface info) দেখাও" — এতে h2-এর নিজের MAC address (HWaddr) সরাসরি দেখা যায়, অন্য host-এর ARP resolution-এর উপর নির্ভর না করেই।',
    tokens: [
      {
        token: "h2",
        meaning: "কোন host-এর interface info দেখানো হচ্ছে",
      },
      {
        token: "ifconfig",
        meaning:
          "legacy (net-tools) network interface কনফিগারেশন/তথ্য দেখানোর command — IP, MAC (HWaddr/ether), statistics দেখায়",
      },
    ],
    tip: "⚠️ ifconfig deprecated হলেও Mininet-এর light-weight host image-এ এখনো default থাকে — modern system-এ এর বদলে `ip addr` / `ip link` ব্যবহার করা হয়।",
  },
  "arp-s-static": {
    id: "arp-s-static",
    command: "h1 arp -s 10.0.0.2 <h2-mac-address>",
    category: "Software-Defined Networking",
    story:
      'সাধারণত কারো বাসার নম্বর জানতে হলে আগে তাকে জিজ্ঞেস করতে হয় (ARP request/reply) — কিন্তু "arp -s" দিয়ে তুমি নিজেই সরাসরি notebook-এ একটা নম্বর স্থায়ীভাবে লিখে দিচ্ছো, কাউকে জিজ্ঞেস না করেই। এই entry আর কখনো নিজে থেকে পুরনো (expire) হয়ে যায় না, যতক্ষণ না ম্যানুয়ালি মুছে ফেলা হয়।',
    tokens: [
      {
        token: "arp",
        meaning: "ARP cache ম্যানেজ করার command",
      },
      {
        token: "-s",
        meaning:
          '"static" — dynamic ARP resolution-এর অপেক্ষা না করে ম্যানুয়ালি একটা স্থায়ী entry যোগ করা',
      },
      {
        token: "10.0.0.2",
        meaning: "যে IP-র জন্য entry যোগ হচ্ছে",
      },
      {
        token: "<h2-mac-address>",
        meaning:
          "সেই IP-র সাথে বেঁধে দেওয়া MAC address — আগের `h2 ifconfig` থেকে পাওয়া",
      },
    ],
    tip: "💡 Interview tip: static ARP entry ARP spoofing/poisoning attack ঠেকাতে সাহায্য করতে পারে, কারণ কোনো forged ARP reply দিয়ে এই mapping overwrite করা যায় না — critical host-এর জন্য এটা একটা security practice।",
  },
  "arp-mn-c": {
    id: "arp-mn-c",
    command: "sudo mn -c",
    category: "Software-Defined Networking",
    story:
      'নাটক শেষে stage crew যেমন মঞ্চের সব props/set সরিয়ে পরের শো-এর জন্য জায়গা খালি করে দেয়, "mn -c" ঠিক তেমনি আগের Mininet session-এর রেখে যাওয়া virtual switch, interface, namespace, process — সব পরিষ্কার করে ফেলে, যাতে নতুন করে পরিষ্কার মঞ্চ থেকে আরেকটা simulation শুরু করা যায়।',
    tokens: [
      {
        token: "sudo",
        meaning:
          "kernel network namespace/interface পরিষ্কার করতে root ক্ষমতা লাগে",
      },
      {
        token: "mn",
        meaning:
          "Mininet-এর নিজস্ব command-line utility — Python API থেকে আলাদা, সরাসরি terminal থেকে চালানো যায়",
      },
      {
        token: "-c",
        meaning:
          '"clean" — আগের যেকোনো Mininet run-এর leftover virtual device/process মুছে ফেলে',
      },
    ],
    tip: '⚠️ Tip: আগের session Ctrl-C বা crash দিয়ে বন্ধ হলে প্রায়ই পরের বার "device already exists" error আসে — তার আগেই `sudo mn -c` চালানো ভালো অভ্যাস।',
  },
  "vlan-ifconfig-inet-0": {
    id: "vlan-ifconfig-inet-0",
    command: "ifconfig h1-eth0 inet 0",
    category: "Software-Defined Networking",
    story:
      'VLAN tag বসানোর আগে host-এর পুরনো "ID card" (plain IP address) ফেরত নিয়ে নিতে হয় — ঠিক যেমন কাউকে নতুন department-specific ID card দেওয়ার আগে তার পুরনো সাধারণ ID card জমা নিতে হয়। এই command দিয়ে default interface থেকে IP সরিয়ে ফেলা হচ্ছে, যাতে আসল IP শুধু পরে তৈরি হতে যাওয়া VLAN-tagged sub-interface-এই বসে।',
    tokens: [
      {
        token: "ifconfig",
        meaning: "legacy (net-tools) network interface কনফিগারেশন tool",
      },
      {
        token: "h1-eth0",
        meaning:
          "host-এর default (parent) network interface — Mininet প্রতিটা host-কে স্বয়ংক্রিয়ভাবে এই নামে interface দেয়",
      },
      {
        token: "inet 0",
        meaning:
          'interface-এর IPv4 address "0" সেট করা, যা কার্যত এর থেকে existing IP সরিয়ে দেয়',
      },
    ],
    tip: "💡 Tip: এই তিনটা ধাপ (IP সরানো → VLAN sub-interface বানানো → নতুন interface-এ IP বসানো) একসাথেই VLANHost ক্লাসের config() method-এ স্বয়ংক্রিয়ভাবে চলে, প্রতিবার নতুন host তৈরি হওয়ার সময়।",
  },
  "vlan-vconfig-add": {
    id: "vlan-vconfig-add",
    command: "vconfig add h1-eth0 100",
    category: "Software-Defined Networking",
    story:
      'ধরো একটা অফিসের envelope-এ রঙিন স্টিকার লাগিয়ে দেওয়া হয়, যাতে mail room বুঝতে পারে এটা কোন department-এর জন্য। "vconfig add" ঠিক সেই কাজটাই করে — parent interface-এর উপর একটা নতুন "VLAN sub-interface" তৈরি করে, যেটা দিয়ে বের হওয়া প্রতিটা packet স্বয়ংক্রিয়ভাবে নির্দিষ্ট VLAN ID-র ট্যাগ পরে বের হয়, যাতে switch পরে সেটা সঠিক VLAN-এ আলাদা করতে পারে।',
    tokens: [
      {
        token: "vconfig",
        meaning:
          '802.1Q VLAN configuration utility — "vlan" package দিয়ে install হয়',
      },
      {
        token: "add",
        meaning: "নতুন একটা VLAN-tagged sub-interface তৈরি করার সাব-কমান্ড",
      },
      {
        token: "h1-eth0",
        meaning:
          "parent/base interface, যার উপরে নতুন VLAN interface বসানো হচ্ছে",
      },
      {
        token: "100",
        meaning:
          "VLAN ID — এই sub-interface দিয়ে যাওয়া প্রতিটা frame-এর 802.1Q tag-এ এই সংখ্যাই বসবে",
      },
    ],
    tip: '💡 Tip: নতুন তৈরি হওয়া interface-এর নাম হয় "parent.vlanid" ফরম্যাটে, অর্থাৎ এখানে h1-eth0.100 — এরপরের সব কনফিগারেশন (যেমন IP বসানো) এই নতুন নামেই করতে হয়।',
  },
  "vlan-ifconfig-tagged-inet": {
    id: "vlan-ifconfig-tagged-inet",
    command: "ifconfig h1-eth0.100 inet 10.0.0.1",
    category: "Software-Defined Networking",
    story:
      "VLAN-tagged sub-interface তৈরি হয়ে যাওয়ার পর, এবার তাকে একটা আসল ঠিকানা (IP) দেওয়া হচ্ছে — ঠিক যেমন কোন department-এ কেউ belong করে সেটা ঠিক হওয়ার পরই তাকে সেই department-এর ঠিকানা/room number দেওয়া হয়। এই IP থেকে পাঠানো প্রতিটা frame এখন থেকেই স্বয়ংক্রিয়ভাবে VLAN 100-এর tag নিয়ে বের হবে।",
    tokens: [
      {
        token: "ifconfig",
        meaning: "interface configuration tool",
      },
      {
        token: "h1-eth0.100",
        meaning:
          "নতুন তৈরি হওয়া VLAN-tagged sub-interface (parent.vlanid নামে)",
      },
      {
        token: "inet 10.0.0.1",
        meaning: "এই tagged interface-এ নির্দিষ্ট IPv4 address বসানো হচ্ছে",
      },
    ],
    tip: '⚠️ Tip: এই IP আর parent interface (h1-eth0)-এর কোনো সম্পর্ক নেই — parent interface-এর IP আগেই "inet 0" দিয়ে সরিয়ে ফেলা হয়েছিল, তাই সব traffic এখন শুধু tagged sub-interface দিয়েই যায়।',
  },
  "vlan-apt-install": {
    id: "vlan-apt-install",
    command: "sudo apt-get install vlan",
    category: "Software-Defined Networking",
    story:
      'একজন কাঠমিস্ত্রি নির্দিষ্ট একটা কাজ করার আগে প্রথমে সেই বিশেষ hand-tool-টা কিনে আনে — "vconfig" command আর VLAN tagging ক্ষমতা by default Linux-এ থাকে না, তাই কাজ শুরুর আগে "vlan" নামের package install করে নিতে হয়।',
    tokens: [
      {
        token: "sudo",
        meaning: "system-level package install করতে root ক্ষমতা লাগে",
      },
      {
        token: "apt-get install",
        meaning:
          "Debian/Ubuntu-এর package manager দিয়ে নতুন software install করার command",
      },
      {
        token: "vlan",
        meaning:
          "নির্দিষ্ট package-এর নাম — এটাই vconfig utility আর 802.1Q (8021q) kernel module সাপোর্ট দেয়",
      },
    ],
    tip: "⚠️ Tip: এই package install না থাকলে vlanhost.py-এর ভেতরের self.cmd('vconfig add ...') কলগুলো silently fail করবে, আর পুরো টপোলজি বানানো ভেঙে যাবে — তাই এটা সবার আগে করতে হয়।",
  },
  "vlan-run-topo": {
    id: "vlan-run-topo",
    command: "sudo python3 simulate_vlan_network.py",
    category: "Software-Defined Networking",
    story:
      'এই command দিয়েই Mininet একটামাত্র switch-এর নিচে দুইটা আলাদা "department" (VLAN 100 ও VLAN 101) তৈরি করে — প্রতিটা host বানানোর সময় ভেতরে ভেতরে স্বয়ংক্রিয়ভাবে উপরের তিনটা VLAN tagging কমান্ড চলে যায়, তারপর testing-এর জন্য Mininet CLI খুলে যায়।',
    tokens: [
      {
        token: "sudo",
        meaning:
          "virtual network device তৈরি ও vconfig/ifconfig কল করতে root ক্ষমতা লাগে",
      },
      {
        token: "python3",
        meaning: "script চালানোর জন্য Python 3 interpreter",
      },
      {
        token: "simulate_vlan_network.py",
        meaning: "VLANStarTopo import করে Mininet শুরু করা ও CLI খোলা script",
      },
    ],
    tip: '💡 Tip: prompt "mininet>" হয়ে গেলে বোঝা যাবে সব host সফলভাবে তাদের VLAN tagged interface নিয়ে চালু হয়ে গেছে — এখান থেকেই connectivity টেস্ট শুরু করা যায়।',
  },
  "vlan-ping-c3": {
    id: "vlan-ping-c3",
    command: "h1_100 ping -c 3 h2_100",
    category: "Software-Defined Networking",
    story:
      "একই department-এ (VLAN 100) বসা দুইজন সহকর্মী সরাসরি একে অপরকে ফোন করতে পারে — কিন্তু এই একই command যদি অন্য department-এর (VLAN 101) কাউকে ফোন করতে চায়, অফিসের internal phone system (switch) সেই call-ই connect করবে না, কোনো error ছাড়াই শুধু response আসবে না।",
    tokens: [
      {
        token: "h1_100",
        meaning:
          'source host — নামের "_100" অংশ দিয়ে বোঝানো হচ্ছে এটা VLAN 100-এর সদস্য',
      },
      {
        token: "ping",
        meaning: "ICMP echo দিয়ে connectivity টেস্ট করার command",
      },
      {
        token: "-c 3",
        meaning:
          "count 3 — মোট ৩টা echo request পাঠিয়ে থামবে (এখানে -c আর সংখ্যার মাঝে space আছে, উভয় ফরম্যাটই valid)",
      },
      {
        token: "h2_100",
        meaning:
          "destination host — একই VLAN 100-এর সদস্য হলে ping succeed করে, অন্য VLAN-এর host হলে (যেমন h1_101) fail করে",
      },
    ],
    tip: "⚠️ Tip: ঠিক একই command-এ শুধু destination host বদলে (h1_101) cross-VLAN পিং করলে কোনো error message আসে না — শুধু timeout/packet loss হয়, কারণ switch tagged-100 traffic কখনো tagged-101 port-এ forward করে না।",
  },
  "vlan-pingall": {
    id: "vlan-pingall",
    command: "pingall",
    category: "Software-Defined Networking",
    story:
      'একের পর এক প্রতিটা জোড়া host আলাদা করে টেস্ট করার বদলে, একটা একসাথে "roll call" করে ফেলা — "pingall" network-এর প্রতিটা host-কে বাকি সবার সাথে একবার করে ping করিয়ে পুরো network-এর reachability এক নজরে দেখিয়ে দেয়।',
    tokens: [
      {
        token: "pingall",
        meaning:
          "Mininet CLI-এর নিজস্ব built-in command (কোনো host prefix লাগে না) — network-এর প্রতিটা host জোড়ায় জোড়ায় একবার করে ping করে",
      },
    ],
    tip: '💡 Tip: এই lab-এ output-এ "66% dropped (4/12 received)" দেখা গেলে এটাই প্রমাণ করে VLAN isolation ঠিকমতো কাজ করছে — শুধু same-VLAN জোড়াগুলোই (4টা) succeed করেছে, বাকি cross-VLAN জোড়াগুলো ব্লক হয়ে গেছে।',
  },
  "echo-append": {
    id: "echo-append",
    command:
      'echo "DB_HOST=staging-db.poridhi.io" >> deploylab/configs/api.conf',
    category: "File & Directory Management",
    story:
      'আগে "echo ... > file" দিয়ে শিখেছিলে কীভাবে file-এর পুরনো content মুছে নতুন করে লেখা যায়। কিন্তু এখানে একটা config file-এ একটার পর একটা line যোগ করতে হচ্ছে — প্রতিবার ">" দিলে আগের সব line মুছে যাবে! তাই ">>" ব্যবহার করা হয় — এটা একটা double arrow, যেটা বলে দেয় "আগের লেখা অক্ষত রেখে, শেষে নতুন line জুড়ে দাও", ঠিক যেমন ডায়েরির পুরনো পাতা না ছিঁড়ে পরের পাতায় নতুন entry লেখা।',
    tokens: [
      {
        token: "echo",
        meaning: "terminal-এ লেখা print করার command",
      },
      {
        token: '"DB_HOST=staging-db.poridhi.io"',
        meaning: "যে line/text টা file-এর শেষে যোগ হবে",
      },
      {
        token: ">>",
        meaning:
          '"append" redirect operator — file-এর আগের সব content রেখে দিয়ে, শেষে নতুন line জুড়ে দেয় (file না থাকলে নতুন বানিয়ে নেয়)',
      },
      {
        token: "deploylab/configs/api.conf",
        meaning: "কোন file-এ append হবে",
      },
    ],
    tip: '⚠️ খালি string append করতে চাইলে (ফাঁকা লাইন যোগ করতে) "echo "" >> file" ব্যবহার করা যায় — quote-এর ভেতরে কিছু না লিখলে শুধু একটা newline যোগ হয়।',
  },
  "sed-s-basic": {
    id: "sed-s-basic",
    command: "sed 's/staging/prod/' deploylab/configs/api.conf",
    category: "Text Processing",
    story:
      'sed হচ্ছে একজন নিখুঁত proof-reader, যে একটা বই (file) না বদলেই, পড়ার সময় চোখের সামনে শব্দ বদলে দেখায়। "s/old/new/" হলো তার সবচেয়ে basic নির্দেশ — "old" শব্দটা খুঁজে "new" দিয়ে বদলে দাও। কিন্তু মনে রাখা জরুরি, এটা প্রতি লাইনে শুধু প্রথমবার যে match পাবে সেটাই বদলাবে, আর আসল file-এ কিছু লেখে না — শুধু terminal-এ ফলাফল দেখায়।',
    tokens: [
      {
        token: "sed",
        meaning:
          '"Stream EDitor" — text stream/file line-by-line পড়ে, pattern অনুযায়ী বদলানোর command',
      },
      {
        token: "'s/staging/prod/'",
        meaning:
          '"substitute" command — "s/খুঁজবো কী/বদলে কী বসাবো/" ফরম্যাটে লেখা হয়; "/" দিয়ে তিনটা অংশ আলাদা করা থাকে',
      },
      {
        token: "deploylab/configs/api.conf",
        meaning: "কোন file-এ pattern apply হবে",
      },
    ],
    tip: '⚠️ Interview trap: "g" flag ছাড়া sed s/// প্রতি লাইনে শুধু প্রথম match-টাই বদলায়, বাকিগুলো অক্ষত থাকে — একই লাইনে একাধিক "staging" থাকলে সবগুলো বদলাতে "g" flag লাগবে।',
  },
  "sed-s-g": {
    id: "sed-s-g",
    command: "sed 's/staging/prod/g' deploylab/demo.txt",
    category: "Text Processing",
    story:
      'আগের entry-তে দেখেছিলে sed প্রতি লাইনে শুধু প্রথম match বদলায়। কিন্তু demo.txt-এর একই লাইনে "staging" শব্দটা তিনবার আছে — সবগুলো বদলাতে চাইলে "g" (global) flag যোগ করতে হয়, যেটা বলে দেয় "শুধু প্রথমটা না, পুরো লাইনে যতবার পাবে ততবারই বদলাও"।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "'s/staging/prod/g'",
        meaning:
          '"substitute" command; শেষের "g" (global) flag — প্রতি লাইনে সব match বদলাবে, শুধু প্রথমটা না',
      },
      {
        token: "deploylab/demo.txt",
        meaning: "কোন file-এ apply হবে",
      },
    ],
    tip: '💡 Tip: "g" ছাড়া sed s/// শুধু প্রথম occurrence বদলায় — একই লাইনে বারবার থাকা শব্দ পুরোপুরি বদলাতে "g" flag অবশ্যই লাগবে।',
  },
  "sed-line-addr": {
    id: "sed-line-addr",
    command: "sed '2s/staging/prod/' deploylab/configs/worker.conf",
    category: "Text Processing",
    story:
      'পুরো file জুড়ে না বদলে, যদি শুধু একটা নির্দিষ্ট লাইনেই বদল করতে চাও — যেমন একটা বইয়ের শুধু ২ নম্বর পাতাতেই দাগ দেওয়া — তাহলে "s///" কমান্ডের আগে লাইন নম্বর (address) বসিয়ে দাও। "2s/.../" মানে "শুধু ২ নম্বর লাইনে এই substitution চালাও, বাকি লাইন স্পর্শও করো না"।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "2",
        meaning:
          "address — কোন লাইনে substitution চালানো হবে (এখানে শুধু লাইন ২)",
      },
      {
        token: "s/staging/prod/",
        meaning:
          "address-এর পরে বসানো substitute command — শুধু ওই address-এর লাইনেই চলবে",
      },
      {
        token: "deploylab/configs/worker.conf",
        meaning: "কোন file",
      },
    ],
    tip: "💡 Tip: address ছাড়া sed s/// পুরো file-এর প্রতিটা লাইনে চলে; address দিলে শুধু সেই address-এ scope সীমাবদ্ধ হয়ে যায়।",
  },
  "sed-range-addr": {
    id: "sed-range-addr",
    command: "sed '4,6s/staging/prod/' deploylab/configs/worker.conf",
    category: "Text Processing",
    story:
      'একটা লাইন না, বরং কয়েকটা লাইনের একটা রেঞ্জ (যেমন বইয়ের ৪ থেকে ৬ পাতা)-তেই বদল চালাতে চাইলে, দুইটা লাইন নম্বর কমা দিয়ে লিখে দাও। "4,6" মানে "৪ নম্বর লাইন থেকে ৬ নম্বর লাইন পর্যন্ত — শুধু এই রেঞ্জেই substitution চালাও"।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "4,6",
        meaning:
          'range address — "শুরুর লাইন,শেষের লাইন" ফরম্যাটে, এই দুই লাইনের মধ্যবর্তী (দুইটাসহ) সব লাইনে command চলবে',
      },
      {
        token: "s/staging/prod/",
        meaning: "range address-এর পরে বসানো substitute command",
      },
      {
        token: "deploylab/configs/worker.conf",
        meaning: "কোন file",
      },
    ],
    tip: '💡 Tip: single line address (যেমন "2s/.../") আর range address ("4,6s/.../") — দুটোই একই নিয়মে কাজ করে, শুধু address অংশটা ভিন্ন।',
  },
  "sed-dollar-addr": {
    id: "sed-dollar-addr",
    command: "sed '$s/4/8/' deploylab/configs/worker.conf",
    category: "Text Processing",
    story:
      'ফাইলে মোট কয়টা লাইন আছে না জেনেও, "শেষ লাইনে" বদল করতে চাইলে "$" symbol ব্যবহার করা হয় — ঠিক যেমন বইয়ের last page-কে নির্দিষ্ট number না বলে শুধু "শেষ পাতা" বলা। "$" মানে "যেটাই শেষ লাইন হোক, সেখানেই এই command চালাও"।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "$",
        meaning: '"last line" address — ফাইলের শেষ লাইন বোঝানোর বিশেষ symbol',
      },
      {
        token: "s/4/8/",
        meaning: "শেষ লাইনে চালানো হবে এমন substitute command",
      },
      {
        token: "deploylab/configs/worker.conf",
        meaning: "কোন file",
      },
    ],
    tip: '💡 Tip: "$" sed-এ "শেষ লাইন" বোঝায়, কিন্তু regex-এর ভেতরে (যেমন grep "poridhi.io$") এটা "লাইনের শেষ" বোঝায় — দুটো আলাদা জায়গায় ব্যবহার হলেও concept একই: "শেষ"।',
  },
  "sed-pattern-addr": {
    id: "sed-pattern-addr",
    command: "sed '/^DB_/s/staging/prod/' deploylab/configs/worker.conf",
    category: "Text Processing",
    story:
      'লাইন নম্বর মুখস্থ না রেখেও, যদি "যেসব লাইন একটা নির্দিষ্ট শব্দ/pattern দিয়ে শুরু হয়" সেগুলোতেই বদল করতে চাও — regex pattern-কেই address বানানো যায়। "/^DB_/" মানে "যে লাইন DB_ দিয়ে শুরু হয়েছে" — sed শুধু সেই লাইনগুলো বেছে নিয়ে তাতেই substitution চালাবে।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "/^DB_/",
        meaning:
          'pattern address — regex দিয়ে বলে দেয় কোন লাইনগুলোতে command চলবে ("^" মানে লাইনের শুরু, তাই এটা "DB_ দিয়ে শুরু হওয়া লাইন" বোঝায়)',
      },
      {
        token: "s/staging/prod/",
        meaning: "pattern address-এর পরে বসানো substitute command",
      },
      {
        token: "deploylab/configs/worker.conf",
        meaning: "কোন file",
      },
    ],
    tip: '💡 Tip: লাইন নম্বর (2, 4,6) আর pattern ("/^DB_/") — দুটোই sed-এর address, শুধু একটা fixed position বোঝায় আরেকটা content-ভিত্তিক বাছাই করে।',
  },
  "sed-d-prefix": {
    id: "sed-d-prefix",
    command: "sed '/^DEBUG=/d' deploylab/configs/api.conf",
    category: "Text Processing",
    story:
      'কখনো পুরো একটা লাইনই ফেলে দিতে হয়, বদলানো না — যেমন একটা draft থেকে একটা পুরো paragraph কেটে ফেলা। "d" (delete) command ঠিক সেটাই করে। "/^DEBUG=/d" মানে "যে লাইন DEBUG= দিয়ে শুরু, সেই পুরো লাইনটাই বাদ দাও"।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "/^DEBUG=/",
        meaning: '"DEBUG=" দিয়ে শুরু হওয়া লাইন বেছে নেওয়া pattern address',
      },
      {
        token: "d",
        meaning:
          '"delete" command — address-এ match করা লাইনটা সম্পূর্ণ বাদ দিয়ে দেয়',
      },
      {
        token: "deploylab/configs/api.conf",
        meaning: "কোন file",
      },
    ],
    tip: '⚠️ Interview tip: "s///" বদলায় (আংশিক পরিবর্তন), "d" পুরো লাইনটাই উড়িয়ে দেয় — দুটো সম্পূর্ণ আলাদা কাজ, একই address-syntax দিয়ে ব্যবহার করা যায়।',
  },
  "sed-d-blank": {
    id: "sed-d-blank",
    command: "sed '/^$/d' deploylab/configs/api.conf",
    category: "Text Processing",
    story:
      'config file-এ readability-র জন্য রাখা ফাঁকা (blank) লাইনগুলো অনেক সময় processing-এর আগে সরিয়ে ফেলতে হয়। "^$" একটা বিশেষ regex — "^" (লাইনের শুরু) আর "$" (লাইনের শেষ) পাশাপাশি বসালে মানে দাঁড়ায় "শুরু আর শেষের মাঝে কিছুই নেই" — অর্থাৎ পুরোপুরি ফাঁকা লাইন।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "/^$/",
        meaning:
          '"^" (শুরু) আর "$" (শেষ) একসাথে বসিয়ে সম্পূর্ণ ফাঁকা লাইন বোঝানো pattern address',
      },
      {
        token: "d",
        meaning: "delete command — match করা (ফাঁকা) লাইন বাদ দেয়",
      },
      {
        token: "deploylab/configs/api.conf",
        meaning: "কোন file",
      },
    ],
    tip: '💡 Tip: "^$" regex-এর একটা খুব common idiom — "blank line" বোঝাতে প্রায় সব tool-এই (grep, sed, awk) এটা একইভাবে কাজ করে।',
  },
  "sed-d-comment": {
    id: "sed-d-comment",
    command: "sed '/^#/d' deploylab/configs/api.conf",
    category: "Text Processing",
    story:
      'config file-এর "#" দিয়ে শুরু হওয়া লাইনগুলো সাধারণত মানুষের জন্য লেখা comment/note — program এগুলো পড়ে না। deploy করার আগে এই "noise" সরিয়ে শুধু আসল config রাখতে "/^#/d" ব্যবহার হয় — "#" দিয়ে শুরু হওয়া প্রতিটা লাইন বাদ।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "/^#/",
        meaning:
          '"#" দিয়ে শুরু হওয়া (comment) লাইন বেছে নেওয়া pattern address',
      },
      {
        token: "d",
        meaning: "delete command",
      },
      {
        token: "deploylab/configs/api.conf",
        meaning: "কোন file",
      },
    ],
    tip: '💡 Tip: এই একই "/pattern/d" idiom দিয়েই আগের দুই entry-তে blank line আর নির্দিষ্ট prefix-এর লাইন বাদ দিয়েছিলে — শুধু pattern-টাই বদলায়, mechanism একই থাকে।',
  },
  "sed-n-p": {
    id: "sed-n-p",
    command: "sed -n '/^#/p' deploylab/configs/api.conf",
    category: "Text Processing",
    story:
      'sed default ভাবে প্রতিটা লাইন auto-print করে (তুমি বদল করো বা না করো)। "-n" দিলে সেই auto-print বন্ধ হয়ে যায় — তখন "p" (print) command ছাড়া কিছুই দেখা যাবে না। এভাবে "-n" + pattern address + "p" মিলিয়ে শুধু match হওয়া লাইনগুলোই বেছে বেছে দেখানো যায় — অনেকটা grep-এর মতো, কিন্তু sed দিয়ে।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "-n",
        meaning:
          '"no-autoprint" — sed-এর default (প্রতি লাইন auto-print করা) আচরণ বন্ধ করে দেয়',
      },
      {
        token: "/^#/p",
        meaning:
          '"#" দিয়ে শুরু হওয়া লাইন বেছে "p" (print) দিয়ে explicitly print করা',
      },
      {
        token: "deploylab/configs/api.conf",
        meaning: "কোন file",
      },
    ],
    tip: '⚠️ Interview trap: "-n" ছাড়া "sed \\\'/pattern/p\\\' file" চালালে match হওয়া লাইনগুলো দুইবার দেখাবে (একবার auto-print থেকে, একবার "p" থেকে) — তাই "-n" ছাড়া "p" ব্যবহার করলে duplicate output হয়, এটা খুব common ভুল।',
  },
  "sed-pipe-sed": {
    id: "sed-pipe-sed",
    command:
      "sed 's/staging/prod/g' deploylab/configs/worker.conf | sed -n '/prod/p'",
    category: "Text Processing",
    story:
      'একটা sed একসাথে দুইটা কাজ (বদলানো আর filter করা) সবসময় সহজে করতে পারে না — তাই দুইটা sed-কে pipe দিয়ে চেইন করা হয়: প্রথম sed পুরো file-এ "staging"-কে "prod" বদলে দেয়, তারপর সেই বদলানো output দ্বিতীয় sed-এর কাছে যায়, যে শুধু "prod" থাকা লাইনগুলোই filter করে দেখায়।',
    tokens: [
      {
        token: "sed 's/staging/prod/g'",
        meaning:
          'প্রথম sed — পুরো file-এ সব "staging"-কে "prod" দিয়ে বদলে stdout-এ output দেয়',
      },
      {
        token: "|",
        meaning:
          "pipe — প্রথম sed-এর output সরাসরি দ্বিতীয় sed-এর input হিসেবে পাঠায়",
      },
      {
        token: "sed -n '/prod/p'",
        meaning:
          'দ্বিতীয় sed — আগের output-এর মধ্যে থেকে শুধু "prod" থাকা লাইনগুলো filter করে দেখায়',
      },
    ],
    tip: "💡 Tip: এভাবে একাধিক sed/grep/awk কে pipe দিয়ে চেইন করা Linux-এর একটা মূল দর্শন — প্রতিটা tool একটা ছোট কাজ ভালোভাবে করে, আর pipe দিয়ে জোড়া লাগিয়ে জটিল কাজ করা হয়।",
  },
  "sed-i-g": {
    id: "sed-i-g",
    command: "sed -i 's/staging/prod/g' deploylab/configs/api.conf",
    category: "Text Processing",
    story:
      'এতক্ষণ sed শুধু terminal-এ বদলানো output দেখাচ্ছিল, আসল file-টা অক্ষতই ছিল। কিন্তু "-i" (in-place) flag দিলে sed নিজেই file-টা সরাসরি edit করে ফেলে — ঠিক যেমন একটা document-এ "Find & Replace" চেপে সরাসরি save করে ফেলা, আলাদা করে আর "Save As" করতে হয় না।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "-i",
        meaning:
          '"in-place" — output terminal-এ না দেখিয়ে, সরাসরি file-টাই edit করে ফেলে',
      },
      {
        token: "'s/staging/prod/g'",
        meaning:
          '"staging"-এর সব occurrence "prod" দিয়ে বদলে দেওয়া substitute command',
      },
      {
        token: "deploylab/configs/api.conf",
        meaning: "কোন file সরাসরি edit হবে",
      },
    ],
    tip: '⚠️ Interview tip: "-i" মানে আসল file চিরস্থায়ীভাবে বদলে যাচ্ছে — এই flag ব্যবহারের আগে সবসময় একবার "-i" ছাড়া চালিয়ে output যাচাই করে নেওয়া ভালো অভ্যাস, নাহলে ভুল substitution-এ original data হারানোর ঝুঁকি থাকে।',
  },
  "sed-i-multi-delete": {
    id: "sed-i-multi-delete",
    command:
      "sed -i '/^DEBUG=/d; /^LOG_LEVEL=/d; /^$/d; /^#/d' deploylab/configs/api.conf",
    category: "Text Processing",
    story:
      'একটার পর একটা sed command আলাদা করে না চালিয়ে, সেমিকোলন (;) দিয়ে একাধিক command একসাথে এক sed call-এ চালানো যায় — ঠিক যেমন একটা checklist-এর চারটা কাজ একসাথে শেষ করা। এখানে DEBUG=, LOG_LEVEL= দিয়ে শুরু হওয়া লাইন, blank লাইন, আর comment লাইন — চারটাই এক কমান্ডে, "-i" দিয়ে সরাসরি file থেকে মুছে ফেলা হচ্ছে।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "-i",
        meaning: "in-place — সরাসরি file edit করে",
      },
      {
        token: ";",
        meaning: "সেমিকোলন — একাধিক sed expression-কে একই কমান্ডে আলাদা করে",
      },
      {
        token: "/^DEBUG=/d; /^LOG_LEVEL=/d; /^$/d; /^#/d",
        meaning:
          "চারটা আলাদা delete expression — যথাক্রমে DEBUG= দিয়ে শুরু, LOG_LEVEL= দিয়ে শুরু, ফাঁকা, আর comment লাইন বাদ দেয়",
      },
      {
        token: "deploylab/configs/api.conf",
        meaning: "কোন file",
      },
    ],
    tip: "💡 Tip: সেমিকোলনের বদলে প্রতিটা expression-এর আগে আলাদা \"-e\" flag দিয়েও (sed -e '...' -e '...') একই কাজ করা যায় — দুটোই সমান valid, সেমিকোলন শুধু সংক্ষিপ্ত।",
  },
  "sed-i-glob": {
    id: "sed-i-glob",
    command: "sed -i 's/staging/prod/g' deploylab/configs/*.conf",
    category: "Text Processing",
    story:
      'একটা একটা করে তিনটা file-এ আলাদা sed command না চালিয়ে, shell-এর wildcard "*" ব্যবহার করে এক কমান্ডেই configs/ folder-এর সবগুলো .conf file-এ (api, worker, scheduler) substitution চালানো হচ্ছে — "-i" থাকায় প্রতিটা file সরাসরি edit হয়ে যাবে।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "-i",
        meaning: "in-place edit flag",
      },
      {
        token: "'s/staging/prod/g'",
        meaning: "global substitute command",
      },
      {
        token: "deploylab/configs/*.conf",
        meaning:
          '"*" wildcard — configs/ folder-এর ভেতরের যেকোনো নামের .conf file; shell নিজেই এটাকে তিনটা আলাদা filename-এর list-এ বদলে sed-কে দেয়',
      },
    ],
    tip: '⚠️ Interview tip: এখানে "*.conf" wildcard-টা shell নিজেই expand করে — sed নিজে multiple file বোঝে না, সে শুধু একের পর এক filename argument পায় আর প্রতিটায় আলাদাভাবে "-i" দিয়ে edit করে।',
  },
  "sed-i-multi-glob": {
    id: "sed-i-multi-glob",
    command:
      "sed -i '/^DEBUG=/d; /^LOG_LEVEL=/d; /^$/d; /^#/d' deploylab/configs/*.conf",
    category: "Text Processing",
    story:
      "আগের দুইটা concept একসাথে — একাধিক delete-pattern (সেমিকোলন দিয়ে চেইন করা) আর wildcard দিয়ে একাধিক file, দুটোই মিলিয়ে, এক কমান্ডেই configs/ folder-এর সবগুলো .conf file থেকে DEBUG=, LOG_LEVEL=, blank, আর comment লাইন মুছে ফেলা হচ্ছে।",
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "-i",
        meaning: "in-place edit flag",
      },
      {
        token: "/^DEBUG=/d; /^LOG_LEVEL=/d; /^$/d; /^#/d",
        meaning: "সেমিকোলন দিয়ে জোড়া চারটা delete expression",
      },
      {
        token: "deploylab/configs/*.conf",
        meaning: "wildcard দিয়ে একসাথে সবগুলো .conf file",
      },
    ],
    tip: "💡 Tip: এটা পুরো লাবে শেখা সব concept-এর মিলন — address, delete, chaining (;), in-place (-i), আর wildcard — সবগুলো একসাথে একটা real-world bulk-cleanup কমান্ডে ব্যবহার হচ্ছে।",
  },
  "wc-l-multi": {
    id: "wc-l-multi",
    command: "wc -l ~/regexlab/contacts.txt ~/regexlab/events.log",
    category: "Search",
    story:
      'একটা না, দুইটা ফাইলের লাইন সংখ্যা একসাথে জানতে চাইলে "wc -l"-কে একাধিক filename দেওয়া যায় — এটা প্রতিটা file-এর জন্য আলাদা করে লাইন সংখ্যা দেখায়, আর সবশেষে দুটোর যোগফল (total) একটা আলাদা লাইনে দেখিয়ে দেয়, ঠিক যেমন একাধিক রসিদ একসাথে ধরলে একটা grand total বের হয়।',
    tokens: [
      {
        token: "wc",
        meaning: "word count command",
      },
      {
        token: "-l",
        meaning: "শুধু লাইন সংখ্যা গোনো",
      },
      {
        token: "~/regexlab/contacts.txt ~/regexlab/events.log",
        meaning:
          'একাধিক filename — space দিয়ে আলাদা করে দিলে প্রতিটার জন্য আলাদা count, এবং শেষে "total" লাইন দেখায়',
      },
    ],
    tip: "💡 Tip: single file দিলে শুধু একটা সংখ্যা দেখায়, কিন্তু একাধিক file দিলে প্রতিটার count-এর পাশে filename-ও দেখায়, আর শেষে combined total — দ্রুত বোঝা যায় কোন ফাইল কত বড়।",
  },
  "grep-E-dot": {
    id: "grep-E-dot",
    command: 'grep -E "lo.ged" ~/regexlab/events.log',
    category: "Text Processing",
    story:
      'Regular expression-এ "." (dot) মানে "যেকোনো একটা character" (letter, digit, space — যাই হোক)। এখানে "lo.ged" মানে "lo", তারপর যেকোনো একটা character, তারপর "ged" — এটা "logged" শব্দের ঠিক মাঝের "g"-এর জায়গাটা একটা wildcard slot বানিয়ে দিচ্ছে, যাতে সামান্য বানান-ভিন্নতাও ধরা পড়ে।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-E",
        meaning:
          '"Extended regex" — এই flag দিলে grep বেশি শক্তিশালী regex metacharacter ( +, ?, |, {} ইত্যাদি) সরাসরি বুঝতে পারে, backslash দিয়ে escape করতে হয় না',
      },
      {
        token: '"lo.ged"',
        meaning:
          '"." মানে "ঠিক একটা, যেকোনো character" — তাই এই pattern "lo" + (যেকোনো ১টা char) + "ged" এর সাথে match করবে',
      },
    ],
    tip: '⚠️ Interview trap: "." নিজে একটা literal dot বোঝায় না — এটা "যেকোনো একটা character" বোঝায়। literal dot খুঁজতে হলে escape করতে হয়: "\\."।',
  },
  "grep-E-star": {
    id: "grep-E-star",
    command: 'grep -E "ERROR.*failed" ~/regexlab/events.log',
    category: "Text Processing",
    story:
      '".*" মানে "zero বা তার বেশি যেকোনো character" — মাঝে কতটুকু আর কী আছে তা নিয়ে grep মাথা ঘামায় না। "ERROR.*failed" মানে "লাইনে কোথাও ERROR আছে, আর তার পরে (মাঝে যত কম-বেশি লেখাই থাকুক না কেন) কোথাও failed আছে" — মাঝে যতই অন্য শব্দ থাকুক, দুইটা শব্দ একটার পরে আরেকটা থাকলেই match।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-E",
        meaning: "extended regex flag",
      },
      {
        token: '"ERROR.*failed"',
        meaning:
          '"." = যেকোনো ১টা character, "*" = আগেরটা শূন্য বা তার বেশি বার — একসাথে ".*" মানে "মাঝে যেকোনো কিছু (এমনকি কিছুই না)"',
      },
    ],
    tip: '💡 Tip: ".*" খুবই common কিন্তু "greedy" — এটা যতদূর সম্ভব বেশি match করার চেষ্টা করে, যা অনেক সময় প্রত্যাশার চেয়ে বেশি অংশ ধরে ফেলতে পারে।',
  },
  "grep-E-caret": {
    id: "grep-E-caret",
    command: 'grep -E "^Alice" ~/regexlab/contacts.txt',
    category: "Text Processing",
    story:
      '"^" symbol regex-এ লাইনের একদম "শুরু" বোঝায়। "^Alice" মানে "Alice" শব্দটা লাইনের মাঝখানে বা শেষে থাকলে চলবে না — এটা লাইনের একদম প্রথম অক্ষর থেকেই "Alice" দিয়ে শুরু হতে হবে, ঠিক যেমন কারো নাম একটা attendance list-এর প্রথম position-এ খোঁজা।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-E",
        meaning: "extended regex flag",
      },
      {
        token: '"^Alice"',
        meaning:
          '"^" = লাইনের শুরু বোঝানোর anchor; তাই এই pattern শুধু "Alice" দিয়ে শুরু হওয়া লাইনের সাথে match করবে',
      },
    ],
    tip: '⚠️ Interview tip: "^" আর "$" কে "anchor" বলা হয় — এরা নিজেরা কোনো character match করে না, বরং position (শুরু/শেষ) নির্দেশ করে।',
  },
  "grep-E-dollar-escaped": {
    id: "grep-E-dollar-escaped",
    command: 'grep -E "poridhi\\.io$" ~/regexlab/events.log',
    category: "Text Processing",
    story:
      '"$" symbol লাইনের "শেষ" বোঝায় — "^" যেমন শুরু বোঝায়, এটা ঠিক তার বিপরীত। আর এখানে "." কে backslash ("\\.") দিয়ে escape করা হয়েছে, কারণ আগে শিখেছিলে "." মানে "যেকোনো character" — কিন্তু এখানে ঠিক literal dot-ই (ডট চিহ্নটাই) খোঁজা দরকার, তাই escape করে বলা হচ্ছে "এটা wildcard না, আসল dot"।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-E",
        meaning: "extended regex flag",
      },
      {
        token: '"poridhi\\.io$"',
        meaning:
          '"\\." = literal dot (escape করা, wildcard না); "$" = লাইনের শেষ anchor — একসাথে মানে লাইনটা ঠিক "poridhi.io" দিয়েই শেষ হতে হবে',
      },
    ],
    tip: '⚠️ এই লাবের সবচেয়ে common ভুল: "." কে escape না করা। "poridhi.io" (escape ছাড়া) লিখলে সেটা "poridhiXio" (যেকোনো character X)-এর সাথেও match করে ফেলবে — ভুলভাবে বেশি কিছু ধরে ফেলার ঝুঁকি থাকে।',
  },
  "grep-E-charclass": {
    id: "grep-E-charclass",
    command: 'grep -E "[0-9]%" ~/regexlab/events.log',
    category: "Text Processing",
    story:
      '"[0-9]" একটা character class — মানে "0 থেকে 9-এর মধ্যে যেকোনো একটা digit"। এটা অনেকটা একটা "বাস্কেটের" মতো, যার ভেতরে যেকোনো একটা জিনিস (এখানে একটা digit) থাকলেই match গণনা হবে। "[0-9]%" মানে "একটা digit-এর ঠিক পরেই % চিহ্ন" — যেমন "85%"।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-E",
        meaning: "extended regex flag",
      },
      {
        token: "[0-9]",
        meaning:
          "character class — 0 থেকে 9 পর্যন্ত যেকোনো একটা digit-কে বোঝায়",
      },
      {
        token: "%",
        meaning:
          "literal percent character (কোনো বিশেষ regex মানে নেই, সরাসরি % চিহ্নই খোঁজে)",
      },
    ],
    tip: '💡 Tip: "[0-9]" standard grep-এ digit বোঝানোর সবচেয়ে common উপায় ("[[:digit:]]"-ও একই কাজ করে)।',
  },
  "grep-E-negated-class": {
    id: "grep-E-negated-class",
    command: 'grep -E "@[^p]" ~/regexlab/contacts.txt',
    category: "Text Processing",
    story:
      '"[^p]" মানে "p ছাড়া যেকোনো একটা character" — "^" এখানে character class-এর ভেতরে বসলে "না" (negation) বোঝায়, লাইনের শুরু না। "@[^p]" মানে "@ চিহ্নের ঠিক পরের character যেন p না হয়" — অর্থাৎ যাদের email "poridhi.io" domain-এ (@p দিয়ে শুরু) না, সেই বাইরের email গুলো ধরা।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-E",
        meaning: "extended regex flag",
      },
      {
        token: "@",
        meaning: 'literal "@" character',
      },
      {
        token: "[^p]",
        meaning:
          '"^" এখানে class-এর ভেতরে প্রথমে বসায় "p বাদে অন্য যেকোনো character" বোঝানো negated character class',
      },
    ],
    tip: '⚠️ Interview trap: "^" দুই জায়গায় দুই রকম মানে বহন করে — লাইনের বাইরে থাকলে "anchor" (লাইনের শুরু), আর "[...]"-এর ভেতরে প্রথম character হলে "negation" (না)। এই দুইটা গুলিয়ে ফেলা common ভুল।',
  },
  "grep-E-plus-ip": {
    id: "grep-E-plus-ip",
    command:
      'grep -E "[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+" ~/regexlab/events.log',
    category: "Text Processing",
    story:
      'একটা IP address (যেমন 192.168.1.10) চারটা সংখ্যার দল, প্রতিটা দলের ডিজিটের সংখ্যা ভিন্ন হতে পারে, আর মাঝে literal dot দিয়ে আলাদা। "[0-9]+" মানে "এক বা তার বেশি digit" (একটা না হয়ে, পুরো দল ধরবে), আর এই পুরো প্যাটার্নটা চারবার (মাঝে escape করা dot সহ) পাশাপাশি বসিয়ে পুরো IP shape বোঝানো হয়েছে।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-E",
        meaning: "extended regex flag",
      },
      {
        token: "[0-9]+",
        meaning:
          '"+" quantifier — আগের character class ("[0-9]") এক বা তার বেশি বার থাকতে পারবে (শুধু একটা digit না, পুরো সংখ্যা)',
      },
      {
        token: "\\.",
        meaning: "escape করা literal dot",
      },
    ],
    tip: '💡 Tip: এই pattern একদম perfect IP-validation না (255-এর বেশি সংখ্যাও match করবে) — শুধু "shape" (চারটা number group dot দিয়ে আলাদা) মেলায়, actual validity check না।',
  },
  "grep-E-optional": {
    id: "grep-E-optional",
    command: 'grep -E "\\(?555" ~/regexlab/contacts.txt',
    category: "Text Processing",
    story:
      'কারো phone number area code বন্ধনীতে আছে "(555)", কারো নেই, শুধু "555"। "?" quantifier মানে "আগের character থাকতেও পারে, নাও থাকতে পারে (০ অথবা ১ বার)"। "\\(?555" মানে "একটা opening bracket থাকতে পারে অথবা নাও থাকতে পারে, তারপরই 555" — দুই রকম format-ই একসাথে ধরা পড়ে যায়।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-E",
        meaning: "extended regex flag",
      },
      {
        token: "\\(?",
        meaning:
          'escape করা literal "(" + "?" quantifier — এই bracket থাকা আর না-থাকা দুটোই match করবে (optional)',
      },
      {
        token: "555",
        meaning: "literal সংখ্যা — এরপর থেকেই phone number শুরু",
      },
    ],
    tip: '💡 Tip: "?" quantifier "একটা জিনিস optional" বোঝাতে খুবই useful — যখন data-তে একই জিনিসের দুই রকম format থাকতে পারে, তখন একটা pattern দিয়েই দুটোই ধরা যায়।',
  },
  "grep-E-interval": {
    id: "grep-E-interval",
    command: 'grep -E "[A-Z]{5}" ~/regexlab/events.log',
    category: "Text Processing",
    story:
      'severity level-গুলোর শব্দের length ভিন্ন — INFO (৪ অক্ষর), WARN (৪ অক্ষর), ERROR (৫ অক্ষর)। "{5}" quantifier দিয়ে ঠিক exactly ৫টা uppercase letter পরপর আছে এমন জায়গা খোঁজা হচ্ছে, যা শুধু "ERROR"-কেই আলাদা করে ধরে ফেলবে — অন্য কোনো flag/substring ছাড়াই, শুধু length দিয়ে বাছাই।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-E",
        meaning: "extended regex flag",
      },
      {
        token: "[A-Z]",
        meaning:
          "character class — A থেকে Z পর্যন্ত যেকোনো একটা uppercase letter",
      },
      {
        token: "{5}",
        meaning: "exact-count quantifier — ঠিক আগেরটা ৫ বার পরপর থাকতে হবে",
      },
    ],
    tip: '💡 Tip: "{n}" দিয়ে exact count, "{n,}" দিয়ে "কমপক্ষে n বার", আর "{n,m}" দিয়ে "n থেকে m বারের মধ্যে" বোঝানো যায় — এগুলো সবই "interval" quantifier পরিবারের সদস্য।',
  },
  "grep-E-alternation": {
    id: "grep-E-alternation",
    command: 'grep -E "WARN|ERROR" ~/regexlab/events.log',
    category: "Text Processing",
    story:
      '"|" (pipe symbol regex-এর ভেতরে) মানে "OR" — এটা বা ওটা, দুটোর যেকোনো একটা match করলেই চলবে। "WARN|ERROR" মানে "যে লাইনে WARN আছে, অথবা যে লাইনে ERROR আছে — দুই ধরনের লাইনই দেখাও"।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-E",
        meaning: "extended regex flag",
      },
      {
        token: '"WARN|ERROR"',
        meaning:
          '"|" = alternation (OR) — দুইটা pattern-এর মধ্যে যেকোনো একটা match করলেই যথেষ্ট',
      },
    ],
    tip: '⚠️ Interview tip: এখানে "|" terminal-এর pipe operator না — regex-এর ভেতরে "|" আলাদা জিনিস বোঝায় (OR), আর command-এর মাঝে quote-এর বাইরের "|" pipe operator বোঝায়। Context অনুযায়ী মানে বদলায়।',
  },
  "grep-E-group-alternation": {
    id: "grep-E-group-alternation",
    command: 'grep -E "@(gmail|yahoo|outlook)\\." ~/regexlab/contacts.txt',
    category: "Text Processing",
    story:
      '"()" দিয়ে কয়েকটা option-কে একসাথে group করা যায়, যাতে alternation ("|") শুধু সেই group-এর ভেতরেই কাজ করে। "@(gmail|yahoo|outlook)\\." মানে "@ চিহ্নের পরে gmail অথবা yahoo অথবা outlook — এই তিনটার যেকোনো একটা, তারপর একটা literal dot" — তিনটা আলাদা pattern না লিখে একটাতেই সব কভার হয়ে যায়।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-E",
        meaning: "extended regex flag",
      },
      {
        token: "()",
        meaning: '"|" (OR)-এর scope-কে সীমাবদ্ধ রাখা grouping',
      },
      {
        token: "gmail|yahoo|outlook",
        meaning: "group-এর ভেতরে তিনটা option, যেকোনো একটা match করলেই চলবে",
      },
      {
        token: "\\.",
        meaning: "group-এর পরের literal (escaped) dot",
      },
    ],
    tip: '💡 Tip: group ছাড়া শুধু "@gmail|yahoo|outlook" লিখলে পুরো pattern-টাই ভুল হয়ে যেত — "@gmail" OR "yahoo" OR "outlook" (পুরো আলাদা তিনটা pattern) হয়ে যেত, "@" শুধু প্রথম অংশে থাকতো। "()" দিয়ে group করাটাই এটাকে সঠিক করে।',
  },
  "grep-pipe-grep-vE": {
    id: "grep-pipe-grep-vE",
    command:
      'grep "failed login" ~/regexlab/events.log | grep -vE "from (192\\.168|10\\.0)\\."',
    category: "Text Processing",
    story:
      'দুই ধাপে filter করা হচ্ছে — প্রথম grep দিয়ে শুধু "failed login" থাকা লাইনগুলো বের করা হলো, তারপর সেই ফলাফল দ্বিতীয় grep-এ pipe করা হলো, যেটা internal network IP (192.168.x বা 10.0.x) থেকে আসা লাইনগুলো "-v" দিয়ে বাদ দিয়ে দিচ্ছে — শেষে শুধু বাইরের (external) network থেকে আসা failed login থেকে যাচ্ছে।',
    tokens: [
      {
        token: 'grep "failed login" events.log',
        meaning: "প্রথম ধাপ — শুধু failed login লাইনগুলো বের করে",
      },
      {
        token: "|",
        meaning: "pipe — প্রথম grep-এর output দ্বিতীয় grep-এর input হয়",
      },
      {
        token: 'grep -vE "from (192\\.168|10\\.0)\\."',
        meaning:
          '"-v" (invert) দিয়ে internal IP prefix দিয়ে শুরু হওয়া লাইনগুলো বাদ দেয়, "-E" দিয়ে group+alternation regex ব্যবহার করা হয়েছে',
      },
    ],
    tip: '💡 Tip: "-v" (invert) আর alternation "(a|b)" একসাথে ব্যবহার করে "এই দুইটার কোনোটাই না" টাইপের শর্ত সহজে লেখা যায় — দুটো আলাদা grep -v আলাদা করে না লিখে।',
  },
  "sed-E-backreference-preview": {
    id: "sed-E-backreference-preview",
    command:
      "sed -E 's/([0-9]{4})-([0-9]{2})-([0-9]{2})/\\3-\\2-\\1/' ~/regexlab/events.log | head -n 3",
    category: "Text Processing",
    story:
      '"()" দিয়ে regex-এর অংশগুলোকে "capture group" বানানো যায় — year, month, day আলাদা আলাদা group-এ ধরে রাখা হচ্ছে। তারপর replacement অংশে "\\1", "\\2", "\\3" দিয়ে সেই group গুলোকে উল্টো ক্রমে (day-month-year) আবার বসানো হচ্ছে — তিনটা পাজল-টুকরা আলাদা করে তুলে নিয়ে উল্টো ক্রমে আবার জোড়া লাগানোর মতো। পুরো file না দেখিয়ে শেষে "head -n 3" দিয়ে শুধু প্রথম ৩ লাইন preview হিসেবে দেখানো হচ্ছে।',
    tokens: [
      {
        token: "sed -E",
        meaning:
          "extended regex mode — capture group ()-কে backslash ছাড়াই লেখা যায়",
      },
      {
        token: "([0-9]{4})-([0-9]{2})-([0-9]{2})",
        meaning:
          "তিনটা capture group — যথাক্রমে ৪-digit year, ২-digit month, ২-digit day, মাঝে literal dash দিয়ে আলাদা",
      },
      {
        token: "\\3-\\2-\\1",
        meaning:
          'replacement অংশ — "\\N" দিয়ে N-নম্বর capture group-এর মান বসানো হয়; এখানে group ৩ (day), ২ (month), ১ (year) ক্রমে বসিয়ে DD-MM-YYYY বানানো হয়েছে',
      },
      {
        token: "| head -n 3",
        meaning:
          "পুরো output না দেখিয়ে শুধু প্রথম ৩ লাইন preview হিসেবে দেখায়",
      },
    ],
    tip: '⚠️ Interview tip: "head -n 3" দিয়ে এখানে শুধু preview দেখানো হচ্ছে, আসল file-এ কিছু বদলাচ্ছে না — "-i" flag ছাড়া sed সবসময় শুধু output দেখায়, file touch করে না।',
  },
  "sed-E-i-backreference": {
    id: "sed-E-i-backreference",
    command:
      "sed -E -i 's/([0-9]{4})-([0-9]{2})-([0-9]{2})/\\3-\\2-\\1/' ~/regexlab/events.log",
    category: "Text Processing",
    story:
      'আগের কমান্ডে শুধু preview দেখানো হয়েছিল ("head -n 3" দিয়ে), এখন ঠিক একই capture-group logic ব্যবহার করে, কিন্তু "-i" যোগ করে সরাসরি file-টাই স্থায়ীভাবে বদলে ফেলা হচ্ছে — পুরো events.log-এর date ফরম্যাট YYYY-MM-DD থেকে DD-MM-YYYY-তে চিরস্থায়ীভাবে বদলে যাচ্ছে।',
    tokens: [
      {
        token: "sed -E -i",
        meaning: "extended regex mode + in-place edit, একসাথে",
      },
      {
        token: "s/([0-9]{4})-([0-9]{2})-([0-9]{2})/\\3-\\2-\\1/",
        meaning:
          "আগের মতোই capture group দিয়ে date-এর অংশ ধরে উল্টো ক্রমে বসানো হচ্ছে",
      },
      {
        token: "~/regexlab/events.log",
        meaning: "কোন file সরাসরি edit হবে",
      },
    ],
    tip: '⚠️ Interview tip: "-E" আর "-i" flag-এর ক্রম (sed -E -i বা sed -i -E) কোনো ফারাক আনে না — দুটোই independent flag, কিন্তু দুটোই একসাথে থাকা দরকার (একটা regex syntax-এর জন্য, আরেকটা file সরাসরি বদলানোর জন্য)।',
  },
  "awk-match-regex": {
    id: "awk-match-regex",
    command: "awk -F',' 'NR>1 && $2 ~ /poridhi\\.io$/' ~/regexlab/contacts.txt",
    category: "Text Processing",
    story:
      'awk-এর নিজস্ব একটা regex-match operator আছে: "~"। "$2 ~ /poridhi\\.io$/" মানে "ফিল্ড ২ (email)-এর ভেতরে poridhi.io দিয়ে শেষ হওয়া pattern আছে কিনা চেক করো"। এখানে {print} ব্লক লেখা হয়নি — awk-এ condition সত্যি হলে এবং কোনো action/{} না দিলে, ডিফল্ট আচরণ হলো পুরো লাইনটাই print করে দেওয়া।',
    tokens: [
      {
        token: "awk -F','",
        meaning: "field separator কমা সেট করা",
      },
      {
        token: "NR>1",
        meaning: "header লাইন (লাইন ১) বাদ দেওয়া",
      },
      {
        token: "$2 ~ /poridhi\\.io$/",
        meaning:
          '"~" হলো awk-এর regex-match operator; এখানে ফিল্ড ২ (email)-এর মান "poridhi.io" দিয়ে শেষ হচ্ছে কিনা regex দিয়ে চেক করা হচ্ছে',
      },
    ],
    tip: '💡 Tip: কোনো {action} ব্লক না দিলে awk ধরে নেয় তুমি চাও "condition সত্যি হলে পুরো লাইন print করো" — এটাই awk-এর default behavior, grep-এর মতোই আচরণ করে।',
  },
  "awk-not-match-regex": {
    id: "awk-not-match-regex",
    command:
      "awk -F',' 'NR>1 && $2 !~ /poridhi\\.io$/' ~/regexlab/contacts.txt",
    category: "Text Processing",
    story:
      'আগের entry-র "~" এর ঠিক উল্টো — "!~" মানে "match করে না"। "$2 !~ /poridhi\\.io$/" মানে "ফিল্ড ২ (email) poridhi.io দিয়ে শেষ হচ্ছে না এমন লাইন বাছো" — অর্থাৎ company domain বাদে বাইরের (external) email থাকা কর্মীদের বের করা।',
    tokens: [
      {
        token: "awk -F','",
        meaning: "field separator কমা",
      },
      {
        token: "NR>1",
        meaning: "header বাদ",
      },
      {
        token: "$2 !~ /poridhi\\.io$/",
        meaning:
          '"!~" = negated regex-match — ফিল্ড ২ pattern-টার সাথে match করে না এমন লাইন বাছে',
      },
    ],
    tip: '💡 Tip: "~" আর "!~" — grep আর grep -v-এর awk সংস্করণ — একই logic, শুধু নির্দিষ্ট ফিল্ডের ওপর apply হয়, পুরো লাইনে না।',
  },
  "grep-E-interval-range": {
    id: "grep-E-interval-range",
    command: 'grep -E "[0-9]{1,3}$" ~/regexlab/events.log',
    category: "Text Processing",
    story:
      '"{1,3}" মানে "কমপক্ষে ১টা, বেশি হলে ৩টা পর্যন্ত" — একটা range। "[0-9]{1,3}$" মানে "লাইনের একদম শেষে ১ থেকে ৩ digit-এর একটা ছোট সংখ্যা আছে" — যেমন "120ms"-এর "120" অংশ, কিন্তু IP address-এর মতো বড় কিছু এতে ধরা পড়বে না কারণ "$" anchor নিশ্চিত করছে এটাই একদম লাইনের শেষ।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-E",
        meaning: "extended regex flag",
      },
      {
        token: "[0-9]{1,3}",
        meaning: "১ থেকে ৩টা digit (range quantifier)",
      },
      {
        token: "$",
        meaning: "লাইনের শেষ anchor — নিশ্চিত করে সংখ্যাটা একদম শেষে",
      },
    ],
    tip: '💡 Tip: "{1,3}" না দিয়ে শুধু "[0-9]+" লিখলেও কাছাকাছি result আসতো, কিন্তু "{1,3}" দিয়ে স্পষ্টভাবে সর্বোচ্চ কত digit চাও তা বেঁধে দেওয়া যায় — বড় কোনো সংখ্যা ভুলবশত match হওয়া থেকে রক্ষা করে।',
  },
  "sed-extract-capture-pipe": {
    id: "sed-extract-capture-pipe",
    command:
      "sed -n -E '/for [a-z_]+ from/p' ~/regexlab/events.log | sed -E 's/^.*for ([a-z_]+) from.*$/\\1/'",
    category: "Text Processing",
    story:
      'দুই ধাপে একটা নির্দিষ্ট অংশ (username) বের করা হচ্ছে — প্রথমে "sed -n \\\'/pattern/p\\\'" দিয়ে শুধু "for ... from" আকৃতির matching লাইনগুলো আলাদা করা হলো। তারপর দ্বিতীয় sed-এ (এবার "-n" ছাড়া, তাই default auto-print চলছে) পুরো লাইনটাকেই capture group দিয়ে ধরা username অংশ ("\\1") দিয়ে replace করা হচ্ছে — অর্থাৎ পুরো লাইনের জায়গায় শুধু username-টাই থেকে যাচ্ছে।',
    tokens: [
      {
        token: "sed -n -E '/for [a-z_]+ from/p'",
        meaning:
          '"for ... from" ফরম্যাটের matching লাইনগুলো filter করে বের করে',
      },
      {
        token: "|",
        meaning: "pipe operator",
      },
      {
        token: "sed -E 's/^.*for ([a-z_]+) from.*$/\\1/'",
        meaning:
          '"-n" ছাড়া (auto-print চালু থাকা অবস্থায়) পুরো লাইনটাকে capture group "\\1" (username অংশ) দিয়ে replace করে — ফলে শুধু username-টাই অবশিষ্ট থাকে',
      },
    ],
    tip: '⚠️ Interview tip: দ্বিতীয় sed-এ এখানে ইচ্ছাকৃতভাবে "-n" ব্যবহার হয়নি — কারণ আগের ধাপেই সব লাইন filter হয়ে গেছে, তাই এখানে শুধু auto-print-এর ওপর ভরসা করে প্রতিটা (substituted) লাইন দেখানো যথেষ্ট।',
  },
  "grep-redirect-overwrite": {
    id: "grep-redirect-overwrite",
    command:
      'grep "500" ~/pipeline/data/access.log > ~/pipeline/reports/errors.txt',
    category: "Text Processing",
    story:
      'grep সাধারণত terminal-এ ফলাফল দেখায়, কিন্তু সেই output-কেও ঠিক "echo"-এর মতোই ">" দিয়ে একটা নতুন ফাইলে redirect করা যায়। এখানে access.log-এ status code 500 থাকা লাইনটা খুঁজে বের করে, সরাসরি terminal-এ না দেখিয়ে errors.txt ফাইলে লিখে ফেলা হচ্ছে — একটা নতুন "error report" ফাইল তৈরি হচ্ছে।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: '"500"',
        meaning: "কোন pattern খোঁজা হচ্ছে",
      },
      {
        token: "~/pipeline/data/access.log",
        meaning: "কোন ফাইলে খোঁজা হবে",
      },
      {
        token: ">",
        meaning:
          "redirect operator — grep-এর output terminal-এর বদলে ফাইলে লেখে (ফাইল আগে থেকে থাকলে তার content মুছে নতুন করে লেখে)",
      },
      {
        token: "~/pipeline/reports/errors.txt",
        meaning: "output কোন ফাইলে যাবে",
      },
    ],
    tip: '💡 Tip: যেকোনো command-এর output-ই ">" দিয়ে ফাইলে redirect করা যায় — শুধু echo না, grep/awk/sed সবকিছুর ক্ষেত্রেই এটা একইভাবে কাজ করে।',
  },
  "grep-redirect-append": {
    id: "grep-redirect-append",
    command:
      'grep "403" ~/pipeline/data/access.log >> ~/pipeline/reports/errors.txt',
    category: "Text Processing",
    story:
      'আগের কমান্ডে errors.txt-এ status 500-এর লাইন লেখা হয়েছিল ">" দিয়ে। এবার status 403-এর লাইনও একই ফাইলে যোগ করতে হবে, কিন্তু ">" দিলে আগের 500-এর লাইনটা মুছে যেত! তাই ">>" ব্যবহার করে, আগের content অক্ষত রেখে নতুন ফলাফল শেষে জুড়ে দেওয়া হচ্ছে — এভাবে errors.txt-এ ধাপে ধাপে একাধিক grep-এর ফলাফল জমা করা যায়।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: '"403"',
        meaning: "কোন pattern খোঁজা হচ্ছে",
      },
      {
        token: "~/pipeline/data/access.log",
        meaning: "কোন ফাইলে খোঁজা হবে",
      },
      {
        token: ">>",
        meaning: "append redirect — আগের content রেখে, ফলাফল শেষে জুড়ে দেয়",
      },
      {
        token: "~/pipeline/reports/errors.txt",
        meaning: "কোন ফাইলে append হবে",
      },
    ],
    tip: '⚠️ Interview trap: এখানে ভুলে ">" ব্যবহার করলে প্রথম grep-এর (500) ফলাফল মুছে শুধু এই দ্বিতীয়টাই (403) থেকে যেত — ধাপে ধাপে ফলাফল জমাতে চাইলে প্রথমটার পর থেকে সবসময় ">>" ব্যবহার করতে হয়।',
  },
  "cat-pipe-grep": {
    id: "cat-pipe-grep",
    command: 'cat ~/pipeline/data/mixed.log | grep "ERROR"',
    category: "Text Processing",
    story:
      '"cat" একটা ফাইলের পুরো content terminal-এ দেখায়। কিন্তু "|" (pipe) দিয়ে সেই output সরাসরি terminal-এ না দেখিয়ে পরের command-এর input বানিয়ে দেওয়া যায় — এখানে cat-এর output pipe দিয়ে grep-এর কাছে যাচ্ছে, যে তার মধ্যে থেকে শুধু "ERROR" থাকা লাইনগুলো ছেঁকে বের করছে। এটা একজনের হাত থেকে জিনিস নিয়ে আরেকজনকে সরাসরি দিয়ে দেওয়ার মতো, জিনিসটা স্ক্রিনে না রেখেই।',
    tokens: [
      {
        token: "cat",
        meaning: "ফাইলের পুরো content দেখানোর command (concatenate)",
      },
      {
        token: "~/pipeline/data/mixed.log",
        meaning: "কোন ফাইল পড়া হবে",
      },
      {
        token: "|",
        meaning:
          "pipe operator — আগের command-এর output পরের command-এর input বানিয়ে দেয়",
      },
      {
        token: 'grep "ERROR"',
        meaning: "pipe থেকে পাওয়া লাইনগুলোর মধ্যে থেকে ERROR filter করে",
      },
    ],
    tip: '⚠️ Interview tip: এই কমান্ডটা "Useless Use of Cat" (UUOC)-এর একটা ক্লাসিক উদাহরণ — grep নিজেই সরাসরি ফাইল পড়তে পারে ("grep "ERROR" mixed.log"), মাঝে "cat |" আসলে দরকার নেই। তবে বড় multi-stage pipeline শেখার সময় এই প্যাটার্নটা concept বোঝার জন্য খুবই common।',
  },
  "grep-pipe-wc": {
    id: "grep-pipe-wc",
    command: 'grep "INFO" ~/pipeline/data/mixed.log | wc -l',
    category: "Text Processing",
    story:
      'কতগুলো লাইনে "INFO" আছে তা জানতে চাইলে, grep-এর ফলাফল (matching লাইনগুলো) গুনে দেখাতে হবে। তাই তার output সরাসরি "wc -l"-এ pipe করা হচ্ছে, যে শুধু কতগুলো লাইন এলো তা গুনে একটা সংখ্যা দেয় — filename ছাড়াই, কারণ এখানে wc ফাইল পড়ছে না, pipe থেকে (stdin থেকে) data নিচ্ছে।',
    tokens: [
      {
        token: 'grep "INFO" mixed.log',
        meaning: "INFO থাকা লাইনগুলো বের করে",
      },
      {
        token: "|",
        meaning: "pipe operator",
      },
      {
        token: "wc -l",
        meaning:
          "filename ছাড়া — pipe থেকে আসা লাইনগুলো গোনে (stdin থেকে input নেয়)",
      },
    ],
    tip: '💡 Tip: "wc -l file" আর "command | wc -l" — দুটোই লাইন গোনে, কিন্তু প্রথমটা ফাইল থেকে সরাসরি, দ্বিতীয়টা অন্য কোনো command-এর output থেকে। filename না দিলে wc বুঝে নেয় data pipe (stdin) থেকে আসবে।',
  },
  "pipe-grep-sed": {
    id: "pipe-grep-sed",
    command:
      "cat ~/pipeline/data/mixed.log | grep \"ERROR\" | sed 's/ERROR/ISSUE/'",
    category: "Text Processing",
    story:
      'তিনটা tool-কে একসাথে chain করা হচ্ছে — cat ফাইল পড়ে, grep শুধু ERROR লাইনগুলো ছেঁকে বের করে, আর সেই ফলাফল শেষে sed-এর কাছে যায়, যে প্রতিটা লাইনে "ERROR" শব্দটাকে "ISSUE" দিয়ে বদলে দেয়। প্রতিটা tool একটা করে ছোট কাজ করছে, আর pipe দিয়ে একটার output আরেকটার input হয়ে পুরো কাজটা ধাপে ধাপে শেষ হচ্ছে।',
    tokens: [
      {
        token: "cat mixed.log",
        meaning: "ফাইলের content বের করে",
      },
      {
        token: '| grep "ERROR"',
        meaning: "শুধু ERROR লাইনগুলো ছেঁকে বের করে",
      },
      {
        token: "| sed 's/ERROR/ISSUE/'",
        meaning: "সেই লাইনগুলোতে ERROR শব্দটাকে ISSUE দিয়ে বদলায়",
      },
    ],
    tip: '💡 Tip: এই তিন-ধাপের chain-ই Linux-এর "small tools, combined with pipes" দর্শনের সবচেয়ে ভালো উদাহরণ — প্রতিটা ধাপ আলাদাভাবে টেস্ট করা যায়, এবং দরকার হলে মাঝে আরেকটা tool জুড়ে দেওয়া যায়।',
  },
  "grep-pipe-awk-field": {
    id: "grep-pipe-awk-field",
    command: "grep \"ERROR\" ~/pipeline/data/mixed.log | awk '{print $2}'",
    category: "Text Processing",
    story:
      'grep দিয়ে প্রথমে ERROR লাইনগুলো বের করা হলো, তারপর সেই লাইনগুলো awk-এর কাছে pipe করা হলো — awk প্রতিটা লাইনকে space দিয়ে আলাদা আলাদা "field"-এ ভাগ করে ফেলে, আর "{print $2}" দিয়ে বলা হচ্ছে "শুধু ২ নম্বর field-টাই print করো" — যেমন "ERROR failed to connect" লাইনে $2 হবে "failed"।',
    tokens: [
      {
        token: 'grep "ERROR" mixed.log',
        meaning: "ERROR থাকা লাইনগুলো বের করে",
      },
      {
        token: "|",
        meaning: "pipe operator",
      },
      {
        token: "awk '{print $2}'",
        meaning:
          "প্রতিটা লাইনকে space দিয়ে field-এ ভাগ করে, শুধু ২ নম্বর field print করে",
      },
    ],
    tip: "💡 Tip: awk default ভাবে space/tab (whitespace) দিয়ে field আলাদা করে — CSV-এর মতো অন্য delimiter (যেমন কমা) দিয়ে ভাগ করা ফাইলের জন্য \"-F','\" দিতে হয়।",
  },
  "pipe-grep-redirect": {
    id: "pipe-grep-redirect",
    command:
      'cat ~/pipeline/data/access.log | grep "200" > ~/pipeline/reports/success.txt',
    category: "Text Processing",
    story:
      'pipe (|) আর redirect (>) — দুটো আলাদা জিনিস একসাথে ব্যবহার হচ্ছে। প্রথমে cat-এর output pipe দিয়ে grep-এ যাচ্ছে (status 200 filter করতে), তারপর grep-এর চূড়ান্ত ফলাফল ">" দিয়ে terminal-এ না দেখিয়ে success.txt ফাইলে সেভ হয়ে যাচ্ছে — pipe মাঝের ধাপগুলোর জন্য, redirect শেষ ফলাফল সংরক্ষণের জন্য।',
    tokens: [
      {
        token: 'cat access.log | grep "200"',
        meaning:
          "cat-এর output pipe করে grep-এ পাঠানো হচ্ছে, যা status 200-এর লাইন ছেঁকে বের করে",
      },
      {
        token: ">",
        meaning: "redirect — grep-এর চূড়ান্ত output ফাইলে লেখে (overwrite)",
      },
      {
        token: "~/pipeline/reports/success.txt",
        meaning: "output কোথায় সেভ হবে",
      },
    ],
    tip: '💡 Tip: "|" সবসময় দুইটা command-এর মাঝে বসে (process থেকে process), আর ">"/">>" সবসময় command-এর শেষে বসে (process থেকে file) — এই দুইটার জায়গা ও কাজ গুলিয়ে ফেলা একটা common ভুল।',
  },
  "grep-v-pipe-wc": {
    id: "grep-v-pipe-wc",
    command: 'cat ~/pipeline/data/access.log | grep -v "200" | wc -l',
    category: "Text Processing",
    story:
      'কতগুলো request-এর status code 200 "না" (অর্থাৎ ভিন্ন কিছু) তা জানতে হবে। "-v" (invert) flag দিলে grep তার normal কাজের উল্টোটা করে — match হওয়া লাইন না দেখিয়ে, যে লাইনগুলোতে pattern-টা নেই সেগুলো দেখায়। তারপর সেই non-200 লাইনগুলো "wc -l"-এ pipe করে গুনে ফেলা হচ্ছে।',
    tokens: [
      {
        token: "cat access.log",
        meaning: "ফাইলের content বের করে",
      },
      {
        token: 'grep -v "200"',
        meaning:
          '"-v" = invert match — "200" নেই এমন লাইনগুলো বের করে, যেগুলোতে আছে সেগুলো বাদ দেয়',
      },
      {
        token: "| wc -l",
        meaning: "সেই non-200 লাইনগুলো গোনে",
      },
    ],
    tip: '⚠️ Interview tip: "grep -v" প্রায়ই interview-তে জিজ্ঞেস করা হয় — এটা normal grep-এর সম্পূর্ণ বিপরীত (inverse), "match না করা" লাইন বের করে, "match করা" লাইন না।',
  },
  "head-n-pipe-grep": {
    id: "head-n-pipe-grep",
    command: 'head -n 2 ~/pipeline/data/access.log | grep "200"',
    category: "Text Processing",
    story:
      'পুরো ফাইল না দেখে, শুধু ফাইলের শুরুর কয়েকটা লাইন নিয়ে কাজ করতে চাইলে "head -n" ব্যবহার হয় — ঠিক "tail"-এর বিপরীত, যেটা শেষের লাইন দেখায়। এখানে প্রথমে access.log-এর শুধু প্রথম ২ লাইন "head"-এ বের করা হচ্ছে, তারপর সেই সীমিত অংশের মধ্যেই grep দিয়ে status 200 খোঁজা হচ্ছে — পুরো ফাইলে না খুঁজে শুধু একটা sample-এর মধ্যে।',
    tokens: [
      {
        token: "head -n 2",
        meaning: "ফাইলের শুরুর ২টা লাইন বের করে",
      },
      {
        token: "~/pipeline/data/access.log",
        meaning: "কোন ফাইল",
      },
      {
        token: '| grep "200"',
        meaning: "শুধু সেই প্রথম ২ লাইনের মধ্যেই status 200 খোঁজে",
      },
    ],
    tip: '💡 Tip: "head" আর "tail" জোড়া কমান্ড — "head" শুরুর অংশ দেখায়, "tail" শেষের অংশ দেখায়, দুটোই একই রকম "-n" flag নেয়।',
  },
  "grep-cw": {
    id: "grep-cw",
    command: 'grep -cw "inactive" textlab/data/employees.csv',
    category: "Search",
    story:
      'একাধিক flag যেমন "-l" আর "-a" জোড়া লাগানো যায় (ls -la), ঠিক তেমনি grep-এর flag-ও জোড়া লাগানো যায়। "-cw" মানে "-c" (count) আর "-w" (whole word) একসাথে — "inactive" শব্দটা ঠিক একটা সম্পূর্ণ শব্দ হিসেবে (substring না) আছে এমন লাইন কয়টা, তার সংখ্যা গুনে দেখায়।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-c",
        meaning: '"count" — matching লাইনের সংখ্যা দেখায়, লাইনগুলো নিজে না',
      },
      {
        token: "-w",
        meaning:
          '"whole word" — শুধু সম্পূর্ণ শব্দ হিসেবে match করলেই গণনা করে, substring বাদ',
      },
      {
        token: '"inactive"',
        meaning: "কোন শব্দ গোনা হচ্ছে",
      },
    ],
    tip: '💡 Tip: "-c" আর "-w" একসাথে জোড়া লাগিয়ে "-cw" (বা "-wc", ক্রম কোনো ব্যাপার না) লেখা যায় — single-letter flag একসাথে combine করা bash-এর একটা common convention।',
  },
  "grep-v": {
    id: "grep-v",
    command: 'grep -v "active" textlab/data/employees.csv',
    category: "Search",
    story:
      '"-v" (invert) flag grep-এর কাজ উল্টে দেয় — pattern match করা লাইন বাদ দিয়ে, বাকি লাইন দেখায়। কিন্তু এখানে একটা ফাঁদ আছে: "active" কে substring হিসেবে খোঁজা হচ্ছে, আর "inactive" শব্দের ভেতরেও ঠিক "active" লেখা আছে! ফলে "-v "active""  active আর inactive — দুই রকম status-ই বাদ দিয়ে ফেলবে, কারণ দুটোতেই substring হিসেবে "active" match করে।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: "-v",
        meaning:
          "invert match — pattern match করা লাইন বাদ দেয়, বাকিগুলো দেখায়",
      },
      {
        token: '"active"',
        meaning: 'substring হিসেবে খোঁজা হচ্ছে — "inactive"-এর ভেতরেও এটা আছে',
      },
    ],
    tip: '⚠️ এই লাবের সবচেয়ে গুরুত্বপূর্ণ ফাঁদ: "-w" (whole word) ছাড়া grep substring match করে। তাই "grep -v "active"" শুধু exact "active" status-ই বাদ দেয় না, "inactive"-কেও বাদ দিয়ে দেয় (কারণ ওর ভেতরে substring হিসেবে "active" আছে) — দুই ধরনের status-ই উধাও হয়ে যায়। এড়াতে "-vw" (invert + whole word) দরকার হয়।',
  },
  "sed-s-gI": {
    id: "sed-s-gI",
    command: "sed 's/marketing/Marketing/gI' textlab/data/employees.csv",
    category: "Text Processing",
    story:
      'data-তে "MARKETING", "marketing" — দুই রকম casing-ই আছে। শুধু "g" দিলে exact-case "marketing"-ই বদলাতো, "MARKETING" বাদ থেকে যেত। "I" flag (uppercase) দিলে sed casing উপেক্ষা করে — দুই রকম casing-ই একসাথে এক কমান্ডে "Marketing" দিয়ে বদলে যায়।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: "s/marketing/Marketing/",
        meaning: "substitute command — pattern আর replacement",
      },
      {
        token: "g",
        meaning: "global — লাইনের সব occurrence বদলায়",
      },
      {
        token: "I",
        meaning:
          '(uppercase) "case-insensitive" — casing উপেক্ষা করে match করে, যদিও replacement-এর casing ঠিক যা লেখা আছে তাই বসে',
      },
    ],
    tip: '⚠️ Interview trap: "I" flag (uppercase) আর grep-এর "-i" flag একই জিনিস বোঝায় (case-insensitive), কিন্তু sed-এ এটা command-এর ভেতরে flag হিসেবে বসে ("s/.../.../gI"), আলাদা command-line option হিসেবে না।',
  },
  "sed-multi-s-gI": {
    id: "sed-multi-s-gI",
    command:
      "sed 's/engineering/Engineering/gI; s/marketing/Marketing/gI; s/sales/Sales/gI' textlab/data/employees.csv",
    category: "Text Processing",
    story:
      'একটা না, তিনটা department name-ই (engineering, marketing, sales) normalize করতে হবে, প্রতিটার casing আলাদা আলাদা হতে পারে। তিনবার আলাদা sed command না চালিয়ে, সেমিকোলন (;) দিয়ে তিনটা "s///gI" expression একসাথে এক কমান্ডেই চালানো হচ্ছে — প্রতিটা লাইন একবারেই তিনটা নিয়মের মধ্য দিয়ে যায়।',
    tokens: [
      {
        token: "sed",
        meaning: "stream editor command",
      },
      {
        token: ";",
        meaning: "সেমিকোলন — একাধিক sed expression-কে একই কমান্ডে আলাদা করে",
      },
      {
        token:
          "s/engineering/Engineering/gI, s/marketing/Marketing/gI, s/sales/Sales/gI",
        meaning:
          "তিনটা আলাদা case-insensitive, global substitution — একটার পর একটা, প্রতিটা লাইনে প্রয়োগ হয়",
      },
    ],
    tip: "💡 Tip: এভাবে সেমিকোলন দিয়ে চেইন করা expression-গুলো বাম থেকে ডানে ক্রমানুসারে চলে — প্রতিটা expression আগের expression-এর ফলাফলের ওপর কাজ করে, একই লাইনে।",
  },
  "sed-multi-redirect": {
    id: "sed-multi-redirect",
    command:
      "sed 's/engineering/Engineering/gI; s/marketing/Marketing/gI; s/sales/Sales/gI' textlab/data/employees.csv > textlab/data/employees_clean.csv",
    category: "Text Processing",
    story:
      'আগের কমান্ডের মতোই তিনটা normalize-rule একসাথে চালানো হচ্ছে, কিন্তু এবার ফলাফল terminal-এ না দেখিয়ে ">" দিয়ে একটা সম্পূর্ণ নতুন ফাইলে (employees_clean.csv) সেভ করা হচ্ছে — মূল (messy) ফাইলটা অক্ষত থাকছে, আর "clean" সংস্করণটা আলাদাভাবে সংরক্ষিত হচ্ছে পরের ধাপের জন্য।',
    tokens: [
      {
        token: "sed 's/.../gI; .../gI; .../gI'",
        meaning: "তিনটা normalize substitution একসাথে",
      },
      {
        token: "textlab/data/employees.csv",
        meaning: "মূল (messy) input ফাইল",
      },
      {
        token: ">",
        meaning: "redirect — output terminal-এর বদলে নতুন ফাইলে লেখে",
      },
      {
        token: "textlab/data/employees_clean.csv",
        meaning: "normalize করা output কোথায় সেভ হবে — নতুন ফাইল",
      },
    ],
    tip: '💡 Tip: "-i" দিয়ে মূল ফাইল সরাসরি বদলানো যেত, কিন্তু এখানে ইচ্ছাকৃতভাবে ">" দিয়ে আলাদা নতুন ফাইলে রাখা হচ্ছে — messy মূল data আর clean data দুটোই আলাদা রেখে দেওয়া একটা ভালো practice।',
  },
  "awk-F-nr-print": {
    id: "awk-F-nr-print",
    command:
      "awk -F',' 'NR > 1 {print $2, $3}' textlab/data/employees_clean.csv",
    category: "Text Processing",
    story:
      'awk প্রতিটা লাইনকে field-এ ভাগ করে কাজ করে — CSV ফাইলের জন্য "-F\\\',\\\'" দিয়ে বলে দিতে হয় "কমা দিয়ে field আলাদা করো" (default whitespace না)। "NR > 1" মানে "লাইন নম্বর ১-এর বেশি হলে" — অর্থাৎ header (লাইন ১) বাদ দিয়ে বাকি সব ডেটা-লাইনে কাজ করো। "{print $2, $3}" দিয়ে শুধু ২য় আর ৩য় field (নাম, department) দেখানো হচ্ছে।',
    tokens: [
      {
        token: "awk -F','",
        meaning: "field separator কমা (,) সেট করা হচ্ছে, CSV ফাইলের জন্য",
      },
      {
        token: "NR > 1",
        meaning:
          '"Number of Records" — বর্তমান লাইন নম্বর; "> 1" দিয়ে প্রথম (header) লাইন বাদ দেওয়া হচ্ছে',
      },
      {
        token: "{print $2, $3}",
        meaning:
          "action block — ২য় আর ৩য় field একসাথে print করো (কমা দিলে মাঝে space বসে)",
      },
    ],
    tip: '💡 Tip: "NR > 1" হলো header-skip করার সবচেয়ে common awk idiom — CSV বা TSV যেকোনো ফাইলে প্রথম লাইন বাদ দিতে এটা ব্যবহার হয়।',
  },
  "awk-field-eq-condition": {
    id: "awk-field-eq-condition",
    command:
      "awk -F',' '$3 == \"Engineering\" {print $2, $4}' textlab/data/employees_clean.csv",
    category: "Text Processing",
    story:
      'awk-এ "condition {action}" ফরম্যাটে লেখা যায় — "condition" সত্যি হলেই শুধু সেই লাইনে "action" চলে। "$3 == "Engineering"" মানে "৩ নম্বর field-টা ঠিক exactly "Engineering" হলে" — এই শর্ত সত্যি হলে তবেই সেই লাইনের নাম আর salary (field ২, ৪) print হবে, বাকি department-এর লাইন চুপচাপ বাদ পড়ে যাবে।',
    tokens: [
      {
        token: "awk -F','",
        meaning: "field separator কমা",
      },
      {
        token: '$3 == "Engineering"',
        meaning:
          '৩ নম্বর field-এর মান exactly "Engineering" কিনা চেক করা condition (string equality)',
      },
      {
        token: "{print $2, $4}",
        meaning: "শর্ত সত্যি হলে এই action চলে — নাম আর salary print করে",
      },
    ],
    tip: '⚠️ Interview tip: "==" string বা number উভয়ের জন্যই সমান ব্যবহার হয় awk-এ (আলাদা কোনো ".equals()" লাগে না), awk নিজেই context বুঝে তুলনা করে।',
  },
  "awk-multi-condition": {
    id: "awk-multi-condition",
    command:
      "awk -F',' 'NR > 1 && $5 == \"active\" && $4 > 80000 {print $2, $3, $4}' textlab/data/employees_clean.csv",
    category: "Text Processing",
    story:
      '"&&" (AND) দিয়ে একাধিক শর্ত একসাথে জোড়া লাগানো যায় — সবগুলো শর্ত সত্যি হলে তবেই action চলবে। এখানে তিনটা শর্ত: header না হওয়া (NR > 1), status "active" হওয়া (string equality), আর salary ৮০,০০০-এর বেশি হওয়া (numeric comparison) — তিনটাই একসাথে সত্যি হলে তবেই নাম, department, salary print হয়।',
    tokens: [
      {
        token: "NR > 1",
        meaning: "header বাদ দেওয়া",
      },
      {
        token: '$5 == "active"',
        meaning: 'status field exactly "active" কিনা (string comparison)',
      },
      {
        token: "$4 > 80000",
        meaning: "salary field ৮০,০০০-এর বেশি কিনা (numeric comparison)",
      },
      {
        token: "&&",
        meaning: "AND operator — সবগুলো শর্ত একসাথে সত্যি হতে হবে",
      },
      {
        token: "{print $2, $3, $4}",
        meaning: "সব শর্ত সত্যি হলে এই action চলে",
      },
    ],
    tip: '💡 Tip: awk একই field-কে context অনুযায়ী string ("active") বা number (80000) হিসেবে compare করতে পারে — "==" string-এর জন্য, ">" numeric-এর জন্য, একই field-এ দুটোই আলাদা শর্তে ব্যবহার করা যায়।',
  },
  "awk-assoc-array-count": {
    id: "awk-assoc-array-count",
    command:
      "awk -F',' 'NR > 1 {count[$3]++} END {for (dept in count) print count[dept], dept}' textlab/data/employees_clean.csv",
    category: "Text Processing",
    story:
      'awk-এ array-এর index number না হয়ে text-ও হতে পারে (associative array) — "count[$3]++" মানে "department-এর নামটাকে key বানিয়ে, প্রতিবার দেখা পেলে তার counter ১ বাড়াও"। পুরো ফাইল পড়া শেষ হলে "END" ব্লক চলে, যেখানে "for (dept in count)" দিয়ে প্রতিটা department-এর জমে থাকা count একে একে print করা হয় — ভোট গণনার পর প্রতিটা candidate-এর মোট ভোট ঘোষণা করার মতো।',
    tokens: [
      {
        token: "count[$3]++",
        meaning:
          "associative array — department-এর নাম (field ৩) কে key বানিয়ে প্রতিটা লাইনে তার counter বাড়ায়",
      },
      {
        token: "END { }",
        meaning: "পুরো ফাইল পড়া শেষ হওয়ার পর শুধু একবার চলে এমন ব্লক",
      },
      {
        token: "for (dept in count)",
        meaning: "array-এর প্রতিটা key (department name) ঘুরে ঘুরে দেখার loop",
      },
      {
        token: "print count[dept], dept",
        meaning: "প্রতিটা department আর তার মোট count print করে",
      },
    ],
    tip: '💡 Tip: "count[$3]++" লেখার আগে কোথাও ০ দিয়ে initialize করতে হয় না — awk নতুন key দেখলে নিজে থেকেই ০ ধরে শুরু করে, সরাসরি "++" করলেই কাজ হয়।',
  },
  "awk-sum-avg-printf": {
    id: "awk-sum-avg-printf",
    command:
      "awk -F',' 'NR > 1 && $5 == \"active\" {sum += $4; n++} END {printf \"Average salary: $%.0f\", sum/n}' textlab/data/employees_clean.csv",
    category: "Text Processing",
    story:
      'গড় (average) বের করতে দুইটা জিনিস জমাতে হয় — মোট যোগফল (sum) আর মোট সংখ্যা (n)। active কর্মীদের প্রতিটা লাইনে salary "sum"-এ যোগ হচ্ছে আর "n" ১ করে বাড়ছে। পুরো ফাইল পড়া শেষে "END" ব্লকে "sum/n" দিয়ে গড় বের করে, "printf" দিয়ে সুন্দর ফরম্যাটে ("$" sign আর দশমিকের পর ০ ঘর) দেখানো হচ্ছে।',
    tokens: [
      {
        token: "sum += $4",
        meaning:
          "প্রতিটা matching লাইনের salary (field ৪) ক্রমানুসারে যোগ হচ্ছে একটা variable-এ",
      },
      {
        token: "n++",
        meaning: "কতগুলো লাইন গণনায় এলো তার counter",
      },
      {
        token: "END { }",
        meaning: "সব লাইন পড়া শেষ হওয়ার পর একবার চলে",
      },
      {
        token: 'printf "Average salary: $%.0f", sum/n',
        meaning:
          '"%.0f" মানে দশমিক point-এর পর ০ ঘর দেখানো একটা floating-point number — sum/n (গড়) এর জায়গায় বসে',
      },
    ],
    tip: '⚠️ Interview tip: "print" আর "printf" এক না — "print" নিজে থেকে newline যোগ করে, "printf" করে না এবং format string দিয়ে precision control করা যায়, যেমন এখানে "%.0f" দিয়ে দশমিকের পর সংখ্যা সীমিত রাখা হয়েছে।',
  },
  "grep-pipe-awk-F-field": {
    id: "grep-pipe-awk-F-field",
    command:
      "grep \"Sales\" textlab/data/employees_clean.csv | awk -F',' '{print $2}'",
    category: "Text Processing",
    story:
      'grep দিয়ে প্রথমে Sales department-এর লাইনগুলো বের করা হলো, তারপর সেই output pipe দিয়ে awk-এ যাচ্ছে — awk কমা দিয়ে field আলাদা করে ($2 = নাম) print করছে। grep আর awk দুটো টুল একসাথে ব্যবহার করে "filter তারপর extract" — এই দুই-ধাপের pattern CSV data প্রসেসিং-এ খুবই common।',
    tokens: [
      {
        token: 'grep "Sales" file',
        meaning: "Sales department-এর লাইনগুলো ছেঁকে বের করে",
      },
      {
        token: "|",
        meaning: "pipe operator",
      },
      {
        token: "awk -F',' '{print $2}'",
        meaning: "কমা দিয়ে field ভাগ করে, শুধু ২য় field (নাম) print করে",
      },
    ],
    tip: "💡 Tip: এখানে grep শুধু filtering করছে (কোন লাইন রাখবো), আর awk extraction করছে (লাইন থেকে কোন অংশ বের করবো) — দুটো আলাদা দায়িত্ব, একসাথে কাজ করছে pipe দিয়ে।",
  },
  "grep-pipe-awk-condition": {
    id: "grep-pipe-awk-condition",
    command:
      "grep -w \"active\" textlab/data/employees_clean.csv | awk -F',' '$3 == \"Sales\" {print $4}'",
    category: "Text Processing",
    story:
      'প্রথমে grep "-w" (whole word) দিয়ে ঠিক "active" status-এর লাইনগুলো বের করা হলো (inactive বাদ), তারপর সেই লাইনগুলো awk-এ pipe হলো, যেখানে আরেকটা শর্ত ($3 == "Sales") যোগ হচ্ছে — department ঠিক "Sales" হলে তবেই salary (field ৪) print হবে। দুই ধাপে দুই রকম filter একসাথে কাজ করছে।',
    tokens: [
      {
        token: 'grep -w "active" file',
        meaning: 'ঠিক "active" status-এর লাইন বের করে (whole word match)',
      },
      {
        token: "|",
        meaning: "pipe operator",
      },
      {
        token: "awk -F',' '$3 == \"Sales\" {print $4}'",
        meaning: 'সেই লাইনগুলোর মধ্যে department "Sales" হলে salary print করে',
      },
    ],
    tip: "💡 Tip: grep আর awk-এর filtering একসাথে ব্যবহার করলে প্রতিটা ধাপে আলাদা আলাদা শর্ত বসানো যায় — একটা বিশাল জটিল awk script লেখার বদলে ছোট ছোট ধাপে ভাগ করে কাজ করা সহজ হয়।",
  },
  "awk-pipe-grep": {
    id: "awk-pipe-grep",
    command:
      "awk -F',' 'NR > 1 {print $3, $4}' textlab/data/employees_clean.csv | grep \"Engineering\"",
    category: "Text Processing",
    story:
      'এবার উল্টো ক্রম — প্রথমে awk দিয়ে প্রতিটা লাইনের department আর salary (field ৩, ৪) বের করা হলো (header বাদ দিয়ে), তারপর সেই output grep-এ pipe করে শুধু "Engineering" থাকা লাইনগুলো ছেঁকে রাখা হলো। awk প্রথমে data কে "reshape" করছে, তারপর grep তার ওপর সাধারণ text-search চালাচ্ছে।',
    tokens: [
      {
        token: "awk -F',' 'NR > 1 {print $3, $4}'",
        meaning:
          "প্রতিটা লাইনের department আর salary field বের করে (header বাদে)",
      },
      {
        token: "|",
        meaning: "pipe operator",
      },
      {
        token: 'grep "Engineering"',
        meaning:
          '্সেই reshaped output-এর মধ্যে শুধু "Engineering" থাকা লাইন রাখে',
      },
    ],
    tip: "💡 Tip: awk আগে না grep আগে — এই ক্রম গুরুত্বপূর্ণ! awk আগে দিলে awk পুরো ফাইল reshape করে, grep শুধু সেই নতুন ফরম্যাটে text খোঁজে — original ফাইলের field structure-এর চেয়ে ভিন্ন result দিতে পারে।",
  },
  "awk-pipe-grep-v": {
    id: "awk-pipe-grep-v",
    command:
      "awk -F',' 'NR > 1 && $5 == \"active\" {print $2, $3}' textlab/data/employees_clean.csv | grep -v \"Engineering\"",
    category: "Text Processing",
    story:
      'awk দিয়ে প্রথমে active কর্মীদের নাম আর department বের করা হলো, তারপর সেই output "grep -v" দিয়ে filter করে Engineering department বাদ দেওয়া হলো — শেষ ফলাফলে থাকছে active কিন্তু Engineering-এ না, এমন কর্মীরাই।',
    tokens: [
      {
        token: "awk -F',' 'NR > 1 && $5 == \"active\" {print $2, $3}'",
        meaning: "active কর্মীদের নাম আর department বের করে",
      },
      {
        token: "|",
        meaning: "pipe operator",
      },
      {
        token: 'grep -v "Engineering"',
        meaning: "Engineering থাকা লাইন বাদ দিয়ে বাকিগুলো রাখে",
      },
    ],
    tip: '💡 Tip: একই কাজ শুধু awk দিয়েও করা যেত ("$3 != "Engineering"" condition যোগ করে), কিন্তু pipe দিয়ে grep -v ব্যবহার করলে প্রতিটা ধাপ আলাদাভাবে পড়তে ও debug করতে সহজ হয়।',
  },
  "sed-pipe-grep": {
    id: "sed-pipe-grep",
    command:
      "sed 's/engineering/Engineering/gI; s/marketing/Marketing/gI; s/sales/Sales/gI' textlab/data/employees.csv | grep \"Marketing\"",
    category: "Text Processing",
    story:
      'মূল (messy, inconsistent casing) ফাইল থেকে শুরু করে — প্রথমে sed দিয়ে department casing normalize করা হচ্ছে, সেই normalize করা output সরাসরি grep-এ pipe হচ্ছে, যা শুধু "Marketing" থাকা লাইনগুলো বের করছে। আগে data "clean" করে তারপর তার ওপর search চালানো — দুইটা আলাদা ফাইল না বানিয়েই।',
    tokens: [
      {
        token: "sed 's/.../gI; .../gI; .../gI'",
        meaning: "department casing normalize করে (মূল messy ফাইলে)",
      },
      {
        token: "|",
        meaning: "pipe operator",
      },
      {
        token: 'grep "Marketing"',
        meaning: "normalize করা output-এ শুধু Marketing-এর লাইন খোঁজে",
      },
    ],
    tip: '💡 Tip: মূল messy ফাইলটা এখানে কখনো সরাসরি বদলায় না ("-i" ব্যবহার হয়নি) — শুধু pipe-এর মধ্য দিয়ে একটা সাময়িক (temporary) clean ভার্সন তৈরি হয়ে পরের command-এ যায়।',
  },
  "sed-pipe-awk-avg": {
    id: "sed-pipe-awk-avg",
    command:
      "sed 's/engineering/Engineering/gI; s/marketing/Marketing/gI; s/sales/Sales/gI' textlab/data/employees.csv | awk -F',' '$3 == \"Engineering\" {sum += $4; n++} END {printf \"Average Engineering salary: $%.0f\", sum/n}'",
    category: "Text Processing",
    story:
      "তিনটা টুল একসাথে চেইন হচ্ছে — sed দিয়ে মূল messy ফাইলের casing normalize করা হচ্ছে, সেই clean output pipe দিয়ে awk-এ যাচ্ছে, যেখানে শুধু Engineering department-এর salary যোগ করে গড় বের করা হচ্ছে। মূল ফাইল কখনো বদলায়নি, কিন্তু চূড়ান্ত হিসাবটা (average) সঠিকভাবে আসছে, কারণ প্রথমে casing ঠিক করে নেওয়া হয়েছে।",
    tokens: [
      {
        token: "sed 's/.../gI; ...'",
        meaning: "casing normalize করে",
      },
      {
        token: "|",
        meaning: "pipe operator",
      },
      {
        token:
          "awk -F',' '$3 == \"Engineering\" {sum += $4; n++} END {printf ...}'",
        meaning:
          "normalize করা data থেকে শুধু Engineering-এর salary যোগ করে গড় বের করে",
      },
    ],
    tip: '⚠️ Interview tip: normalize (sed) আগে না করে সরাসরি messy ফাইলে এই awk চালানো হলে, "ENGINEERING" বা "engineering" (অন্য casing) লাইনগুলো "$3 == "Engineering""-এর সাথে match করতো না, আর গড়টা ভুল আসতো — এটাই এই পুরো chain-এর আসল কারণ।',
  },
  "sed-grep-awk-pipeline": {
    id: "sed-grep-awk-pipeline",
    command:
      "sed 's/engineering/Engineering/gI; s/marketing/Marketing/gI; s/sales/Sales/gI' textlab/data/employees.csv | grep -w \"active\" | awk -F',' '{count[$3]++} END {for (dept in count) print count[dept], dept}'",
    category: "Text Processing",
    story:
      "পুরো লাবে শেখা তিনটা টুলই এক কমান্ডে একসাথে — sed দিয়ে casing normalize, তারপর grep -w দিয়ে শুধু active কর্মীদের ছেঁকে বের করা, তারপর awk দিয়ে প্রতিটা department-এ কতজন active কর্মী আছে তা associative array দিয়ে গুনে বের করা। তিনটা tool, তিনটা আলাদা দায়িত্ব, একটা single pipeline-এ।",
    tokens: [
      {
        token: "sed 's/.../gI; ...'",
        meaning: "department casing normalize করে",
      },
      {
        token: '| grep -w "active"',
        meaning: 'শুধু ঠিক "active" status-এর লাইন রাখে',
      },
      {
        token:
          "| awk -F',' '{count[$3]++} END {for (dept in count) print count[dept], dept}'",
        meaning:
          "প্রতিটা department-এ (normalize করা, active) কর্মী কতজন তা গুনে print করে",
      },
    ],
    tip: "💡 Tip: এই ধরনের multi-stage pipeline লেখার সময় প্রতিটা ধাপ আলাদাভাবে (একটা একটা করে pipe যোগ করে) টেস্ট করে নেওয়া ভালো অভ্যাস — পুরোটা এক শটে লিখে fail করলে কোন ধাপে ভুল তা বের করা কঠিন হয়ে যায়।",
  },
  "awk-pipe-grep-cE": {
    id: "awk-pipe-grep-cE",
    command:
      "awk -F',' 'NR > 1 {print $4}' textlab/data/employees_clean.csv | grep -cE \"^9\"",
    category: "Text Processing",
    story:
      'প্রথমে awk দিয়ে শুধু salary column (field ৪) বের করা হলো, header বাদ দিয়ে। তারপর সেই সংখ্যাগুলোর মধ্যে কয়টা "9" দিয়ে শুরু (অর্থাৎ ৯০,০০০-এর ঘরে) তা "grep -cE "^9"" দিয়ে গুনে বের করা হচ্ছে — "^9" মানে লাইনের শুরুতেই digit "9", আর "-c" দিয়ে শুধু সংখ্যাটাই (কতগুলো লাইন) বের হচ্ছে।',
    tokens: [
      {
        token: "awk -F',' 'NR > 1 {print $4}'",
        meaning: "শুধু salary column বের করে, header বাদে",
      },
      {
        token: "|",
        meaning: "pipe operator",
      },
      {
        token: 'grep -cE "^9"',
        meaning:
          '"-E" extended regex, "^9" মানে লাইনের শুরুতেই digit 9; "-c" দিয়ে কতগুলো লাইন match করলো তার সংখ্যা দেখায়',
      },
    ],
    tip: '💡 Tip: "^9" দিয়ে "৯ দিয়ে শুরু হওয়া সংখ্যা" বোঝানো হচ্ছে, যা ৯০,০০০-৯৯,৯৯৯ রেঞ্জের salary ধরবে — এটা একটা approximate filter, exact range check (যেমন "> 90000") না, কিন্তু quick regex দিয়ে কাছাকাছি ফলাফল পাওয়ার common trick।',
  },
  "grep-spaced-word": {
    id: "grep-spaced-word",
    command: 'grep " ERROR " loglab/app.log',
    category: "Search",
    story:
      'log-এর প্রতিটা লাইনে timestamp, severity (INFO/WARN/ERROR), আর message থাকে, সবগুলো space দিয়ে আলাদা। শুধু "ERROR" লিখে খুঁজলে এটা কোনো message-এর ভেতরের "ERROR" শব্দকেও ধরে ফেলতে পারতো। তাই "ERROR"-এর দুই পাশে space রেখে (" ERROR ") খোঁজা হচ্ছে — এতে নিশ্চিত হয় এটা ঠিক একটা standalone শব্দ, কোনো বড় শব্দের অংশ না।',
    tokens: [
      {
        token: "grep",
        meaning: "pattern খোঁজার command",
      },
      {
        token: '" ERROR "',
        meaning:
          '"ERROR" একটা আলাদা শব্দ হিসেবে match হচ্ছে তা নিশ্চিত করা আগে-পরে space সহ pattern',
      },
      {
        token: "loglab/app.log",
        meaning: "কোন ফাইলে খোঁজা হবে",
      },
    ],
    tip: '💡 Tip: এভাবে space দিয়ে "word boundary" বানানো একটা সহজ trick, আরো reliable উপায় হলো grep-এর নিজস্ব "-w" (whole word) flag ব্যবহার করা — এখানে field-ভিত্তিক log format-এ space দিয়েই কাজ চলে যায়।',
  },
  "awk-print-field": {
    id: "awk-print-field",
    command: "awk '{print $2}' loglab/app.log",
    category: "Text Processing",
    story:
      'এখানে "-F" flag দেওয়া হয়নি, তাই awk তার default field-separator (space/tab, যেকোনো whitespace) ব্যবহার করছে। log-এর প্রতিটা লাইন "timestamp severity message..." ফরম্যাটে space দিয়ে আলাদা, তাই "$2" মানে দ্বিতীয় word — যেটা হলো severity level (INFO/WARN/ERROR)।',
    tokens: [
      {
        token: "awk",
        meaning: "field-ভিত্তিক text processing command",
      },
      {
        token: "{print $2}",
        meaning: "প্রতিটা লাইনের ২য় field (space দিয়ে আলাদা করা) print করে",
      },
      {
        token: "loglab/app.log",
        meaning: "কোন ফাইল",
      },
    ],
    tip: '💡 Tip: "-F" flag না দিলে awk default ভাবে এক বা একাধিক space/tab-কে field separator ধরে — CSV-এর মতো কমা-separated data না হলে এই default-ই যথেষ্ট।',
  },
  "awk-regex-pattern-print": {
    id: "awk-regex-pattern-print",
    command: "awk '/logged in/{print}' loglab/app.log",
    category: "Text Processing",
    story:
      'awk-এ condition-এর জায়গায় সরাসরি regex ("/pattern/") বসানো যায় — কোনো field-এর সাথে তুলনা না করে, পুরো লাইনে সেই pattern আছে কিনা চেক করে। "/logged in/{print}" মানে "যে লাইনে \'logged in\' আছে, সেই পুরো লাইনটা print করো" — অনেকটা grep-এর মতোই আচরণ, কিন্তু awk দিয়ে লেখা।',
    tokens: [
      {
        token: "awk",
        meaning: "field-ভিত্তিক text processing command",
      },
      {
        token: "/logged in/",
        meaning:
          "regex pattern হিসেবে condition — পুরো লাইনে এই pattern থাকলেই সত্যি ধরা হয়",
      },
      {
        token: "{print}",
        meaning:
          "(কোনো argument ছাড়া) শর্ত সত্যি হলে পুরো current লাইনটাই print করে",
      },
    ],
    tip: '💡 Tip: "{print}" আর শুধু condition দিয়ে কিছু না লেখা — দুটোই একই কাজ করে, কারণ action না দিলে awk ধরে নেয় তুমি "print" ই চাও।',
  },
  "awk-field-eq-whitespace": {
    id: "awk-field-eq-whitespace",
    command: "awk '$2==\"ERROR\"{print}' loglab/app.log",
    category: "Text Processing",
    story:
      'grep দিয়ে " ERROR " space-trick ব্যবহার করে ঠিক শব্দটা match করা যায়, কিন্তু awk দিয়ে আরো নির্ভরযোগ্যভাবে করা যায় — কারণ awk জানে কোনটা exactly "২য় field"। "$2=="ERROR"" মানে "শুধু ২ নম্বর field (severity) ঠিক "ERROR" হলে" — আশেপাশে space লাগানোর দরকারই নেই, field নিজেই সুনির্দিষ্ট।',
    tokens: [
      {
        token: "awk",
        meaning: "field-ভিত্তিক text processing command",
      },
      {
        token: '$2=="ERROR"',
        meaning:
          '২ নম্বর field (severity) ঠিক "ERROR" কিনা (exact string match) — condition',
      },
      {
        token: "{print}",
        meaning: "শর্ত সত্যি হলে পুরো লাইন print করে",
      },
    ],
    tip: '⚠️ Interview tip: grep-এর " ERROR " space-trick আর awk-এর "$2=="ERROR"" — দুটোই একই উদ্দেশ্যে (false substring match এড়ানো), কিন্তু awk-এর ভার্সনটা বেশি নির্ভরযোগ্য, কারণ এটা structure (field position) বোঝে, শুধু text pattern না।',
  },
  "awk-field-eq-print-field": {
    id: "awk-field-eq-print-field",
    command: "awk '$2==\"WARN\"{print $3}' loglab/app.log",
    category: "Text Processing",
    story:
      'আগের entry-র মতোই field ২ (severity) দিয়ে filter করা হচ্ছে, কিন্তু এবার পুরো লাইন না, শুধু field ৩ (message-এর প্রথম শব্দ) print করা হচ্ছে — "condition দিয়ে বাছাই, কিন্তু action-এ ভিন্ন field দেখানো" এই প্যাটার্নটাই awk-কে শক্তিশালী করে তোলে।',
    tokens: [
      {
        token: "awk",
        meaning: "field-ভিত্তিক text processing command",
      },
      {
        token: '$2=="WARN"',
        meaning: 'severity field ঠিক "WARN" কিনা — condition',
      },
      {
        token: "{print $3}",
        meaning:
          "শর্ত সত্যি হলে ৩ নম্বর field (message-এর প্রথম শব্দ) print করে — পুরো লাইন না",
      },
    ],
    tip: "💡 Tip: condition আর action-এ আলাদা আলাদা field ব্যবহার করা যায় — filter একটা field দিয়ে, output অন্য field দিয়ে। এটাই awk-কে শুধু grep-এর চেয়ে বেশি নমনীয় করে তোলে।",
  },
  "grep-pipe-awk-regex-field": {
    id: "grep-pipe-awk-regex-field",
    command: "grep \" ERROR \" loglab/app.log | awk '/Database/{print $1}'",
    category: "Text Processing",
    story:
      'প্রথমে grep দিয়ে সব ERROR লাইন বের করা হলো, তারপর সেই output awk-এ pipe হলো, যেখানে আরেকটা regex condition ("/Database/") দিয়ে আরও সংকীর্ণ করে শুধু "Database" শব্দ থাকা ERROR লাইনগুলো বাছাই করা হলো, আর field ১ (timestamp) print করা হলো — দুই ধাপে দুই রকম filter চালিয়ে শেষে নির্দিষ্ট একটা field বের করা।',
    tokens: [
      {
        token: 'grep " ERROR " app.log',
        meaning: "সব ERROR লাইন বের করে",
      },
      {
        token: "|",
        meaning: "pipe operator",
      },
      {
        token: "awk '/Database/{print $1}'",
        meaning:
          '"Database" শব্দ আছে এমন ERROR লাইনগুলো থেকে শুধু timestamp (field ১) print করে',
      },
    ],
    tip: "💡 Tip: grep দিয়ে coarse (মোটা দাগের) filter, তারপর awk দিয়ে fine (সূক্ষ্ম) filter + field extraction — এই combo দিয়ে ধাপে ধাপে ডেটা সংকুচিত করে ঠিক যা দরকার তা বের করা যায়।",
  },
  "awk-counter-var": {
    id: "awk-counter-var",
    command: "awk '$2!=\"INFO\"{c++} END{print c}' loglab/app.log",
    category: "Text Processing",
    story:
      'associative array ছাড়াও, awk-এ একটা সাধারণ variable দিয়েও গোনা যায়। "$2!="INFO"" মানে "severity INFO না হলে" (অর্থাৎ WARN বা ERROR) — প্রতিবার এই শর্ত সত্যি হলে "c" variable ১ বাড়ে। পুরো ফাইল পড়া শেষে "END" ব্লকে সেই চূড়ান্ত সংখ্যাটা print হয় — একটামাত্র সংখ্যা, breakdown ছাড়া।',
    tokens: [
      {
        token: '$2!="INFO"',
        meaning:
          'severity field "INFO" না হলে — condition (not-equal operator "!=")',
      },
      {
        token: "c++",
        meaning:
          "একটা সাধারণ counter variable, প্রতিবার শর্ত সত্যি হলে ১ বাড়ে",
      },
      {
        token: "END{print c}",
        meaning: "সব লাইন পড়া শেষে, জমে থাকা মোট count print করে",
      },
    ],
    tip: '💡 Tip: "count[$2]++" (associative array, প্রতিটা আলাদা severity-র জন্য আলাদা count) আর "c++" (একটামাত্র simple variable, সব মিলিয়ে এক count) — দুটোই একই idea-র ভিন্ন প্রয়োগ, দরকার অনুযায়ী বেছে নেওয়া যায়।',
  },
  "awk-assoc-array-printf": {
    id: "awk-assoc-array-printf",
    command:
      "awk '{count[$2]++} END {for (k in count) printf \"%s: %d\", k, count[k]}' loglab/app.log",
    category: "Text Processing",
    story:
      'আগে শেখা associative-array-counting-এর ঠিক একই logic, কিন্তু output এবার "print" দিয়ে না, "printf" দিয়ে সুন্দর ফরম্যাটে দেখানো হচ্ছে — "%s: %d" মানে "একটা text, তারপর colon, তারপর একটা সংখ্যা" এই নির্দিষ্ট প্যাটার্নে, যেমন "ERROR: 5"।',
    tokens: [
      {
        token: "count[$2]++",
        meaning:
          "severity level-কে key বানিয়ে প্রতিটা দেখায় তার counter বাড়ায়",
      },
      {
        token: 'END {for (k in count) printf "%s: %d", k, count[k]}',
        meaning:
          'শেষে প্রতিটা severity আর তার count "severity: সংখ্যা" ফরম্যাটে print করে',
      },
      {
        token: "%s",
        meaning:
          "format specifier — একটা string (এখানে severity level) বসানোর জায়গা",
      },
      {
        token: "%d",
        meaning:
          "format specifier — একটা পূর্ণসংখ্যা (integer, এখানে count) বসানোর জায়গা",
      },
    ],
    tip: '⚠️ Interview tip: "printf" নিজে থেকে newline যোগ করে না — একাধিক key-এর জন্য loop চালালে প্রতিটা আলাদা লাইনে দেখাতে চাইলে format string-এর শেষে নিজেই "\\n" যোগ করতে হয় (এই exercise-এ ইচ্ছাকৃতভাবে বাদ দেওয়া হয়েছে, output একটানা দেখানোর জন্য)।',
  },
};
