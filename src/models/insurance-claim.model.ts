import mongoose from 'mongoose';

const insuranceClaimSchema = new mongoose.Schema(
  {
    claimNumber: { type: String, required: true, unique: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsuranceProvider', required: true },
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsurancePolicy' },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    preAuthNumber: { type: String },
    claimType: { type: String, enum: ['CASHLESS', 'REIMBURSEMENT'], default: 'CASHLESS' },
    totalBilledAmount: { type: Number, default: 0 },
    amountClaimed: { type: Number, required: true },
    amountApproved: { type: Number, default: 0 },
    amountSettled: { type: Number, default: 0 },
    amountDisallowed: { type: Number, default: 0 },
    copayAmount: { type: Number, default: 0 },
    settlementDate: { type: Date },
    settlementUtr: { type: String },
    diagnosis: { type: String },
    treatingDoctor: { type: String },
    department: { type: String, default: 'Inpatient (IPD)' },
    admissionDate: { type: Date },
    dischargeDate: { type: Date },
    submissionBatchId: { type: String },
    tpaQuery: { type: String },
    tpaQueryResponse: { type: String },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUERY_PENDING', 'APPROVED', 'SETTLED', 'REJECTED', 'PARTIAL', 'PENDING'],
      default: 'SUBMITTED',
      index: true
    },
    dateSubmitted: { type: Date, default: Date.now },
    notes: { type: String },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: false }
  },
  { timestamps: true }
);

export const InsuranceClaim = mongoose.models.InsuranceClaim || mongoose.model('InsuranceClaim', insuranceClaimSchema);
export default InsuranceClaim;
