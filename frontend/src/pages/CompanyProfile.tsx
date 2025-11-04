import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../contexts/AuthContext';

// ==========================================
// INTERFACES Y TIPOS
// ==========================================

/**
 * Interfaz para los datos básicos de una empresa
 * Representa la información principal de un usuario con rol "company"
 */
interface CompanyData {
  _id: string;          // ID único de MongoDB
  name: string;         // Nombre de la empresa
  email: string;        // Email de contacto
  idNumber: string;     // NIT o número de identificación
  description?: string; // Descripción opcional de la empresa
  createdAt: string;    // Fecha de creación de la cuenta
}

/**
 * Interfaz para estadísticas agrupadas por categoría
 * Cada categoría agrupa varias preguntas del mismo tema
 * Ejemplo: { _id: "Ambiente Laboral", avgScore: 8.5, count: 10 }
 */
interface CategoryStat {
  _id: string;      // Nombre de la categoría (ej: "Ambiente Laboral", "Beneficios")
  avgScore: number; // Promedio de todos los puntajes en esta categoría
  count: number;    // Cantidad total de respuestas en esta categoría
}

/**
 * Interfaz para estadísticas de una pregunta específica
 * Representa el promedio de respuestas para una pregunta individual
 */
interface QuestionStat {
  questionId: string;   // ID único de la pregunta en MongoDB
  questionText: string; // Texto completo de la pregunta
  avgScore: number;     // Promedio de respuestas para esta pregunta
  count: number;        // Cantidad de respuestas recibidas
}

/**
 * Interfaz para un usuario que ha calificado a la empresa
 * Representa un empleado o candidato que dejó feedback
 */
