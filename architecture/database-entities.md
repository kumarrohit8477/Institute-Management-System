# Institute Management System — Database Entity Specifications
**Document Version:** 1.0.0  
**Phase:** Step 0.1 — Define Database Entities  

---

## 1. Architectural Principles & Data Strategy

1. **SaaS / Multi-Tenant Readiness:**
   - Every top-level entity carries an `instituteId` foreign key.
   - For single-tenant operation, all records link to the default/primary institute.
   - When transitioning to multi-tenant, all queries are scoped by `instituteId` without requiring schema refactoring.

2. **Role & Identity Separation:**
   - `User` entity handles authentication (login credentials, hashed passwords, session/refresh tokens, role: `ADMIN` | `STUDENT`).
   - `Student` stores domain profile data and links 1:1 with `User`.
   - `Teacher` stores faculty details, qualifications, and assignments. **Teachers do NOT have a `userId` or login access**.

3. **Referential Integrity & Normalization:**
   - Junction tables handle explicit M:N relationships (`StudentBatch`, `TeacherSubject`, `TeacherAssignment`, `TestQuestion`).
   - Audit timestamps (`createdAt`, `updatedAt`) on all core tables.
   - Proper indexing on foreign keys and frequently filtered columns (e.g., `[instituteId, status]`, `[batchId, date]`).

---

## 2. Comprehensive Entity Definitions

---

### 1. `Institute`
Root tenant entity. Represents the educational institute/organization.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `name` | `VARCHAR(191)` | NOT NULL | Name of the institute |
| `code` | `VARCHAR(50)` | UNIQUE, NOT NULL | Unique code / slug (e.g. `INST001`) |
| `email` | `VARCHAR(191)` | NOT NULL | Contact email |
| `phone` | `VARCHAR(20)` | NOT NULL | Contact phone number |
| `address` | `TEXT` | NULLABLE | Physical address |
| `logoUrl` | `VARCHAR(500)` | NULLABLE | URL of institute logo |
| `tagline` | `VARCHAR(255)` | NULLABLE | Official motto / tagline / slogan |
| `website` | `VARCHAR(255)` | NULLABLE | Official website URL |
| `status` | `ENUM` | DEFAULT: `ACTIVE` (`ACTIVE`, `INACTIVE`, `SUSPENDED`) | Operational status |
| `settings` | `JSON` | NULLABLE | Custom configuration (timezone, branding, currency) |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Has many `User`, `Student`, `Teacher`, `Course`, `Batch`, `Question`, `Test`, `Fee`, `Notification`.

---

### 2. `User`
Authentication & credential store for users with system access (**Admin** and **Student** only).

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Multi-tenant institute reference |
| `email` | `VARCHAR(191)` | UNIQUE, NOT NULL | Login email address |
| `passwordHash` | `VARCHAR(255)` | NOT NULL | Argon2 / bcrypt hashed password |
| `role` | `ENUM` | NOT NULL (`ADMIN`, `STUDENT`) | User access role |
| `status` | `ENUM` | DEFAULT: `ACTIVE` (`ACTIVE`, `INACTIVE`, `BLOCKED`) | Account status |
| `lastLoginAt` | `DATETIME(3)` | NULLABLE | Last successful login |
| `refreshToken` | `TEXT` | NULLABLE | Hashed refresh token / session tracker |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`.
- Has one `Student` (if role = `STUDENT`).
- Has many `Notification`.

---

### 3. `Student`
Profile and academic details for enrolled students.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `userId` | `VARCHAR(36)` / UUID | FK -> `User(id)`, UNIQUE, NOT NULL | Authentication user reference |
| `admissionNumber`| `VARCHAR(50)` | UNIQUE, NOT NULL | Unique student admission/registration ID |
| `firstName` | `VARCHAR(100)` | NOT NULL | First name |
| `lastName` | `VARCHAR(100)` | NOT NULL | Last name |
| `email` | `VARCHAR(191)` | NOT NULL | Contact email |
| `phone` | `VARCHAR(20)` | NULLABLE | Student mobile number |
| `dateOfBirth` | `DATE` | NULLABLE | Birth date |
| `gender` | `ENUM` | NULLABLE (`MALE`, `FEMALE`, `OTHER`) | Gender |
| `address` | `TEXT` | NULLABLE | Residential address |
| `avatarUrl` | `VARCHAR(500)` | NULLABLE | Profile picture URL |
| `guardianName` | `VARCHAR(150)` | NULLABLE | Parent/Guardian full name |
| `guardianPhone`| `VARCHAR(20)` | NULLABLE | Parent/Guardian phone number |
| `guardianEmail`| `VARCHAR(191)` | NULLABLE | Parent/Guardian email |
| `status` | `ENUM` | DEFAULT: `ACTIVE` (`ACTIVE`, `INACTIVE`, `PASSED_OUT`, `DROPPED`) | Student academic status |
| `admissionDate` | `DATE` | NOT NULL | Date of enrollment |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`, Belongs to `User`.
- Has many `StudentBatch`, `Attendance`, `TestAttempt`, `Result`, `Fee`.

