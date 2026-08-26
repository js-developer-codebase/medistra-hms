import { InsuranceProvider } from '@/models/insurance-provider.model';
import { InsuranceClaim } from '@/models/insurance-claim.model';
import { InsurancePolicy } from '@/models/insurance-policy.model';

export const getInsuranceProviders = async (organizationId: string) => {
  return await InsuranceProvider.find({ organizationId }).sort({ createdAt: -1 });
};

export const createInsuranceProvider = async (data: any) => {
  return await InsuranceProvider.create(data);
};

export const getInsuranceClaims = async (organizationId: string) => {
  return await InsuranceClaim.find({ organizationId }).sort({ createdAt: -1 }).populate('providerId patientId');
};

export const createInsuranceClaim = async (data: any) => {
  return await InsuranceClaim.create(data);
};

export const getInsurancePolicies = async (organizationId: string) => {
  return await InsurancePolicy.find({ organizationId }).sort({ createdAt: -1 }).populate('providerId patientId');
};

export const createInsurancePolicy = async (data: any) => {
  return await InsurancePolicy.create(data);
};