interface Reviewer {
  _id: string;            // ID único del usuario
  name: string;           // Nombre completo del usuario
  email: string;          // Email del usuario
  role: string;           // Rol: "employee" o "candidate"
  lastReviewDate: string; // Fecha de su última calificación a esta empresa
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const CompanyProfile = () => {
  // ==========================================
  // HOOKS Y ESTADOS
  // ==========================================
  
  /**
   * Obtiene el ID de la empresa desde los parámetros de la URL
   * Ejemplo: /company-profile/123abc -> companyId = "123abc"
   */
  const { companyId } = useParams<{ companyId: string }>();
  
  /**
   * Hook para obtener información del usuario autenticado
   * token: JWT token para autenticación en el backend
   * role: rol del usuario actual (employee, candidate, company)
   */
  const { token, role } = useAuth();
  
  /**
   * Hook para navegación programática entre rutas
   * Permite redirigir al usuario a otras páginas
   */
  const navigate = useNavigate();

  // ==========================================
  // ESTADOS PARA DATOS DE LA EMPRESA
  // ==========================================
  
  /**
   * Almacena la información básica de la empresa
   * Se llena al cargar el perfil desde el backend
   */
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  
  // ==========================================
  // ESTADOS PARA ESTADÍSTICAS
  // ==========================================
  
  /**
   * Array de estadísticas por categoría
   * Cada elemento representa una categoría con su promedio
   */
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  
  /**
   * Controla qué categoría está expandida en los acordeones
   * false = ninguna expandida, string = nombre de la categoría expandida
   */
  const [expandedCategory, setExpandedCategory] = useState<string | false>(false);
  
  /**
   * Diccionario que almacena las estadísticas de preguntas por categoría
   * Clave: nombre de la categoría
   * Valor: array de estadísticas de preguntas
   * Solo se cargan cuando el usuario expande una categoría
   */
  const [questionStats, setQuestionStats] = useState<{ [key: string]: QuestionStat[] }>({});
  
  // ==========================================
  // ESTADOS PARA REVISORES (USUARIOS QUE CALIFICAN)
  // ==========================================
  
  /**
   * Lista completa de usuarios que han calificado a esta empresa
   * Solo se llena si el usuario actual es la empresa misma
   */
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  
  /**
   * Lista filtrada de revisores según el término de búsqueda
   * Se actualiza cada vez que el usuario escribe en el buscador
   */
  const [filteredReviewers, setFilteredReviewers] = useState<Reviewer[]>([]);
  
  /**
   * Término de búsqueda actual para filtrar revisores
   */
  const [searchTerm, setSearchTerm] = useState('');
  
  // ==========================================
  // ESTADOS DE UI
  // ==========================================
  
  /**
   * Indica si está cargando datos iniciales
   * Muestra un spinner mientras se cargan los datos
   */
  const [loading, setLoading] = useState(true);
  
  /**
   * Almacena mensajes de error si algo falla
   * null = sin errores
   */
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Promedio general de todas las categorías
   * Calculado a partir de categoryStats
   */
  const [overallAverage, setOverallAverage] = useState(0);

  // ==========================================
  // CONSTANTES Y HELPERS
  // ==========================================
  
  /**
   * Diccionario para traducir roles del inglés al español
   * Usado para mostrar etiquetas amigables al usuario
   */
  const roleLabels: { [key: string]: string } = {
    employee: "Empleado",
    candidate: "Candidato",
    company: "Empresa"
  };

  // ==========================================
  // EFECTO: CARGAR DATOS DE LA EMPRESA
  // ==========================================
  
  /**
   * Se ejecuta cuando cambia companyId o token
   * Obtiene la información básica de la empresa desde el backend
   * 
   * Flujo:
   * 1. Hace petición GET a /api/company/profile/:companyId
   * 2. Incluye token JWT en headers para autenticación
   * 3. Si es exitoso, guarda los datos en companyData
   * 4. Si falla, guarda el error en el estado error
   */
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/company/profile/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}` // Envía token JWT para autenticación
            }
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Error al cargar perfil de empresa");
        }
        setCompanyData(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    // Solo ejecuta si tenemos un ID de empresa válido y el token
    if (companyId && token && companyId !== 'undefined') {
      fetchCompanyData();
    } else {
      // Si el ID no es válido, establece un error y detiene la carga
      setError("ID de empresa no proporcionado o inválido.");
      setLoading(false);
    }
  }, [companyId, token]); // Dependencias: se re-ejecuta si cambian

  // ==========================================
  // EFECTO: CARGAR ESTADÍSTICAS POR CATEGORÍA
  // ==========================================
  
  /**
   * Obtiene los promedios de calificación agrupados por categoría
   * 
   * Flujo:
   * 1. Hace petición GET a /api/company/stats/:companyId
   * 2. Recibe array de objetos con categoría, promedio y conteo
   * 3. Calcula el promedio general de todas las categorías
   * 4. Desactiva el loading al terminar
   * 
   * Ejemplo de respuesta:
   * [
   *   { _id: "Ambiente Laboral", avgScore: 8.5, count: 10 },
   *   { _id: "Beneficios", avgScore: 7.2, count: 8 }
   * ]
   */
  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/company/stats/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) throw new Error("Error al cargar estadísticas");

        const data = await response.json();
        setCategoryStats(data); // Guarda las estadísticas por categoría

        // Calcula el promedio general (promedio de promedios)
        if (data.length > 0) {
          const totalAvg = data.reduce(
            (sum: number, cat: CategoryStat) => sum + cat.avgScore, 
            0
          ) / data.length;
          setOverallAverage(totalAvg);
        }
      } catch (err: any) {
        console.error("Error cargando estadísticas:", err);
        // No mostramos error al usuario, solo en consola
        // La UI mostrará "Aún no hay calificaciones"
      } finally {
        setLoading(false); // Desactiva el loading sin importar el resultado
      }
    };

    if (companyId && token && companyId !== 'undefined') {
      fetchCategoryStats();
    }
  }, [companyId, token]);

  // ==========================================
  // EFECTO: CARGAR REVISORES
  // ==========================================
  
  /**
   * Solo se ejecuta si el usuario actual es la empresa (role === 'company')
   * Obtiene la lista de usuarios que han calificado a esta empresa
   * 
   * Flujo:
   * 1. Verifica que el usuario sea una empresa
   * 2. Hace petición GET a /api/company/reviewers/:companyId
   * 3. Recibe lista de usuarios con nombre, rol y fecha de calificación
   * 4. Inicializa tanto reviewers como filteredReviewers con los datos
   * 
   * Nota: Si el usuario no es la empresa, este efecto no hace nada
   */
  useEffect(() => {
    const fetchReviewers = async () => {
      // Si no es una empresa, no carga revisores (protección)
      if (role !== 'company') return;

      try {
        const response = await fetch(
          `http://localhost:4000/api/company/reviewers/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Si falla, simplemente retorna sin hacer nada
        // No mostramos error porque es información opcional
        if (!response.ok) return;

