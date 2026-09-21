# Contributing as a Campus Expert

You will work in a team of four. Your team needs one shared fork of this
repository. Each person works on a branch and opens a pull request into that
fork. When the team is finished, the team opens one pull request from the fork
back to this repository.

This repository is itself a Campus Experts layer on
[`badger/home`](https://github.com/badger/home). The upstream badge runtime,
hardware files, and shared examples come from `badger/home`; Campus Experts
workflow files and team apps belong here. Read
[UPSTREAM-SYNC.md](docs/UPSTREAM-SYNC.md) before changing shared files.

## 1. Set up one shared team fork

Choose one teammate to be the fork owner.

1. The fork owner opens this repository on GitHub and selects **Fork**.
2. The fork owner opens the fork's **Settings**, then **Collaborators**, and
   invites the other three teammates.
3. Each teammate accepts the invitation.
4. Each teammate clones the same shared fork:

   ```bash
   git clone https://github.com/TEAM-OWNER/ce-badge-hack-universe26.git
   cd ce-badge-hack-universe26
   ```

5. Each teammate adds this repository as the `upstream` remote:

   ```bash
   git remote add upstream https://github.com/campus-experts/ce-badge-hack-universe26.git
   git remote -v
   ```

In these commands, replace `TEAM-OWNER` with the GitHub username of the person
who created the fork.

Do not add `badger/home` as the team fork's `upstream`. The maintained Campus
Experts repository is the upstream for team work. If you need to inspect the
original badge source, add it as a separate read-only remote:

```bash
git remote add badger-home https://github.com/badger/home.git
git remote -v
```

Before starting new work, update the shared team fork:

```bash
git switch main
git fetch upstream
git merge --ff-only upstream/main
git switch -c team1/short-change-name
```

## 2. Use only your assigned team folder

Your team will be assigned one folder:

- `Team1/`
- `Team2/`
- `Team3/`
- `Team4/`
Use the assigned `TeamN/` folder name as-is (the validation tools look for `Team1`–`Team4`). You can still choose any app names inside it.


Put all team code, images, notes, and other project files inside that folder.
Do not add your app to `badge/apps/`. That folder contains examples and shared
badge code.

Each app must have its own lowercase folder:

```text
Team1/
└── app-name/
    ├── __init__.py
    ├── icon.png
    └── assets/
```

## 3. Create your app

Complete the local setup in
[Build a badge app with Copilot](docs/COPILOT-QUICKSTART.md). Read the closest
example in `badge/apps/` before you start. Then ask Copilot to work in your
assigned team folder, or scaffold an app there:

```bash
python3 .github/skills/badge-app-builder/scripts/scaffold_app.py app-name \
  --title "App Name" \
  --apps-dir Team1
```

Replace `app-name`, `App Name`, and `Team1` with your app details.

Keep the physical badge limits in mind:

- Use a 160x120 layout.
- Keep `update()` short and non-blocking.
- Use `badge.pressed(...)` for one-time button actions.
- Use `badge.held(...)` for continuous button input.
- Do not use the HOME button. It belongs to the launcher.
- Do not add passwords, tokens, API keys, or `badge/secrets.py`.

## 4. Work through pull requests in the shared fork

Do not work directly on the fork's `main` branch.

Before each change, update your local copy and create a branch:

```bash
git switch main
git pull --ff-only origin main
git switch -c team1/short-change-name
```

Use your assigned team number in the branch name. Make a focused change, then
commit and push it:

```bash
git add Team1
git commit -m "Add app feature"
git push -u origin team1/short-change-name
```

On GitHub, open a pull request from your branch into the shared fork's `main`
branch. Ask at least one teammate to review it. Merge only after the checks
below pass and the reviewer approves the change.

After a pull request is merged, start the next change from an updated `main`
branch. Do not continue using the old branch.

## 5. Check every app

Run the validator with your app path:

```bash
python3 .github/skills/badge-app-builder/scripts/validate_app.py \
  Team1/app-name
```

Fix all validation errors. Then run the app in the simulator:

```bash
python3 simulator/badge_simulator.py Team1/app-name
```

Test every screen and button path. Test the first run and any saved state. The
simulator cannot prove that BLE, GPIO, IR, LEDs, battery behavior, exact timing,
or memory use will work on a physical badge. State these limits in the pull
request if your app uses hardware-only features.

Before merging into the shared fork, confirm:

- The validator passes.
- The team-wide check passes:

  ```bash
  python3 .github/skills/badge-app-builder/scripts/validate_submissions.py Team1
  ```

- The app was tested in the simulator.
- Another teammate reviewed the pull request.
- All changed files are inside the assigned team folder.
- No secrets, local state, generated screenshots, or editor files are present.

## 6. Send one final pull request to this repository

When all team pull requests are merged into the shared fork:

1. Confirm that the fork's `main` branch contains the complete team project.
2. Sync the fork with the latest `main` branch from this repository:

   ```bash
   git fetch upstream
   git switch main
   git merge --ff-only upstream/main
   git push origin main
   ```

3. Run the validator and simulator again for every team app.
   Run `validate_submissions.py TeamN` once as the final team-wide check.
4. Open one pull request with:
   - **Base repository:** `campus-experts/ce-badge-hack-universe26`
   - **Base branch:** `main`
   - **Head repository:** the shared team fork
   - **Compare branch:** `main`
5. Use a clear title, such as `[Team 1] Add our badge apps`.
6. In the description, list the apps, controls, completed checks, and any
   hardware behavior that still needs testing.

Do not open one final pull request per teammate. The shared fork must send one
pull request containing the team's complete work.

## If you have a merge conflict

Do not delete another teammate's work. Ask the teammate who changed the same
file to help resolve the conflict. Run the validator and simulator again after
the conflict is fixed.

## 7. Updating the maintained Campus Experts repository

Only maintainers update this repository from `badger/home`. They review
upstream changes, merge them into a branch here, run the repository checks, and
open a pull request. Campus-specific docs, skills, team folders, and validation
rules must remain intact. See [UPSTREAM-SYNC.md](docs/UPSTREAM-SYNC.md).
