import { Types } from 'mongoose';
import { InsuranceProvider } from '@/models/insurance-provider.model';
import { InsurancePolicy } from '@/models/insurance-policy.model';
import { InsuranceClaim } from '@/models/insurance-claim.model';
import { InsurancePreauth } from '@/models/insurance-preauth.model';
import { InsuranceDocument } from '@/models/insurance-document.model';
import '@/models/patient.model'; // Ensure Patient model is registered
import '@/models/invoice.model'; // Ensure Invoice model is registered

export class InsuranceService {
  // 1. Executive Stats
  async getInsuranceStats() {
    const providers = await InsuranceProvider.find({ active: true }).lean();
    const policies = await InsurancePolicy.find().lean();
    const preauths = await InsurancePreauth.find().lean();
    const claims = await InsuranceClaim.find().populate('providerId patientId').lean();

    let totalClaimed = 0;
    let totalApproved = 0;
    let totalSettled = 0;
    let totalDisallowed = 0;

    let pendingPreauthCount = 0;
    let approvedPreauthCount = 0;
    let activeClaimsCount = 0;
    let settledClaimsCount = 0;
    let queryPendingClaimsCount = 0;

    const providerDistribution: Record<string, { count: number; claimed: number; settled: number; name: string }> = {};

    for (const p of providers) {
      providerDistribution[p._id.toString()] = { count: 0, claimed: 0, settled: 0, name: p.name };
    }

    for (const pa of preauths) {
      if (pa.status === 'SUBMITTED' || pa.status === 'QUERY_RAISED') {
        pendingPreauthCount++;
      } else if (pa.status === 'APPROVED') {
        approvedPreauthCount++;
      }
    }

    for (const c of claims) {
      const claimed = Number(c.amountClaimed || 0);
      const approved = Number(c.amountApproved || 0);
      const settled = Number(c.amountSettled || 0);
      const disallowed = Number(c.amountDisallowed || 0);

      totalClaimed += claimed;
      totalApproved += approved;
      totalSettled += settled;
      totalDisallowed += disallowed;

      if (c.status === 'SETTLED') {
        settledClaimsCount++;
      } else if (c.status === 'QUERY_PENDING') {
        queryPendingClaimsCount++;
        activeClaimsCount++;
      } else if (c.status !== 'REJECTED' && c.status !== 'DRAFT') {
        activeClaimsCount++;
      }

      const pId = c.providerId?._id ? c.providerId._id.toString() : (c.providerId ? c.providerId.toString() : 'UNKNOWN');
      if (providerDistribution[pId]) {
        providerDistribution[pId].count++;
        providerDistribution[pId].claimed += claimed;
        providerDistribution[pId].settled += settled;
      } else if (c.providerId?.name) {
        providerDistribution[pId] = {
          count: 1,
          claimed,
          settled,
          name: c.providerId.name
        };
      }
    }

    const recentClaims = await InsuranceClaim.find()
      .populate('providerId', 'name code type')
      .populate('patientId', 'name uhid contact')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return {
      activeProvidersCount: providers.length,
      totalPoliciesCount: policies.length,
      pendingPreauthCount,
      approvedPreauthCount,
      activeClaimsCount,
      settledClaimsCount,
      queryPendingClaimsCount,
      totalClaimedAmount: totalClaimed,
      totalApprovedAmount: totalApproved,
      totalSettledAmount: totalSettled,
      totalDisallowedAmount: totalDisallowed,
      pendingDuesFromTpa: Math.max(0, totalApproved - totalSettled),
      providerDistribution,
      recentClaims
    };
  }

  // 2. Providers
  async getInsuranceProviders(query: Record<string, any> = {}) {
    return await InsuranceProvider.find(query).sort({ name: 1 }).lean();
  }

  async createInsuranceProvider(data: any) {
    if (!data.code && data.name) {
      data.code = data.name.toUpperCase().replace(/\s+/g, '-').slice(0, 15);
    }
    return await InsuranceProvider.create(data);
  }

  async getInsuranceProviderById(id: string) {
    return await InsuranceProvider.findById(id).lean();
  }

  async updateInsuranceProvider(id: string, data: any) {
    return await InsuranceProvider.findByIdAndUpdate(id, data, { new: true });
  }

  // 3. Policies
  async getInsurancePolicies(query: Record<string, any> = {}) {
    return await InsurancePolicy.find(query)
      .populate('patientId', 'name uhid age gender contact bloodGroup')
      .populate('providerId', 'name code type contactPerson contactNumber')
      .sort({ createdAt: -1 })
      .lean();
  }

