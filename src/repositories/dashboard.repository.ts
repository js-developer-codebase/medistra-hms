import Patient from "@/models/patient.model";
import User from "@/models/user.model";
import Appointment from "@/models/appointment.model";
import Bed from "@/models/bed.model";
import Role from "@/models/role.model";
import Admission from "@/models/admission.model";
import "@/models/room.model";
import "@/models/ward.model";

class DashboardRepository {
  async getTotalPatients(): Promise<number> {
    return Patient.countDocuments({ isMerged: { $ne: true } });
  }

  async getTotalDoctors(): Promise<number> {
    const doctorRoles = await Role.find({ role: { $in: ["DOCTOR", "CONSULTANT"] } }).select('_id');
    const doctorRoleIds = doctorRoles.map(r => r._id);
    return User.countDocuments({ role: { $in: doctorRoleIds }, isActive: true });
  }

  async getTotalAppointments(): Promise<number> {
    return Appointment.countDocuments();
  }

  async getTodayAppointments(): Promise<number> {
    const now = new Date();
    
    // UTC day boundaries
    const startOfUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endOfUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    
    // Local day boundaries
    const startOfLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const earliest = startOfUtc < startOfLocal ? startOfUtc : startOfLocal;
    const latest = endOfUtc > endOfLocal ? endOfUtc : endOfLocal;

    return Appointment.countDocuments({
      appointmentDate: { $gte: earliest, $lte: latest }
    });
  }

  async getOccupiedBedsCount(): Promise<number> {
    // 1. Bed status is OCCUPIED (case-insensitive)
    const occupiedByBedStatus = await Bed.find({
      status: { $regex: /^occupied$/i }
    }).distinct('_id');

    // 2. Beds currently assigned to active admissions
    const occupiedByAdmission = await Admission.find({
      status: { $in: ["ADMITTED", "ACTIVE"] }
    }).distinct('bedId');

    // 3. Unique union of occupied bed IDs
    const uniqueOccupiedIds = new Set([
      ...occupiedByBedStatus.map(id => id.toString()),
      ...occupiedByAdmission.filter(Boolean).map(id => id.toString())
    ]);

    return uniqueOccupiedIds.size;
  }

  async getTotalBedsCount(): Promise<number> {
    return Bed.countDocuments({ isActive: { $ne: false } });
  }

  async getRecentPatients(limit: number = 5): Promise<any[]> {
    // Check if recent admissions exist
    const admissions = await Admission.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("patientId", "name uhid")
      .populate("doctorId", "name")
      .populate({
        path: "bedId",
        populate: { path: "roomId", populate: { path: "wardId" } }
      })
      .lean();

    if (admissions && admissions.length > 0) {
      return admissions.map((a: any) => {
        const bed = a.bedId as any;
        const room = bed?.roomId as any;
        const ward = room?.wardId as any;
        const wardType = (ward?.wardType || "").toUpperCase();
        const isIcu = wardType.includes("ICU");

        return {
          name: a.patientId?.name || "Admitted Patient",
          id: a.patientId?.uhid || "P-NEW",
          doctor: a.doctorId?.name ? `Dr. ${a.doctorId.name}` : "Attending Physician",
          status: isIcu ? "ICU" : (a.status === "ADMITTED" ? "Admitted" : (a.status === "DISCHARGED" ? "Discharged" : "Active")),
          time: a.admissionDate || a.createdAt ? new Date(a.admissionDate || a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
        };
      });
    }

    // Fallback to recent patients
    const patients = await Patient.find({ isMerged: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name uhid createdAt')
      .lean();

    return patients.map((p: any) => ({
      name: p.name,
      id: p.uhid || "P-NEW",
      doctor: "Attending Physician",
      status: "Active",
      time: p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
    }));
  }
}

export default new DashboardRepository();
