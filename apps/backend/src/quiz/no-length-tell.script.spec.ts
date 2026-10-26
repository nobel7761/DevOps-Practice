/// <reference types="jest" />
// Guards against a real content bug a user found: across this app's quiz
// banks, the correct option was very often simply the longest/most detailed
// one (because wrong options were written as terse one-liners), making
// every quiz guessable without reading the question. This test scans every
// quiz data file and fails if any question's correct option is the unique
// longest among its options — i.e. at least one wrong option must be as
// long as or longer than the correct one.
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { findLengthTellViolations } from './no-length-tell';

const DATA_DIR = join(__dirname, 'data');

describe('quiz banks have no "longest option is correct" tell', () => {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));

  it('found quiz data files to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s has no length-tell violations', (file) => {
    const bank = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf-8'));
    const violations = findLengthTellViolations(bank.questions);
    expect(violations).toEqual([]);
  });
});
