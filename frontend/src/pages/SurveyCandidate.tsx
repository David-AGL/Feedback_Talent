import { useForm, Controller } from "react-hook-form";
import { Button, TextField, Typography, Box, Paper, Rating, Slider, Alert, Container, Divider, LinearProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface SurveyForm {
  [key: string]: number | string;
}

const SurveyCandidate = () => {
  const { handleSubmit, control, register, formState: { errors } } = useForm<SurveyForm>();
  const navigate = useNavigate();
  const { role, token } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Traducir rol al español
  const roleLabels: { [key: string]: string } = {
    employee: "Empleado",
    candidate: "Candidato",
    company: "Empresa"
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:4000/api/preguntas/candidate");
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
  }, []);

  // Calcular progreso basado en campos completados
  useEffect(() => {
    const formValues = control._formValues || {};
    const totalFields = questions.length;
    const completedFields = Object.keys(formValues).filter(
      key => formValues[key] !== null && formValues[key] !== "" && formValues[key] !== 0
    ).length;
    setProgress(totalFields > 0 ? (completedFields / totalFields) * 100 : 0);
  }, [control._formValues, questions]);

  const onSubmit = async (data: SurveyForm) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        token,
        rol: role,
        respuestas: data,
      };
      const response = await fetch("http://localhost:4000/api/respuestas/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Error al enviar");
      console.log("Respuestas enviadas", result);
      navigate("/home");
    } catch (err: any) {
      setError(err.message || "Error al enviar encuesta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A66C2 0%, #00D9B1 100%)',
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
                background: 'linear-gradient(135deg, #0A66C2 0%, #00D9B1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Feedback Talent
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              Llena la encuesta para {roleLabels[role || 'candidate']}
            </Typography>
            <Divider sx={{ my: 3 }} />
          </Box>

          {/* Barra de progreso */}
          {questions.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progreso de la encuesta
                </Typography>
                <Typography variant="body2" sx={{ color: '#0A66C2', fontWeight: 'bold' }}>
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(0, 217, 177, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #0A66C2 0%, #00D9B1 100%)',
                  }
                }}
              />
            </Box>
          )}

          {/* Alerta de error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
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
                      borderColor: errors[q._id.toString()] ? 'error.main' : 'rgba(0, 217, 177, 0.2)',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#00D9B1',
                        boxShadow: '0 4px 20px rgba(0, 217, 177, 0.15)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          minWidth: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0A66C2 0%, #00D9B1 100%)',
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
                                  color: '#00D9B1',
                                },
                                '& .MuiRating-iconHover': {
                                  color: '#0A66C2',
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
                                  background: 'linear-gradient(135deg, #0A66C2 0%, #00D9B1 100%)',
                                },
                                '& .MuiSlider-track': {
                                  background: 'linear-gradient(90deg, #0A66C2 0%, #00D9B1 100%)',
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
                              borderColor: '#00D9B1',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#0A66C2',
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
                    background: 'linear-gradient(135deg, #0A66C2 0%, #00D9B1 100%)',
                    boxShadow: '0 4px 15px rgba(0, 217, 177, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00D9B1 0%, #0A66C2 100%)',
                      boxShadow: '0 6px 20px rgba(0, 217, 177, 0.6)',
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
        </Paper>
      </Container>
    </Box>
  );
};

export default SurveyCandidate;