# PR Review Command

**ID:** `pr-review`  
**Type:** `command`  
**Category:** `development`  
**Status:** `active`

## Description

A comprehensive pull request validation command that performs automated checks against Git Guidelines. Validates commit messages, branch naming, and code quality standards.

## Signature

```
claude pr-review <pr-number|branch-name> [options]
```

## Parameters

### Required
- `<pr-number>` - Pull request number (e.g., `42`)
- OR `<branch-name>` - Git branch name to review

### Optional
- `--export <path>` - Export JSON report to file
- `--config <path>` - Use custom config file (default: `.prreviewrc.json`)
- `--strict` - Treat warnings as errors
- `--verbose` - Show detailed output
- `--json` - Output only JSON (no formatting)

## Usage Examples

### Basic Review
```bash
claude pr-review 42
```

### Export Report
```bash
claude pr-review 42 --export report.json
```

### Custom Configuration
```bash
claude pr-review 42 --config .prreviewrc.json
```

### Strict Mode
```bash
claude pr-review 42 --strict
```

### Combined
```bash
claude pr-review 42 --export report.json --config .prreviewrc.json --strict
```

## Checks Performed

### 1. Smart Commit Format
**Severity:** Error  
**Validates:** `[JIRA-KEY] #time [duration]` format

Ensures commits include JIRA integration keywords.

**Example:**
```
RR-101 #time 2h [feature]: add user profile
```

**Error:** Commit missing smart commit (e.g., `[RR-101]`)

---

### 2. Commit Message Structure
**Severity:** Error  
**Validates:** `[type]: description` format

Ensures commits specify a type from the allowed list.

**Allowed Types:**
- `feature` - New feature
- `bugfix` - Bug fix
- `chore` - Maintenance
- `refactor` - Code refactoring
- `documentation` - Documentation update
- `style` - Code style/formatting
- `test` - Test addition/update
- `performance` - Performance improvement
- `ci` - CI/CD changes
- `build` - Build system changes
- `revert` - Reverting a commit

**Example:**
```
[feature]: add user authentication
```

**Error:** Commit missing type (e.g., `[feature]`)

---

### 3. Subject Line Length
**Severity:** Warning  
**Validates:** Subject ≤ 50 characters

Keeps commit messages concise and readable.

**Example (Good):**
```
Add user profile page (31 chars) ✅
```

**Example (Bad):**
```
Implement a comprehensive user profile management system with editing (72 chars) ❌
```

---

### 4. JIRA Key Format
**Severity:** Error  
**Validates:** JIRA key matches pattern `[A-Z]+-\d+`

Ensures valid JIRA issue key format.

**Valid Keys:**
- `RR-101`
- `PROJ-999`
- `FEATURE-1`

**Invalid Keys:**
- `rr-101` (lowercase)
- `RR101` (missing dash)
- `PROJ` (no number)

---

### 5. Time Tracking
**Severity:** Warning  
**Validates:** `#time [duration]` format

Ensures work hours are logged for JIRA.

**Valid Formats:**
- `#time 30m`
- `#time 2h`
- `#time 1d` (1 day = 8 hours)
- `#time 1w` (1 week = 5 days)
- `#time 1w 2d 5h 30m`

---

### 6. Commit Message Tense
**Severity:** Warning  
**Validates:** Imperative mood (present tense)

Ensures consistent imperative style in commit messages.

**Correct (Imperative):**
- "Add user profile"
- "Fix null pointer"
- "Update dependencies"

**Incorrect (Past Tense):**
- "Added user profile"
- "Fixed null pointer"
- "Updated dependencies"

---

### 7. Commit Frequency
**Severity:** Info  
**Validates:** Reasonable number of commits

Warns if PR contains too many commits (suggests consolidation).

**Threshold:** > 10 commits = warning

---

### 8. Related Changes
**Severity:** Warning  
**Validates:** Commits contain related changes only

Detects when a single commit mixes multiple concerns (features + bugfixes).

**Good:** Each commit has one logical purpose  
**Bad:** Mixing feature + bugfix + chore in one commit

---

