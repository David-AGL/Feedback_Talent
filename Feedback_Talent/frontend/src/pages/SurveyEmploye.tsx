import { useForm, Controller } from "react-hook-form";
import { Button, TextField, Typography, Box, Paper, Rating, Slider, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface SurveyForm {
  [key: string]: number | string;
}

const SurveyCandidate = () => {
  const { handleSubmit, control, register, formState: { errors } } = useForm<SurveyForm>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:4000/api/preguntas/candidate");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Datos inválidos de preguntas");
        setQuestions(data);
      } catch (err: any) {
        setError("Error cargando preguntas de candidatos: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const onSubmit = async (data: SurveyForm) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        idUsuario: userId,
        rol: "candidate",
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
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al enviar encuesta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', p: 2 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600}}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
          Encuesta para Candidatos - Feedback Talent
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          {loading ? (
            <Typography align="center">Cargando preguntas...</Typography>
          ) : questions.length > 0 ? (
            questions.map((q) => (
              <Box key={q._id} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>{q.contenido}</Typography>
                {q.tipo === "rating" && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Controller
                      name={q._id.toString()} // Usa _id como nombre único
                      control={control}
                      rules={{ required: q.obligatoria ? "Requerido" : false }}
                      defaultValue={0}
                      render={({ field: { onChange, value } }) => (
                        <Rating value={Number(value)} onChange={(e, newValue) => onChange(newValue)} precision={0.5} />
                      )}
                    />
                  </Box>  
                )}
                {q.tipo === "slider" && (
                  <Controller
                    name={q._id.toString()}
                    control={control}
                    rules={{ required: q.obligatoria ? "Requerido" : false }}
                    defaultValue={5}
                    render={({ field: { onChange, value } }) => (
                      <Slider value={Number(value)} onChange={(e, newValue) => onChange(newValue as number)} min={1} max={10} step={1} marks valueLabelDisplay="auto" />
                    )}
                  />
                )}
                {q.tipo === "text" && (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    {...register(q._id.toString(), { required: q.obligatoria ? "Requerido" : false })}
                    error={!!errors[q._id.toString()]}
                    helperText={errors[q._id.toString()]?.message}
                  />
                )}
                {errors[q._id.toString()] && <Typography color="error">{errors[q._id.toString()]?.message}</Typography>}
              </Box>
            ))
          ) : (
            <Typography align="center">No hay preguntas disponibles.</Typography>
          )}
          <Button type="submit" fullWidth variant="contained" color="primary" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Encuesta"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default SurveyCandidate;