# Institute Management System — Entity Relationships Specification
**Document Version:** 1.0.0  
**Phase:** Step 0.2 — Define Entity Relationships  

---

## 1. Relationship Architecture Overview

The database design uses strict relational modeling with standard referential integrity rules (Foreign Keys, Constraints, and Cascade Rules).

### Cardinality Summary
- **1-to-1 (1:1):**
  - `User` ⟷ `Student` (Authentication user account to student domain profile)
  - `TestAttempt` ⟷ `Result` (Each graded attempt produces exactly one final evaluated result)
- **1-to-Many (1:N):**
  - Tenant scoping: `Institute` ⟷ All Domain Aggregates
  - Academic hierarchy: `Course` ⟷ `Subject`, `Course` ⟷ `Batch`
  - Assessment structure: `Question` ⟷ `QuestionOption`, `Test` ⟷ `TestAttempt`, `TestAttempt` ⟷ `StudentAnswer`
  - Financials: `Fee` ⟷ `Payment`
- **Many-to-Many (M:N via Explicit Junction Tables):**
  - `Student` ⟷ `Batch` via `StudentBatch`
  - `Teacher` ⟷ `Subject` via `TeacherSubject`
  - `Teacher` ⟷ `Subject` ⟷ `Batch` via `TeacherAssignment`
  - `Test` ⟷ `Question` via `TestQuestion`

---

## 2. Detailed Entity Relationships & Referential Integrity Rules

---

### Module 1: Tenant & Authentication Relationships

#### 1. `Institute` ⟷ `User`
- **Type:** 1-to-Many (1:N)
- **Foreign Key:** `User.instituteId` → `Institute.id`
- **On Delete:** `CASCADE` (Deleting an institute removes associated user credentials)
- **On Update:** `CASCADE`
- **Business Rule:** Every admin and student account is scoped to an institute.

#### 2. `User` ⟷ `Student`
- **Type:** 1-to-1 (1:1)
- **Foreign Key:** `Student.userId` → `User.id` (Unique Constraint)
- **On Delete:** `CASCADE` (Removing a login user removes the corresponding student profile)
- **On Update:** `CASCADE`
- **Business Rule:** Only students with `role = STUDENT` have a linked `User` record. A student must log in with their own credentials and can only access records associated with their `studentId`.

#### 3. `Teacher` (No User Account)
- **Type:** Domain entity directly under `Institute`
- **Foreign Key:** `Teacher.instituteId` → `Institute.id`
- **Business Rule:** Teachers are managed as staff records by the Admin. They **do not have credentials or a `userId`**.

---

### Module 2: Academic Hierarchy & Enrollment Relationships

```
[Institute]
    │
    ├── (1:N) ──> [Course]
    │                 │
    │                 ├── (1:N) ──> [Subject]
    │                 │
    │                 └── (1:N) ──> [Batch]
    │                                  │
    └── (1:N) ──> [Student] ──(1:N)──> [StudentBatch] <──(1:N)── [Batch]
```

#### 4. `Course` ⟷ `Subject`
- **Type:** 1-to-Many (1:N)
- **Foreign Key:** `Subject.courseId` → `Course.id`
- **On Delete:** `CASCADE` (Deleting a course removes its syllabus subjects)
- **On Update:** `CASCADE`

#### 5. `Course` ⟷ `Batch`
- **Type:** 1-to-Many (1:N)
- **Foreign Key:** `Batch.courseId` → `Course.id`
- **On Delete:** `RESTRICT` (Cannot delete a course if active batches exist)
- **On Update:** `CASCADE`

#### 6. `Student` ⟷ `Batch` via `StudentBatch` (M:N Junction)
- **Parent 1:** `Student (1) ── (N) StudentBatch` (`StudentBatch.studentId` → `Student.id`, OnDelete: `CASCADE`)
- **Parent 2:** `Batch (1) ── (N) StudentBatch` (`StudentBatch.batchId` → `Batch.id`, OnDelete: `CASCADE`)
- **Constraints:** `UNIQUE(studentId, batchId)`
- **Business Rule:** A student can be enrolled in multiple batches (e.g., Physics Crash Course and Regular Math Batch). History is preserved via status flags (`ACTIVE`, `TRANSFERRED`, `COMPLETED`).

---