---

### 4. `Teacher`
Managed faculty record. **No login credentials.**

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `employeeCode` | `VARCHAR(50)` | UNIQUE, NOT NULL | Teacher/Employee ID code |
| `firstName` | `VARCHAR(100)` | NOT NULL | First name |
| `lastName` | `VARCHAR(100)` | NOT NULL | Last name |
| `email` | `VARCHAR(191)` | NOT NULL | Official/contact email |
| `phone` | `VARCHAR(20)` | NOT NULL | Mobile number |
| `gender` | `ENUM` | NULLABLE (`MALE`, `FEMALE`, `OTHER`) | Gender |
| `qualification` | `VARCHAR(255)` | NULLABLE | Highest qualification (e.g. M.Sc, B.Tech) |
| `specialization`| `VARCHAR(255)` | NULLABLE | Specialization domain (e.g. Organic Chemistry) |
| `experienceYears`| `DECIMAL(4,1)`| DEFAULT: `0.0` | Total teaching experience in years |
| `avatarUrl` | `VARCHAR(500)` | NULLABLE | Profile picture URL |
| `bio` | `TEXT` | NULLABLE | Short biography / description |
| `status` | `ENUM` | DEFAULT: `ACTIVE` (`ACTIVE`, `INACTIVE`, `RESIGNED`) | Operational status |
| `joiningDate` | `DATE` | NOT NULL | Date of joining |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`.
- Has many `TeacherSubject`, `TeacherAssignment`, `Timetable`.

---

### 5. `Course`
Educational program or curriculum (e.g. "IIT-JEE 2-Year Program", "Class 12 CBSE Board").

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `name` | `VARCHAR(191)` | NOT NULL | Course title |
| `code` | `VARCHAR(50)` | NOT NULL | Unique course code (e.g. `JEE-2027`) |
| `description` | `TEXT` | NULLABLE | Detailed description |
| `durationMonths`| `INT` | NULLABLE | Duration in months |
| `status` | `ENUM` | DEFAULT: `ACTIVE` (`ACTIVE`, `INACTIVE`, `ARCHIVED`) | Course status |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`.
- Has many `Subject`, `Batch`, `TeacherAssignment`.

---

### 6. `Subject`
Specific discipline or topic belonging to a Course (e.g. "Physics", "Calculus").

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `courseId` | `VARCHAR(36)` / UUID | FK -> `Course(id)`, NOT NULL | Associated course |
| `name` | `VARCHAR(191)` | NOT NULL | Subject name |
| `code` | `VARCHAR(50)` | NOT NULL | Subject code (e.g. `PHY-101`) |
| `description` | `TEXT` | NULLABLE | Description / syllabus overview |
| `status` | `ENUM` | DEFAULT: `ACTIVE` (`ACTIVE`, `INACTIVE`) | Status |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`, Belongs to `Course`.
- Has many `TeacherSubject`, `TeacherAssignment`, `Timetable`, `StudyMaterial`, `Question`, `Test`.

---

### 7. `Batch`
Specific group of students taking a course together (e.g. "Morning Batch A - 2026").

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `courseId` | `VARCHAR(36)` / UUID | FK -> `Course(id)`, NOT NULL | Associated course |
| `name` | `VARCHAR(191)` | NOT NULL | Batch name |
| `code` | `VARCHAR(50)` | NOT NULL | Unique batch code (e.g. `BATCH-JEE-A1`) |
| `startDate` | `DATE` | NOT NULL | Batch start date |
| `endDate` | `DATE` | NULLABLE | Expected completion date |
| `maxStrength` | `INT` | DEFAULT: `60` | Maximum student capacity |
| `status` | `ENUM` | DEFAULT: `ACTIVE` (`UPCOMING`, `ACTIVE`, `COMPLETED`, `CANCELLED`) | Batch status |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`, Belongs to `Course`.
- Has many `StudentBatch`, `TeacherAssignment`, `Timetable`, `StudyMaterial`, `Attendance`, `Test`, `Fee`.

