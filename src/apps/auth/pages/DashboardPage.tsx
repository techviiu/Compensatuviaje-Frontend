import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * DashboardPage - Página hub que redirige según el tipo de usuario
 * Usa Navigate directamente para evitar loops infinitos con useEffect
 */
const DashboardPage = () => {
  const { user, isLoading } = useAuth();

  // Mostrar loading mientras carga
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

  // Sin usuario, ir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según tipo de usuario
  switch (user.userType) {
    case 'b2b':
      return <Navigate to="/b2b/dashboard" replace />;
    case 'b2c':
      return <Navigate to="/b2c/dashboard" replace />;
    case 'superadmin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardPage;
