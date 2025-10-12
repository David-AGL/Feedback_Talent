import React, { createContext, useContext, useState, useEffect } from 'react';

// ==========================================
// INTERFACES
// ==========================================

/**
 * Define la estructura del contexto de autenticación
 * Proporciona información y métodos relacionados con la sesión del usuario
 */
interface AuthContextType {
  isAuthenticated: boolean;     // Indica si el usuario está autenticado
  login: (token: string) => void; // Función para iniciar sesión con un token
  logout: () => void;            // Función para cerrar sesión
  role: string | null;           // Rol del usuario (employee, candidate, company)
  token: string | null;          // Token JWT del usuario
}

// ==========================================
// CREACIÓN DEL CONTEXTO
// ==========================================

/**
 * Crea el contexto de autenticación con valor inicial undefined
 * Se usa undefined para detectar si el contexto se usa fuera del Provider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// PROVIDER DEL CONTEXTO
// ==========================================

/**
 * Componente proveedor que envuelve la aplicación
 * Proporciona el estado de autenticación a todos los componentes hijos
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ← AGREGAR estado de loading

  // ==========================================
  // EFECTO: RESTAURAR SESIÓN AL MONTAR
  // ==========================================
  
  /**
   * Se ejecuta UNA SOLA VEZ al montar el componente
   * Verifica si hay un token guardado en localStorage
   * Si existe, lo valida y restaura la sesión
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      try {
        // Intenta decodificar el token
        const decoded = JSON.parse(atob(storedToken.split('.')[1]));
        
        // Verifica si el token ha expirado
        const currentTime = Date.now() / 1000; // Tiempo actual en segundos
        if (decoded.exp && decoded.exp < currentTime) {
          // Token expirado, limpia localStorage
          console.log('Token expirado, limpiando sesión');
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        
        // Token válido, restaura la sesión
        setIsAuthenticated(true);
        setRole(decoded.role);
        setToken(storedToken);
        console.log('Sesión restaurada:', decoded.role);
      } catch (error) {
        // Token inválido, limpia localStorage
        console.error('Token inválido, limpiando:', error);
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false); // Termina la carga inicial
  }, []); // Array vacío = solo se ejecuta al montar

  // ==========================================
  // FUNCIÓN: INICIAR SESIÓN
  // ==========================================
  
  /**
   * Guarda el token y actualiza el estado de autenticación
   * @param newToken - Token JWT recibido del backend
   */
  const login = (newToken: string) => {
    localStorage.setItem('token', newToken); // Persiste en localStorage
    
    try {
      const decoded = JSON.parse(atob(newToken.split('.')[1]));
      setIsAuthenticated(true);
      setRole(decoded.role);
      setToken(newToken);
      console.log('Login exitoso:', decoded.role);
    } catch (error) {
      console.error('Error decodificando token:', error);
      setIsAuthenticated(false);
      setRole(null);
      setToken(null);
    }
  };

  // ==========================================
  // FUNCIÓN: CERRAR SESIÓN
  // ==========================================
  
  /**
   * Limpia el token y resetea el estado de autenticación
   */
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setRole(null);
    setToken(null);
    console.log('Sesión cerrada');
  };

  // ==========================================
  // RENDERIZADO CONDICIONAL
  // ==========================================
  
  /**
   * Mientras carga, no renderiza nada (evita parpadeo)
   * Esto previene que se muestre el login brevemente mientras se verifica el token
   */
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        {/* Puedes agregar un spinner aquí si quieres */}
        <div>Cargando...</div>
      </div>
    );
  }

  // ==========================================
  // PROVIDER
  // ==========================================
  
  /**
   * Proporciona el contexto a todos los componentes hijos
   */
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, role, token }}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// HOOK PERSONALIZADO
// ==========================================

/**
 * Hook para acceder al contexto de autenticación
 * Lanza error si se usa fuera del AuthProvider
 * 
 * @returns Objeto con estado y funciones de autenticación
 * 
 * Ejemplo de uso:
 * const { isAuthenticated, role, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};