### Module 3: Faculty Allocation & Timetable Relationships

```
[Teacher] ──(1:N)──> [TeacherSubject] <──(1:N)── [Subject]
   │
   ├── (1:N) ──> [TeacherAssignment] <──(1:N)── [Batch]
   │                     │
   │                     └── (1:N) ──> [Subject]
   │
   └── (1:N) ──> [Timetable] <──(1:N)── [Batch]
                      │
                      └── (1:N) ──> [Subject]
```

#### 7. `Teacher` ⟷ `Subject` via `TeacherSubject` (Faculty Qualification M:N)
- **Parent 1:** `Teacher (1) ── (N) TeacherSubject` (`TeacherSubject.teacherId` → `Teacher.id`, OnDelete: `CASCADE`)
- **Parent 2:** `Subject (1) ── (N) TeacherSubject` (`TeacherSubject.subjectId` → `Subject.id`, OnDelete: `CASCADE`)
- **Constraints:** `UNIQUE(teacherId, subjectId)`
- **Business Rule:** Tracks which subjects a teacher is qualified to teach.

#### 8. `TeacherAssignment` (3-Way Allocation Junction)
- **Foreign Keys:**
  - `TeacherAssignment.teacherId` → `Teacher.id` (OnDelete: `CASCADE`)
  - `TeacherAssignment.batchId` → `Batch.id` (OnDelete: `CASCADE`)
  - `TeacherAssignment.subjectId` → `Subject.id` (OnDelete: `CASCADE`)
  - `TeacherAssignment.courseId` → `Course.id` (OnDelete: `CASCADE`)
- **Constraints:** `UNIQUE(teacherId, batchId, subjectId)`
- **Business Rule:** Explicit assignment representing "Teacher X teaches Subject Y in Batch Z".

#### 9. `Timetable` (Class Scheduling)
- **Foreign Keys:**
  - `Timetable.instituteId` → `Institute.id` (OnDelete: `CASCADE`)
  - `Timetable.batchId` → `Batch.id` (OnDelete: `CASCADE`)
  - `Timetable.subjectId` → `Subject.id` (OnDelete: `CASCADE`)
  - `Timetable.teacherId` → `Teacher.id` (OnDelete: `RESTRICT`)
- **Business Rule:** Defines scheduled periods per weekday with start time, end time, classroom, and optional virtual meeting links.

---

### Module 4: Materials & Attendance Relationships

#### 10. `StudyMaterial`
- **Foreign Keys:**
  - `StudyMaterial.instituteId` → `Institute.id` (OnDelete: `CASCADE`)
  - `StudyMaterial.subjectId` → `Subject.id` (OnDelete: `CASCADE`)
  - `StudyMaterial.batchId` → `Batch.id` (OnDelete: `SET NULL`, Nullable — if null, accessible to all batches taking this subject)
  - `StudyMaterial.uploadedBy` → `User.id` (OnDelete: `RESTRICT`)

#### 11. `Attendance`
- **Foreign Keys:**
  - `Attendance.instituteId` → `Institute.id` (OnDelete: `CASCADE`)
  - `Attendance.batchId` → `Batch.id` (OnDelete: `CASCADE`)
  - `Attendance.studentId` → `Student.id` (OnDelete: `CASCADE`)
  - `Attendance.recordedBy` → `User.id` (OnDelete: `RESTRICT`)
- **Constraints:** `UNIQUE(batchId, studentId, date)`
- **Business Rule:** One attendance record per student per batch per date.

---

### Module 5: Examination & Assessment Engine Relationships

```
[Subject] ──(1:N)──> [Question] ──(1:N)──> [QuestionOption]
                          │
                          └──(1:N)──> [TestQuestion] <──(1:N)── [Test] <──(1:N)── [Batch / Subject]
                                                                  │
[Student] ──(1:N)────────────────────────────────────────> [TestAttempt]
                                                                  │
                                              ┌───────────────────┴───────────────────┐
                                              │ (1:N)                                 │ (1:1)
                                              ▼                                       ▼
                                       [StudentAnswer]                             [Result]
                                              │                                       │
                                              └──> [Question]                         └──> [Student, Test]
```

