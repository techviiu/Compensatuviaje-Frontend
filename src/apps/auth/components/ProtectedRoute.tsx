// ============================================
// Protected Route - TypeScript con soporte multi-usuario
// ============================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Permission, UserType } from '../../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredUserTypes?: UserType[];
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  fallbackPath?: string;
}

// Helper para obtener ruta por tipo de usuario
const getRedirectByUserType = (userType: UserType): string => {
  switch (userType) {
    case 'superadmin':
      return '/admin';
    case 'partner':
      return '/partner/dashboard';
    case 'b2c':
      return '/calculator';
    case 'b2b':
    default:
      return '/b2b/dashboard';
  }
};

/**
 * ProtectedRoute - Protege rutas que requieren autenticación
 * Usa Navigate directamente (sin useEffect) para evitar loops infinitos.
 * El componente es puramente declarativo - las decisiones se toman en el render.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredUserTypes = [],
  requireAdmin = false,
  requireSuperAdmin = false,
  fallbackPath = '/login',
}) => {
  const { user, isAuthenticated, isLoading, hasAnyPermission } = useAuth();
  const location = useLocation();

  // Loading state - mostrar spinner mientras verifica sesión
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // SuperAdmin required check
  if (requireSuperAdmin && !user.isSuperAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Admin required check
  if (requireAdmin && !user.isAdmin && !user.isSuperAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  // User type check
  if (requiredUserTypes.length > 0 && !requiredUserTypes.includes(user.userType)) {
    const redirectPath = getRedirectByUserType(user.userType);
    return <Navigate to={redirectPath} replace />;
  }

  // Permissions check
  if (requiredPermissions.length > 0 && !user.isSuperAdmin && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // All checks passed - render children
  return <>{children}</>;
};

export default ProtectedRoute;

// ============================================
// Componentes específicos por tipo de usuario
// ============================================

// Ruta solo para SuperAdmin
export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireSuperAdmin fallbackPath="/login">
    {children}
  </ProtectedRoute>
);

// Ruta solo para B2B
export const B2BRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredUserTypes={['b2b', 'superadmin']} fallbackPath="/login">
    {children}
  </ProtectedRoute>
);

// Ruta solo para B2C
export const B2CRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredUserTypes={['b2c', 'superadmin']} fallbackPath="/login">
    {children}
  </ProtectedRoute>
);

// Ruta solo para Partner
export const PartnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredUserTypes={['partner', 'superadmin']} fallbackPath="/login">
    {children}
  </ProtectedRoute>
);

// Ruta solo para Admin de empresa
export const CompanyAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAdmin fallbackPath="/b2b/dashboard">
    {children}
  </ProtectedRoute>
);
