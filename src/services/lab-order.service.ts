import LabOrder, { ILabOrder } from "../models/lab-order.model";

export const createLabOrder = async (data: Partial<ILabOrder>) => {
  const labOrder = new LabOrder(data);
  return await labOrder.save();
};

export const getAllLabOrders = async () => {
  return await LabOrder.find().populate("patient tests doctor").sort({ createdAt: -1 });
};

export const getLabOrderById = async (id: string) => {
  return await LabOrder.findById(id).populate("patient tests doctor");
};

export const updateLabOrder = async (id: string, data: Partial<ILabOrder>) => {
  return await LabOrder.findByIdAndUpdate(id, data, { new: true }).populate("patient tests doctor");
};

export const deleteLabOrder = async (id: string) => {
  return await LabOrder.findByIdAndDelete(id);
};
