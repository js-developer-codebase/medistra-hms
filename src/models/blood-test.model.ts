import mongoose, { Schema, Document } from "mongoose";

export interface IBloodTest extends Document {
  testCode: string;
  bagNumber: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  componentType: string;
  hivResult: "NON_REACTIVE" | "REACTIVE";
  hbsagResult: "NON_REACTIVE" | "REACTIVE";
  hcvResult: "NON_REACTIVE" | "REACTIVE";
  vdrlResult: "NON_REACTIVE" | "REACTIVE";
  malariaResult: "NEGATIVE" | "POSITIVE";
  rhPhenotype?: string;
  irregularAntibodyScreening: "NEGATIVE" | "POSITIVE";
  overallSafetyStatus: "SAFE_FOR_TRANSFUSION" | "UNSAFE_DISCARD";
  testedBy: string;
  verifiedBy: string; // Consultant Pathologist
  testedAt: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bloodTestSchema = new Schema<IBloodTest>(
  {
    testCode: { type: String, required: true, unique: true },
    bagNumber: { type: String, required: true },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    componentType: { type: String, default: "PRBC" },
    hivResult: { type: String, enum: ["NON_REACTIVE", "REACTIVE"], default: "NON_REACTIVE" },
    hbsagResult: { type: String, enum: ["NON_REACTIVE", "REACTIVE"], default: "NON_REACTIVE" },
    hcvResult: { type: String, enum: ["NON_REACTIVE", "REACTIVE"], default: "NON_REACTIVE" },
    vdrlResult: { type: String, enum: ["NON_REACTIVE", "REACTIVE"], default: "NON_REACTIVE" },
    malariaResult: { type: String, enum: ["NEGATIVE", "POSITIVE"], default: "NEGATIVE" },
    rhPhenotype: { type: String, default: "Rh (D) Positive" },
    irregularAntibodyScreening: {
      type: String,
      enum: ["NEGATIVE", "POSITIVE"],
      default: "NEGATIVE"
    },
    overallSafetyStatus: {
      type: String,
      enum: ["SAFE_FOR_TRANSFUSION", "UNSAFE_DISCARD"],
      default: "SAFE_FOR_TRANSFUSION"
    },
    testedBy: { type: String, required: true, default: "Sr. Serologist" },
    verifiedBy: { type: String, required: true, default: "Dr. Pathologist (Transfusion Specialist)" },
    testedAt: { type: Date, default: Date.now },
    notes: { type: String }
  },
  { timestamps: true }
);

export const BloodTest =
  mongoose.models.BloodTest ||
  mongoose.model<IBloodTest>("BloodTest", bloodTestSchema);

export default BloodTest;