        const data = await response.json();
        setReviewers(data);         // Lista completa
        setFilteredReviewers(data); // Lista filtrada (inicialmente igual)
      } catch (err: any) {
        console.error("Error cargando revisores:", err);
      }
    };

    if (companyId && token && role === 'company' && companyId !== 'undefined') {
      fetchReviewers();
    }
  }, [companyId, token, role]);

  // ==========================================
  // FUNCIÓN: MANEJAR EXPANSIÓN DE CATEGORÍA
  // ==========================================
  
  /**
   * Se ejecuta cuando el usuario expande/colapsa un acordeón de categoría
   * Carga las estadísticas detalladas de preguntas solo cuando se necesitan
   * 
   * @param categoria - Nombre de la categoría (ej: "Ambiente Laboral")
   * @param isExpanded - true si se está expandiendo, false si se está colapsando
   * 
   * Flujo:
   * 1. Actualiza qué acordeón está expandido
   * 2. Si ya se cargaron las preguntas de esta categoría, no hace nada
   * 3. Si se está expandiendo y no hay datos, hace petición al backend
   * 4. Guarda las estadísticas de preguntas en questionStats
   * 
   * Optimización: Solo carga datos una vez por categoría (lazy loading)
   */
  const handleCategoryExpand = async (categoria: string, isExpanded: boolean) => {
    // Actualiza qué categoría está expandida
    setExpandedCategory(isExpanded ? categoria : false);

    // Si ya tenemos los datos cargados, no los vuelve a pedir
    // Esto evita peticiones innecesarias al backend
    if (questionStats[categoria]) return;

    // Si se está expandiendo (no colapsando), carga los datos
    if (isExpanded) {
      try {
        const response = await fetch(
          `http://localhost:4000/api/company/stats/${companyId}/category/${encodeURIComponent(categoria)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) throw new Error("Error al cargar preguntas");

        const data = await response.json();
        
        // Guarda las estadísticas de preguntas usando el nombre de categoría como clave
        // Esto permite acceder rápidamente a los datos: questionStats["Ambiente Laboral"]
        setQuestionStats(prev => ({
          ...prev,                // Mantiene los datos de otras categorías
          [categoria]: data       // Agrega/actualiza los datos de esta categoría
        }));
      } catch (err: any) {
        console.error("Error cargando preguntas:", err);
        // No mostramos error al usuario, solo en consola
      }
    }
  };

  // ==========================================
  // EFECTO: FILTRAR REVISORES
  // ==========================================
  
  /**
   * Filtra la lista de revisores según el término de búsqueda
   * Se ejecuta cada vez que cambia searchTerm o reviewers
   * 
   * Flujo:
   * 1. Si no hay texto de búsqueda, muestra todos los revisores
   * 2. Si hay búsqueda, filtra por nombre (case-insensitive)
   * 3. Actualiza filteredReviewers con los resultados
   * 
   * Ejemplo:
   * - reviewers: [Juan Pérez, María García, Pedro Martínez]
   * - searchTerm: "mar"
   * - filteredReviewers: [María García, Pedro Martínez]
   */
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // Si no hay búsqueda, muestra todos
      setFilteredReviewers(reviewers);
    } else {
      // Filtra por nombre (ignora mayúsculas/minúsculas)
      const filtered = reviewers.filter(reviewer =>
        reviewer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReviewers(filtered);
    }
  }, [searchTerm, reviewers]); // Se ejecuta cuando cambia el término o la lista

  // ==========================================
  // FUNCIÓN: OBTENER COLOR SEGÚN PUNTAJE
  // ==========================================
  
  /**
   * Retorna un color basado en el puntaje para indicación visual
   * 
   * @param score - Puntaje numérico (normalmente 0-10)
   * @returns Color en formato hexadecimal
   * 
   * Escala de colores:
   * - >= 4: Verde (#28A745) - Excelente
   * - >= 3: Amarillo (#FFC107) - Bueno
   * - >= 2: Naranja (#FF9800) - Regular
   * - < 2: Rojo (#DC3545) - Malo
   */
  const getScoreColor = (score: number): string => {
    if (score >= 4) return '#28A745'; // Verde - Excelente
    if (score >= 3) return '#FFC107'; // Amarillo - Bueno
    if (score >= 2) return '#FF9800'; // Naranja - Regular
    return '#DC3545'; // Rojo - Malo
  };

  // ==========================================
  // FUNCIÓN: RENDERIZAR BARRA DE PROGRESO
  // ==========================================
  
  /**
   * Muestra una barra de progreso horizontal con color según el puntaje
   * Componente reutilizable para mostrar cualquier métrica visual
   * 
   * @param score - Puntaje actual
   * @param max - Puntaje máximo posible (default: 10)
   * @returns JSX Element con barra de progreso y número
   * 
   * Ejemplo visual:
   * ████████░░ 8.5
   */
  const renderScoreBar = (score: number, max: number = 5) => {
    const percentage = (score / max) * 100; // Calcula porcentaje para la barra
    const color = getScoreColor(score);     // Obtiene color según puntaje

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
        {/* Contenedor de la barra de progreso */}
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"  // Modo con valor específico (no indeterminado)
            value={percentage}     // Porcentaje de la barra (0-100)
            sx={{
              height: 10,                      // Altura de la barra
              borderRadius: 5,                 // Bordes redondeados
              bgcolor: 'rgba(0,0,0,0.1)',     // Fondo gris claro de la barra vacía
              '& .MuiLinearProgress-bar': {
                bgcolor: color,                // Color de la barra llena (dinámico)
                borderRadius: 5,
              }
            }}
          />
        </Box>
        
        {/* Número del puntaje */}
        <Typography
          variant="h6"
          sx={{
            minWidth: 50,        // Ancho mínimo para mantener alineación
            fontWeight: 700,     // Negrita
            color: color,        // Mismo color que la barra
            textAlign: 'right'   // Alineado a la derecha
          }}
        >
          {score.toFixed(1)}    {/* Muestra con 1 decimal: 8.5 */}
        </Typography>
      </Box>
    );
  };

  // ==========================================
  // RENDERIZADO CONDICIONAL: LOADING
  // ==========================================
  
  /**
   * Si está cargando, muestra un spinner centrado en pantalla
   * Esto se muestra mientras se cargan los datos iniciales
   */
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // ==========================================
  // RENDERIZADO CONDICIONAL: ERROR
  // ==========================================
  
  /**
   * Si hay un error o no se encontró la empresa, muestra mensaje de error
   * Esto puede ocurrir si:
   * - El ID de empresa no existe
   * - El usuario no tiene permisos
   * - Hubo un error de red
   */
  if (error || !companyData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || "Empresa no encontrada"}
        </Alert>
      </Container>
    );
  }

  // ==========================================
  // RENDERIZADO PRINCIPAL
  // ==========================================

  return (
    <Box sx={{ 
      minHeight: '100vh',   // Altura mínima de toda la pantalla
      bgcolor: '#f5f5f5',   // Fondo gris muy claro
      py: 6                 // Padding vertical de 48px
    }}>
      <Container maxWidth="lg">
        
        {/* ==========================================
            SECCIÓN: ENCABEZADO DEL PERFIL
            Muestra información básica de la empresa con diseño destacado
            ========================================== */}
        <Paper
          elevation={3}  // Sombra nivel 3
          sx={{
            p: 4,        // Padding de 32px
            mb: 4,       // Margen inferior de 32px
            borderRadius: 4,  // Bordes muy redondeados
            background: 'var(--primary-color)',
            color: 'white'    // Texto blanco para contraste
          }}
        >
          <Box sx={{ 
            display: 'flex',       // Layout flexbox
            alignItems: 'center',  // Centra verticalmente
            gap: 3,                // Espacio entre elementos
            flexWrap: 'wrap'       // Permite que se ajuste en móviles
          }}>
            {/* Avatar/Logo de la empresa */}
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'white',   // Fondo blanco
                color: 'var(--primary-color)'
              }}
            >
              <BusinessIcon sx={{ fontSize: 60 }} />
            </Avatar>
            
            {/* Información textual de la empresa */}
            <Box sx={{ flex: 1 }}>  {/* flex: 1 para ocupar espacio restante */}
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {companyData.name}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                NIT: {companyData.idNumber}
              </Typography>
              {/* Descripción opcional */}
              {companyData.description && (
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {companyData.description}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>

        {/* ==========================================
            SECCIÓN: TARJETA DE CALIFICACIÓN GENERAL
            Solo se muestra si hay al menos una categoría con datos
            ========================================== */}
        {categoryStats.length > 0 && (
          <Card
            sx={{
              mb: 4,  // Margen inferior
              background: 'var(--secondary-color)',
              color: 'white'
            }}
          >
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2 
              }}>
                {/* Ícono de estrella */}
                <StarIcon sx={{ fontSize: 60 }} />
                
                {/* Información del promedio */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Calificación General
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {overallAverage.toFixed(1)} / 5
                  </Typography>
                </Box>
                
                {/* Ícono decorativo de tendencia */}
                <TrendingUpIcon sx={{ fontSize: 60, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* ==========================================
            LAYOUT PRINCIPAL CON FLEXBOX
            Reemplaza Grid por Box con flexbox para evitar errores de tipos
            
            Layout responsive:
            - xs (móvil): columna (vertical)
            - md (desktop): fila (horizontal)
            ========================================== */}
        <Box sx={{ 
          display: 'flex',                              // Activa flexbox
          flexDirection: { xs: 'column', md: 'row' },  // Columna en móvil, fila en desktop
          gap: 3                                        // Espacio entre columnas
        }}>
          
          {/* ==========================================
              COLUMNA IZQUIERDA: ESTADÍSTICAS POR CATEGORÍA
              
              Ancho:
              - Si es empresa: 66% del ancho (8/12 columnas)
              - Si no es empresa: 100% del ancho (12/12 columnas)
              ========================================== */}
          <Box sx={{ 
            flex: role === 'company' ? '1 1 66%' : '1 1 100%'  // flex-grow, flex-shrink, flex-basis
          }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
              {/* Título de la sección */}
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                📊 Estadísticas por Categoría
              </Typography>

              {/* Mensaje si no hay estadísticas */}
              {categoryStats.length === 0 ? (
                <Alert severity="info">
                  Aún no hay calificaciones para esta empresa
                </Alert>
              ) : (
                // Mapea cada categoría a un Accordion (acordeón expandible)
                categoryStats.map((category) => (
                  <Accordion
                    key={category._id}  // Key único para React
                    expanded={expandedCategory === category._id}  // Controla si está expandido
                    onChange={(e, isExpanded) => handleCategoryExpand(category._id, isExpanded)}
                    sx={{
                      mb: 2,  // Margen inferior entre acordeones
                      borderRadius: 2,
                      '&:before': { display: 'none' },  // Quita línea divisoria por defecto de MUI
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'  // Sombra suave
                    }}
                  >
                    {/* ==========================================
                        ENCABEZADO DEL ACORDEÓN
                        Muestra nombre de categoría, cantidad y barra de progreso
                        ========================================== */}
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}  // Ícono de flecha para expandir
                      sx={{
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: 'var(--accent-color)'
                        }
                      }}
                    >
                      <Box sx={{ width: '100%', pr: 2 }}>  {/* pr: padding-right */}
                        {/* Fila con nombre y chip de conteo */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          mb: 1 
                        }}>
                          {/* Nombre de la categoría */}
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {category._id}
                          </Typography>
                          
                          {/* Chip con cantidad de respuestas */}
                          <Chip
                            label={`${category.count} respuestas`}
                            size="small"
                            sx={{ bgcolor: 'var(--primary-color)', color: 'white' }}
                          />
                        </Box>
                        
                        {/* Barra de progreso con el promedio de la categoría */}
                        {renderScoreBar(category.avgScore)}
                      </Box>
                    </AccordionSummary>
                    
                    {/* ==========================================
                        CONTENIDO EXPANDIBLE DEL ACORDEÓN
                        Muestra detalle de cada pregunta dentro de la categoría
                        Solo se carga cuando el usuario expande (lazy loading)
                        ========================================== */}
                    <AccordionDetails>
                      <Divider sx={{ mb: 2 }} />  {/* Línea separadora */}
                      
                      {/* Si ya se cargaron las preguntas de esta categoría */}
                      {questionStats[category._id] ? (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 2 
                        }}>
                          {/* Mapea cada pregunta */}
                          {questionStats[category._id].map((question, index) => (
                            <Box key={question.questionId}>
                              {/* Texto de la pregunta */}
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Pregunta {index + 1}: {question.questionText}
                              </Typography>
                              
                              {/* Barra de progreso con el promedio de esta pregunta */}
                              {renderScoreBar(question.avgScore)}
                              
                              {/* Divisor entre preguntas (excepto la última) */}
                              {index < questionStats[category._id].length - 1 && (
                                <Divider sx={{ mt: 2 }} />
                              )}
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        // Si está cargando las preguntas, muestra spinner
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          py: 2 
                        }}>
                          <CircularProgress size={30} />
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Paper>
          </Box>

          {/* ==========================================
              COLUMNA DERECHA: LISTA DE REVISORES
              
              Solo visible si el usuario actual es la empresa (role === 'company')
              Muestra lista de usuarios que han calificado con buscador
              
              Ancho: 33% del ancho total (4/12 columnas)
              En móvil: 100% del ancho
              ========================================== */}
          {role === 'company' && (
            <Box sx={{ 
              flex: '0 0 33%',                    // No crece, no se encoge, base 33%
              minWidth: { xs: '100%', md: 300 }   // 100% en móvil, mínimo 300px en desktop
            }}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3,                    // Padding de 24px
                  borderRadius: 4,         // Bordes muy redondeados
                  position: 'sticky',      // Se queda fijo al hacer scroll
                  top: 20                  // 20px desde el top cuando hace sticky
                }}
              >
                {/* Título de la sección */}
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                  👥 Usuarios que Califican
                </Typography>

                {/* ==========================================
                    CAMPO DE BÚSQUEDA
                    Permite filtrar usuarios por nombre en tiempo real
                    ========================================== */}
                <TextField
                  fullWidth                        // Ocupa todo el ancho
                  placeholder="Buscar por nombre..."
                  value={searchTerm}               // Valor controlado por estado
                  onChange={(e) => setSearchTerm(e.target.value)}  // Actualiza estado al escribir
                  InputProps={{
                    // Ícono de lupa al inicio del campo
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}  // Margen inferior
                />

                {/* ==========================================
                    LISTA DE USUARIOS
                    Muestra usuarios que han calificado, filtrados por búsqueda
                    Cada item es clickeable y redirige al perfil del usuario
                    ========================================== */}
                <List sx={{ 
                  maxHeight: 500,    // Altura máxima de 500px
                  overflow: 'auto'   // Scroll vertical si excede la altura
                }}>
                  {/* Si no hay usuarios (por búsqueda o porque no hay calificaciones) */}
                  {filteredReviewers.length === 0 ? (
                    <Alert severity="info">
                      {searchTerm 
                        ? 'No se encontraron usuarios'      // Mensaje si hay búsqueda sin resultados
                        : 'Aún no hay calificaciones'       // Mensaje si no hay ninguna calificación
                      }
                    </Alert>
                  ) : (
                    // Mapea cada usuario a un item de lista clickeable
                    filteredReviewers.map((reviewer) => (
                      <ListItemButton
                        key={reviewer._id}  // Key único para React
                        // Al hacer click, navega al perfil del usuario
                        onClick={() => navigate(`/user-profile/${reviewer._id}`)}
                        sx={{
                          borderRadius: 2,              // Bordes redondeados
                          mb: 1,                        // Margen inferior entre items
                          border: '1px solid #e0e0e0',  // Borde gris claro
                          '&:hover': {
                            // Estilos al pasar el mouse
                            bgcolor: 'var(--accent-color)',
                            borderColor: 'var(--primary-color)'
                          }
                        }}
                      >
                        {/* ==========================================
                            AVATAR DEL USUARIO
                            Círculo con ícono de persona
                            ========================================== */}
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'var(--primary-color)' }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        
                        {/* ==========================================
                            INFORMACIÓN DEL USUARIO
                            Nombre, rol y fecha de última calificación
                            ========================================== */}
                        <ListItemText
                          // Nombre del usuario (texto principal)
                          primary={reviewer.name}
                          // Información secundaria (rol y fecha)
                          secondary={
                            <React.Fragment>
                              {/* Rol del usuario traducido al español */}
                              <Typography 
                                component="span"      // Renderiza como span (inline)
                                variant="caption"     // Texto pequeño
                                display="block"       // Fuerza display block para nueva línea
                              >
                                {roleLabels[reviewer.role]}
                              </Typography>
                              
                              {/* Fecha de última calificación (si existe) */}
                              {reviewer.lastReviewDate && (
                                <Typography 
                                  component="span" 
                                  variant="caption" 
                                  color="text.secondary"
                                >
                                  Última calificación: {
                                    // Formatea la fecha a formato local (dd/mm/yyyy)
                                    new Date(reviewer.lastReviewDate).toLocaleDateString()
                                  }
                                </Typography>
                              )}
                            </React.Fragment>
                          }
                        />
                      </ListItemButton>
                    ))
                  )}
                </List>

                {/* ==========================================
                    CONTADOR DE USUARIOS
                    Muestra el total de usuarios filtrados
                    ========================================== */}
                <Typography 
                  variant="caption"           // Texto muy pequeño
                  color="text.secondary"      // Color gris
                  sx={{ 
                    mt: 2,                    // Margen superior
                    display: 'block'          // Display block para ocupar línea completa
                  }}
                >
                  Total: {filteredReviewers.length} {
                    // Pluralización: "usuario" o "usuarios"
                    filteredReviewers.length === 1 ? 'usuario' : 'usuarios'
                  }
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
        {/* Fin del layout principal con flexbox */}
        
      </Container>
    </Box>
  );
};

// ==========================================
// EXPORTACIÓN DEL COMPONENTE
// ==========================================

export default CompanyProfile;