---

### 8. `StudentBatch`
Junction entity linking Students to Batches with enrollment status and history.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `studentId` | `VARCHAR(36)` / UUID | FK -> `Student(id)`, NOT NULL | Enrolled student |
| `batchId` | `VARCHAR(36)` / UUID | FK -> `Batch(id)`, NOT NULL | Assigned batch |
| `rollNumber` | `VARCHAR(50)` | NULLABLE | Roll number inside this batch |
| `enrolledAt` | `DATE` | DEFAULT: `CURRENT_DATE` | Enrollment date |
| `status` | `ENUM` | DEFAULT: `ACTIVE` (`ACTIVE`, `TRANSFERRED`, `COMPLETED`, `DROPPED`) | Status in this batch |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Constraints & Indexes:**
- `UNIQUE(studentId, batchId)`

**Relationships:**
- Belongs to `Student`, Belongs to `Batch`.

---

### 9. `TeacherSubject`
Defines which subjects a teacher is qualified / permitted to teach.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `teacherId` | `VARCHAR(36)` / UUID | FK -> `Teacher(id)`, NOT NULL | Teacher reference |
| `subjectId` | `VARCHAR(36)` / UUID | FK -> `Subject(id)`, NOT NULL | Subject reference |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |

**Constraints & Indexes:**
- `UNIQUE(teacherId, subjectId)`

**Relationships:**
- Belongs to `Teacher`, Belongs to `Subject`.

---

### 10. `TeacherAssignment`
Allocates a Teacher to a specific Subject within a Batch/Course.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `teacherId` | `VARCHAR(36)` / UUID | FK -> `Teacher(id)`, NOT NULL | Assigned teacher |
| `batchId` | `VARCHAR(36)` / UUID | FK -> `Batch(id)`, NOT NULL | Batch where class is held |
| `subjectId` | `VARCHAR(36)` / UUID | FK -> `Subject(id)`, NOT NULL | Subject taught |
| `courseId` | `VARCHAR(36)` / UUID | FK -> `Course(id)`, NOT NULL | Course scoping reference |
| `status` | `ENUM` | DEFAULT: `ACTIVE` (`ACTIVE`, `INACTIVE`) | Assignment status |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Constraints & Indexes:**
- `UNIQUE(teacherId, batchId, subjectId)`

**Relationships:**
- Belongs to `Teacher`, Belongs to `Batch`, Belongs to `Subject`, Belongs to `Course`.

---

### 11. `Timetable`
Class scheduling slot for batches, subjects, and teachers.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `batchId` | `VARCHAR(36)` / UUID | FK -> `Batch(id)`, NOT NULL | Batch having class |
| `subjectId` | `VARCHAR(36)` / UUID | FK -> `Subject(id)`, NOT NULL | Subject taught |
| `teacherId` | `VARCHAR(36)` / UUID | FK -> `Teacher(id)`, NOT NULL | Teacher conducting class |
| `dayOfWeek` | `ENUM` | NOT NULL (`MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`) | Recurring day |
| `startTime` | `TIME` | NOT NULL | Class start time (e.g. 09:00:00) |
| `endTime` | `TIME` | NOT NULL | Class end time (e.g. 10:30:00) |
| `roomNumber` | `VARCHAR(50)` | NULLABLE | Classroom / Lab number |
| `meetingLink`| `VARCHAR(500)` | NULLABLE | Online meeting URL if virtual |
| `status` | `ENUM` | DEFAULT: `ACTIVE` (`ACTIVE`, `CANCELLED`, `RESCHEDULED`) | Schedule status |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`, Belongs to `Batch`, Belongs to `Subject`, Belongs to `Teacher`.

---

### 12. `StudyMaterial`
Notes, PDFs, video links, and assignment sheets shared with students.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `subjectId` | `VARCHAR(36)` / UUID | FK -> `Subject(id)`, NOT NULL | Associated subject |
| `batchId` | `VARCHAR(36)` / UUID | FK -> `Batch(id)`, NULLABLE | Batch scoped (NULL = all batches in subject) |
| `title` | `VARCHAR(255)` | NOT NULL | Material title |
| `description` | `TEXT` | NULLABLE | Description / chapter details |
| `fileUrl` | `VARCHAR(500)` | NOT NULL | Storage URL (S3, Cloudinary, Local) |
| `fileType` | `ENUM` | NOT NULL (`PDF`, `DOC`, `VIDEO`, `LINK`, `IMAGE`, `OTHER`) | Resource format |
| `fileSizeBytes`| `BIGINT` | NULLABLE | File size in bytes |
| `uploadedBy` | `VARCHAR(36)` / UUID | FK -> `User(id)`, NOT NULL | Admin user who uploaded |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`, Belongs to `Subject`, Belongs to `Batch` (optional), Belongs to `User`.

