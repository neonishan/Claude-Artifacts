#!/usr/bin/env node

/**
 * PR Review Command - Test Examples
 * 
 * This file contains example test cases showing:
 * 1. Commits that would PASS all checks
 * 2. Commits that would FAIL with errors
 * 3. Commits that would WARN with suggestions
 */

// ============================================================================
// EXAMPLE 1: PERFECT PR - ALL CHECKS PASS
// ============================================================================

const PERFECT_PR = {
  number: 101,
  branch: "feature/RR-101-facebook-login",
  commits: [
    {
      hash: "a1b2c3d",
      message: `RR-101 #time 2h [feature]: add facebook login button
      
Implemented Facebook OAuth integration on the login page.
Users can now sign in using their Facebook credentials.
Redirects to profile setup after successful authentication.`,
    },
    {
      hash: "b2c3d4e",
      message: `RR-101 #time 1h 30m [feature]: implement facebook oauth service

Created FacebookAuthService to handle OAuth flow.
Integrated with existing authentication middleware.
Securely stores and manages access tokens.`,
    },
    {
      hash: "c3d4e5f",
      message: `RR-101 #time 1h [test]: add facebook authentication tests

Added unit tests for FacebookAuthService.
Added integration tests for OAuth callback handling.
Coverage: 95% of facebook login flow.`,
    },
  ],
};

// Expected output:
// ✅ All 10 checks PASS
// Summary: ✅ All checks passed!

// ============================================================================
// EXAMPLE 2: FAILED PR - MULTIPLE ERRORS
// ============================================================================

const FAILED_PR = {
  number: 42,
  branch: "develop", // ❌ Wrong: no type/JIRA key
  commits: [
    {
      hash: "d4e5f6g",
      message: `Added new features and fixed bugs and updated dependencies
      
This commit includes the new dashboard feature, authentication fix,
and updated all npm packages to latest versions.`,
      // ❌ Issues:
      // - Missing smart commit [RR-XXX]
      // - Missing time tracking
      // - Missing commit type [type]
      // - Uses past tense "Added" instead of "Add"
      // - Mixes multiple concerns (feature + bugfix + chore)
      // - Subject too vague
    },
    {
      hash: "e5f6g7h",
      message: `Updated database configuration file
      
Changed connection timeout from 5s to 10s.
Added retry logic for failed connections.`,
      // ❌ Issues:
      // - Missing smart commit
      // - Missing time tracking
      // - Missing commit type
    },
    {
      hash: "f6g7h8i",
      message: ``,
      // ❌ Issues:
      // - Empty message
    },
  ],
};

// Expected output:
// ❌ Smart Commit Format - 3 commits missing smart commit
// ❌ Commit Message Structure - 3 commits missing type
// ⚠️  Subject Line Length - 1 commit too long (68 > 50 chars)
// ❌ JIRA Key Format - 3 commits missing JIRA keys
// ❌ Time Tracking - 3 commits missing time tracking
// ⚠️  Commit Message Tense - past tense detected
// ⚠️  Related Changes - mixed concerns detected
// ❌ Branch Naming Convention - "develop" doesn't match pattern
// ❌ Meaningful Commit Messages - 1 commit empty

// Summary: ❌ 6 error(s), 3 warning(s)
// Total: 1/10 checks passed

// ============================================================================
// EXAMPLE 3: WARNING PR - PASSES WITH WARNINGS
// ============================================================================

