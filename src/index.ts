import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    const defaultToken = core.getInput('github-token', { required: true });
    const userToken = core.getInput('user-token');

    const octokit = github.getOctokit(userToken || defaultToken);
    const context = github.context;

    if (!context.payload.pull_request) {
      core.setFailed('No pull request context found.');
      return;
    }

    const prNumber = context.payload.pull_request.number;
    const body = context.payload.pull_request.body || '';

    const regex = /(https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+)/;
    const match = body.match(regex);

    if (!match) {
      core.info('No dependency PR found.');
      return;
    }

    const depPrUrl = match[1];
    const parts = depPrUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    if (!parts) {
      core.setFailed('Dependency PR URL format is invalid.');
      return;
    }

    const [, depOwner, depRepo, depPrNumber] = parts;

    const depPr = await octokit.rest.pulls.get({
      owner: depOwner,
      repo: depRepo,
      pull_number: parseInt(depPrNumber, 10)
    });

    const status = depPr.data.merged
      ? '✅ Merged'
      : depPr.data.state === 'closed'
        ? '❌ Closed'
        : '🕐 Open';

    const statusBlock = `### 🔗 Dependency PR Status\n- **Link**: [#${depPrNumber}](${depPrUrl})\n- **Status**: ${status}`;
    const statusRegex = /### 🔗 Dependency PR Status[\s\S]*?(?=\n###|$)/;
    const updatedBody = statusRegex.test(body)
      ? body.replace(statusRegex, statusBlock)
      : `${body.trim()}\n\n${statusBlock}`;

    await octokit.rest.pulls.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
      body: updatedBody
    });

    core.info('PR body updated successfully.');
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
