#!/bin/bash
# test_no_force_push.sh — LOCKED test for the rule "a PR head may only ever GAIN commits".
#
# WHY THE RULE. Nothing in this repo needs a rewritten PR head: `pr_land.sh` ends in
# `gh pr merge --squash`, so main's linear history comes from the SQUASH and the shape of the
# feature branch is discarded at merge time. The force-push was never buying that. What it bought:
#
#   * #449 — a force-push dropped files the PR had (an oracle harness); rebase_helper needed a
#     file-list post-condition to notice afterwards.
#   * 92 reviewer-verified lines on an APPROVED PR replaced by an EMPTY branch, when a prepare step
#     raised inside `set -uo pipefail` and the push on the next line ran regardless. git_push_as
#     grew a refusal, whose own comment concedes the general case is uncatchable: "the destruction
#     happens at the push, before any gate sees the head."
#   * A force-push onto a commit already on main CLOSES the PR — `head_ref_force_pushed` and
#     `closed` in the same second — and restoring the branch does not reopen it. That is a live
#     mechanism for the below-cap PR closures OPS_LOG had recorded as unexplained.
#
# A merge cannot do any of the three, because it can only ADD commits. So every tool that used to
# force now merges current main in and fast-forwards, and this suite pins both halves: the tools do
# not force (1-4), and the push wrapper refuses if one ever tries again (5-9).
#
# Offline. Cases 1-4 read the shipped sources with comments stripped — a file whose prose argues at
# length against force-pushing will match a naive grep for `push -f` in its own explanation, which
# is test_guards case B's mistake and the reason every source check here strips comments first.
# Cases 5-9 run the real wrapper against a local bare repo with `gh_as.sh` stubbed.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
TOOLS="${1:-$HERE}"
R="$(mktemp -d)"; trap 'rm -rf "$R"' EXIT
fails=0
ok ()  { echo "  OK    $1"; }
bad () { echo "  FAIL  $1"; [ -n "${2:-}" ] && echo "        $2"; fails=$((fails+1)); }

# Strip FULL-LINE and TRAILING comments. Trailing matters and it caught this suite out on its own
# first run: rebase_pr's manual instructions read
#     git -C "$WT" push origin "HEAD:$BR"     # NO -f — updates PR #N in place
# and a check looking for `push ... -f` matched the two characters in the comment that say NOT to.
# The tool was correct and the test called it a force-push — test_guards case B exactly, in the file
# whose header warns about test_guards case B.
code () { grep -v '^[[:space:]]*#' "$1" 2>/dev/null | sed 's/[[:space:]]#.*$//'; }

# ── 1-3. No tool that pushes a PR head may force ────────────────────────────────────────────────
for t in rebase_pr.sh pr_submit.sh; do
  f="$TOOLS/$t"
  if [ ! -f "$f" ]; then bad "$t: not found at $f"; continue; fi
  hits="$(code "$f" | grep -nE 'push[^|]*(-f[[:space:]]|--force)' || true)"
  if [ -n "$hits" ]; then
    bad "$t force-pushes" "$(printf '%s' "$hits" | head -3)"
  else
    ok "$t never force-pushes"
  fi
done

# 3. ...and it must MERGE, not rebase, or the plain push it now does cannot fast-forward. Pinning
#    the remedy as well as the prohibition: dropping `-f` from a rebase would satisfy cases 1-2 and
#    produce a tool that simply fails on every stale PR.
if code "$TOOLS/rebase_pr.sh" | grep -q 'merge --no-edit origin/main'; then
  ok "rebase_pr merges current main in (so the push can fast-forward)"
else
  bad "rebase_pr does not merge main — a non-forced push will just be rejected"
fi

# 4. The union path publishes rebase_helper's verified TREE as a merge commit. That branch is built
#    on main and is not a descendant of the PR head, so this is the one place where "just merge"
#    is not enough and the fix has to be commit-tree.
if code "$TOOLS/rebase_pr.sh" | grep -q 'commit-tree'; then
  ok "the union path republishes its tree as a merge instead of forcing"
else
  bad "the union path cannot fast-forward without commit-tree — it will force or fail"
fi

# ── 5-9. The wrapper refuses a force at an open PR's head ───────────────────────────────────────
GPA="$TOOLS/ghapp/git_push_as.sh"
if [ ! -f "$GPA" ]; then
  bad "ghapp/git_push_as.sh not found at $GPA"
else
  mkdir -p "$R/ghapp"
  cp "$GPA" "$R/ghapp/git_push_as.sh"
  # app_token exits 7 = "role not configured", the documented fall-through to operator git auth.
  printf '#!/bin/bash\nexit 7\n' > "$R/ghapp/app_token.sh"; chmod +x "$R/ghapp/app_token.sh"
  # gh_as stub: answers from a fixture, and logs that it was asked.
  cat > "$R/ghapp/gh_as.sh" <<'STUB'
