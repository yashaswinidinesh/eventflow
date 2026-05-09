# Eventure — Test Cases

**Markers:** `[ ]` Not Tested &nbsp;|&nbsp; `[P]` Pass &nbsp;|&nbsp; `[F]` Fail &nbsp;|&nbsp; `[S]` Skip

---

## 1. Authentication

### 1.1 Registration

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| AUTH-01 | Register with valid name, email, password as ATTENDEE | 201, JWT tokens returned, role = ATTENDEE | `[ ]` |
| AUTH-02 | Register requesting ORGANIZER role | 201, role = ATTENDEE, OrganizerRequest created as PENDING | `[ ]` |
| AUTH-03 | Register with duplicate email | 400, "A user with this email already exists" | `[ ]` |
| AUTH-04 | Register with password < 8 characters | 400, password validation error | `[ ]` |
| AUTH-05 | Register with invalid email format | 400, email validation error | `[ ]` |
| AUTH-06 | Register with missing required fields | 400, field-level errors | `[ ]` |

### 1.2 Login

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| AUTH-07 | Login with valid email + password | 200, JWT access + refresh tokens, user profile | `[ ]` |
| AUTH-08 | Login with wrong password | 400, "Invalid email or password" | `[ ]` |
| AUTH-09 | Login with non-existent email | 400, "Invalid email or password" (no enumeration) | `[ ]` |
| AUTH-10 | Login with uppercase email (case-insensitive) | 200, login succeeds | `[ ]` |
| AUTH-11 | ATTENDEE login redirects to `/` | Redirect to discovery page | `[ ]` |
| AUTH-12 | ORGANIZER login redirects to `/dashboard` | Redirect to organizer dashboard | `[ ]` |
| AUTH-13 | ADMIN login redirects to `/admin` | Redirect to admin panel | `[ ]` |

### 1.3 Logout & Token

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| AUTH-14 | Logout with valid refresh token | 204, token blacklisted | `[ ]` |
| AUTH-15 | Logout with already-blacklisted token | 204 (idempotent) | `[ ]` |
| AUTH-16 | Access protected endpoint with expired access token | 401 | `[ ]` |
| AUTH-17 | Access token auto-refreshes using refresh token | New access token issued, request retried | `[ ]` |
| AUTH-18 | Access protected endpoint after logout | 401 | `[ ]` |

### 1.4 Password Reset

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| AUTH-19 | Forgot password with registered email | 200, reset email sent to inbox | `[ ]` |
| AUTH-20 | Forgot password with unregistered email | 200, no email sent, no enumeration | `[ ]` |
| AUTH-21 | Reset password with valid token | 200, password updated, can login with new password | `[ ]` |
| AUTH-22 | Reset password with expired token (> 3 days) | 400, "Reset token is invalid or expired" | `[ ]` |
| AUTH-23 | Reset password with malformed token | 400 | `[ ]` |
| AUTH-24 | Reset password with new password < 8 chars | 400, validation error | `[ ]` |

### 1.5 Profile

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| AUTH-25 | GET `/v1/auth/me/` while authenticated | 200, user profile with role, email, name | `[ ]` |
| AUTH-26 | GET `/v1/auth/me/` without token | 401 | `[ ]` |
| AUTH-27 | Update name and bio via PUT `/v1/auth/me/` | 200, profile updated | `[ ]` |

---

## 2. Event Discovery (Attendee)

### 2.1 Browse & Search

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| EVT-01 | Visit discovery page — see published events | List of published events shown | `[ ]` |
| EVT-02 | Search events by title keyword | Filtered results matching keyword | `[ ]` |
| EVT-03 | Filter events by category | Only events matching category shown | `[ ]` |
| EVT-04 | Search with no matching results | Empty state shown | `[ ]` |
| EVT-05 | Clear search/filter | All published events shown again | `[ ]` |
| EVT-06 | Draft / pending-review events not visible to attendees | Only PUBLISHED events in list | `[ ]` |

