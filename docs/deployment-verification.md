# Production deployment verification

Use this checklist after a change is pushed to `main`.

1. Confirm the latest commit on GitHub `main`.
2. In Vercel, find a production deployment whose source commit is that SHA or a later commit containing it.
3. Wait for the deployment state to become `READY`.
4. If no deployment is created after a push, inspect the project's Git connection and production-branch settings before retrying.
5. Do not treat a redeploy of an older commit as proof that the latest `main` is live.

A deployment is verified as synced only when its production source SHA matches the intended `main` revision and its state is `READY`.