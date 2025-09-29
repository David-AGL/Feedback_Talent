import { useForm, Controller } from "react-hook-form";  // Para manejar formularios y validaciones
import { Button, TextField, Typography, Box, Rating, Paper } from "@mui/material";  // UI con Material-UI
import { submitSurvey } from "../services/api";  // Servicio que envía los datos
import { useNavigate } from "react-router-dom";  // Para redirigir después de enviar

// Interfaz del formulario de encuesta
interface SurveyForm {
  processRating: number;
  comments: string;
}

const Survey = () => {
  // Inicializa react-hook-form
  const { handleSubmit, control, register, formState: { errors } } = useForm<SurveyForm>();
  const navigate = useNavigate();

  // 🔹 Aquí defines el array de preguntas de calificación
  const ratingQuestions = [
    { name: "processRating", label: "Califica el proceso de selección (1-5)" },
    { name: "communicationRating", label: "Califica la comunicación con el equipo (1-5)" },
    { name: "transparencyRating", label: "Califica la transparencia en el proceso (1-5)" }
  ];

  // Función que se ejecuta al enviar la encuesta
  const onSubmit = async (data: SurveyForm) => {
    try {
      const response = await submitSurvey(data);  // Llama al servicio
      console.log("Encuesta enviada", response.data);
      navigate("/dashboard");  // Redirige tras enviar
    } catch (error) {
      console.error("Error en encuesta", error);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',                // Flexbox para centrar
        justifyContent: 'center',       // Centrado horizontal
        alignItems: 'center',           // Centrado vertical
        minHeight: '100vh',             // Altura mínima: pantalla completa
        width: '100vw',                 // Ancho completo
        backgroundColor: 'background.default',  // Usa color del tema
        p: 2                            // Padding
      }} 
    >
      <Paper
        elevation={3}  // Sombra
        sx={{
          p: 4,                  // Padding interno
          width: '100%',         // Ocupa todo el ancho disponible
          maxWidth: 500,         // Máximo ancho
          display: 'flex',       // Flexbox
          flexDirection: 'column',
          alignItems: 'center'   // Centra los elementos dentro de la tarjeta
        }}
      >
        {/* Título */}
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
        >
          Encuesta de Proceso de Selección
        </Typography>

        {/* Formulario */}
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center'  // Centra los elementos del form
          }}
        >
          {/* Recorremos las preguntas de calificación dinámicamente */}
          {ratingQuestions.map((question) => (
            <Box key={question.name} sx={{ textAlign: "center", my: 2 }}>
              <Typography align="center">{question.label}</Typography>

              <Controller
                name={question.name as keyof SurveyForm}
                control={control}
                rules={{ required: true, min: 1, max: 5 }}
                defaultValue={0}
                render={({ field: { onChange, value } }) => (
                  <Rating
                    name={question.name}
                    precision={0.5}
                    value={Number(value)}
                    onChange={(event, newValue) => onChange(newValue)}
                    sx={{ mb: 2 }}   // Espaciado inferior
                  />
                )}
              />
              {errors[question.name as keyof SurveyForm] && ( 
                <Typography color="error" align="center">
                  Calificación requerida
                </Typography>
              )}
            </Box>
          ))}

          {/* Pregunta de comentarios */}
          <TextField 
            label="Comentarios"
            multiline 
            rows={4} 
            fullWidth 
            {...register("comments")} 
            sx={{ my: 2 }} 
          />

          {/* Botón enviar */}
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ width: "50%" }}  //  Botón más estrecho y centrado
          >
            Enviar
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Survey;
