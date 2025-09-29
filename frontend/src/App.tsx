import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Survey from "./pages/Survey.tsx";
import Dashboard from "./pages/Dashboard.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/survey" element={<Survey />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
