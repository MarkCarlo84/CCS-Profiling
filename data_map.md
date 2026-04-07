DATA MAP
CCS Profiling System
Generated: April 7, 2026

==============================================================
OVERVIEW
==============================================================

This system manages academic and student profiling for a college
department. It covers user authentication, faculty and student
records, academic structure, scheduling, grading, evaluations,
events, and eligibility checking.

==============================================================
1. USER MANAGEMENT
==============================================================

ENTITY: User
  id                  integer, primary key
  name                string
  email               string, unique
  password            string, hashed
  role                enum: admin, teacher, student
  faculty_id          integer, foreign key to Faculty (optional)
  student_id          integer, foreign key to Student (optional)
  email_verified_at   datetime, nullable
  must_verify_email   boolean
  created_at          datetime
  updated_at          datetime

ENTITY: OtpVerification
  id          integer, primary key
  email       string
  otp         string
  action      string
  used        boolean
  expires_at  datetime
  created_at  datetime
  updated_at  datetime

  Purpose: Handles one-time password verification for email actions.

==============================================================
2. PEOPLE ENTITIES
==============================================================

ENTITY: Faculty
  id              integer, primary key
  faculty_id      string, unique identifier
  first_name      string
  last_name       string
  middle_name     string, nullable
  department      string
  position        string
  email           string
  contact_number  string
  created_at      datetime
  updated_at      datetime

  Relationships:
    Faculty has many FacultyEvaluation
    Faculty has many Report
    Faculty has many Syllabus
    Faculty has many Schedule
    Faculty belongs to many Subject via faculty_subjects

ENTITY: Student
  id               integer, primary key
  student_id       string, unique identifier
  first_name       string
  middle_name      string, nullable
  last_name        string
  department       string
  age              integer
  guardian_name    string
  date_of_birth    date
  gender           string
  address          string
  contact_number   string
  email            string
  enrollment_date  date
  status           enum: active, inactive, graduated, dropped, loa
  created_at       datetime
  updated_at       datetime

  Relationships:
    Student has many Violation
    Student has many Affiliation
    Student has many AcademicRecord
    Student has many Skill
    Student has many NonAcademicHistory
    Student has many FacultyEvaluation

==============================================================
3. ACADEMIC STRUCTURE
==============================================================

ENTITY: Department
  id           integer, primary key
  code         string, unique
  name         string
  description  string, nullable
  is_active    boolean
  created_at   datetime
  updated_at   datetime

  Relationships:
    Department has many Course
    Department has many Curriculum
    Department has many Event

ENTITY: Course
  id             integer, primary key
  department_id  integer, foreign key to Department
  code           string
  name           string
  units          integer
  hours_per_week integer
  type           enum: lecture, lab, both
  description    string, nullable
  is_active      boolean
  created_at     datetime
  updated_at     datetime

  Relationships:
    Course belongs to Department
    Course has many Section
    Course has many Syllabus

ENTITY: Subject
  id            integer, primary key
  subject_code  string
  subject_name  string
  units         integer
  year_level    integer
  semester      string
  pre_requisite string, nullable
  program       string
  created_at    datetime
  updated_at    datetime

  Relationships:
    Subject has many Grade
    Subject belongs to many Faculty via faculty_subjects

ENTITY: Section
  id              integer, primary key
  course_id       integer, foreign key to Course
  name            string
  year_level      integer
  semester        string
  school_year     string
  max_students    integer
  enrolled_count  integer
  created_at      datetime
  updated_at      datetime

  Relationships:
    Section belongs to Course
    Section has many Schedule

ENTITY: Curriculum
  id                integer, primary key
  department_id     integer, foreign key to Department
  code              string
  name              string
  description       string, nullable
  year_implemented  integer
  status            enum: active, archived
  created_at        datetime
  updated_at        datetime

  Relationships:
    Curriculum belongs to Department
    Curriculum has many Syllabus

ENTITY: Syllabus
  id                 integer, primary key
  curriculum_id      integer, foreign key to Curriculum
  course_id          integer, foreign key to Course
  faculty_id         integer, foreign key to Faculty
  semester           string
  school_year        string
  course_description string
  objectives         text
  references         text
  status             enum: draft, approved, archived
  created_at         datetime
  updated_at         datetime

  Relationships:
    Syllabus belongs to Curriculum
    Syllabus belongs to Course
    Syllabus belongs to Faculty
    Syllabus has many Lesson

ENTITY: Lesson
  id                  integer, primary key
  syllabus_id         integer, foreign key to Syllabus
  week_number         integer
  topic               string
  learning_objectives text
  materials           text
  activities          text
  assessment          text
  created_at          datetime
  updated_at          datetime

  Relationships:
    Lesson belongs to Syllabus

==============================================================
4. ACADEMIC PERFORMANCE
==============================================================

