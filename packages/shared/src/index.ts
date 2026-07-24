/**
 * @workspace/shared — the domain contract for the Milton's Properties platform.
 *
 * Every entity here maps to a core table in docs/build-plan.md. The API validates
 * against these schemas at its boundary; the web app imports the inferred types.
 */
export * from "./common.js";
export * from "./property.js";
export * from "./application.js";
export * from "./screening.js";
export * from "./approval.js";
export * from "./prequalify.js";
