import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  idNumber: string;
  createdAt: string;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/users/profile/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Error al cargar el perfil del usuario');
        }
        setUserData(data);
        setFormData({
          name: data.name,
          email: data.email,
          role: data.role,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchUserData();
    }
  }, [userId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`http://localhost:4000/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el perfil');
      }
      setUserData(data);
      setSuccess('Perfil actualizado con éxito');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !userData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Usuario no encontrado</Alert>
      </Container>
    );
  }

  const canEdit = user?._id === userId || user?.role === 'company';

  return (
    <>
      <Helmet>
        <title>{`Perfil de ${userData.name} - Feedback Talent`}</title>
        <meta name="description" content={`Explora el perfil de ${userData.name} en Feedback Talent.`} />
      </Helmet>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 6 }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar sx={{ width: 100, height: 100, bgcolor: 'var(--primary-color)' }}>
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {userData.name}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {userData.role}
              </Typography>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleFormSubmit}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
                <TextField
                  label="Nombre"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  disabled={!isEditing}
                />
              </Box>
              <Box sx={{ width: '100%' }}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    label="Rol"
                    onChange={handleChange}
                  >
                    <MenuItem value="candidate">Candidato</MenuItem>
                    <MenuItem value="employee">Empleado</MenuItem>
                    <MenuItem value="company">Empresa</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {canEdit && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {isEditing ? (
                  <>
                    <Button variant="outlined" onClick={() => {
                      setIsEditing(false);
                      if (userData) {
                        setFormData({
                          name: userData.name,
                          email: userData.email,
                          role: userData.role,
                        });
                      }
                    }}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained"
                      sx={{
                        backgroundColor: 'var(--primary-color)',
                        '&:hover': { backgroundColor: 'var(--primary-hover)' }
                      }}
                    >
                      Guardar Cambios
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="contained" 
                    onClick={() => setIsEditing(true)}
                    sx={{
                      backgroundColor: 'var(--primary-color)',
                      '&:hover': { backgroundColor: 'var(--primary-hover)' }
                    }}
                  >
                    Editar Perfil
                  </Button>
                )}
              </Box>
            )}
          </form>
        </Paper>
        </Container>
      </Box>
    </>
  );
};

export default UserProfile;
