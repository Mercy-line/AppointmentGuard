# 🛡️ AppointmentGuard — System Design & Architecture

> **AppointmentGuard** is a robust, concurrent, and scalable clinic appointment booking system built with Django, Django REST Framework (DRF), and PostgreSQL.

---

## 📌 Table of Contents
1. [System Design Overview](#1-system-design-overview)
2. [Domain Models & Data Architecture](#2-domain-models--data-architecture)
3. [System Components & High-Level Architecture](#3-system-components--high-level-architecture)
4. [Key Engineering Decisions & Trade-Offs](#4-key-engineering-decisions--trade-offs)
   - [Decision 1: Dynamic Slot Generation vs. Stored Slot Records](#decision-1-dynamic-slot-generation-vs-stored-slot-records)
   - [Decision 2: Universal Timezone Standard (UTC)](#decision-2-universal-timezone-standard-utc)
   - [Decision 3: Race Condition Prevention (`select_for_update` vs. Unique Constraints)](#decision-3-race-condition-prevention-select_for_update-vs-unique-constraints)
   - [Decision 4: Doctor Working Hours & Time-Off Overrides](#decision-4-doctor-working-hours--time-off-overrides)
   - [Decision 5: Doctor Blackout Conflict Resolution (Patterns B & C)](#decision-5-doctor-blackout-conflict-resolution-patterns-b--c)
   - [Decision 6: Family Dependent Booking (Under-18 Minor Rule)](#decision-6-family-dependent-booking-under-18-minor-rule)
   - [Decision 7: Doctor-Initiated Cancellation & Patient Notification Dispatch](#decision-7-doctor-initiated-cancellation--patient-notification-dispatch)
   - [Decision 8: Working Hours Shift Alterations & Conflict Auditing](#decision-8-working-hours-shift-alterations--conflict-auditing)
   - [Decision 9: Full-Day Doctor Cancellation & Bulk Conflict Resolution](#decision-9-full-day-doctor-cancellation--bulk-conflict-resolution)
   - [Decision 10: Atomic Rescheduling & Rollback Protection](#decision-10-atomic-rescheduling--rollback-protection)
5. [Enforced Business Rules & Constraints](#5-enforced-business-rules--constraints)
6. [API Architecture & Endpoints](#6-api-architecture--endpoints)
7. [Deployment & Containerization Architecture](#7-deployment--containerization-architecture)

---

## 1. System Design Overview

AppointmentGuard provides a multi-doctor clinic booking platform (starting with 5 doctors and designed to scale to thousands of doctors and patients). The system enforces strict scheduling integrity, preventing double bookings, respecting working hours and doctor time-offs, supporting dependent minor bookings, and providing atomic rescheduling with zero-loss rollback protection.

---

## 2. Domain Models & Data Architecture

```
 +-------------------------------------------------------+
 |                     User (CustomUser)                 |
 |-------------------------------------------------------|
 | - id: UUID (PK)                                       |
 | - email: String (Unique, Indexed)                     |
 | - role: Enum ('PATIENT', 'DOCTOR', 'ADMIN')           |
 | - first_name, last_name: String                       |
 | - date_of_birth: Date (Under-18 Minor Verification)   |
 | - parent_guardian: FK(CustomUser, Self-Reference)     |
 | - timezone: String (e.g. 'Africa/Nairobi', 'UTC')     |
 +-------------------------------------------------------+
                            |
           +----------------+----------------+
           | 1:1                             | 1:N
           v                                 v
 +----------------------------------+  +----------------------------------+
 |              Doctor              |  |           Appointment            |
 |----------------------------------|  |----------------------------------|
 | - id: UUID (PK)                  |  | - id: UUID (PK)                  |
 | - user: OneToOne(User)           |  | - doctor: FK(Doctor)             |
 | - specialization: String         |  | - patient: FK(User)              |
 | - slot_duration_mins: Int (30)   |  | - booked_by: FK(User, Guardian)  |
 | - is_active: Boolean             |  | - start_time, end_time: UTC TS   |
 +----------------------------------+  | - status: Enum ('BOOKED',        |
        |                  |           |    'CANCELLED',NEEDS_RESCHEDULE')|
        | 1:N              | 1:N       | - cancellation_reason: Text      |
        v                  v           | - notification_sent: Boolean     |
 +------------------+ +-------------+  +----------------------------------+
 |DoctorWorkingHours| |DoctorTimeOff|                   ^
 |------------------| |-------------|                   |
 |- doctor: FK      | |- doctor: FK |                   |
 |- day_of_week: Int| |- start_dt:  |                   |
 |- start_time, end | |- end_dt:    |                   |
 +------------------+ +-------------+                   |
                                                        |
  [Database Constraint: UniqueConstraint(doctor, start_time) WHERE status='BOOKED']
```

---

## 4. Key Engineering Decisions & Trade-Offs

### Decision 10: Atomic Rescheduling & Rollback Protection

* **The Problem**: What happens if a patient attempts to reschedule to a new slot, but the new slot is claimed by another user mid-request? Does the patient risk losing their original slot?
* **Selected Architecture**:
  1. **Indivisible State Swap**: `reschedule_appointment` is wrapped in `@transaction.atomic` with pessimistic row locking (`SELECT ... FOR UPDATE`). Freeing the original slot and claiming the new slot happen in a single, indivisible database transaction block.
  2. **Rollback Guarantee**: If the new slot fails validation (e.g. taken by another patient), a `ValidationError` triggers an automatic database `ROLLBACK`. The original slot remains 100% intact under the patient's name with zero risk of slot forfeiture or data corruption.

---

## 5. Enforced Business Rules & Constraints

1. **Doctor Activity**: Appointments can only be booked with active doctors (`is_active = True`).
2. **Working Hours Alignment**: Every slot must fall strictly within the doctor's configured `DoctorWorkingHours` for that day of the week.
3. **Exact 30-Minute Duration**: All appointments must be exactly 30 minutes long and aligned to 30-minute grid boundaries.
4. **Advance Notice Guarantee**: Appointments cannot be booked in the past and **must be booked at least 1 hour in advance** of current system time (`start_time >= now + 1 hour`).
5. **No Overlapping Bookings**: A slot cannot overlap with any active `BOOKED` appointment for that doctor.
6. **Time-Off Respect**: Slots overlapping with a `DoctorTimeOff` blackout window cannot be booked.
7. **Minor Dependent Booking Rule**: Parents/guardians can book appointments on behalf of dependents under 18 years old.
8. **Doctor Shift & Full-Day Cancellation Audit**: When working hours change or full-day blackouts occur, conflicting pre-existing bookings are automatically flagged for priority rescheduling (`NEEDS_RESCHEDULE`).
9. **Atomic Reschedule & Rollback**: Rescheduling swaps slots atomically. New slot conflicts trigger an automatic transaction rollback, protecting original bookings against accidental forfeiture.
