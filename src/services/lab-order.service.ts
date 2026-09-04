import LabOrder, { ILabOrder } from "../models/lab-order.model";
import LabTest from "../models/lab-test.model";
import Patient from "../models/patient.model";
import Doctor from "../models/doctor.model";

export const createLabOrder = async (data: any) => {
  // 1. Auto generate barcode if not provided
  if (!data.barcode) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    data.barcode = `LB-${randomSuffix}`;
  }

  // 2. Pre-populate results array if tests are provided and results not specified
  if (data.tests && (!data.results || data.results.length === 0)) {
    const testDocs = await LabTest.find({ _id: { $in: data.tests } });
    data.results = testDocs.map((t) => ({
      test: t._id,
      value: "",
      unit: (t as any).unit || "",
      normalRange: t.normalRange || "",
      isAbnormal: false,
      flag: "Normal",
      remarks: "",
      status: "Pending"
    }));
  }

  const labOrder = new LabOrder(data);
  const saved = await labOrder.save();
  return await LabOrder.findById(saved._id).populate("patient tests doctor results.test");
};

export const getAllLabOrders = async (query: any = {}) => {
  const filter: any = {};

  if (query.status && query.status !== "ALL") {
    filter.status = query.status;
  }
  if (query.priority && query.priority !== "ALL") {
    filter.priority = query.priority;
  }
  if (query.patient) {
    filter.patient = query.patient;
  }
  if (query.barcode) {
    filter.barcode = { $regex: query.barcode, $options: "i" };
  }

  return await LabOrder.find(filter)
    .populate("patient", "name uhid age gender contact bloodGroup")
    .populate("doctor", "name specialty email")
    .populate("tests", "name code category price normalRange turnaroundTime")
    .populate("results.test", "name code category normalRange")
    .sort({ orderDate: -1, createdAt: -1 });
};

export const getLabOrderById = async (id: string) => {
  return await LabOrder.findById(id)
    .populate("patient", "name uhid age gender contact bloodGroup allergies")
    .populate("doctor", "name specialty email")
    .populate("tests", "name code category price normalRange turnaroundTime")
    .populate("results.test", "name code category normalRange");
};

export const updateLabOrder = async (id: string, data: Partial<ILabOrder>) => {
  return await LabOrder.findByIdAndUpdate(id, data, { new: true })
    .populate("patient", "name uhid age gender contact bloodGroup allergies")
    .populate("doctor", "name specialty email")
    .populate("tests", "name code category price normalRange turnaroundTime")
    .populate("results.test", "name code category normalRange");
};

export const deleteLabOrder = async (id: string) => {
  return await LabOrder.findByIdAndDelete(id);
};

export const getLabStats = async () => {
  const [
    totalOrders,
    pendingOrders,
    samplesCollected,
    processing,
    completed,
    statOrders,
    totalCatalogTests
  ] = await Promise.all([
    LabOrder.countDocuments(),
    LabOrder.countDocuments({ status: "Pending" }),
    LabOrder.countDocuments({ status: "Sample Collected" }),
    LabOrder.countDocuments({ status: "Processing" }),
    LabOrder.countDocuments({ status: "Completed" }),
    LabOrder.countDocuments({ priority: { $in: ["STAT", "Urgent"] }, status: { $ne: "Completed" } }),
    LabTest.countDocuments({ isActive: { $ne: false } })
  ]);

  return {
    totalOrders,
    pendingOrders,
    samplesCollected,
    processing,
    completed,
    statOrders,
    totalCatalogTests
  };
};
