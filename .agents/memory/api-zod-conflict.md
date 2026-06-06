---
name: api-zod export conflict
description: lib/api-zod barrel conflict between generated Zod schemas and TypeScript interface types
---

The generated `lib/api-zod/src/index.ts` originally re-exported from both `./generated/api` (Zod schemas) and `./generated/types` (TypeScript interfaces). When both are exported, names like `SendEmailBody` and `ListEmailLogsResponse` appear twice, causing TS2308 "already exported a member" errors.

**Fix:** Only export from `./generated/api` in `lib/api-zod/src/index.ts`:
```ts
export * from "./generated/api";
```

**Why:** The Zod schemas in `generated/api` are the primary consumer need (runtime validation). TypeScript types can be inferred from them via `z.infer`. The TypeScript interfaces in `generated/types` are for the frontend API client (`@workspace/api-client-react`) which has its own barrel and doesn't need them from `api-zod`.

**How to apply:** Any time you add new endpoints to the OpenAPI spec and re-run codegen, if you see TS2308 errors in `lib/api-zod`, check that `src/index.ts` only re-exports from `./generated/api`, not `./generated/types`.