  async createInsurancePolicy(data: any) {
    if (data.coverageAmount && !data.sumInsured) {
      data.sumInsured = data.coverageAmount;
    }
    if (data.sumInsured && !data.availableBalance) {
      data.availableBalance = data.sumInsured;
    }
    return await InsurancePolicy.create(data);
  }

  async getInsurancePolicyById(id: string) {
    return await InsurancePolicy.findById(id)
      .populate('patientId')
      .populate('providerId')
      .lean();
  }

  async updateInsurancePolicy(id: string, data: any) {
    return await InsurancePolicy.findByIdAndUpdate(id, data, { new: true });
  }

  // 4. Eligibility Verification
  async verifyEligibility(params: { memberId?: string; policyNumber?: string; patientId?: string }) {
    const filter: Record<string, any> = {};
    if (params.memberId) filter.memberId = new RegExp(`^${params.memberId.trim()}$`, 'i');
    else if (params.policyNumber) filter.policyNumber = new RegExp(`^${params.policyNumber.trim()}$`, 'i');
    else if (params.patientId && Types.ObjectId.isValid(params.patientId)) filter.patientId = new Types.ObjectId(params.patientId);

    const policy = await InsurancePolicy.findOne(filter)
      .populate('patientId', 'name uhid age gender contact bloodGroup')
      .populate('providerId', 'name code type contactPerson contactNumber cashlessEmpaneled slaDays')
      .lean();

    if (!policy) {
      return { eligible: false, message: "No active insurance policy found matching the credentials" };
    }

    const now = new Date();
    const isExpired = policy.validTill ? new Date(policy.validTill) < now : false;
    const isSuspended = policy.status === 'SUSPENDED';
    const hasBalance = Number(policy.availableBalance || policy.sumInsured || 0) > 0;
    const isCashlessEmpaneled = (policy.providerId as any)?.cashlessEmpaneled !== false;

    const eligible = !isExpired && !isSuspended && hasBalance && isCashlessEmpaneled;

    return {
      eligible,
      policy,
      checks: {
        activeStatus: !isSuspended,
        notExpired: !isExpired,
        availableCoverage: hasBalance,
        cashlessEmpaneled: isCashlessEmpaneled
      },
      verifiedAt: new Date()
    };
  }

  // 5. Pre-Authorizations
  async getInsurancePreauths(query: Record<string, any> = {}) {
    return await InsurancePreauth.find(query)
      .populate('patientId', 'name uhid age gender contact')
      .populate('providerId', 'name code type contactNumber')
      .populate('policyId', 'policyNumber memberId sumInsured availableBalance')
      .sort({ createdAt: -1 })
      .lean();
  }

  async createInsurancePreauth(data: any) {
    if (!data.preAuthNumber) {
      const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      data.preAuthNumber = `PA-${dateStr}-${randomCode}`;
    }
    return await InsurancePreauth.create(data);
  }

  async updateInsurancePreauthStatus(id: string, data: any) {
    return await InsurancePreauth.findByIdAndUpdate(id, data, { new: true });
  }

  // 6. Claims
  async getInsuranceClaims(query: Record<string, any> = {}) {
    return await InsuranceClaim.find(query)
      .populate('patientId', 'name uhid age gender contact')
      .populate('providerId', 'name code type contactPerson contactNumber')
      .populate('policyId', 'policyNumber memberId sumInsured')
      .populate('invoiceId', 'invoiceNumber finalAmount paidAmount department')
      .sort({ createdAt: -1 })
      .lean();
  }

  async createInsuranceClaim(data: any) {
    if (!data.claimNumber) {
      const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      data.claimNumber = `CLM-${dateStr}-${randomCode}`;
    }
    return await InsuranceClaim.create(data);
  }

  async getInsuranceClaimById(id: string) {
    return await InsuranceClaim.findById(id)
      .populate('patientId')
      .populate('providerId')
      .populate('policyId')
      .populate('invoiceId')
      .lean();
  }

  async updateInsuranceClaim(id: string, data: any) {
    return await InsuranceClaim.findByIdAndUpdate(id, data, { new: true });
  }

  // 7. Documents
  async getInsuranceDocuments(query: Record<string, any> = {}) {
    return await InsuranceDocument.find(query)
      .populate('patientId', 'name uhid contact')
      .populate('claimId', 'claimNumber status amountClaimed')
      .populate('providerId', 'name')
      .sort({ createdAt: -1 })
      .lean();
  }

  async createInsuranceDocument(data: any) {
    if (!data.documentNumber) {
      const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      data.documentNumber = `DOC-${dateStr}-${randomCode}`;
    }
    return await InsuranceDocument.create(data);
  }

  async verifyInsuranceDocument(id: string, verifiedBy: string) {
    return await InsuranceDocument.findByIdAndUpdate(
      id,
      { verified: true, verifiedBy, verifiedAt: new Date() },
      { new: true }
    );
  }

