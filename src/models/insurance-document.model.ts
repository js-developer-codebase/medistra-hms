import mongoose from 'mongoose';

const insuranceDocumentSchema = new mongoose.Schema(
  {
    documentNumber: { type: String, required: true, unique: true, index: true },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsuranceClaim' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsuranceProvider' },
    documentType: {
      type: String,
      enum: [
        'PREAUTH_LETTER',
        'DISCHARGE_SUMMARY',
        'FINAL_BILL',
        'INVESTIGATION_REPORT',
        'PHARMACY_SLIP',
        'IMPLANT_INVOICE',
        'KYC_DOCUMENT',
        'CLAIM_FORM',
        'INDOOR_CASE_PAPERS',
        'OTHER'
      ],
      default: 'CLAIM_FORM'
    },
    documentName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: String, default: '1.2 MB' },
    mimeType: { type: String, default: 'application/pdf' },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: String },
    verifiedAt: { type: Date },
    uploadedBy: { type: String, default: 'TPA Desk Executive' },
    notes: { type: String }
  },
  { timestamps: true }
);

export const InsuranceDocument = mongoose.models.InsuranceDocument || mongoose.model('InsuranceDocument', insuranceDocumentSchema);
export default InsuranceDocument;
