# AICTE Security Deposit / FDR Central Management Portal

> **National Portal for Centralized Monitoring, Automated Verification, and Release Management of Fixed Deposit Receipts (FDRs) for AICTE Approved Technical Institutions.**

---

## 🚀 Live Local Server
The development server is running locally on:
**[http://localhost:3000](http://localhost:3000)**

---

## 🌟 Key Innovations & Signature Highlights

### 1. Dual-Source Verification Badges (Core Problem Statement Concept)
Every critical data field (FDR Receipt Number, Deposit Amount, Maturity Date) tracks its origin with distinctive color-coded status badges:
* <span style="color: #10b981; font-weight: bold;">🛡️ Bank-confirmed</span>: Confirmed via Core Banking System (CBS) or Bank Verification Gateway with verification timestamp & reference ID.
* <span style="color: #94a3b8; font-weight: bold;">👤 Institution-submitted</span>: Self-declared values submitted by the institution pending bank reconciliation.

### 2. Multi-Role RBAC with 1-Click Live Switcher
The top navigation bar contains an instant **RBAC Role Switcher**, allowing live hackathon presentations and judges to test all 5 perspectives instantly:
1. **Institution User (College)**: Can submit new FDRs with OCR assistance, reply to discrepancies, submit renewals, and request releases.
2. **Scrutiny Officer (AICTE)**: Reviews submissions, runs automated Layer A rule checks, executes the Bank CBS Verification Adapter, and recommends release workflows.
3. **Approving Authority (AICTE Member Secretary)**: Digital sign-off and sanctioning of release/refund requests and escalation management.
4. **System Administrator**: Configures reminder milestones (e.g. 90, 60, 30, 15, 7 days), auto-escalation limits, and statutory minimum amounts.
5. **Statutory Auditor (CAG)**: Read-only access to immutable audit trails with JSON forensic state diff inspection.

### 3. Verification & Discrepancy Engine
* **Layer A (Automated Rules)**:
  * Sequence validation: Maturity date cannot precede issue date.
  * Minimum collateral check: Validates amount against statutory minimums.
  * Duplicate instrument detection across all institutions and banks.
  * Already-expired receipt detection.
* **Layer B (Bank Verification Adapter)**:
  * Pluggable gateway (`verifyFDRWithBank`) interfacing with CBS APIs or mock banking stubs.
  * Upgrades fields to **Bank-confirmed** with visual celebration.
* **OCR Vision Model Simulation**:
  * Extracts receipt number, amount, and dates automatically from uploaded scans.

### 4. Validity & Maturity Tracking (Cron Simulator)
* Click **"Simulate Daily Cron"** in the top bar to run the daily scheduled job.
* Recalculates remaining days, transitions statuses to `Expiring Soon` or `Matured`, and pushes real-time alert notifications.

### 5. Multi-Tier Release & Refund Workflow
* 4-condition statutory clearance checklist (Grievances, Regional NOC, Undertaking, Bank Mandate).
* Scrutiny Officer recommendation step.
* Approving Authority final digital sign-off.

### 6. Immutable Append-Only Audit Trail
* Logs every create, update, verify, approve, and login action.
* Governed by database-level PostgreSQL security triggers prohibiting `UPDATE` or `DELETE` operations.

---

## 🗄️ Supabase & Google Authentication Setup

The project supports both **live Supabase + Google OAuth** and **instant interactive local demo mode**:

### Database Schema & Seed Data
* Complete database schema with Row Level Security (RLS) policies: [`supabase/schema.sql`](supabase/schema.sql)
* Realistic Indian institutions & FDRs seed dataset: [`supabase/seed.sql`](supabase/seed.sql)
* Detailed Google Auth step-by-step setup guide: [`supabase/README.md`](supabase/README.md)

### To connect your own Supabase project:
1. Run `supabase/schema.sql` and `supabase/seed.sql` in your [Supabase SQL Editor](https://app.supabase.com).
2. Create `aicte-fdr-portal/.env.local` with your project keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
3. Enable **Google Provider** in Supabase Authentication > Providers.

---

## 📂 Project Directory Structure

```
SIH26265/
├── AICTE Security Deposit FDR Management Portal – Detailed Guide.md
├── package.json                   # Root package proxy
├── README.md                      # Complete system documentation
├── supabase/
│   ├── schema.sql                 # Complete PostgreSQL DDL, RLS, & Triggers
│   ├── seed.sql                   # Realistic sample data across 10 states
│   └── README.md                  # Supabase & Google Auth configuration instructions
└── aicte-fdr-portal/              # Next.js 16 Web Application
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx         # National banner, fonts, dark mode
    │   │   ├── page.tsx           # Main application assembler
    │   │   └── globals.css        # Tailwind CSS styles
    │   ├── components/
    │   │   ├── Header.tsx         # National identity, role switcher, cron runner
    │   │   ├── DashboardView.tsx  # KPI metrics, maturity horizon, bank distribution
    │   │   ├── FDRRepositoryView.tsx # Filterable repository, search, CSV export
    │   │   ├── FDRDetailModal.tsx # Dual-source matrix, bank adapter, doc tree
    │   │   ├── NewFDRModal.tsx    # College FDR submission with OCR auto-fill
    │   │   ├── RenewalModal.tsx   # Feature 5 replacement and lineage chain
    │   │   ├── ReleaseWorkflowModal.tsx # Multi-tier refund clearance workflow
    │   │   ├── AuditTrailView.tsx # Tamper-proof logs with JSON forensic diff
    │   │   ├── SettingsView.tsx   # Admin configurable threshold engine
    │   │   ├── SourceBadge.tsx    # Submitted vs Bank-confirmed badge
    │   │   └── StatusBadge.tsx    # 10 lifecycle state badges
    │   ├── context/
    │   │   └── AppContext.tsx     # Centralized reactive state & RBAC manager
    │   ├── lib/
    │   │   ├── supabase.ts        # Supabase client & Google Auth handler
    │   │   ├── bankAdapter.ts     # CBS Bank Verification Gateway Adapter
    │   │   └── mockData.ts        # Seed data, users, and audit records
    │   └── types/
    │       └── index.ts           # TypeScript interfaces & enums
    └── package.json
```
