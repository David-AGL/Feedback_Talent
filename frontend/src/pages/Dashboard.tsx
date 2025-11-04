import { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getAllResponses,
  getRatings,
  getResponseSummary,
} from "../services/api";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const Dashboard = () => {
  const [ratings, setRatings] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await getRatings();
        setRatings(response.data);
      } catch (error) {
        console.error("Error cargando calificaciones", error);
      }
    };
    fetchRatings();

    const fetchAllData = async () => {
      try {
        const response = await getAllResponses("68e967a06eb415ff4318a333");
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Error cargando todos los datos", error);
      }
    };
    fetchAllData();
  }, []);

  const chartData = ratings.map((r, i) => ({
    name: `Feedback ${i + 1}`,
    rating: r.processRating || 0,
  }));

  // Obtener categorías únicas
  const categorias = ["Todas", ...new Set(feedbacks.map((f) => f.categoria))];

  // Filtrar por categoría y fechas
  const filteredData = useMemo(() => {
    return feedbacks.filter((f) => {
      const fecha = dayjs(f.createdAt);
      const inCategory =
        selectedCategory === "Todas" || f.categoria === selectedCategory;
      const inDateRange =
        (!startDate || fecha.isAfter(startDate.subtract(1, "day"))) &&
        (!endDate || fecha.isBefore(endDate.add(1, "day")));
      return inCategory && inDateRange;
    });
  }, [feedbacks, selectedCategory, startDate, endDate]);

  // Calcular promedios por categoría
  const data = useMemo(() => {
    const grouped: { [key: string]: { total: number; count: number } } = {};
    filteredData.forEach((f) => {
      if (!grouped[f.categoria]) grouped[f.categoria] = { total: 0, count: 0 };
      grouped[f.categoria].total += f.answer || 0;
      grouped[f.categoria].count++;
    });
    return Object.keys(grouped).map((cat) => {
      const promedio = grouped[cat].total / grouped[cat].count;
      return {
      categoria: cat,
      promedio: isNaN(promedio) ? 0 : promedio,
      cantidad: grouped[cat].count,
      };
    });
  }, [filteredData]);

  return (
    <>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Resumen de Evaluaciones
        </Typography>

        {/* 🧩 Aquí agregamos el LocalizationProvider */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* Filtros */}
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={selectedCategory}
                label="Categoría"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker
              label="Desde"
              value={startDate}
              onChange={(newValue: dayjs.Dayjs | null) => setStartDate(newValue)}
              slotProps={{ textField: { size: "small" } }}
            />

            <DatePicker
              label="Hasta"
              value={endDate}
              onChange={(newValue: dayjs.Dayjs | null) => setEndDate(newValue)}
              slotProps={{ textField: { size: "small" } }}
            />
          </Box>

          {/* Gráfico */}
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
            >
              <XAxis
                dataKey="categoria"
                interval={0}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                padding={{ left: 10, right: 10 }}
              />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Bar dataKey="promedio" fill="var(--secondary-color)" name="Promedio" />
              <Bar dataKey="cantidad" fill="var(--primary-color)" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </LocalizationProvider>
      </Box>
    </>
  );
};

export default Dashboard;