  // 8. Electronic Submission Batching
  async createSubmissionBatch(claimIds: string[], batchName?: string) {
    const batchId = `BATCH-${new Date().toISOString().slice(0, 7).replace("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    await InsuranceClaim.updateMany(
      { _id: { $in: claimIds.map((id) => new Types.ObjectId(id)) } },
      { submissionBatchId: batchId, status: 'SUBMITTED', dateSubmitted: new Date() }
    );

    return {
      batchId,
      batchName: batchName || `E-Batch ${batchId}`,
      claimCount: claimIds.length,
      dispatchedAt: new Date()
    };
  }

  // 9. Claim Settlement
  async recordClaimSettlement(claimId: string, settlementData: any) {
    const claim = await InsuranceClaim.findById(claimId);
    if (!claim) throw new Error("Claim not found");

    const amountApproved = Number(settlementData.amountApproved || claim.amountClaimed || 0);
    const amountSettled = Number(settlementData.amountSettled || 0);
    const amountDisallowed = Number(settlementData.amountDisallowed || Math.max(0, claim.amountClaimed - amountSettled));
    const copayAmount = Number(settlementData.copayAmount || 0);

    const updatedClaim = await InsuranceClaim.findByIdAndUpdate(
      claimId,
      {
        amountApproved,
        amountSettled,
        amountDisallowed,
        copayAmount,
        settlementDate: settlementData.settlementDate || new Date(),
        settlementUtr: settlementData.settlementUtr || `UTR-${Date.now().toString().slice(-8)}`,
        status: amountSettled >= amountApproved ? 'SETTLED' : 'PARTIAL',
        notes: settlementData.notes || `Settlement recorded via Insurance Desk`
      },
      { new: true }
    );

    return updatedClaim;
  }

  // 10. Reports & Analytics
  async getInsuranceReports() {
    const claims = await InsuranceClaim.find()
      .populate('providerId', 'name code type slaDays')
      .populate('patientId', 'name uhid')
      .sort({ createdAt: -1 })
      .lean();

    const providerMap: Record<string, { name: string; totalClaims: number; claimed: number; settled: number; disallowed: number; settlementRatio: string }> = {};

    let totalClaimed = 0;
    let totalSettled = 0;
    let totalDisallowed = 0;

    for (const c of claims) {
      const pName = (c.providerId as any)?.name || 'Direct / Other';
      const claimed = Number(c.amountClaimed || 0);
      const settled = Number(c.amountSettled || 0);
      const disallowed = Number(c.amountDisallowed || 0);

      totalClaimed += claimed;
      totalSettled += settled;
      totalDisallowed += disallowed;

      if (!providerMap[pName]) {
        providerMap[pName] = { name: pName, totalClaims: 0, claimed: 0, settled: 0, disallowed: 0, settlementRatio: '0%' };
      }

      providerMap[pName].totalClaims += 1;
      providerMap[pName].claimed += claimed;
      providerMap[pName].settled += settled;
      providerMap[pName].disallowed += disallowed;
    }

    Object.values(providerMap).forEach((p) => {
      p.settlementRatio = p.claimed > 0 ? `${Math.round((p.settled / p.claimed) * 100)}%` : '0%';
    });

    const providerPerformance = Object.values(providerMap).sort((a, b) => b.claimed - a.claimed);

    return {
      summary: {
        totalClaimsCount: claims.length,
        totalClaimedAmount: totalClaimed,
        totalSettledAmount: totalSettled,
        totalDisallowedAmount: totalDisallowed,
        overallSettlementRatio: totalClaimed > 0 ? `${Math.round((totalSettled / totalClaimed) * 100)}%` : '0%'
      },
      providerPerformance,
      recentSettlements: claims.filter((c) => c.status === 'SETTLED').slice(0, 10)
    };
  }
}

export const insuranceService = new InsuranceService();
export default insuranceService;

// Backward-compatible exports for existing callers
export const getInsuranceProviders = (orgId?: string) => insuranceService.getInsuranceProviders(orgId ? { organizationId: orgId } : {});
export const createInsuranceProvider = (data: any) => insuranceService.createInsuranceProvider(data);
export const getInsuranceClaims = (orgId?: string) => insuranceService.getInsuranceClaims(orgId ? { organizationId: orgId } : {});
export const createInsuranceClaim = (data: any) => insuranceService.createInsuranceClaim(data);
export const getInsurancePolicies = (orgId?: string) => insuranceService.getInsurancePolicies(orgId ? { organizationId: orgId } : {});
export const createInsurancePolicy = (data: any) => insuranceService.createInsurancePolicy(data);