### 2.2 Event Detail Page

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| EVT-07 | View event detail — title, category, date visible | All event info displayed | `[ ]` |
| EVT-08 | Event description renders correctly | Description shown with whitespace preserved | `[ ]` |
| EVT-09 | Organizer name displayed | "Organized by {name}" shown | `[ ]` |
| EVT-10 | Schedule slots displayed when present | Agenda section shown with time, speaker, description | `[ ]` |
| EVT-11 | In-person event shows Google Maps embed | Map iframe visible | `[ ]` |
| EVT-12 | Online event shows "Online Event" and no map | No map, online label shown | `[ ]` |
| EVT-13 | Capacity bar reflects registered / capacity | Correct fill percentage shown | `[ ]` |
| EVT-14 | Full event shows disabled "Event Full" button | Register button disabled | `[ ]` |
| EVT-15 | "Add to Calendar" opens Google Calendar pre-filled | Google Calendar opens with event details | `[ ]` |
| EVT-16 | Logged-in user already registered sees "Already Registered — View Ticket" | Button replaced, no duplicate registration possible | `[ ]` |

---

## 3. Ticket Registration (Attendee)

### 3.1 Free Event Registration

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TKT-01 | Register for free event — select tier, click Register | Registration CONFIRMED immediately | `[ ]` |
| TKT-02 | Confirmation email received after free registration | Email arrives with event details and QR code | `[ ]` |
| TKT-03 | QR code image renders in confirmation email | QR code visible (not broken image) | `[ ]` |
| TKT-04 | Registered event appears in "My Tickets" | Ticket shown with CONFIRMED badge | `[ ]` |
| TKT-05 | Register for same event twice | 400, "You are already registered for this event" | `[ ]` |
| TKT-06 | Register for sold-out tier | 400, capacity exceeded error shown | `[ ]` |
| TKT-07 | Register without being logged in | Redirected to login | `[ ]` |

### 3.2 Cancellation

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TKT-08 | Cancel a confirmed registration | Status → CANCELLED, seat released | `[ ]` |
| TKT-09 | Cancellation email received | Email arrives confirming cancellation | `[ ]` |
| TKT-10 | Cancel already-cancelled registration | 400, "already cancelled" | `[ ]` |
| TKT-11 | After cancellation, event capacity increases by 1 | Capacity bar updates | `[ ]` |
| TKT-12 | After cancelling, can re-register for same event | New registration succeeds | `[ ]` |

### 3.3 My Tickets

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| TKT-13 | My Tickets page shows all registrations | All tickets listed with correct status badges | `[ ]` |
| TKT-14 | My Tickets shows empty state when no registrations | "No tickets yet" message | `[ ]` |
| TKT-15 | CONFIRMED tickets show green badge | Green "Confirmed" badge displayed | `[ ]` |
| TKT-16 | PENDING tickets show yellow badge | Yellow "Pending" badge displayed | `[ ]` |
| TKT-17 | CANCELLED tickets show red badge | Red "Cancelled" badge displayed | `[ ]` |

---

## 4. Organizer — Event Management

### 4.1 Create Event

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| ORG-01 | Create event with all required fields | Event created in DRAFT status | `[ ]` |
| ORG-02 | Create in-person event with venue name and address | Location saved, map shown on detail page | `[ ]` |
| ORG-03 | Create online event — venue fields hidden | Online event created, no venue required | `[ ]` |
| ORG-04 | Create event with end time before start time | Validation error shown | `[ ]` |
| ORG-05 | Create event without title | Validation error shown | `[ ]` |
| ORG-06 | Non-organizer tries to create event | Redirected or 403 | `[ ]` |
| ORG-07 | Created event appears in organizer dashboard | Event listed under "Your Events" | `[ ]` |

### 4.2 Publish & Approval Flow

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| ORG-08 | Submit DRAFT event for review | Status → PENDING_REVIEW, "Awaiting admin approval" label shown | `[ ]` |
| ORG-09 | Pending Review count on dashboard updates | Stat card increments by 1 | `[ ]` |
| ORG-10 | Admin approves event — organizer receives email | Approval email arrives in organizer inbox | `[ ]` |
| ORG-11 | Admin approves event — event becomes PUBLISHED | Event visible on discovery page | `[ ]` |
| ORG-12 | Admin rejects event — organizer receives email with reason | Rejection email with reason arrives | `[ ]` |
| ORG-13 | Admin rejects event — event returns to DRAFT | Event status = DRAFT, can be edited and resubmitted | `[ ]` |

