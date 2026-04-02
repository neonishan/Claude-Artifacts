# Claude PR Review Command

A comprehensive pull request validation tool for the Claude CLI that automatically checks commits against your organization's Git Guidelines.

## Features

✅ **10 Automated Checks**
- Smart commit format validation
- Commit message structure verification
- JIRA key format validation
- Time tracking validation
- Subject line length checks
- Imperative mood verification
- Commit frequency analysis
- Related changes detection
- Branch naming convention validation
- Message content quality checks

⚙️ **Configurable**
- Customize allowed commit types
- Adjust length limits
- Enable/disable specific checks
- Support for different workflows

📊 **Rich Reporting**
- Console output with color-coded results
- JSON export for CI/CD integration
- Detailed error messages with examples
- Line-by-line commit validation

🔧 **Easy Integration**
- Works with GitHub, GitLab, Bitbucket
- CI/CD pipeline ready
- Pre-commit hook compatible
- Works offline with local commits

## Quick Start

### Installation

```bash
# Via npm
npm install -g pr-review-command

# Or use directly from source
node pr-review-command.js <pr-number>
```

### Basic Usage

```bash
# Review PR #42
claude pr-review 42

# Export report as JSON
claude pr-review 42 --export report.json

# Use custom config
claude pr-review 42 --config .prreviewrc.json
```

## Example Output

### Success Case
```
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
   All smart commits have valid JIRA key format (e.g., RR-101)

✅ ✓ Time Tracking
   All commits include time tracking

✅ ✓ Commit Message Tense
   All commits use imperative mood (present tense)

✅ ✓ Commit Frequency
   Commit frequency is reasonable (3 commit(s))

✅ ✓ Related Changes
   All commits contain related changes

✅ ✓ Branch Naming Convention
   Branch name follows convention: feature/RR-101-facebook-login

✅ ✓ Meaningful Commit Messages
   All commits have meaningful messages

────────────────────────────────────────────────────────────────────────────────
Summary: ✅ All checks passed!
Total: 10/10 checks passed
────────────────────────────────────────────────────────────────────────────────
```

### With Issues
```
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

✅ ✓ JIRA Key Format
   All smart commits have valid JIRA key format (e.g., RR-101)

⚠️  ✓ Time Tracking
   2 commit(s) missing time tracking
     • Commit h7i8j9k: Missing time tracking (#time format)
     • Commit l0m1n2o: Missing time tracking (#time format)

✅ ✓ Commit Message Tense
   All commits use imperative mood (present tense)

✅ ✓ Commit Frequency
   Commit frequency is reasonable (5 commit(s))

✅ ✓ Related Changes
   All commits contain related changes

⚠️  ✓ Branch Naming Convention
   Branch name does not follow [type]/[JIRA]-[description] format: develop

✅ ✓ Meaningful Commit Messages
   All commits have meaningful messages

────────────────────────────────────────────────────────────────────────────────
Summary: ❌ 1 error(s), 3 warning(s)
Total: 6/10 checks passed
────────────────────────────────────────────────────────────────────────────────
```

## Commit Examples

### ✅ Perfect Commit (Passes All Checks)

```
RR-101 #time 2h [feature]: add user profile page
```

**What makes it perfect:**
- ✅ Includes JIRA key: `RR-101`
- ✅ Includes time tracking: `#time 2h`
- ✅ Correct type: `[feature]`
- ✅ Imperative mood: "add" not "added"
- ✅ Concise subject: 30 characters

### ✅ Good Commit (Passes All Checks)

```
RR-102 #time 1w 2d 5h 30m [bugfix]: fix null pointer in user service

Fixes NPE that occurred when user object was not fully initialized.
Added null checks in UserService.getProfile() method.
Added unit tests to verify the fix.
```

**What makes it good:**
- ✅ Smart commit with JIRA key and time
- ✅ Proper type classification
- ✅ Clear description
- ✅ Detailed body explaining the fix
- ✅ Multiple related changes documented

### ❌ Poor Commit #1 (Missing Smart Commit)

```
[feature]: added new authentication module
```

**Issues:**
- ❌ Missing JIRA key (e.g., `RR-101`)
- ❌ Missing time tracking
- ❌ Uses past tense "added" instead of "add"

**Fix:**
```
RR-103 #time 3h [feature]: add new authentication module
```

### ❌ Poor Commit #2 (Missing Type)

```
RR-104 #time 2h Updated the navigation menu to fix broken links
```

**Issues:**
- ❌ Missing commit type
- ❌ Subject too vague
- ❌ Uses past tense

**Fix:**
```
RR-104 #time 2h [bugfix]: fix broken navigation links
```

### ❌ Poor Commit #3 (Subject Too Long)

```
RR-105 #time 1h [refactor]: refactor the entire user authentication and authorization system to improve code quality and reduce technical debt while maintaining backward compatibility with existing clients
```

**Issues:**
- ❌ Subject is 175 characters (limit: 50)
- ❌ Too ambitious for one commit

**Fix:**
```
RR-105 #time 1h [refactor]: simplify user authentication logic

Refactored authentication module to reduce code complexity.
Maintains backward compatibility with existing clients.
```

### ❌ Poor Commit #4 (Mixed Concerns)

```
RR-106 #time 2h [feature]: add dashboard and fix login bug and update dependencies

This commit adds the new dashboard feature, fixes a critical login bug,
and updates all npm dependencies to their latest versions.
```

**Issues:**
- ❌ Mixes feature, bugfix, and chore
- ❌ Multiple unrelated changes in one commit
- ❌ Hard to revert individual changes
- ❌ Violates "commit small and frequently" guideline

