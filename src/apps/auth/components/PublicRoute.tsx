import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRedirectPath } from '../services/authService';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute - Componente para rutas públicas (login, register, etc.)
 * Si el usuario está autenticado, lo redirige a su dashboard correspondiente.
 * Usa Navigate directamente sin useEffect para evitar loops.
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado, redirigir inmediatamente con Navigate
  if (isAuthenticated && user) {
    const redirectPath = getRedirectPath(user.userType);
    return <Navigate to={redirectPath} replace />;
  }

  // Si no está autenticado, mostrar children (login, register, etc.)
  return <>{children}</>;
};

export default PublicRoute;
