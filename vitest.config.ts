import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      // With include set, Vitest 4 reports covered + uncovered matches (all was removed).
      include: ["src/lib/**/*.ts"],
      exclude: [
        "src/lib/__tests__/**",
        // Side-effectful wiring (DB pool / NextAuth) — covered by integration, not unit tests.
        "src/lib/prisma.ts",
        "src/lib/auth.ts",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
      reporter: ["text", "text-summary"],
    },
  },
});
