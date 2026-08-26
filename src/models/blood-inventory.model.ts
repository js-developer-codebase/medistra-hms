import mongoose from 'mongoose';

const bloodInventorySchema = new mongoose.Schema(
  {
    bloodGroup: { type: String, required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    unitsAvailable: { type: Number, required: true, default: 0 },
    expiryDate: { type: Date, required: true },
    bagNumber: { type: String, required: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodDonor' },
    status: { type: String, enum: ['AVAILABLE', 'RESERVED', 'ISSUED', 'DISCARDED'], default: 'AVAILABLE' },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
  },
  { timestamps: true }
);

export const BloodInventory = mongoose.models.BloodInventory || mongoose.model('BloodInventory', bloodInventorySchema);
