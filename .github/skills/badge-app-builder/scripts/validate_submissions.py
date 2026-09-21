#!/usr/bin/env python3
"""Validate every badge app in one or more Campus Experts team folders."""

from __future__ import annotations

import argparse
from pathlib import Path

from validate_app import REPO_ROOT, validate_app


DEFAULT_TEAMS = tuple(f"Team{number}" for number in range(1, 5))
IGNORED_DISCOVERY_PARTS = {"__pycache__", ".badge_state"}
IGNORED_DISCOVERY_SUFFIXES = {".pyc", ".pyo"}


def discover_apps(team_dir: Path) -> list[Path]:
    if not team_dir.is_dir():
        return []

    def has_app_content(path: Path) -> bool:
        return any(
            file.is_file()
            and not any(part in IGNORED_DISCOVERY_PARTS for part in file.parts)
            and file.suffix not in IGNORED_DISCOVERY_SUFFIXES
            and not file.name.startswith(".")
            for file in path.rglob("*")
        )

    return sorted(
        path
        for path in team_dir.iterdir()
        if path.is_dir() and has_app_content(path)
    )


def validate_teams(
    team_dirs: list[Path], repo_root: Path, target: str = "both"
) -> tuple[int, int, int]:
    app_count = 0
    error_count = 0
    warning_count = 0

    for team_dir in team_dirs:
        try:
            display_team = team_dir.relative_to(repo_root)
        except ValueError:
            display_team = team_dir

        if not team_dir.is_dir():
            print(f"ERROR: Team folder does not exist: {display_team}")
            error_count += 1
            continue

        apps = discover_apps(team_dir)
        if not apps:
            print(f"{display_team}: no apps found")
            continue

        for app_dir in apps:
            app_count += 1
            issues = validate_app(app_dir, repo_root, target)
            errors = [issue for issue in issues if issue.severity == "ERROR"]
            warnings = [issue for issue in issues if issue.severity == "WARNING"]
            error_count += len(errors)
            warning_count += len(warnings)

            print(f"\nChecking {display_team / app_dir.name}")
            for issue in errors + warnings:
                print(issue.render(repo_root))
            if not errors:
                print(f"OK ({len(warnings)} warning(s))")

    return app_count, error_count, warning_count


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "teams",
        nargs="*",
        default=list(DEFAULT_TEAMS),
        help="Team folders to check (default: Team1 Team2 Team3 Team4)",
    )
    parser.add_argument(
        "--target",
        choices=("both", "emulator", "hardware"),
        default="both",
        help="Compatibility target (default: both)",
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=REPO_ROOT,
        help="Repository root used to resolve team and /system paths",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    repo_root = args.repo_root.resolve()
    team_dirs = [
        (repo_root / team).resolve()
        if not Path(team).is_absolute()
        else Path(team).resolve()
        for team in args.teams
    ]
    app_count, error_count, warning_count = validate_teams(
        team_dirs, repo_root, args.target
    )

    if error_count:
        print(
            f"\nFAILED: {app_count} app(s), {error_count} error(s), "
            f"{warning_count} warning(s)"
        )
        return 1
    print(f"\nOK: {app_count} app(s), {warning_count} warning(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
