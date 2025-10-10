// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'; // Importa React y sus hooks necesarios

// Define la interfaz para el contexto de autenticación, especificando las propiedades y métodos disponibles
interface AuthContextType {
  isAuthenticated: boolean; // Indica si el usuario está autenticado
  login: (token: string) => void; // Función para iniciar sesión con un token
  logout: () => void; // Función para cerrar sesión
  role: string | null; // Rol del usuario (e.g., "candidate", "employee", "company") o null si no está definido
  token: string | null; // Token JWT del usuario o null si no está autenticado
}

// Crea el contexto de autenticación con un valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente proveedor del contexto que envuelve la aplicación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado inicial para indicar si el usuario está autenticado
  const [role, setRole] = useState<string | null>(null); // Estado inicial para el rol del usuario
  const [token, setToken] = useState<string | null>(null); // Estado inicial para el token JWT

  // Efecto que se ejecuta al montar el componente para cargar el token almacenado
  useEffect(() => {
    const storedToken = localStorage.getItem('token'); // Obtiene el token almacenado en localStorage
    if (storedToken) { // Si existe un token almacenado
      try {
        const decoded = JSON.parse(atob(storedToken.split('.')[1])); // Decodifica el payload del token JWT (parte intermedia)
        setIsAuthenticated(true); // Marca al usuario como autenticado
        setRole(decoded.role); // Establece el rol decodificado
        setToken(storedToken); // Guarda el token en el estado
      } catch (error) { // Captura errores al decodificar el token
        console.error('Token inválido, limpiando:', error); // Registra el error
        localStorage.removeItem('token'); // Elimina el token inválido de localStorage
      }
    }
  }, []); // El array vacío asegura que este efecto solo se ejecute al montar

  // Función para iniciar sesión, recibiendo un nuevo token
  const login = (newToken: string) => {
    localStorage.setItem('token', newToken); // Almacena el token en localStorage
    try {
      const decoded = JSON.parse(atob(newToken.split('.')[1])); // Decodifica el payload del nuevo token
      setIsAuthenticated(true); // Marca al usuario como autenticado
      setRole(decoded.role); // Establece el rol decodificado
      setToken(newToken); // Actualiza el token en el estado
    } catch (error) { // Captura errores al decodificar
      console.error('Error decodificando token:', error); // Registra el error
      setIsAuthenticated(false); // Marca como no autenticado en caso de error
      setRole(null); // Limpia el rol
      setToken(null); // Limpia el token
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token'); // Elimina el token de localStorage
    setIsAuthenticated(false); // Marca al usuario como no autenticado
    setRole(null); // Limpia el rol
    setToken(null); // Limpia el token
  };

  // Proporciona el contexto a los componentes hijos
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, role, token }}>
      {children} {/* Renderiza los componentes hijos dentro del proveedor */}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext); // Obtiene el contexto actual
  if (context === undefined) { // Verifica si el contexto está disponible
    throw new Error('useAuth debe usarse dentro de un AuthProvider'); // Lanza un error si no está dentro de AuthProvider
  }
  return context; // Devuelve el contexto si está disponible
};