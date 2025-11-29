/**
 * Detect if we're running in a CI environment
 * Checks common CI environment variables
 */
export function isCI(): boolean {
  return !!(
    process.env.CI || // Generic CI flag (most common)
    process.env.CONTINUOUS_INTEGRATION || // Travis CI, CircleCI
    process.env.BUILD_NUMBER || // Jenkins, TeamCity
    process.env.RUN_ID || // TaskCluster, Apex
    process.env.TEAMCITY_VERSION || // TeamCity
    process.env.TF_BUILD || // Azure Pipelines
    process.env.bamboo_planKey || // Bamboo
    process.env.GITHUB_ACTIONS || // GitHub Actions
    process.env.GITLAB_CI || // GitLab CI
    process.env.CIRCLECI || // CircleCI
    process.env.JENKINS_URL || // Jenkins
    process.env.BUILDKITE || // Buildkite
    process.env.HUDSON_URL || // Hudson
    process.env.TASK_ID || // TaskCluster
    process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI || // Azure Pipelines
    process.env.TRAVIS || // Travis CI
    process.env.CODEBUILD_BUILD_ID || // AWS CodeBuild
    process.env.SEMAPHORE || // Semaphore
    process.env.SHIPPABLE || // Shippable
    process.env.APPVEYOR || // AppVeyor
    process.env.WERCKER_RUN_ID || // Wercker
    process.env.NETLIFY || // Netlify
    process.env.VERCEL || // Vercel
    process.env.NOW_BUILDER || // Vercel (legacy)
    process.env.BITBUCKET_BUILD_NUMBER || // Bitbucket Pipelines
    process.env.BITBUCKET_COMMIT || // Bitbucket Pipelines
    process.env.DRONE || // Drone CI
    process.env.GO_PIPELINE_LABEL || // GoCD
    process.env.TDDIUM || // Solano CI
    process.env.SNAP_CI || // Snap CI
    // Check if stdout is not a TTY (non-interactive)
    (!process.stdout.isTTY && process.env.TERM !== 'dumb')
  );
}

/**
 * Check if TUI mode should be enabled
 * TUI is disabled in CI environments or when explicitly disabled
 */
export function shouldUseTUI(): boolean {
  // Explicitly disabled
  if (process.env.YAMA_NO_TUI === '1' || process.env.YAMA_NO_TUI === 'true') {
    return false;
  }

  // Disabled in CI
  if (isCI()) {
    return false;
  }

  // Check if stdout is a TTY (interactive terminal)
  if (!process.stdout.isTTY) {
    return false;
  }

  // Check if TERM is set to something that supports TUI
  const term = process.env.TERM;
  if (term === 'dumb' || term === 'unknown') {
    return false;
  }

  return true;
}

/**
 * Check if we're in a non-interactive environment
 */
export function isNonInteractive(): boolean {
  return isCI() || !process.stdout.isTTY || process.env.TERM === 'dumb';
}
