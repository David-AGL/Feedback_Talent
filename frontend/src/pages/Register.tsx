import { useForm, Controller } from "react-hook-form";  // Importa useForm para manejar formularios y Controller para componentes controlados
import { Button, TextField, Typography, Box, Paper, Alert, MenuItem, Select, FormControl, InputLabel } from "@mui/material";  // Importa componentes de Material-UI
import { useNavigate } from "react-router-dom";  // Hook para navegar entre rutas
import { useState } from "react";  // Hook para manejar estados locales

// Define la interfaz base con campos comunes para todos los tipos de usuarios
interface BaseRegisterForm {
  email: string;  // Campo para el email, requerido en ambos tipos
  password: string;  // Campo para la contraseña, requerido en ambos tipos
}

// Interfaz para el registro de personas (hereda de BaseRegisterForm)
interface PersonRegisterForm extends BaseRegisterForm {
  name: string;  // Nombre de la persona
  birthDate: string; // Fecha de nacimiento de la persona
  id: string; // Número de cedula
  userType: "employee" | "candidate";  // Tipo de persona (empleado o candidato)
}

// Interfaz para el registro de empresas (hereda de BaseRegisterForm)
interface CompanyRegisterForm extends BaseRegisterForm {
  companyName: string;  // Nombre de la empresa
  nit: string;  // Número de identificación tributaria
}

// Tipo unión para manejar ambos casos en el formulario
type RegisterForm = PersonRegisterForm | CompanyRegisterForm;