const WARNING_PR = {
  number: 156,
  branch: "feature/RR-156-user-analytics",
  commits: [
    {
      hash: "g7h8i9j",
      message: `RR-156 #time 2h [feature]: implement user analytics dashboard

Implemented real-time analytics dashboard for tracking user behavior.
Integrated with Google Analytics API.
Added charts for user engagement metrics.`,
      // Minor: subject is 48 chars (good, under 50)
    },
    {
      hash: "h8i9j0k",
      message: `RR-156 #time [feature]: add analytics export functionality

This commit is quite long and explains that the new export feature
allows users to download their analytics data in various formats including
CSV, JSON, and Excel spreadsheets which can then be imported into other tools.`,
      // ⚠️ Issues:
      // - Missing time duration (e.g., "1h 30m")
      // - Body is verbose (could be more concise)
    },
    {
      hash: "i9j0k1l",
      message: `RR-156 #time 30m [refactor]: simplify analytics calculation logic`,
      // ✅ Good
    },
    {
      hash: "j0k1l2m",
      message: `RR-156 #time 1h 15m [test]: add analytics unit tests`,
      // ✅ Good
    },
    {
      hash: "k1l2m3n",
      message: `RR-156 #time 45m [docs]: update analytics API documentation`,
      // ✅ Good
    },
    {
      hash: "l2m3n4o",
      message: `RR-156 #time 30m [chore]: update dependencies for analytics library`,
      // ✅ Good
    },
    {
      hash: "m3n4o5p",
      message: `RR-156 #time 1h [style]: format analytics code according to eslint rules`,
      // ✅ Good
    },
  ],
};

// Expected output:
// ✅ Smart Commit Format - All commits include smart commit
// ✅ Commit Message Structure - All follow [type]: format
// ✅ Subject Line Length - All ≤ 50 characters
// ✅ JIRA Key Format - All have valid JIRA keys
// ⚠️  Time Tracking - 1 commit missing time duration (h8i9j0k)
// ✅ Commit Message Tense - All use imperative mood
// ⚠️  Commit Frequency - 7 commits (on high side, but acceptable)
// ✅ Related Changes - All commits have related changes
// ✅ Branch Naming Convention - Follows pattern
// ✅ Meaningful Commit Messages - All have meaningful content

// Summary: ⚠️  Passed with 2 warning(s)
// Total: 8/10 checks passed

// ============================================================================
// EXAMPLE 4: EDGE CASES
// ============================================================================

const EDGE_CASES = {
  "Valid time formats": [
    "RR-101 #time 30m",            // ✅ 30 minutes
    "RR-101 #time 2h",             // ✅ 2 hours
    "RR-101 #time 1d",             // ✅ 1 day
    "RR-101 #time 1w",             // ✅ 1 week
    "RR-101 #time 1w 2d 5h 30m",   // ✅ Complex format
  ],

  "Invalid time formats": [
    "RR-101 #time",                // ❌ Missing duration
    "RR-101 #time 2",              // ❌ Missing unit
    "RR-101 time 2h",              // ❌ Missing #
  ],

  "Valid JIRA keys": [
    "RR-101",                      // ✅ Project-Number
    "PROJ-999",                    // ✅ Any uppercase project
    "FEATURE-1",                   // ✅ Works with any project
    "ABC-12345",                   // ✅ Works with longer numbers
  ],

  "Invalid JIRA keys": [
    "rr-101",                      // ❌ Must be uppercase
    "RR101",                       // ❌ Missing dash
    "RR-",                         // ❌ Missing number
    "RR_101",                      // ❌ Must use dash
  ],

  "Valid commit types": [
    "[feature]",                   // ✅ New feature
    "[bugfix]",                    // ✅ Bug fix
    "[chore]",                     // ✅ Maintenance
    "[refactor]",                  // ✅ Code refactoring
    "[documentation]",             // ✅ Docs update
    "[style]",                     // ✅ Formatting
    "[test]",                      // ✅ Test update
    "[performance]",               // ✅ Performance improvement
    "[ci]",                        // ✅ CI configuration
    "[build]",                     // ✅ Build system
    "[revert]",                    // ✅ Reverting commit
  ],

  "Invalid commit types": [
    "[feat]",                      // ❌ Not in allowed list
    "[fix]",                       // ❌ Should be "bugfix"
    "[docs]",                      // ❌ Should be "documentation"
    "feature",                     // ❌ Missing brackets
    "[unknown]",                   // ❌ Not defined
  ],

  "Valid subject lines": [
    "Add user profile page",                    // ✅ 25 chars
    "Fix null pointer in authentication module", // ✅ 44 chars
    "Refactor API response error handling",     // ✅ 40 chars
  ],

  "Invalid subject lines": [
    "This is a very long commit message that exceeds the 50 character limit significantly", // ❌ 87 chars
    "Updated code",                            // ❌ Past tense + too vague
  ],

  "Valid branch names": [
    "feature/RR-101-facebook-login",          // ✅ Pattern match
    "bugfix/RR-102-null-pointer-fix",         // ✅ Pattern match
    "hotfix/RR-103-security-vulnerability",   // ✅ Pattern match
  ],

  "Invalid branch names": [
    "develop",                                  // ❌ No type/JIRA/description
    "feature-RR-101-facebook",                 // ❌ Uses dash instead of slash
    "RR-101-facebook-login",                   // ❌ Missing type prefix
    "feature/facebook-login",                  // ❌ Missing JIRA key
  ],
};

