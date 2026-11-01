import { describe, expect, it } from "vitest";
import { createShell, execute, isAwaitingInput, submitInput } from "./engine";
import type { ShellState } from "./engine";

function run(state: ShellState, cmd: string) {
  return execute(state, cmd);
}

function runAll(cmds: string[]): ShellState {
  let state = createShell();
  for (const cmd of cmds) {
    const r = run(state, cmd);
    state = r.state;
  }
  return state;
}

function writeScript(
  state: ShellState,
  path: string,
  content: string,
): ShellState {
  const next: ShellState = JSON.parse(JSON.stringify(state));
  next.fs[`/root/${path}`] = {
    type: "file",
    content,
    mode: "644",
    owner: "root",
    group: "root",
  };
  return next;
}

describe("script execution basics", () => {
  it("./script.sh fails without execute permission", () => {
    let state = createShell();
    state = writeScript(state, "foo.sh", "#!/bin/bash\necho hi");
    const result = run(state, "./foo.sh");
    expect(result.error).toBe(true);
    expect(result.output).toMatch(/Permission denied/);
  });

  it("chmod +x then ./script.sh runs it", () => {
    let state = createShell();
    state = writeScript(
      state,
      "foo.sh",
      '#!/bin/bash\necho "Hello, welcome to Bash scripting Labs!"',
    );
    state = run(state, "chmod +x foo.sh").state;
    const result = run(state, "./foo.sh");
    expect(result.error).toBe(false);
    expect(result.output).toBe("Hello, welcome to Bash scripting Labs!");
  });

  it("bash script.sh runs without needing +x", () => {
    let state = createShell();
    state = writeScript(state, "foo.sh", "echo hi");
    const result = run(state, "bash foo.sh");
    expect(result.error).toBe(false);
    expect(result.output).toBe("hi");
  });

  it("missing script fails cleanly", () => {
    const result = run(createShell(), "./nope.sh");
    expect(result.error).toBe(true);
  });
});

describe("variables", () => {
  it("assigns and expands scalar variables", () => {
    let state = createShell();
    state = writeScript(
      state,
      "variables.sh",
      `#!/bin/bash
name="Nabil"
age=25
department="CSE"
echo "Name: $name"
echo "Age: $age"
echo "Department: $department"`,
    );
    state = run(state, "chmod +x variables.sh").state;
    const result = run(state, "./variables.sh");
    expect(result.output).toBe("Name: Nabil\nAge: 25\nDepartment: CSE");
  });

  it("single quotes do not expand variables", () => {
    let state = createShell();
    state = writeScript(
      state,
      "s.sh",
      `str1="Bash"\nstr2="Scripting"\necho '$str1 $str2'`,
    );
    const result = run(state, "bash s.sh");
    expect(result.output).toBe("$str1 $str2");
  });

  it("string length, substring, concatenation", () => {
    let state = createShell();
    state = writeScript(
      state,
      "s.sh",
      `first_name="Ahnaf"
last_name="Nabil"
full_name="$first_name $last_name"
echo "Full name: $full_name"
name_length=\${#full_name}
echo "Length of full name: $name_length"
echo "First 4 characters: \${full_name:0:4}"`,
    );
    const result = run(state, "bash s.sh");
    expect(result.output).toBe(
      "Full name: Ahnaf Nabil\nLength of full name: 11\nFirst 4 characters: Ahna",
    );
  });

  it("special variables: $0 $1 $2 $@ $#", () => {
    let state = createShell();
    state = writeScript(
      state,
      "special_vars.sh",
      `echo "Script name: $0"
echo "First argument: $1"
echo "Second argument: $2"
echo "All arguments: $@"
echo "Number of arguments: $#"`,
    );
    const result = run(state, "bash special_vars.sh arg1 arg2 arg3");
    expect(result.output).toBe(
      "Script name: special_vars.sh\nFirst argument: arg1\nSecond argument: arg2\nAll arguments: arg1 arg2 arg3\nNumber of arguments: 3",
    );
  });

  it("system variables HOME/USER/PWD", () => {
    let state = createShell();
    state = writeScript(
      state,
      "s.sh",
      'echo "Home directory: $HOME"\necho "Present working directory: $PWD"',
    );
    const result = run(state, "bash s.sh");
    expect(result.output).toBe(
      "Home directory: /root\nPresent working directory: /root",
    );
  });

  it("readonly prevents reassignment without aborting the script", () => {
    let state = createShell();
    state = writeScript(
      state,
      "r.sh",
      `readonly MIN_AGE=18
echo "Before: $MIN_AGE"
MIN_AGE=16
echo "After: $MIN_AGE"`,
    );
    const result = run(state, "bash r.sh");
    expect(result.error).toBe(false);
    expect(result.output).toContain("Before: 18");
    expect(result.output).toContain("readonly variable");
    expect(result.output).toContain("After: 18");
  });

  it("export makes a var visible to a child script; non-exported vars are not", () => {
    let state = createShell();
    state = writeScript(
      state,
      "child.sh",
      `echo "Trying to access local_var: $local_var"
echo "Accessing shared_var: $shared_var"`,
    );
    state = writeScript(
      state,
      "parent.sh",
      `local_var="I am local"
export shared_var="I am shared"
./child.sh`,
    );
    state = run(state, "chmod +x child.sh").state;
    state = run(state, "chmod +x parent.sh").state;
    const result = run(state, "./parent.sh");
    expect(result.output).toBe(
      "Trying to access local_var: \nAccessing shared_var: I am shared",
    );
  });
});

