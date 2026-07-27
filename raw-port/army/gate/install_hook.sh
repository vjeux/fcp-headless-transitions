#!/bin/bash
# install_hook.sh — install the pre-commit gate. Run once per clone/worktree.
set -e
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
HOOK="$REPO/.git/hooks/pre-commit"
cat > "$HOOK" <<'HK'
#!/bin/bash
# raw-port faithfulness gate — blocks commits that take shortcuts. Bypass ONLY with --no-verify
# (which is logged and must be justified in review).
staged=$(git diff --cached --name-only --diff-filter=ACM | grep '^raw-port/src/.*\.ts$' || true)
[ -z "$staged" ] && exit 0
echo "raw-port gate on staged files:"; echo "$staged" | sed 's/^/  /'
paths=""; for f in $staged; do paths="$paths $(git rev-parse --show-toplevel)/$f"; done
bash "$(git rev-parse --show-toplevel)/raw-port/army/gate/gate.sh" $paths
HK
chmod +x "$HOOK"
echo "installed pre-commit gate at $HOOK"
