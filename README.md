# Solar Technology Singapore

A responsive solar-architecture website with a reversible seven-stage film, a 12-entry product showroom, 18 published installations, a rooftop planner and server-backed project enquiries. The opening pavilion is an original architectural concept. The portfolio uses the photographs captioned on the company’s own project page.

## Run locally

Use Node.js 24 LTS and npm. From the project directory, run the commands below. The first build emits the local Worker configuration that Wrangler uses to connect the database and file bucket.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_premium_ted_forrester.sql
npm run dev
```

Apply this migration once per new local database. Open the address printed by the development server. To serve the compiled build locally, stop the dev server and run `npm start`. Both use the local D1 and R2 emulators.

## Quality checks

```sh
npm run typecheck
npm test
npm run qa:stage
npm run dev
```

Open `/__qa/browser.html` on the local preview and choose **Run six viewports**. For paint and interaction timing samples, use `/__qa/timings.html` on a local compiled preview. After testing, run `npm run qa:clean` and rebuild. The test pages use the installed copy of axe-core and do not belong on the deployed site. See [the verification report](docs/verification.md) for measured results and coverage.

## Main source files

| Area | Location |
| --- | --- |
| Page composition, search, menus, dialogs and editorial sections | `components/solar/` |
| Scroll progress, chapter copy and film controls | `components/solar/Hero.tsx` |
| Registered architectural geometry and responsive photograph | `components/solar/architecture/`, `public/assets/arch/` |
| Product families, projects, services and contact information | `components/solar/catalogue/data.ts` |
| Shared silicon module specifications | `lib/solar/siliconModules.ts` |
| Planner inputs, geometric packing and axonometric drawing | `components/solar/planner/` |
| Design tokens, typography, grid and responsive layouts | `app/globals.css`, [design system](docs/design-system.md) |
| Enquiry form, HTTP routes and validation | `components/solar/Quote.tsx`, `app/api/enquiries/`, `lib/solar/` |
| Tables and migration history | `db/schema.ts`, `drizzle/` |

The interface uses React, TypeScript and the Next.js App Router API via Vinext. It runs as a Cloudflare-compatible Worker. CSS sticky positioning and GSAP ScrollTrigger synchronise the sequence with ordinary page scrolling. One responsive photo and registered SVG geometry keep the same building throughout. All interface fonts, cinematic art and site imagery load from the same origin.

## Enquiries and drawings

`POST /api/enquiries` validates contact details, declared consent and the optional planner settings. The server reconstructs the layout from the same sizing model as the client. Each received enquiry has a unique reference. Submitting the same form after a connection interruption returns the original reference.

The form accepts one PDF, PNG or JPEG up to 5 MiB. Uploads are saved in a private R2 bucket. A submission with a drawing reaches `received` after the file write succeeds. A failed file write can be retried with the same form and idempotency key. IP-based hourly limits use a short-lived hashed key. Form contents and drawings stay out of application logs.

The owner can review the `enquiries` table in the Site database. For local development, this lists recent briefs.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --command "SELECT reference, created_at, name, company, product_interest FROM enquiries WHERE status='received' ORDER BY created_at DESC LIMIT 20"
```

For a record with a drawing, an authorised reviewer can use the `reference` and private `drawing_key` from that record. The drawing route accepts the file key in an HTTP Authorization header. The public receipt alone cannot retrieve a drawing. On an owner-only hosting environment, the request must also pass the host’s access check.

```sh
curl --fail --header "Authorization: Bearer $DRAWING_KEY" "$SITE_ORIGIN/api/enquiries/$ENQUIRY_REFERENCE/drawing" --output "$OUTPUT_FILE"
```

This version stores enquiries for the site owner. It does not deliver them to a company mailbox or CRM. The form and its receipt provide the company’s published email for direct contact. For a company-operated launch, choose a recipient and connect the approved notification service to received records. Keep provider credentials server-side.

## Deploy

For the existing private Site, build the source with its tracked `.openai/hosting.json` and publish the resulting Worker plus `dist/client` assets. The hosting manifest declares `DB` for D1 and `BUCKET` for R2. The hosting service provisions the bindings and applies the committed SQL migration to the hosted database.

For an independent Cloudflare deployment, create a D1 database and a private R2 bucket in the target account. Build in a clean checkout. Copy the generated Worker configuration from `dist/server/wrangler.json`, point its `main` and asset paths at the compiled files, set an original Worker name and replace the generated local binding values with the target D1 database name and ID and the R2 bucket name. Keep the logical binding names `DB` and `BUCKET`. Apply each SQL file to that database once, in order, before using `wrangler deploy --config <target-config>`. Configure host access, a custom domain and staff review permissions for that environment. The local emulation ID in a generated config is only for local development.

## Updating content and visual assets

- [Content provenance and conflicting supplier information](docs/content-sources.md)
- [Architectural art, camera coordinates and replacement instructions](docs/architecture.md)
- [Typography, colours and interaction conventions](docs/design-system.md)
- [QA, performance and accessibility results](docs/verification.md)

For a catalogue update, confirm the exact model and datasheet revision, then edit the family or silicon source record. Export a locally optimised image to `public/assets/catalog`. Keep the stable ID when revising the same model. Introduce a new ID for a different product, so historical enquiry configurations remain interpretable.

Photographs of actual projects and the company wordmark come from the supplied research pack. Keep their attribution and confirm publication permissions with the company before launching this private concept on its public domain. The reference mockup’s blanket efficiency and warranty figures have been replaced with model-specific published data.


# solar-technology-pte-ltd
