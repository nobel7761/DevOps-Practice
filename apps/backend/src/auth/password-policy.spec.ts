/// <reference types="jest" />
import { checkPassword, isStrongPassword } from './password-policy';

describe('password policy (8-48 chars, 2 upper, 2 lower, 2 number, 2 special)', () => {
  it('accepts a password meeting every rule', () => {
    expect(isStrongPassword('AAbb12!!')).toBe(true);
    expect(
      isStrongPassword('Ab'.repeat(2) + '12' + '#$' + 'x'.repeat(40)),
    ).toBe(true);
  });

  it.each([
    ['too short (7)', 'AAb1!!x'.slice(0, 7), 'length'],
    ['too long (49)', 'AAbb12!!' + 'x'.repeat(41), 'length'],
    ['only 1 uppercase', 'Abbb12!!', 'upper'],
    ['only 1 lowercase', 'AAAb12!!', 'lower'],
    ['only 1 number', 'AAbb1!!!', 'number'],
    ['only 1 special', 'AAbb12!x', 'special'],
  ])('rejects %s', (_label, pw, failedRule) => {
    expect(isStrongPassword(pw)).toBe(false);
    expect(
      checkPassword(pw)[failedRule as keyof ReturnType<typeof checkPassword>],
    ).toBe(false);
  });

  it('allows exactly 48 characters', () => {
    expect(isStrongPassword('AAbb12!!' + 'x'.repeat(40))).toBe(true);
  });

  it('rejects non-strings', () => {
    expect(isStrongPassword(undefined)).toBe(false);
  });
});