### 4.3 Organizer Dashboard

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| ORG-14 | Dashboard shows correct Live Events count | Count matches published events | `[ ]` |
| ORG-15 | Dashboard shows correct Pending Review count | Count matches events in PENDING_REVIEW | `[ ]` |
| ORG-16 | Dashboard shows correct Total RSVPs count | Sum of confirmed registrations across all events | `[ ]` |
| ORG-17 | Attendees button shown for all non-DRAFT events | Button visible on PUBLISHED, PENDING_REVIEW, CANCELLED events | `[ ]` |
| ORG-18 | Attendees button shows registration count badge | Blue badge with count shown when registrations exist | `[ ]` |
| ORG-19 | Cancel event from dashboard | Confirmation dialog shown, event cancelled | `[ ]` |

### 4.4 Attendee Management

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| ORG-20 | Attendee list shows CONFIRMED registrations | Confirmed attendees listed | `[ ]` |
| ORG-21 | Attendee list shows PENDING registrations | Pending attendees visible (not hidden) | `[ ]` |
| ORG-22 | Registration fill bar shows confirmed count only | Bar and count based on CONFIRMED only | `[ ]` |
| ORG-23 | Search attendees by name | Filtered results shown | `[ ]` |
| ORG-24 | Search attendees by email | Filtered results shown | `[ ]` |
| ORG-25 | Export CSV downloads file | CSV file downloaded with attendee data | `[ ]` |
| ORG-26 | CSV export only includes CONFIRMED attendees | Pending/Cancelled not in CSV | `[ ]` |
| ORG-27 | Export CSV on event with no confirmed attendees | CSV file with header row only | `[ ]` |

---

## 5. Admin Panel

### 5.1 Event Moderation

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| ADM-01 | Admin sees pending events in review queue | PENDING_REVIEW events listed | `[ ]` |
| ADM-02 | Admin approves a pending event | Status → PUBLISHED, approval email sent | `[ ]` |
| ADM-03 | Admin rejects event with reason | Status → DRAFT, rejection email with reason sent | `[ ]` |
| ADM-04 | Admin rejects event without reason | 400, reason required (min 5 chars) | `[ ]` |
| ADM-05 | Admin approves already-published event | 400, only PENDING_REVIEW allowed | `[ ]` |
| ADM-06 | Admin cancels a published event | Status → CANCELLED | `[ ]` |
| ADM-07 | Admin deletes a cancelled event | Event removed from system | `[ ]` |
| ADM-08 | Admin tries to delete non-cancelled event | 400, only CANCELLED events can be deleted | `[ ]` |
| ADM-09 | Full event detail visible on review page | All fields shown before approve/reject decision | `[ ]` |

### 5.2 User Management

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| ADM-10 | Admin sees all users list | All users shown with role and status | `[ ]` |
| ADM-11 | Filter users by role (Attendees) | Only ATTENDEE users shown | `[ ]` |
| ADM-12 | Filter users by role (Organizers) | Only ORGANIZER users shown | `[ ]` |
| ADM-13 | Search users by name | Matching users shown | `[ ]` |
| ADM-14 | Search users by email | Matching users shown | `[ ]` |
| ADM-15 | Ban a user | User shows "Suspended" badge, is_banned = true | `[ ]` |
| ADM-16 | Unban a previously banned user | User shows "Active" badge, is_banned = false | `[ ]` |
| ADM-17 | Banned user tries to register for event | 403 BANNED error | `[ ]` |

### 5.3 Organizer Requests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| ADM-18 | Pending organizer requests shown in admin panel | Request list with user name, email, date | `[ ]` |
| ADM-19 | Pending request count badge shown | Badge shows correct count | `[ ]` |
| ADM-20 | Approve organizer request | User role → ORGANIZER, request status → APPROVED | `[ ]` |
| ADM-21 | Approved user can create events | Organizer dashboard accessible | `[ ]` |
| ADM-22 | Reject organizer request | Request status → REJECTED, user stays ATTENDEE | `[ ]` |

