import mongoose, { Schema, Document } from "mongoose";

export interface IBloodCollection extends Document {
  collectionCode: string;
  donorId?: mongoose.Types.ObjectId;
  donorName: string;
  donorBloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  bagNumber: string;
  bagType:
    | "Single (350 ml)"
    | "Double (450 ml)"
    | "Triple with SAGM (450 ml)"
    | "Quadruple (450 ml)";
  volumeCollected: number; // in ml
  collectionDate: Date;
  phlebotomist: string;
  veinSite: "Left Antecubital" | "Right Antecubital";
  adverseReaction: "None" | "Mild Hematoma" | "Vasovagal Syncope" | "Nausea";
  componentsSeparated: boolean;
  separatedComponents: string[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bloodCollectionSchema = new Schema<IBloodCollection>(
  {
    collectionCode: { type: String, required: true, unique: true },
    donorId: { type: Schema.Types.ObjectId, ref: "BloodDonor" },
    donorName: { type: String, required: true },
    donorBloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },
    bagNumber: { type: String, required: true, unique: true },
    bagType: {
      type: String,
      enum: [
        "Single (350 ml)",
        "Double (450 ml)",
        "Triple with SAGM (450 ml)",
        "Quadruple (450 ml)"
      ],
      default: "Triple with SAGM (450 ml)"
    },
    volumeCollected: { type: Number, required: true, default: 450 },
    collectionDate: { type: Date, required: true, default: Date.now },
    phlebotomist: { type: String, required: true, default: "Sr. Blood Bank Tech" },
    veinSite: {
      type: String,
      enum: ["Left Antecubital", "Right Antecubital"],
      default: "Left Antecubital"
    },
    adverseReaction: {
      type: String,
      enum: ["None", "Mild Hematoma", "Vasovagal Syncope", "Nausea"],
      default: "None"
    },
    componentsSeparated: { type: Boolean, default: false },
    separatedComponents: [{ type: String }],
    notes: { type: String }
  },
  { timestamps: true }
);

export const BloodCollection =
  mongoose.models.BloodCollection ||
  mongoose.model<IBloodCollection>("BloodCollection", bloodCollectionSchema);

export default BloodCollection;
