-- ==============================================================================
-- AICTE Security Deposit / FDR Management Portal - Supabase Schema
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INSTITUTIONS
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aicte_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'institution' 
        CHECK (role IN ('institution', 'scrutiny_officer', 'approving_authority', 'admin', 'auditor')),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. INSTRUMENTS (FDR Deposits)
CREATE TABLE IF NOT EXISTS public.instruments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE RESTRICT,
    fdr_number VARCHAR(100) NOT NULL,
    bank_name VARCHAR(150) NOT NULL,
    branch_name VARCHAR(150),
    ifsc_code VARCHAR(20),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    issue_date DATE NOT NULL,
    maturity_date DATE NOT NULL CHECK (maturity_date > issue_date),
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted'
        CHECK (status IN (
            'Submitted',
            'Under Scrutiny',
            'Discrepancy Flagged',
            'Verified',
            'Active',
            'Expiring Soon',
            'Matured',
            'Renewed',
            'Release Requested',
            'Released',
            'Closed'
        )),
    purpose VARCHAR(255) DEFAULT 'Security Deposit for AICTE New Institution Approval',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Unique constraint on FDR number per bank
CREATE UNIQUE INDEX IF NOT EXISTS idx_instruments_fdr_bank ON public.instruments(fdr_number, bank_name);

-- 4. FIELD SOURCES (Tracks "Institution-submitted" vs "Bank-confirmed")
CREATE TABLE IF NOT EXISTS public.field_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instrument_id UUID NOT NULL REFERENCES public.instruments(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL, -- 'fdr_number', 'amount', 'maturity_date', 'bank_name'
    source VARCHAR(50) NOT NULL DEFAULT 'Institution-submitted' 
        CHECK (source IN ('Institution-submitted', 'Bank-confirmed')),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    UNIQUE(instrument_id, field_name)
);

