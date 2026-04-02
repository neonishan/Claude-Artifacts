#!/usr/bin/env node

/**
 * PR Review Command - Validates Pull Requests against Git Guidelines
 * 
 * This command performs comprehensive checks on PR commits and metadata
 * to ensure compliance with the organization's Git Guidelines.
 * 
 * Usage: claude pr-review <pr-number> [options]
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ReviewResult {
  passed: boolean;
  checkName: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: string[];
  lineNumbers?: number[];
}

interface CommitData {
  hash: string;
  author: string;
  date: string;
  message: string;
  body: string;
  footer: string;
}

interface PRReviewConfig {
  maxCommitMessageLineLength: number;
  maxSubjectLineLength: number;
  requireSmartCommits: boolean;
  requireJiraKeys: boolean;
  allowedCommitTypes: string[];
  warnOnBatchCommits: boolean;
}

interface ReviewReport {
  prNumber: string;
  timestamp: string;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
  results: ReviewResult[];
  summary: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: PRReviewConfig = {
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
    'revert',
  ],
  warnOnBatchCommits: true,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Execute a shell command and return output
 */
function executeCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error}`);
  }
}

/**
 * Parse commit message into components
 */
function parseCommitMessage(message: string): {
  smartCommit: string | null;
  type: string | null;
  description: string;
  body: string;
  footer: string;
  rawSubject: string;
} {
  const lines = message.split('\n');
  const subject = lines[0];
  const body = lines.slice(2).join('\n');

  // Parse: [SMART-COMMIT] [type]: [description]
  const smartCommitMatch = subject.match(/^\[([^\]]+)\]\s+/);
  const typeDescMatch = subject.match(/\[([^\]]+)\]:\s+(.+)/);

  return {
    smartCommit: smartCommitMatch ? smartCommitMatch[1] : null,
    type: typeDescMatch ? typeDescMatch[1] : null,
    description: typeDescMatch ? typeDescMatch[2] : subject,
    body: body,
    footer: lines[lines.length - 1],
    rawSubject: subject,
  };
}

/**
 * Extract JIRA issue key from smart commit
 */
function extractJiraKey(smartCommit: string): string | null {
  const match = smartCommit.match(/^([A-Z]+-\d+)/);
  return match ? match[1] : null;
}

/**
 * Get commits from a PR (GitHub/GitLab/Bitbucket specific)
 */
function getCommitsFromPR(prNumber: string, remote: string = 'origin'): CommitData[] {
  // This assumes the PR branch is checked out or we can reference it
  // Adjust based on your Git hosting platform
  try {
    const baseRef = executeCommand('git merge-base HEAD main');
    const commits = executeCommand(`git log ${baseRef}..HEAD --format=%H%n%an%n%ai%n%B%n---END---`);
    
    return parseCommits(commits);
  } catch (error) {
    console.warn('Could not fetch commits - ensure you have the PR branch checked out');
    return [];
  }
}

/**
 * Parse raw commit output into structured data
 */
function parseCommits(rawOutput: string): CommitData[] {
  const commits: CommitData[] = [];
  const entries = rawOutput.split('---END---').filter(e => e.trim());

  for (const entry of entries) {
    const lines = entry.trim().split('\n');
    if (lines.length < 3) continue;

    commits.push({
      hash: lines[0],
      author: lines[1],
      date: lines[2],
      message: lines.slice(3).join('\n'),
      body: '',
      footer: '',
    });
  }

  return commits;
}

// ============================================================================
// CHECK FUNCTIONS
// ============================================================================

/**
 * CHECK 1: Smart Commit Format
 * Validates that commits include JIRA smart commits
 */
function checkSmartCommitFormat(
  commits: CommitData[],
  config: PRReviewConfig
): ReviewResult {
  const failures: string[] = [];
  const lineNumbers: number[] = [];

  commits.forEach((commit, index) => {
    const parsed = parseCommitMessage(commit.message);
    if (!parsed.smartCommit) {
      failures.push(
        `Commit ${commit.hash.substring(0, 7)}: Missing smart commit (e.g., [RR-101])`
      );
      lineNumbers.push(index + 1);
    }
  });

  return {
    passed: failures.length === 0,
    checkName: '✓ Smart Commit Format',
    severity: config.requireSmartCommits ? 'error' : 'warning',
    message: failures.length === 0
      ? 'All commits include smart commit format'
      : `${failures.length} commit(s) missing smart commit format`,
    details: failures,
    lineNumbers,
  };
}

/**
 * CHECK 2: Commit Message Structure
 * Validates [type]: description format
 */
function checkCommitMessageStructure(
  commits: CommitData[],
  config: PRReviewConfig
): ReviewResult {
  const failures: string[] = [];
  const lineNumbers: number[] = [];

  commits.forEach((commit, index) => {
    const parsed = parseCommitMessage(commit.message);
    
    if (!parsed.type) {
      failures.push(
        `Commit ${commit.hash.substring(0, 7)}: Missing commit type (e.g., [feature], [bugfix])`
      );
      lineNumbers.push(index + 1);
    } else if (!config.allowedCommitTypes.includes(parsed.type)) {
      failures.push(
        `Commit ${commit.hash.substring(0, 7)}: Invalid type "${parsed.type}". Allowed: ${config.allowedCommitTypes.join(', ')}`
      );
      lineNumbers.push(index + 1);
    }
  });

  return {
    passed: failures.length === 0,
    checkName: '✓ Commit Message Structure',
    severity: 'error',
    message: failures.length === 0
      ? 'All commits follow [type]: description format'
      : `${failures.length} commit(s) have invalid structure`,
    details: failures,
    lineNumbers,
  };
}

/**
 * CHECK 3: Subject Line Length
 * Validates that subject lines are <= 50 characters
 */
function checkSubjectLineLength(
  commits: CommitData[],
  config: PRReviewConfig
): ReviewResult {
  const failures: string[] = [];
  const lineNumbers: number[] = [];

  commits.forEach((commit, index) => {
    const subject = commit.message.split('\n')[0];
    if (subject.length > config.maxSubjectLineLength) {
      failures.push(
        `Commit ${commit.hash.substring(0, 7)}: Subject too long (${subject.length} > ${config.maxSubjectLineLength} chars)`
      );
      lineNumbers.push(index + 1);
    }
  });

  return {
    passed: failures.length === 0,
    checkName: '✓ Subject Line Length',
    severity: 'warning',
    message: failures.length === 0
      ? `All subject lines ≤ ${config.maxSubjectLineLength} characters`
      : `${failures.length} commit(s) have subject lines that are too long`,
    details: failures,
    lineNumbers,
  };
}

/**
 * CHECK 4: JIRA Key Validation
 * Validates that smart commits contain valid JIRA keys
 */
function checkJiraKeyFormat(
  commits: CommitData[],
  config: PRReviewConfig
): ReviewResult {
  const failures: string[] = [];
  const lineNumbers: number[] = [];

  commits.forEach((commit, index) => {
    const parsed = parseCommitMessage(commit.message);
    if (parsed.smartCommit) {
      const jiraKey = extractJiraKey(parsed.smartCommit);
      if (!jiraKey) {
        failures.push(
          `Commit ${commit.hash.substring(0, 7)}: Invalid JIRA key format in "${parsed.smartCommit}"`
        );
        lineNumbers.push(index + 1);
      }
    }
  });

  return {
    passed: failures.length === 0,
    checkName: '✓ JIRA Key Format',
    severity: 'error',
    message: failures.length === 0
      ? 'All smart commits have valid JIRA key format (e.g., RR-101)'
      : `${failures.length} commit(s) have invalid JIRA keys`,
    details: failures,
    lineNumbers,
  };
}

/**
 * CHECK 5: Time Logging
 * Validates that commits include time logging (#time)
 */
function checkTimeLogging(
  commits: CommitData[],
  config: PRReviewConfig
): ReviewResult {
  const failures: string[] = [];
  const lineNumbers: number[] = [];

  commits.forEach((commit, index) => {
    const parsed = parseCommitMessage(commit.message);
    if (parsed.smartCommit && !parsed.smartCommit.includes('#time')) {
      failures.push(
        `Commit ${commit.hash.substring(0, 7)}: Missing time tracking (#time format)`
      );
      lineNumbers.push(index + 1);
    }
  });

  return {
    passed: failures.length === 0,
    checkName: '✓ Time Tracking',
    severity: 'warning',
    message: failures.length === 0
      ? 'All commits include time tracking'
      : `${failures.length} commit(s) missing time tracking`,
    details: failures,
    lineNumbers,
  };
}

