import mongoose from 'mongoose';

const insuranceProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, index: true },
    type: { type: String, enum: ['INSURER', 'TPA'], default: 'INSURER' },
    contactPerson: { type: String },
    contactNumber: { type: String },
    tollFreeNumber: { type: String },
    email: { type: String },
    portalUrl: { type: String },
    address: { type: String },
    cashlessEmpaneled: { type: Boolean, default: true },
    slaDays: { type: Number, default: 30 },
    active: { type: Boolean, default: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: false }
  },
  { timestamps: true }
);

export const InsuranceProvider = mongoose.models.InsuranceProvider || mongoose.model('InsuranceProvider', insuranceProviderSchema);
export default InsuranceProvider;
