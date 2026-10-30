# Contributing to Oratii

First off — thank you for taking the time to contribute! 🎉

Oratii is an open-source, AI-powered communication coach. Whether you're fixing a bug, adding a feature, improving docs, or just sharing feedback — every contribution matters.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Guidelines](#pull-request-guidelines)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this standard. Please report unacceptable behavior to `support@oratii.in`.

---

## How Can I Contribute?

### 🐛 Reporting Bugs
1. Check [existing issues](https://github.com/gazi82749-wq/oratii/issues) first to avoid duplicates.
2. Open a new issue using the **Bug Report** template.
3. Include: steps to reproduce, expected behavior, actual behavior, screenshots if applicable.

### ✨ Suggesting Features
1. Open an issue using the **Feature Request** template.
2. Describe the problem you're solving and your proposed solution.

### 📖 Improving Docs
- Fix typos, improve clarity, add examples — all welcome via PR.

### 💻 Writing Code
- Check the [Roadmap](README.md#-roadmap) for planned features.
- Comment on an existing issue or open a new one before starting large changes.

---

## Getting Started

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/oratii.git
cd oratii

# 3. Install dependencies
npm install

# 4. Copy environment variables
cp .env.example .env.local
# Fill in your API keys

# 5. Start the dev server
npm run dev
```

> **📖 Read [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) before making any changes** — it contains the full architecture, API routes, database schema, and AI waterfall design.

---

## Development Workflow

```bash
# Create a feature branch from main
git checkout -b feat/your-feature-name

# Make your changes...

# Run tests & lint before committing
npm test
npm run lint

# Commit with conventional commits (see below)
git commit -m "feat: add X feature to speech coach"

# Push and open a PR
git push origin feat/your-feature-name
```

---

## Commit Convention

We use **Conventional Commits**:

| Prefix | When to Use |
|:---|:---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructure, no feature/fix |
| `test:` | Adding or fixing tests |
| `chore:` | Build, deps, tooling |

Examples:
```
feat: add Hindi language support to speech coach
fix: resolve WPM counter freeze on Safari
docs: update environment variables guide
```

---

## Pull Request Guidelines

1. **One PR per feature/fix** — keep it focused.
2. **Link the issue** your PR addresses (`Closes #123`).
3. **Write a clear description** of what changed and why.
4. **Add tests** if you're adding new logic.
5. **Screenshots** for any UI changes.
6. Your PR will be reviewed within **48 hours**.

---

Thank you for making Oratii better! ⭐

Built with ❤️ — [oratii.in](https://oratii.in)