// ============================================================================
// USAGE EXAMPLES IN SHELL
// ============================================================================

const SHELL_EXAMPLES = `
# Review PR and see full output
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

# Export report as JSON for CI/CD
$ claude pr-review 101 --export report.json
✓ Report exported to: report.json

# Use custom configuration
$ claude pr-review 101 --config .prreviewrc.json

# Both options
$ claude pr-review 101 --export report.json --config .prreviewrc.json
`;

// ============================================================================
// EXPECTED JSON REPORT OUTPUT
// ============================================================================

const SAMPLE_JSON_REPORT = {
  prNumber: "101",
  timestamp: "2025-04-02T10:30:00.000Z",
  totalChecks: 10,
  passedChecks: 10,
  failedChecks: 0,
  warnings: 0,
  summary: "✅ All checks passed!",
  results: [
    {
      passed: true,
      checkName: "✓ Smart Commit Format",
      severity: "error",
      message: "All commits include smart commit format",
      details: [],
      lineNumbers: [],
    },
    {
      passed: true,
      checkName: "✓ Commit Message Structure",
      severity: "error",
      message: "All commits follow [type]: description format",
      details: [],
      lineNumbers: [],
    },
    {
      passed: true,
      checkName: "✓ Subject Line Length",
      severity: "warning",
      message: "All subject lines ≤ 50 characters",
      details: [],
      lineNumbers: [],
    },
    {
      passed: true,
      checkName: "✓ JIRA Key Format",
      severity: "error",
      message: "All smart commits have valid JIRA key format (e.g., RR-101)",
      details: [],
      lineNumbers: [],
    },
    {
      passed: true,
      checkName: "✓ Time Tracking",
      severity: "warning",
      message: "All commits include time tracking",
      details: [],
      lineNumbers: [],
    },
    {
      passed: true,
      checkName: "✓ Commit Message Tense",
      severity: "warning",
      message: "All commits use imperative mood (present tense)",
      details: [],
      lineNumbers: [],
    },
    {
      passed: true,
      checkName: "✓ Commit Frequency",
      severity: "info",
      message: "Commit frequency is reasonable (3 commit(s))",
      details: [],
      lineNumbers: [],
    },
    {
      passed: true,
      checkName: "✓ Related Changes",
      severity: "warning",
      message: "All commits contain related changes",
      details: [],
      lineNumbers: [],
    },
    {
      passed: true,
      checkName: "✓ Branch Naming Convention",
      severity: "warning",
      message: "Branch name follows convention: feature/RR-101-facebook-login",
      details: [],
      lineNumbers: [],
    },
    {
      passed: true,
      checkName: "✓ Meaningful Commit Messages",
      severity: "error",
      message: "All commits have meaningful messages",
      details: [],
      lineNumbers: [],
    },
  ],
};

// ============================================================================
// INTEGRATION TEST COMMANDS
// ============================================================================

const TEST_COMMANDS = `
# Test with example PRs (would need actual git repo)
npm test

# Test with specific configuration
npm test -- --config test-config.json

# Generate test reports
npm test -- --export test-report.json

# Test individual checks
npm test -- --check smart-commit-format
npm test -- --check commit-structure
npm test -- --check jira-key-format

# Benchmark performance
npm test -- --benchmark
`;

module.exports = {
  PERFECT_PR,
  FAILED_PR,
  WARNING_PR,
  EDGE_CASES,
  SHELL_EXAMPLES,
  SAMPLE_JSON_REPORT,
  TEST_COMMANDS,
};
