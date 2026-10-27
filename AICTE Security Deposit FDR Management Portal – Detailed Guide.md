# AICTE Security Deposit / FDR Management Portal

*A simple, step-by-step guide: the idea, the roles, what to build, and how to build it*

## 1. What is this project about?

Colleges that want AICTE approval may have to give AICTE some money as a safety guarantee. This is called a **security deposit**. Often the college gives it as an **FDR (Fixed Deposit Receipt)**, which is a paper or digital proof from a bank saying "this amount is locked in a fixed deposit until this date."

AICTE has to keep track of thousands of these. For each one they need to know:

- Which college gave it?
- Which bank issued it, and what is the FDR number?
- How much money is it?
- When was it issued and when does it mature (expire)?
- Is it real and verified?
- Does it need renewal? Has the college asked for it back?

Right now this is done with scattered files, emails and different registers. That causes mistakes, missed dates and a lot of repeated work.

**Our job:** build one secure website (portal) where all of this is stored, checked, tracked and reported in one place.

## 2. The problem in simple words

| Problem today | What the portal does |
| --- | --- |
| Records are in many places | One central database |
| Hard to know if an FDR is genuine | Verification step with a bank-confirmed flag |
| Officials forget maturity dates | Automatic reminders |
| Refund requests get lost | A tracked release workflow |
| No proof of who changed what | Audit trail (a permanent log) |
| Hard to see the big picture | Dashboard and reports |

## 3. Our idea in one paragraph

Colleges log in and submit their FDR details and upload the document. Officials at AICTE log in, review it, and mark it as verified or flag a problem. A background job checks dates every day and sends reminders before an FDR expires. If the college wants its money back, it raises a release request, which goes through approval steps. Everything is recorded in a log, and a dashboard shows the status of all FDRs at a glance.

## 4. The most important design idea

The problem statement says the system must **separate what the college says from what the bank confirms**.

So for every important field (FDR number, amount, maturity date), we store two things:

1. The value
2. The **source**: either *Institution-submitted* or *Bank-confirmed*

Show these with different badges (for example grey for "submitted" and green for "bank-confirmed"). This is simple to build and makes your demo stand out.

## 5. Roles: who uses the portal and what can they do?

A **role** decides what a person can see and do. This is called Role-Based Access Control (RBAC).

### 5.1 Institution User (the college)

- Register and log in
- Add a new FDR with its details
- Upload the FDR document and other required papers
- See the status of their own FDRs only
- Reply when an official flags a problem
- Upload a renewed or replacement FDR
- Raise a release or refund request
- Get reminders about expiring FDRs

### 5.2 Scrutiny Officer (AICTE Regulation Bureau)

- See all submitted FDRs
- Check the details and documents
- Run verification (rule checks and bank check)
- Add observations (notes) and flag discrepancies
- Mark records as Verified or Needs Correction
- Review release requests and recommend them

### 5.3 Approving Authority (senior official)

- Approve or reject release and refund requests
- Receive escalations for overdue or unresolved cases
- See the full dashboard

### 5.4 Admin

- Create and manage user accounts and roles
- Configure reminder days, document types and rules
- Manage the list of institutions and banks

### 5.5 Auditor (read-only)

- View audit logs and reports
- Cannot change anything

**Simple rule:** each person gets only the access they need, nothing more.

## 6. Life of an FDR (the status flow)

Every FDR moves through stages. The portal must always show the current stage.

1. **Submitted:** the college entered the details and uploaded documents.
2. **Under Scrutiny:** an officer is reviewing it.
3. **Discrepancy Flagged:** something is missing or wrong, so the college must fix it.
4. **Verified:** the details are confirmed (by rules and/or the bank).
5. **Active:** the FDR is valid and being tracked.
6. **Expiring Soon:** the maturity date is close.
7. **Matured:** the date has passed.
8. **Renewed or Replaced:** a new FDR is linked to the old one.
9. **Release Requested:** the college asks for the money back.
10. **Released or Closed:** the case is finished.

## 7. What to build, and how (feature by feature)

The problem statement lists 10 expected capabilities. Here is each one explained simply, with *what* it is and *how* to build it.

