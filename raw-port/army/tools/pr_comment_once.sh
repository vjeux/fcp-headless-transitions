#!/bin/bash
# pr_comment_once.sh <PR#> <body> — post a PR comment IDEMPOTENTLY (structural no-duplicate guard).
#
#   pr_comment_once.sh <PR#> --body-file /tmp/note.md     <- PREFERRED for anything long or
#   containing backticks/quotes: the body never passes through a shell, so nothing can be eaten.
#   pr_comment_once.sh <PR#> "<body text>"                <- still fine for a one-liner
#
# WHY: reviewer slots post a one-line evidence comment per verdict. A reviewer agent sometimes
# re-emits (rewords + re-posts) the same comment — observed on PR #98 (reviewer-7 posted its ACCEPT
# and UPDATE comments twice each). The verdict of record is the faithfulness-gate STATUS + merge, so
# the comment is decorative; a duplicate is pure noise. This helper makes the post single-shot: it
# stamps every comment with a hidden marker <!--rc:KEY--> (KEY = first 60 alnum chars of the body) and
# refuses to post if a comment with that marker already exists on the PR. So calling it N times with
# the same (or a trivially-reworded-but-same-prefix) body posts AT MOST ONCE.
#
# WHY THE ARGV HANDLING IS THIS CAREFUL — it is the same door #596 closed in pr_review.sh, which was
# left open HERE for another day. OPS_LOG asked for "--body-file for pr_review.sh AND THE SAME FOR
# pr_comment_once.sh"; only the first half shipped, so an agent following the house habit of writing
# evidence to a file and passing --body-file posted the 33-character string
#
#     --body-file /tmp/w7_600_comment.txt
#
# as the comment on PR #600 — 1,204 bytes of reconciliation evidence destroyed, at exit 0, behind
# the line "pr_comment_once: posted to PR #600". Measured 2026-08-11 by worker 7, doing exactly what
# the briefs recommend. Two extra harms specific to THIS tool, neither present in pr_review.sh:
#   * the dedup KEY is derived from the body, so a mangled body also poisons the idempotence key —
#     the correct comment posted afterwards does NOT collide with the broken one, and the PR ends up
#     carrying both;
#   * `BODY="${*}"` joins the argv with spaces, so a body typed as several words was already being
#     silently re-joined; the flag simply rode in on the same path.
# A comment is a record. Refuse rather than guess.
# exit 0 = posted OR already-present (idempotent success); exit 2 = usage/error.
set -uo pipefail
SLUG="${FCT_REPO:-vjeux/fcp-headless-transitions}"
PR="${1:?usage: pr_comment_once.sh <PR#> (--body-file <path> | <body text>)}"; shift

BODY_FILE=""
NPOS=0
_args=(); while [ $# -gt 0 ]; do
  case "$1" in
    --body-file)
      # A FLAG'S VALUE IS AS DANGEROUS AS ITS NAME: `--body-file "$NOTE"` with NOTE unset consumes
      # the empty value and, without this arm, falls through to the literal-body path — posting the
      # flag itself. Demand the value and refuse an empty one.
      [ $# -ge 2 ] || { echo "pr_comment_once: --body-file requires a path" >&2; exit 2; }
      [ -n "$2" ]  || { echo "pr_comment_once: --body-file was given an EMPTY path (unset variable?)" >&2; exit 2; }
      BODY_FILE="$2"; shift 2 ;;
    --) shift; while [ $# -gt 0 ]; do _args+=("$1"); NPOS=$((NPOS+1)); shift; done ;;
    --*)
      cat >&2 <<EOM
pr_comment_once: unknown option "$1".
  Refusing, because an unrecognised flag would otherwise be posted AS THE COMMENT BODY and your
  evidence silently discarded (that happened on PR #600: 1,204 bytes replaced by the flag text, at
  exit 0, behind a success line).
  Supported: --body-file <path>, or a literal body as the final argument.
  If this flag is real but unknown here, you are running an OLDER pr_comment_once.sh than your brief
  describes: git log -1 --format=%h -- raw-port/army/tools/pr_comment_once.sh
EOM
      exit 2 ;;
    *) _args+=("$1"); NPOS=$((NPOS+1)); shift ;;
  esac
done

# A LITERAL BODY AND A --body-file ARE TWO ANSWERS TO ONE QUESTION, so pick neither: whichever won
# would depend on argv order, and the loser would vanish without a word.
if [ -n "$BODY_FILE" ] && [ "$NPOS" -gt 0 ]; then
  cat >&2 <<EOM
