import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';  // Para reset de estilos
import App from "./App.tsx";
import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';


// Tema inspirado en magneto
const theme = createTheme({
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, color: '#212529' },
    h4: { fontSize: '1.75rem', fontWeight: 700, color: '#212529' },
    body1: { fontSize: '1rem', lineHeight: 1.5, color: '#333333' },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, color: '#666666' },
  },
  palette: {
    primary: { main: '#0A66C2' }, // Azul Magneto
    secondary: { main: '#6C757D' },
    background: { default: '#F8F9FA', paper: '#FFFFFF' },
    text: { primary: '#212529', secondary: '#6C757D' },
    error: { main: '#DC3545' },
    success: { main: '#28A745' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '12px 24px',
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '16px',
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '24px',
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
      },
    },
  },
  spacing: 2,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />  {/* Reset de estilos */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);