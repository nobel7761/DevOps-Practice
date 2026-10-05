// Each app ships its own ESLint major version/config (frontend and backend
// are intentionally on different ESLint majors — see apps/*/eslint.config.mjs).
// `pnpm --filter <app> exec` runs the command with that app's own binaries
// and with its directory as cwd, so each app's own eslint.config.mjs is found
// regardless of ESLint's config-lookup differences between majors.
const quote = (files) => files.map((file) => `"${file}"`).join(" ");

export default {
  "apps/backend/**/*.{ts,js}": (files) => [
    `pnpm --filter backend exec eslint --fix ${quote(files)}`,
    `pnpm --filter backend exec prettier --write ${quote(files)}`,
  ],
  "apps/frontend/**/*.{ts,tsx,js,jsx}": (files) => [
    `pnpm --filter frontend exec eslint --fix ${quote(files)}`,
    `prettier --write ${quote(files)}`,
  ],
  "*.{json,md,yml,yaml}": (files) => `prettier --write ${quote(files)}`,
};
