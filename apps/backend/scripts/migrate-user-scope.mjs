// One-off: hand every pre-auth progress/notes/quiz/ask/recall row to one user,
// then swap the old global unique indexes for per-user ones.
//
//   cd apps/backend
//   pnpm migrate:user-scope --email habiburnobel@gmail.com
//
// Register that account first. Safe to re-run: only rows without a userId are touched.
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

// Read the monorepo root .env ourselves (`node --env-file` needs Node >= 20.6).
const rootEnv = resolve(dirname(fileURLToPath(import.meta.url)), '../../../.env');
if (!process.env.MONGODB_URI && existsSync(rootEnv)) {
  const line = readFileSync(rootEnv, 'utf-8')
    .split('\n')
    .find((l) => l.trim().startsWith('MONGODB_URI='));
  if (line) {
    process.env.MONGODB_URI = line
      .slice(line.indexOf('=') + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
}

const COLLECTIONS = [
  {
    name: 'content_progress',
    dropIndex: 'key_1_type_1',
    unique: { userId: 1, key: 1, type: 1 },
  },
  { name: 'notes', dropIndex: 'contentId_1', unique: { userId: 1, contentId: 1 } },
  {
    name: 'ask_conversations',
    dropIndex: 'contentId_1',
    unique: { userId: 1, contentId: 1 },
  },
  {
    name: 'sd_quiz_progress',
    dropIndex: 'topicId_1',
    unique: { userId: 1, topicId: 1 },
  },
  {
    name: 'sd_recall_points',
    dropIndex: 'topicId_1_term_1',
    unique: { userId: 1, topicId: 1, term: 1 },
  },
  { name: 'quiz_attempts' },
  { name: 'sd_quiz_attempts' },
  { name: 'sd_recall_reviews' },
];

const emailArg = process.argv.indexOf('--email');
const email = emailArg > -1 ? process.argv[emailArg + 1]?.toLowerCase() : null;
if (!email) {
  console.error('Usage: node scripts/migrate-user-scope.mjs --email <email>');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI not found in the root .env');
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const db = client.db();

  const user = await db.collection('users').findOne({ email });
  if (!user) {
    console.error(`No user with email ${email}. Register first; nothing changed.`);
    process.exit(1);
  }
  const userId = String(user._id);
  console.log(`Assigning existing data to ${email} (${userId})`);

  const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));

  for (const { name, dropIndex, unique } of COLLECTIONS) {
    if (!existing.has(name)) {
      console.log(`- ${name}: collection not found, skipped`);
      continue;
    }
    const col = db.collection(name);
    const { modifiedCount } = await col.updateMany(
      { userId: { $exists: false } },
      { $set: { userId } },
    );

    if (dropIndex && (await col.indexExists(dropIndex))) {
      await col.dropIndex(dropIndex);
    }
    await col.createIndex({ userId: 1 });
    if (unique) await col.createIndex(unique, { unique: true });

    console.log(`- ${name}: ${modifiedCount} rows assigned`);
  }
  console.log('Done.');
} finally {
  await client.close();
}
