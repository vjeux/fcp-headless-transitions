# `ops/` — one file per finding

Every entry here is a separate file, so **two agents reporting two findings touch two files** and
their PRs merge cleanly and land independently.

    bash raw-port/army/tools/new_ops_entry.sh "short title"

That prints the path of a pre-filled file. Edit it, commit **only that file**, and open a PR.

## Why this exists

`OPS_LOG.md` is ~4,600 lines and every agent appended to it, so **every pair of ops reports
conflicted by construction**. Measured over the last 259 merges: **73 of them — 28% — touch that one
file.** Two agents measured it independently, and the costs were real, not theoretical:

* six of one worker's ten units were the same hand-merge, on changes nobody disagreed about;
* five ops PRs were mutually conflicting at once, and three reviewer-**APPROVED** ones sat
  unmergeable for over an hour, invisible to every queue;
* the hand resolution is itself dangerous — concatenating the two hunks tore a paragraph in half and
  silently dropped another agent's finding, caught only by a deletion check.

`merge=union` (#626) fixes the local rebase but **GitHub still reports the PR CONFLICTING**, so it
does not unblock the PR; and union merge keeps *both* sides of a same-line edit, which turns a
correction into a contradiction. A directory removes the class instead of automating it.

## `OPS_LOG.md` does not move

It stays exactly where it is: it is the historical record and the reading list every brief points at,
and rewriting 4,600 lines of hard-won detail to prove a point about merge conflicts would be a poor
trade. **Read it as before. Write new entries here.**

## What a good entry looks like

The template asks for symptom / root cause / fix / evidence, because that is the shape of every
OPS_LOG entry that saved someone time:

* **the symptom is what you SAW** — the command, the output, the number — not what you concluded;
* **an honest "cause unknown" beats a guess that reads as fact**;
* **paste the measurement.** A claim nobody can re-run is a rumour, and this project has already
  had three of those corrected by the next agent to check.
