# Deployment retry note

This documentation-only commit is intended to trigger a fresh production deployment after a Vercel build-rate-limit response.

Before considering the release complete, verify that the deployment for the latest `main` commit reaches Ready, then smoke-test the public landing page and `/admin`. Confirm the admin sign-in and Operations media CRUD against production before reporting them as verified.

A successful GitHub push does not by itself confirm that Vercel has deployed the new commit.