#### 12. `Question` ⟷ `QuestionOption`
- **Type:** 1-to-Many (1:N)
- **Foreign Key:** `QuestionOption.questionId` → `Question.id`
- **On Delete:** `CASCADE` (Removing a question deletes all its option choices)
- **On Update:** `CASCADE`

#### 13. `Test` ⟷ `Question` via `TestQuestion` (Exam Composition M:N)
- **Parent 1:** `Test (1) ── (N) TestQuestion` (`TestQuestion.testId` → `Test.id`, OnDelete: `CASCADE`)
- **Parent 2:** `Question (1) ── (N) TestQuestion` (`TestQuestion.questionId` → `Question.id`, OnDelete: `RESTRICT`)
- **Constraints:** `UNIQUE(testId, questionId)`
- **Attributes:** `marks`, `negativeMarks`, `sortOrder`, `sectionName`
- **Business Rule:** Allows questions to be reused across multiple tests with test-specific marking schemes.

#### 14. `Test` ⟷ `TestAttempt`
- **Type:** 1-to-Many (1:N)
- **Foreign Key:** `TestAttempt.testId` → `Test.id` (OnDelete: `CASCADE`)
- **Foreign Key:** `TestAttempt.studentId` → `Student.id` (OnDelete: `CASCADE`)
- **Constraints:** `UNIQUE(testId, studentId)` (Single attempt per exam)
- **Business Rule:** Captures a student's live exam session, timer status, and start/submission timestamps.

#### 15. `TestAttempt` ⟷ `StudentAnswer`
- **Type:** 1-to-Many (1:N)
- **Foreign Key:** `StudentAnswer.attemptId` → `TestAttempt.id` (OnDelete: `CASCADE`)
- **Foreign Key:** `StudentAnswer.questionId` → `Question.id` (OnDelete: `RESTRICT`)
- **Constraints:** `UNIQUE(attemptId, questionId)`
- **Business Rule:** Stores the student's chosen option IDs or numerical answer and calculated marks awarded.

#### 16. `TestAttempt` ⟷ `Result`
- **Type:** 1-to-1 (1:1)
- **Foreign Key:** `Result.attemptId` → `TestAttempt.id` (OnDelete: `CASCADE`, Unique Constraint)
- **Foreign Keys:** `Result.testId` → `Test.id`, `Result.studentId` → `Student.id`, `Result.instituteId` → `Institute.id`
- **Business Rule:** Published scorecard containing final calculated score, percentage, rank, percentile, and pass/fail outcome.

---

### Module 6: Billing & Communications Relationships

```
[Institute]
    │
    ├── (1:N) ──> [Fee] <──(1:N)── [Student]
    │               │
    │               └── (1:N) ──> [Payment] <──(1:N)── [User (Admin Collector)]
    │
    └── (1:N) ──> [Notification] <──(1:N)── [User (Recipient)]
```

#### 17. `Student` ⟷ `Fee` ⟷ `Payment`
- **Student ⟷ Fee (1:N):**
  - `Fee.studentId` → `Student.id` (OnDelete: `CASCADE`)
  - `Fee.batchId` → `Batch.id` (OnDelete: `SET NULL`, Nullable)
- **Fee ⟷ Payment (1:N):**
  - `Payment.feeId` → `Fee.id` (OnDelete: `CASCADE`)
  - `Payment.receivedBy` → `User.id` (OnDelete: `RESTRICT`)
- **Business Rule:** A Fee represents an invoice (e.g. $1000 due). Multiple installment `Payment` records can link to a single `Fee` until `paidAmount == finalAmount`.

#### 18. `User` ⟷ `Notification`
- **Type:** 1-to-Many (1:N)
- **Foreign Key:** `Notification.recipientId` → `User.id` (OnDelete: `CASCADE`)
- **Foreign Key:** `Notification.instituteId` → `Institute.id` (OnDelete: `CASCADE`)
- **Business Rule:** Dispatches targeted in-app push/web notifications to Admins or individual Students.

---

## 3. Referential Integrity & Cascade Matrix Table

