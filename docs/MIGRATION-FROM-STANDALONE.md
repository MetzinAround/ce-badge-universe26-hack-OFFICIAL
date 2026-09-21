# Migration from the standalone repository

The current Campus Experts repository was originally a standalone snapshot of
`badger/badgerfactory`. The maintained fork model keeps the Campus workflow
but receives future badge runtime and hardware changes through
`badger/home`.

## For teams with no local work

1. Fork the maintained Campus Experts repository.
2. Invite the other team members to that shared fork.
3. Clone the shared fork and add the maintained Campus repository as `upstream`.
4. Follow [CONTRIBUTING.md](../CONTRIBUTING.md) from the team-folder step.

## For teams with local work

Do not copy the whole old checkout into the new repository. Copy only:

- the team's assigned `TeamN/<app-name>/` directories;
- app-specific documentation that belongs with those apps;
- app-owned assets that are not generated or secret.

Before copying, remove `.venv/`, `__pycache__/`, `*.pyc`, `.badge_state/`,
screenshots, editor files, and any credentials. Then run the app validator and
team-wide validator in the new checkout.

## Before opening the final pull request

- Confirm all app changes are inside the assigned team folder.
- Update the team fork from `upstream/main`.
- Run `validate_app.py` for each app.
- Run `validate_submissions.py TeamN`.
- Test in the [Pimoroni Badgeware Web Simulator](https://pimoroni.github.io/badgeware-web-simulator/)
  (preferred for a quick check) and the local simulator (better for
  repository-local, command-line testing).
- List all physical-badge checks that remain.

The old standalone repository should remain available as a historical
reference until all active teams have moved. New work should use the
maintained fork chain described in [UPSTREAM-SYNC.md](UPSTREAM-SYNC.md).
