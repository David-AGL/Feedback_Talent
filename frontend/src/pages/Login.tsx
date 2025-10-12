import { useForm } from "react-hook-form";  // Importa useForm para manejar formularios con validación
import { Button, TextField, Typography, Box, Paper, Alert } from "@mui/material";  // Importa componentes de Material-UI
import { useNavigate } from "react-router-dom";  // Hook para navegar entre rutas
import { login } from "../services/api";  // Importa la función de login del servicio API
import { useState } from "react";  // Hook para manejar estado local (error y loading)
import { useAuth } from "../contexts/AuthContext"; // ← IMPORTAR useAuth

interface LoginForm {  // Define la interfaz TypeScript para los campos del formulario
  email: string;  // Campo para el email del usuario
  password: string;  // Campo para la contraseña del usuario
}

const Login = () => {  // Componente funcional para la página de login
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();  // Desestructura useForm con tipado
  const navigate = useNavigate();  // Inicializa el hook de navegación
  const { login: authLogin } = useAuth(); // ← OBTENER login del contexto (renombrado para evitar conflicto)
  const [error, setError] = useState<string | null>(null);  // Estado para manejar errores
  const [loading, setLoading] = useState(false);  // Estado para indicar carga

  const onSubmit = async (data: LoginForm) => {  // Función asíncrona para manejar el envío
    setLoading(true);  // Activa el estado de carga
    setError(null);  // Limpia errores previos
    try {  // Bloque try-catch para la solicitud al backend
      const response = await login(data.email, data.password);  // Llama a la API
      console.log("Login exitoso", response.data);  // Registra éxito
      // Ahora sí viene el token

      const token = response.data.token; // Obtener el token de la respuesta
      
      if (token) {
        authLogin(token); // ← LLAMAR al login del contexto para guardar el token

        // Decodificar el token para obtener el rol
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const role = decoded.role;
        const userId = decoded.userId;

        console.log("Token decodificado:", decoded);
        console.log("Rol:", role);
        

        // Redirigir según el rol
        switch(role) {
          case 'candidate':
            navigate("/surveycandidate");
            break;
          case 'employee':
            navigate("/surveyemployee");
            break;
          case 'company':
            navigate(`/company-profile/${userId}`);
            break;
          default:
            navigate("/"); // Ruta por defecto si el rol no coincide
        }
      }
    } catch (err: any) {  // Captura errores
      setError(err.response?.data?.message || "Error al iniciar sesión");
      console.error("Error en login:", err);
    } finally {  // Siempre al final
      setLoading(false);  // Desactiva carga
    }
  };

  return (  // Renderiza el componente
    <Box  // Contenedor principal que abarca toda la pantalla
      sx={{  // Estilos inline con MUI sx
        display: 'flex',  // Usa flexbox para centrar
        justifyContent: 'center',  // Centra horizontalmente
        alignItems: 'center',  // Centra verticalmente
        height: '100vh',  // Altura mínima igual al viewport
        width: 'auto',  // Ancho completo de la ventana
        backgroundColor: 'background.default',  // Fondo claro del tema
        p: 2  // Padding de 16px en todos los lados
      }}
    >
      <Paper  // Tarjeta con sombra para el formulario
        elevation={3}  // Sombra nivel 3 de MUI
        sx={{  // Estilos específicos para Paper
          p: 4,  // Padding interno de 32px
          width: '100%',  // Ancho completo en pantallas pequeñas
          maxWidth: 400,  // Límite máximo de 400px
          display: 'flex',  // Flexbox interno para asegurar centrado
          flexDirection: 'column',  // Elementos en columna
          alignItems: 'center'  // Centra contenido dentro de Paper
        }}
      >
        <Typography  // Título del formulario
          variant="h4"  // Estilo h4 del tema
          align="center"  // Texto centrado
          gutterBottom  // Margen inferior automático
          sx={{ mb: 3 }}  // Margen inferior de 24px
        >
          Iniciar Sesión 
        </Typography>
        {error && (  // Muestra alerta si hay error
          <Alert severity="error" sx={{ mb: 2 }}> 
            {error}  
          </Alert>
        )}
        <form  // Formulario con manejo de envío
          onSubmit={handleSubmit(onSubmit)}  // Llama a onSubmit al enviar
          style={{ width: '100%' }}  // Asegura que el form ocupe el ancho de Paper
        >
          <TextField  // Campo de entrada para email
            fullWidth  // Ocupa todo el ancho del contenedor
            label="Email"  // Etiqueta visible
            type="email"  // Tipo de input
            {...register("email", {  // Registra el campo con validaciones
              required: "Email es requerido",
              pattern: { value: /^\S+@\S+$/i, message: "Email inválido" }
            })}
            error={!!errors.email}  // Muestra borde rojo si hay error
            helperText={errors.email?.message}  // Mensaje de ayuda
            disabled={loading}  // Deshabilita durante carga
          />
          <TextField  // Campo de entrada para contraseña
            fullWidth
            label="Contraseña"
            type="password"
            {...register("password", {  // Validaciones para contraseña
              required: "Contraseña es requerida",
              minLength: { value: 6, message: "Mínimo 6 caracteres" }
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={loading}
            sx={{ mt: 2 }}  // Margen superior de 16px
          />
          <Button  // Botón de envío
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 3, py: 1.5 }}  // Margen superior de 24px, padding vertical
          >
            {loading ? "Iniciando..." : "Entrar"}  
          </Button>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>  
          <Typography variant="body2" color="text.secondary">  
            ¿No tienes cuenta? <a href="/register" style={{ color: '#007BFF' }}>Regístrate aquí</a>  
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ¿Olvidaste tu contraseña? <a href="/auth/Recover" style={{ color: '#007BFF' }}>Recupérala aquí</a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;  // Exporta el componente