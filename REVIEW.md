---
phase: review
reviewed: 2026-05-04T12:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - index.html
  - main.js
  - styles.css
findings:
  critical: 1
  warning: 0
  info: 0
  total: 1
status: issues_found
---

# Phase review: Code Review Report

**Reviewed:** 2026-05-04T12:00:00Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Reviewed the static website files (HTML, JS, CSS) for a personal portfolio. Found one critical security issue related to exposed API keys. No logic bugs, security vulnerabilities beyond the exposed keys, or code quality issues detected.

## Critical Issues

### CR-01: Hardcoded API keys exposed in client-side code

**File:** main.js:170-220,380
**File:** index.html:580
**Issue:** API keys for external services (GNews, NewsData, NewsAPI, Web3Forms) are hardcoded directly in the source code, making them visible to anyone viewing the page source or network requests. This allows unauthorized use of these APIs, potentially leading to rate limits, costs, or abuse.
**Fix:** Move API keys to server-side environment variables or a secure backend proxy. For client-side, use a backend API endpoint that handles the requests with keys stored securely.

---

_Reviewed: 2026-05-04T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_