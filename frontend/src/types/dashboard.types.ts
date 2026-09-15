import { Contract } from './contract.types';

export interface DashboardStats {
  kpis: {
    totalContracts: number;
    todayContracts: number;
    monthContracts: number;
    activeContracts: number;
    expiredContracts: number;
    draftContracts: number;
    totalCustomers: number;
    activeTotalRevenue: number;
    expiringSoon: {
      within7Days: number;
      within15Days: number;
      within30Days: number;
    };
  };
  contractsByType: {
    id: string;
    name: string;
    code: string;
    icon?: string;
    count: number;
  }[];
  recentContracts: Contract[];
}

export interface MonthlyTrend {
  month: string;
  count: number;
  revenue: number;
}
