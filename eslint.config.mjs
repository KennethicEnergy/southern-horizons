import next from "eslint-config-next";

// .claude/ holds agent skills and git worktrees of other branches, each with its own build output and lint run.
const config = [...next, { ignores: [".next/**", "drizzle/**", "node_modules/**", ".claude/**"] }];

export default config;
