import mongoose from 'mongoose';

const insurancePolicySchema = new mongoose.Schema(
  {
    policyNumber: { type: String, required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsuranceProvider', required: true },
    coverageAmount: { type: Number, required: true },
    validFrom: { type: Date, required: true },
    validTill: { type: Date, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
  },
  { timestamps: true }
);

export const InsurancePolicy = mongoose.models.InsurancePolicy || mongoose.model('InsurancePolicy', insurancePolicySchema);
