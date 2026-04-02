---
name: pr-review
description: "PR Review Command - Comprehensive pull request validation against Git Guidelines. Performs multiple automated checks on commit messages, metadata, and branch naming to ensure compliance with organization standards. Checks include: smart commit format, commit message structure, subject line length, JIRA key validation, time tracking, imperative mood, commit frequency, related changes, branch naming conventions, and message content quality."
license: Proprietary
---

# PR Review Command for Claude CLI

## Overview

A comprehensive PR review command for the Claude CLI that validates pull requests against your Git Guidelines. It performs 10 different checks to ensure commits follow the organization's standards.

## Installation

### Prerequisites
- Node.js 18+
- TypeScript
- Git repository with access to PR commits

### Setup

1. **Install the command:**
```bash
npm install -g pr-review-command
# or copy pr-review-command.ts to your Claude CLI commands directory
```

2. **Compile TypeScript (if needed):**
```bash
npx tsc pr-review-command.ts --target es2020 --module commonjs
```

3. **Make executable (Unix/Mac):**
```bash
chmod +x pr-review-command.js
```

## Usage

### Basic Usage
```bash
claude pr-review <pr-number>
```

### With Options
```bash
# Export report as JSON
claude pr-review 42 --export ./pr-review-report.json

# Use custom configuration
claude pr-review 42 --config ./.prreviewrc.json

# Combined
claude pr-review 42 --export report.json --config .prreviewrc.json
```

## Checks Performed

### 1. ✓ Smart Commit Format
**Severity:** Error (configurable)

Validates that commits include JIRA smart commits in the format:
```
[JIRA-KEY] #time [duration]
```

**Example valid commit:**
```
RR-101 #time 2h feature: add user profile page
```

**Error message:** "Commit missing smart commit (e.g., [RR-101])"

---

### 2. ✓ Commit Message Structure
**Severity:** Error

Validates that the commit message follows the structure:
```
[type]: description
```

**Allowed types:**
- feature
- bugfix
- chore
- refactor
- documentation
- style
- test
- performance
- ci
- build
- revert

**Example valid commit:**
```
[feature]: add user authentication module
```

---

### 3. ✓ Subject Line Length
**Severity:** Warning

Ensures commit message subject lines don't exceed 50 characters (configurable).

**Why:** Keeps messages readable in git log, GitHub, and email notifications.

---

### 4. ✓ JIRA Key Format
**Severity:** Error

Validates that smart commits contain valid JIRA key format: `[A-Z]+-\d+`

**Valid formats:**
- RR-101
- PROJ-999
- FEATURE-1

**Invalid formats:**
- RR101 (missing dash)
- rr-101 (lowercase)
- PROJ (no number)

---

### 5. ✓ Time Tracking
**Severity:** Warning

Ensures commits include time tracking for JIRA integration:
```
[RR-101] #time 2h
[RR-101] #time 1w 2d 5h 30m
```

---

### 6. ✓ Commit Message Tense
**Severity:** Warning

Validates that commit messages use imperative mood (present tense), not past tense.

**✅ Correct:**
- "Add user profile page"
- "Fix broken navigation links"

**❌ Incorrect:**
- "Added user profile page"
- "Fixed broken navigation links"

---

### 7. ✓ Commit Frequency
**Severity:** Info

Warns if the PR contains many commits (default: >10), suggesting they could be consolidated.

---

### 8. ✓ Related Changes
**Severity:** Warning

Detects when a single commit appears to mix multiple concerns (e.g., feature + bugfix in one commit).

---

### 9. ✓ Branch Naming Convention
**Severity:** Warning

Validates branch name follows the format:
```
[type]/[JIRA-KEY]-[description]
```

**Valid branch names:**
- feature/RR-101-facebook-login
- bugfix/RR-102-null-pointer-fix
- hotfix/RR-103-security-patch

**Invalid branch names:**
- feature-RR-101 (missing slash)
- RR-101-facebook-login (missing type)
- feature_facebook_login (missing JIRA key)

---

### 10. ✓ Meaningful Commit Messages
**Severity:** Error

Ensures commits have meaningful messages (minimum 5 characters).

---

## Configuration

