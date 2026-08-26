import NursingCarePlan from "@/models/nursing-care-plan.model";
import Shift from "@/models/shift.model";

export class NursingService {
  async getCarePlans() {
    return NursingCarePlan.find().populate("patient nurse").sort({ createdAt: -1 });
  }

  async createCarePlan(data: any) {
    return NursingCarePlan.create(data);
  }
  
  async getShifts() {
    return Shift.find().populate("user ward").sort({ startTime: 1 });
  }

  async getMyPatients(nurseId: string) {
    // Return all patients that have an active care plan with this nurse
    const plans = await NursingCarePlan.find({ nurse: nurseId, status: "ACTIVE" }).populate("patient");
    const patients = plans.map(p => p.patient).filter((v, i, a) => a.findIndex(t => (t as any)._id === (v as any)._id) === i);
    return patients;
  }
}

export default new NursingService();
