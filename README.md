# 🛡️ AppointmentGuard — Clinic Booking System & Architecture

> **AppointmentGuard** is a robust, scalable, and concurrency-safe clinic appointment booking platform built with Django, Django REST Framework, PostgreSQL, Docker, and GitHub Actions.

---

## 📌 Table of Contents
1. [Section 1: System Design & Architecture](#section-1-system-design--architecture)
   - [Domain Model & Entity Relationships](#domain-model--entity-relationships)
   - [Fixed Grid vs. Flexible Slot Architecture](#fixed-grid-vs-flexible-slot-architecture)
   - [Universal Timezone Architecture (UTC)](#universal-timezone-architecture-utc)
   - [Concurrency Control & Race Condition Prevention (`select_for_update`)](#concurrency-control--race-condition-prevention-select_for_update)
   - [Doctor Time-Offs, Working Hours & Blackouts](#doctor-time-offs-working-hours--blackouts)
   - [Authentication & Authorization (RBAC)](#authentication--authorization-rbac)
   - [Scalability & Future Growth Strategy](#scalability--future-growth-strategy)
2. [Section 2: API & Architecture Specification](#section-2-api--architecture-specification)
3. [Section 3: CI/CD & Deployment Plan](#section-3-cicd--deployment-plan)
4. [Section 4: AI Reflection](#section-4-ai-reflection)

---

## Section 1: System Design & Architecture

### 🏥 The Scenario
A growing clinic with 5 doctors needs a web system where patients can view available 30-minute appointment slots, book them, reschedule, or cancel them. The system must enforce business rules (no double bookings, no past bookings, minimum 1-hour advance booking, respect working hours and doctor time-offs) while ensuring race-condition prevention when concurrent patients try to book the same slot.

---

### Domain Model & Entity Relationships

```
 +-------------------------------------------------------+
 |                     User / CustomUser                  |
 |-------------------------------------------------------|
 | - id: UUID / BigInt (PK)                             |
 | - email: String (Unique)                              |
 | - role: Enum ('PATIENT', 'DOCTOR', 'ADMIN')           |
 | - first_name, last_name, timezone: String             |
 +-------------------------------------------------------+
               | (1:1 for Doctor details)
               v
 +-------------------------------------------------------+
 |                        Doctor                         |
 |-------------------------------------------------------|
 | - id: UUID (PK)                                       |
 | - user: OneToOne(User)                                |
 | - specialization: String                              |
 | - slot_duration_minutes: Integer (Default: 30)        |
 | - is_active: Boolean                                  |
 +-------------------------------------------------------+
        |                                       |
        | (1:N)                                 | (1:N)
        v                                       v
 +----------------------------------+  +----------------------------------+
 |        DoctorWorkingHours        |  |          DoctorTimeOff           |
 |----------------------------------|  |----------------------------------|
 | - id: UUID (PK)                  |  | - id: UUID (PK)                  |
 | - doctor: FK(Doctor)             |  | - doctor: FK(Doctor)             |
 | - day_of_week: Int (0=Mon..6=Sun)|  | - start_datetime: UTC Timestamp  |
 | - start_time: UTC Time           |  | - end_datetime: UTC Timestamp    |
 | - end_time: UTC Time             |  | - reason: Text                   |
 +----------------------------------+  +----------------------------------+
        |
        | (Target of booking)
        v
 +-------------------------------------------------------+
 |                      Appointment                      |
 |-------------------------------------------------------|
 | - id: UUID (PK)                                       |
 | - doctor: FK(Doctor)                                  |
 | - patient: FK(User)                                   |
 | - start_time: UTC Timestamp                           |
 | - end_time: UTC Timestamp                             |
 | - status: Enum ('BOOKED', 'CANCELLED', 'COMPLETED')   |
 | - cancellation_reason: Text (Optional)                |
 | - created_at, updated_at: UTC Timestamp               |
 +-------------------------------------------------------+
```

---

### Fixed Grid vs. Flexible Slot Architecture

#### Decision: **Fixed Grid Generation with Dynamic Overlay**
We evaluate two approaches to managing time slots:

1. **Stored Fixed Slots (Database per slot)**:
   - *Pros*: Simple SQL `SELECT * FROM slots WHERE is_booked=False`.
   - *Cons*: Database bloat (thousands of empty slot rows created per year per doctor), high maintenance when working hours change.

2. **Dynamic Slot Generation (Fixed 30-Minute Grid)** — **SELECTED**:
   - Slots are computed on-the-fly based on the doctor's `WorkingHours` (e.g., 09:00, 09:30, 10:00) minus existing `Appointments` (status=`BOOKED`) and `DoctorTimeOff` intervals.
   - Slot start times are strictly aligned to 30-minute boundaries (e.g., `09:00:00`, `09:30:00`).
   - *Why*: Eliminates DB bloat, handles schedule changes dynamically, and enforces clean predictable slot boundaries.

---

### Universal Timezone Architecture (UTC)

#### Problem
Patients and doctors can operate across different timezones (e.g., patient in London `UTC+1`, clinic/doctor in Nairobi `UTC+3`).

#### Solution
- **Storage Layer**: All timestamps (`start_time`, `end_time`, `created_at`) are saved in the database in **UTC** (`TIMESTAMPTZ` column in PostgreSQL).
- **Application Layer**: Django operates with `USE_TZ = True` and default timezone `UTC`.
- **API / UI Layer**: Inputs accepted in ISO 8601 string format with timezone offset (e.g., `2026-08-03T10:00:00+03:00`). Django automatically normalizes incoming timestamps to UTC before querying or storing. Responses provide ISO 8601 UTC timestamps, and the frontend converts them to the patient's or doctor's local browser timezone.

---

### Concurrency Control & Race Condition Prevention (`select_for_update`)

#### Problem: Race Conditions
If two patients click "Book" for Doctor A at `10:00 AM UTC` simultaneously (at the exact same microsecond):
1. Request 1 checks DB: `10:00 AM` is free.
2. Request 2 checks DB: `10:00 AM` is free.
3. Request 1 creates `Appointment`.
4. Request 2 creates `Appointment`.
→ **Result**: Double booking!

#### Solution 1: Database Level Unique Constraint (Safety Net)
We add a Database `UniqueConstraint` on `(doctor, start_time)` where `status = 'BOOKED'`.
If Request 2 tries to insert, PostgreSQL throws an Integrity Error.

#### Solution 2: Pessimistic Locking with `select_for_update()` (Application Transaction Level)
To prevent lock contention and handle application-level validation cleanly inside a transaction:
```python
from django.db import transaction

@transaction.atomic
def book_appointment(patient, doctor_id, start_time):
    # Lock the doctor row to serialize booking requests for this doctor
    doctor = Doctor.objects.select_for_update().get(id=doctor_id)
    
    # Calculate end_time (start_time + 30 mins)
    end_time = start_time + timedelta(minutes=30)
    
    # 1. Validate start_time is at least 1 hour from now
    if start_time < timezone.now() + timedelta(hours=1):
        raise ValidationError("Appointments must be booked at least 1 hour in advance.")

    # 2. Check overlap with existing BOOKED appointments
    overlapping = Appointment.objects.filter(
        doctor=doctor,
        status=AppointmentStatus.BOOKED,
        start_time__lt=end_time,
        end_time__gt=start_time
    ).exists()
    
    if overlapping:
        raise ValidationError("This time slot has already been booked by another patient.")
        
    # 3. Create appointment
    return Appointment.objects.create(
        patient=patient, doctor=doctor, start_time=start_time, end_time=end_time
    )
```

#### How `select_for_update()` Works:
- `select_for_update()` executes a SQL query with `SELECT ... FOR UPDATE`.
- The database acquires an exclusive row lock on the targeted `Doctor` record for the duration of the `@transaction.atomic` block.
- If a second request arrives for the same doctor, it **waits** at `select_for_update()` until the first transaction commits or rolls back.
- Once the lock is released, the second request re-evaluates the availability check and discovers the slot is now taken, returning a clear `400 Bad Request` or `409 Conflict` response instead of corrupting data.

---

### Doctor Time-Offs, Working Hours & Blackouts

1. **Working Hours**: Set per day of the week (e.g., Monday 09:00 - 17:00). Slots are only generated within these bounds.
2. **Doctor Time-Offs**: Overrides working hours. If a doctor creates a `DoctorTimeOff` entry (e.g., Emergency leave on Aug 5, 12:00 - 15:00), any slot overlapping with this interval is marked as unavailable.
3. **Rescheduling / Cancellation**: When an appointment is cancelled (`status = CANCELLED`), its slot immediately becomes visible in availability calculations because availability filtering only excludes `status = BOOKED`.

---

### Authentication & Authorization (RBAC)

- **Patients**: Can register, log in, view available slots, book appointments for themselves, view their own appointments, reschedule or cancel their own appointments.
- **Doctors**: Can log in, view their schedule/booked appointments, set their working hours, and add time-offs/blackouts.
- **Admins / Staff**: Full access via Django Admin to manage doctors, patients, and system settings.

---

## Section 2: API & Architecture Specification

### Required Endpoints & Business Logic Matrix

| Method | Endpoint | Description | Key Validations |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/appointments/` | Book a slot | Doctor active, within working hours, not in time-off, not in past, $\ge 1$ hr in advance, 30 min duration, no overlapping `BOOKED` slot. |
| `GET` | `/api/doctors/{id}/availability/` | Get 30-min available slots | Date query param required (`?date=YYYY-MM-DD`). Computes slots based on working hours minus booked appointments and time-offs. |
| `PATCH` | `/api/appointments/{id}/cancel/` | Cancel appointment | Reason required (`reason`). Only patient who booked or doctor can cancel. Error if already cancelled. Slot freed immediately. |
| `PATCH` | `/api/appointments/{id}/reschedule/` | Reschedule appointment | New slot (`new_start_time`). Must validate new slot with identical booking rules. Frees original slot. Error if cancelled. |
| `GET` | `/api/patients/{id}/appointments/` | Patient upcoming appointments | Sorted by `start_time` ascending. Accessible by patient or staff. |

---

## Section 3: CI/CD & Deployment Plan

- **Containerization**: Single multi-stage `Dockerfile` running as a non-root user (`appuser` with UID 10001) for security.
- **Branches**:
  - `develop`: Trigger for CI pipeline (Runs `flake8`/`black`, runs full Django pytest suite).
  - `main` / `production`: Trigger for CD pipeline (Runs CI, builds Docker image, deploys to Cloud platform like Render / Fly.io / Railway / AWS).
- **Secrets Management**: Database credentials, `SECRET_KEY`, and deployment tokens stored securely in **GitHub Actions Secrets**.

---

## Section 4: AI Reflection

*(This section records the reflective synthesis on AI tool usage as required by the assessment guidelines.)*

1. **What did you use AI for across the four sections?**
   - **System Design**: Brainstorming domain models, evaluating stored slot tables vs dynamic slot generation, and refining race condition strategies.
   - **API Implementation**: Assisting with boilerplate serializer setups and boundary-edge test cases (e.g., Daylight Saving Time and exact 1-hour buffer checks).
   - **Deployment & CI/CD**: Generating non-root user Dockerfile patterns and GitHub Actions workflow syntax.
   - **Refactoring & Documentation**: Structuring comprehensive Markdown README and verifying docstrings.

2. **Give one example where an AI suggestion improved your work. What did you prompt it with?**
   - **Prompt**: *"How can I prevent two patients from double-booking the exact same 30-minute doctor slot at the same millisecond in Django DRF?"*
   - **Outcome**: The AI suggested combining Django's `@transaction.atomic` and `select_for_update()` pessimistic lock with a DB-level `UniqueConstraint` on `(doctor, start_time, status)`. This dual-layer defense ensured both transaction-level grace and absolute database integrity.

3. **Give one example where AI output was wrong or incomplete and how you caught it.**
   - **Example**: In initial slot availability logic, AI generated a simple `exclude(appointment__start_time=slot_start)` check.
   - **How it was caught**: During code review/testing, I realized this would miss partial overlaps or rescheduling windows, and failed to account for `DoctorTimeOff` ranges. I replaced it with proper interval boundary overlap logic (`start_time < slot_end AND end_time > slot_start`).

4. **Name two decisions you made without AI. Why did you trust your own judgment there?**
   - **Decision 1: Dynamic Slot Generation over Stored Slot Rows**. Storing millions of empty slot rows in Postgres adds database bloat and operational maintenance. Dynamic generation from WorkingHours and TimeOff is much cleaner and scalable.
   - **Decision 2: Strict UTC Storage with Client-Side Local Time Rendering**. Trusting standardized UTC ISO timestamps in the database prevents ambiguity across international timezones and server migrations.
