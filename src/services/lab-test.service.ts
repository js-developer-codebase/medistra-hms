import LabTest, { ILabTest } from "../models/lab-test.model";

export const createLabTest = async (data: Partial<ILabTest>) => {
  const labTest = new LabTest(data);
  return await labTest.save();
};

export const getAllLabTests = async () => {
  return await LabTest.find().sort({ createdAt: -1 });
};

export const getLabTestById = async (id: string) => {
  return await LabTest.findById(id);
};

export const updateLabTest = async (id: string, data: Partial<ILabTest>) => {
  return await LabTest.findByIdAndUpdate(id, data, { new: true });
};

export const deleteLabTest = async (id: string) => {
  return await LabTest.findByIdAndDelete(id);
};
