# AGENTS.md

Guidance for AI coding agents working on Help with Prison Visits Internal, the staff-facing HMPPS/MOJ web application for managing prison visit claims.

## Start Here

- Read [README.md](README.md) for local environment setup, required `.env` values, database/Redis/OAuth notes, and security background.
- This is a Node 24 / npm 11 app. Run `npm run setup` after dependency changes or on a fresh checkout.
- Use CommonJS (`require`, `module.exports`) in application code unless a nearby file already uses ESM. The Jest config is ESM, but the app is not.
- Keep changes within the existing Express route -> service/domain -> data access shape. Avoid putting business logic directly into views or route registration.

## Useful Commands

- `npm run setup`: install dependencies and run the HMPPS npm script allowlist check.
- `npm run start:dev`: build CSS once, load `.env`, and start the app locally.
- `npm start`: start via `app/bin/www` with Bunyan output formatting.
- `npm run css-build`: compile Sass from [app/assets/sass/application.scss](app/assets/sass/application.scss) to the generated public stylesheet.
- `npm run lint`: run ESLint with zero warnings allowed.
- `npm run lint-fix`: apply ESLint fixes.
- `npm run test`: run lint plus unit tests.
- `npm run test-unit`: run Jest unit tests only.
- `npm run test:ci`: run Jest with coverage and reports under `test_results/`.
- `npm run test-integration`: run Mocha integration tests with `KNEX_CONFIG=testing`; this needs a suitable MS SQL test database.
- `npm run test-e2e`: run Cypress with `KNEX_CONFIG=testing`.

## Project Map

- [app/app.js](app/app.js): Express app setup, security middleware, CSRF wiring, locals, routes, and error handling.
- [app/routes/routes.js](app/routes/routes.js): central route registry. Add new route modules here after implementing them.
- [app/routes/](app/routes/): request handlers. Prefer thin handlers that call services/domain objects and render views.
- [app/services/](app/services/): business logic, validators, helpers, logging, AWS/S3 integration, and data access.
- [app/services/data/](app/services/data/): Knex data access functions. Use parameterized Knex APIs rather than string-built SQL.
- [app/services/domain/](app/services/domain/): claim-related domain objects and decision logic.
- [app/constants/](app/constants/): enums and mappings for claim statuses, roles, tasks, payments, benefits, prisons, and related domain values.
- [app/views/](app/views/): Nunjucks views, partials, and helpers using GOV.UK Frontend and MOJ Frontend patterns.
- [config.js](config.js): environment variable definitions and production requirements.
- [knexfile.js](knexfile.js): database connection profiles.
- [helm_deploy/README.md](helm_deploy/README.md): Helm deployment commands and chart notes.

## Coding Conventions

- Follow [eslint.config.js](eslint.config.js) and [.prettierrc.json](.prettierrc.json): single quotes, no semicolons, trailing commas, `printWidth` 120, `arrowParens: avoid`.
- ESLint uses `@ministryofjustice/eslint-config-hmpps`, with `no-param-reassign` and `global-require` disabled and ECMAScript 2020 language options.
- Prefer the existing validation helpers in `app/services/validators/` and existing domain objects before adding new validation or decision patterns.
- Use `app/services/log.js` for logging. Do not add ad hoc `console.log` calls.
- Keep generated assets out of hand edits unless the task is specifically about generated output. Source Sass lives under [app/assets/sass/](app/assets/sass/).

## Views, Forms, And Frontend

- Use Nunjucks templates and existing GOV.UK/MOJ component patterns. Check nearby views before introducing new markup conventions.
- All POST forms need the CSRF hidden input partial: `{% include "partials/csrf-hidden-input.html" %}`.
- The app exposes `/public` from `app/public` and `app/assets`, and `/assets` from GOV.UK, MOJ, DataTables, and jQuery package assets.
- Rebuild CSS with `npm run css-build` after Sass changes.

## Security And Data Rules

- The global HTML sanitizer in [app/middleware/htmlSanitizer.js](app/middleware/htmlSanitizer.js) sanitizes request body/query strings. Do not bypass it with parallel parsing paths.
- CSRF protection is global except for explicit POST exclusions in [app/constants/csrf-exclude-routes.js](app/constants/csrf-exclude-routes.js).
- Routes and navigation are role-sensitive. Use existing authorisation and role-checking helpers rather than duplicating role checks.
- Reference values and sensitive IDs used in URLs must be encrypted with the existing crypto helpers under `app/services/helpers/`.
- Never commit secrets or local `.env` values. Production-required environment variables are documented through [config.js](config.js).
- Redis is the session store for multi-pod deployments; do not replace it with in-memory sessions for application paths.

## Testing Guidance

- Unit tests live under [test/unit/](test/unit/) and are matched by [jest.config.mjs](jest.config.mjs).
- Route and middleware tests commonly use Jest with `node-mocks-http` or Supertest. Mirror nearby test style.
- Integration tests under [test/integration/](test/integration/) use Mocha and `KNEX_CONFIG=testing`; confirm database availability before assuming failures are code regressions.
- Cypress tests use `KNEX_CONFIG=testing`. Avoid running full e2e checks when a focused unit or integration test can validate the changed behavior.
- If a change touches security, forms, auth, claim decisions, payments, or data access, add or update focused tests for that path.

## Agent Notes

- Link to existing docs instead of copying long setup or deployment instructions into new customization files.
- There is currently no indexed Copilot session history for this repository, so no recurring agent friction has been encoded here yet. Use `/chronicle improve` after a few sessions to refine these instructions from real workflow patterns.