#!/bin/bash
echo "$*" >> "$GH_CALLS"
cat "$GH_ANSWER" 2>/dev/null
STUB
  chmod +x "$R/ghapp/gh_as.sh"
  export GH_CALLS="$R/calls" GH_ANSWER="$R/answer"

  git init -q --bare "$R/remote.git"
  git init -q "$R/wt"
  (
    cd "$R/wt"
    git config user.email t@t; git config user.name t
    echo base > f.txt; git add -A; git commit -qm base; git branch -M main
    git remote add origin "$R/remote.git"; git push -q -u origin main
    git checkout -q -b port/Foo; echo work >> f.txt; git commit -qam work
    git push -q -u origin port/Foo
    # diverge locally: a rewritten head, exactly what a rebase produces
    git reset -q --hard HEAD~1; echo other >> f.txt; git commit -qam rewritten
  ) >/dev/null 2>&1

  push () { ( cd "$R/wt"; rm -f "$GH_CALLS"; bash "$R/ghapp/git_push_as.sh" worker "$@" 2>&1 ); }
  remote_head () { git -C "$R/remote.git" rev-parse port/Foo; }

  # 5. THE RULE: a force at a branch with an open PR is refused, and the remote does not move.
  printf '650 APPROVED\n' > "$GH_ANSWER"
  before="$(remote_head)"
  out="$(push -f origin HEAD:port/Foo)"
  if [ "$(remote_head)" != "$before" ]; then
    bad "a force-push over an open PR's head went through" "$out"
  elif ! printf '%s' "$out" | grep -q "REFUSING to force-push"; then
    bad "the push was blocked but not by this guard" "$out"
  else
    ok "a force-push at an open PR's head is refused"
  fi
  # it must say WHICH pr, and give the merge remedy — a refusal with no way forward gets overridden
  printf '%s' "$out" | grep -q "#650" && ok "...and it names the PR" || bad "...and it names the PR" "$out"
  printf '%s' "$out" | grep -q "merge --no-edit origin/main" \
    && ok "...and it gives the merge remedy" || bad "...and it gives the merge remedy" "$out"

  # 6. A NON-forced push to that same branch must still work, or the fix breaks every caller.
  #    (Fast-forward this time — that is what the tools now produce.)
  ( cd "$R/wt"; git reset -q --hard origin/port/Foo; echo more >> f.txt; git commit -qam ff ) >/dev/null 2>&1
  before="$(remote_head)"
  out="$(push origin HEAD:port/Foo)"
  if [ "$(remote_head)" = "$before" ]; then bad "a plain fast-forward push was blocked" "$out"
  else ok "a plain fast-forward push still works"; fi

  # 7. A scratch branch with NO open PR may still be forced — rebase_helper owns and deletes
  #    `port/<Class>_rebased`, and rewriting your own throwaway hurts nobody. Scope is what keeps a
  #    rule enforceable; a blanket ban would have been disabled by whoever it blocked first.
  printf '' > "$GH_ANSWER"          # gh answers: no open PR on this head
  ( cd "$R/wt"; git push -q origin HEAD:refs/heads/scratch_rebased; echo s >> f.txt
    git commit -qam scratch; git reset -q --hard HEAD~1 ) >/dev/null 2>&1
  out="$(push -f origin HEAD:scratch_rebased)"
  if printf '%s' "$out" | grep -q "REFUSING to force-push"; then
    bad "a force at a scratch branch with no PR was refused — the rule is too broad" "$out"
  else ok "a scratch branch with no open PR may still be forced"; fi

  # 8. FAIL OPEN when gh does not answer. A refusal that fires on a TLS blip is a refusal somebody
  #    disables, and then it protects nothing — this repo learned that twice in one day.
  printf '' > "$GH_ANSWER"
  out="$(push -f origin HEAD:port/Foo)"
  if printf '%s' "$out" | grep -q "REFUSING to force-push"; then
    bad "an unanswered PR query blocked the push — it must fail open" "$out"
  else ok "an unanswered PR query fails open"; fi

  # 9. MUTATION: with the guard's exit removed, case 5 must go red. Cases 6-8 are all "allowed", so
  #    a wrapper that refuses NOTHING passes three of the five.
  MUT="$R/ghapp/git_push_as_mutated.sh"
  sed 's/^    exit 10$/    : /' "$R/ghapp/git_push_as.sh" > "$MUT"
  if ! grep -q "exit 10" "$R/ghapp/git_push_as.sh" || ! bash -n "$MUT" 2>/dev/null; then
    bad "could not build the mutant — case 9 proves nothing"
  else
    printf '650 APPROVED\n' > "$GH_ANSWER"
    ( cd "$R/wt"; git reset -q --hard origin/port/Foo~1 ) >/dev/null 2>&1
    before="$(remote_head)"
    ( cd "$R/wt"; bash "$MUT" worker -f origin HEAD:port/Foo ) >/dev/null 2>&1
    if [ "$(remote_head)" = "$before" ]; then
      bad "mutation: with the refusal removed the force STILL did not land — case 5 pins nothing"
    else
      ok "mutation: without the refusal the PR head is rewritten (case 5 has teeth)"
    fi
  fi
fi

echo
if [ "$fails" = 0 ]; then echo "test_no_force_push: PASS"; else echo "test_no_force_push: FAIL ($fails)"; fi
exit $([ "$fails" = 0 ] && echo 0 || echo 1)
