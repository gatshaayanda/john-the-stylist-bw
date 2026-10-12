# Production deployment verification

Use this checklist after a change is pushed to `main`.

1. Confirm the latest commit on GitHub `main`.
2. In Vercel, find a production deployment whose source commit is that SHA or a later commit containing it.
3. Wait for the deployment state to become `READY`.
4. If no deployment is created after a push, inspect the project's Git connection and production-branch settings before retrying.
5. Do not treat a redeploy of an older commit as proof that the latest `main` is live.

## JTS native install verification

1. Test the production URL in desktop Chrome or Edge, not inside WhatsApp's embedded browser.
2. Confirm the PWA manifest and service worker load successfully and the browser considers the app installable.
3. Click **Install JTS Styles** once. When `beforeinstallprompt` is available, the click must open the browser's native install prompt directly rather than the help panel.
4. If the native prompt is unavailable, inspect the browser's installability diagnostics and captured-event state; do not call the fallback panel a successful native-install test.
5. Repeat from a fresh browser session after deployment to rule out a stale page or service worker.

A deployment is verified as synced only when its production source SHA matches the intended `main` revision and its state is `READY`. An install fix is verified only after the live browser behavior is tested as well.