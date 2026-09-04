import mongoose from 'mongoose';

const insurancePreauthSchema = new mongoose.Schema(
  {
    preAuthNumber: { type: String, required: true, unique: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsuranceProvider', required: true },
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsurancePolicy' },
    estimatedCost: { type: Number, required: true, min: 0 },
    requestedAmount: { type: Number, required: true, min: 0 },
    approvedAmount: { type: Number, default: 0, min: 0 },
    diagnosis: { type: String, required: true },
    treatmentPlan: { type: String },
    treatingDoctor: { type: String },
    department: { type: String, default: 'General Surgery' },
    admissionDate: { type: Date, default: Date.now },
    expectedStayDays: { type: Number, default: 3 },
    roomType: { type: String, default: 'Semi-Private Room' },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'QUERY_RAISED', 'APPROVED', 'DENIED', 'CANCELLED'],
      default: 'SUBMITTED',
      index: true
    },
    queryDetails: { type: String },
    queryResponse: { type: String },
    approvalLetterUrl: { type: String },
    validUntil: { type: Date },
    notes: { type: String }
  },
  { timestamps: true }
);

export const InsurancePreauth = mongoose.models.InsurancePreauth || mongoose.model('InsurancePreauth', insurancePreauthSchema);
export default InsurancePreauth;
