import { useForm } from "react-hook-form";
import { Button, TextField, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit } = useForm<LoginForm>();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await login(data.email, data.password);
      console.log("Login exitoso", response.data);
      // Redirige a /survey o /dashboard según rol (usa useNavigate)
      navigate("/survey")
    } catch (error) {
      console.error("Error en login", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h4">Iniciar sesión</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField label="Email" fullWidth {...register("email", {required: true})} sx={{ my: 2 }} />
        <TextField label="Password" type="password" fullWidth {...register("password")} sx={ { my: 2 } } />
        <Button type="submit" variant="contained" fullWidth>Entrar</Button>
      </form>
    </Box>
  );
};

export default Login;