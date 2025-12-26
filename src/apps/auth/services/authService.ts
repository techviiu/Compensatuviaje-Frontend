// ============================================
// Auth Service - TypeScript
// ============================================

import apiClient from '../../../shared/services/apiClient';
import type {
  LoginRequest,
  LoginResponse,
  RegisterCompanyRequest,
  RegisterCompanyResponse,
  RefreshTokenResponse,
  UserInfo,
  UserType,
} from '../../../types';

// Determinar tipo de usuario basado en la respuesta del backend
const determineUserType = (userInfo: UserInfo): UserType => {
  // SuperAdmin
  if (userInfo.is_super_admin || userInfo.role === 'SUPERADMIN') {
    return 'superadmin';
  }
  
  // Partner (proyectos ESG)
  if (userInfo.role === 'PARTNER_ADMIN' || userInfo.role === 'PARTNER_VIEWER') {
    return 'partner';
  }
  
  // B2C (usuario individual)
  if (userInfo.role === 'B2C_USER' || !userInfo.company_id) {
    return 'b2c';
  }
  
  // B2B (empresa)
  return 'b2b';
};

// Obtener ruta de redirección según tipo de usuario
export const getRedirectPath = (userType: UserType, companyStatus?: string): string => {
  switch (userType) {
    case 'superadmin':
      return '/admin';
    
    case 'partner':
      return '/partner/dashboard';
    
    case 'b2c':
      return '/calculator';
    
    case 'b2b':
      // Verificar estado de empresa para B2B
      if (companyStatus && companyStatus !== 'active') {
        return '/onboarding/status';
      }
      return '/dashboard';
    
    default:
      return '/dashboard';
  }
};

class AuthService {
  // Login de usuario
  async login(email: string, password: string, rememberMe = false): Promise<LoginResponse> {
    const payload: LoginRequest = {
      email,
      password,
      remember_me: rememberMe,
    };

    // Usar ruta pública para login
    const response = await apiClient.post<LoginResponse>(
      '/public/auth/login',
      payload,
      { skipAuth: true }
    );

    if (response.success && response.user_info) {
      // Agregar user_type basado en el rol
      response.user_info.user_type = determineUserType(response.user_info);
      
      // Guardar tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Guardar user_info para evitar llamadas adicionales
      localStorage.setItem('user_info', JSON.stringify(response.user_info));
    }

    return response;
  }

  // Registro de empresa (B2B)
  async register(payload: RegisterCompanyRequest): Promise<RegisterCompanyResponse> {
    return apiClient.post<RegisterCompanyResponse>(
      '/public/companies/register',
      payload,
      { skipAuth: true }
    );
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      
      if (token) {
        // Llamar al endpoint de logout del backend
        await apiClient.post('/b2b/profile/logout', null);
      }
    } catch (error) {
      console.error('Error al hacer logout en el backend:', error);
    } finally {
      // Siempre limpiar tokens locales
      this.clearTokens();
    }
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<{ success: boolean; user_info: UserInfo } | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      // Primero intentar recuperar de localStorage
      const storedUserInfo = localStorage.getItem('user_info');
      if (storedUserInfo) {
        try {
          const userInfo = JSON.parse(storedUserInfo) as UserInfo;
          // Asegurar que tenga user_type
          if (!userInfo.user_type) {
            userInfo.user_type = determineUserType(userInfo);
          }
          return { success: true, user_info: userInfo };
        } catch (e) {
          // Si hay error parseando, continuar con la llamada API
          localStorage.removeItem('user_info');
        }
      }

      // Si es SuperAdmin o no hay info guardada, no hacer llamada a /b2b/profile/me
      // porque ese endpoint requiere contexto de empresa
      // En su lugar, retornar null y forzar re-login
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // Refresh token
  async refreshToken(): Promise<RefreshTokenResponse | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await apiClient.post<RefreshTokenResponse>(
        '/public/auth/refresh',
        { refreshToken },
        { skipAuth: true }
      );

      if (response.success) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        
        // Agregar user_type
        response.user_info.user_type = determineUserType(response.user_info);
      }

      return response;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      return null;
    }
  }

  // Recuperar contraseña
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      '/public/auth/forgot-password',
      { email },
      { skipAuth: true }
    );
  }

  // Resetear contraseña
  async resetPassword(
    token: string, 
    password: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      '/public/auth/reset-password',
      { token, password },
      { skipAuth: true }
    );
  }

  // Cambiar contraseña (usuario autenticado)
  async changePassword(
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.put<{ success: boolean; message: string }>(
      '/b2b/profile/password',
      { currentPassword, newPassword }
    );
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Limpiar tokens
  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_info');
  }
}

// Export singleton
const authService = new AuthService();
export default authService;
