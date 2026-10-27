'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Instrument,
  UserProfile,
  UserRole,
  FDRStatus,
  AuditLogEntry,
  SystemNotification,
  SystemSettings,
  Discrepancy,
  ReleaseChecklist,
  ReleaseRequest,
} from '@/types';
import {
  INITIAL_INSTRUMENTS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_SETTINGS,
} from '@/lib/mockData';
import { verifyFDRWithBank } from '@/lib/bankAdapter';
import { getSupabase } from '@/lib/supabase';

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  setCurrentUserRole: (role: UserRole) => void;
  instruments: Instrument[];
  filteredInstruments: Instrument[];
  auditLogs: AuditLogEntry[];
  notifications: SystemNotification[];
  unreadNotifsCount: number;
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Actions
  addNewInstrument: (newFdr: Partial<Instrument>, uploadedFile?: File | null) => { success: boolean; errors?: string[]; instrument?: Instrument };
  runRuleCheck: (instrumentId: string) => { passed: boolean; discrepancies: Discrepancy[] };
  runBankVerification: (instrumentId: string) => Promise<{ success: boolean; message: string }>;
  resolveDiscrepancy: (discrepancyId: string, resolutionNotes: string) => void;
  submitRenewalFdr: (oldInstrumentId: string, renewalDetails: Partial<Instrument>) => { success: boolean; newInstrument?: Instrument };
  requestRelease: (instrumentId: string, justification: string, checklist: ReleaseChecklist) => void;
  recommendRelease: (instrumentId: string, remarks: string, approved: boolean) => void;
  decideRelease: (instrumentId: string, remarks: string, approved: boolean) => void;
  runDailyMaturityCheck: () => { updatedCount: number; notificationsCreated: number };
  
  // Search & Filter
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (status: string) => void;
  selectedBankFilter: string;
  setSelectedBankFilter: (bank: string) => void;
  selectedStateFilter: string;
  setSelectedStateFilter: (state: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_INSTRUMENTS = 'aicte_fdr_instruments_v1';
const LOCAL_STORAGE_KEY_AUDIT = 'aicte_fdr_audit_v1';
const LOCAL_STORAGE_KEY_NOTIFS = 'aicte_fdr_notifs_v1';
const LOCAL_STORAGE_KEY_SETTINGS = 'aicte_fdr_settings_v1';
const LOCAL_STORAGE_KEY_USER_ROLE = 'aicte_fdr_role_v1';

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[1]); // Default to Scrutiny Officer
  const [instruments, setInstruments] = useState<Instrument[]>(INITIAL_INSTRUMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedBankFilter, setSelectedBankFilter] = useState('ALL');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  // Load from localStorage if present
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedInst = localStorage.getItem(LOCAL_STORAGE_KEY_INSTRUMENTS);
        if (savedInst) setInstruments(JSON.parse(savedInst));

        const savedAudit = localStorage.getItem(LOCAL_STORAGE_KEY_AUDIT);
        if (savedAudit) setAuditLogs(JSON.parse(savedAudit));

        const savedNotifs = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFS);
        if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

        const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
        if (savedSettings) setSettings(JSON.parse(savedSettings));

        const savedRole = localStorage.getItem(LOCAL_STORAGE_KEY_USER_ROLE);
        if (savedRole) {
          const matchingUser = INITIAL_USERS.find((u) => u.role === savedRole);
          if (matchingUser) setCurrentUser(matchingUser);
        }
      } catch (e) {
        console.error('Error loading data from localStorage', e);
      }
    });

    // Connect to Supabase Auth session if logged in
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = session.user;
          const meta = u.user_metadata || {};
          setCurrentUser((prev) => ({
            ...prev,
            id: u.id,
            email: u.email || prev.email,
            name: meta.full_name || meta.name || u.email?.split('@')[0] || prev.name,
            avatar_url: meta.avatar_url || meta.picture || prev.avatar_url,
          }));
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = session.user;
          const meta = u.user_metadata || {};
          setCurrentUser((prev) => ({
            ...prev,
            id: u.id,
            email: u.email || prev.email,
            name: meta.full_name || meta.name || u.email?.split('@')[0] || prev.name,
            avatar_url: meta.avatar_url || meta.picture || prev.avatar_url,
          }));
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_INSTRUMENTS, JSON.stringify(instruments));
    } catch {}
  }, [instruments]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_AUDIT, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Helper to record immutable audit log
  const logAudit = (action: string, entity: string, entityId: string, oldValue?: Record<string, unknown> | object | null, newValue?: Record<string, unknown> | object | null) => {
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_email: currentUser.email,
      user_role: currentUser.role,
      action,
      entity,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
      ip_address: '10.24.8.10',
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Helper to add notification
  const addNotification = (
    title: string,
    message: string,
    type: 'info' | 'warning' | 'alert' | 'success',
    targetRole?: UserRole | 'all',
    targetInstitutionId?: string,
    instrumentId?: string
  ) => {
    const newNotif: SystemNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      target_role: targetRole || 'all',
      target_institution_id: targetInstitutionId,
      type,
      title,
      message,
      is_read: false,
      instrument_id: instrumentId,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Role Switcher
  const setCurrentUserRole = (role: UserRole) => {
    const user = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(user);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER_ROLE, role);
    } catch {}
    logAudit('SWITCH_ROLE', 'UserProfile', user.id, { previousRole: currentUser.role }, { newRole: role });
  };

  // Update Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      } catch {}
      logAudit('UPDATE_SETTINGS', 'SystemSettings', 'GLOBAL', prev, updated);
      return updated;
    });
  };

  // Mark notification read
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  // Calculate days until maturity
  const calculateDaysLeft = (maturityDateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mat = new Date(maturityDateStr);
    mat.setHours(0, 0, 0, 0);
    const diffTime = mat.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Rule Check Layer A (Automatic Discrepancy Detection)
  const executeRuleCheckOnFdr = (fdr: Partial<Instrument>): Discrepancy[] => {
    const detected: Discrepancy[] = [];
    const instId = fdr.id || 'fdr_temp';

    // Rule 1: Issue date and maturity date sequence
    if (fdr.issue_date && fdr.maturity_date) {
      const issue = new Date(fdr.issue_date);
      const maturity = new Date(fdr.maturity_date);
      if (maturity <= issue) {
        detected.push({
          id: `disc_${Date.now()}_1`,
          instrument_id: instId,
          rule_code: 'RULE_DATE_SEQUENCE',
          message: `Maturity date (${fdr.maturity_date}) must be strictly later than issue date (${fdr.issue_date}).`,
          severity: 'critical',
          status: 'open',
          raised_by: 'RuleEngine v1.0',
          created_at: new Date().toISOString(),
        });
      }
    }

    // Rule 2: Minimum deposit amount check
    if (fdr.amount && fdr.amount < settings.min_deposit_amount) {
      detected.push({
        id: `disc_${Date.now()}_2`,
        instrument_id: instId,
        rule_code: 'RULE_MIN_AMOUNT',
        message: `Amount ₹${fdr.amount.toLocaleString('en-IN')} is below the minimum mandatory deposit threshold of ₹${settings.min_deposit_amount.toLocaleString('en-IN')}.`,
        severity: 'high',
        status: 'open',
        raised_by: 'RuleEngine v1.0',
        created_at: new Date().toISOString(),
      });
    }

    // Rule 3: Duplicate FDR number check across all existing FDRs
    if (fdr.fdr_number) {
      const isDuplicate = instruments.some(
        (existing) =>
          existing.id !== fdr.id &&
          existing.fdr_number.trim().toLowerCase() === fdr.fdr_number?.trim().toLowerCase() &&
          existing.bank_name.trim().toLowerCase() === fdr.bank_name?.trim().toLowerCase()
      );
      if (isDuplicate) {
        detected.push({
          id: `disc_${Date.now()}_3`,
          instrument_id: instId,
          rule_code: 'RULE_DUPLICATE_FDR',
          message: `FDR number '${fdr.fdr_number}' is already registered with ${fdr.bank_name}. Possible duplicate submission.`,
          severity: 'critical',
          status: 'open',
          raised_by: 'RuleEngine v1.0',
          created_at: new Date().toISOString(),
        });
      }
    }

    // Rule 4: Already expired on submission
    if (fdr.maturity_date) {
      const days = calculateDaysLeft(fdr.maturity_date);
      if (days < 0) {
        detected.push({
          id: `disc_${Date.now()}_4`,
          instrument_id: instId,
          rule_code: 'RULE_ALREADY_EXPIRED',
          message: `The FDR has already reached its maturity date (${fdr.maturity_date}). An active or renewed instrument is required.`,
          severity: 'high',
          status: 'open',
          raised_by: 'RuleEngine v1.0',
          created_at: new Date().toISOString(),
        });
      }
    }

    return detected;
  };

  // Add New Instrument
  const addNewInstrument = (
    newFdr: Partial<Instrument>,
    uploadedFile?: File | null
  ): { success: boolean; errors?: string[]; instrument?: Instrument } => {
    const errors: string[] = [];
    if (!newFdr.fdr_number?.trim()) errors.push('FDR Number is required');
    if (!newFdr.bank_name?.trim()) errors.push('Bank Name is required');
    if (!newFdr.amount || newFdr.amount <= 0) errors.push('Valid Amount is required');
    if (!newFdr.issue_date) errors.push('Issue Date is required');
    if (!newFdr.maturity_date) errors.push('Maturity Date is required');

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const newId = `fdr_${Date.now()}`;
    const daysLeft = calculateDaysLeft(newFdr.maturity_date!);
    const ruleDiscrepancies = executeRuleCheckOnFdr({ ...newFdr, id: newId });

    const status = ruleDiscrepancies.length > 0 ? 'Discrepancy Flagged' : 'Submitted';

    const instrument: Instrument = {
      id: newId,
      institution_id: currentUser.institution_id || 'inst_1',
      institution_name: currentUser.institution_name || 'Delhi Institute of Engineering & Technology',
      institution_aicte_id: '1-10293847',
      state: newFdr.state || 'Delhi',
      fdr_number: newFdr.fdr_number!.trim(),
      fdr_number_source: 'Institution-submitted',
      bank_name: newFdr.bank_name!.trim(),
      branch_name: newFdr.branch_name || 'Main Branch',
      ifsc_code: newFdr.ifsc_code || 'SBIN0001000',
      amount: Number(newFdr.amount),
      amount_source: 'Institution-submitted',
      issue_date: newFdr.issue_date!,
      maturity_date: newFdr.maturity_date!,
      maturity_date_source: 'Institution-submitted',
      status,
      purpose: newFdr.purpose || 'Security Deposit for AICTE Approval',
      remarks: newFdr.remarks || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      days_until_maturity: daysLeft,
      documents: uploadedFile
        ? [
            {
              id: `doc_${Date.now()}`,
              instrument_id: newId,
              file_name: uploadedFile.name,
              file_size: `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`,
              doc_type: 'FDR Scan',
              version: 1,
              uploaded_at: new Date().toISOString(),
              uploaded_by: currentUser.email,
            },
          ]
        : [
            {
              id: `doc_${Date.now()}`,
              instrument_id: newId,
              file_name: `FDR_Scan_${newFdr.fdr_number}.pdf`,
              file_size: '2.1 MB',
              doc_type: 'FDR Scan',
              version: 1,
              uploaded_at: new Date().toISOString(),
              uploaded_by: currentUser.email,
            },
          ],
      discrepancies: ruleDiscrepancies,
    };

    setInstruments((prev) => [instrument, ...prev]);

    logAudit('SUBMIT_FDR', 'Instrument', newId, null, {
      fdr_number: instrument.fdr_number,
      amount: instrument.amount,
      bank: instrument.bank_name,
      discrepanciesCount: ruleDiscrepancies.length,
    });

    if (ruleDiscrepancies.length > 0) {
      addNotification(
        'Discrepancy Flagged on Submission',
        `Rule engine flagged ${ruleDiscrepancies.length} issues on FDR #${instrument.fdr_number}. Review needed.`,
        'alert',
        'institution',
        instrument.institution_id,
        newId
      );
    } else {
      addNotification(
        'New FDR Awaiting Scrutiny',
        `${instrument.institution_name} submitted FDR #${instrument.fdr_number} (₹${instrument.amount.toLocaleString('en-IN')}) for verification.`,
        'info',
        'scrutiny_officer',
        undefined,
        newId
      );
    }

    return { success: true, instrument };
  };

  // Run Rule Check on demand
  const runRuleCheck = (instrumentId: string) => {
    const target = instruments.find((i) => i.id === instrumentId);
    if (!target) return { passed: false, discrepancies: [] };

    const detected = executeRuleCheckOnFdr(target);

    setInstruments((prev) =>
      prev.map((inst): Instrument => {
        if (inst.id !== instrumentId) return inst;
        const newStatus: FDRStatus = detected.length > 0 ? 'Discrepancy Flagged' : inst.status === 'Discrepancy Flagged' ? 'Under Scrutiny' : inst.status;
        return {
          ...inst,
          discrepancies: detected,
          status: newStatus,
          updated_at: new Date().toISOString(),
        };
      })
    );

    logAudit('RUN_RULE_CHECK', 'Instrument', instrumentId, null, { discrepanciesFound: detected.length });
    return { passed: detected.length === 0, discrepancies: detected };
  };

  // Run Bank Verification Adapter Layer B
  const runBankVerification = async (instrumentId: string): Promise<{ success: boolean; message: string }> => {
    const target = instruments.find((i) => i.id === instrumentId);
    if (!target) return { success: false, message: 'Instrument not found' };

    const result = await verifyFDRWithBank(
      target.bank_name,
      target.fdr_number,
      target.amount,
      target.maturity_date
    );

    if (result.success) {
      setInstruments((prev) =>
        prev.map((inst): Instrument => {
          if (inst.id !== instrumentId) return inst;
          return {
            ...inst,
            fdr_number_source: 'Bank-confirmed',
            fdr_number_confirmed_at: result.verification_timestamp,
            amount_source: 'Bank-confirmed',
            amount_confirmed_at: result.verification_timestamp,
            maturity_date_source: 'Bank-confirmed',
            maturity_date_confirmed_at: result.verification_timestamp,
            status: 'Verified',
            remarks: `${result.message} (Ref: ${result.transaction_ref})`,
            updated_at: new Date().toISOString(),
          };
        })
      );

      logAudit('BANK_VERIFICATION_SUCCESS', 'Instrument', instrumentId, {
        fdr_source: target.fdr_number_source,
        amount_source: target.amount_source,
      }, {
        fdr_source: 'Bank-confirmed',
        amount_source: 'Bank-confirmed',
        ref: result.transaction_ref,
      });

      addNotification(
        'FDR Bank Verified',
        `FDR #${target.fdr_number} confirmed by ${target.bank_name}. All fields marked Bank-confirmed.`,
        'success',
        'institution',
        target.institution_id,
        instrumentId
      );

      return { success: true, message: result.message };
    } else {
      // Flag discrepancy
      const bankDiscrepancy: Discrepancy = {
        id: `disc_bank_${Date.now()}`,
        instrument_id: instrumentId,
        rule_code: 'BANK_LOOKUP_FAILED',
        message: result.message,
        severity: 'critical',
        status: 'open',
        raised_by: 'BankVerificationAdapter',
        created_at: new Date().toISOString(),
      };

      setInstruments((prev) =>
        prev.map((inst): Instrument =>
          inst.id === instrumentId
            ? {
                ...inst,
                status: 'Discrepancy Flagged',
                discrepancies: [...inst.discrepancies, bankDiscrepancy],
                updated_at: new Date().toISOString(),
              }
            : inst
        )
      );

      logAudit('BANK_VERIFICATION_FAILED', 'Instrument', instrumentId, null, { error: result.message });
      return { success: false, message: result.message };
    }
  };

  // Resolve Discrepancy
  const resolveDiscrepancy = (discrepancyId: string, resolutionNotes: string) => {
    setInstruments((prev) =>
      prev.map((inst): Instrument => {
        const hasDisc = inst.discrepancies.some((d) => d.id === discrepancyId);
        if (!hasDisc) return inst;

        const updatedDiscrepancies = inst.discrepancies.map((d) =>
          d.id === discrepancyId
            ? {
                ...d,
                status: 'resolved' as const,
                resolved_at: new Date().toISOString(),
                resolution_notes: resolutionNotes,
              }
            : d
        );

        const openCount = updatedDiscrepancies.filter((d) => d.status === 'open').length;

        return {
          ...inst,
          discrepancies: updatedDiscrepancies,
          status: openCount === 0 ? 'Under Scrutiny' : inst.status,
          updated_at: new Date().toISOString(),
        };
      })
    );

    logAudit('RESOLVE_DISCREPANCY', 'Discrepancy', discrepancyId, null, { resolutionNotes });
  };

  // Submit Renewal
  const submitRenewalFdr = (oldInstrumentId: string, renewalDetails: Partial<Instrument>) => {
    const oldFdr = instruments.find((i) => i.id === oldInstrumentId);
    if (!oldFdr) return { success: false };

    const newId = `fdr_renew_${Date.now()}`;
    const daysLeft = calculateDaysLeft(renewalDetails.maturity_date || '2029-01-01');

    const newInstrument: Instrument = {
      id: newId,
      institution_id: oldFdr.institution_id,
      institution_name: oldFdr.institution_name,
      institution_aicte_id: oldFdr.institution_aicte_id,
      state: oldFdr.state,
      fdr_number: renewalDetails.fdr_number || `${oldFdr.fdr_number}-R1`,
      fdr_number_source: 'Institution-submitted',
      bank_name: renewalDetails.bank_name || oldFdr.bank_name,
      branch_name: renewalDetails.branch_name || oldFdr.branch_name,
      ifsc_code: renewalDetails.ifsc_code || oldFdr.ifsc_code,
      amount: Number(renewalDetails.amount || oldFdr.amount),
      amount_source: 'Institution-submitted',
      issue_date: renewalDetails.issue_date || new Date().toISOString().split('T')[0],
      maturity_date: renewalDetails.maturity_date || '2029-01-01',
      maturity_date_source: 'Institution-submitted',
      status: 'Submitted',
      purpose: `Renewal of Deposit #${oldFdr.fdr_number}`,
      remarks: `Linked replacement for matured FDR #${oldFdr.fdr_number}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      days_until_maturity: daysLeft,
      previous_fdr_id: oldFdr.id,
      previous_fdr_number: oldFdr.fdr_number,
      documents: [
        {
          id: `doc_renew_${Date.now()}`,
          instrument_id: newId,
          file_name: `Renewal_Receipt_${renewalDetails.fdr_number || 'Renewed'}.pdf`,
          file_size: '2.0 MB',
          doc_type: 'Renewal Request',
          version: 1,
          uploaded_at: new Date().toISOString(),
          uploaded_by: currentUser.email,
        },
      ],
      discrepancies: [],
    };

    // Update old instrument
    setInstruments((prev) =>
      prev.map((inst): Instrument =>
        inst.id === oldInstrumentId
          ? {
              ...inst,
              status: 'Renewed' as const,
              renewed_fdr_id: newId,
              renewed_fdr_number: newInstrument.fdr_number,
              updated_at: new Date().toISOString(),
            }
          : inst
      ).concat([newInstrument])
    );

    logAudit('SUBMIT_RENEWAL', 'Renewal', newId, { old_fdr_id: oldFdr.id }, { new_fdr_id: newId });

    addNotification(
      'FDR Renewal Submitted',
      `Renewal submitted for FDR #${oldFdr.fdr_number}. New receipt #${newInstrument.fdr_number} created in review chain.`,
      'info',
      'scrutiny_officer',
      undefined,
      newId
    );

    return { success: true, newInstrument };
  };

  // Request Release (College)
  const requestRelease = (instrumentId: string, justification: string, checklist: ReleaseChecklist) => {
    const target = instruments.find((i) => i.id === instrumentId);
    if (!target) return;

    const releaseReq: ReleaseRequest = {
      id: `rel_${Date.now()}`,
      instrument_id: instrumentId,
      status: 'pending_scrutiny',
      checklist,
      justification,
      requested_by_name: currentUser.name,
      requested_at: new Date().toISOString(),
    };

    setInstruments((prev) =>
      prev.map((inst): Instrument =>
        inst.id === instrumentId
          ? {
              ...inst,
              status: 'Release Requested',
              release_request: releaseReq,
              updated_at: new Date().toISOString(),
            }
          : inst
      )
    );

    logAudit('REQUEST_RELEASE', 'ReleaseRequest', releaseReq.id, { previousStatus: target.status }, { releaseRequest: releaseReq });

    addNotification(
      'New Release Request Initiated',
      `${target.institution_name} requested release of deposit #${target.fdr_number} (₹${target.amount.toLocaleString('en-IN')}).`,
      'info',
      'scrutiny_officer',
      undefined,
      instrumentId
    );
  };

  // Recommend Release (Scrutiny Officer)
  const recommendRelease = (instrumentId: string, remarks: string, approved: boolean) => {
    setInstruments((prev) =>
      prev.map((inst): Instrument => {
        if (inst.id !== instrumentId || !inst.release_request) return inst;
        const newStatus = approved ? 'scrutiny_recommended' : 'scrutiny_rejected';
        return {
          ...inst,
          release_request: {
            ...inst.release_request,
            status: newStatus,
            scrutinized_by_name: currentUser.name,
            scrutiny_remarks: remarks,
            scrutinized_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        };
      })
    );

    logAudit(approved ? 'RECOMMEND_RELEASE' : 'REJECT_SCRUTINY_RELEASE', 'ReleaseRequest', instrumentId, null, { remarks, approved });

    if (approved) {
      addNotification(
        'Release Request Recommended to Authority',
        `Release request for FDR has been recommended by ${currentUser.name} and forwarded to Approving Authority for final release approval.`,
        'info',
        'approving_authority',
        undefined,
        instrumentId
      );
    }
  };

  // Decide Release (Approving Authority)
  const decideRelease = (instrumentId: string, remarks: string, approved: boolean) => {
    setInstruments((prev) =>
      prev.map((inst): Instrument => {
        if (inst.id !== instrumentId || !inst.release_request) return inst;
        const finalReqStatus = approved ? 'approved' : 'rejected';
        const finalFdrStatus: FDRStatus = approved ? 'Released' : 'Active';
        return {
          ...inst,
          status: finalFdrStatus,
          release_request: {
            ...inst.release_request,
            status: finalReqStatus,
            decided_by_name: currentUser.name,
            decision_remarks: remarks,
            decided_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        };
      })
    );

    logAudit(approved ? 'APPROVE_RELEASE_FINAL' : 'REJECT_RELEASE_FINAL', 'Instrument', instrumentId, null, { remarks, approved });

    addNotification(
      approved ? 'Security Deposit Released' : 'Release Request Rejected',
      approved
        ? `Approving Authority has sanctioned the final release and refund for FDR. AICTE lien revoked.`
        : `Release request was rejected by Approving Authority: ${remarks}`,
      approved ? 'success' : 'alert',
      'institution',
      undefined,
      instrumentId
    );
  };

  // Daily Maturity Engine Simulation (Feature 4 & Cron scheduler)
  const runDailyMaturityCheck = (): { updatedCount: number; notificationsCreated: number } => {
    let updatedCount = 0;
    let notifsCreated = 0;

    setInstruments((prev) =>
      prev.map((inst): Instrument => {
        const days = calculateDaysLeft(inst.maturity_date);
        let newStatus: FDRStatus = inst.status;

        // Status transitions
        if (days <= 0 && inst.status !== 'Released' && inst.status !== 'Renewed' && inst.status !== 'Closed') {
          newStatus = 'Matured';
          updatedCount++;
        } else if (days <= 30 && days > 0 && inst.status === 'Active') {
          newStatus = 'Expiring Soon';
          updatedCount++;
        }

        // Check configured milestone reminders
        if (settings.reminder_milestones.includes(days) || (days <= 30 && days > 0 && inst.days_until_maturity > 30)) {
          addNotification(
            `FDR Expiry Warning: ${days} days remaining`,
            `Fixed deposit #${inst.fdr_number} (${inst.bank_name}) belonging to ${inst.institution_name} expires in ${days} days. Renewal or release must be initiated.`,
            'alert',
            'institution',
            inst.institution_id,
            inst.id
          );
          notifsCreated++;
        }

        return {
          ...inst,
          days_until_maturity: days,
          status: newStatus,
          updated_at: new Date().toISOString(),
        };
      })
    );

    logAudit('CRON_DAILY_MATURITY_RUN', 'SystemScheduler', 'GLOBAL', null, {
      updatedCount,
      notifsCreated,
      timestamp: new Date().toISOString(),
    });

    return { updatedCount, notificationsCreated: notifsCreated };
  };

  // Filtered Instruments according to User Role & Search
  const filteredInstruments = instruments.filter((inst) => {
    // RBAC: Institution users can only view their own institution's FDRs
    if (currentUser.role === 'institution' && currentUser.institution_id) {
      if (inst.institution_id !== currentUser.institution_id) return false;
    }

    // Status filter
    if (selectedStatusFilter !== 'ALL' && inst.status !== selectedStatusFilter) {
      return false;
    }

    // Bank filter
    if (selectedBankFilter !== 'ALL' && inst.bank_name !== selectedBankFilter) {
      return false;
    }

    // State filter
    if (selectedStateFilter !== 'ALL' && inst.state !== selectedStateFilter) {
      return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        inst.fdr_number.toLowerCase().includes(q) ||
        inst.institution_name.toLowerCase().includes(q) ||
        inst.bank_name.toLowerCase().includes(q) ||
        inst.branch_name.toLowerCase().includes(q) ||
        inst.institution_aicte_id.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const unreadNotifsCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers: INITIAL_USERS,
        setCurrentUserRole,
        instruments,
        filteredInstruments,
        auditLogs,
        notifications,
        unreadNotifsCount,
        settings,
        updateSettings,
        markNotificationAsRead,
        clearAllNotifications,
        addNewInstrument,
        runRuleCheck,
        runBankVerification,
        resolveDiscrepancy,
        submitRenewalFdr,
        requestRelease,
        recommendRelease,
        decideRelease,
        runDailyMaturityCheck,
        searchTerm,
        setSearchTerm,
        selectedStatusFilter,
        setSelectedStatusFilter,
        selectedBankFilter,
        setSelectedBankFilter,
        selectedStateFilter,
        setSelectedStateFilter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
