# JTS Styles release QA checklist

Use this checklist only after the Vercel production deployment points to the intended `main` commit and is READY.

## Customer experience
- [ ] Homepage contains no direct WhatsApp link or displayed business phone number.
- [ ] Service and mobile booking CTAs open `/order`.
- [ ] Submit an appointment request; confirmation clearly says the request is not yet a confirmed appointment.
- [ ] No WhatsApp or phone-call redirect appears after submission.
- [ ] Booking history remains available at `/account`.
- [ ] Install prompt works in Chrome; verify iPhone/Safari separately.
- [ ] The recurring “JTS Styles update ready” manual refresh banner no longer appears on repeat launches.

## JTS Operations admin
- [ ] `/admin` displays JTS Operations / JTS Styles branding, not BOEMO Kitchen.
- [ ] Authorized admin can sign in.
- [ ] Appointment requests load and status changes persist after reload.
- [ ] Customer reviews load and publish/hide actions persist.
- [ ] Public `/feed` reflects only reviews that are published.

## Important
A successful code build does not prove Firebase permissions or live customer/admin flows. Confirm these against the deployed production version before accepting release QA.