### Default Configuration
```javascript
{
  maxCommitMessageLineLength: 100,
  maxSubjectLineLength: 50,
  requireSmartCommits: true,
  requireJiraKeys: true,
  allowedCommitTypes: [
    'feature',
    'bugfix',
    'chore',
    'refactor',
    'documentation',
    'style',
    'test',
    'performance',
    'ci',
    'build',
    'revert'
  ],
  warnOnBatchCommits: true
}
```

### Custom Configuration File
Create `.prreviewrc.json` in your repo:
```json
{
  "maxSubjectLineLength": 72,
  "requireSmartCommits": false,
  "allowedCommitTypes": [
    "feat",
    "fix",
    "docs",
    "style",
    "refactor",
    "test",
    "chore"
  ],
  "warnOnBatchCommits": false
}
```

Then use it:
```bash
claude pr-review 42 --config .prreviewrc.json
```

## Output Format

### Console Output
```
════════════════════════════════════════════════════════════════════════════════
  PR REVIEW REPORT - PR #42
════════════════════════════════════════════════════════════════════════════════

✅ ✓ Smart Commit Format
   All commits include smart commit format

⚠️  ✓ Subject Line Length
   1 commit(s) have subject lines that are too long
     • Commit a1b2c3d: Subject too long (68 > 50 chars)

✅ ✓ JIRA Key Format
   All smart commits have valid JIRA key format (e.g., RR-101)

────────────────────────────────────────────────────────────────────────────────
Summary: ⚠️  Passed with 1 warning(s)
Total: 9/10 checks passed
────────────────────────────────────────────────────────────────────────────────
```

### JSON Export
```bash
claude pr-review 42 --export report.json
```

Output: `report.json`
```json
{
  "prNumber": "42",
  "timestamp": "2025-04-02T10:30:00.000Z",
  "totalChecks": 10,
  "passedChecks": 9,
  "failedChecks": 0,
  "warnings": 1,
  "summary": "⚠️  Passed with 1 warning(s)",
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

## Integration Examples

### GitHub Actions
```yaml
name: PR Review
on: [pull_request]
jobs:
  pr-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g pr-review-command
      - run: claude pr-review ${{ github.event.pull_request.number }} --export report.json
      - uses: actions/upload-artifact@v3
        with:
          name: pr-review-report
          path: report.json
```

### GitLab CI
```yaml
pr-review:
  image: node:18
  script:
    - npm install -g pr-review-command
    - claude pr-review $CI_MERGE_REQUEST_IID --export report.json
  artifacts:
    paths:
      - report.json
```

### Pre-commit Hook
```bash
#!/bin/bash
# .githooks/commit-msg

# Review current commit
claude pr-review 0 --config .prreviewrc.json || exit 1
```

## Common Issues

### "No commits found"
- Ensure the PR branch is checked out
- Verify you're in the correct git repository
- The command tries to compare against the `main` branch by default

### "Could not fetch commits"
- Check git is properly configured: `git config --global user.email`
- Ensure you have permissions to the repository
- Try: `git fetch origin` first

### "Invalid JIRA key format"
- Keys must match pattern: `[A-Z]+-\d+`
- Examples: RR-101, PROJ-1, FEATURE-999
- Lowercase keys like `rr-101` won't validate

## Extending the Command

To add custom checks, extend the check functions:

```typescript
function checkCustomRule(
  commits: CommitData[],
  config: PRReviewConfig
): ReviewResult {
  const failures: string[] = [];
  
  commits.forEach((commit, index) => {
    // Your custom validation logic
    if (/* custom condition */) {
      failures.push(`Commit ${commit.hash.substring(0, 7)}: Your error message`);
    }
  });
  
  return {
    passed: failures.length === 0,
    checkName: '✓ Custom Rule Name',
    severity: 'error',
    message: 'Your message',
    details: failures,
  };
}

// Add to results array in reviewPullRequest():
results.push(checkCustomRule(commits, config));
```

## Performance

- Typical review time: < 1 second for 1-10 commits
- Scales well to 100+ commits
- Minimal resource usage

## Support

For issues, suggestions, or custom checks:
1. Review the check implementations above
2. Modify configuration to match your standards
3. Extend with custom checks using the example above

## See Also

- Git Guidelines documentation (Git_Guidelines.docx)
- JIRA Smart Commits documentation
- Conventional Commits (inspirational reference)
