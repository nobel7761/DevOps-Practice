import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "node_modules/**"],
  },
  {
    // eslint-plugin-react-hooks v7 ships new React Compiler-readiness rules
    // that false-positive heavily on idiomatic patterns already in this repo
    // (react-hook-form's `field.ref`, Radix merge-refs, mount-time effects
    // reading localStorage/window). Turning these off until the ecosystem
    // (react-hook-form, Radix, etc.) actually adopts compiler-safe patterns.
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
];

export default eslintConfig;
