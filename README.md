# YKPS Forum

YKPS Forum is a desktop-first school community prototype for collecting student
suggestions, sharing organization videos, and helping student clubs collaborate.

## Current prototype

- Suggestions with public identity, likes, comments, and reports
- Weekly student-council selection and outcome archive
- Organization video feed with comments and reports
- Club collaboration posts with commenting and locked closed posts
- Organization profile pages for posts and videos

All names, organizations, posts, media, and outcomes in the current demo are
fictional and are included only for product demonstration.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Then open the local address shown in the terminal.

## Collaboration

`main` is the approved version of the product. Contributors must work on a
separate branch and open a Pull Request. The repository owner reviews and merges
accepted changes. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

Never commit `.env` files, credentials, real school data, or videos uploaded by
real users. Production uploads belong in managed object storage, not Git.
