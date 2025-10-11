import React, { useState, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  CircularProgress,
  Avatar,
  Paper
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';

interface Company {
  _id: string;
  name: string;
  email: string;
  idNumber: string;
  description?: string;
}

interface CompanySearchBarProps {
  onCompanySelect: (company: Company | null) => void;
  selectedCompany: Company | null;
}

const CompanySearchBar: React.FC<CompanySearchBarProps> = ({ 
  onCompanySelect, 
  selectedCompany 
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }

    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:4000/api/auth/companies/search?q=${encodeURIComponent(inputValue)}`
        );
        const data = await response.json();
        setOptions(data);
      } catch (error) {
        console.error('Error buscando empresas:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  return (
    <Autocomplete
      fullWidth
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={selectedCompany}
      onChange={(event, newValue) => {
        onCompanySelect(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={options}
      loading={loading}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Buscar empresa a calificar"
          placeholder="Escribe el nombre de la empresa..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 1.5 }}>
          <Avatar
            sx={{
              width: 50,
              height: 50,
              bgcolor: 'primary.main',
            }}
          >
            <BusinessIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" fontWeight={600}>
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {option.idNumber}
            </Typography>
            {option.description && (
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                {option.description}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      noOptionsText={
        inputValue.length < 2
          ? "Escribe al menos 2 caracteres para buscar"
          : "No se encontraron empresas"
      }
      PaperComponent={(props) => (
        <Paper {...props} sx={{ mt: 1, boxShadow: 3 }} />
      )}
    />
  );
};

export default CompanySearchBar;