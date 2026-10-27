-- ==============================================================================
-- AICTE Security Deposit / FDR Management Portal - Seed Data
-- ==============================================================================

-- 1. SEED INSTITUTIONS
INSERT INTO public.institutions (id, aicte_id, name, state, contact_email, contact_phone, address) VALUES
('a0000000-0000-0000-0000-000000000001', '1-10293847', 'Delhi Institute of Engineering & Technology', 'Delhi', 'registrar@diet.ac.in', '+91 11 2345 6789', 'Plot 4, Institutional Area, Rohini, New Delhi'),
('a0000000-0000-0000-0000-000000000002', '1-28394851', 'Maharashtra Institute of Technology & Research', 'Maharashtra', 'director@mitr.edu.in', '+91 20 2567 1122', 'Survey 124, Paud Road, Kothrud, Pune'),
('a0000000-0000-0000-0000-000000000003', '1-39485720', 'Karnataka Academy of Technical Studies', 'Karnataka', 'dean@kats.ac.in', '+91 80 4123 4455', 'Outer Ring Road, Marathahalli, Bengaluru'),
('a0000000-0000-0000-0000-000000000004', '1-48201938', 'Tamil Nadu College of Engineering & Science', 'Tamil Nadu', 'principal@tnces.edu.in', '+91 44 2235 9900', 'GST Road, Guindy, Chennai')
ON CONFLICT (aicte_id) DO NOTHING;

-- 2. SEED INSTRUMENTS (FDR Deposits in various states)
INSERT INTO public.instruments (id, institution_id, fdr_number, bank_name, branch_name, ifsc_code, amount, issue_date, maturity_date, status, purpose, remarks) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'FDR-SBI-2024-8849',
    'State Bank of India',
    'CAG Branch, Parliament Street, New Delhi',
    'SBIN0000691',
    3500000.00,
    '2024-01-15',
    '2026-11-20',
    'Expiring Soon',
    'Security Deposit for AICTE New Institution Approval',
    'Matures in less than 30 days. Needs immediate renewal or release notification.'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'FDR-PNB-2023-1102',
    'Punjab National Bank',
    'Connaught Place, New Delhi',
    'PUNB0001200',
    1500000.00,
    '2023-04-10',
    '2028-04-10',
    'Active',
    'Security Deposit for Additional Course Intake Approval',
    'Verified with bank confirmation certificate.'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'FDR-HDFC-2026-9041',
    'HDFC Bank',
    'Kothrud Branch, Pune',
    'HDFC0000102',
    2500000.00,
    '2026-02-01',
    '2029-02-01',
    'Submitted',
    'Security Deposit for New Campus Extension',
    'Awaiting scrutiny officer assignment.'
),
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002',
    'FDR-BOB-2025-4421',
    'Bank of Baroda',
    'FC Road, Pune',
    'BARB0FCPUNE',
    1000000.00,
    '2025-06-15',
    '2028-06-15',
    'Discrepancy Flagged',
    'Security Deposit for Diploma Program Approval',
    'Discrepancy: Deposit amount ₹10,00,000 is below the prescribed statutory minimum requirement of ₹15,00,000.'
),
(
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000003',
    'FDR-CAN-2021-3319',
    'Canara Bank',
    'MG Road, Bengaluru',
    'CNRB0000432',
    3500000.00,
    '2021-08-10',
    '2026-08-10',
    'Release Requested',
    'Security Deposit for Technical Campus Closure',
    'Release request initiated. Compliance NOC submitted.'
),
(
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000004',
    'FDR-ICICI-2020-7712',
    'ICICI Bank',
    'Guindy Branch, Chennai',
    'ICIC0000048',
    3000000.00,
    '2020-03-01',
    '2025-03-01',
    'Released',
    'Security Deposit for Approved Closure',
    'Security deposit fully refunded upon completion of 5-year lockin.'
)
ON CONFLICT DO NOTHING;

