---
name: commit-plan
description: Use when the user asks for git add and commit commands or messages they can copy, wants uncommitted changes split into commits by task, or asks "what should I commit" for the current working tree.
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git ls-files:*)
---

# Commit plan

Turn the working tree into a short series of copy-paste `git add` + `git commit` pairs, one per task. The user runs them, so never stage or commit yourself.

## 1. Read what changed

```bash
git status --short
git log --oneline -8          # match the existing message style
git diff --stat
git diff -- <files>           # read the real diffs, not just names
```

For untracked files, read the head and the imports (`grep -n "^import" <file>`) to see what each one depends on. Read the project's commit rules (CLAUDE.md or CONTRIBUTING) for the message format.

Check untracked config files (`.env*`, `.mcp.json`, keys, credentials) for secrets. Leave out any file that holds one and tell the user why.

## 2. Group by task, then order by dependency

A commit is one task: a feature, a fix, a refactor, a doc. It isn't one folder. Tests go with the code they test.

Every commit must build and pass tests on its own:

- A new file that nothing imports yet can land early, for example helpers, stores, hooks and their tests.
- Files that use it go in the same commit or a later one.
- A file that mixes two tasks goes with the task it can't build without. Don't plan `git add -p`, because the user is copying commands.
- Repo-wide checks, such as a test that scans all files, go in the commit where they first pass.

The usual order is: a spec or plan written before the work → build and dependency changes → logic and tests → UI and wiring → copy and style → docs about the finished work → unrelated chores.

## 3. Write the output

One `bash` block with a blank line between each pair:

```bash
git add src/lib/theme.ts src/lib/theme.test.ts
git commit -m "[FEAT] : Add theme preference helpers"

git add "src/app/(site)/page.tsx"
git commit -m "[STYLE] : Update homepage hero copy"
```

- Quote paths that contain spaces, `(`, `)` or `[`. Double quotes work in both bash and PowerShell.
- Once earlier commits have taken their files, a later commit can add a whole folder (`git add src`) if everything left in it belongs to that commit. Say that the order matters.
- Use the project's format and types. Without one, use `type: summary` in the imperative.
- Add no AI co-author or attribution lines, because the user is the author.

After the block, give one bullet per commit saying what it covers and any judgment call, such as where a mixed file went or why a commit has to come first. End with the project's pre-push checks, if it has any.

## 4. Check coverage

Before replying, make sure every path from `git status --short` is in exactly one `git add`, or is named as deliberately left out.

## Common mistakes

| Mistake | Fix |
|---|---|
| One commit per folder (`src/components`, `src/app`) | Group by task. One feature touches many folders. |
| A commit uses a file that a later commit adds | Reorder, or merge the two commits. |
| Unquoted `(site)` or `[slug]` paths | Quote them. |
| A secrets file included without checking | Read it first, and leave it out if it holds a secret. |
| Listing every file again in prose | Bullets say what a commit is for, not which files it has. |
