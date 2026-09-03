import mongoose, { Schema, Document, Types } from "mongoose";

export interface INursingIntakeOutput extends Document {
  patient: Types.ObjectId;
  recordedBy?: Types.ObjectId;
  recordDate: Date;
  timeSlot?: string;
  // Intake
  intakeType?: "ORAL" | "IV_FLUID" | "BLOOD_PRODUCT" | "TUBE_FEED" | "NONE";
  intakeAmountMl: number;
  intakeDetails?: string;
  // Output
  outputType?: "URINE" | "DRAIN" | "VOMITUS" | "STOOL" | "NG_ASPIRATE" | "NONE";
  outputAmountMl: number;
  outputDetails?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NursingIntakeOutputSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
    recordDate: { type: Date, default: Date.now },
    timeSlot: { type: String }, // e.g. "08:00 AM", "12:00 PM"
    intakeType: {
      type: String,
      enum: ["ORAL", "IV_FLUID", "BLOOD_PRODUCT", "TUBE_FEED", "NONE"],
      default: "NONE"
    },
    intakeAmountMl: { type: Number, default: 0 },
    intakeDetails: { type: String },
    outputType: {
      type: String,
      enum: ["URINE", "DRAIN", "VOMITUS", "STOOL", "NG_ASPIRATE", "NONE"],
      default: "NONE"
    },
    outputAmountMl: { type: Number, default: 0 },
    outputDetails: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

const NursingIntakeOutput =
  mongoose.models.NursingIntakeOutput ||
  mongoose.model<INursingIntakeOutput>("NursingIntakeOutput", NursingIntakeOutputSchema);

export default NursingIntakeOutput;
