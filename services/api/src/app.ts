import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { env } from "./env.js";
import applicationRoutes from "./routes/applications.js";
import healthRoutes from "./routes/health.js";
import propertiesRoutes from "./routes/properties.js";

/** Build the Fastify app. Exported so tests can boot it without listening. */
export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: { level: env.NODE_ENV === "test" ? "warn" : "info" },
  });

  app.register(cors, { origin: env.CORS_ORIGIN });

  app.register(healthRoutes);
  app.register(propertiesRoutes, { prefix: "/properties" });
  app.register(applicationRoutes, { prefix: "/applications" });

  return app;
}