ENTITY: AcademicPeriod
  id           integer, primary key
  school_year  string, e.g. 2025-2026
  semester     enum: 1st, 2nd
  is_active    boolean, only one active at a time
  created_at   datetime
  updated_at   datetime

  Purpose: Tracks the current active school period system-wide.

ENTITY: AcademicRecord
  id           integer, primary key
  student_id   integer, foreign key to Student
  school_year  string
  semester     string
  year_level   integer
  gpa          decimal 2 places, nullable
  created_at   datetime
  updated_at   datetime

  Relationships:
    AcademicRecord belongs to Student
    AcademicRecord has many Grade

ENTITY: Grade
  id                  integer, primary key
  academic_record_id  integer, foreign key to AcademicRecord
  subject_id          integer, foreign key to Subject
  subject_name        string
  score               decimal 2 places, nullable
  remarks             string, nullable
  created_at          datetime
  updated_at          datetime

  Valid scores (Philippine grading system):
    1.00  Excellent     96 to 100
    1.25  Superior      92 to 95
    1.50  Very Good     88 to 91
    2.00  Good          80 to 83
    2.25  Satisfactory  75 to 79
    2.50  Fairly Satisfactory  70 to 74
    3.00  Passed        60 to 64
    5.00  Failed        0 to 59

  Special remarks: INC, IP, OD, UD
  Passing threshold: score of 3.00 or lower

  Relationships:
    Grade belongs to AcademicRecord
    Grade belongs to Subject

==============================================================
5. SCHEDULING AND FACILITIES
==============================================================

ENTITY: Room
  id            integer, primary key
  building      string
  room_number   string
  name          string
  type          enum: classroom, lab, lecture_hall, seminar_room
  capacity      integer
  is_available  boolean
  remarks       string, nullable
  created_at    datetime
  updated_at    datetime

  Relationships:
    Room has many Schedule

ENTITY: Schedule
  id           integer, primary key
  section_id   integer, foreign key to Section
  faculty_id   integer, foreign key to Faculty
  room_id      integer, foreign key to Room
  day_of_week  enum: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
  time_start   time
  time_end     time
  semester     string
  school_year  string
  remarks      string, nullable
  created_at   datetime
  updated_at   datetime

  Relationships:
    Schedule belongs to Section
    Schedule belongs to Faculty
    Schedule belongs to Room

==============================================================
6. STUDENT RECORDS AND CONDUCT
==============================================================

ENTITY: Violation
  id              integer, primary key
  student_id      integer, foreign key to Student
  violation_type  string
  description     text
  date_committed  date
  severity_level  string
  action_taken    string
  is_resolved     boolean
  resolved_at     datetime, nullable
  created_at      datetime
  updated_at      datetime

  Relationships:
    Violation belongs to Student

ENTITY: Affiliation
  id           integer, primary key
  student_id   integer, foreign key to Student
  name         string
  type         string
  role         string
  date_joined  date
  created_at   datetime
  updated_at   datetime

  Purpose: Tracks student memberships in organizations and clubs.

  Relationships:
    Affiliation belongs to Student

ENTITY: Skill
  id             integer, primary key
  student_id     integer, foreign key to Student
  skill_name     string
  skill_level    enum: beginner, intermediate, advanced
  certification  boolean
  created_at     datetime
  updated_at     datetime

  Relationships:
    Skill belongs to Student

ENTITY: NonAcademicHistory
  id              integer, primary key
  student_id      integer, foreign key to Student
  activity_title  string
  category        string
  description     text
  date_started    date
  date_ended      date, nullable
  role            string
  organizer       string
  game_result     string, nullable
  created_at      datetime
  updated_at      datetime

  Purpose: Tracks sports, competitions, and extracurricular activities.

  Relationships:
    NonAcademicHistory belongs to Student

==============================================================
7. EVALUATION AND REPORTING
==============================================================

ENTITY: FacultyEvaluation
  id                      integer, primary key
  faculty_id              integer, foreign key to Faculty
  student_id              integer, foreign key to Student
  teaching_effectiveness  integer, 1 to 5
  communication           integer, 1 to 5
  professionalism         integer, 1 to 5
  subject_mastery         integer, 1 to 5
  student_engagement      integer, 1 to 5
  comments                text, nullable
  school_year             string
  semester                string
  created_at              datetime
  updated_at              datetime

  Constraint: Unique per faculty, student, school_year, semester.

  Relationships:
    FacultyEvaluation belongs to Faculty
    FacultyEvaluation belongs to Student

ENTITY: Report
  id              integer, primary key
  faculty_id      integer, foreign key to Faculty
  title           string
  report_type     string
  subject_student string
  content         text
  status          enum: draft, submitted, reviewed
  report_date     date
  created_at      datetime
  updated_at      datetime

  Relationships:
    Report belongs to Faculty

