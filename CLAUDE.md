# Project rules

These rules apply to all code written in this project.

## Principles

- **DRY**: don't repeat logic. If the same code shows up twice, pull it into a shared helper, constant, hook, or component.
- **SOLID**:
  - Single responsibility: each function, component, and module does one thing.
  - Open/closed: extend behavior through props, config, and composition instead of editing working code.
  - Liskov substitution: a subtype or variant must work anywhere its base type is expected.
  - Interface segregation: keep prop and type interfaces small and focused.
  - Dependency inversion: depend on abstractions such as `src/lib` helpers and injected params, not on concrete details buried in components.
- **KISS**: pick the simplest solution that works. No speculative abstractions.

## Code style

- **Always use `const` arrow functions.** Don't use `function` declarations.
  ```ts
  const formatAmount = (cents: number) => { ... };
  ```
- **Prefer destructuring** for props, params, objects, arrays, and hook returns.
  ```ts
  const PostCard = ({ title, slug }: PostCardProps) => { ... };
  ```
  If destructuring doesn't fit in a particular spot, **ask the user before writing it without destructuring.**
- **Extract reusable code** instead of leaving it inline:
  - Pure helpers and library wrappers go in `src/lib/`.
  - Constants and static config go in `src/config/`.
  - Shared types go in `src/types/`.
- **Create custom hooks** in `src/hooks/` (`useXxx.ts`) when a component has reusable or non-trivial stateful logic, effects, or subscriptions.

## TDD

- Write a failing test first, make it pass, then refactor.
- Every new helper, hook, and lib function needs tests. Bug fixes start with a test that reproduces the bug.

## Commits

- Format every commit message as `[TYPE] : <Meaningful short commit message>`, with the type in uppercase.
  ```
  [FEAT] : Add donation campaign progress bar
  [FIX] : Fall back to production domain when site URL env var is empty
  ```
- Types: `FEAT`, `FIX`, `CHORE`, `STYLE`, `REFACTOR`, `TEST`, `DOCS`, `PERF`, `BUILD`, `CI`, `REVERT`.
- **Never add AI agent co-author or attribution lines** (such as `Co-Authored-By: Claude ...` or "Generated with Claude Code") to commits or PR descriptions.

## Before pushing to `main`

Run these and make sure they all pass. Never push if any of them fail.

```bash
pnpm lint
pnpm test
pnpm build
```
