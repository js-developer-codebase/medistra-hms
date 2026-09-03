import RadiologyOrder from "@/models/radiology-order.model";
import ImagingStudy from "@/models/imaging-study.model";
import RadiologyProcedure from "@/models/radiology-procedure.model";
import Patient from "@/models/patient.model";
import Doctor from "@/models/doctor.model";

export class RadiologyService {
  // --- ORDERS ---
  async getOrders(query: any = {}) {
    const filter: any = {};
    if (query.status && query.status !== "ALL") filter.status = query.status;
    if (query.priority && query.priority !== "ALL") filter.priority = query.priority;
    if (query.modality && query.modality !== "ALL") filter.modality = query.modality;
    if (query.patient) filter.patient = query.patient;
    if (query.accessionNumber) filter.accessionNumber = { $regex: query.accessionNumber, $options: "i" };

    return RadiologyOrder.find(filter)
      .populate("patient", "name uhid age gender contact bloodGroup")
      .populate("doctor", "name specialty")
      .populate("procedure")
      .sort({ createdAt: -1 });
  }

  async createOrder(data: any) {
    if (!data.accessionNumber) {
      const suffix = Math.floor(100000 + Math.random() * 900000);
      data.accessionNumber = `RAD-${suffix}`;
    }

    if (data.procedure && !data.price) {
      const proc = await RadiologyProcedure.findById(data.procedure);
      if (proc) {
        data.price = proc.price;
        if (!data.modality) data.modality = proc.modality;
        if (!data.bodyPart) data.bodyPart = proc.bodyPart;
      }
    }

    const order = await RadiologyOrder.create(data);

    const scanUrls =
      data.modality === "CT"
        ? ["https://haigvvbwrmjyynnsxpsf.storage.supabase.co/storage/v1/object/public/hms/radiology/scans/1788428085696_brain_ct.jpg"]
        : data.modality === "MRI"
        ? ["https://haigvvbwrmjyynnsxpsf.storage.supabase.co/storage/v1/object/public/hms/radiology/scans/1788428086452_mri_spine.jpg"]
        : ["https://haigvvbwrmjyynnsxpsf.storage.supabase.co/storage/v1/object/public/hms/radiology/scans/1788428084462_chest_xray.jpg"];

    // Auto-create initial ImagingStudy linked to this order for worklist accessioning
    await ImagingStudy.create({
      order: order._id,
      patient: order.patient,
      accessionNumber: order.accessionNumber,
      modality: order.modality || "X-RAY",
      bodyPart: order.bodyPart || "Chest",
      status: "SCHEDULED",
      imageUrls: scanUrls
    });

    return RadiologyOrder.findById(order._id)
      .populate("patient", "name uhid age gender contact bloodGroup")
      .populate("doctor", "name specialty")
      .populate("procedure");
  }

  async getOrderById(id: string) {
    return RadiologyOrder.findById(id)
      .populate("patient", "name uhid age gender contact bloodGroup allergies")
      .populate("doctor", "name specialty email")
      .populate("procedure");
  }

  async updateOrder(id: string, data: any) {
    return RadiologyOrder.findByIdAndUpdate(id, data, { new: true })
      .populate("patient", "name uhid age gender contact bloodGroup")
      .populate("doctor", "name specialty")
      .populate("procedure");
  }

  async deleteOrder(id: string) {
    const order = await RadiologyOrder.findByIdAndDelete(id);
    if (order) {
      await ImagingStudy.deleteMany({ order: id });
    }
    return order;
  }

  // --- PROCEDURES / CATALOG ---
  async getProcedures(query: any = {}) {
    const filter: any = {};
    if (query.modality && query.modality !== "ALL") filter.modality = query.modality;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { code: { $regex: query.search, $options: "i" } },
        { bodyPart: { $regex: query.search, $options: "i" } }
      ];
    }
    return RadiologyProcedure.find(filter).sort({ modality: 1, name: 1 });
  }

  async createProcedure(data: any) {
    return RadiologyProcedure.create(data);
  }

  async getProcedureById(id: string) {
    return RadiologyProcedure.findById(id);
  }

  async updateProcedure(id: string, data: any) {
    return RadiologyProcedure.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteProcedure(id: string) {
    return RadiologyProcedure.findByIdAndDelete(id);
  }

  // --- STUDIES & PACS ---
  async getStudies(query: any = {}) {
    const filter: any = {};
    if (query.status && query.status !== "ALL") filter.status = query.status;
    if (query.modality && query.modality !== "ALL") filter.modality = query.modality;
    if (query.order) filter.order = query.order;
    if (query.accessionNumber) filter.accessionNumber = { $regex: query.accessionNumber, $options: "i" };

    return ImagingStudy.find(filter)
      .populate("order")
      .populate("patient", "name uhid age gender bloodGroup contact")
      .sort({ createdAt: -1 });
  }

  async getStudyById(id: string) {
    return ImagingStudy.findById(id)
      .populate("order")
      .populate("patient", "name uhid age gender bloodGroup contact allergies");
  }

  async updateStudy(id: string, data: any) {
    return ImagingStudy.findByIdAndUpdate(id, data, { new: true })
      .populate("order")
      .populate("patient", "name uhid age gender bloodGroup contact");
  }

  async deleteStudy(id: string) {
    return ImagingStudy.findByIdAndDelete(id);
  }

  // --- STATS ---
  async getRadiologyStats() {
    const [
      totalOrders,
      pendingOrders,
      inProgressStudies,
      awaitingReporting,
      finalizedReports,
      statCount,
      totalProcedures,
      xrayCount,
      ctCount,
      mriCount,
      usgCount
    ] = await Promise.all([
      RadiologyOrder.countDocuments(),
      RadiologyOrder.countDocuments({ status: "PENDING" }),
      ImagingStudy.countDocuments({ status: { $in: ["SCHEDULED", "IN_PROGRESS"] } }),
      ImagingStudy.countDocuments({ status: "IMAGES_UPLOADED" }),
      ImagingStudy.countDocuments({ status: "FINALIZED" }),
      RadiologyOrder.countDocuments({ priority: { $in: ["STAT", "URGENT"] }, status: { $ne: "COMPLETED" } }),
      RadiologyProcedure.countDocuments({ isActive: { $ne: false } }),
      RadiologyOrder.countDocuments({ modality: "X-RAY" }),
      RadiologyOrder.countDocuments({ modality: "CT" }),
      RadiologyOrder.countDocuments({ modality: "MRI" }),
      RadiologyOrder.countDocuments({ modality: "ULTRASOUND" })
    ]);

    return {
      totalOrders,
      pendingOrders,
      inProgressStudies,
      awaitingReporting,
      finalizedReports,
      statCount,
      totalProcedures,
      modalities: {
        xray: xrayCount,
        ct: ctCount,
        mri: mriCount,
        usg: usgCount
      }
    };
  }
}

const radiologyService = new RadiologyService();
export default radiologyService;
