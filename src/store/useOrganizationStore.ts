import { create } from 'zustand';

export interface IOrganization {
  _id: string;
  organizationName: string;
  organizationId: string;
  organizationType: 'HOSPITAL' | 'CLINIC' | 'PHARMACY';
  branchType: 'MAIN' | 'BRANCH';
  headQuarter?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  organizationName: string;
  organizationType: string;
  branchType: string;
  headQuarter?: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
}

interface OrganizationState {
  organizations: IOrganization[];
  isLoading: boolean;
  error: string | null;
  
  fetchOrganizations: () => Promise<void>;
  createOrganization: (data: Omit<CreateOrganizationDto, 'branchType'>) => Promise<{ success: boolean; message: string }>;
  createBranch: (data: Omit<CreateOrganizationDto, 'branchType'> & { headQuarter: string }) => Promise<{ success: boolean; message: string }>;
  updateOrganization: (id: string, data: Partial<IOrganization>) => Promise<{ success: boolean; message: string }>;
  deleteOrganization: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organizations: [],
  isLoading: false,
  error: null,

  fetchOrganizations: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/org');
      const json = await res.json();
      if (json.success) {
        set({ organizations: json.data, isLoading: false });
      } else {
        set({ error: json.message || 'Failed to fetch organizations', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'An unexpected error occurred', isLoading: false });
    }
  },

  createOrganization: async (data) => {
    const payload = { ...data, branchType: 'MAIN' };
    try {
      const res = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        await get().fetchOrganizations(); // Refresh the list
        return { success: true, message: json.message || 'Organization created successfully' };
      }
      return { success: false, message: json.message || 'Failed to create organization' };
    } catch (error: any) {
      return { success: false, message: error.message || 'An unexpected error occurred' };
    }
  },

  createBranch: async (data) => {
    const payload = { ...data, branchType: 'BRANCH' };
    try {
      const res = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        await get().fetchOrganizations(); // Refresh the list
        return { success: true, message: json.message || 'Branch created successfully' };
      }
      return { success: false, message: json.message || 'Failed to create branch' };
    } catch (error: any) {
      return { success: false, message: error.message || 'An unexpected error occurred' };
    }
  },

  updateOrganization: async (id, data) => {
    try {
      const res = await fetch(`/api/org/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        await get().fetchOrganizations(); // Refresh the list
        return { success: true, message: json.message || 'Organization updated successfully' };
      }
      return { success: false, message: json.message || 'Failed to update organization' };
    } catch (error: any) {
      return { success: false, message: error.message || 'An unexpected error occurred' };
    }
  },

  deleteOrganization: async (id) => {
    try {
      const res = await fetch(`/api/org/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        await get().fetchOrganizations(); // Refresh the list
        return { success: true, message: json.message || 'Organization deleted successfully' };
      }
      return { success: false, message: json.message || 'Failed to delete organization' };
    } catch (error: any) {
      return { success: false, message: error.message || 'An unexpected error occurred' };
    }
  },
}));
