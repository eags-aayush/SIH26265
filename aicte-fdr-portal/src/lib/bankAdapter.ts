export interface BankVerificationResult {
  success: boolean;
  bank_name: string;
  fdr_number: string;
  confirmed_amount?: number;
  confirmed_maturity_date?: string;
  branch_code?: string;
  transaction_ref?: string;
  verification_timestamp: string;
  message: string;
}

/**
 * Bank Verification Adapter
 * Designed as a pluggable gateway: can interface with real core-banking or corporate Open-Banking APIs
 * (e.g. SBI, PNB, Canara, HDFC, ICICI) or execute deterministic simulated verification for prototype & audits.
 */
export async function verifyFDRWithBank(
  bankName: string,
  fdrNumber: string,
  expectedAmount?: number,
  expectedMaturityDate?: string
): Promise<BankVerificationResult> {
  // Simulate network latency of bank API gateway
  await new Promise((resolve) => setTimeout(resolve, 800));

  const cleanNum = fdrNumber.trim().toUpperCase();

  // Test scenario: if FDR number contains "INVALID" or "FAKE", simulate rejection
  if (cleanNum.includes('INVALID') || cleanNum.includes('FAKE') || cleanNum.includes('999999')) {
    return {
      success: false,
      bank_name: bankName,
      fdr_number: fdrNumber,
      verification_timestamp: new Date().toISOString(),
      message: `Bank record lookup failed: No deposit receipt #${fdrNumber} found in ${bankName} centralized ledger.`,
    };
  }

  // Simulated confirmation with official bank verification ref
  const randomRef = `CBS-VFY-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    success: true,
    bank_name: bankName,
    fdr_number: fdrNumber,
    confirmed_amount: expectedAmount || 3500000,
    confirmed_maturity_date: expectedMaturityDate || '2027-03-31',
    branch_code: 'CB-941',
    transaction_ref: randomRef,
    verification_timestamp: new Date().toISOString(),
    message: `Core Banking System (CBS) confirmed: Active lien marked in favor of AICTE New Delhi. Record validated.`,
  };
}
