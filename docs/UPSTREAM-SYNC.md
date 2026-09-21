# Upstream fork and sync model

This repository is the maintained Campus Experts fork layer for
[`badger/home`](https://github.com/badger/home). It is not a copy that should
be refreshed by replacing whole directories.

## Ownership boundaries

| Area | Owner | Change rule |
|---|---|---|
| `badge/` runtime, hardware, and upstream examples | `badger/home` | Sync from upstream; make local changes only when the Campus layer needs a documented compatibility fix |
| `simulator/` | Campus layer, with upstream reference | Keep the local command-line simulator only where it helps the Campus workflow; document browser simulator behavior separately |
| `.github/skills/badge-app-builder/` | Campus layer | Keep the skill aligned with the active 2026 runtime and repository workflow |
| `Team1/` through `Team4/` | Campus layer | Campus Expert submissions only |
| `docs/`, `CONTRIBUTING.md`, and Campus workflow files | Campus layer | Update when the team workflow or upstream boundary changes |
| generated state, credentials, caches, and local environments | Neither | Never commit |

When upstream and Campus files overlap, preserve the current Universe 2026
runtime and review the conflict instead of overwriting it automatically.

## One-time transition from the snapshot

The existing repository began as a `badgerfactory` snapshot, so do not merge
`badger/home/main` into it as the first migration step. The upstream and
snapshot histories have different ownership boundaries and a blind merge would
create a large, hard-to-review conflict.

Instead:

1. Create the maintained Campus Experts repository as a fork of
   `badger/home`.
2. Add the Campus layer from the old repository: team folders, Campus
   documentation, the builder skill, validation tools, and the local
   simulator where it is still needed.
3. Review every overlapping `badge/` file against `badger/home` and keep the
   upstream version unless a Campus compatibility change is documented.
4. Run the repository checks and test one complete Campus team fork before
   directing new teams to the maintained repository.
5. Keep the old repository read-only as a migration reference until active
   teams have moved.

## Remotes

For maintainers of this repository:

```bash
git remote add badger-home https://github.com/badger/home.git
git remote -v
```

For a Campus Expert team fork:

```bash
git remote add upstream https://github.com/campus-experts/ce-badge-universe26-hack-OFFICIAL.git
git remote add badger-home https://github.com/badger/home.git
git remote -v
```

The team fork uses the Campus Experts repository as `upstream`. The
`badger-home` remote is optional and is for inspection only. Do not merge
directly from `badger-home` in a team app branch.

## Maintainer sync procedure

1. Check the current Campus branch and working tree.

   ```bash
   git switch main
   git pull --ff-only origin main
   git fetch badger-home
   ```

2. Create a sync branch.

   ```bash
   git switch -c sync/badger-home-YYYY-MM-DD
   ```

3. Review the upstream commits before merging them.

   ```bash
   git log --oneline --decorate main..badger-home/main
   git diff --stat main...badger-home/main
   ```

4. Merge upstream without squashing the source history.

   ```bash
   git merge --no-ff badger-home/main
   ```

5. Resolve conflicts by ownership. Keep Campus workflow, team folders, and
   Campus documentation. Prefer the upstream version for upstream-owned
   runtime and hardware files unless the change breaks the Campus workflow.

6. Run the exact repository checks required by
   `.github/copilot-instructions.md`:

   ```bash
   python3 -m unittest discover \
     -s .github/skills/badge-app-builder/tests -v
   python3 -m compileall -q badge simulator .github/skills/badge-app-builder
   python3 .github/skills/badge-app-builder/scripts/validate_submissions.py badge/apps
   python3 .github/skills/badge-app-builder/scripts/validate_submissions.py
   ```

7. Open a pull request into `main`. Include the upstream commit range, conflict
   decisions, validation results, and any physical-badge tests still needed.

## Team update procedure

Team forks should update from the maintained Campus repository before new work
and before the final pull request:

```bash
git fetch upstream
git switch main
git merge --ff-only upstream/main
git push origin main
```

Do not copy files from a separate `badger/home` checkout into a team folder.
That bypasses the maintained fork and makes later review harder.

## Simulator policy

The Pimoroni web simulator is the preferred quick browser preview. The local
Pygame simulator is retained for repository-local files, hot reload, and
repeatable command-line checks. Neither simulator proves physical behavior for
BLE, GPIO, IR, LEDs, battery, radio, memory, or exact timing.
