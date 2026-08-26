import mongoose from 'mongoose';

const insuranceProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactPerson: { type: String },
    contactNumber: { type: String },
    email: { type: String },
    address: { type: String },
    active: { type: Boolean, default: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
  },
  { timestamps: true }
);

export const InsuranceProvider = mongoose.models.InsuranceProvider || mongoose.model('InsuranceProvider', insuranceProviderSchema);