describe("arrays", () => {
  it("indexed array declare/access/iterate", () => {
    let state = createShell();
    state = writeScript(
      state,
      "a.sh",
      `declare -a fruits=("apple" "banana" "orange" "grape")
echo "First fruit: \${fruits[0]}"
echo "All fruits: \${fruits[@]}"
for fruit in "\${fruits[@]}"; do
  echo "Processing fruit: $fruit"
done`,
    );
    const result = run(state, "bash a.sh");
    expect(result.output).toBe(
      "First fruit: apple\nAll fruits: apple banana orange grape\nProcessing fruit: apple\nProcessing fruit: banana\nProcessing fruit: orange\nProcessing fruit: grape",
    );
  });

  it("multi-line array literal", () => {
    let state = createShell();
    state = writeScript(
      state,
      "a.sh",
      `books=(
  "1984"
  "Brave New World"
  "Fahrenheit 451"
)
echo "Books: \${books[@]}"`,
    );
    const result = run(state, "bash a.sh");
    expect(result.output).toBe("Books: 1984 Brave New World Fahrenheit 451");
  });

  it("indices, length, append, update, unset", () => {
    let state = createShell();
    state = writeScript(
      state,
      "a.sh",
      `colors=("Red" "Green" "Blue")
echo "Indices: \${!colors[@]}"
echo "Count: \${#colors[@]}"
colors+=("Yellow")
echo "After append: \${colors[@]}"
colors[1]="Lime"
echo "After update: \${colors[@]}"
unset colors[0]
echo "After unset: \${colors[@]}"`,
    );
    const result = run(state, "bash a.sh");
    const lines = result.output.split("\n");
    expect(lines[0]).toBe("Indices: 0 1 2");
    expect(lines[1]).toBe("Count: 3");
    expect(lines[2]).toBe("After append: Red Green Blue Yellow");
    expect(lines[3]).toBe("After update: Red Lime Blue Yellow");
    expect(lines[4]).toBe("After unset: Lime Blue Yellow");
  });

  it("for loop with indices", () => {
    let state = createShell();
    state = writeScript(
      state,
      "a.sh",
      `teams=("Developers" "Designers")
for i in "\${!teams[@]}"; do
  echo "Team $i: \${teams[$i]}"
done`,
    );
    const result = run(state, "bash a.sh");
    expect(result.output).toBe("Team 0: Developers\nTeam 1: Designers");
  });

  it("associative array", () => {
    let state = createShell();
    state = writeScript(
      state,
      "a.sh",
      `declare -A user_roles
user_roles=(
  ["Nabil"]="admin"
  ["Minhaz"]="developer"
)
echo "Nabil's role: \${user_roles["Nabil"]}"
echo "All roles: \${user_roles[@]}"`,
    );
    const result = run(state, "bash a.sh");
    expect(result.output).toContain("Nabil's role: admin");
    expect(result.output).toContain("admin");
    expect(result.output).toContain("developer");
  });
});

