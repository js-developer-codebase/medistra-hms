import Patient from "@/models/patient.model";
import User from "@/models/user.model";
import Appointment from "@/models/appointment.model";
import Bed from "@/models/bed.model";
import Role from "@/models/role.model";

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
    return Bed.countDocuments({ status: 'Occupied' });
  }

  async getTotalBedsCount(): Promise<number> {
    return Bed.countDocuments();
  }

  async getRecentPatients(limit: number = 5): Promise<any[]> {
    return Patient.find({ isMerged: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name uhid createdAt');
  }
}

export default new DashboardRepository();