/**
 * CHECK 6: Commit Message Tense
 * Warns if commit messages use past tense in subject (should be imperative)
 */
function checkCommitTense(
  commits: CommitData[],
  config: PRReviewConfig
): ReviewResult {
  const warnings: string[] = [];
  const lineNumbers: number[] = [];

  const pastTensePatterns = [
    /^(added|fixed|updated|changed|removed|created|implemented|resolved)/i,
  ];

  commits.forEach((commit, index) => {
    const parsed = parseCommitMessage(commit.message);
    const description = parsed.description.toLowerCase();
    
    for (const pattern of pastTensePatterns) {
      if (pattern.test(description)) {
        warnings.push(
          `Commit ${commit.hash.substring(0, 7)}: Use imperative mood, not past tense in subject`
        );
        lineNumbers.push(index + 1);
        break;
      }
    }
  });

  return {
    passed: warnings.length === 0,
    checkName: '✓ Commit Message Tense',
    severity: 'warning',
    message: warnings.length === 0
      ? 'All commits use imperative mood (present tense)'
      : `${warnings.length} commit(s) may use past tense`,
    details: warnings,
    lineNumbers,
  };
}

/**
 * CHECK 7: Commit Frequency
 * Warns if too many commits (suggests commits are too granular or too frequent)
 */
