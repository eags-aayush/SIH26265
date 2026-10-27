# AICTE FDR Management Portal - Supabase & Google Auth Setup Guide

This guide explains how to connect this portal to your Supabase project and enable Google Authentication.

---

## 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create or open your project.
2. Note your **Project URL** and **anon public key** from **Project Settings** > **API**.

---

## 2. Run Database Migrations
1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Copy the entire contents of [`supabase/schema.sql`](file:///home/aayush/Music/SIH26265/supabase/schema.sql) and paste it into the editor.
4. Click **Run**. All 12 tables, indexes, triggers, and Row Level Security (RLS) policies will be created.
5. Create another new query, paste the contents of [`supabase/seed.sql`](file:///home/aayush/Music/SIH26265/supabase/seed.sql), and click **Run** to load realistic sample institutions, FDRs in all lifecycle stages, and audit trails.

---

## 3. Configure Google OAuth in Supabase
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** > **Credentials**.
3. Click **Create Credentials** > **OAuth client ID**.
4. Choose **Web application**.
5. Under **Authorized redirect URIs**, add:
   ```
   https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback
   ```
   *(Find your exact callback URL in Supabase Dashboard > Authentication > Providers > Google)*.
6. Copy the **Client ID** and **Client Secret**.
7. In your Supabase Dashboard, go to **Authentication** > **Providers** > **Google**:
   * Toggle **Enable Google provider** to ON.
   * Paste the **Client ID** and **Client Secret**.
   * Click **Save**.

---

## 4. Storage Bucket Setup (for FDR scans & NOC documents)
1. In Supabase Dashboard, go to **Storage**.
2. Click **New bucket** and name it `fdr-documents`.
3. Set it to **Private** (or Public with RLS if you prefer direct preview URLs).

---

## 5. Configure Local Environment Variables
Create or edit `.env.local` inside `aicte-fdr-portal/`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Note for Local Demo / Hackathon Judging:**
> The application includes an **Automatic Fallback / Quick Role Switcher**! Even if you haven't plugged in Supabase keys yet, the application runs out of the box with interactive state, mock bank verification, and instant 1-click role switching between all 5 user roles (Institution, Scrutiny Officer, Approving Authority, Admin, Auditor) for judge demonstrations.
