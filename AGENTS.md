# JOHN THE STYLIST BW — Agent Operating Contract

## Product
John The Stylist Bw is a real customer-facing appointment PWA for a hairstylist/barber business in G West, Gaborone. It is a real customer-facing demo operation for John The Stylist Bw while the business prepares its paid live launch. It is not generic SaaS.

Business:
- John The Stylist Bw
- G West shops, upstairs at Star Tattoos parlor and boutique, inside the salon with the purple door labelled “miss Emma”
- Hours: 08:00–18:00
- Phone/WhatsApp: +267 78 053 564
- Appointment requests must be made at least one day in advance.
- A 50% deposit is required to secure an appointment.
- Deposit method: Orange Money 75720306
- Account name: John SHUMBA

## Roles
- Product owner / final reviewer: user
- Technical navigator + implementation: ChatGPT through repository tooling
- GitHub is the source of truth

## Workflow
START → INSPECT → BUILD → VERIFY → CHECKPOINT → CONTINUE/RECOVER.
Golden rule: **Unexpected result = STOP → inspect reality → then act.**

Before changing code:
1. Read this AGENTS.md.
2. Inspect actual repository/Git state and the relevant live/deployed state when applicable.
3. Compare the requested change against current implementation and current official guidance.
4. Make the smallest controlled change that solves the actual requirement.
5. Preserve working functionality unless the user explicitly asks to replace it.

After meaningful implementation:
- verify the actual result;
- run typecheck, lint and build;
- inspect the final diff;
- commit a meaningful checkpoint;
- push the intended branch;
- report commit, changed areas and verification honestly.

## Customer-first product principle
The first customer task is not account creation. It is:
**discover a service → understand the price/expectation → choose a date/time → provide name + WhatsApp/phone → understand the 50% deposit → submit an appointment request → contact John / await confirmation.**

Do not require Google, email/password or profile setup before an appointment request.

The booking UI must clearly distinguish:
- appointment request submitted;
- deposit required;
- appointment confirmed.

Submitting a request does NOT mean the appointment is confirmed. Confirmation depends on John confirming the requested slot and receiving the required deposit.

## First-flow UX rules
The customer experience should be mobile-first and deliberately low-friction:
- show the primary booking action early;
- keep the initial choice set small and understandable;
- use progressive disclosure for secondary information;
- show prices before asking for personal information;
- use labels above fields rather than relying on placeholders;
- group related fields;
- keep important payment/deposit information visible near the commitment point;
- preserve entered information when correcting errors;
- use specific, local error messages;
- never force account creation merely to request an appointment;
- do not hide the primary booking CTA below secondary navigation on mobile;
- keep touch targets comfortable and keyboard-friendly.

Research basis:
- Nielsen Norman Group progressive disclosure and cognitive-load/form guidance.
- Baymard mobile checkout research: reduce unnecessary account creation, make required information visible, keep order/price context available and make errors recoverable.
- NN/g error guidance: place actionable errors near their source and prevent errors where possible.

## Current supplied services/prices
Bookable catalogue currently supplied by the business:
- Pixie Cut: BWP 350–400
- Cut + Pixie Cut: BWP 200
- Pure White (Bleach/Color): BWP 300
- Cut + Bleach: BWP 250

Other supplied specialties:
- precision cuts
- hair tinting
- bobs
- pixie cuts
- hair coloring
- bleaching
- fades
- special-event styles

Do not invent prices for services where the owner has not supplied a price. Those can be presented as enquire/ask rather than silently made bookable.

## Deposit/payment
The customer is instructed to pay the 50% deposit through Orange Money:
- 75720306
- John SHUMBA

The application must not claim that payment was received merely because the customer submitted the form. Payment confirmation remains a business/admin responsibility until a verified payment workflow is implemented.

If a deposit is shown for a price range, show the range or make clear the displayed amount is based on the selected supplied price. Do not fabricate an exact final price for an unpriced service.

