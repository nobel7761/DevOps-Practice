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
};
