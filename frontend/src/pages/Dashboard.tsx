import { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { getRatings } from "../services/api";

const Dashboard = () => {
  const [ratings, setRatings] = useState<any[]>([]);

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
  }, []);

  const chartData = ratings.map((r, i) => ({ name: `Feedback ${i + 1}`, rating: r.processRating || 0 }));

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 8 }}>
      <Typography variant="h4">Dashboard de Calificaciones</Typography>
      <BarChart width={600} height={300} data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="rating" fill="#8884d8" />
      </BarChart>
    </Box>
  );
};

export default Dashboard;