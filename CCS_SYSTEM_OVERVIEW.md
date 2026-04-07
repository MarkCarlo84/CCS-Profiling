# CCS Profiling System Overview

## What It Is

CCS stands for College of Computer Studies profiling platform. It is a web-based academic management system designed to track and manage student and faculty profiles, academic performance, discipline records, and institutional activities.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | Laravel 12 (PHP 8.2) |
| API Authentication | Laravel Sanctum |
| Email Service | Brevo Mail Service |
| Frontend Framework | React 19 |
| Build Tool | Vite |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Print Support | React-to-Print |

---

## User Roles

### Admin
Full access to everything including user management, grade management, academic period settings, faculty-subject assignments, event management, and report generation.

### Teacher / Faculty
Can view their assigned subjects, record student violations, write student reports, create eligibility assessments, and view their own evaluation results submitted by students.

### Student
Can view their own academic records, manage their skills, affiliations, and non-academic activities, evaluate faculty members, and view their violations and events.

---

## Core Modules

### Academic Management
Handles academic periods, courses, subjects, curricula, syllabi, lessons, sections, schedules, rooms, and grades. Grades follow the Philippine grading system from 1.00 to 5.00 with special statuses like INC, IP, OD, and UD.

### Student Profiling
Tracks personal information, semester-based academic records and GPA, subject grades, skills with proficiency levels, organization affiliations, non-academic activities, and violation records.

### Faculty Management
Covers faculty profiles, subject assignments per school year and semester, and student-submitted evaluations rated across five categories:
- Teaching Effectiveness
- Communication
- Professionalism
- Subject Mastery
- Student Engagement

### Eligibility Criteria
Allows defining rules based on minimum GPA, required skills, required affiliation types, and maximum allowed violations. Faculty can run these criteria against students to generate eligibility reports.

### Violations and Discipline
Lets faculty record violations with type, severity (minor, major, grave), and resolution status.

### Events Management
Supports curricular and extracurricular events with participant tracking for both students and faculty, role assignments (participant, organizer, judge, facilitator), and award recording.

### Reporting and Analytics
Provides student and faculty summary reports, system-wide statistics, global search, and printable report exports.

---

## Authentication Flow

There are two separate login portals:
- Students log in at `/student` using their student ID
- Faculty and admin log in at `/facultyadmin`

Both support OTP-based email verification for added security. Tokens are stored in session storage and validated on every request.

---

## How the Main Pieces Connect

```
User (admin / teacher / student)
├── Faculty (if teacher)
│   ├── Subjects (many-to-many, per school year and semester)
│   ├── FacultyEvaluations (submitted by students)
│   └── Reports (written assessments of students)
└── Student (if student)
    ├── AcademicRecords
    │   └── Grades (per subject)
    ├── Violations
    ├── Affiliations
    ├── Skills
    └── NonAcademicHistories

Department
├── Courses
│   ├── Sections
│   │   └── Schedules
│   └── Syllabi
│       └── Lessons
└── Events
    └── EventParticipants (Student or Faculty)

EligibilityCriteria
└── Evaluates Students (GPA, skills, affiliations, violations)
```

---

## Frontend Pages by Role

### Admin
- Faculty Data Map
- Student Data Map
- Subjects, Violations, Affiliations, Skills
- Academic Records, Non-Academic Histories
- Eligibility Criteria
- Faculty Reports and Evaluations
- Events
- Academic Period Settings
- Faculty-Subject Assignment

### Teacher
- My Subjects
- Create Report
- My Evaluations
- Eligibility Criteria
- Events

### Student
- My Skills, Affiliations, Activities
- Evaluate Faculty
- Academic Records
- Violations
- Events

### Shared
- Login portals (student and staff)
- Change Password
- Reports
- Global Search
