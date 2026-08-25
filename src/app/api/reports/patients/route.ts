import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/patient.model";

export async function GET() {
  try {
    await dbConnect();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalPatients, newPatientsLast30Days, genderStats] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Patient.aggregate([
        { $group: { _id: "$gender", count: { $sum: 1 } } }
      ])
    ]);

    const formattedGenderStats = genderStats.reduce((acc, curr) => {
        acc[curr._id || 'Unknown'] = curr.count;
        return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        totalPatients,
        newPatientsLast30Days,
        genderStats: formattedGenderStats,
      },
    });
  } catch (error: any) {
    console.error("Patient Report Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