**Fix (3 separate commits):**
```
RR-106 #time 3h [feature]: add dashboard view
RR-107 #time 1h [bugfix]: fix login authentication failure
RR-108 #time 1h [chore]: update npm dependencies
```

## Time Tracking Formats

```bash
# Simple format
RR-101 #time 30m
RR-101 #time 2h

# Complex format
RR-101 #time 1w 2d 5h 30m
RR-101 #time 3w 1d

# Mixed formats (all valid)
RR-101 #time 8h
RR-101 #time 1d 2h
RR-101 #time 1w 3h
```

## Configuration Options

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

### Custom Configuration
Create `.prreviewrc.json`:
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
    "perf",
    "test",
    "chore"
  ],
  "warnOnBatchCommits": false
}
```

Use with:
```bash
claude pr-review 42 --config .prreviewrc.json
```

## CI/CD Integration

### GitHub Actions
```yaml
name: PR Review
on:
  pull_request:
    types: [opened, synchronize]

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
      
      - run: |
          claude pr-review ${{ github.event.pull_request.number }} \
            --export pr-review-report.json
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: pr-review-report
          path: pr-review-report.json
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
    expire_in: 30 days
```

### Bitbucket Pipelines
```yaml
image: node:18

pipelines:
  pull-requests:
    '**':
      - step:
          name: PR Review
          script:
            - npm install -g pr-review-command
            - claude pr-review 0 --export report.json
          artifacts:
            - report.json
```

## Git Hooks Integration

### Pre-commit Hook
```bash
#!/bin/bash
# .githooks/pre-commit

echo "🔍 Reviewing commits..."
claude pr-review 0 --config .prreviewrc.json
exit $?
```

### Commit Message Hook
```bash
#!/bin/bash
# .githooks/commit-msg

# Validate message format: [JIRA] #time [type]: description
if ! grep -qE '^\[.+-[0-9]+\] #time .+ \[[a-z]+\]: .{5,}' "$1"; then
  echo "❌ Commit message does not follow guidelines"
  echo "Format: [JIRA-KEY] #time [duration] [type]: description"
  exit 1
fi
```

### Setup Hooks
```bash
# In your repo
chmod +x .githooks/*
git config core.hooksPath .githooks
```

## Best Practices

### 1. One Logical Change Per Commit
```bash
# ✅ GOOD: Separate logical concerns
RR-101 #time 1h [feature]: add user registration form
RR-102 #time 1h [feature]: add email validation service
RR-103 #time 30m [test]: add tests for email validation

# ❌ BAD: Multiple concerns in one commit
RR-101 #time 3h [feature]: add user registration and email validation
```

### 2. Write Clear Descriptions
```bash
# ✅ GOOD: Clear and specific
RR-101 #time 1h [bugfix]: fix race condition in user cache invalidation

# ⚠️ OKAY: Vague
RR-101 #time 1h [bugfix]: fix cache bug

# ❌ BAD: Too vague
RR-101 #time 1h [chore]: updates
```

### 3. Include Time Estimates
```bash
# ✅ GOOD: Accurate time tracking
RR-101 #time 2h 30m [feature]: implement OAuth integration

# ⚠️ OKAY: Rounded time
RR-101 #time 2h [feature]: implement OAuth integration

# ⚠️ AVOID: Unrealistic time
RR-101 #time 5m [feature]: implement OAuth integration (unlikely!)
```

### 4. Use Proper Branch Names
```bash
# ✅ GOOD
feature/RR-101-facebook-login
bugfix/RR-102-null-pointer-fix
hotfix/RR-103-security-patch

# ❌ BAD
feature-RR-101
RR-101-facebook-login
feature/facebook-login
```

### 5. Commit Frequently
```bash
# ✅ GOOD: 5 focused commits
RR-101 #time 1h [feature]: add login page UI
RR-101 #time 1h [feature]: implement login API endpoint
RR-101 #time 1h [feature]: add password validation
RR-101 #time 30m [test]: add login tests
RR-101 #time 30m [docs]: add authentication guide

# ❌ BAD: 1 giant commit
RR-101 #time 4h [feature]: complete login implementation with all tests and docs
```

## Troubleshooting

### "No commits found"
```bash
# Ensure you're in the right directory and branch is checked out
cd /path/to/repo
git fetch origin
git checkout feature/RR-101-your-feature
```

### "Could not fetch commits"
```bash
# Configure git identity
git config --global user.name "Your Name"
git config --global user.email "your.email@7edge.com"

# Then try again
claude pr-review 42
```

### "Invalid JIRA key format"
```bash
# WRONG: Missing dash or uppercase
rr-101          ❌
PROJ101         ❌
RR_101          ❌

# CORRECT: Uppercase with dash
RR-101          ✅
PROJ-999        ✅
FEATURE-1       ✅
```

### "Subject too long"
Keep your subject lines concise (≤50 characters):
```bash
# ❌ BAD (67 characters)
RR-101 #time 1h [feature]: implement a new user profile page with editing capabilities

# ✅ GOOD (40 characters)
RR-101 #time 1h [feature]: add user profile page
```

## Performance

- **1-5 commits:** < 100ms
- **5-20 commits:** < 500ms
- **20-100 commits:** < 1s
- **100+ commits:** < 3s

Minimal memory footprint: ~20MB

## Support

For issues or feature requests:
1. Check the Git Guidelines documentation
2. Review the configuration options
3. Check the examples above
4. Extend with custom checks if needed

## Related Documentation

- `Git_Guidelines.docx` - Full guidelines document
- `.prreviewrc.json` - Configuration template
- `SKILL.md` - Technical documentation
- `pr-review-command.ts` - Source code

## License

Proprietary - 7EDGE

## Version

Version 1.0.0