### Feature 1: Central repository of FDRs

**What:** One place that stores all deposits, organised by institution and by instrument. **How:**

- Create tables for institutions and instruments in the database.
- Each instrument stores: FDR number, bank name, amount, issue date, maturity date, status, and which institution it belongs to.
- Build a list page with search and filters (by college, bank, status, maturity month).
- Build a detail page showing everything about one FDR, including its history.

### Feature 2: Digital document management

**What:** Upload, store and view FDR scans and other papers safely. **How:**

- Accept PDF and image files only, with a size limit.
- Save files in secure storage (MinIO or S3-style storage) and keep only the file path in the database.
- Encrypt files when stored.
- Keep **versions**: if a college uploads a new file, don't delete the old one. Keep both.
- Show a document history on the FDR page.

### Feature 3: Verification and discrepancy detection

**What:** Check whether the FDR information is complete, consistent and genuine. **How:** Do this in two layers.

*Layer A: Rule checks (automatic, built by you)*

- Required fields missing
- Maturity date earlier than issue date
- Amount lower than the required deposit
- Same FDR number already used by another college (possible duplicate)
- Document missing or unreadable
- FDR already expired when submitted

Each failed rule creates a **discrepancy** entry with a clear message, for example: "Maturity date is before issue date."

*Layer B: Bank verification*

- Build a "bank verification adapter", a small module with one function like `verifyFDR(bank, fdrNumber)`.
- In the prototype, **mock it**: return fake "confirmed" or "not found" results for demo data. Real bank connections need official permission, so just design the plug-in point.
- When the bank confirms, update the field source to **Bank-confirmed**.

*Optional smart layer: OCR*

- Read the uploaded FDR image with OCR (Tesseract or a vision AI model).
- Compare the extracted text (number, amount, dates) with what the college typed.
- If they don't match, flag a discrepancy. This is a strong demo feature.

### Feature 4: Validity and maturity tracking

**What:** The system watches dates so people don't have to. **How:**

