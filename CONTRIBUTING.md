# Contributing to YKPS Forum

All changes must be reviewed before they are merged into `main`.

## Workflow

1. Update your local `main` branch.
2. Create a branch named after the task, such as `feature/media-search` or `fix/archive-layout`.
3. Make one focused change and test it locally.
4. Commit and push the branch.
5. Open a Pull Request into `main` and complete the checklist.
6. Wait for the repository owner to approve the Pull Request.
7. If changes are requested, update the same branch and ask for another review.

Do not push directly to `main`. Do not commit `.env` files, passwords, API keys,
real student data, or uploaded user videos.

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Before requesting review, run:

```bash
npm test
npm run build
```
