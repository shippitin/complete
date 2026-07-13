# Security Audit — Shippitin Frontend

**Date:** 2026-07-13  
**Scope:** `/complete` — full frontend codebase

---

## CRITICAL

### 1. Hardcoded Firebase credentials in source code

**File:** `src/firebase/firebaseConfig.ts`

```ts
apiKey: 'AIzaSyD4kOUGRE9JT2dKRSrBYacCNc8towIfIzo',
authDomain: 'shippitin-7be0f.firebaseapp.com',
projectId: 'shippitin-7be0f',
appId: '1:887744065570:web:6cc435ccd12a18bd965a7b',
measurementId: 'G-2N62FXPHWV',
```

Real credentials committed to source and bundled verbatim into production JS. Anyone who downloads the app JS gets full Firebase project access.

**Fix:**
1. Rotate the API key immediately in the Firebase console.
2. Move all values to `VITE_FIREBASE_*` env vars.
3. Add `.env` to `.gitignore` (it is listed but credentials are in source, not `.env`).

---

## HIGH

### 2. JWT and user object stored in `localStorage` — XSS theft vector

**Files:** `src/services/api.ts:14`, `src/services/fetchBookings.ts:6`

`shippitin_token`, `shippitin_refresh_token`, and `shippitin_user` all stored in `localStorage`. Any XSS on any page steals the session permanently — tokens persist across tabs and page reloads.

**Fix:** Use `httpOnly; Secure; SameSite=Strict` cookies for auth tokens. `localStorage` is readable by any JavaScript on the page.

---

### 3. `ProtectedRoute` bypassed by setting any string in localStorage

**File:** `src/components/ProtectedRoute.tsx:9`

```ts
const token = localStorage.getItem('shippitin_token');
if (!token) return <Navigate to="/login" />;
```

Presence check only — no signature or expiry validation. Running `localStorage.setItem('shippitin_token', 'x')` in devtools grants full frontend access to all protected routes including `/admin`, `/payment`, `/my-bookings`.

**Fix:** Validate the token on the backend for every API call (already done). For the frontend guard, at minimum verify the token is a structurally valid JWT and not expired before rendering the route.

---

### 4. Admin authorization is client-side; role is user-controlled

**Files:** `src/pages/AdminPage.tsx` (useEffect), `src/pages/SignupPage.tsx:~240`

Admin check reads role from localStorage:
```ts
const user = JSON.parse(localStorage.getItem('shippitin_user') || '{}');
if (user.role !== 'admin') { navigate('/'); return; }
```

The `role` field is set entirely client-side at signup — `const enrichedUser = { ...user, role, ... }` where `role` is the locally-selected value, never sent to the backend. Any user can run:
```js
const u = JSON.parse(localStorage.getItem('shippitin_user'));
u.role = 'admin';
localStorage.setItem('shippitin_user', JSON.stringify(u));
```
…and reload to access the admin panel. Backend API calls may still reject them if the backend enforces role — but that must be verified.

**Fix:**
- Backend must persist role on registration and return it in the JWT/user response.
- Frontend reads role from the JWT payload (decoded client-side) or from `/auth/me` — never from a localStorage field the user set themselves.
- Backend must enforce `role === 'admin'` on every `/admin/*` endpoint.

---

### 5. XSS via `innerHTML` with API-sourced location data

**File:** `src/components/Map.tsx:143, 154`

```ts
d.innerHTML = this.html;        // LabelOverlay.onAdd
this.div.innerHTML = html;      // LabelOverlay.update
```

`html` is built from `statusTimeline[].location` — data from the backend API. If any API response contains `<img src=x onerror=alert(1)>` in a location name, it executes in the browser.

**Fix:** Use `textContent` instead of `innerHTML` for plain-text labels, or sanitize with `DOMPurify.sanitize()` before assignment.

---

### 6. XSS via `document.write` with unescaped booking data

**Files:** `src/pages/BookingConfirmationPage.tsx:207`, `src/pages/ShipmentDetailPage.tsx:142`