const Register = () => {  // Componente funcional para la página de registro
  const { register, handleSubmit, control, formState: { errors } } = useForm<RegisterForm>();  // Desestructura useForm con tipado
  const navigate = useNavigate();  // Inicializa el hook de navegación
  const [error, setError] = useState<string | null>(null);  // Estado para almacenar mensajes de error
  const [loading, setLoading] = useState(false);  // Estado para indicar carga
  const [userType, setUserType] = useState<"person" | "company">("person");  // Estado para el tipo de usuario, por defecto "person"

  const onSubmit = async (data: RegisterForm) => {  // Función asíncrona para manejar el envío
    setLoading(true);  // Activa el estado de carga
    setError(null);  // Limpia errores previos
    try {  // Bloque try-catch para manejar la solicitud
      const payload = {  
        numeroIdentificacion: userType === "person" ? (data as PersonRegisterForm).id : (data as CompanyRegisterForm).nit,
        nombre: userType === "person" ? (data as PersonRegisterForm).name : (data as CompanyRegisterForm).companyName,
        email: data.email,
        contrasena: data.password,
        fechaNacimiento: userType === "person" ? (data as PersonRegisterForm).birthDate : null,
        rol: userType === "person" ? (data as PersonRegisterForm).userType : "company",
        descripcion: userType === "company" ? "Empresa registrada" : "Usuario registrado"
      };
      const res = await fetch("http://localhost:4000/api/usuarios/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Error en el registro");
      }
      console.log("✅ Usuario registrado:", result);
      navigate("/login"); // Redirige al login solo si se guardó bien
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }    
  };

  return (  // Renderiza el componente
    <Box  // Contenedor principal que abarca toda la pantalla
      sx={{  // Estilos inline
        display: 'flex',  // Usa flexbox
        justifyContent: 'center',  // Centra horizontalmente
        alignItems: 'center',  // Centra verticalmente
        minHeight: '100vh',  // Altura mínima del viewport
        width: '100vw',  // Ancho completo
        backgroundColor: 'background.default',  // Fondo del tema
        p: 2  // Padding de 16px
      }}
    >
      <Paper  // Tarjeta con sombra para el formulario
        elevation={3}  // Nivel de sombra
        sx={{  // Estilos
          p: 4,  // Padding interno
          width: '100%',  // Ancho completo
          maxWidth: 500,  // Límite máximo
          display: 'flex',  // Flexbox
          flexDirection: 'column',  // Columna
          alignItems: 'center'  // Centrado interno
        }}
      >
        <Typography  // Título
          variant="h4"  // Estilo h4
          align="center"  // Centrado
          gutterBottom  // Margen inferior
          sx={{ mb: 5 }}  // Margen adicional
        >
          Registro - Feedback Talent
        </Typography>
        {error && (  // Alerta si hay error
          <Alert severity="error" sx={{ mb: 5 }}>
            {error}  // Mensaje
          </Alert>
        )}
        <form  // Formulario
          onSubmit={handleSubmit(onSubmit)}  // Manejo de envío
          style={{ width: '100%' }}  // Ancho completo
        >
          {/* Selector de tipo de usuario (fuera de control de form) */}
          <FormControl fullWidth sx={{ mb: 5 }}>
            <InputLabel>Tipo de Usuario</InputLabel>
            <Select  // Select controlado manualmente
              value={userType}  // Valor del estado
              onChange={(e) => setUserType(e.target.value as "person" | "company")}  // Actualiza estado
              label="Tipo de Usuario"
            >
              <MenuItem value="person">Persona</MenuItem>  // Opción Persona
              <MenuItem value="company">Empresa</MenuItem>  // Opción Empresa
            </Select>
          </FormControl>

          {/* Campos comunes */}
          <TextField  // Campo email
            fullWidth
            label="Email"
            type="email"
            {...register("email", { 
              required: "Email es requerido", 
              pattern: { value: /^\S+@\S+$/i, message: "Email inválido" }
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={loading}
            sx={{ mb: 5 }}
          />
          <TextField  // Campo contraseña
            fullWidth
            label="Contraseña"
            type="password"
            {...register("password", { 
              required: "Contraseña es requerida", 
              minLength: { value: 6, message: "Mínimo 6 caracteres" }
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={loading}
            sx={{ mb: 5 }}
          />

          {/* Campos para Persona */}
          {userType === "person" && (
            <>
              <TextField  // Campo nombre
                fullWidth
                label="Nombre"
                {...register("name", { required: "Nombre es requerido" })}
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={loading}
                sx={{ mb: 5 }}
              />
              <TextField  // Campo id
                fullWidth
                label="Documento de identidad"
                {...register("id", { required: "Documento de identidad es requerido" })}
                error={!!errors.id}
                helperText={errors.id?.message}
                disabled={loading}
                sx={{ mb: 5 }}
              />
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                type="date"
                {...register("birthDate", { required: "La fecha de nacimiento es requerida" })}
                error={!!errors.birthDate}
                helperText={errors.birthDate?.message}
                disabled={loading}
                InputLabelProps={{ shrink: true }} // Hace que el label no se sobreponga al valor
                sx={{ mb: 5 }}
                />

              <FormControl fullWidth sx={{ mb: 5 }}>
                <InputLabel>Tipo de Persona</InputLabel>
                <Controller  // Controlador para tipo de persona
                  name="userType"  // Campo válido
                  control={control}
                  defaultValue="employee"
                  rules={{ required: "Selecciona un tipo" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Tipo de Persona"
                      disabled={loading}
                    >
                      <MenuItem value="employee">Empleado</MenuItem>
                      <MenuItem value="candidate">Candidato</MenuItem>
                    </Select>
                  )}
                />
                {errors.userType && <Alert severity="error">{errors.userType.message}</Alert>}
              </FormControl>
            </>
          )}

          {/* Campos para Empresa */}
          {userType === "company" && (
            <>
              <TextField  // Campo nombre empresa
                fullWidth
                label="Nombre de la Empresa"
                {...register("companyName", { required: "Nombre de empresa es requerido" })}
                error={!!errors.companyName}
                helperText={errors.companyName?.message}
                disabled={loading}
                sx={{ mb: 5 }}
              />
              <TextField  // Campo NIT
                fullWidth
                label="NIT"
                {...register("nit", { required: "NIT es requerido" })}
                error={!!errors.nit}
                helperText={errors.nit?.message}
                disabled={loading}
                sx={{ mb: 5 }}
              />
            </>
          )}

          <Button  // Botón de envío
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 3, py: 1.5 }}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            ¿Ya tienes cuenta? <a href="/" style={{ color: '#007BFF' }}>Inicia sesión aquí</a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;  // Exporta el componente