### 9. Branch Naming Convention
**Severity:** Warning  
**Validates:** Branch matches `[type]/[JIRA-KEY]-[description]`

Ensures branch names follow standardized format.

**Valid Names:**
- `feature/RR-101-user-authentication`
- `bugfix/RR-102-null-pointer-fix`
- `hotfix/RR-103-security-vulnerability`

**Invalid Names:**
- `develop` (no type/JIRA)
- `feature-RR-101` (dash instead of slash)
- `RR-101-fix` (missing type)

---

### 10. Meaningful Commit Messages
**Severity:** Error  
**Validates:** Message length ≥ 5 characters

Ensures commits have substantive messages.

**Good:** "Fix broken navigation links" ✅  
**Bad:** "Fix" ❌

---

## Output Format

### Console Output
```
════════════════════════════════════════════════════════════════════════════════
  PR REVIEW REPORT - PR #101
════════════════════════════════════════════════════════════════════════════════

✅ ✓ Smart Commit Format
   All commits include smart commit format

⚠️  ✓ Subject Line Length
   1 commit(s) have subject lines that are too long
     • Commit a1b2c3d: Subject too long (68 > 50 chars)

❌ ✓ Time Tracking
   2 commit(s) missing time tracking
     • Commit h8i9j0k: Missing time tracking (#time format)
     • Commit l2m3n4o: Missing time tracking (#time format)

... (7 more checks) ...

────────────────────────────────────────────────────────────────────────────────
Summary: ⚠️  Passed with 2 warning(s)
Total: 8/10 checks passed
────────────────────────────────────────────────────────────────────────────────
```

### JSON Output (with --json flag)
```json
{
  "prNumber": "101",
  "timestamp": "2025-04-02T10:30:00.000Z",
  "totalChecks": 10,
  "passedChecks": 8,
  "failedChecks": 0,
  "warnings": 2,
  "summary": "⚠️  Passed with 2 warning(s)",
  "results": [
    {
      "passed": true,
      "checkName": "✓ Smart Commit Format",
      "severity": "error",
      "message": "All commits include smart commit format",
      "details": [],
      "lineNumbers": []
    }
  ]
}
```

## Configuration

### Default Configuration
```json
{
  "maxCommitMessageLineLength": 100,
  "maxSubjectLineLength": 50,
  "requireSmartCommits": true,
  "requireJiraKeys": true,
  "allowedCommitTypes": [
    "feature",
    "bugfix",
    "chore",
    "refactor",
    "documentation",
    "style",
    "test",
    "performance",
    "ci",
    "build",
    "revert"
  ],
  "warnOnBatchCommits": true
}
```

### Custom Configuration File (.prreviewrc.json)
```json
{
  "maxSubjectLineLength": 72,
  "requireSmartCommits": false,
  "allowedCommitTypes": ["feat", "fix", "docs", "style", "refactor"],
  "warnOnBatchCommits": false
}
```

## Return Values

### Exit Codes
- `0` - All checks passed
- `1` - Errors detected
- `2` - Configuration error
- `3` - Git error

### Report Fields

| Field | Type | Description |
|-------|------|-------------|
| `prNumber` | string | PR identifier |
| `timestamp` | ISO 8601 | Report generation time |
| `totalChecks` | number | Total checks performed |
| `passedChecks` | number | Checks that passed |
| `failedChecks` | number | Error-level failures |
| `warnings` | number | Warning-level failures |
| `summary` | string | Human-readable summary |
| `results` | array | Individual check results |

## Examples

### Perfect PR (All Checks Pass)
```bash
$ claude pr-review 101

════════════════════════════════════════════════════════════════════════════════
  PR REVIEW REPORT - PR #101
════════════════════════════════════════════════════════════════════════════════

✅ ✓ Smart Commit Format
   All commits include smart commit format

✅ ✓ Commit Message Structure
   All commits follow [type]: description format

✅ ✓ Subject Line Length
   All subject lines ≤ 50 characters

✅ ✓ JIRA Key Format
   All smart commits have valid JIRA key format

✅ ✓ Time Tracking
   All commits include time tracking

✅ ✓ Commit Message Tense
   All commits use imperative mood

✅ ✓ Commit Frequency
   Commit frequency is reasonable (3 commit(s))

✅ ✓ Related Changes
   All commits contain related changes

✅ ✓ Branch Naming Convention
   Branch name follows convention: feature/RR-101-user-auth

✅ ✓ Meaningful Commit Messages
   All commits have meaningful messages

────────────────────────────────────────────────────────────────────────────────
Summary: ✅ All checks passed!
Total: 10/10 checks passed
────────────────────────────────────────────────────────────────────────────────
```

