import React, { useState, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  CircularProgress,
  Avatar,
  Paper
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

// ==========================================
// INTERFACES
// ==========================================

// Interfaz para los datos de un usuario (empleado o candidato)
interface User {
  _id: string;          // ID único de MongoDB
  name: string;         // Nombre del usuario
  email: string;        // Email del usuario
  role: string;         // Rol: "employee" o "candidate"
  lastReviewDate?: string; // Fecha de última calificación (opcional)
}

// Props que recibe el componente
interface UserSearchBarProps {
  onUserSelect: (user: User | null) => void; // Callback cuando se selecciona un usuario
  selectedUser: User | null;                  // Usuario actualmente seleccionado
  companyId: string;                          // ID de la empresa para filtrar usuarios
  token: string;                              // Token JWT para autenticación
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const UserSearchBar: React.FC<UserSearchBarProps> = ({ 
  onUserSelect, 
  selectedUser,
  companyId,
  token
}) => {
  // ==========================================
  // ESTADOS
  // ==========================================
  
  // Controla si el dropdown está abierto
  const [open, setOpen] = useState(false);
  
  // Lista de opciones (usuarios) obtenidas del backend
  const [options, setOptions] = useState<User[]>([]);
  
  // Indica si está cargando datos del backend
  const [loading, setLoading] = useState(false);
  
  // Valor actual del input de búsqueda
  const [inputValue, setInputValue] = useState('');

  // Traducción de roles al español
  const roleLabels: { [key: string]: string } = {
    employee: "Empleado",
    candidate: "Candidato"
  };

  // ==========================================
  // EFECTO: BÚSQUEDA DE USUARIOS
  // ==========================================
  
  // Este efecto se ejecuta cada vez que cambia el inputValue
  // Implementa un debounce (espera 300ms después de que el usuario deja de escribir)
  useEffect(() => {
    // Si el texto de búsqueda tiene menos de 2 caracteres, limpia las opciones
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }

    // Función asíncrona para obtener usuarios del backend
    const fetchUsers = async () => {
      setLoading(true); // Indica que está cargando
      try {
        // Hace petición GET al backend con el término de búsqueda
        const response = await fetch(
          `http://localhost:4000/api/company/reviewers/${companyId}?search=${encodeURIComponent(inputValue)}`,
          {
            headers: {
              Authorization: `Bearer ${token}` // Incluye token JWT en headers
            }
          }
        );
        
        // Si la respuesta es exitosa, guarda los datos
        if (response.ok) {
          const data = await response.json();
          setOptions(data);
        } else {
          setOptions([]); // Si hay error, limpia las opciones
        }
      } catch (error) {
        console.error('Error buscando usuarios:', error);
        setOptions([]);
      } finally {
        setLoading(false); // Siempre desactiva el loading
      }
    };

    // Debounce: espera 300ms después de que el usuario deja de escribir
    // Esto evita hacer muchas peticiones mientras el usuario está escribiendo
    const debounceTimer = setTimeout(fetchUsers, 300);
    
    // Cleanup: cancela el timer si el inputValue cambia antes de los 300ms
    return () => clearTimeout(debounceTimer);
  }, [inputValue, companyId, token]); // Se ejecuta cuando cambian estos valores

  // ==========================================
  // RENDERIZADO
  // ==========================================

  return (
    <Autocomplete
      fullWidth                    // Ocupa todo el ancho disponible
      open={open}                  // Estado de apertura del dropdown
      onOpen={() => setOpen(true)} // Abre el dropdown
      onClose={() => setOpen(false)} // Cierra el dropdown
      value={selectedUser}         // Usuario seleccionado actualmente
      
      // Callback cuando el usuario selecciona una opción
      onChange={(event, newValue) => {
        onUserSelect(newValue); // Notifica al componente padre
      }}
      
      inputValue={inputValue}      // Valor del input de búsqueda
      
      // Callback cuando cambia el texto del input
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      
      options={options}            // Lista de opciones a mostrar
      loading={loading}            // Indica si está cargando
      
      // Función para obtener la etiqueta de texto de cada opción
      getOptionLabel={(option) => option.name}
      
      // Función para comparar si dos opciones son iguales
      isOptionEqualToValue={(option, value) => option._id === value._id}
      
      // ==========================================
      // RENDERIZADO DEL INPUT
      // ==========================================
      renderInput={(params) => (
        <TextField
          {...params}
          label="Buscar usuario"
          placeholder="Escribe el nombre del usuario..."
          InputProps={{
            ...params.InputProps,
            // Agrega spinner de carga al final del input si está cargando
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      
      // ==========================================
      // RENDERIZADO DE CADA OPCIÓN
      // ==========================================
      renderOption={(props, option) => (
        // Cada opción es un elemento de lista (li)
        <Box 
          component="li" 
          {...props} 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            alignItems: 'center', 
            py: 1.5 
          }}
        >
          {/* Avatar del usuario */}
          <Avatar
            sx={{
              width: 50,
              height: 50,
              bgcolor: '#667eea', // Color de fondo morado
            }}
          >
            <PersonIcon />
          </Avatar>
          
          {/* Información del usuario */}
          <Box sx={{ flex: 1 }}>
            {/* Nombre del usuario */}
            <Typography variant="body1" fontWeight={600}>
              {option.name}
            </Typography>
            
            {/* Rol del usuario traducido al español */}
            <Typography variant="caption" color="text.secondary">
              {roleLabels[option.role] || option.role}
            </Typography>
            
            {/* Fecha de última calificación (si existe) */}
            {option.lastReviewDate && (
              <Typography variant="caption" display="block" color="text.secondary">
                Última calificación: {new Date(option.lastReviewDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      
      // Mensaje cuando no hay opciones
      noOptionsText={
        inputValue.length < 2
          ? "Escribe al menos 2 caracteres para buscar" // Instrucción inicial
          : "No se encontraron usuarios"                 // Sin resultados
      }
      
      // Componente personalizado para el Paper del dropdown
      PaperComponent={(props) => (
        <Paper {...props} sx={{ mt: 1, boxShadow: 3 }} />
      )}
    />
  );
};

export default UserSearchBar;