---

### 13. `Attendance`
Daily or class-level attendance records for students.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `batchId` | `VARCHAR(36)` / UUID | FK -> `Batch(id)`, NOT NULL | Batch reference |
| `studentId` | `VARCHAR(36)` / UUID | FK -> `Student(id)`, NOT NULL | Student reference |
| `date` | `DATE` | NOT NULL | Attendance date |
| `status` | `ENUM` | NOT NULL (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`) | Attendance status |
| `remarks` | `VARCHAR(255)` | NULLABLE | Reason/remarks for absence/delay |
| `recordedBy` | `VARCHAR(36)` / UUID | FK -> `User(id)`, NOT NULL | Admin who recorded attendance |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Constraints & Indexes:**
- `UNIQUE(batchId, studentId, date)`

**Relationships:**
- Belongs to `Institute`, Belongs to `Batch`, Belongs to `Student`, Belongs to `User`.

---

### 14. `Question`
Question Bank repository item.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `subjectId` | `VARCHAR(36)` / UUID | FK -> `Subject(id)`, NOT NULL | Associated subject |
| `type` | `ENUM` | NOT NULL (`SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `NUMERICAL`, `TRUE_FALSE`) | Question format |
| `difficulty` | `ENUM` | DEFAULT: `MEDIUM` (`EASY`, `MEDIUM`, `HARD`) | Difficulty level |
| `questionText` | `TEXT` | NOT NULL | Question body / LaTeX / Markdown |
| `explanation` | `TEXT` | NULLABLE | Solution explanation |
| `defaultMarks` | `DECIMAL(5,2)`| DEFAULT: `4.00` | Default positive marks |
| `defaultNegativeMarks` | `DECIMAL(5,2)` | DEFAULT: `1.00` | Default penalty marks |
| `numericalAnswer` | `VARCHAR(100)` | NULLABLE | Expected answer if type = `NUMERICAL` |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`, Belongs to `Subject`.
- Has many `QuestionOption`, `TestQuestion`, `StudentAnswer`.

---

### 15. `QuestionOption`
Choice options for MCQ / Multi-select / True-False questions.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `questionId` | `VARCHAR(36)` / UUID | FK -> `Question(id)`, NOT NULL | Associated question |
| `optionText` | `TEXT` | NOT NULL | Option content / text |
| `isCorrect` | `BOOLEAN` | DEFAULT: `FALSE`, NOT NULL | Flag for correct choice |
| `sortOrder` | `INT` | DEFAULT: `0`, NOT NULL | Display order (1, 2, 3, 4) |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Question`.

---

