# Contribution Guidelines

## Reporting issues

- **Search for existing issues.** Please check to see if someone else has reported the same issue.
- **Share as much information as possible.** Please include your device model and OS version. Also, include steps to reproduce the bug.

## Code Style for Patches

### JavaScript

JS files must pass ESLint using the provided [.eslintrc](https://github.com/mozilla/webmaker-core/blob/develop/.eslintrc) settings.

Run `npm test` before pushing a commit. It will validate your JS.

#### Variable Naming

- `lowerCamelCase` General variables
- `UPPER_CASE` Constants

### HTML / JSX

- 2 space indentation
- Class names use hypenated case (e.g, `my-class-name`)

### LESS / CSS

- 2 space indentation
- Always a space after a property's colon (e.g, `display: block;` and not `display:block;`)
- End all lines with a semi-colon
- For multiple, comma-separated selectors, place each selector on it's own line

## Testing

Please test your patch on an Android device if possible. If you don't have access to a physical device you can test using an Android emulator instead.

## Pull Requests

- After opening your PR, add the `PR Needs Review` tag. One of our core contributors will then review your patch and either merge it or request further changes (also indicated by the `PR Needs Work` tag). If you are a core contributor, you may merge your own patch once it has passed peer review.
- If possible, [squash your commits](http://davidwalsh.name/squash-commits-git).
- Try to share which devices your code has been tested on when submitting a pull request.