function checkCommitFrequency(
  commits: CommitData[],
  config: PRReviewConfig
): ReviewResult {
  const warnings: string[] = [];

  // Warn if more than 10 commits
  if (config.warnOnBatchCommits && commits.length > 10) {
    warnings.push(
      `PR contains ${commits.length} commits. Consider consolidating related changes.`
    );
  }

  return {
    passed: warnings.length === 0,
    checkName: '✓ Commit Frequency',
    severity: 'info',
    message: warnings.length === 0
      ? `Commit frequency is reasonable (${commits.length} commit(s))`
      : `Commit frequency warning`,
    details: warnings,
  };
}

/**
 * CHECK 8: Related Changes
 * Warns if a single commit mixes feature and bugfix changes
 */
function checkRelatedChanges(
  commits: CommitData[],
  config: PRReviewConfig
): ReviewResult {
  const warnings: string[] = [];
  const lineNumbers: number[] = [];

  commits.forEach((commit, index) => {
    const parsed = parseCommitMessage(commit.message);
    const bodyAndDesc = `${parsed.description} ${parsed.body}`.toLowerCase();
    
    // Check for mixed concerns
    if (
      (bodyAndDesc.includes('feature') && bodyAndDesc.includes('bugfix')) ||
      (bodyAndDesc.includes('and') && bodyAndDesc.split('and').length > 2)
    ) {
      warnings.push(
        `Commit ${commit.hash.substring(0, 7)}: Appears to mix multiple concerns`
      );
      lineNumbers.push(index + 1);
    }
  });

  return {
    passed: warnings.length === 0,
    checkName: '✓ Related Changes',
    severity: 'warning',
    message: warnings.length === 0
      ? 'All commits contain related changes'
      : `${warnings.length} commit(s) may mix unrelated changes`,
    details: warnings,
    lineNumbers,
  };
}

/**
 * CHECK 9: Branch Naming Convention
 * Validates branch name follows [type]/[JIRA]-[description] format
 */
function checkBranchNaming(config: PRReviewConfig): ReviewResult {
  try {
    const branch = executeCommand('git rev-parse --abbrev-ref HEAD');
    const validPattern = /^(feature|bugfix|hotfix)\/[A-Z]+-\d+-[\w-]+$/;
    
    const passed = validPattern.test(branch);

    return {
      passed,
      checkName: '✓ Branch Naming Convention',
      severity: 'warning',
      message: passed
        ? `Branch name follows convention: ${branch}`
        : `Branch name does not follow [type]/[JIRA]-[description] format: ${branch}`,
      details: passed ? [] : [`Current branch: ${branch}`],
    };
  } catch {
    return {
      passed: true,
      checkName: '✓ Branch Naming Convention',
      severity: 'info',
      message: 'Could not validate branch name (not in git repo)',
      details: [],
    };
  }
}

/**
 * CHECK 10: Empty Commits
 * Warns about empty or whitespace-only commits
 */
