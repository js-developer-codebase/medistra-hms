import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/patient.model";
import Appointment from "@/models/appointment.model";
import Invoice from "@/models/invoice.model";

export async function GET() {
  try {
    await dbConnect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalPatients, totalAppointments, appointmentsToday, invoices] = await Promise.all([
      Patient.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: { $gte: today },
      }),
      Invoice.find({ status: "PAID" }),
    ]);

    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.finalAmount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        totalPatients,
        totalAppointments,
        appointmentsToday,
        totalRevenue,
      },
    });
  } catch (error: any) {
    console.error("Management Report Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