---

## 6. Email Notifications

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| NOT-01 | Register for free event → confirmation email | Email arrives with event title, date, venue, tier, QR code | `[ ]` |
| NOT-02 | QR code in email is visible (not broken) | QR code image renders in Gmail | `[ ]` |
| NOT-03 | Cancel registration → cancellation email | Email arrives confirming cancellation | `[ ]` |
| NOT-04 | Admin approves event → approval email to organizer | Email arrives with event title | `[ ]` |
| NOT-05 | Admin rejects event → rejection email to organizer | Email arrives with rejection reason | `[ ]` |
| NOT-06 | Forgot password → reset email | Email arrives with reset link | `[ ]` |
| NOT-07 | Password reset link works | Can set new password via link | `[ ]` |
| NOT-08 | Email failure does not break registration | Registration succeeds even if email queue fails | `[ ]` |

---

## 7. Role-Based Access Control

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| RBAC-01 | Unauthenticated user accesses `/dashboard` | Redirected to `/login` | `[ ]` |
| RBAC-02 | Unauthenticated user accesses `/admin` | Redirected to `/login` | `[ ]` |
| RBAC-03 | ATTENDEE accesses `/dashboard` | Redirected to home | `[ ]` |
| RBAC-04 | ATTENDEE accesses `/admin` | Redirected to home | `[ ]` |
| RBAC-05 | ORGANIZER accesses `/admin` | Redirected or 403 | `[ ]` |
| RBAC-06 | ORGANIZER calls admin endpoint directly | 403 | `[ ]` |
| RBAC-07 | ATTENDEE calls organizer endpoint directly | 403 | `[ ]` |
| RBAC-08 | Organizer can only see their own events | Other organizers' events not in `?mine=true` | `[ ]` |
| RBAC-09 | Organizer cannot access another organizer's attendee list | 403 or 404 | `[ ]` |

---

## 8. Edge Cases & Data Integrity

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| EDGE-01 | Two users register for last available ticket simultaneously | Only one succeeds, other gets capacity error | `[ ]` |
| EDGE-02 | Payment webhook called twice for same session | Second call is no-op, email not sent twice | `[ ]` |
| EDGE-03 | Register for event that starts in the past | Allowed (no time validation on registration) | `[ ]` |
| EDGE-04 | QR code with tampered HMAC presented at check-in | 400 INVALID_QR | `[ ]` |
| EDGE-05 | QR code for different event scanned at wrong event | 400 "QR code not valid for this event" | `[ ]` |
| EDGE-06 | Check in same attendee twice | 409 ALREADY_CHECKED_IN with time of first check-in | `[ ]` |
| EDGE-07 | Register for event with 0 remaining capacity | 400 capacity exceeded | `[ ]` |
| EDGE-08 | Tier sold count never goes below 0 on cancellation | tier.sold ≥ 0 always | `[ ]` |
| EDGE-09 | Forgot password for non-existent email | 200, no email sent, no enumeration leak | `[ ]` |
| EDGE-10 | Access event detail for non-existent event ID | 404 | `[ ]` |

---

## 9. UI / UX

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| UI-01 | App loads on mobile viewport (375px) | All pages usable on mobile | `[ ]` |
| UI-02 | Navbar shows correct links per role | Attendee, Organizer, Admin see different nav items | `[ ]` |
| UI-03 | Loading spinner shown while API calls are in progress | Spinner visible during data fetch | `[ ]` |
| UI-04 | Error message shown when API call fails | User-friendly error displayed | `[ ]` |
| UI-05 | Form shows inline validation errors | Field-level errors highlighted | `[ ]` |
| UI-06 | Logout button clears session and redirects to login | Tokens cleared, user redirected | `[ ]` |
| UI-07 | Back navigation works on detail and attendee pages | Navigates to correct previous page | `[ ]` |
| UI-08 | Event cards link to correct event detail page | Clicking card navigates to right event | `[ ]` |