### Failed PR (With Errors)
```bash
$ claude pr-review 42

════════════════════════════════════════════════════════════════════════════════
  PR REVIEW REPORT - PR #42
════════════════════════════════════════════════════════════════════════════════

❌ ✓ Smart Commit Format
   1 commit(s) missing smart commit format
     • Commit a1b2c3d: Missing smart commit (e.g., [RR-101])

✅ ✓ Commit Message Structure
   All commits follow [type]: description format

⚠️  ✓ Subject Line Length
   1 commit(s) have subject lines that are too long
     • Commit d4e5f6g: Subject too long (68 > 50 chars)

❌ ✓ JIRA Key Format
   1 commit(s) have invalid JIRA keys
     • Commit a1b2c3d: Invalid JIRA key format

... (more checks) ...

────────────────────────────────────────────────────────────────────────────────
Summary: ❌ 2 error(s), 1 warning(s)
Total: 7/10 checks passed
────────────────────────────────────────────────────────────────────────────────
```

## Integration

### GitHub Actions
```yaml
- name: PR Review
  run: |
    claude pr-review ${{ github.event.pull_request.number }} \
      --export pr-review.json
    
- name: Upload Report
  uses: actions/upload-artifact@v3
  with:
    name: pr-review-report
    path: pr-review.json
```

### GitLab CI
```yaml
pr-review:
  script:
    - claude pr-review $CI_MERGE_REQUEST_IID --export report.json
  artifacts:
    paths:
      - report.json
```

### Pre-commit Hook
```bash
#!/bin/bash
# .githooks/commit-msg
claude pr-review 0 --config .prreviewrc.json || exit 1
```

## Best Practices

### ✅ Good Commit

```
RR-101 #time 2h [feature]: add user profile page

Implemented user profile page with edit capabilities.
Users can now update their profile information and
upload a profile picture.
```

**What makes it good:**
- ✅ Includes JIRA key: `RR-101`
- ✅ Includes time: `#time 2h`
- ✅ Has type: `[feature]`
- ✅ Imperative mood: "add" not "added"
- ✅ Concise subject (30 chars)
- ✅ Single logical purpose

### ❌ Bad Commit

```
Updated code and fixed bugs and added new stuff
```

**What makes it bad:**
- ❌ No JIRA key
- ❌ No time tracking
- ❌ No type
- ❌ Past tense "Updated"
- ❌ Vague description
- ❌ Multiple concerns

## Related Commands

- `claude git config` - Configure git settings
- `claude branch create` - Create feature branches
- `claude commit` - Create commits with validation
- `claude pr create` - Create pull requests
- `claude pr list` - List pull requests

## Notes

- Requires git repository with commits
- JIRA key format is configurable
- Severity levels (error/warning/info) can be customized
- Works with GitHub, GitLab, Bitbucket, and other git platforms
- Supports both local and remote repositories

## Troubleshooting

### "No commits found"
```bash
# Ensure PR branch is checked out
git fetch origin
git checkout feature/RR-101-your-feature
claude pr-review 42
```

### "Invalid JIRA key format"
```
# WRONG: lowercase or missing dash
rr-101  ❌
RR101   ❌

# CORRECT: uppercase with dash
RR-101  ✅
PROJ-999 ✅
```

### "Subject too long"
```
# Keep under 50 characters
❌ This is a very long commit message that exceeds the 50 character limit significantly
✅ Add user profile page
```

## See Also

- Git Guidelines documentation
- JIRA Smart Commits guide
- Conventional Commits specification