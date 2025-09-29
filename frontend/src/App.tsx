import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.tsx";
import SurveyEmploye from "./pages/SurveyEmploye.tsx";
import SurveyCandidate from "./pages/SurveyCandidate.tsx";
import Dashboard from "./pages/Dashboard.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/surveyemploye" element={<SurveyEmploye />} />
      <Route path="/surveycandidate" element={<SurveyCandidate />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
