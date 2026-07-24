import type { FastifyInstance } from "fastify";
import { PreQualRequest, prequalify } from "@workspace/shared";
import { listings } from "../fixtures.js";

export default async function applicationRoutes(app: FastifyInstance) {
  /**
   * POST /applications/prequalify
   *
   * Free pre-qualification — pure arithmetic against a listing's posted criteria.
   * No consumer report, no credit inquiry, deliberately outside FCRA. Uses the
   * exact same `prequalify()` the web app calls, so the answer is identical.
   */
  app.post("/prequalify", async (req, reply) => {
    const parsed = PreQualRequest.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request", issues: parsed.error.issues });
    }

    const { listingId, monthlyIncomeCents, creditBand } = parsed.data;
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) {
      return reply.code(404).send({ error: "listing_not_found" });
    }

    return prequalify(listing.criteria, listing.priceCents, { monthlyIncomeCents, creditBand });
  });
}