### 16. `Test`
Online exam, mock test, or quiz.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `batchId` | `VARCHAR(36)` / UUID | FK -> `Batch(id)`, NULLABLE | Scoped batch (NULL = open to course) |
| `subjectId` | `VARCHAR(36)` / UUID | FK -> `Subject(id)`, NULLABLE | Subject test (NULL = multi-subject full test) |
| `title` | `VARCHAR(255)` | NOT NULL | Test title |
| `description` | `TEXT` | NULLABLE | Test instructions & syllabus |
| `durationMinutes`| `INT` | NOT NULL | Duration in minutes (e.g. 180) |
| `totalMarks` | `DECIMAL(6,2)`| NOT NULL | Total maximum marks |
| `passingMarks` | `DECIMAL(6,2)`| NOT NULL | Passing threshold |
| `startTime` | `DATETIME(3)` | NOT NULL | Test window start |
| `endTime` | `DATETIME(3)` | NOT NULL | Test window deadline |
| `isPublished` | `BOOLEAN` | DEFAULT: `FALSE` | Visibility to students |
| `status` | `ENUM` | DEFAULT: `DRAFT` (`DRAFT`, `SCHEDULED`, `LIVE`, `COMPLETED`, `CANCELLED`) | Lifecycle status |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`, Belongs to `Batch` (optional), Belongs to `Subject` (optional).
- Has many `TestQuestion`, `TestAttempt`, `Result`.

---

### 17. `TestQuestion`
Junction mapping Questions to Tests with custom ordering and mark overrides.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `testId` | `VARCHAR(36)` / UUID | FK -> `Test(id)`, NOT NULL | Test reference |
| `questionId` | `VARCHAR(36)` / UUID | FK -> `Question(id)`, NOT NULL | Question reference |
| `sectionName` | `VARCHAR(100)` | NULLABLE | Section (e.g. "Physics - Section A") |
| `sortOrder` | `INT` | DEFAULT: `1`, NOT NULL | Question display order |
| `marks` | `DECIMAL(5,2)`| NOT NULL | Marks for this question in this test |
| `negativeMarks`| `DECIMAL(5,2)`| DEFAULT: `0.00` | Penalty marks for wrong answer |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |

**Constraints & Indexes:**
- `UNIQUE(testId, questionId)`

**Relationships:**
- Belongs to `Test`, Belongs to `Question`.

---

### 18. `TestAttempt`
A student's session/submission for a particular test.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `testId` | `VARCHAR(36)` / UUID | FK -> `Test(id)`, NOT NULL | Test reference |
| `studentId` | `VARCHAR(36)` / UUID | FK -> `Student(id)`, NOT NULL | Student taking test |
| `startedAt` | `DATETIME(3)` | DEFAULT: `NOW()`, NOT NULL | Attempt start timestamp |
| `submittedAt` | `DATETIME(3)` | NULLABLE | Submission timestamp |
| `score` | `DECIMAL(6,2)`| DEFAULT: `0.00` | Evaluated total score |
| `totalAttempted`| `INT` | DEFAULT: `0` | Number of questions answered |
| `totalCorrect` | `INT` | DEFAULT: `0` | Correct answers count |
| `totalIncorrect`| `INT` | DEFAULT: `0` | Incorrect answers count |
| `status` | `ENUM` | DEFAULT: `IN_PROGRESS` (`IN_PROGRESS`, `SUBMITTED`, `EVALUATED`, `ABANDONED`) | Attempt status |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Constraints & Indexes:**
- `UNIQUE(testId, studentId)`

**Relationships:**
- Belongs to `Test`, Belongs to `Student`.
- Has many `StudentAnswer`, Has one `Result`.

---

### 19. `StudentAnswer`
Individual answer submitted by a student for a question in a test attempt.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `attemptId` | `VARCHAR(36)` / UUID | FK -> `TestAttempt(id)`, NOT NULL | Associated attempt |
| `questionId` | `VARCHAR(36)` / UUID | FK -> `Question(id)`, NOT NULL | Associated question |
| `selectedOptionIds`| `JSON` | NULLABLE | Array of selected `QuestionOption.id`s |
| `textAnswer` | `TEXT` | NULLABLE | Numerical / subjective answer string |
| `isCorrect` | `BOOLEAN` | NULLABLE | Whether marked correct |
| `marksAwarded` | `DECIMAL(5,2)`| DEFAULT: `0.00` | Final marks awarded (+ve, 0, or -ve) |
| `timeSpentSeconds`| `INT` | DEFAULT: `0` | Seconds spent on this question |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |

**Constraints & Indexes:**
- `UNIQUE(attemptId, questionId)`

**Relationships:**
- Belongs to `TestAttempt`, Belongs to `Question`.

---

### 20. `Result`
Final published score, rank, and performance analytics for a student's test.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `testId` | `VARCHAR(36)` / UUID | FK -> `Test(id)`, NOT NULL | Test reference |
| `studentId` | `VARCHAR(36)` / UUID | FK -> `Student(id)`, NOT NULL | Student reference |
| `attemptId` | `VARCHAR(36)` / UUID | FK -> `TestAttempt(id)`, UNIQUE, NOT NULL | Attempt reference |
| `totalMarksObtained`| `DECIMAL(6,2)`| NOT NULL | Total marks scored |
| `percentage` | `DECIMAL(5,2)`| NOT NULL | Percentage scored |
| `percentile` | `DECIMAL(5,2)`| NULLABLE | Percentile among test batch |
| `rank` | `INT` | NULLABLE | Rank in batch |
| `isPassed` | `BOOLEAN` | NOT NULL | Pass/Fail status |
| `remarks` | `VARCHAR(255)` | NULLABLE | Admin/Teacher remarks |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`, Belongs to `Test`, Belongs to `Student`, Belongs to `TestAttempt`.

