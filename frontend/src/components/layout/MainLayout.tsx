import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { ProductTour, shouldShowTour } from '../tour/ProductTour';
import { DemoBanner } from './DemoBanner';
import { useAuth } from '../../context/AuthContext';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // إذا كان المستخدم مجبراً على تغيير كلمة المرور لأول دخول
  const isForcedPasswordChange = !!user?.mustChangePassword;

  const isDemoUser = user?.role === 'DEMO';

  // Check if tour should be shown on first login
  useEffect(() => {
    if (isDemoUser && shouldShowTour()) {
      setShowTour(true);
    }
  }, [isDemoUser]);

  const handleTourComplete = () => {
    setShowTour(false);
  };

  const handleTourClose = () => {
    setShowTour(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-72 transition-all duration-300">
        <Topbar
          setIsMobileOpen={setIsMobileOpen}
          openChangePasswordModal={() => setIsPasswordModalOpen(true)}
        />

        {/* Demo Banner */}
        {isDemoUser && <DemoBanner />}

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Change Password Modal (Mandatory or Voluntary) */}
      {(isPasswordModalOpen || isForcedPasswordChange) && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen || isForcedPasswordChange}
          onClose={() => setIsPasswordModalOpen(false)}
          isForced={isForcedPasswordChange}
        />
      )}

      {/* Product Tour */}
      <ProductTour
        isOpen={showTour}
        onClose={handleTourClose}
        onComplete={handleTourComplete}
      />
    </div>
  );
};