| Parent Entity | Child Entity | Foreign Key Column | Cardinality | On Delete | On Update | Reason / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Institute` | `User` | `instituteId` | 1:N | `CASCADE` | `CASCADE` | Tenant removal cleans users |
| `Institute` | `Student` | `instituteId` | 1:N | `CASCADE` | `CASCADE` | Tenant removal cleans students |
| `Institute` | `Teacher` | `instituteId` | 1:N | `CASCADE` | `CASCADE` | Tenant removal cleans faculty |
| `Institute` | `Course` | `instituteId` | 1:N | `CASCADE` | `CASCADE` | Tenant removal cleans courses |
| `User` | `Student` | `userId` | 1:1 | `CASCADE` | `CASCADE` | Deleting login user removes student profile |
| `Course` | `Subject` | `courseId` | 1:N | `CASCADE` | `CASCADE` | Subjects belong to course |
| `Course` | `Batch` | `courseId` | 1:N | `RESTRICT`| `CASCADE` | Prevent orphan batches on course deletion |
| `Student` | `StudentBatch` | `studentId` | 1:N | `CASCADE` | `CASCADE` | Junction cleanup |
| `Batch` | `StudentBatch` | `batchId` | 1:N | `CASCADE` | `CASCADE` | Junction cleanup |
| `Teacher` | `TeacherSubject` | `teacherId` | 1:N | `CASCADE` | `CASCADE` | Faculty qualification junction |
| `Subject` | `TeacherSubject` | `subjectId` | 1:N | `CASCADE` | `CASCADE` | Faculty qualification junction |
| `Teacher` | `TeacherAssignment`| `teacherId` | 1:N | `CASCADE` | `CASCADE` | Batch assignment junction |
| `Batch` | `TeacherAssignment`| `batchId` | 1:N | `CASCADE` | `CASCADE` | Batch assignment junction |
| `Subject` | `TeacherAssignment`| `subjectId` | 1:N | `CASCADE` | `CASCADE` | Batch assignment junction |
| `Batch` | `Timetable` | `batchId` | 1:N | `CASCADE` | `CASCADE` | Schedule belongs to batch |
| `Subject` | `Timetable` | `subjectId` | 1:N | `CASCADE` | `CASCADE` | Schedule slot for subject |
| `Teacher` | `Timetable` | `teacherId` | 1:N | `RESTRICT`| `CASCADE` | Prevent deleting active teaching staff |
| `Subject` | `StudyMaterial` | `subjectId` | 1:N | `CASCADE` | `CASCADE` | Content attached to subject |
| `Batch` | `StudyMaterial` | `batchId` | 1:N | `SET NULL`| `CASCADE` | Optional batch filter |
| `Batch` | `Attendance` | `batchId` | 1:N | `CASCADE` | `CASCADE` | Batch attendance logs |
| `Student` | `Attendance` | `studentId` | 1:N | `CASCADE` | `CASCADE` | Student attendance logs |
| `Subject` | `Question` | `subjectId` | 1:N | `RESTRICT`| `CASCADE` | Prevent losing question bank items |
| `Question`| `QuestionOption` | `questionId` | 1:N | `CASCADE` | `CASCADE` | Options belong to question |
| `Test` | `TestQuestion` | `testId` | 1:N | `CASCADE` | `CASCADE` | Exam composition junction |
| `Question`| `TestQuestion` | `questionId` | 1:N | `RESTRICT`| `CASCADE` | Question cannot be deleted if in test |
| `Test` | `TestAttempt` | `testId` | 1:N | `CASCADE` | `CASCADE` | Submissions belong to test |
| `Student` | `TestAttempt` | `studentId` | 1:N | `CASCADE` | `CASCADE` | Submissions belong to student |
| `TestAttempt` | `StudentAnswer` | `attemptId` | 1:N | `CASCADE` | `CASCADE` | Answers belong to attempt |
| `Question`| `StudentAnswer` | `questionId` | 1:N | `RESTRICT`| `CASCADE` | Keep audit trail of questions answered |
| `TestAttempt` | `Result` | `attemptId` | 1:1 | `CASCADE` | `CASCADE` | One final result per attempt |
| `Student` | `Fee` | `studentId` | 1:N | `CASCADE` | `CASCADE` | Invoices belong to student |
| `Fee` | `Payment` | `feeId` | 1:N | `CASCADE` | `CASCADE` | Payments belong to fee invoice |
| `User` | `Payment` | `receivedBy` | 1:N | `RESTRICT`| `CASCADE` | Maintain financial audit trail |
| `User` | `Notification` | `recipientId`| 1:N | `CASCADE` | `CASCADE` | Messages belong to user |
