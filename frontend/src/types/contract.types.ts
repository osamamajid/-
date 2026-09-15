import { Customer } from './customer.types';

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface ContractField {
  id: string;
  templateId: string;
  fieldKey: string;
  label: string;
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'TEXTAREA' | 'CHECKBOX';
  isRequired: boolean;
  options?: string[];
  section: 'parties' | 'details' | 'financial' | 'terms';
  orderIndex: number;
  placeholder?: string | null;
  currentValue?: string | null;
}

export interface ContractType {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  templateId?: string;
  termsAndConditions?: string;
  fieldsCount?: number;
  fields?: ContractField[];
  contractsCount?: number;
}

export interface Contract {
  id: string;
  contractNumber: string;
  contractTypeId: string;
  contractType?: ContractType;
  customerId: string;
  customer?: Customer;
  createdById: string;
  createdBy?: {
    id: string;
    fullName: string;
    username: string;
  };
  issueDate: string;
  startDate: string;
  endDate?: string | null;
  status: ContractStatus;
  totalAmount: number;
  paymentMethod: string;
  notes?: string | null;
  isArchived: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  fields?: ContractField[];
  valuesMap?: Record<string, string | null>;
  termsAndConditions?: string;
}

export interface ExpiringAlerts {
  count7: number;
  count15: number;
  count30: number;
  list7: Contract[];
  list15: Contract[];
  list30: Contract[];
}
