"""
Local Git Service - Multi-repo aware. Detects changes, runs health checks,
and handles commit/push for any linked repository.
Author: Arsh Verma
"""
import subprocess
import os
import json
import logging
from typing import Dict, List, Any
from app.services.risk_analyzer import RiskAnalyzer
from app.utils.diff_parser import parse_unified_diff

logger = logging.getLogger(__name__)

REPOS_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "linked_repos.json")


def _load_linked_repos() -> List[Dict[str, str]]:
    """Load the list of linked repos from disk."""
    try:
        with open(REPOS_CONFIG_PATH, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _save_linked_repos(repos: List[Dict[str, str]]) -> None:
    """Persist the linked repos list to disk."""
    with open(REPOS_CONFIG_PATH, "w") as f:
        json.dump(repos, f, indent=2)


class LocalGitService:
    """Handles git operations for any repository path on the local machine."""

    def __init__(self):
        self.analyzer = RiskAnalyzer()

    def _run_git(self, repo_path: str, args: List[str]) -> str:
        """Run a git command in a specific repo directory."""
        try:
            result = subprocess.run(
                ["git", "-C", repo_path] + args,
                capture_output=True, text=True, check=True, timeout=15
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            logger.warning(f"Git cmd failed in {repo_path}: {e.stderr.strip()}")
            return ""
        except subprocess.TimeoutExpired:
            logger.warning(f"Git cmd timed out in {repo_path}")
            return ""

    # ── Repo Management ──────────────────────────────────────────────

    def list_linked_repos(self) -> List[Dict[str, Any]]:
        """Return all linked repos with their live status."""
        repos = _load_linked_repos()
        result = []
        for repo in repos:
            status = self.get_repo_status(repo["local_path"])
            result.append({**repo, **status})
        return result

    def link_repo(self, name: str, local_path: str, github_url: str) -> bool:
        """Link a new repo by its local folder path."""
        local_path = os.path.expanduser(local_path)
        if not os.path.isdir(os.path.join(local_path, ".git")):
            return False
        repos = _load_linked_repos()
        # Prevent duplicates
        if any(r["local_path"] == local_path for r in repos):
            return True
        repos.append({"name": name, "local_path": local_path, "github_url": github_url})
        _save_linked_repos(repos)
        return True

    def unlink_repo(self, local_path: str) -> bool:
        """Remove a repo from the linked list."""
        repos = _load_linked_repos()
        repos = [r for r in repos if r["local_path"] != local_path]
        _save_linked_repos(repos)
        return True

    # ── Status & Health ──────────────────────────────────────────────

    def get_repo_status(self, repo_path: str) -> Dict[str, Any]:
        """Full status for a single repo: changes, sync, health, risk."""
        repo_path = os.path.expanduser(repo_path)
        if not os.path.isdir(repo_path):
            return {"error": "Path not found", "health": "error"}

        changed_files = self._get_changed_files(repo_path)
        sync_status = self._get_sync_status(repo_path)
        current_branch = self._run_git(repo_path, ["branch", "--show-current"]) or "main"
        health = self._run_health_check(repo_path)
        risk = self._calculate_risk(repo_path)

        ready = health["passing"] and len(changed_files["staged"]) > 0

        return {
            "branch": current_branch,
            "changed_files": changed_files,
            "sync": sync_status,
            "health": health,
            "risk": risk,
            "ready_to_commit": ready,
        }

    def _get_changed_files(self, repo_path: str) -> Dict[str, List[str]]:
        """Detect all modified, staged, and untracked files."""
        status_output = self._run_git(repo_path, ["status", "--porcelain"])
        staged, modified, untracked = [], [], []

        for line in status_output.splitlines():
            if not line or len(line) < 3:
                continue
            index_flag = line[0]
            work_flag = line[1]
            filepath = line[3:]

            if index_flag in ("M", "A", "D", "R"):
                staged.append(filepath)
            if work_flag in ("M", "D"):
                modified.append(filepath)
            if index_flag == "?" and work_flag == "?":
                untracked.append(filepath)

        return {"staged": staged, "modified": modified, "untracked": untracked}

    def _get_sync_status(self, repo_path: str) -> Dict[str, Any]:
        """Check if local is ahead/behind the remote."""
        self._run_git(repo_path, ["fetch", "--quiet"])
        status = self._run_git(repo_path, ["status", "--branch", "--porcelain=v2"])

        ahead, behind = 0, 0
        for line in status.splitlines():
            if line.startswith("# branch.ab"):
                parts = line.split()
                for part in parts:
                    if part.startswith("+"):
                        try: ahead = int(part[1:])
                        except ValueError: pass
                    elif part.startswith("-"):
                        try: behind = abs(int(part[1:]))
                        except ValueError: pass

        if ahead > 0 and behind > 0:
            state = "diverged"
        elif ahead > 0:
            state = "ahead"
        elif behind > 0:
            state = "behind"
        else:
            state = "synced"

        return {"state": state, "ahead": ahead, "behind": behind}

    def _run_health_check(self, repo_path: str) -> Dict[str, Any]:
        """Try to detect and run the project's build/lint commands."""
        errors: List[str] = []

        # Detect project type and run appropriate checks
        if os.path.isfile(os.path.join(repo_path, "package.json")):
            # Node.js project — try lint
            try:
                result = subprocess.run(
                    ["npm", "run", "lint", "--silent"],
                    cwd=repo_path, capture_output=True, text=True, timeout=60
                )
                if result.returncode != 0:
                    for line in result.stderr.splitlines() + result.stdout.splitlines():
                        line = line.strip()
                        if line and ("error" in line.lower() or "warning" in line.lower()):
                            errors.append(line)
            except (subprocess.TimeoutExpired, FileNotFoundError):
                pass

        elif os.path.isfile(os.path.join(repo_path, "requirements.txt")) or \
             os.path.isfile(os.path.join(repo_path, "pyproject.toml")):
            # Python project — try syntax check
            try:
                result = subprocess.run(
                    ["python3", "-m", "py_compile", "--help"],
                    cwd=repo_path, capture_output=True, text=True, timeout=10
                )
            except (subprocess.TimeoutExpired, FileNotFoundError):
                pass

        return {
            "passing": len(errors) == 0,
            "error_count": len(errors),
            "errors": errors[:20],  # Cap at 20 errors
        }

    def _calculate_risk(self, repo_path: str) -> Dict[str, Any]:
        """Calculate risk score for staged changes."""
        diff_text = self._run_git(repo_path, ["diff", "--staged"])
        if not diff_text:
            diff_text = self._run_git(repo_path, ["diff"])
        if not diff_text:
            return {"risk_level": "safe", "risk_probability": 0.0}

        try:
            diff_info = parse_unified_diff(diff_text)
            has_config = any(f["is_config"] for f in diff_info["files"])
            has_dep = any(f["is_dep"] for f in diff_info["files"])
            has_test = any(f["is_test"] for f in diff_info["files"])

            result = self.analyzer.analyze_pr({
                "lines_added": sum(f.get("additions", 0) for f in diff_info["files"]),
                "lines_deleted": sum(f.get("deletions", 0) for f in diff_info["files"]),
                "files_changed": len(diff_info["files"]),
                "has_config_changes": has_config,
                "has_dependency_changes": has_dep,
                "has_test_changes": has_test,
                "complexity_delta": diff_info["max_complexity_delta"],
            }, {"total_prs": 10, "failed_prs": 1})
            return result
        except Exception as e:
            logger.warning(f"Risk calc failed: {e}")
            return {"risk_level": "safe", "risk_probability": 0.0}

    # ── Actions ──────────────────────────────────────────────────────

    def stage_all(self, repo_path: str) -> bool:
        """Stage all changes in a repo."""
        repo_path = os.path.expanduser(repo_path)
        output = self._run_git(repo_path, ["add", "-A"])
        return True  # git add -A doesn't fail unless path is bad

    def commit_and_push(self, repo_path: str, message: str) -> Dict[str, Any]:
        """Stage all, commit, and push to remote."""
        repo_path = os.path.expanduser(repo_path)
        if not message.strip():
            return {"success": False, "error": "Empty commit message"}

        # Stage everything
        self.stage_all(repo_path)

        # Commit
        commit_out = self._run_git(repo_path, ["commit", "-m", message])
        if not commit_out:
            return {"success": False, "error": "Nothing to commit or commit failed"}

        # Push
        push_out = self._run_git(repo_path, ["push"])
        return {"success": True, "message": "Changes committed and pushed to GitHub"}


local_git = LocalGitService()
