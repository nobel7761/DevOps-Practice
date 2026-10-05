export interface CommandToken {
  token: string;
  meaning: string;
}

export interface CommandEntry {
  id: string;
  command: string;
  category: string;
  story: string;
  tokens: CommandToken[];
  tip?: string;
}