describe("string operations", () => {
  it("substring extraction", () => {
    let state = createShell();
    state = writeScript(
      state,
      "s.sh",
      'str="Hello Poridhi"\nsubstr="${str:6:7}"\necho "Substring: $substr"\necho "First 5 chars: ${str:0:5}"\necho "Omitting length: ${str:6}"',
    );
    const result = run(state, "bash s.sh");
    expect(result.error).toBe(false);
    expect(result.output).toBe(
      "Substring: Poridhi\nFirst 5 chars: Hello\nOmitting length: Poridhi",
    );
  });

  it("replace first and all occurrences", () => {
    let state = createShell();
    state = writeScript(
      state,
      "s.sh",
      `str="Bash is fun. Bash is powerful."
echo "\${str/Bash/Shell}"
echo "\${str//Bash/Shell}"`,
    );
    const result = run(state, "bash s.sh");
    expect(result.output).toBe(
      "Shell is fun. Bash is powerful.\nShell is fun. Shell is powerful.",
    );
  });

  it("remove suffix with %", () => {
    let state = createShell();
    state = writeScript(
      state,
      "s.sh",
      `str="Bash is fun. Bash is powerful."\necho "\${str%. *}"`,
    );
    const result = run(state, "bash s.sh");
    expect(result.output).toBe("Bash is fun");
  });

  it("case conversion", () => {
    let state = createShell();
    state = writeScript(
      state,
      "s.sh",
      `str="Bash Scripting"
echo "\${str^^}"
echo "\${str,,}"
echo "\${str^}"`,
    );
    const result = run(state, "bash s.sh");
    expect(result.output).toBe(
      "BASH SCRIPTING\nbash scripting\nBash Scripting",
    );
  });

  it("glob substring check with [[ ]]", () => {
    let state = createShell();
    state = writeScript(
      state,
      "s.sh",
      `str="Linux is awesome"
if [[ "$str" == *"is"* ]]; then
  echo "Substring found!"
fi
empty_str=""
if [[ -z "$empty_str" ]]; then
  echo "String is empty"
fi`,
    );
    const result = run(state, "bash s.sh");
    expect(result.output).toBe("Substring found!\nString is empty");
  });

  it("split string with IFS and read -ra", () => {
    let state = createShell();
    state = writeScript(
      state,
      "s.sh",
      `csv="apple,banana,grape"
IFS=',' read -ra fruits <<< "$csv"
echo "First fruit: \${fruits[0]}"
echo "All fruits: \${fruits[@]}"`,
    );
    const result = run(state, "bash s.sh");
    expect(result.output).toBe(
      "First fruit: apple\nAll fruits: apple banana grape",
    );
  });
});

describe("conditionals", () => {
  it("if/elif/else with -gt/-eq", () => {
    let state = createShell();
    state = writeScript(
      state,
      "c.sh",
      `num=5
if [ "$num" -gt 10 ]; then
  echo "Number is greater than 10"
elif [ "$num" -eq 5 ]; then
  echo "Number is exactly 5"
else
  echo "Number is less than 5"
fi`,
    );
    expect(run(state, "bash c.sh").output).toBe("Number is exactly 5");
  });

  it("logical AND across two [ ] tests", () => {
    let state = createShell();
    state = writeScript(
      state,
      "c.sh",
      `cpu_usage=85
mem_usage=75
CPU_THRESHOLD=80
MEM_THRESHOLD=70
if [ "$cpu_usage" -gt "$CPU_THRESHOLD" ] && [ "$mem_usage" -gt "$MEM_THRESHOLD" ]; then
  echo "CRITICAL"
fi`,
    );
    expect(run(state, "bash c.sh").output).toBe("CRITICAL");
  });

  it("-f file existence check", () => {
    let state = createShell();
    state.fs["/root/app.log"] = {
      type: "file",
      content: "x",
      mode: "644",
      owner: "root",
      group: "root",
    };
    state = writeScript(
      state,
      "c.sh",
      `LOG_FILE="app.log"
if [ -f "$LOG_FILE" ]; then
  echo "Processing $LOG_FILE..."
else
  echo "Error: $LOG_FILE not found!"
fi`,
    );
    expect(run(state, "bash c.sh").output).toBe("Processing app.log...");
  });
});

