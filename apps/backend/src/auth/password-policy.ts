import { registerDecorator, type ValidationOptions } from 'class-validator';

const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;

/** Same rules as the frontend checklist (apps/frontend/src/lib/auth/password-rules.ts). */
export function checkPassword(password: string) {
  return {
    length: password.length >= 8 && password.length <= 48,
    upper: count(password, /[A-Z]/g) >= 2,
    lower: count(password, /[a-z]/g) >= 2,
    number: count(password, /[0-9]/g) >= 2,
    special: count(password, /[^A-Za-z0-9]/g) >= 2,
  };
}

export function isStrongPassword(password: unknown): boolean {
  return (
    typeof password === 'string' &&
    Object.values(checkPassword(password)).every(Boolean)
  );
}

export function IsStrongPassword(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options: {
        message:
          'Password must be 8-48 characters with at least 2 uppercase letters, 2 lowercase letters, 2 numbers and 2 special characters',
        ...options,
      },
      validator: { validate: isStrongPassword },
    });
}
