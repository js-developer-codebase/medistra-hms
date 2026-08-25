import mongoose, { Schema, Document } from "mongoose";

export interface INursingCarePlan extends Document {
  patient: mongoose.Types.ObjectId;
  nurse: mongoose.Types.ObjectId;
  diagnosis: string;
  goals: string;
  interventions: string;
  evaluation: string;
  status: "ACTIVE" | "RESOLVED";
  createdAt: Date;
  updatedAt: Date;
}

const NursingCarePlanSchema: Schema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    nurse: { type: Schema.Types.ObjectId, ref: "User", required: true },
    diagnosis: { type: String, required: true },
    goals: { type: String, required: true },
    interventions: { type: String, required: true },
    evaluation: { type: String },
    status: { type: String, enum: ["ACTIVE", "RESOLVED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export default mongoose.models.NursingCarePlan || mongoose.model<INursingCarePlan>("NursingCarePlan", NursingCarePlanSchema);
