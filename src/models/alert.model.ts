import mongoose, { Schema, model, models } from "mongoose";
import { IAlert } from "@/interfaces/alert.interface";

const alertSchema = new Schema<IAlert>(
  {
    source: {
      type: String,
      enum: ["Clinical", "Inventory", "Operations"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["CRITICAL", "WARNING", "INFO"],
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ACKNOWLEDGED"],
      default: "ACTIVE",
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
    },
  },
  { timestamps: true }
);

export default models.Alert || model<IAlert>("Alert", alertSchema);
