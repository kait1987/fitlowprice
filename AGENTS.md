# AGENTS.md

Guidance for working in the FitLowPrice project.

## Project Overview

FitLowPrice is a Next.js 16 App Router application for comparing personalized
final checkout prices after points, coupons, memberships, and store-specific
discounts. Read `CLAUDE.md` first for the detailed product context, domain
terms, roadmap, and coding conventions.

## Commands

- Use `npm run dev` for local development.
- Use `npm run build` for production builds.
- Use `npm run lint` for ESLint.
- Use `npx tsc --noEmit` for TypeScript checking.
- Use `npx prisma db push` for local Prisma schema application when needed.

## Development Notes

- Follow the existing Next.js App Router structure under `src/app`.
- Keep UI changes consistent with the existing Tailwind and shadcn/ui patterns.
- Keep database access centralized through the existing Prisma/Turso utilities.
- Never commit marketplace credentials, session cookies, API keys, or scraped
  account data.

## LazyCodex / Oh My OpenAgent

This project can use the global Oh My OpenAgent install from both Codex Light
and OpenCode Ultimate.

- In Codex, use `$ulw-plan` for planning, `$start-work` for executing an
  approved plan, and `$ulw-loop` for verified completion.
- In OpenCode, include `ultrawork` or `ulw` in the prompt for multi-agent work.
- Run `bunx oh-my-openagent doctor` from this project root when checking the
  harness.
- Keep the current Codex approval and workspace-write sandbox model unless the
  user explicitly asks for autonomous full-permissions mode.
- Use the global OpenCode OmO provider configuration unless a project-specific
  `.opencode/oh-my-openagent.jsonc` is intentionally added later.
