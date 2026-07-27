#!/bin/bash
# refresh.sh — rebuild the ledger from symbols, then re-mark ported units from src/ citations.
# Run this after any batch of agent commits to get accurate todo/ported/frontier state.
set -e
D="$(cd "$(dirname "$0")" && pwd)"
python3 "$D/tools/build_ledger.py" "$@"
python3 "$D/tools/mark_ported.py"
echo "--- frontier ---"
python3 "$D/tools/frontier.py" "$@" | head -20
