"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
async function run() {
    try {
        const defaultToken = core.getInput("github-token", { required: true });
        const userToken = core.getInput("user-token");
        const octokit = github.getOctokit(userToken || defaultToken);
        const context = github.context;
        if (!context.payload.pull_request) {
            core.setFailed("No pull request context found.");
            return;
        }
        const prNumber = context.payload.pull_request.number;
        const body = context.payload.pull_request.body || "";
        // Regex to find "DEPENDENCY PR:" followed by GitHub PR URL
        const regex = /DEPENDENCY PR:\s*(https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+)/i;
        const match = body.match(regex);
        if (!match) {
            console.log("No dependency PR found with 'DEPENDENCY PR:' prefix.");
            return;
        }
        const depPrUrl = match[1];
        // Extract owner, repo, and PR number from URL
        const parts = depPrUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
        if (!parts) {
            console.log("Dependency PR URL is malformed.");
            return;
        }
        const [, depOwner, depRepo, depPrNumber] = parts;
        const depPr = await octokit.rest.pulls.get({
            owner: depOwner,
            repo: depRepo,
            pull_number: parseInt(depPrNumber, 10),
        });
        const status = depPr.data.merged
            ? "✅ Merged"
            : depPr.data.state === "closed"
                ? "❌ Closed"
                : "🕐 Open";
        const statusBlock = `### 🔗 Dependency PR Status\n- **Link**: [#${depPrNumber}](${depPrUrl})\n- **Status**: ${status}`;
        const statusRegex = /### 🔗 Dependency PR Status[\s\S]*?(?=\n###|$)/;
        const updatedBody = statusRegex.test(body)
            ? body.replace(statusRegex, statusBlock)
            : `${body.trim()}\n\n${statusBlock}`;
        await octokit.rest.pulls.update({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: prNumber,
            body: updatedBody,
        });
        core.info("PR body updated successfully.");
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