pr_comment_once: refusing — you passed BOTH --body-file "$BODY_FILE" and a literal body.
  One of them would be silently discarded. Pass the text one way: --body-file <path> (preferred; no
  shell touches it), or a single literal body as the final argument.
EOM
  exit 2
fi

if [ -n "$BODY_FILE" ]; then
  [ -r "$BODY_FILE" ] || { echo "pr_comment_once: cannot read body file $BODY_FILE" >&2; exit 2; }
  BODY="$(cat "$BODY_FILE")"
else
  BODY="${_args[*]:-}"
  # Best-effort tripwire: a backtick that survived to here is harmless, but it means the CALLER's
  # shell had the chance to eat a different one before this script ever ran.
  case "$BODY" in
    *'`'*) echo "pr_comment_once: WARNING — body contains a backtick. If you invoked this from a" >&2
           echo "  double-quoted shell command, any OTHER backticked span was already expanded away" >&2
           echo "  by your shell and is missing. Prefer --body-file <path>." >&2 ;;
  esac
fi
[ -n "$BODY" ] || { echo "pr_comment_once: empty body — nothing to post" >&2; exit 2; }

# dedup key = first 60 alphanumerics of the body (stable across whitespace/punctuation rewording)
KEY=$(printf '%s' "$BODY" | tr -cd '[:alnum:]' | cut -c1-60)
MARKER="<!--rc:${KEY}-->"
# already posted? (search existing comment bodies for the marker)
if gh pr view "$PR" --repo "$SLUG" --json comments --jq '.comments[].body' 2>/dev/null | grep -qF "$MARKER"; then
  echo "pr_comment_once: PR #$PR already has this comment (marker match) — skipping duplicate"
  exit 0
fi
FULL="$BODY

$MARKER"
# Pass the body through a FILE, not through gh's argv — same reason as --body-file itself.
TMPB="$(mktemp "${TMPDIR:-/tmp}/pr_comment_once.XXXXXX")"
printf '%s' "$FULL" > "$TMPB"
POSTED_URL=$(gh pr comment "$PR" --repo "$SLUG" --body-file "$TMPB" 2>/dev/null) \
  || { rm -f "$TMPB"; echo "pr_comment_once: post failed"; exit 2; }
rm -f "$TMPB"
# READ THE RECORD BACK. Every way a body has been lost here exits 0 behind a plausible success line,
# so the only check that covers ways nobody has invented yet is to compare what is stored against
# what was sent. Reported, not fatal: the comment is already posted either way, and a transport
# failure on the read must not read as a lost body.
# COUNT THE SAME UNITS ON BOTH SIDES. `${#FULL}` counts BYTES when LANG/LC_* are unset — which is
# exactly the environment a cron- or launchd-started agent runs in — while jq's `.body|length`
# counts CODEPOINTS. Measured on a 3-em-dash string: 45 bytes vs 40 codepoints with LANG unset.
# Nearly every comment this swarm writes contains an em dash, so the check added to detect a
# DESTROYED body would have announced one on almost every call, and a check that cries wolf is
# ignored by the second person who reads it.
WANT=$(printf '%s' "$FULL" | python3 -c 'import sys;print(len(sys.stdin.buffer.read().decode("utf-8","replace")))' 2>/dev/null)
[ -n "$WANT" ] || WANT=${#FULL}
# ...AND READ BACK *YOUR* COMMENT, NOT THE NEWEST ONE. With 16 agents live a peer can comment
# between the POST and the read-back, and `.[-1]` then compares your text against theirs and reports
# a mismatch on a comment that is perfectly intact. `gh pr comment` prints the new comment's URL,
# whose fragment is its id; fall back to `.[-1]` only when that cannot be parsed.
CID=""
case "$POSTED_URL" in *"#issuecomment-"*) CID="${POSTED_URL##*#issuecomment-}" ;; esac
if [ -n "$CID" ]; then
  GOT=$(gh api "repos/$SLUG/issues/comments/$CID" --jq '.body|length' 2>/dev/null || echo "")
else
  GOT=$(gh api "repos/$SLUG/issues/$PR/comments" --jq '.[-1].body|length' 2>/dev/null || echo "")
fi
if [ -z "$GOT" ]; then
  echo "pr_comment_once: posted to PR #$PR (body $WANT chars; could not read it back to confirm)"
elif [ "$GOT" != "$WANT" ]; then
  echo "pr_comment_once: posted to PR #$PR but the STORED body is $GOT chars, not $WANT — read it back:"
  echo "  gh api repos/$SLUG/issues/$PR/comments --jq '.[-1].body'"
else
  echo "pr_comment_once: posted to PR #$PR (body $WANT chars, read back and confirmed)"
fi
