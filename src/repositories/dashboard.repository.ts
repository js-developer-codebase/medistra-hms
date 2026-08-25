import Patient from "@/models/patient.model";
import User from "@/models/user.model";
import Appointment from "@/models/appointment.model";
import Bed from "@/models/bed.model";
import Role from "@/models/role.model";

class DashboardRepository {
  async getTotalPatients(): Promise<number> {
    return Patient.countDocuments();
  }

  async getTotalDoctors(): Promise<number> {
    const doctorRoles = await Role.find({ role: { $in: ["DOCTOR", "CONSULTANT"] } }).select('_id');
    const doctorRoleIds = doctorRoles.map(r => r._id);
    return User.countDocuments({ role: { $in: doctorRoleIds }, isActive: true });
  }

  async getTodayAppointments(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    return Appointment.countDocuments({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay }
    });
  }

  async getOccupiedBedsCount(): Promise<number> {
    return Bed.countDocuments({ status: 'Occupied' });
  }

  async getTotalBedsCount(): Promise<number> {
    return Bed.countDocuments();
  }

  async getRecentPatients(limit: number = 5): Promise<any[]> {
    return Patient.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name uhid createdAt');
  }
}

export default new DashboardRepository();
