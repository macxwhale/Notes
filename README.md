# AWS Cloud Practitioner Essentials

Study notes for the AWS Cloud Practitioner Essentials course, organized by module.

## Structure

```
Module 1/   — Cloud Computing fundamentals
Module 2/   — Amazon EC2 & compute services
Module 3/   — Serverless & containers
Module 4/   — Global infrastructure
Module 5/   — Networking & VPC
```

## Auto-publish

Every push to the `AWS` branch automatically publishes new or updated notes to the [Bunisystems blog](https://bunisystems.com/blog) as a series via GitHub Actions.

### Manual publish

To sync all notes to WordPress manually:

```bash
WP_URL="https://wpapi.bunisystems.com/wp-json/wp/v2" \
WP_USER="bunisystems" \
WP_APP_PASSWORD="<app-password>" \
node publish.mjs
```

### Manual site rebuild

To trigger a Bunisystems site rebuild without pushing new notes:

```bash
gh workflow run main.yml --repo macxwhale/bunisystems --ref main-nextjs
```

## Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `WP_URL` | WordPress REST API base URL |
| `WP_USER` | WordPress username |
| `WP_APP_PASSWORD` | WordPress Application Password |
| `BUNISYSTEMS_DISPATCH_TOKEN` | GitHub PAT with `repo` scope |
