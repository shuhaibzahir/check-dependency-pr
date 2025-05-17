# 🔗 Check Dependency PR

This GitHub Action checks if a linked dependency pull request (in the body of a PR) is open, merged, or closed and updates the PR body accordingly.

## Inputs

| Name | Required | Description |
|------|----------|-------------|
| `github-token` | ✅ | GitHub token for current repo |
| `user-token` | ❌ | Personal token for accessing private dependency PRs |

## Example

```yaml
- uses: your-username/check-dependency-pr@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    user-token: ${{ secrets.USER_GITHUB_TOKEN }}
