// Plan limits - configurable, not hardcoded in business logic
// Future: Load from database or Stripe metadata

export interface PlanLimits {
  maxPermits: number;
  maxLicenses: number;
  maxProjects: number;
  maxDocuments: number;
  maxStorageMB: number;
  maxTeamMembers: number;
  smsReminders: boolean;
  aiExtraction: boolean;
  csvImport: boolean;
  csvExport: boolean;
  apiAccess: boolean;
}

export const PLANS: Record<string, PlanLimits> = {
  free: {
    maxPermits: 10,
    maxLicenses: 5,
    maxProjects: 5,
    maxDocuments: 25,
    maxStorageMB: 100,
    maxTeamMembers: 1,
    smsReminders: false,
    aiExtraction: false,
    csvImport: true,
    csvExport: true,
    apiAccess: false,
  },
  starter: {
    maxPermits: 50,
    maxLicenses: 20,
    maxProjects: 25,
    maxDocuments: 200,
    maxStorageMB: 1000,
    maxTeamMembers: 3,
    smsReminders: false,
    aiExtraction: false,
    csvImport: true,
    csvExport: true,
    apiAccess: false,
  },
  professional: {
    maxPermits: 200,
    maxLicenses: 50,
    maxProjects: 100,
    maxDocuments: 1000,
    maxStorageMB: 5000,
    maxTeamMembers: 10,
    smsReminders: true,
    aiExtraction: true,
    csvImport: true,
    csvExport: true,
    apiAccess: false,
  },
  business: {
    maxPermits: -1, // unlimited
    maxLicenses: -1,
    maxProjects: -1,
    maxDocuments: -1,
    maxStorageMB: 25000,
    maxTeamMembers: -1,
    smsReminders: true,
    aiExtraction: true,
    csvImport: true,
    csvExport: true,
    apiAccess: true,
  },
};

export function getPlanLimits(plan: string = "free"): PlanLimits {
  return PLANS[plan] || PLANS.free;
}

export function checkLimit(current: number, max: number): boolean {
  if (max === -1) return true; // unlimited
  return current < max;
}
