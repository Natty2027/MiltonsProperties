import { buildApp } from "./app.js";
import { env } from "./env.js";

const app = buildApp();

try {
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  app.log.info(`Milton's API listening on :${env.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
