import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ContractsListPage } from '../pages/contracts/ContractsListPage';
import { CreateContractPage } from '../pages/contracts/CreateContractPage';
import { ContractDetailsPage } from '../pages/contracts/ContractDetailsPage';
import { CustomersListPage } from '../pages/customers/CustomersListPage';
import { TemplateBuilderPage } from '../pages/templates/TemplateBuilderPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { UsersManagementPage } from '../pages/users/UsersManagementPage';
import { AuditLogsPage } from '../pages/audit/AuditLogsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Contracts */}
          <Route path="/contracts" element={<ContractsListPage />} />
          <Route path="/contracts/create" element={<CreateContractPage />} />
          <Route path="/contracts/:id/edit" element={<CreateContractPage mode="edit" />} />
          <Route path="/contracts/:id" element={<ContractDetailsPage />} />

          {/* Customers */}
          <Route path="/customers" element={<CustomersListPage />} />

          {/* Contract Template Builder (Admin Only) */}
          <Route element={<ProtectedRoute requiredRole={['ADMIN']} />}>
            <Route path="/templates" element={<TemplateBuilderPage />} />
            <Route path="/users" element={<UsersManagementPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Reports (Admin & Employee) */}
          <Route element={<ProtectedRoute requiredRole={['ADMIN', 'EMPLOYEE']} />}>
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