```ts
win.document.write(buildInvoiceHTML(bookingDetails));  // BookingConfirmationPage
w.document.write(buildDocHTML(kind, b));               // ShipmentDetailPage
```

`buildInvoiceHTML` and `buildDocHTML` interpolate `sender_name`, `receiver_name`, `sender_email`, `gstin`, and address fields directly into HTML template strings without HTML-escaping. A compromised or malicious API response with `<script>` in any of those fields executes in the print window.

**Fix:** HTML-escape all interpolated values before insertion. Minimal helper:
```ts
const esc = (s: any) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
```
Apply `esc()` to every `${field}` interpolation inside the HTML builder functions.

---

## MEDIUM

### 7. No Content-Security-Policy

**File:** `index.html`

No CSP `<meta>` tag present. Without CSP, any successful XSS (issues #5, #6) can load external scripts, exfiltrate data, or perform actions as the authenticated user with no browser-level mitigation.

**Fix:** Add a strict CSP meta tag:
```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' https://checkout.razorpay.com https://maps.googleapis.com; object-src 'none'; base-uri 'self';">
```
Tune to match actual third-party script sources (Razorpay, Google Maps, Firebase).

---

### 8. Payment status tracked in `localStorage` — client-manipulable

**Files:** `src/pages/BookingHistoryPage.tsx:113`, `src/pages/PaymentPage.tsx:~75`

```ts
// PaymentPage — written after Razorpay success callback
done[bookingNumber] = true;
localStorage.setItem('bookingPaymentDone', JSON.stringify(done));
```

Any user can set `bookingPaymentDone` to mark any booking as paid. The UI shows "Payment done" badge based on this flag. While cosmetic, it misrepresents payment state and could cause operational errors.

**Fix:** Payment status must be authoritative from the backend. Poll `/payments/status/:bookingId` and render from API response, not localStorage.

---

### 9. Booking status and detail overrides entirely client-side

**File:** `src/pages/BookingHistoryPage.tsx:94–107`

`bookingStatusOverrides` and `bookingDetailOverrides` in localStorage allow any user to set their bookings to arbitrary statuses (Delivered, In Transit, Cancelled) and override sender/receiver/cargo details. The code comments acknowledge this is "for demo."

**Fix:** Remove before production. Status must come from backend. If a real "cancel" flow is needed, implement a `PATCH /bookings/:id/cancel` endpoint.

---

### 10. Gemini API key pattern in frontend — will leak if key filled in

**File:** `src/components/VoiceAssistant.tsx:184–185`

```ts
const apiKey = "";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
```

Currently empty so calls fail. The pattern is a production incident waiting to happen — adding a real key here exposes it publicly in the JS bundle.

**Fix:** Move AI API calls to a backend proxy endpoint (`POST /api/ai/voice`). The frontend sends the transcript; the backend holds the API key and calls Gemini.

---

### 11. `razorpay` server SDK listed as frontend dependency

**File:** `package.json`

```json
"razorpay": "^2.9.6"
```

This is a Node.js server SDK (`http`, `crypto` dependencies) — not designed for browser use. The frontend correctly uses the Razorpay `checkout.js` CDN script; this package is incorrect here. It may bundle non-browser code into the app and exposes the intent of server-side Razorpay usage.

**Fix:** Remove from `package.json`. Install only on the backend.

---

## LOW

### 12. Duplicate Firebase config — one real, one placeholder

**Files:** `src/firebase/firebaseConfig.ts` (real credentials), `src/types/firebase.ts` (placeholder `"..."` values but still calls `initializeApp`)

Two separate Firebase initializations create risk of the wrong config being used after refactoring. The placeholder file also calls `initializeApp` with invalid values which will throw at runtime if imported.

**Fix:** Delete `src/types/firebase.ts`. Single source of truth: `src/firebase/firebaseConfig.ts`.

---

### 13. `signInWithCustomToken` from undeclared global variable

**File:** `src/App.tsx:83, 161–162`

```ts
declare const __initial_auth_token: string | undefined;
// ...
if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
  await signInWithCustomToken(auth, __initial_auth_token);
}
```

If any third-party script or SSR harness injects `window.__initial_auth_token`, the app auto-signs into Firebase as any UID without user interaction.

**Fix:** Verify this mechanism is intentional and document the trusted injection source. If unused, remove it entirely.

---

### 14. `ErrorBoundary` exposes raw `error.message` in the UI

**File:** `src/components/ErrorBoundary.tsx:49`

```tsx
{this.state.error.message}
```

Internal error messages (file paths, API details, stack fragments) may be exposed to end users.

**Fix:** Show a generic user-facing message. Send the real error to an observability service (Sentry, etc.) on the server side only.

---

### 15. Password minimum only 6 characters

**File:** `src/pages/SignupPage.tsx:196`

```ts
if (formData.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
```

Insufficient for a financial/logistics platform handling payment flows and PII.

**Fix:** Enforce minimum 8–12 characters plus at least one number and one special character, both client- and server-side.

---

### 16. Shipment PII in URL query params

**File:** `src/pages/TrackPage.tsx:289–292`

```ts
const idFromUrl     = searchParams.get('id')     || '';
const originFromUrl = searchParams.get('origin') || '';
const destFromUrl   = searchParams.get('dest')   || '';
const typeFromUrl   = searchParams.get('type')   || '';
```

Shipment ID, origin, destination, and type are stored in browser history, server access logs, and any analytics/CDN logging on the URL.

**Fix:** For public tracking, this is acceptable if IDs are non-guessable. Ensure tracking IDs are UUIDs or equivalent — not sequential integers.

---

### 17. Firestore security rules not committed to repo

No `firestore.rules`, `storage.rules`, or `firebase.json` found in the project.

If the Firebase project was initialized in test mode, all Firestore collections are publicly readable and writable by anyone with the project ID (which is now exposed — see issue #1).

**Fix:** Add `firestore.rules` to the repo with least-privilege rules. At minimum:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Summary

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | CRITICAL | `src/firebase/firebaseConfig.ts` | Real Firebase API key hardcoded in source |
| 2 | HIGH | `src/services/api.ts` | Auth tokens stored in `localStorage` |
| 3 | HIGH | `src/components/ProtectedRoute.tsx:9` | Token presence check only — bypassable |
| 4 | HIGH | `AdminPage.tsx` + `SignupPage.tsx` | Role set client-side; admin gate bypassable |
| 5 | HIGH | `src/components/Map.tsx:143,154` | `innerHTML` with API data — XSS |
| 6 | HIGH | `BookingConfirmationPage.tsx:207`, `ShipmentDetailPage.tsx:142` | `document.write` with unescaped user data — XSS |
| 7 | MEDIUM | `index.html` | No Content-Security-Policy |
| 8 | MEDIUM | `BookingHistoryPage.tsx:113`, `PaymentPage.tsx` | Payment status stored in `localStorage` |
| 9 | MEDIUM | `BookingHistoryPage.tsx:94–107` | Booking status/detail overrides in `localStorage` |
| 10 | MEDIUM | `src/components/VoiceAssistant.tsx:184` | Gemini API key pattern in frontend code |
| 11 | MEDIUM | `package.json` | `razorpay` server SDK as frontend dependency |
| 12 | LOW | `src/types/firebase.ts` | Duplicate/orphan Firebase config file |
| 13 | LOW | `src/App.tsx:161` | `signInWithCustomToken` from injected global |
| 14 | LOW | `src/components/ErrorBoundary.tsx:49` | Raw `error.message` rendered to users |
| 15 | LOW | `src/pages/SignupPage.tsx:196` | Password minimum only 6 characters |
| 16 | LOW | `src/pages/TrackPage.tsx:289` | Shipment PII in URL query params |
| 17 | LOW | *(missing)* | Firestore security rules not in repo |

**Fix priority:** #1 (rotate key now) → #4 (move role to backend JWT) → #5 & #6 (XSS) → #2 & #3 (token storage) → #7 (CSP) → #8 & #9 (localStorage state).