-- 3. SEED FIELD SOURCES (Key Differentiator: Submitted vs Bank-Confirmed)
INSERT INTO public.field_sources (instrument_id, field_name, source, confirmed_at, notes) VALUES
('b0000000-0000-0000-0000-000000000001', 'fdr_number', 'Bank-confirmed', now() - interval '30 days', 'Confirmed via SBI corporate confirmation API stub'),
('b0000000-0000-0000-0000-000000000001', 'amount', 'Bank-confirmed', now() - interval '30 days', '₹35,00,000 matches bank ledger'),
('b0000000-0000-0000-0000-000000000001', 'maturity_date', 'Bank-confirmed', now() - interval '30 days', 'Maturity date 2026-11-20 confirmed'),
('b0000000-0000-0000-0000-000000000003', 'fdr_number', 'Institution-submitted', null, 'Entered by college user'),
('b0000000-0000-0000-0000-000000000003', 'amount', 'Institution-submitted', null, 'Entered by college user'),
('b0000000-0000-0000-0000-000000000003', 'maturity_date', 'Institution-submitted', null, 'Entered by college user'),
('b0000000-0000-0000-0000-000000000004', 'fdr_number', 'Institution-submitted', null, 'Entered by college user'),
('b0000000-0000-0000-0000-000000000004', 'amount', 'Institution-submitted', null, 'Entered by college user'),
('b0000000-0000-0000-0000-000000000004', 'maturity_date', 'Institution-submitted', null, 'Entered by college user')
ON CONFLICT (instrument_id, field_name) DO NOTHING;

-- 4. SEED DISCREPANCIES
INSERT INTO public.discrepancies (id, instrument_id, rule_code, message, severity, status, created_at) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000004',
    'RULE_MIN_AMOUNT',
    'Deposit amount ₹10,00,000 is below the prescribed minimum requirement of ₹15,00,000 for standard engineering programs.',
    'high',
    'open',
    now() - interval '2 days'
)
ON CONFLICT DO NOTHING;

-- 5. SEED RELEASE REQUESTS
INSERT INTO public.release_requests (id, instrument_id, status, checklist, justification, scrutiny_remarks) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000005',
    'scrutiny_recommended',
    '{
        "no_pending_compliance": true,
        "valid_closure_noc": true,
        "undertaking_submitted": true,
        "bank_mandate_verified": true
    }'::jsonb,
    'Institution has completed the mandated 5-year lockin duration without student grievances.',
    'Verified by Scrutiny Bureau. All clearances obtained from Regional Office. Recommended for Authority Approval.'
)
ON CONFLICT DO NOTHING;

-- 6. SEED SETTINGS
INSERT INTO public.settings (key, value, description) VALUES
('reminder_milestones', '[90, 60, 30, 15, 7]'::jsonb, 'Days prior to FDR maturity when notifications are sent'),
('auto_escalation_days', '7'::jsonb, 'Days an unreviewed submission or discrepancy can sit before escalating to higher authority'),
('min_deposit_amount', '1500000'::jsonb, 'Standard minimum security deposit amount (INR) for diploma/degree programs'),
('bank_adapter_mode', '"mock"'::jsonb, 'Mode for bank verification adapter (mock or api)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 7. SEED AUDIT LOGS
INSERT INTO public.audit_logs (user_email, user_role, action, entity, entity_id, old_value, new_value, ip_address, timestamp) VALUES
('admin@aicte-india.org', 'admin', 'SYSTEM_INITIALIZATION', 'System', 'ALL', null, '{"status": "Initialized v1.0"}'::jsonb, '127.0.0.1', now() - interval '10 days'),
('registrar@diet.ac.in', 'institution', 'SUBMIT_FDR', 'Instrument', 'b0000000-0000-0000-0000-000000000001', null, '{"fdr_number": "FDR-SBI-2024-8849", "amount": 3500000}'::jsonb, '192.168.1.10', now() - interval '9 days'),
('scrutiny.officer@aicte-india.org', 'scrutiny_officer', 'BANK_VERIFICATION_SUCCESS', 'FieldSource', 'b0000000-0000-0000-0000-000000000001', '{"source": "Institution-submitted"}'::jsonb, '{"source": "Bank-confirmed"}'::jsonb, '10.0.0.4', now() - interval '8 days')
ON CONFLICT DO NOTHING;
