import mongoose from 'mongoose';

const bloodDonorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    contactNumber: { type: String, required: true },
    email: { type: String },
    lastDonationDate: { type: Date },
    medicalHistory: { type: String },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
  },
  { timestamps: true }
);

export const BloodDonor = mongoose.models.BloodDonor || mongoose.model('BloodDonor', bloodDonorSchema);
