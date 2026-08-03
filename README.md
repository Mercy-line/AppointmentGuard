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
5. [Enforced Business Rules & Constraints](#5-enforced-business-rules--constraints)
6. [API Architecture & Endpoints](#6-api-architecture--endpoints)
7. [Deployment & Containerization Architecture](#7-deployment--containerization-architecture)
   - [CI/CD Pipeline Workflow](#cicd-pipeline-workflow)
   - [Local Setup & Running via Docker](#local-setup--running-via-docker)

---

## 1. System Design Overview

AppointmentGuard provides a multi-doctor clinic booking platform (starting with 5 doctors and designed to scale to thousands of doctors and patients). The system enforces strict scheduling integrity, preventing double bookings, respecting working hours and doctor time-offs, and supporting time-zone independent appointment management.

---

## 2. Domain Models & Data Architecture

The database schema utilizes relational integrity, explicit foreign key relationships, database constraints, and timezone-aware timestamps (`TIMESTAMPTZ` in PostgreSQL).

```
 +-------------------------------------------------------+
 |                     User (CustomUser)                 |
 |-------------------------------------------------------|
 | - id: UUID (PK)                                       |
 | - email: String (Unique, Indexed)                     |
 | - role: Enum ('PATIENT', 'DOCTOR', 'ADMIN')           |
 | - first_name: String                                  |
 | - last_name: String                                   |
 | - timezone: String (e.g. 'Africa/Nairobi', 'UTC')     |
 | - created_at: UTC Timestamp                           |
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
 | - slot_duration_mins: Int (30)   |  | - start_time: UTC Timestamp (Idx)|
 | - is_active: Boolean             |  | - end_time: UTC Timestamp (Idx)  |
 +----------------------------------+  | - status: Enum                   |
        |                  |           |   ('BOOKED','CANCELLED',         |
        | 1:N              | 1:N       |    'NEEDS_RESCHEDULE')           |
        v                  v           | - cancellation_reason: Text      |
 +------------------+ +-------------+  | - created_at, updated_at: UTC    |
 |DoctorWorkingHours| |DoctorTimeOff|  +----------------------------------+
 |------------------| |-------------|                   ^
 |- doctor: FK      | |- doctor: FK |                   |
 |- day_of_week: Int| |- start_dt:  |                   |
 |  (0=Mon..6=Sun)  | |  UTC TS     |                   |
 |- start_time: Time| |- end_dt:    |                   |
 |- end_time: Time  | |  UTC TS     |                   |
 +------------------+ |- reason:Text|                   |
                      +-------------+                   |
                                                        |
  [Database Constraint: UniqueConstraint(doctor, start_time) WHERE status='BOOKED']
```

---

## 3. System Components & High-Level Architecture

```
                    +--------------------------------+
                    |   Client (Web Browser / SPA)   |
                    +--------------------------------+
                                    |
                                    | HTTP / JSON (ISO 8601 UTC)
                                    v
                    +--------------------------------+
                    |    Nginx / Reverse Proxy       |
                    +--------------------------------+
                                    |
                                    v
                    +--------------------------------+
                    |  Django / Gunicorn WSGI App    |
                    |  (Authentication, Validation,  |
                    |   Booking Services, DRF API)   |
                    +--------------------------------+
                                    |
            +-----------------------+-----------------------+
            | (Pessimistic Locking & Database Transactions) |
            v                                               v
 +----------------------------------+            +--------------------+
 |  PostgreSQL Primary Database     |            | Redis Cache (Opt)  |
 |  - TIMESTAMPTZ storage           |            | - Rate limiting    |
 |  - FOR UPDATE Row Locks          |            | - Session store    |
 +----------------------------------+            +--------------------+
```

---

## 4. Key Engineering Decisions & Trade-Offs

### Decision 1: Dynamic Slot Generation vs. Pre-stored Slot Records

* **Options Considered**:
  1. *Pre-generated Slot Table*: Insert 30-minute rows for every doctor for months in advance into a `slots` table.
  2. *Dynamic Slot Generation* (**Selected**): Compute available slots on-the-fly given a target doctor and date.
* **Reasoning**:
  - Pre-generating slots creates database bloat (tens of thousands of empty slot rows per doctor per year) and requires complex cron background jobs.
  - Dynamic generation computes valid 30-minute grid slots from `DoctorWorkingHours`, then subtracts existing `BOOKED` appointments and `DoctorTimeOff` intervals via optimized SQL queries.
* **Trade-Off**: Higher CPU/SQL query work on slot availability retrieval, but zero database bloat and instant reflection of schedule/time-off changes.

---

### Decision 2: Universal Timezone Standard (UTC)

* **Options Considered**:
  1. *Local Server Timezone Storage*.
  2. *UTC Storage with Client-Side Conversion* (**Selected**).
* **Reasoning**:
  - Clinic systems serve patients or doctors across different timezones or handle daylight saving changes.
  - PostgreSQL column type: `TIMESTAMPTZ`. Django setting: `USE_TZ = True`, `TIME_ZONE = 'UTC'`.
  - API accepts and returns ISO 8601 strings with explicit UTC timezone markers (e.g., `2026-08-03T10:00:00Z`).

---

### Decision 3: Race Condition Prevention (`select_for_update` vs. Unique Constraints)

* **The Challenge**: If two patients attempt to book the exact same 30-minute slot for Doctor X simultaneously, concurrent threads could both validate the slot as free and create duplicate appointments.
* **Selected Defense (Dual Layer)**:
  1. **Layer 1 — Transactional Pessimistic Lock (`select_for_update`)**:
     Inside an `@transaction.atomic` block, the booking service executes `Doctor.objects.select_for_update().get(id=doctor_id)`. This places a SQL row lock on the target Doctor record. The second concurrent request is held waiting until the first transaction commits or rolls back.
  2. **Layer 2 — Database Partial Unique Index**:
     A partial PostgreSQL unique index `UniqueConstraint(fields=['doctor', 'start_time'], condition=Q(status='BOOKED'))` acts as a hard database guarantee.

---

### Decision 4: Doctor Working Hours & Time-Off Overrides

* **Design**:
  - `DoctorWorkingHours` defines recurring availability per day of week (e.g. Mon–Fri 08:00–17:00).
  - `DoctorTimeOff` defines non-recurring blackout ranges (e.g., Aug 10, 10:00–14:00).
  - Any 30-minute slot overlapping a `DoctorTimeOff` range or falling outside `DoctorWorkingHours` is automatically excluded.

---

### Decision 5: Doctor Blackout Conflict Resolution (Patterns B & C)

* **The Edge Case**: What happens if a patient already booked a 10:00 AM slot, and later the doctor declares emergency time-off covering 09:00 to 12:00?
* **Selected Strategy (Patterns B & C)**:
  1. **Pattern B (Priority Reschedule Status)**: Creating a `DoctorTimeOff` executes an atomic scan for active `BOOKED` appointments overlapping the blackout range and transitions their status to `NEEDS_RESCHEDULE` with a reason string (*"Doctor Emergency Time-Off — Priority Reschedule Required"*).
  2. **Pattern C (Dashboard & Patient Warning Banner)**: The affected patient's dashboard highlights a warning banner prompting them to pick a new slot, and the Doctor Portal displays a conflict alert count.

---

## 5. Enforced Business Rules & Constraints

1. **Doctor Activity**: Appointments can only be booked with active doctors (`is_active = True`).
2. **Working Hours Alignment**: Every slot must fall strictly within the doctor's configured `DoctorWorkingHours` for that day of the week.
3. **Exact 30-Minute Duration**: All appointments must be exactly 30 minutes long and aligned to 30-minute grid boundaries.
4. **Advance Notice Guarantee**: Appointments cannot be booked in the past and **must be booked at least 1 hour in advance** of current system time (`start_time >= now + 1 hour`).
5. **No Overlapping Bookings**: A slot cannot overlap with any active `BOOKED` appointment for that doctor.
6. **Time-Off Respect**: Slots overlapping with a `DoctorTimeOff` blackout window cannot be booked.
7. **Cancellation Rules**: An appointment can only be cancelled if it is currently active. A cancellation reason must be provided.
8. **Reschedule Validation**: Moving an appointment validates the new slot against all booking rules, marks the old slot as available, and updates the appointment atomically.

---

## 6. API Architecture & Endpoints

| Endpoint | Method | Purpose | HTTP Success / Error Codes |
| :--- | :--- | :--- | :--- |
| `/api/appointments/` | `POST` | Book a new 30-min appointment slot | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `/api/doctors/{id}/availability/` | `GET` | Get available 30-min slots for a date (`?date=YYYY-MM-DD`) | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `/api/appointments/{id}/cancel/` | `PATCH` | Cancel an appointment with a reason | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `/api/appointments/{id}/reschedule/` | `PATCH` | Move an appointment to a new slot | `200 OK`, `400 Bad Request`, `409 Conflict` |
| `/api/patients/{id}/appointments/` | `GET` | Retrieve upcoming appointments sorted by date | `200 OK`, `403 Forbidden`, `404 Not Found` |

---

## 7. Deployment & Containerization Architecture

### CI/CD Pipeline Workflow

The repository enforces a 2-branch automated deployment workflow using **GitHub Actions**:

```
 [Feature Branch] ---- (Pull Request) ----> [develop Branch]
                                                |
                                                v (Runs CI: flake8, pytest suite)
                                                |
                                       [Merge to production]
                                                |
                                                v (Runs CD: Docker build, Cloud Deploy)
```

1. **`develop` Branch (Continuous Integration)**:
   - **Trigger**: Every Pull Request targeting `develop` or direct push to `develop`.
   - **Actions**: Spawns a PostgreSQL 16 container, runs `flake8` linting, and executes the complete `pytest` test suite.
2. **`production` Branch (Continuous Deployment)**:
   - **Trigger**: Merging a verified PR into `production`.
   - **Actions**: Runs pre-deploy test suite, builds multi-stage Docker container, verifies non-root execution (`appuser`, UID 10001), and triggers deployment webhook to Cloud hosting (Render / Fly.io / Railway).

### Local Setup & Running via Docker

```bash
# 1. Clone repository and switch to develop branch
git clone https://github.com/Mercy-line/AppointmentGuard.git
cd AppointmentGuard
git checkout develop

# 2. Start services via Docker Compose
docker compose up --build -d

# 3. Apply database migrations and seed sample clinic data
docker compose exec web python manage.py migrate
docker compose exec web python manage.py seed_clinic_data

# Access application in browser at http://localhost:8000
```
