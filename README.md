# 🔗 Check Dependency PR

This GitHub Action checks if a linked dependency pull request (in the body of a PR) is open, merged, or closed and updates the PR body accordingly.

> **Important:**  
> The PR description **must include a line starting with `DEPENDENCY PR:`** followed by the full URL of the dependency pull request.  
>  
> Example:  
> `DEPENDENCY PR: https://github.com/owner/repo/pull/123`

## Inputs

| Name           | Required | Description                                       |
|----------------|----------|-------------------------------------------------|
| `github-token` | ✅       | GitHub token for current repo                    |
| `user-token`   | ❌       | Personal token for accessing private dependency PRs (if needed) |

## Example usage

```yaml
- uses: shuhaibzahir/check-dependency-pr@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    user-token: ${{ secrets.USER_GITHUB_TOKEN }} # optional, for private repos
