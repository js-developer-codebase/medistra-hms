import mongoose from 'mongoose';

const insurancePolicySchema = new mongoose.Schema(
  {
    policyNumber: { type: String, required: true, index: true },
    memberId: { type: String, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsuranceProvider', required: true },
    policyType: {
      type: String,
      enum: ['INDIVIDUAL', 'FAMILY_FLOATER', 'CORPORATE_GROUP', 'GOVERNMENT_SCHEME'],
      default: 'INDIVIDUAL'
    },
    coverageAmount: { type: Number, required: true },
    sumInsured: { type: Number },
    availableBalance: { type: Number },
    copayPercentage: { type: Number, default: 0 },
    roomRentLimit: { type: Number },
    validFrom: { type: Date, required: true },
    validTill: { type: Date, required: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'SUSPENDED', 'PENDING_VERIFICATION'],
      default: 'ACTIVE'
    },
    notes: { type: String },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: false }
  },
  { timestamps: true }
);

export const InsurancePolicy = mongoose.models.InsurancePolicy || mongoose.model('InsurancePolicy', insurancePolicySchema);
export default InsurancePolicy;
