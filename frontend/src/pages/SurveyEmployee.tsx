import { useForm, Controller } from "react-hook-form";
import { Button, TextField, Typography, Box, Paper, Rating, Slider, Alert, Container, Divider, LinearProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import CompanySearchBar from "../components/companySearchBar";
import Swal from "sweetalert2";

interface SurveyForm {
  [key: string]: number | string;
}

// ← AGREGAR INTERFAZ
interface Company {
  _id: string;
  name: string;
  email: string;
  idNumber: string;
  description?: string;
}

const SurveyEmployee = () => {
  const { handleSubmit, control, register, formState: { errors } } = useForm<SurveyForm>();
  const navigate = useNavigate();
  const { role, token } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [evaluatedCompanies, setEvaluatedCompanies] = useState<string[]>([]);

  const roleLabels: { [key: string]: string } = {
    employee: "Empleado",
    candidate: "Candidato",
    company: "Empresa"
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:4000/api/preguntas/employee");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Datos inválidos de preguntas");
        setQuestions(data);
      } catch (err: any) {
        setError("Error cargando preguntas: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
    fetchEvaluatedCompanies();
  }, []);

  const fetchEvaluatedCompanies = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/feedback-history/my-feedbacks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const companyIds = data.data.map((item: any) => item.companyUserId);
        setEvaluatedCompanies([...new Set<string>(companyIds)]);
      }
    } catch (err) {
      console.error("Error fetching evaluated companies:", err);
    }
  };

  useEffect(() => {
    const formValues = control._formValues || {};
    const totalFields = questions.length;
    const completedFields = Object.keys(formValues).filter(
      key => formValues[key] !== null && formValues[key] !== "" && formValues[key] !== 0
    ).length;
    setProgress(totalFields > 0 ? (completedFields / totalFields) * 100 : 0);
  }, [control._formValues, questions]);

  const onSubmit = async (data: SurveyForm) => {
    // ← VALIDAR QUE HAY EMPRESA SELECCIONADA
    if (!selectedCompany) {
      setError("Por favor selecciona una empresa para calificar");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        token,
        companyUserId: selectedCompany._id, // ← USAR selectedCompany
        respuestas: data,
      };
      const response = await fetch("http://localhost:4000/api/responses/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error al enviar");
      console.log("Respuestas enviadas", result);

      // Mostrar popup de confirmación de envío de feedback
      Swal.fire({
        icon: "success",
        title: "¡Feedback enviado!",
        text: "Tu opinión fue registrada exitosamente 😊",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#ffffff',
        color: '#667eea', // tono morado coherente con el diseño del empleado
      });

// Espera a que se cierre el popup y redirige al home
setTimeout(() => {
  navigate("/");
}, 2000);

    } catch (err: any) {
      setError(err.message || "Error al enviar encuesta");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'var(--background-light)',
        py: 6,
        px: 2
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Encabezado */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: 'var(--primary-color)',
                mb: 1
              }}
            >
              Feedback Talent
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Llena la encuesta para {roleLabels[role || 'employee']}
            </Typography>
            <Divider sx={{ my: 3 }} />
          </Box>

          {/* ← AGREGAR BARRA DE BÚSQUEDA */}
          <Box sx={{ mb: 4 }}>
            <CompanySearchBar
              onCompanySelect={setSelectedCompany}
              selectedCompany={selectedCompany}
              evaluatedCompanies={evaluatedCompanies}
            />
            {selectedCompany && (
              <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                Vas a calificar a: <strong>{selectedCompany.name}</strong>
              </Alert>
            )}
          </Box>

          {/* Alerta de error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Barra de progreso - Solo mostrar si hay empresa seleccionada */}
          {questions.length > 0 && selectedCompany && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progreso de la encuesta
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'var(--accent-color)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
                  }
                }}
              />
            </Box>
          )}

          {/* Formulario - Solo mostrar si hay empresa seleccionada */}
          {selectedCompany ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              {loading && questions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    Cargando preguntas...
                  </Typography>
                </Box>
              ) : questions.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {questions.map((q, index) => (
                    <Paper
                      key={q._id}
                      elevation={0}
                      sx={{
                        p: 3,
                        border: '2px solid',
                        borderColor: errors[q._id.toString()] ? 'error.main' : 'var(--accent-color)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'var(--secondary-color)',
                          boxShadow: `0 4px 20px var(--accent-color)`,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box
              sx={{
                minWidth: { xs: 32, sm: 40 },
                height: 40,
                            borderRadius: '50%',
                            background: 'var(--primary-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {q.contenido}
                          </Typography>
                          {q.obligatoria && (
                            <Typography variant="caption" color="error">
                              * Obligatoria
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Rating */}
                      {q.tipo === "rating" && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                          <Controller
                            name={q._id.toString()}
                            control={control}
                            rules={{ required: q.obligatoria ? "Esta pregunta es obligatoria" : false }}
                            defaultValue={0}
                            render={({ field: { onChange, value } }) => (
                              <Rating
                                value={Number(value)}
                                onChange={(e, newValue) => onChange(newValue)}
                                precision={0.5}
                                size="large"
                                sx={{
                                  '& .MuiRating-iconFilled': {
                                    color: 'var(--secondary-color)',
                                  },
                                  '& .MuiRating-iconHover': {
                                    color: 'var(--primary-color)',
                                  }
                                }}
                              />
                            )}
                          />
                        </Box>
                      )}

                      {/* Slider */}
                      {q.tipo === "slider" && (
                        <Box sx={{ px: 2, mt: 3 }}>
                          <Controller
                            name={q._id.toString()}
                            control={control}
                            rules={{ required: q.obligatoria ? "Esta pregunta es obligatoria" : false }}
                            defaultValue={5}
                            render={({ field: { onChange, value } }) => (
                              <Slider
                                value={Number(value)}
                                onChange={(e, newValue) => onChange(newValue as number)}
                                min={1}
                                max={10}
                                step={1}
                                marks
                                valueLabelDisplay="on"
                                sx={{
                                  '& .MuiSlider-thumb': {
                                    background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
                                  },
                                  '& .MuiSlider-track': {
                                    background: `linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
                                  },
                                  '& .MuiSlider-rail': {
                                    opacity: 0.3,
                                  }
                                }}
                              />
                            )}
                          />
                        </Box>
                      )}

                      {/* Text */}
                      {q.tipo === "text" && (
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          placeholder="Escribe tu respuesta aquí..."
                          {...register(q._id.toString(), { 
                            required: q.obligatoria ? "Esta pregunta es obligatoria" : false 
                          })}
                          error={!!errors[q._id.toString()]}
                          helperText={errors[q._id.toString()]?.message}
                          sx={{
                            mt: 2,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: 'var(--secondary-color)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'var(--primary-color)',
                              }
                            }
                          }}
                        />
                      )}
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No hay preguntas disponibles en este momento.
                  </Typography>
                </Box>
              )}

              {/* Botón de envío */}
              {questions.length > 0 && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      px: 6,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      background: 'var(--primary-color)',
                      boxShadow: `0 4px 15px var(--accent-color)`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'var(--primary-hover)',
                        boxShadow: `0 6px 20px var(--accent-color)`,
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                      }
                    }}
                  >
                    {loading ? "Enviando..." : "Enviar Encuesta"}
                  </Button>
                </Box>
              )}
            </form>
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

export default SurveyEmployee;