---

### 21. `Fee`
Fee structure / invoice allocated to a student for a course or batch.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `studentId` | `VARCHAR(36)` / UUID | FK -> `Student(id)`, NOT NULL | Student billed |
| `batchId` | `VARCHAR(36)` / UUID | FK -> `Batch(id)`, NULLABLE | Associated batch |
| `title` | `VARCHAR(191)` | NOT NULL | Fee invoice title (e.g. "Term 1 Tuition Fee") |
| `totalAmount` | `DECIMAL(10,2)`| NOT NULL | Total billed amount |
| `discountAmount`| `DECIMAL(10,2)`| DEFAULT: `0.00` | Scholarship / Discount |
| `finalAmount` | `DECIMAL(10,2)`| NOT NULL | Net amount payable |
| `paidAmount` | `DECIMAL(10,2)`| DEFAULT: `0.00` | Accumulated amount paid |
| `dueDate` | `DATE` | NOT NULL | Payment deadline |
| `status` | `ENUM` | DEFAULT: `PENDING` (`PENDING`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED`) | Payment status |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |
| `updatedAt` | `DATETIME(3)` | ON UPDATE `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`, Belongs to `Student`, Belongs to `Batch` (optional).
- Has many `Payment`.

---

### 22. `Payment`
Transaction record for a fee payment (supports full and partial payments).

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `feeId` | `VARCHAR(36)` / UUID | FK -> `Fee(id)`, NOT NULL | Associated fee invoice |
| `receiptNumber`| `VARCHAR(100)` | UNIQUE, NOT NULL | Unique receipt voucher number |
| `amount` | `DECIMAL(10,2)`| NOT NULL | Amount paid in this transaction |
| `paymentMethod`| `ENUM` | NOT NULL (`CASH`, `UPI`, `CARD`, `NET_BANKING`, `CHEQUE`, `OTHER`) | Payment method |
| `transactionReference`| `VARCHAR(150)`| NULLABLE | Bank/UPI reference number |
| `paymentDate` | `DATETIME(3)` | DEFAULT: `NOW()`, NOT NULL | Date and time of payment |
| `receivedBy` | `VARCHAR(36)` / UUID | FK -> `User(id)`, NOT NULL | Admin user who collected payment |
| `remarks` | `VARCHAR(255)` | NULLABLE | Payment notes |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Fee`, Belongs to `User`.

---

### 23. `Notification`
System alerts, batch announcements, test releases, fee reminders, and timetable updates.

| Field | Type | Attributes / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / UUID | PK, Default: UUID | Unique identifier |
| `instituteId` | `VARCHAR(36)` / UUID | FK -> `Institute(id)`, NOT NULL | Institute reference |
| `recipientId` | `VARCHAR(36)` / UUID | FK -> `User(id)`, NOT NULL | Target user (Admin or Student) |
| `title` | `VARCHAR(255)` | NOT NULL | Notification headline |
| `message` | `TEXT` | NOT NULL | Body content |
| `type` | `ENUM` | NOT NULL (`ANNOUNCEMENT`, `ATTENDANCE`, `TEST`, `RESULT`, `FEE`, `TIMETABLE`, `SYSTEM`) | Category |
| `actionUrl` | `VARCHAR(500)` | NULLABLE | Navigation link / route |
| `isRead` | `BOOLEAN` | DEFAULT: `FALSE`, NOT NULL | Read status |
| `readAt` | `DATETIME(3)` | NULLABLE | Timestamp when marked read |
| `createdAt` | `DATETIME(3)` | DEFAULT: `NOW()` | Timestamp |

**Relationships:**
- Belongs to `Institute`, Belongs to `User`.
