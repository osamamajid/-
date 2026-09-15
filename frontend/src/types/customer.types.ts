export interface Customer {
  id: string;
  customerNumber: string;
  fullName: string;
  phone: string;
  nationalId?: string | null;
  address?: string | null;
  governorate?: string | null;
  notes?: string | null;
  contractsCount?: number;
  contracts?: any[];
  createdAt?: string;
  updatedAt?: string;
}