ENTITY: EligibilityCriteria
  id                        integer, primary key
  criteria_id               string
  minimum_gpa               decimal 2 places
  required_skill            string, nullable
  required_affiliation_type string, nullable
  max_allowed_violations    integer
  created_at                datetime
  updated_at                datetime

  Purpose: Defines rules to evaluate whether a student qualifies
  for a program, scholarship, or opportunity. Checks GPA, skills,
  affiliations, and violation count.

==============================================================
8. EVENTS AND PARTICIPATION
==============================================================

ENTITY: Event
  id               integer, primary key
  department_id    integer, foreign key to Department
  title            string
  type             enum: curricular, extra_curricular
  category         string
  organizer        string
  venue            string
  date_start       date
  date_end         date
  description      text
  status           enum: upcoming, ongoing, completed, cancelled
  max_participants integer
  created_at       datetime
  updated_at       datetime

  Relationships:
    Event belongs to Department
    Event has many EventParticipant

ENTITY: EventParticipant
  id                integer, primary key
  event_id          integer, foreign key to Event
  participable_type string, Student or Faculty
  participable_id   integer, polymorphic reference
  role              enum: participant, organizer, judge, facilitator
  award             string, nullable
  remarks           string, nullable
  created_at        datetime
  updated_at        datetime

  Purpose: Polymorphic join that links either a Student or Faculty
  to an Event with a specific role.

  Relationships:
    EventParticipant belongs to Event
    EventParticipant morphs to Student or Faculty

==============================================================
9. JUNCTION TABLES
==============================================================

TABLE: faculty_subjects
  id           integer, primary key
  faculty_id   integer, foreign key to Faculty
  subject_id   integer, foreign key to Subject
  school_year  string
  semester     string
  created_at   datetime
  updated_at   datetime

  Constraint: Unique per faculty_id, subject_id, school_year, semester.
  Purpose: Links Faculty to Subject with temporal context per semester.

==============================================================
10. RELATIONSHIP SUMMARY
==============================================================

User                  belongs to Faculty (optional, 1 to 1)
User                  belongs to Student (optional, 1 to 1)

Department            has many Course
Department            has many Curriculum
Department            has many Event

Course                belongs to Department
Course                has many Section
Course                has many Syllabus

Curriculum            belongs to Department
Curriculum            has many Syllabus

Syllabus              belongs to Curriculum
Syllabus              belongs to Course
Syllabus              belongs to Faculty
Syllabus              has many Lesson

Lesson                belongs to Syllabus

Faculty               has many FacultyEvaluation
Faculty               has many Report
Faculty               has many Syllabus
Faculty               has many Schedule
Faculty               belongs to many Subject via faculty_subjects

Subject               has many Grade
Subject               belongs to many Faculty via faculty_subjects

Section               belongs to Course
Section               has many Schedule

Schedule              belongs to Section
Schedule              belongs to Faculty
Schedule              belongs to Room

Room                  has many Schedule

Student               has many AcademicRecord
Student               has many Violation
Student               has many Affiliation
Student               has many Skill
Student               has many NonAcademicHistory
Student               has many FacultyEvaluation

AcademicRecord        belongs to Student
AcademicRecord        has many Grade

Grade                 belongs to AcademicRecord
Grade                 belongs to Subject

FacultyEvaluation     belongs to Faculty
FacultyEvaluation     belongs to Student

Report                belongs to Faculty

Event                 belongs to Department
Event                 has many EventParticipant

EventParticipant      belongs to Event
EventParticipant      morphs to Student or Faculty

EligibilityCriteria   standalone, evaluates Student records

==============================================================
11. DATA FLOW PATTERNS
==============================================================

Academic Workflow
  Department creates Curriculum
  Curriculum contains Syllabus
  Syllabus is authored by Faculty
  Syllabus contains Lessons
  Department offers Courses
  Course has Sections
  Section has Schedules assigned to Faculty and Room

Student Performance Tracking
  Student has AcademicRecords per semester
  AcademicRecord contains Grades per Subject
  GPA is computed from finalized Grade scores

Faculty Evaluation
  Student submits FacultyEvaluation for a Faculty
  Ratings cover teaching effectiveness, communication,
  professionalism, subject mastery, and student engagement

Student Conduct and Profile
  Faculty records Violations against a Student
  Student has Affiliations to organizations
  Student has Skills with certification flags
  Student has NonAcademicHistory for extracurricular activities

Events
  Department organizes Events
  Students and Faculty join as EventParticipants with roles and awards

Eligibility Checking
  EligibilityCriteria defines thresholds for GPA, skills,
  affiliations, and violations
  Faculty can run eligibility checks against any Student

Authentication Flow
  User logs in with email and password
  OTP is sent via email for verification actions
  User role determines access: admin, teacher, or student
