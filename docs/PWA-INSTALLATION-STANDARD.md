# NON-NEGOTIABLE PWA INSTALLATION STANDARD — DO NOT REGRESS

**Reference implementation:** The currently approved Africhiko PWA installation experience in `gatshaayanda/africhiko`, as verified against its actual repository state.

## 1. The rule

Reproduce the approved Africhiko installation experience in John The Stylist Bw (`gatshaayanda/john-the-stylist-bw`), changing only the brand identity, application name, icons, colours and other genuinely project-specific assets.

**The installation mechanism, behaviour, lifecycle and user experience are protected. They are not to be redesigned, rewritten, replaced, simplified, “improved”, refactored or removed unless I explicitly authorize that specific change.**

This instruction applies to every developer, AI coding agent, automated tool, dependency update and future feature implementation.

## 2. Required installation experience

- Provide a compact, branded, dismissible installation card.
- Use a clear, project-branded **Install [App Name]** action.
- On supported browsers, retain the native `beforeinstallprompt` event and invoke its native installation prompt directly from the user's click on the installation button.
- Keep the existing install function, event handling, prompt lifecycle and state management intact. Do not replace a working native prompt with an imitation modal, custom instructions screen or unrelated installation mechanism.
- Let users dismiss the card without obstructing their normal customer journey. Do not force installation, repeatedly interrupt users or introduce a permanent, intrusive installation banner.
- On iPhone and iPad, support the appropriate Safari **Share → Add to Home Screen** pathway. Do not assume Chromium's `beforeinstallprompt` event is available on iOS. Provide accurate platform-specific guidance when necessary.
- Account for mobile safe areas, responsive layouts, existing bottom navigation and other important customer actions.
- Preserve the working manifest, service-worker registration, caching, offline behaviour, metadata and installation assets. Change project identity and asset references carefully without breaking installation eligibility or existing behaviour.
- Do not introduce duplicate installation prompts, stale branding, inherited project icons, dead install buttons, JavaScript alerts or fake native prompts.
- Do not claim installation works on every browser or device without verifying the relevant platform behaviour.

## 3. Protected implementation rule

Before changing any part of the application:

1. Inspect the actual repository, current branch, latest commit, working tree and relevant project instructions.
2. Locate and understand the existing installation implementation, including the install component, CSS, manifest, metadata, icons, service worker and any platform-specific guidance.
3. Preserve the existing approved installation implementation. Treat it as protected infrastructure, not ordinary feature code.
4. Make unrelated application changes without modifying the installation implementation.
5. If a requested change genuinely requires touching protected installation files, isolate the smallest necessary change and explain the reason before proceeding. Do not make that change without my explicit authorization.
6. After authorized changes, compare the installation implementation with the approved baseline and verify that the protected behaviour has not regressed.

Do not assume that a new framework, reference repository, copied component, code-generation tool or future developer's preferences justify changing this standard.

## 4. Project identity may change; installation behaviour may not

For each new project, replace inherited identity references with the correct project identity, including:

- Application name and short name.
- Brand mark, favicon, manifest icons and Apple installation assets.
- Theme colours and branded installation-card presentation.
- Manifest metadata, page metadata and social preview assets.
- Service-worker cache namespaces and application-specific asset paths.
- Any inherited names, icons, routes or copy from the source project.

Do not copy another client's branding or infrastructure. Do not change protected installation logic merely to accommodate new branding.

## 5. Verification and reporting

Verify the actual code and run the relevant checks. Where feasible, test the production build and installation eligibility in supported Chromium browsers, plus the appropriate iOS Safari pathway.

Report separately what was changed, committed, pushed, build-verified and production-verified. Never claim that a native prompt appeared on a physical device unless that behaviour was actually tested.

## Final instruction

**Africhiko's approved installation experience is the permanent default for John The Stylist Bw and every project based on its approved foundation. Preserve it exactly in behaviour and user experience. Rebrand it for this project, leave its protected implementation alone, and make no exceptions unless I explicitly authorize otherwise.**
