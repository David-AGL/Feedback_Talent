import { useForm, Controller } from "react-hook-form";  // Agrega Controller
import { Button, TextField, Typography, Box, Rating } from "@mui/material";
import { submitSurvey } from "../services/api";
import { useNavigate } from "react-router-dom";

interface SurveyForm {
  processRating: number;
  comments: string;
}

const Survey = () => {
  const { handleSubmit, control, register, formState: { errors } } = useForm<SurveyForm>();  // Agrega control
  const navigate = useNavigate();

  const onSubmit = async (data: SurveyForm) => {
    try {
      const response = await submitSurvey(data);
      console.log("Encuesta enviada", response.data);
      navigate("/dashboard");  // Redirige tras enviar
    } catch (error) {
      console.error("Error en encuesta", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 8 }}>
      <Typography variant="h4">Encuesta de Proceso de Selección</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography>Califica el proceso (1-5):</Typography>
        <Controller
          name="processRating"
          control={control}
          rules={{ required: true, min: 1, max: 5 }}
          defaultValue={0}  // Valor inicial
          render={({ field: { onChange, value } }) => (  // Renderiza el Rating
            <Rating
              name="processRating"
              precision={0.5}
              value={Number(value)}  // Convierte a number si es necesario
              onChange={(event, newValue) => onChange(newValue)}  // Maneja cambio
            />
          )}
        />
        {errors.processRating && <Typography color="error">Calificación requerida (entre 1 y 5)</Typography>}

        <TextField label="Comentarios" multiline rows={4} fullWidth {...register("comments")} sx={{ my: 2 }} />
        <Button type="submit" variant="contained" fullWidth>Enviar</Button>
      </form>
    </Box>
  );
};

export default Survey;