import next from "eslint-config-next";

const config = [...next, { ignores: [".next/**", "drizzle/**", "node_modules/**"] }];

export default config;
