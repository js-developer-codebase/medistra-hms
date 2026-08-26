import { Schema, model, Types, models } from "mongoose";
import { IPayment } from "@/interfaces/payment.interface";

const paymentSchema = new Schema<IPayment>({
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["CASH", "CARD", "UPI", "BANK_TRANSFER"], required: true },
    transactionId: { type: String },
    date: { type: Date, default: Date.now },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true }
}, { timestamps: true });

export default models.Payment || model<IPayment>("Payment", paymentSchema);
