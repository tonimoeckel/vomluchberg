---
name: deploy-cloudflare
description: One-time Cloudflare Pages setup for a repo — creates the Pages project and the CLOUDFLARE_* repo secrets so the seeded deploy.yml can run. Use when asked to set up or connect a repo to Cloudflare Pages. Not for running a deploy (the workflow does that on push) or changing an existing project's build settings.
---

# Deploy Cloudflare

One-time setup so the seeded `deploy.yml` can deploy. Every Cloudflare and GitHub action goes through `wrangler` (via `npx wrangler` if not global) or `gh`.

A **gate** is a hard stop for an act only the operator can take: print the ⏸ message, end your turn, and resume at the next step in this session once the operator confirms.

## Guards

- `wrangler whoami` fails → stop: `❌ wrangler is not authenticated. Run wrangler login, then re-invoke.`
- `gh auth status` fails → stop: `❌ gh is not authenticated. Run gh auth login, then re-invoke.`
- The API token travels only from the operator to `gh secret set`. Check secrets by name with `gh secret list`; never ask for, accept, or read a token value.

## Step 1: preview

Derive:
- project name: supplied, else `basename` of `git remote get-url origin` without `.git`
- production branch: `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`

Show both and what the run will do.
Done when: the operator confirms or corrects the name and branch.

## Step 2: create the Pages project

Check `wrangler pages project list` first.
- Absent → `wrangler pages project create <name> --production-branch <branch>`
- Present → ask whether it belongs to this repo (continue) or is a collision (stop and let the operator resolve it).

Done when: the project appears in `wrangler pages project list`.

## Step 3: set the account ID

Read the account ID from `wrangler whoami --json`. If it lists more than one account, ask which one to use.

```bash
printf '%s' "<account-id>" | gh secret set CLOUDFLARE_ACCOUNT_ID
```

Done when: `gh secret list` shows `CLOUDFLARE_ACCOUNT_ID`.

## Step 4: gate — API token

`⏸ Create a Cloudflare API token with "Cloudflare Pages: Edit" at dash.cloudflare.com → My Profile → API Tokens, then run: gh secret set CLOUDFLARE_API_TOKEN — and confirm here.`

Done when: `gh secret list` shows both `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. If either is missing, name it with the command that sets it and repeat the gate.

## Step 5: gate — custom domain

`⏸ Attach the custom domain to the <name> Pages project in the Cloudflare dashboard (Custom domains tab), then confirm here.`

Done when: the operator confirms.

## Step 6: hand off

Confirm `.github/workflows/deploy.yml` exists. If it is missing, give the sync command:
`canon tooling sync cloudflare . --write`

Report that setup is complete and that the next push deploys through `deploy.yml`. End the run here; opening the pull request belongs to the operator or the controlling session.

Done when: the workflow file is present, or its sync command is reported.
