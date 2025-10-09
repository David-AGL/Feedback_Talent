import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login.tsx";
import SurveyEmployee from "./pages/SurveyEmployee.tsx";
import SurveyCandidate from "./pages/SurveyCandidate.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Register from "./pages/Register.tsx";
import Home from "./pages/Home.tsx"; 
import RecoverPassword from "./pages/RecoverPassword.tsx";
import Profile from "./pages/Profile.tsx";
import Navbar from "./components/navbar.tsx";
import Footer from "./components/footer.tsx";

// Componente para envolver el contenido con Footer condicional
const AppContent: React.FC = () => {
  const location = useLocation();

  // No mostrar Footer en /login y /auth/recover
  const showNavbarAndFooter =
  location.pathname !== '/login' && location.pathname !== '/auth/recover';


  return (
    <div>
      {showNavbarAndFooter && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/recover" element={<RecoverPassword />} />
          <Route path="/surveyemployee" element={<SurveyEmployee />} />
          <Route path="/surveycandidate" element={<SurveyCandidate />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      {showNavbarAndFooter && <Footer />} {/* Renderiza Footer solo si no estamos en /login */}
    </div>
  );
};

function App() {
  return <AppContent />;
}

export default App;
