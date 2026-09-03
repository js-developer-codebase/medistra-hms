import NursingCarePlan from "@/models/nursing-care-plan.model";
import Shift from "@/models/shift.model";
import NursingTask from "@/models/nursing-task.model";
import NursingIntakeOutput from "@/models/nursing-intake-output.model";
import NursingMedication from "@/models/nursing-medication.model";
import NursingHandover from "@/models/nursing-handover.model";
import Admission from "@/models/admission.model";
import Bed from "@/models/bed.model";
import Patient from "@/models/patient.model";
import "@/models/user.model";
import "@/models/room.model";
import "@/models/ward.model";

export class NursingService {
  // 1. My Inpatients (Real admitted ward inpatients)
  async getMyPatients(filter: any = {}) {
    const query: any = { status: { $in: ["ADMITTED", "ACTIVE"] } };

    const admissions = await Admission.find(query)
      .populate("patientId", "name uhid age gender contact bloodGroup allergies medicalHistory")
      .populate("doctorId", "name email contact")
      .populate({
        path: "bedId",
        populate: {
          path: "roomId",
          populate: { path: "wardId" }
        }
      })
      .sort({ admissionDate: -1 })
      .lean();

    return admissions.map((adm: any) => {
      const bed = adm.bedId as any;
      const room = bed?.roomId as any;
      const ward = room?.wardId as any;
      const patient = adm.patientId as any;

      return {
        admissionId: adm._id,
        patientId: patient?._id,
        name: patient?.name || "Admitted Patient",
        uhid: patient?.uhid || "UHID-PENDING",
        age: patient?.age,
        gender: patient?.gender,
        contact: patient?.contact,
        bloodGroup: patient?.bloodGroup,
        allergies: patient?.allergies || [],
        bedNumber: bed?.bedNumber || "Unassigned",
        roomNumber: room?.roomNumber || "Ward Room",
        wardName: ward?.wardName || "General Ward",
        wardType: ward?.wardType || "General",
        floor: ward?.floor || 1,
        doctorName: adm.doctorId?.name ? `Dr. ${adm.doctorId.name}` : "Attending Physician",
        doctorId: adm.doctorId?._id,
        diagnosis: adm.initialDiagnosis || adm.reasonForAdmission || "Clinical Care",
        admissionDate: adm.admissionDate,
        admissionType: adm.admissionType || "ELECTIVE",
        insurance: adm.insurance?.provider || "Self Pay"
      };
    });
  }

  // 2. Aggregate Nursing KPIs & Stats
  async getNursingStats() {
    const [
      totalInpatients,
      pendingMedications,
      pendingTasks,
      activeCarePlans,
      activeShifts,
      recentHandovers
    ] = await Promise.all([
      Admission.countDocuments({ status: { $in: ["ADMITTED", "ACTIVE"] } }),
      NursingMedication.countDocuments({ status: "PENDING" }),
      NursingTask.countDocuments({ status: { $in: ["PENDING", "IN_PROGRESS"] } }),
      NursingCarePlan.countDocuments({ status: "ACTIVE" }),
      Shift.countDocuments({ status: { $in: ["SCHEDULED", "ONGOING"] } }),
      NursingHandover.countDocuments()
    ]);

    return {
      totalInpatients,
      pendingMedications,
      pendingTasks,
      activeCarePlans,
      activeShifts,
      recentHandovers
    };
  }

  // 3. Care Plans
  async getCarePlans(patientId?: string) {
    const filter: any = {};
    if (patientId) filter.patient = patientId;
    return NursingCarePlan.find(filter)
      .populate("patient", "name uhid age gender")
      .populate("nurse", "name email")
      .sort({ createdAt: -1 });
  }

  async createCarePlan(data: any) {
    return NursingCarePlan.create(data);
  }

  async updateCarePlan(id: string, data: any) {
    return NursingCarePlan.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteCarePlan(id: string) {
    return NursingCarePlan.findByIdAndDelete(id);
  }

  // 4. Nursing Tasks
  async getTasks(patientId?: string) {
    const filter: any = {};
    if (patientId) filter.patient = patientId;
    return NursingTask.find(filter)
      .populate("patient", "name uhid")
      .populate("ward", "wardName wardCode")
      .populate("assignedNurse", "name")
      .populate("completedBy", "name")
      .sort({ dueDate: 1, createdAt: -1 });
  }

  async createTask(data: any) {
    return NursingTask.create(data);
  }

  async updateTask(id: string, data: any) {
    return NursingTask.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteTask(id: string) {
    return NursingTask.findByIdAndDelete(id);
  }

  // 5. Fluid Intake & Output
  async getIntakeOutputs(patientId?: string) {
    const filter: any = {};
    if (patientId) filter.patient = patientId;
    return NursingIntakeOutput.find(filter)
      .populate("patient", "name uhid")
      .populate("recordedBy", "name")
      .sort({ recordDate: -1, createdAt: -1 });
  }

  async createIntakeOutput(data: any) {
    return NursingIntakeOutput.create(data);
  }

  async deleteIntakeOutput(id: string) {
    return NursingIntakeOutput.findByIdAndDelete(id);
  }

  // 6. Medication Administration Record (eMAR)
  async getMedications(patientId?: string) {
    const filter: any = {};
    if (patientId) filter.patient = patientId;
    return NursingMedication.find(filter)
      .populate("patient", "name uhid")
      .populate("administeredBy", "name")
      .sort({ scheduledTime: 1, createdAt: -1 });
  }

  async createMedication(data: any) {
    return NursingMedication.create(data);
  }

  async updateMedication(id: string, data: any) {
    return NursingMedication.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteMedication(id: string) {
    return NursingMedication.findByIdAndDelete(id);
  }

  // 7. Shift Handover (SBAR)
  async getHandovers(wardId?: string) {
    const filter: any = {};
    if (wardId) filter.ward = wardId;
    return NursingHandover.find(filter)
      .populate("ward", "wardName wardCode floor")
      .populate("outgoingNurse", "name email")
      .populate("incomingNurse", "name email")
      .populate("patientHandovers.patient", "name uhid")
      .sort({ handoverDate: -1, createdAt: -1 });
  }

  async createHandover(data: any) {
    return NursingHandover.create(data);
  }

  async updateHandover(id: string, data: any) {
    return NursingHandover.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteHandover(id: string) {
    return NursingHandover.findByIdAndDelete(id);
  }

  // 8. Shift Duty Roster
  async getShifts(wardId?: string) {
    const filter: any = {};
    if (wardId) filter.ward = wardId;
    return Shift.find(filter)
      .populate("user", "name email contact")
      .populate("ward", "wardName wardCode floor")
      .sort({ startTime: -1 });
  }

  async createShift(data: any) {
    return Shift.create(data);
  }

  async updateShift(id: string, data: any) {
    return Shift.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteShift(id: string) {
    return Shift.findByIdAndDelete(id);
  }
}

export default new NursingService();