describe("loops", () => {
  it("for over a word list", () => {
    let state = createShell();
    state = writeScript(
      state,
      "l.sh",
      `for fruit in Apple Banana Orange; do\n  echo "Processing $fruit..."\ndone`,
    );
    expect(run(state, "bash l.sh").output).toBe(
      "Processing Apple...\nProcessing Banana...\nProcessing Orange...",
    );
  });

  it("for over a brace range with break", () => {
    let state = createShell();
    state = writeScript(
      state,
      "l.sh",
      `for num in {1..10}; do
  if [ $num -eq 5 ]; then
    break
  fi
  echo "Number: $num"
done`,
    );
    expect(run(state, "bash l.sh").output).toBe(
      "Number: 1\nNumber: 2\nNumber: 3\nNumber: 4",
    );
  });

  it("for with continue", () => {
    let state = createShell();
    state = writeScript(
      state,
      "l.sh",
      `for num in {1..5}; do
  if [ $num -eq 3 ]; then
    continue
  fi
  echo "Number: $num"
done`,
    );
    expect(run(state, "bash l.sh").output).toBe(
      "Number: 1\nNumber: 2\nNumber: 4\nNumber: 5",
    );
  });

  it("while loop with arithmetic decrement", () => {
    let state = createShell();
    state = writeScript(
      state,
      "l.sh",
      `count=3
while [ $count -gt 0 ]; do
  echo "Countdown: $count"
  ((count--))
done
echo "Liftoff!"`,
    );
    expect(run(state, "bash l.sh").output).toBe(
      "Countdown: 3\nCountdown: 2\nCountdown: 1\nLiftoff!",
    );
  });

  it("until loop", () => {
    let state = createShell();
    state = writeScript(
      state,
      "l.sh",
      `count=0
until [ $count -ge 2 ]; do
  echo "Waiting... $count"
  ((count++))
done
echo "done waiting"`,
    );
    const result = run(state, "bash l.sh");
    expect(result.output).toBe("Waiting... 0\nWaiting... 1\ndone waiting");
  });

  it("until loop with -f on a file that already exists runs zero times", () => {
    let state = createShell();
    state.fs["/root/important.log"] = {
      type: "file",
      content: "x",
      mode: "644",
      owner: "root",
      group: "root",
    };
    state = writeScript(
      state,
      "l.sh",
      `file="important.log"
until [ -f "$file" ]; do
  echo "Waiting for $file..."
done
echo "$file found! Proceeding..."`,
    );
    const result = run(state, "bash l.sh");
    expect(result.output).toBe("important.log found! Proceeding...");
  });

  it("$(( )) command-substitution style increment via count=$((count + 1))", () => {
    let state = createShell();
    state = writeScript(
      state,
      "l.sh",
      `count=1
while [ $count -le 3 ]; do
  echo "Iteration: $count"
  count=$((count + 1))
done`,
    );
    expect(run(state, "bash l.sh").output).toBe(
      "Iteration: 1\nIteration: 2\nIteration: 3",
    );
  });
});

describe("functions", () => {
  it("defines and calls a simple function", () => {
    let state = createShell();
    state = writeScript(
      state,
      "f.sh",
      `greet_user() {\n  echo "Hello, User!"\n}\ngreet_user`,
    );
    expect(run(state, "bash f.sh").output).toBe("Hello, User!");
  });

  it("positional args and return-via-echo captured with $()", () => {
    let state = createShell();
    state = writeScript(
      state,
      "f.sh",
      `sum() {
  local num1=$1
  local num2=$2
  echo $((num1 + num2))
}
result=$(sum 10 20)
echo "Sum: $result"`,
    );
    expect(run(state, "bash f.sh").output).toBe("Sum: 30");
  });

  it("return code is captured in $?", () => {
    let state = createShell();
    state.fs["/root/passwd"] = {
      type: "file",
      content: "x",
      mode: "644",
      owner: "root",
      group: "root",
    };
    state = writeScript(
      state,
      "f.sh",
      `check_file() {
  if [ -f "$1" ]; then
    echo "File exists: $1"
    return 0
  else
    echo "File not found: $1"
    return 1
  fi
}
check_file "passwd"
if [ $? -eq 0 ]; then
  echo "File check passed!"
fi`,
    );
    const result = run(state, "bash f.sh");
    expect(result.output).toBe("File exists: passwd\nFile check passed!");
  });

  it("local does not leak, global is visible inside", () => {
    let state = createShell();
    state = writeScript(
      state,
      "f.sh",
      `global_var="I am global"
test_scope() {
  local local_var="I am local"
  echo "Inside function: $local_var"
  echo "Inside function: $global_var"
}
test_scope
echo "Outside function: $local_var"
echo "Outside function: $global_var"`,
    );
    const result = run(state, "bash f.sh");
    expect(result.output).toBe(
      "Inside function: I am local\nInside function: I am global\nOutside function: \nOutside function: I am global",
    );
  });

  it("function style: function name { ... }", () => {
    let state = createShell();
    state = writeScript(
      state,
      "f.sh",
      `function greet {\n  echo "hi"\n}\ngreet`,
    );
    expect(run(state, "bash f.sh").output).toBe("hi");
  });
});