## Location/trust information
Keep the supplied location wording intact unless the owner changes it:
“G West shops, Star Tattoos parlor and boutique upstairs, inside the salon with a purple door labelled ‘miss Emma’.”

The app should expose:
- business name;
- service categories;
- hours;
- phone/WhatsApp;
- location instructions;
- deposit requirement;
- Orange Money number/account name;
- clear request-vs-confirmation language.

Do not invent testimonials, guarantees, availability, reviews, cancellation policy, refund policy, exact slot availability, or payment receipts.

## Firebase
Dedicated Firebase project:
- projectId: stylist-36204
- authDomain: stylist-36204.firebaseapp.com
- storageBucket: stylist-36204.firebasestorage.app
- messagingSenderId: 622468889009
- appId: 1:622468889009:web:0579e49d766c6e81a1a590
- measurementId: G-5LDNFHCC53

Firebase browser configuration belongs in NEXT_PUBLIC_FIREBASE_* environment variables. Public Firebase client configuration is not a server secret.

Never commit Firebase Admin service-account JSON, private keys, or other server credentials. If server-side Admin credentials are needed, they must be provided/configured separately in Vercel/Firebase/GitHub secrets.

The production base URL is intended to be:
https://john-the-stylist-bw.vercel.app

## Authentication
Anonymous Firebase Auth may be used under the hood so a guest booking has a private customer UID. This is an implementation detail, not a customer sign-in requirement.

Google account connection can later become an optional upgrade for:
- booking history;
- saved details;
- repeat booking;
- private customer communication.

Never make Google connection a prerequisite for the first booking.

## Booking data architecture
The current repository was cloned from a proven BOEMO operating foundation. During the transition, preserve its Firestore security boundary and guest-auth mechanism while refactoring the domain from food orders into appointment requests.

Do not weaken Firestore rules to make the new UI work.

The target domain model should eventually represent:
- appointments/booking requests;
- services and owner-controlled prices;
- customer profile;
- deposit/payment status;
- appointment status;
- private customer conversations;
- admin availability/operating settings.

Until that refactor is complete, compatibility code must be treated as transitional and clearly documented.

## Appointment states
Preferred business state model:
Requested → Deposit pending → Confirmed → In service → Completed
with Cancelled available.

Do not expose a state as confirmed unless the owner workflow has actually confirmed it.

## Admin
The admin surface is for John/authorized staff to:
- review appointment requests;
- confirm or reject requested slots;
- record deposit/payment status;
- manage services/prices;
- manage customer communication;
- manage business hours/location notes.

Do not build a generic CRM/ERP/accounting product.

Admin access must remain role-controlled by Firebase security rules. Never hard-code an admin UID.

## Customer communication
The existing private customer conversation architecture may be retained and adapted:
- customer messages are private to the customer and authorized staff;
- optional image/PDF support is useful for hairstyle references, screenshots and receipts;
- notification failure must never discard an already-saved message;
- do not weaken Storage/Firestore rules to make the UI work.

## PWA/offline
The customer app is an installable PWA and should behave like a real app across supported browsers.

Installability:
- manifest has a stable id and scope, standalone display, 192px + 512px PNG icons, shortcuts and install metadata;
- production must be served over HTTPS;
- Chromium browsers may expose the in-app install prompt through beforeinstallprompt;
- iOS/iPadOS Safari does not expose beforeinstallprompt, so provide truthful Share → Add to Home Screen guidance;
- service-worker shell changes require the cache version to be bumped;
- app updates must support a waiting worker and an explicit refresh action rather than silently disrupting a customer.