-- 5. INSTRUMENT DOCUMENTS
CREATE TABLE IF NOT EXISTS public.instrument_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instrument_id UUID NOT NULL REFERENCES public.instruments(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT,
    doc_type VARCHAR(50) NOT NULL DEFAULT 'FDR Scan'
        CHECK (doc_type IN ('FDR Scan', 'Bank Confirmation Letter', 'Renewal Request', 'NOC Certificate', 'Other')),
    version INT NOT NULL DEFAULT 1,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. VERIFICATIONS
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instrument_id UUID NOT NULL REFERENCES public.instruments(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL CHECK (method IN ('rules', 'bank', 'ocr')),
    result VARCHAR(50) NOT NULL CHECK (result IN ('passed', 'failed', 'warning')),
    details JSONB DEFAULT '{}'::jsonb,
    checked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. DISCREPANCIES
CREATE TABLE IF NOT EXISTS public.discrepancies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instrument_id UUID NOT NULL REFERENCES public.instruments(id) ON DELETE CASCADE,
    rule_code VARCHAR(100),
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    raised_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. RENEWALS (Chain of replacement FDRs)
CREATE TABLE IF NOT EXISTS public.renewals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    old_instrument_id UUID NOT NULL REFERENCES public.instruments(id) ON DELETE RESTRICT,
    new_instrument_id UUID NOT NULL REFERENCES public.instruments(id) ON DELETE RESTRICT,
    renewal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(new_instrument_id)
);

-- 9. RELEASE REQUESTS
CREATE TABLE IF NOT EXISTS public.release_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instrument_id UUID NOT NULL REFERENCES public.instruments(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_scrutiny'
        CHECK (status IN (
            'pending_scrutiny',
            'scrutiny_recommended',
            'scrutiny_rejected',
            'approved',
            'rejected'
        )),
    checklist JSONB DEFAULT '{
        "no_pending_compliance": false,
        "valid_closure_noc": false,
        "undertaking_submitted": false,
        "bank_mandate_verified": false
    }'::jsonb,
    justification TEXT,
    requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    scrutinized_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    scrutiny_remarks TEXT,
    decided_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    decision_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_role VARCHAR(50),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    instrument_id UUID REFERENCES public.instruments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. AUDIT LOGS (Strictly Immutable, Append-Only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prevent UPDATE or DELETE on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_modification ON public.audit_logs;
CREATE TRIGGER trg_prevent_audit_log_modification
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- 12. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instrument_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discrepancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Helper function in public schema to fetch current user's role
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS VARCHAR
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT p.role
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.current_role() TO authenticated;

-- Helper function in public schema to fetch current user's institution_id
CREATE OR REPLACE FUNCTION public.current_institution_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT p.institution_id
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.current_institution_id() TO authenticated;

-- ------------------------------------------------------------------------------
-- Instruments Policies (Idempotent)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Institutions view own FDRs" ON public.instruments;
CREATE POLICY "Institutions view own FDRs" ON public.instruments
    FOR SELECT USING (
        public.current_role() IN ('scrutiny_officer', 'approving_authority', 'admin', 'auditor')
        OR (public.current_role() = 'institution' AND institution_id = public.current_institution_id())
    );

DROP POLICY IF EXISTS "Colleges can insert FDRs for own institution" ON public.instruments;
CREATE POLICY "Colleges can insert FDRs for own institution" ON public.instruments
    FOR INSERT WITH CHECK (
        public.current_role() = 'institution' AND institution_id = public.current_institution_id()
        OR public.current_role() = 'admin'
    );

DROP POLICY IF EXISTS "Officers and Admin can update FDR status" ON public.instruments;
CREATE POLICY "Officers and Admin can update FDR status" ON public.instruments
    FOR UPDATE USING (
        public.current_role() IN ('scrutiny_officer', 'approving_authority', 'admin')
        OR (public.current_role() = 'institution' AND institution_id = public.current_institution_id() AND status = 'Discrepancy Flagged')
    );

-- ------------------------------------------------------------------------------
-- Profiles Policies (Idempotent)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile or officers can read all" ON public.profiles;
CREATE POLICY "Users can read own profile or officers can read all" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR public.current_role() IN ('scrutiny_officer', 'approving_authority', 'admin', 'auditor')
    );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- Audit Logs Policies (Idempotent)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Auditors and Admin can read audit logs" ON public.audit_logs;
CREATE POLICY "Auditors and Admin can read audit logs" ON public.audit_logs
    FOR SELECT USING (
        public.current_role() IN ('auditor', 'admin', 'approving_authority', 'scrutiny_officer')
    );

DROP POLICY IF EXISTS "All authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "All authenticated users can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ------------------------------------------------------------------------------
-- General Read Policies for Other Tables (Idempotent)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated users to read institutions" ON public.institutions;
CREATE POLICY "Allow authenticated users to read institutions" ON public.institutions
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read field sources" ON public.field_sources;
CREATE POLICY "Allow authenticated users to read field sources" ON public.field_sources
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read documents" ON public.instrument_documents;
CREATE POLICY "Allow authenticated users to read documents" ON public.instrument_documents
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read verifications" ON public.verifications;
CREATE POLICY "Allow authenticated users to read verifications" ON public.verifications
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read discrepancies" ON public.discrepancies;
CREATE POLICY "Allow authenticated users to read discrepancies" ON public.discrepancies
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read renewals" ON public.renewals;
CREATE POLICY "Allow authenticated users to read renewals" ON public.renewals
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read release requests" ON public.release_requests;
CREATE POLICY "Allow authenticated users to read release requests" ON public.release_requests
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read notifications" ON public.notifications;
CREATE POLICY "Allow authenticated users to read notifications" ON public.notifications
    FOR SELECT TO authenticated USING (
        user_id = auth.uid() OR target_role = public.current_role() OR target_role = 'all'
    );

DROP POLICY IF EXISTS "Allow authenticated users to read settings" ON public.settings;
CREATE POLICY "Allow authenticated users to read settings" ON public.settings
    FOR SELECT TO authenticated USING (true);

-- ------------------------------------------------------------------------------
-- Secure Auto-Create Profile on Signup Trigger
-- Prevents privilege escalation: New signups strictly get 'institution' role
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'institution', -- Always assign standard institution role to self-service signups
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 13. SUPABASE STORAGE BUCKET SETUP ('fdr-documents')
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'fdr-documents',
    'fdr-documents',
    false,
    10485760, -- 10MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload FDR documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload FDR documents" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'fdr-documents');

DROP POLICY IF EXISTS "Authenticated users can view/download FDR documents" ON storage.objects;
CREATE POLICY "Authenticated users can view/download FDR documents" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'fdr-documents');
