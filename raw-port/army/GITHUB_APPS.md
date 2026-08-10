# GITHUB_APPS.md — two app identities so reviewers can actually review

## The problem this solves

The swarm ran as **one** GitHub identity (the operator's OAuth token). Workers pushed branches and
opened PRs as that account; reviewers posted the `faithfulness-gate` status and merged as the *same*
account. GitHub refuses to let an account review its own pull request, so the reviewer loop could
never use the real review system. Reproduce the old behavior any time with:

    $ pr_review.sh <PR#> approve "..."
    pr_review: REFUSED — GitHub says this identity authored PR #203, so it cannot review it.

What that cost us, concretely:

* **An ACCEPT was just a merge.** Nothing recorded *who* verified it or *that* it was verified.
* **A REJECT was advisory.** `REQUEST_CHANGES` was unavailable, so a rejection could only be a red
  `faithfulness-gate` status plus a prose comment — see reviewer-06 on PR #154, an oracle-proven
  divergence (`RGBtoRGBA` returned 24 where live FCP returns 232) that could not be recorded as a
  blocking review. Nothing server-side stopped the next actor from merging it.
* **"Workers never merge" was convention, not enforcement.** Branch protection cannot require a
  review when there is only one identity to give it.

## The fix

Two GitHub Apps, installed on the repo:

| app | identity used for | permissions |
|---|---|---|
| `fcp-port-worker-<login>` | pushing port branches, opening PRs | `contents:write`, `pull_requests:write`, `metadata:read` |
| `fcp-port-reviewer-<login>` | `faithfulness-gate` status, APPROVE / REQUEST_CHANGES, merge | `contents:write`, `pull_requests:write`, `statuses:write`, `checks:write`, `metadata:read` |

Author and reviewer are now different principals, so GitHub accepts the verdicts.

## Setup (one time, ~6 clicks)

Creating a GitHub App cannot be done from an API token — it needs a signed-in browser. The setup
script uses GitHub's **App Manifest flow** so nothing has to be copy-pasted:

    python3 raw-port/army/tools/ghapp/setup_apps.py

It opens `http://localhost:8765`. For each of the two roles:

1. **Create** — click the button; GitHub shows a creation page pre-filled from a manifest
   (name, permissions, no webhook). Click **Create GitHub App**. GitHub redirects back to the local
   server, which exchanges the one-time code for the app id + private key and stores them.
2. **Install** — click **Install**, choose **Only select repositories**, pick
   `vjeux/fcp-headless-transitions`. Click **finish**; the script detects the installation id.

Then verify:

    python3 raw-port/army/tools/ghapp/setup_apps.py --status
    bash raw-port/army/tools/ghapp/app_token.sh reviewer --check

Credentials land in `~/.fct-pool/ghapp/` (`<role>.pem` chmod 600, `<role>.json`). **They are secrets
and are never committed** — the state dir is outside the repo.

## How the swarm uses them

    gh_as.sh <role> <gh args...>        run gh as that app
    git_push_as.sh <role> <push args>   git push as that app (token via env, never argv)
    app_token.sh <role>                 mint/cache an installation token (1h, shared across slots)
    pr_review.sh <PR#> approve|request-changes|comment "<body>"

Already wired in:

* `pr_submit.sh` — pushes and opens the PR as the **worker** app.
* `pr_gate.sh` — posts `faithfulness-gate` as the **reviewer** app.
* `pr_land.sh` — submits a real **APPROVE** as the reviewer app, then merges.

**Reviewers: use `pr_review.sh <PR#> request-changes "<what the TS omits>"` for a rejection.** That
is a blocking review, not a comment.

## Backward compatible by design

Every helper falls back to the operator's own `gh`/git auth when an app is not configured
(`app_token.sh` exits 7). The tooling was landed and exercised *before* the apps existed, and the
running swarm was unaffected. Nothing here is load-bearing until you finish the setup.

## Recommended follow-up: make the verdict enforceable

Today `main` requires `faithfulness-gate` + up-to-date + linear + `enforce_admins`, but
`required_pull_request_reviews` is **null** — approvals are not required, so a review is still only
evidence. Once both apps are installed and you have watched a few PRs land with real approvals,
requiring one approving review turns "workers never merge" into something GitHub enforces:

    gh api -X PUT repos/vjeux/fcp-headless-transitions/branches/main/protection/required_pull_request_reviews \
      -F required_approving_review_count=1 -F dismiss_stale_reviews=true

Do this **after** confirming approvals appear, and note the tradeoff: with `enforce_admins` on, a
misconfigured reviewer app would block all merges until fixed. `dismiss_stale_reviews` is the
important half — it drops the approval when a new commit is pushed, so a worker cannot append code
to an already-approved PR.