describe("redirection", () => {
  it("> writes, >> appends", () => {
    let state = createShell();
    state = run(state, 'bash -c "echo hi"').state;
    const r1 = run(state, "bash -c 'echo \"Hello Poridhi\" > output.txt'");
    const r2 = run(r1.state, "bash -c 'echo \"New line\" >> output.txt'");
    const r3 = run(r2.state, "cat output.txt");
    expect(r3.output).toBe("Hello Poridhi\nNew line");
  });

  it("heredoc feeds cat", () => {
    let state = createShell();
    state = writeScript(
      state,
      "h.sh",
      "cat << EOF\nThis is a multi-line\ntext block.\nEOF",
    );
    const result = run(state, "bash h.sh");
    expect(result.error).toBe(false);
    expect(result.output).toBe("This is a multi-line\ntext block.");
  });

  it("sort < input.txt reads stdin from a file", () => {
    let state = createShell();
    state = writeScript(
      state,
      "r.sh",
      'echo "banana" > input.txt\necho "apple" >> input.txt\nsort < input.txt',
    );
    const result = run(state, "bash r.sh");
    expect(result.output).toBe("apple\nbanana");
  });

  it("redirecting to /dev/null discards output", () => {
    let state = createShell();
    state = writeScript(
      state,
      "r.sh",
      "rm non-existent-file 2> /dev/null\necho done",
    );
    const result = run(state, "bash r.sh");
    expect(result.error).toBe(false);
    expect(result.output).toBe("done");
  });

  it("echo > /dev/null discards its own output without erroring", () => {
    const result = run(createShell(), 'echo "Secret Message" > /dev/null');
    expect(result.error).toBe(false);
    expect(result.output).toBe("");
  });

  it("&> merges stdout and stderr into one target", () => {
    const result = run(createShell(), "ls /tmp /nope &> combined.log");
    expect(result.error).toBe(false);
    expect(result.state.fs["/root/combined.log"]).toBeDefined();
  });

  it("&>> appends stdout+stderr to an existing target", () => {
    let state = createShell();
    state = run(state, "ls /tmp /nope &> combined.log").state;
    const before = state.fs["/root/combined.log"]?.content ?? "";
    const result = run(state, "ls /tmp /nope &>> combined.log");
    expect(result.error).toBe(false);
    expect(
      (result.state.fs["/root/combined.log"]?.content ?? "").length,
    ).toBeGreaterThan(before.length);
  });
});

describe("jq-adjacent: log processing function pipeline", () => {
  it("full log_processor-style script with mkdir/mv/grep", () => {
    let state = createShell();
    state = writeScript(
      state,
      "log_processor.sh",
      `LOG_FILE="app.log"
ARCHIVE_DIR="logs_archive"
check_log() {
  if [ ! -f "$LOG_FILE" ]; then
    echo "Error: $LOG_FILE not found!"
    exit 1
  fi
}
process_log() {
  local error_count=$(grep -c "ERROR" "$LOG_FILE")
  echo "Number of errors: $error_count"
}
check_log
process_log`,
    );
    state.fs["/root/app.log"] = {
      type: "file",
      content:
        "INFO: System started\nERROR: Disk full\nINFO: Backup completed\nERROR: Network timeout",
      mode: "644",
      owner: "root",
      group: "root",
    };
    const result = run(state, "bash log_processor.sh");
    expect(result.output).toBe("Number of errors: 2");
  });
});

describe("interactive read", () => {
  it("pauses on read, resumes with the typed value", () => {
    let state = createShell();
    state = writeScript(
      state,
      "greetings.sh",
      `echo "Enter your name:"
read name
echo "Hello, $name! Welcome to Bash scripting Labs."`,
    );
    state = run(state, "chmod +x greetings.sh").state;
    const r1 = run(state, "./greetings.sh");
    expect(r1.error).toBe(false);
    expect(r1.output).toBe("Enter your name:");
    expect(isAwaitingInput(r1.state)).toBe(true);
    const r2 = submitInput(r1.state, "Nobel");
    expect(isAwaitingInput(r2.state)).toBe(false);
    expect(r2.output).toBe("Hello, Nobel! Welcome to Bash scripting Labs.");
  });

  it("while true + read -p + break escapes the loop", () => {
    let state = createShell();
    state = writeScript(
      state,
      "loop.sh",
      `while true; do
  read -p "Enter a command (type 'exit' to quit): " cmd
  if [ "$cmd" = "exit" ]; then
    break
  else
    echo "Executing: $cmd"
  fi
done
echo "bye"`,
    );
    let result = run(state, "bash loop.sh");
    expect(isAwaitingInput(result.state)).toBe(true);
    expect(result.output).toContain("Enter a command");
    result = submitInput(result.state, "ls -la");
    expect(result.output).toContain("Executing: ls -la");
    expect(isAwaitingInput(result.state)).toBe(true);
    result = submitInput(result.state, "exit");
    expect(isAwaitingInput(result.state)).toBe(false);
    expect(result.output).toBe("bye");
  });
});
