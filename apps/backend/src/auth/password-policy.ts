import { registerDecorator, type ValidationOptions } from 'class-validator';

/** Same rules as the frontend checklist (apps/frontend/src/lib/auth/password-rules.ts). */
export function checkPassword(password: string) {
  return {
    length: password.length >= 8 && password.length <= 16,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
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
          'Password must be 8-16 characters and contain an uppercase letter, a lowercase letter, a number and a special character',
        ...options,
      },
      validator: { validate: isStrongPassword },
    });
}
