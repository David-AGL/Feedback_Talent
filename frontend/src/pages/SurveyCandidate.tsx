// Importaciones necesarias de react-hook-form para manejo de formularios
import { useForm, Controller } from "react-hook-form";

// Importaciones de componentes de Material-UI para la interfaz
import { 
  Button, TextField, Typography, Box, Paper, Rating, Slider, Alert, Container, Divider, LinearProgress 
} from "@mui/material";

// Hooks de react-router-dom para navegación
import { useNavigate } from "react-router-dom";

// Hooks de React para manejo de estado y efectos
import { useState, useEffect } from "react";

// Hook personalizado para obtener información de autenticación
import { useAuth } from "../contexts/AuthContext";

// Componente de barra de búsqueda de empresas
import CompanySearchBar from "../components/companySearchBar";
const [evaluatedCompanies, setEvaluatedCompanies] = useState<string[]>([]);


// ==========================================
// INTERFACES Y TIPOS
// ==========================================

// Interfaz para el formulario de encuesta
// Permite campos dinámicos donde la clave es el ID de la pregunta
// y el valor puede ser número (rating/slider) o texto (text)
interface SurveyForm {
  [key: string]: number | string;
}

// Interfaz para los datos de una empresa
// Representa un usuario con rol "company" de la base de datos
interface Company {
  _id: string;          // ID único de MongoDB
  name: string;         // Nombre de la empresa
  email: string;        // Email de contacto
  idNumber: string;     // NIT o número de identificación
  description?: string; // Descripción opcional
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const SurveyCandidate = () => {
  // ==========================================
  // HOOKS Y ESTADOS
  // ==========================================
  
  // Hook de react-hook-form para manejar el formulario
  // - handleSubmit: función para manejar el envío del formulario
  // - control: objeto de control para componentes controlados (Rating, Slider)
  // - register: función para registrar inputs
  // - errors: objeto con errores de validación
  const { handleSubmit, control, register, formState: { errors } } = useForm<SurveyForm>();
  
  // Hook para navegación programática entre rutas
  const navigate = useNavigate();
  
  // Obtiene información del usuario autenticado desde el contexto
  // - role: rol del usuario (candidate, employee, company)
  // - token: JWT token para autenticación en el backend
  const { role, token } = useAuth();
  
  // Estado para almacenar las preguntas obtenidas del backend
  const [questions, setQuestions] = useState<any[]>([]);
  
  // Estado para manejar mensajes de error
  const [error, setError] = useState<string | null>(null);
  
  // Estado para indicar si hay una operación en proceso (cargando)
  const [loading, setLoading] = useState(false);
  
  // Estado para calcular el progreso de completado de la encuesta (0-100)
  const [progress, setProgress] = useState(0);
  
  // Estado para almacenar la empresa seleccionada por el usuario
  // Inicialmente es null hasta que el usuario seleccione una empresa
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Objeto para traducir los roles del inglés al español
  const roleLabels: { [key: string]: string } = {
    employee: "Empleado",
    candidate: "Candidato",
    company: "Empresa"
  };

  // ==========================================
  // EFECTO: CARGAR PREGUNTAS
  // ==========================================
  
  // useEffect que se ejecuta una sola vez al montar el componente
  // Se encarga de obtener las preguntas desde el backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true); // Indica que está cargando
        
        // Hace petición GET al backend para obtener preguntas de candidatos
        const response = await fetch("http://localhost:4000/api/preguntas/candidate");
        const data = await response.json();
        
        // Valida que la respuesta sea un array
        if (!Array.isArray(data)) throw new Error("Datos inválidos de preguntas");
        
        // Guarda las preguntas en el estado
        setQuestions(data);
      } catch (err: any) {
        // Maneja errores y los muestra al usuario
        setError("Error cargando preguntas: " + err.message);
      } finally {
        // Siempre desactiva el loading al terminar
        setLoading(false);
      }
    };
    
    fetchQuestions(); // Ejecuta la función
  }, []); // Array vacío = solo se ejecuta al montar el componente

  // ==========================================
  // EFECTO: CALCULAR PROGRESO
  // ==========================================
  
  // useEffect que se ejecuta cada vez que cambian los valores del formulario o las preguntas
  // Calcula el porcentaje de preguntas respondidas
  useEffect(() => {
    // Obtiene los valores actuales del formulario
    const formValues = control._formValues || {};
    
    // Total de preguntas
    const totalFields = questions.length;
    
    // Cuenta cuántos campos tienen valores válidos (no null, no vacío, no 0)
    const completedFields = Object.keys(formValues).filter(
      key => formValues[key] !== null && formValues[key] !== "" && formValues[key] !== 0
    ).length;
    
    // Calcula el porcentaje (o 0 si no hay preguntas)
    setProgress(totalFields > 0 ? (completedFields / totalFields) * 100 : 0);
  }, [control._formValues, questions]); // Se ejecuta cuando cambian estos valores

  // ==========================================
  // FUNCIÓN: ENVIAR ENCUESTA
  // ==========================================
  
  // Función que se ejecuta cuando el usuario envía el formulario
  // data: objeto con todas las respuestas del formulario
  const onSubmit = async (data: SurveyForm) => {
    // VALIDACIÓN: Verifica que se haya seleccionado una empresa
    if (!selectedCompany) {
      setError("Por favor selecciona una empresa para calificar");
      // Hace scroll hacia arriba para que el usuario vea el error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; // Detiene la ejecución
    }

    setLoading(true); // Indica que está procesando
    setError(null);   // Limpia errores previos
    
    try {
      // Prepara el payload (datos) para enviar al backend
      const payload = {
        token,                          // JWT token del usuario
        companyUserId: selectedCompany._id, // ID de la empresa seleccionada
        respuestas: data,               // Objeto con todas las respuestas
      };
      
      // Hace petición POST al backend para guardar las respuestas
      const response = await fetch("http://localhost:4000/api/responses/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // Convierte el payload a JSON
      });
      
      // Parsea la respuesta del servidor
      const result = await response.json();
      
      // Si el servidor responde con error, lanza excepción
      if (!response.ok) throw new Error(result.message || "Error al enviar");
      
      // Log de éxito en la consola
      console.log("Respuestas enviadas", result);
      
      // Redirige al usuario a la página de inicio
      navigate("/");
      
    } catch (err: any) {
      // Captura errores y los muestra al usuario
      setError(err.message || "Error al enviar encuesta");
      // Hace scroll hacia arriba para mostrar el error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      // Siempre desactiva el loading al terminar
      setLoading(false);
    }
  };

  // ==========================================
  // RENDERIZADO DEL COMPONENTE
  // ==========================================

  return (
    // Contenedor principal con gradiente de fondo (colores Magneto)
    <Box
      sx={{
        minHeight: '100vh', // Altura mínima de toda la pantalla
        background: 'linear-gradient(135deg, #0A66C2 0%, #00D9B1 100%)', // Gradiente azul-verde
        py: 6,  // Padding vertical de 48px
        px: 2   // Padding horizontal de 16px
      }}
    >
      {/* Container de Material-UI para centrar contenido */}
      <Container maxWidth="md">
        {/* Paper = Tarjeta blanca con sombra que contiene todo el formulario */}
        <Paper
          elevation={6} // Nivel de sombra
          sx={{
            p: { xs: 3, md: 5 }, // Padding responsive: 24px móvil, 40px desktop
            borderRadius: 4,      // Bordes redondeados
            background: 'rgba(255, 255, 255, 0.98)', // Fondo casi blanco con transparencia
            backdropFilter: 'blur(10px)', // Efecto de desenfoque en el fondo
          }}
        >
          {/* ==========================================
              SECCIÓN: ENCABEZADO
              ========================================== */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {/* Título principal con gradiente en el texto */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700, // Texto en negrita
                // Gradiente aplicado al texto
                background: 'linear-gradient(135deg, #0A66C2 0%, #00D9B1 100%)',
                WebkitBackgroundClip: 'text',      // Clip del gradiente al texto
                WebkitTextFillColor: 'transparent', // Hace el texto transparente para ver el gradiente
                mb: 1 // Margen inferior
              }}
            >
              Feedback Talent
            </Typography>
            
            {/* Subtítulo con rol dinámico */}
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Llena la encuesta para {roleLabels[role || 'candidate']}
            </Typography>
            
            {/* Línea divisoria */}
            <Divider sx={{ my: 3 }} />
          </Box>

          {/* ==========================================
              SECCIÓN: BARRA DE BÚSQUEDA DE EMPRESAS
              ========================================== */}
          <Box sx={{ mb: 4 }}>
            {/* Componente personalizado para buscar empresas */}
            <CompanySearchBar
              onCompanySelect={setSelectedCompany} // Callback cuando se selecciona una empresa
              selectedCompany={selectedCompany}    // Empresa actualmente seleccionada
              evaluatedCompanies={evaluatedCompanies}
            />
            
            {/* Alerta de éxito que se muestra solo si hay empresa seleccionada */}
            {selectedCompany && (
              <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                Vas a calificar a: <strong>{selectedCompany.name}</strong>
              </Alert>
            )}
          </Box>

          {/* ==========================================
              SECCIÓN: ALERTA DE ERROR
              ========================================== */}
          {/* Se muestra solo si hay un error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* ==========================================
              SECCIÓN: BARRA DE PROGRESO
              ========================================== */}
          {/* Se muestra solo si hay preguntas Y empresa seleccionada */}
          {questions.length > 0 && selectedCompany && (
            <Box sx={{ mb: 4 }}>
              {/* Encabezado con etiqueta y porcentaje */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progreso de la encuesta
                </Typography>
                <Typography variant="body2" sx={{ color: '#0A66C2', fontWeight: 'bold' }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              
              {/* Barra de progreso animada */}
              <LinearProgress
                variant="determinate"  // Modo determinado (con valor específico)
                value={progress}       // Valor del progreso (0-100)
                sx={{
                  height: 8,          // Altura de la barra
                  borderRadius: 4,    // Bordes redondeados
                  bgcolor: 'rgba(0, 217, 177, 0.1)', // Fondo de la barra
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #0A66C2 0%, #00D9B1 100%)', // Gradiente
                  }
                }}
              />
            </Box>
          )}

          {/* ==========================================
              SECCIÓN: FORMULARIO O MENSAJE
              ========================================== */}
          
          {/* CASO 1: Si hay empresa seleccionada, muestra el formulario */}
          {selectedCompany ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* SUBCASO 1A: Está cargando preguntas */}
              {loading && questions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    Cargando preguntas...
                  </Typography>
                </Box>
              
              /* SUBCASO 1B: Hay preguntas para mostrar */
              ) : questions.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Mapea cada pregunta a un componente visual */}
                  {questions.map((q, index) => (
                    <Paper
                      key={q._id} // Key único basado en el ID de MongoDB
                      elevation={0} // Sin sombra por defecto
                      sx={{
                        p: 3, // Padding interno
                        border: '2px solid',
                        // Borde rojo si hay error, verde claro si no
                        borderColor: errors[q._id.toString()] ? 'error.main' : 'rgba(0, 217, 177, 0.2)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease', // Animación suave
                        '&:hover': {
                          borderColor: '#00D9B1', // Borde verde al pasar el mouse
                          boxShadow: '0 4px 20px rgba(0, 217, 177, 0.15)', // Sombra en hover
                        }
                      }}
                    >
                      {/* Encabezado de la pregunta con número */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        {/* Círculo con el número de pregunta */}
                        <Box
                          sx={{
                            minWidth: 40,
                            height: 40,
                            borderRadius: '50%', // Hace el círculo
                            background: 'linear-gradient(135deg, #0A66C2 0%, #00D9B1 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1} {/* Número de pregunta (empieza en 1) */}
                        </Box>
                        
                        {/* Contenido de texto de la pregunta */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {q.contenido} {/* Texto de la pregunta */}
                          </Typography>
                          
                          {/* Etiqueta si la pregunta es obligatoria */}
                          {q.obligatoria && (
                            <Typography variant="caption" color="error">
                              * Obligatoria
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* ==========================================
                          TIPO DE PREGUNTA: RATING (Estrellas)
                          ========================================== */}
                      {q.tipo === "rating" && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                          {/* Controller de react-hook-form para componentes controlados */}
                          <Controller
                            name={q._id.toString()} // Nombre único basado en el ID
                            control={control}       // Control del formulario
                            rules={{ 
                              required: q.obligatoria ? "Esta pregunta es obligatoria" : false 
                            }}
                            defaultValue={0} // Valor inicial: 0 estrellas
                            render={({ field: { onChange, value } }) => (
                              // Componente Rating de Material-UI
                              <Rating
                                value={Number(value)}
                                onChange={(e, newValue) => onChange(newValue)}
                                precision={0.5}  // Permite medias estrellas
                                size="large"     // Tamaño grande
                                sx={{
                                  '& .MuiRating-iconFilled': {
                                    color: '#00D9B1', // Color de estrellas llenas
                                  },
                                  '& .MuiRating-iconHover': {
                                    color: '#0A66C2', // Color al pasar el mouse
                                  }
                                }}
                              />
                            )}
                          />
                        </Box>
                      )}

                      {/* ==========================================
                          TIPO DE PREGUNTA: SLIDER (Deslizador)
                          ========================================== */}
                      {q.tipo === "slider" && (
                        <Box sx={{ px: 2, mt: 3 }}>
                          <Controller
                            name={q._id.toString()}
                            control={control}
                            rules={{ 
                              required: q.obligatoria ? "Esta pregunta es obligatoria" : false 
                            }}
                            defaultValue={5} // Valor inicial: 5 (punto medio)
                            render={({ field: { onChange, value } }) => (
                              // Componente Slider de Material-UI
                              <Slider
                                value={Number(value)}
                                onChange={(e, newValue) => onChange(newValue as number)}
                                min={1}               // Valor mínimo
                                max={10}              // Valor máximo
                                step={1}              // Incrementos de 1
                                marks                 // Muestra marcas en cada número
                                valueLabelDisplay="on" // Muestra el valor siempre
                                sx={{
                                  '& .MuiSlider-thumb': {
                                    background: 'linear-gradient(135deg, #0A66C2 0%, #00D9B1 100%)',
                                  },
                                  '& .MuiSlider-track': {
                                    background: 'linear-gradient(90deg, #0A66C2 0%, #00D9B1 100%)',
                                  },
                                  '& .MuiSlider-rail': {
                                    opacity: 0.3, // Opacidad del riel no seleccionado
                                  }
                                }}
                              />
                            )}
                          />
                        </Box>
                      )}

                      {/* ==========================================
                          TIPO DE PREGUNTA: TEXT (Texto libre)
                          ========================================== */}
                      {q.tipo === "text" && (
                        <TextField
                          fullWidth              // Ocupa todo el ancho
                          multiline              // Permite múltiples líneas
                          rows={4}               // 4 filas de alto
                          placeholder="Escribe tu respuesta aquí..."
                          {...register(q._id.toString(), { 
                            required: q.obligatoria ? "Esta pregunta es obligatoria" : false 
                          })}
                          error={!!errors[q._id.toString()]} // Muestra error si existe
                          helperText={errors[q._id.toString()]?.message} // Mensaje de error
                          sx={{
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#00D9B1', // Borde verde al pasar el mouse
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#0A66C2', // Borde azul al enfocar
                              }
                            }
                          }}
                        />
                      )}
                    </Paper>
                  ))}
                </Box>
              
              /* SUBCASO 1C: No hay preguntas disponibles */
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No hay preguntas disponibles en este momento.
                  </Typography>
                </Box>
              )}

              {/* ==========================================
                  BOTÓN DE ENVÍO
                  ========================================== */}
              {/* Se muestra solo si hay preguntas */}
              {questions.length > 0 && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    type="submit"           // Tipo submit para enviar el formulario
                    variant="contained"     // Estilo de botón relleno
                    size="large"           // Tamaño grande
                    disabled={loading}     // Deshabilitar mientras carga
                    sx={{
                      px: 6,  // Padding horizontal
                      py: 1.5, // Padding vertical
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #0A66C2 0%, #00D9B1 100%)',
                      boxShadow: '0 4px 15px rgba(0, 217, 177, 0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        // Invierte el gradiente en hover
                        background: 'linear-gradient(135deg, #00D9B1 0%, #0A66C2 100%)',
                        boxShadow: '0 6px 20px rgba(0, 217, 177, 0.6)',
                        transform: 'translateY(-2px)', // Eleva el botón
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)', // Gris cuando está deshabilitado
                      }
                    }}
                  >
                    {/* Texto dinámico según el estado de loading */}
                    {loading ? "Enviando..." : "Enviar Encuesta"}
                  </Button>
                </Box>
              )}
            </form>
          
          /* CASO 2: No hay empresa seleccionada - Muestra mensaje */
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                👆 Selecciona una empresa para comenzar la encuesta
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usa la barra de búsqueda para encontrar la empresa que deseas calificar
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

// Exporta el componente para usarlo en otras partes de la aplicación
export default SurveyCandidate;