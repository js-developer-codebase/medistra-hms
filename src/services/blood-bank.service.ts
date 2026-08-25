import { BloodDonor } from '@/models/blood-donor.model';
import { BloodInventory } from '@/models/blood-inventory.model';

export const getBloodDonors = async (organizationId: string) => {
  return await BloodDonor.find({ organizationId }).sort({ createdAt: -1 });
};

export const createBloodDonor = async (data: any) => {
  return await BloodDonor.create(data);
};

export const getBloodInventory = async (organizationId: string) => {
  return await BloodInventory.find({ organizationId }).sort({ createdAt: -1 }).populate('donorId');
};

export const createBloodInventory = async (data: any) => {
  return await BloodInventory.create(data);
};