function checkEmptyCommits(
  commits: CommitData[],
  config: PRReviewConfig
): ReviewResult {
  const warnings: string[] = [];
  const lineNumbers: number[] = [];

  commits.forEach((commit, index) => {
    if (!commit.message || commit.message.trim().length < 5) {
      warnings.push(
        `Commit ${commit.hash.substring(0, 7)}: Message is too short or empty`
      );
      lineNumbers.push(index + 1);
    }
  });

  return {
    passed: warnings.length === 0,
    checkName: '✓ Meaningful Commit Messages',
    severity: 'error',
    message: warnings.length === 0
      ? 'All commits have meaningful messages'
      : `${warnings.length} commit(s) have empty or too-short messages`,
    details: warnings,
    lineNumbers,
  };
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate formatted report
 */
function generateReport(
  prNumber: string,
  results: ReviewResult[]
): ReviewReport {
  const passedChecks = results.filter(r => r.passed).length;
  const failedChecks = results.filter(r => r.severity === 'error' && !r.passed).length;
  const warnings = results.filter(r => r.severity === 'warning' && !r.passed).length;

  let summary = '';
  if (failedChecks === 0 && warnings === 0) {
    summary = '✅ All checks passed!';
  } else if (failedChecks === 0) {
    summary = `⚠️  Passed with ${warnings} warning(s)`;
  } else {
    summary = `❌ ${failedChecks} error(s), ${warnings} warning(s)`;
  }

  return {
    prNumber,
    timestamp: new Date().toISOString(),
    totalChecks: results.length,
    passedChecks,
    failedChecks,
    warnings,
    results,
    summary,
  };
}

/**
 * Print formatted review report
 */
function printReport(report: ReviewReport): void {
  console.log('\n');
  console.log('═'.repeat(80));
  console.log(`  PR REVIEW REPORT - PR #${report.prNumber}`);
  console.log('═'.repeat(80));
  console.log();

  for (const result of report.results) {
    const icon =
      result.severity === 'error'
        ? '❌'
        : result.severity === 'warning'
          ? '⚠️ '
          : 'ℹ️ ';

    console.log(`${icon} ${result.checkName}`);
    console.log(`   ${result.message}`);

    if (result.details && result.details.length > 0) {
      result.details.forEach(detail => {
        console.log(`     • ${detail}`);
      });
    }
    console.log();
  }

  console.log('─'.repeat(80));
  console.log(`Summary: ${report.summary}`);
  console.log(
    `Total: ${report.passedChecks}/${report.totalChecks} checks passed`
  );
  console.log('─'.repeat(80));
  console.log();
}

/**
 * Export report as JSON
 */
function exportReport(report: ReviewReport, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`✓ Report exported to: ${outputPath}`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function reviewPullRequest(
  prNumber: string,
  options: { export?: string; config?: string } = {}
): Promise<ReviewReport> {
  console.log(`\n🔍 Reviewing PR #${prNumber}...\n`);

  // Load config
  let config = DEFAULT_CONFIG;
  if (options.config && fs.existsSync(options.config)) {
    const customConfig = JSON.parse(fs.readFileSync(options.config, 'utf-8'));
    config = { ...config, ...customConfig };
  }

  // Get commits
  const commits = getCommitsFromPR(prNumber);
  if (commits.length === 0) {
    console.warn('⚠️  No commits found. Ensure PR branch is checked out.');
    return {
      prNumber,
      timestamp: new Date().toISOString(),
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      warnings: 0,
      results: [],
      summary: 'No commits to review',
    };
  }

  console.log(`📊 Found ${commits.length} commit(s) to review\n`);

  // Run all checks
  const results: ReviewResult[] = [
    checkSmartCommitFormat(commits, config),
    checkCommitMessageStructure(commits, config),
    checkSubjectLineLength(commits, config),
    checkJiraKeyFormat(commits, config),
    checkTimeLogging(commits, config),
    checkCommitTense(commits, config),
    checkCommitFrequency(commits, config),
    checkRelatedChanges(commits, config),
    checkBranchNaming(config),
    checkEmptyCommits(commits, config),
  ];

  // Generate report
  const report = generateReport(prNumber, results);

  // Print report
  printReport(report);

  // Export if requested
  if (options.export) {
    exportReport(report, options.export);
  }

  return report;
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

const args = process.argv.slice(2);
const prNumber = args[0];

if (!prNumber) {
  console.error('Usage: claude pr-review <pr-number> [--export <path>] [--config <path>]');
  process.exit(1);
}

const exportPath = args.includes('--export') ? args[args.indexOf('--export') + 1] : undefined;
const configPath = args.includes('--config') ? args[args.indexOf('--config') + 1] : undefined;

reviewPullRequest(prNumber, { export: exportPath, config: configPath }).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
