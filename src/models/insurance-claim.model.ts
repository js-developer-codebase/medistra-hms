import mongoose from 'mongoose';

const insuranceClaimSchema = new mongoose.Schema(
  {
    claimNumber: { type: String, required: true, unique: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsuranceProvider', required: true },
    amountClaimed: { type: Number, required: true },
    amountApproved: { type: Number },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'PARTIAL'], default: 'PENDING' },
    dateSubmitted: { type: Date, default: Date.now },
    notes: { type: String },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
  },
  { timestamps: true }
);

export const InsuranceClaim = mongoose.models.InsuranceClaim || mongoose.model('InsuranceClaim', insuranceClaimSchema);