- Run a scheduled job once a day (cron job).
- For every active FDR, calculate days left until maturity.
- If days left matches a reminder point (for example 90, 60, 30, 15, 7 days), create a notification.
- Change status to **Expiring Soon** or **Matured** automatically.
- Make reminder days **configurable** by the admin (store them in a settings table, don't hard-code).

### Feature 5: Renewal and replacement monitoring

**What:** Track when a college submits a new FDR to replace an old one. **How:**

- When a new FDR is added as a renewal, link it to the old one using an `old_instrument_id` (a `renewals` table).
- Mark the old one as Renewed or Replaced.
- Show the whole chain on the detail page: Old FDR → Renewed FDR → Renewed again.

### Feature 6: Release and refund workflow

**What:** A proper process for returning the deposit, with approvals. **How:**

1. The college raises a release request on an FDR.
2. The system shows a **checklist** of conditions (for example: no pending compliance issues, required documents uploaded).
3. The scrutiny officer reviews and recommends.
4. The approving authority approves or rejects, with remarks.
5. If approved, the status becomes Released or Closed.
6. Every step is saved with who, when and comments.

Build it as a simple step-by-step state machine, where each step allows only certain roles to move to the next.

### Feature 7: Alerts and escalation

**What:** The right people are told at the right time. **How:**

- Create a `notifications` table. Show them as a bell icon in the app, and also send email.
- Alert types: new submission, discrepancy flagged, verification pending, maturity approaching, overdue renewal, release request update.
- **Escalation:** if a case stays unresolved for more than X days, notify the next senior person. The scheduled job can check this too.

### Feature 8: Dashboard and reports

**What:** A single screen to see the full picture. **How:**

- Show summary cards: Active, Expiring, Matured, Renewed, Released, Pending verification.
- Add charts: FDRs by status, maturities per month (timeline), amount by bank.
- Add lists: pending verifications, missing documents, cases needing action.
- Add export to CSV and PDF.
- Use database queries with `GROUP BY` to produce the counts.

### Feature 9: Audit trail and access control

**What:** A permanent record of every action, plus strict permissions. **How:**

- Create an `audit_logs` table with: who, what action, which record, when, old value, new value.
- **Never allow edit or delete** on this table (append-only).
- Write to it automatically on every create, update, verify, approve or login.
- Check the user's role on every API call (middleware).

### Feature 10: Integration and data security

**What:** Safe handling of sensitive financial data, and readiness to connect with other systems. **How:**

- Use HTTPS everywhere.
- Hash passwords (bcrypt or argon2). Never store plain passwords.
- Use JWT tokens for login; add optional two-factor login (OTP) for officials.
- Encrypt sensitive fields and files at rest.
- Validate all inputs to prevent attacks like SQL injection.
- Build **API endpoints** (and stubs) so AICTE's existing systems and bank services can be connected later.

## 8. Suggested technology (simple choices)

| Part | Suggestion | Why |
| --- | --- | --- |
| Frontend | React or Next.js with Tailwind CSS | Fast to build good-looking pages |
| Backend | Node.js (Express or NestJS) or Python FastAPI | Easy APIs, good libraries |
| Database | PostgreSQL | Reliable, great for relational data and reports |
| File storage | MinIO (S3-compatible) | Free, runs locally for the demo |
| Scheduler | node-cron or Celery | Runs the daily date checks |
| Notifications | Email (SMTP) + in-app | Simple and effective |
| Authentication | JWT + RBAC | Standard and secure |
| OCR (optional) | Tesseract or a vision AI model | Auto-reads FDR scans |
| Charts | Recharts or Chart.js | Easy dashboard charts |

Pick the stack you already know best. A working prototype matters more than a fancy stack.

## 9. Database design (main tables)

- **institutions:** id, name, AICTE ID, state, contact email
- **users:** id, name, email, password hash, role, institution\_id (for college users)
- **instruments:** id, institution\_id, fdr\_number, bank\_name, amount, issue\_date, maturity\_date, status, created\_at
- **field\_sources:** instrument\_id, field\_name, source (submitted or bank-confirmed), confirmed\_at
- **instrument\_documents:** id, instrument\_id, file\_path, doc\_type, version, uploaded\_by, uploaded\_at
- **verifications:** id, instrument\_id, method (rules, bank, OCR), result, checked\_by, checked\_at
- **discrepancies:** id, instrument\_id, message, severity, status (open or resolved), raised\_by, resolved\_at
- **renewals:** id, old\_instrument\_id, new\_instrument\_id, date
- **release\_requests:** id, instrument\_id, status, requested\_by, remarks, approved\_by, dates
- **notifications:** id, user\_id, type, message, is\_read, created\_at
- **audit\_logs:** id, user\_id, action, entity, entity\_id, old\_value, new\_value, timestamp
- **settings:** key, value (for reminder days and other configuration)

## 10. Step-by-step plan: what to do and in which order

### Step 1: Understand and plan (day 1)

- Read the problem statement and list the 10 deliverables.
- Decide your roles, statuses and the demo story.
- Choose your tech stack and split work between teammates.

### Step 2: Design (day 1 to 2)

- Draw a simple flow diagram of the FDR life cycle.
- Design the database tables.
- Sketch the main screens: login, dashboard, FDR list, FDR detail, submit FDR form, release request page.

### Step 3: Build the foundation

- Set up the project, database and login.
- Implement roles and permission checks.
- Add the audit log helper so every action gets logged from the start.

### Step 4: Build the core flow

- Institution: add FDR form and document upload.
- Officer: FDR list, detail page, review and remarks.
- Rule-based discrepancy checks.

### Step 5: Add verification

- Build the mock bank-verification adapter.
- Add the submitted vs bank-confirmed badges.
- (Optional) Add OCR comparison.

### Step 6: Add tracking and alerts

- Daily scheduled job for maturity and validity.
- Notifications (in-app and email).
- Escalation for overdue cases.

### Step 7: Add renewal and release workflows

- Renewal linking.
- Release request with checklist and approval steps.

### Step 8: Dashboard and reports

- Summary cards, charts and pending-action lists.
- CSV and PDF export.

### Step 9: Test everything

- Run the test scenarios in section 11.
- Fix bugs, check permissions, and make sure nothing is visible to the wrong role.

### Step 10: Prepare the demo and presentation

- Load realistic dummy data (10 to 20 FDRs in different states).
- Practice the demo story in section 12.
- Prepare slides: problem, solution, architecture, demo, impact, future scope.

## 11. Test scenarios (the problem statement asks for these)

| # | Scenario | What should happen |
| --- | --- | --- |
| 1 | New FDR submission | Record is created with status Submitted, document stored, audit log entry added |
| 2 | Validity tracking | Daily job calculates days left and updates status correctly |
| 3 | Approaching maturity | Reminder sent to the college and the officer at the set day (for example 30 days) |
| 4 | Renewal | New FDR links to the old one; the old one becomes Renewed; history chain is visible |
| 5 | Discrepancy identification | Wrong data (for example maturity before issue) is flagged automatically with a clear message |
| 6 | Authorized release | Request goes through officer and authority approval, then status becomes Released |
| 7 | Unauthorized access | A college user cannot see another college's FDRs; a scrutiny officer cannot approve a release |
| 8 | Overdue escalation | Case unresolved for too long is escalated to a senior official |

## 12. Demo story (a simple flow to show judges)

1. Log in as a **college** and submit a new FDR with a document.
2. The system instantly flags a discrepancy (for example duplicate FDR number or a mismatch found by OCR).
3. The college corrects it and resubmits.
4. Log in as an **officer**, run verification, see the field turn to **Bank-confirmed**, and mark as Verified.
5. Show the **dashboard** with counts and the expiry timeline.
6. Trigger the scheduler and show a **maturity reminder** arriving.
7. Upload a **renewal** and show the linked history.
8. Raise a **release request**, approve it as the authority, and show the final status.
9. Open the **audit log** and show every step recorded.

## 13. How to show measurable improvement

The problem statement wants proof of improvement. Show simple numbers:

- **Record accuracy:** percentage of records with complete fields and documents, before and after validation checks.
- **Verification turnaround time:** average time from Submitted to Verified.
- **Timely renewal tracking:** number of reminders sent automatically, and how many renewals were done before expiry.
- **Manual effort saved:** steps or hours saved compared to tracking by hand (for example, "1 daily job replaces checking 500 records by hand").
- **Visibility:** number of pending cases visible on one dashboard.

Even estimated numbers from your dummy data are fine, as long as you explain how you calculated them.

## 14. Security checklist

- [ ] HTTPS for all traffic
- [ ] Passwords hashed, never stored as plain text
- [ ] Role check on every request
- [ ] Files and sensitive fields encrypted at rest
- [ ] Only allowed file types and sizes can be uploaded
- [ ] Audit log cannot be edited or deleted
- [ ] Input validation everywhere
- [ ] Session timeout and optional OTP for officials
- [ ] Colleges can only ever see their own data

## 15. Future scope (mention this in your presentation)

- Real bank verification APIs, once formally authorized
- Integration with AICTE's existing approval portal to avoid duplicate data entry
- SMS and WhatsApp reminders
- AI that predicts which cases may become overdue
- Multi-language support
- Mobile-friendly or app version for officials

## 16. Simple glossary

- **FDR:** Fixed Deposit Receipt, the bank's proof that money is locked in a fixed deposit.
- **Security deposit:** money kept with AICTE as a guarantee.
- **Maturity date:** the date the FDR period ends.
- **Discrepancy:** a mismatch, missing detail or suspicious item.
- **Scrutiny:** careful checking by an official.
- **RBAC:** Role-Based Access Control, meaning access depends on the user's role.
- **Audit trail:** a permanent log of who did what and when.
- **Escalation:** sending an unresolved matter to a more senior person.
- **OCR:** technology that reads text from images and scanned documents.
- **Cron job / scheduler:** a task that runs automatically at set times.
- **API:** a way for one software system to talk to another.

## 17. Final summary

Build a secure web portal with three main parts: **(1)** a place for colleges to submit FDRs and documents, **(2)** a review area where officials verify, flag and approve, and **(3)** an automatic engine that watches dates, sends reminders and keeps a full history. Keep the "submitted vs bank-confirmed" idea, the audit trail and the dashboard front and centre, because they match the problem statement most directly and make the demo easy to understand.
