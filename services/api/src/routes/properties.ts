import type { FastifyInstance } from "fastify";
import { listings, properties } from "../fixtures.js";

export default async function propertiesRoutes(app: FastifyInstance) {
  // GET /properties
  app.get("/", async () => ({ properties }));

  // GET /properties/:id  — property plus its active listing
  app.get<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const property = properties.find((p) => p.id === req.params.id);
    if (!property) {
      return reply.code(404).send({ error: "not_found" });
    }
    const listing = listings.find((l) => l.propertyId === property.id) ?? null;
    return { property, listing };
  });
}