Offline:
- Firebase Firestore uses persistent local cache/multi-tab persistence;
- previously established guest sessions remain available offline through Firebase Auth persistence;
- appointment writes are cached locally by Firestore and synchronize when connectivity returns;
- do not await an offline Firestore write indefinitely in the customer UI;
- save a private local booking copy so the tracking page can reopen the request on the same device;
- service worker caches the public app shell, manifest, icons and static Next assets;
- navigation uses network-first with /offline fallback;
- API calls and private admin/customer data are not blindly cached;
- a first-time visitor who has never established the guest Firebase session must reconnect once before a private backend booking can be created;
- payment cannot be claimed offline;
- live appointment status requires synchronized backend data.

Push notifications:
- /sw-jts.js is the Firebase Messaging + PWA service worker;
- it uses the dedicated stylist-36204 Firebase configuration;
- background notification clicks return to JTS customer/admin routes;
- notification failure must never invalidate a saved booking or message;
- the old BOEMO service worker is removed.

Do not reintroduce BOEMO food/kitchen/pickup language into customer-facing PWA, offline or notification surfaces.

## Media/design
Brand direction:
- black #000000 / near-black foundation;
- metallic gold/bronze;
- white;
- electric/neon blue accent;
- orange may be used for payment/service cues where useful;
- polished, modern, high-end salon/barbershop tone;
- monochrome editorial styling plus vibrant hairstyle photography when real business assets are supplied.

Do not use inherited BOEMO food assets as Stylist customer content.

The current first-flow design uses a JTS monogram/typographic visual treatment until the supplied production logo/hairstyle photography is mapped into the repository. Do not fake customer work with unrelated stock images.

## Accessibility and form quality
- visible labels;
- keyboard-compatible controls;
- meaningful focus states;
- text plus visual error indicators;
- no placeholder-only labels;
- clear date/time constraints;
- no color-only status communication;
- accessible button names;
- mobile-first layouts;
- preserve input during validation errors.

## Security/data integrity
- Never expose customer profiles publicly.
- Customer reads must remain scoped to the authenticated customer UID.
- Never treat client-submitted price/payment fields as authoritative financial proof.
- Never make an appointment confirmed merely because a customer submitted a form.
- Never weaken Firestore/Storage rules to hide application errors.
- Never commit private credentials.

## Verification
Before a meaningful checkpoint:
- npx tsc --noEmit
- npm run lint
- npm run build

Also verify the actual customer flow:
1. landing page;
2. service selection;
3. date constrained to at least tomorrow;
4. time constrained to 08:00–18:00;
5. name + WhatsApp/phone;
6. optional desired-style note;
7. 50% deposit calculation/display;
8. appointment request submission;
9. confirmation wording;
10. contact/next-step action;
11. account/order history remains private.

## Recovery
If an unexpected result appears:
**STOP → inspect reality → compare against the last known-good checkpoint → repair the smallest necessary layer → verify again.**

Do not rebuild the foundation merely because the product domain is changing. Reuse proven authentication, Firestore, PWA, customer communication and deployment patterns while replacing the business semantics carefully.


### Install UX checkpoint
- The customer-facing install action is a normal JTS header control, not a fixed floating button that can cover content or compete with booking actions.
- Chromium installation uses one retained `beforeinstallprompt` event and calls `prompt()` directly from the explicit Install app button user gesture; the consumed event is cleared and `appinstalled` removes the control.
- iPhone/iPad Safari does not receive a fake native prompt; the Install app control opens concise Share → Add to Home Screen guidance.
- Unsupported browsers do not receive a dead install control.


### Install recovery checkpoint
- `public/sw-jts.js` cache version is `jts-shell-v4` and its navigation handler must keep the response callback async because it awaits cache writes.
- The install control remains visible on mobile browsers even before `beforeinstallprompt` arrives; when no native prompt is available it gives browser-specific truthful installation guidance instead of disappearing.
- iOS installation guidance applies to iOS browsers generally: Share → Add to Home Screen; Chromium-based Android browsers use the native retained prompt when `beforeinstallprompt` is available.
- Do not hide the mobile install control merely because the browser has not yet delivered `beforeinstallprompt`.
